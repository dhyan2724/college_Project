import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../services/api';

const StudentDashboard = () => {
  const { user, chemicals, glasswares, plasticwares, instruments, miscellaneous, specimens = [], slides = [], pendingRequests, issuedItems, fetchData, logout } = useContext(AuthContext);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [cart, setCart] = useState([]);
  const [facultyInCharge, setFacultyInCharge] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [teacherError, setTeacherError] = useState('');
  const [purpose, setPurpose] = useState('');
  const [desiredIssueTime, setDesiredIssueTime] = useState('');
  const [desiredReturnTime, setDesiredReturnTime] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Filter minor instruments from the instruments array
  const minorinstruments = instruments.filter(instrument => 
    instrument.type && instrument.type.toLowerCase().includes('minor')
  );

  const ITEM_TYPE_MAP = {
    chemical: 'Chemical',
    glassware: 'Glassware',
    plasticware: 'Plasticware',
    instrument: 'Instrument',
    miscellaneous: 'Miscellaneous',
    specimen: 'Specimen',
    slide: 'Slide',
    minorinstrument: 'Minor Instrument',
  };

  // Helper to get filtered items by category and search
  const getFilteredItems = (items, category) => {
    // If items is undefined/null, return empty array but don't hide the section
    if (!items) return [];
    
    // Filter by search term if provided
    const filtered = searchTerm 
      ? items.filter(item => item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : items;
    
    return filtered || [];
  };

  // Check if data is still loading
  const isDataLoading = !chemicals && !glasswares && !plasticwares && !instruments && !miscellaneous && !specimens && !slides;

  // Check if there are any items in any category
  const hasAnyItems = (chemicals && chemicals.length > 0) || 
                     (glasswares && glasswares.length > 0) || 
                     (plasticwares && plasticwares.length > 0) || 
                     (instruments && instruments.length > 0) || 
                     (miscellaneous && miscellaneous.length > 0) || 
                     (specimens && specimens.length > 0) || 
                     (slides && slides.length > 0);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  // Debug: log inventory data
  useEffect(() => {
    console.log('Chemicals:', chemicals);
    console.log('Glasswares:', glasswares);
    console.log('Plasticwares:', plasticwares);
    console.log('Instruments:', instruments);
    console.log('Miscellaneous:', miscellaneous);
    console.log('Specimens:', specimens);
    console.log('Slides:', slides);
  }, [chemicals, glasswares, plasticwares, instruments, miscellaneous, specimens, slides]);

  // Error message state
  const [fetchError, setFetchError] = useState('');

  // Example: wrap fetchData to catch errors
  const safeFetchData = async () => {
    try {
      await fetchData();
      setFetchError('');
    } catch (err) {
      setFetchError('Failed to fetch inventory: ' + (err.message || err));
    }
  };

  useEffect(() => {
    if (user) {
      safeFetchData();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'student') {
      api.fetchTeachers()
        .then(data => {
          if (Array.isArray(data)) {
            setTeachers(data.filter(t => t && (t.id || t.id) && t.fullName));
            setTeacherError('');
          } else {
            setTeachers([]);
            setTeacherError('No teachers found or invalid response.');
          }
        })
        .catch(() => {
          setTeachers([]);
          setTeacherError('Failed to fetch teachers.');
        });
    }
  }, [user]);

  const userRequests = Array.isArray(pendingRequests)
    ? pendingRequests.filter(request => {
        // Support both legacy (Mongo-like) and MySQL field shapes
        const requestUserId =
          request.requestedByUserId ||
          request.requestedByUser?._id ||
          request.requestedByUser?.id ||
          request.requestedByUser;
        const userId = user?._id || user?.id;
        return requestUserId != null && userId != null && String(requestUserId) === String(userId);
      })
    : [];
  const userIssuedItems = Array.isArray(issuedItems)
    ? issuedItems.filter(item => {
        // Support both legacy (Mongo-like) and MySQL field shapes
        const issuedToUserId = item.issuedToId || item.issuedTo?._id || item.issuedTo?.id || item.issuedTo;
        const userId = user?._id || user?.id;
        return issuedToUserId != null && userId != null && String(issuedToUserId) === String(userId);
      })
    : [];

  const addToCart = (item, type) => {
    const capType = ITEM_TYPE_MAP[type] || type;
    const itemId = item._id || item.id;
    const existingItem = cart.find(cartItem => cartItem.id === itemId && cartItem.type === capType);
    if (existingItem) {
      setCart(prev => prev.map(cartItem =>
        cartItem.id === itemId && cartItem.type === capType
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart(prev => [...prev, {
        id: itemId,
        name: item.name,
        type: capType,
        quantity: 1,
        totalWeightRequested: capType === 'Chemical' ? 0 : null
      }]);
    }
  };

  const removeFromCart = (itemId, type) => {
    setCart(prev => prev.filter(item => !(item.id === itemId && item.type === type)));
  };

  const updateCartItem = (itemId, type, field, value) => {
    setCart(prev => prev.map(item =>
      item.id === itemId && item.type === type
        ? { ...item, [field]: field === 'type' ? ITEM_TYPE_MAP[value] : value }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    // Validate request data
    if (!facultyInCharge) {
      alert('Please select a faculty member.');
      return;
    }
    if (!purpose.trim()) {
      alert('Please enter a purpose.');
      return;
    }
    if (!desiredIssueTime || !desiredReturnTime) {
      alert('Please select both issue and return times.');
      return;
    }
    if (!cart.length) {
      alert('Your cart is empty.');
      return;
    }
    const requestData = {
      items: cart.map(item => ({
        itemType: item.type,
        itemId: item.id,
        quantity: item.type !== 'Instrument' ? parseFloat(item.quantity) : null,
        totalWeightRequested: item.type === 'Chemical' ? parseFloat(item.totalWeightRequested) : null,
      })),
      facultyInCharge,
      purpose,
      desiredIssueTime,
      desiredReturnTime,
      notes
    };
    console.log('Submitting request:', requestData);
    try {
      await api.createPendingRequest(requestData);
      alert('Request submitted successfully!');
      setShowRequestForm(false);
      clearCart();
      setFacultyInCharge('');
      setPurpose('');
      setDesiredIssueTime('');
      setDesiredReturnTime('');
      setNotes('');
      fetchData();
    } catch (error) {
      alert(`Failed to submit request: ${error.message}`);
    }
  };

  const getItemOptions = (type) => {
    switch (type) {
      case 'chemical':
        return chemicals;
      case 'glassware':
        return glasswares;
      case 'plasticware':
        return plasticwares;
      case 'instrument':
        return instruments;
      case 'miscellaneous':
        return miscellaneous;
      default:
        return [];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {fetchError && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
          {fetchError}
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Portal</h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.fullName} | Roll No: {user?.rollNo} | Email: {user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Items
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cart'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Requests ({userRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('issued')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'issued'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Issued Items ({userIssuedItems.length})
          </button>
        </nav>
      </div>

  {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Debug Information */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Debug Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>Chemicals: {chemicals ? chemicals.length : 'Loading...'}</div>
              <div>Glasswares: {glasswares ? glasswares.length : 'Loading...'}</div>
              <div>Plasticwares: {plasticwares ? plasticwares.length : 'Loading...'}</div>
              <div>Instruments: {instruments ? instruments.length : 'Loading...'}</div>
              <div>Miscellaneous: {miscellaneous ? miscellaneous.length : 'Loading...'}</div>
              <div>Specimens: {specimens ? specimens.length : 'Loading...'}</div>
              <div>Slides: {slides ? slides.length : 'Loading...'}</div>
              <div>Minor Instruments: {minorinstruments ? minorinstruments.length : 'Loading...'}</div>
            </div>
          </div>

          {/* Error Message */}
          {fetchError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {fetchError}
              <button 
                onClick={safeFetchData}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isDataLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory data...</p>
            </div>
          )}

          {/* No Items Message */}
          {!isDataLoading && !hasAnyItems && !fetchError && (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No inventory items found.</p>
              <p className="text-gray-500">Please check back later or contact an administrator.</p>
            </div>
          )}

          {/* Search and Category Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 mb-2 md:mb-0 w-full md:w-1/3"
            />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/4"
            >
              <option value="All">All Categories</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Glassware">Glassware</option>
              <option value="Plasticware">Plasticware</option>
              <option value="Instruments">Instruments</option>
              <option value="Miscellaneous">Miscellaneous</option>
              <option value="Specimens">Specimens</option>
              <option value="Slides">Slides</option>
              <option value="Minor Instruments">Minor Instruments</option>
            </select>
            <button
              onClick={safeFetchData}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Inventory
            </button>
          </div>

          {/* Inventory Grids with Filters */}
          {(categoryFilter === 'All' || categoryFilter === 'Chemicals') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-800">Available Chemicals</h3>
              {!isDataLoading && getFilteredItems(chemicals, 'Chemicals').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No chemicals available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(chemicals, 'Chemicals')
                    .filter(chemical => (chemical._id !== undefined && chemical._id !== null) || (chemical.id !== undefined && chemical.id !== null))
                    .map(chemical => (
                      <div key={`chemical-${chemical._id || chemical.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{chemical.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Available: {chemical.availableWeight}gm</p>
                        <p className="text-sm text-gray-600 mb-3">Weight: {chemical.weightPerUnit}gm</p>
                        <button
                          onClick={() => addToCart(chemical, 'chemical')}
                          className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {(categoryFilter === 'All' || categoryFilter === 'Glassware') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-800">Available Glassware</h3>
              {!isDataLoading && getFilteredItems(glasswares, 'Glassware').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No glassware available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(glasswares, 'Glassware')
                    .filter(glassware => (glassware._id !== undefined && glassware._id !== null) || (glassware.id !== undefined && glassware.id !== null))
                    .map(glassware => (
                      <div key={`glassware-${glassware._id || glassware.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{glassware.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Available: {glassware.availableQuantity} units</p>
                        <button
                          onClick={() => addToCart(glassware, 'glassware')}
                          className="w-full bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {(categoryFilter === 'All' || categoryFilter === 'Plasticware') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-800">Available Plasticware</h3>
              {!isDataLoading && getFilteredItems(plasticwares, 'Plasticware').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No plasticware available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(plasticwares, 'Plasticware')
                    .filter(plasticware => (plasticware._id !== undefined && plasticware._id !== null) || (plasticware.id !== undefined && plasticware.id !== null))
                    .map(plasticware => (
                      <div key={`plasticware-${plasticware._id || plasticware.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{plasticware.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Available: {plasticware.availableQuantity} units</p>
                        <button
                          onClick={() => addToCart(plasticware, 'plasticware')}
                          className="w-full bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {(categoryFilter === 'All' || categoryFilter === 'Instruments') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-orange-800">Available Instruments</h3>
              {!isDataLoading && getFilteredItems(instruments, 'Instruments').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No instruments available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(instruments, 'Instruments')
                    .filter(instrument => (instrument._id !== undefined && instrument._id !== null) || (instrument.id !== undefined && instrument.id !== null))
                    .map(instrument => (
                      <div key={`instrument-${instrument._id || instrument.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{instrument.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Available: {instrument.availableQuantity} units</p>
                        <button
                          onClick={() => addToCart(instrument, 'instrument')}
                          className="w-full bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Inventory Tab: Add Miscellaneous section */}
          {(categoryFilter === 'All' || categoryFilter === 'Miscellaneous') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Available Miscellaneous</h3>
              {!isDataLoading && getFilteredItems(miscellaneous, 'Miscellaneous').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No miscellaneous items available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(miscellaneous, 'Miscellaneous')
                    .filter(item => (item._id !== undefined && item._id !== null) || (item.id !== undefined && item.id !== null))
                    .map(item => (
                      <div key={`miscellaneous-${item._id || item.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Available: {item.availableQuantity} units</p>
                        <p className="text-sm text-gray-600 mb-3">Description: {item.description}</p>
                        <button
                          onClick={() => addToCart(item, 'miscellaneous')}
                          className="w-full bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {(categoryFilter === 'All' || categoryFilter === 'Specimens') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-900">Available Specimens</h3>
              {!isDataLoading && getFilteredItems(specimens, 'Specimens').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No specimens available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(specimens, 'Specimens')
                    .filter(specimen => (specimen._id !== undefined && specimen._id !== null) || (specimen.id !== undefined && specimen.id !== null))
                    .map(specimen => (
                      <div key={`specimen-${specimen._id || specimen.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{specimen.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Type: {specimen.type}</p>
                        <p className="text-sm text-gray-600 mb-2">Available: {specimen.availableQuantity} units</p>
                        <button
                          onClick={() => addToCart(specimen, 'specimen')}
                          className="w-full bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {(categoryFilter === 'All' || categoryFilter === 'Slides') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-cyan-900">Available Slides</h3>
              {!isDataLoading && getFilteredItems(slides, 'Slides').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No slides available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(slides, 'Slides')
                    .filter(slide => (slide._id !== undefined && slide._id !== null) || (slide.id !== undefined && slide.id !== null))
                    .map(slide => (
                      <div key={`slide-${slide._id || slide.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{slide.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Available: {slide.availableQuantity} units</p>
                        <button
                          onClick={() => addToCart(slide, 'slide')}
                          className="w-full bg-cyan-700 text-white px-3 py-2 rounded hover:bg-cyan-800 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {(categoryFilter === 'All' || categoryFilter === 'Minor Instruments') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-fuchsia-900">Available Minor Instruments</h3>
              {!isDataLoading && getFilteredItems(minorinstruments, 'Minor Instruments').length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No minor instruments available at the moment.</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredItems(minorinstruments, 'Minor Instruments')
                    .filter(minor => (minor._id !== undefined && minor._id !== null) || (minor.id !== undefined && minor.id !== null))
                    .map(minor => (
                      <div key={`minorinstrument-${minor._id || minor.id}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-800">{minor.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">Type: {minor.type}</p>
                        <p className="text-sm text-gray-600 mb-2">Available: {minor.availableQuantity} units</p>
                        <button
                          onClick={() => addToCart(minor, 'minorinstrument')}
                          className="w-full bg-fuchsia-700 text-white px-3 py-2 rounded hover:bg-fuchsia-800 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cart' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Shopping Cart</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRequestForm(true)}
                disabled={cart.length === 0}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit Request ({cart.length} items)
              </button>
              <button
                onClick={clearCart}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Cart
              </button>
            </div>
          </div>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Your cart is empty. Add items from the inventory to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (gm)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cart.map((item, index) => (
                    <tr key={`cart-${item.id}-${item.type}`}> 
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {item.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type === 'Chemical' ? (
                          <span>-</span>
                        ) : item.type !== 'Instrument' ? (
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item.id, item.type, 'quantity', e.target.value)}
                            className="w-20 border border-gray-300 rounded px-2 py-1"
                          />
                        ) : (
                          <span>1</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type === 'Chemical' ? (
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.totalWeightRequested || ''}
                            onChange={(e) => updateCartItem(item.id, item.type, 'totalWeightRequested', e.target.value)}
                            className="w-24 border border-gray-300 rounded px-2 py-1"
                            placeholder="Weight"
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => removeFromCart(item.id, item.type)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Requests</h3>
          {userRequests.length > 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userRequests.map(request => (
                    <tr key={`request-${request.id}`}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {request.items.map((item, idx) => {
                            const itemData = getItemOptions(item.itemType.toLowerCase()).find(i => i.id === item.itemId);
                            // Use a composite key for uniqueness
                            return (
                              <div key={`requestitem-${item.itemId}-${idx}`} className="text-xs">
                                {itemData?.name || 'Unknown'} 
                                {item.quantity && ` (${item.quantity})`}
                                {item.totalWeightRequested && ` - ${item.totalWeightRequested}g`}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(() => {
                          const facultyId = request.facultyInChargeId || request.facultyInCharge;
                          const faculty = teachers.find(t => (t.id || t._id) === facultyId);
                          return faculty?.fullName || 'Unknown';
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {request.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.desiredIssueTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.desiredReturnTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No requests</p>
          )}
        </div>
      )}

      {activeTab === 'issued' && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Issued Items</h3>
          {userIssuedItems.length > 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userIssuedItems.map(item => (
                    <tr key={`issued-${item._id || item.id}`}> 
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getItemOptions(item.itemType.toLowerCase()).find(i => (i._id || i.id) === (item.itemId || item._id || item.id))?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {item.itemType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'Not returned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No issued items</p>
          )}
        </div>
      )}

      {showRequestForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Request</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-800">{user?.fullName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Roll No:</span>
                    <span className="ml-2 text-gray-800">{user?.rollNo}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">College Email:</span>
                    <span className="ml-2 text-gray-800">{user?.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Role:</span>
                    <span className="ml-2 text-gray-800 capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Faculty</label>
                  <select 
                    value={facultyInCharge} 
                    onChange={e => setFacultyInCharge(e.target.value)} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    required
                  >
                    <option value="">Select a faculty member</option>
                    {teachers.length === 0 && (
                      <option value="" disabled>No faculty available</option>
                    )}
                    {teachers.map(t => (
                      <option key={`teacher-${t.id || t.id || t.username}`} value={t.id || t.id}>
                        {t.fullName} ({t.username})
                      </option>
                    ))}
                  </select>
                  {teacherError && <p className="text-red-500 text-xs mt-1">{teacherError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <textarea 
                    value={purpose} 
                    onChange={e => setPurpose(e.target.value)} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    required 
                    rows="3"
                    placeholder="Describe the purpose of your request..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Desired Issue Time</label>
                    <input 
                      type="datetime-local" 
                      value={desiredIssueTime} 
                      onChange={e => setDesiredIssueTime(e.target.value)} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Desired Return Time</label>
                    <input 
                      type="datetime-local" 
                      value={desiredReturnTime} 
                      onChange={e => setDesiredReturnTime(e.target.value)} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                    rows="2"
                    placeholder="Any additional information..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowRequestForm(false)} 
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard; 