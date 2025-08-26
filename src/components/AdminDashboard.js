import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../services/api';
import AIFaqPage from './AIFaqPage';
import InventorySection from "./InventorySection";

const AdminDashboard = ({ miscellaneous = [], setMiscellaneous, specimens = [], slides = [] }) => {
  const { chemicals, glasswares, plasticwares, instruments, users, setUsers, fetchData, API_URL, logout } = useContext(AuthContext);
  const [showCreateTeacherForm, setShowCreateTeacherForm] = useState(false);
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherFullName, setNewTeacherFullName] = useState('');

  const [showAddChemicalForm, setShowAddChemicalForm] = useState(false);
  const [newChemicalName, setNewChemicalName] = useState('');
  const [newChemicalType, setNewChemicalType] = useState('Solid');
  const [newChemicalStoragePlace, setNewChemicalStoragePlace] = useState('Cupboard');
  const [newChemicalTotalWeight, setNewChemicalTotalWeight] = useState('');
  const [newChemicalCompany, setNewChemicalCompany] = useState('');
  const [newChemicalCatalogNumber, setNewChemicalCatalogNumber] = useState("");

  const [showAddGlasswareForm, setShowAddGlasswareForm] = useState(false);
  const [newGlasswareName, setNewGlasswareName] = useState('');
  const [newGlasswareType, setNewGlasswareType] = useState('');
  const [newGlasswareStoragePlace, setNewGlasswareStoragePlace] = useState('');
  const [newGlasswareTotalQuantity, setNewGlasswareTotalQuantity] = useState('');
  const [newGlasswareCompany, setNewGlasswareCompany] = useState('');
  // removed catalog number for glassware

  const [showAddInstrumentForm, setShowAddInstrumentForm] = useState(false);
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [newInstrumentType, setNewInstrumentType] = useState('');
  const [newInstrumentStoragePlace, setNewInstrumentStoragePlace] = useState('');
  const [newInstrumentTotalQuantity, setNewInstrumentTotalQuantity] = useState('');
  const [newInstrumentCompany, setNewInstrumentCompany] = useState('');
  // removed catalog number for instruments

  const [showAddPlasticwareForm, setShowAddPlasticwareForm] = useState(false);
  const [newPlasticwareName, setNewPlasticwareName] = useState('');
  const [newPlasticwareType, setNewPlasticwareType] = useState('');
  const [newPlasticwareStoragePlace, setNewPlasticwareStoragePlace] = useState('');
  const [newPlasticwareTotalQuantity, setNewPlasticwareTotalQuantity] = useState('');
  const [newPlasticwareCompany, setNewPlasticwareCompany] = useState('');
  // removed catalog number for plasticware

  const [showAddMiscForm, setShowAddMiscForm] = useState(false);
  const [newMiscName, setNewMiscName] = useState('');
  const [newMiscType, setNewMiscType] = useState('');
  const [newMiscDescription, setNewMiscDescription] = useState('');
  const [newMiscStoragePlace, setNewMiscStoragePlace] = useState('');
  const [newMiscTotalQuantity, setNewMiscTotalQuantity] = useState('');
  const [newMiscCompany, setNewMiscCompany] = useState('');
  // removed catalog number for miscellaneous

  // New: toggles for Specimens and Slides (UI buttons and placeholders)
  const [showAddSpecimenForm, setShowAddSpecimenForm] = useState(false);
  const [showAddSlideForm, setShowAddSlideForm] = useState(false);

  // New: state for Specimens form
  const [newSpecimenName, setNewSpecimenName] = useState('');
  const [newSpecimenType, setNewSpecimenType] = useState('');
  const [newSpecimenDescription, setNewSpecimenDescription] = useState('');
  const [newSpecimenStoragePlace, setNewSpecimenStoragePlace] = useState('');
  const [newSpecimenTotalQuantity, setNewSpecimenTotalQuantity] = useState('');
  const [newSpecimenCompany, setNewSpecimenCompany] = useState('');
  // removed catalog number for specimens

  // New: state for Slides form
  const [newSlideName, setNewSlideName] = useState('');
  const [newSlideDescription, setNewSlideDescription] = useState('');
  const [newSlideStoragePlace, setNewSlideStoragePlace] = useState('');
  const [newSlideTotalQuantity, setNewSlideTotalQuantity] = useState('');
  const [newSlideCompany, setNewSlideCompany] = useState('');
  // removed catalog number for slides

  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activityError, setActivityError] = useState(null);

  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserRollNo, setNewUserRollNo] = useState('');
  const [newUserCategory, setNewUserCategory] = useState('UG/PG');
  const [newUserYear, setNewUserYear] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('');

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5000); // 5 seconds default
  const [showSettings, setShowSettings] = useState(false);

  const navigate = useNavigate();

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newTeacherUsername,
          password: newTeacherPassword,
          role: 'faculty',
          email: newTeacherEmail,
          fullName: newTeacherFullName
        }),
      });

      if (response.ok) {
        alert('Teacher account created successfully!');
        setShowCreateTeacherForm(false);
        setNewTeacherUsername('');
        setNewTeacherPassword('');
        setNewTeacherEmail('');
        setNewTeacherFullName('');
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to create teacher account: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating teacher account:', error);
      alert('An error occurred while creating the teacher account.');
    }
  };

  const handleAddChemical = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chemicals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newChemicalName,
          type: newChemicalType,
          storagePlace: newChemicalStoragePlace,
          totalWeight: parseFloat(newChemicalTotalWeight),
          company: newChemicalCompany,
          catalogNumber: newChemicalCatalogNumber,
        }),
      });

      if (response.ok) {
        alert('Chemical added successfully!');
        setShowAddChemicalForm(false);
        setNewChemicalName('');
        setNewChemicalType('Solid');
        setNewChemicalStoragePlace('Cupboard');
        setNewChemicalTotalWeight('');
        setNewChemicalCompany('');
        setNewChemicalCatalogNumber('');
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        alert(`Failed to add chemical: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding chemical:', error);
      alert('An error occurred while adding the chemical.');
    }
  };

  const handleAddGlassware = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/glasswares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newGlasswareName,
          type: newGlasswareType,
          storagePlace: newGlasswareStoragePlace,
          totalQuantity: parseFloat(newGlasswareTotalQuantity),
          company: newGlasswareCompany,
        }),
      });

      if (response.ok) {
        alert('Glassware added successfully!');
        setShowAddGlasswareForm(false);
        setNewGlasswareName('');
        setNewGlasswareType('');
        setNewGlasswareStoragePlace('');
        setNewGlasswareTotalQuantity('');
        setNewGlasswareCompany('');
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to add glassware: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding glassware:', error);
      alert('An error occurred while adding the glassware.');
    }
  };

  const handleAddInstrument = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/instruments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newInstrumentName,
          type: newInstrumentType,
          storagePlace: newInstrumentStoragePlace,
          totalQuantity: parseFloat(newInstrumentTotalQuantity),
          company: newInstrumentCompany,
        }),
      });

      if (response.ok) {
        alert('Instrument added successfully!');
        setShowAddInstrumentForm(false);
        setNewInstrumentName('');
        setNewInstrumentType('');
        setNewInstrumentStoragePlace('');
        setNewInstrumentTotalQuantity('');
        setNewInstrumentCompany('');
        fetchData();
      } else {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        alert(`Failed to add instrument: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding instrument:', error);
      alert('An error occurred while adding the instrument.');
    }
  };

  const handleAddPlasticware = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/plasticwares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPlasticwareName,
          type: newPlasticwareType,
          storagePlace: newPlasticwareStoragePlace,
          totalQuantity: parseFloat(newPlasticwareTotalQuantity),
          company: newPlasticwareCompany,
        }),
      });
      if (response.ok) {
        // Show success notification
        setNotification({
          type: 'success',
          message: 'Plasticware added successfully!',
          title: 'Success'
        });
        
        setShowAddPlasticwareForm(false);
        setNewPlasticwareName('');
        setNewPlasticwareType('');
        setNewPlasticwareStoragePlace('');
        setNewPlasticwareTotalQuantity('');
        setNewPlasticwareCompany('');
        fetchData();
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: `Failed to add plasticware: ${errorData.message}`,
          title: 'Error'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'An error occurred while adding the plasticware.',
        title: 'Error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleAddMiscellaneous = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/miscellaneous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newMiscName,
          type: newMiscType,
          description: newMiscDescription,
          storagePlace: newMiscStoragePlace,
          totalQuantity: parseFloat(newMiscTotalQuantity),
          company: newMiscCompany,
        }),
      });
      if (response.ok) {
        alert('Miscellaneous item added successfully!');
        setShowAddMiscForm(false);
        setNewMiscName('');
        setNewMiscType('');
        setNewMiscDescription('');
        setNewMiscStoragePlace('');
        setNewMiscTotalQuantity('');
        setNewMiscCompany('');
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to add miscellaneous item: ${errorData.message}`);
      }
    } catch (error) {
      alert('An error occurred while adding the miscellaneous item.');
    }
  };

  const handleAddSpecimen = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createSpecimen({
        name: newSpecimenName,
        type: newSpecimenType,
        description: newSpecimenDescription,
        storagePlace: newSpecimenStoragePlace,
        totalQuantity: parseFloat(newSpecimenTotalQuantity),
        company: newSpecimenCompany,
      });
      
      setNotification({
        type: 'success',
        message: 'Specimen added successfully!',
        title: 'Success'
      });
      setShowAddSpecimenForm(false);
      setNewSpecimenName('');
      setNewSpecimenType('');
      setNewSpecimenDescription('');
      setNewSpecimenStoragePlace('');
      setNewSpecimenTotalQuantity('');
      setNewSpecimenCompany('');
      fetchData();
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to add specimen: ${error.message}`,
        title: 'Error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createSlide({
        name: newSlideName,
        description: newSlideDescription,
        storagePlace: newSlideStoragePlace,
        totalQuantity: parseFloat(newSlideTotalQuantity),
        company: newSlideCompany,
      });
      
      setNotification({
        type: 'success',
        message: 'Slide added successfully!',
        title: 'Success'
      });
      setShowAddSlideForm(false);
      setNewSlideName('');
      setNewSlideDescription('');
      setNewSlideStoragePlace('');
      setNewSlideTotalQuantity('');
      setNewSlideCompany('');
      fetchData();
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to add slide: ${error.message}`,
        title: 'Error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teachers = users.filter(user => user.role === 'faculty');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      setActivityError(null);
      try {
        const logs = await api.fetchRecentActivityLogs();
        setRecentActivities(logs);
      } catch (err) {
        setActivityError('Failed to load recent activity.');
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  // Auto-refresh inventory data with configurable interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) {
      console.log('🔄 Auto-refresh disabled');
      return; // Don't set up interval if disabled
    }

    const interval = setInterval(async () => {
      console.log(`🔄 Auto-refreshing inventory data every ${autoRefreshInterval/1000} seconds...`);
      setIsAutoRefreshing(true);
      try {
        await fetchData();
      } finally {
        setIsAutoRefreshing(false);
      }
    }, autoRefreshInterval);

    // Cleanup interval on component unmount or when interval changes
    return () => clearInterval(interval);
  }, [fetchData, autoRefreshInterval]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button 
              onClick={fetchData} 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
              title="Refresh inventory data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            {isAutoRefreshing && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                Auto-refreshing...
              </div>
            )}
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
          </div>
        </div>
        <div className="flex justify-end mb-4">
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            onClick={() => setShowCreateUserForm(true)}
          >
            Add User
          </button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Chemicals</h2>
            <p className="text-3xl font-bold text-blue-600">{chemicals.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Glasswares</h2>
            <p className="text-3xl font-bold text-green-600">{glasswares.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Instruments</h2>
            <p className="text-3xl font-bold text-purple-600">{instruments.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <button 
              onClick={() => setShowAddChemicalForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Chemical
            </button>
            <button 
              onClick={() => setShowAddGlasswareForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Glassware
            </button>
            <button 
              onClick={() => setShowAddPlasticwareForm(true)}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              Add Plasticware
            </button>
            <button 
              onClick={() => setShowAddInstrumentForm(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Add Instrument
            </button>
            <button 
              onClick={() => setShowAddMiscForm(true)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Add Miscellaneous
            </button>
            <button 
              onClick={() => setShowAddSpecimenForm(true)}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              Add Specimens
            </button>
            <button 
              onClick={() => setShowAddSlideForm(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Add Slides
            </button>
            <button 
              onClick={() => setShowCreateTeacherForm(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Create Teacher Account
            </button>
          </div>
        </div>

        {/* Inventory Section */}
        <InventorySection 
          chemicals={chemicals || []} 
          glasswares={glasswares || []} 
          instruments={instruments || []} 
          plasticwares={plasticwares || []}
          miscellaneous={miscellaneous || []}
          specimens={specimens || []}
          slides={slides || []}
        />

        {/* Add Chemical Form */}
        {showAddChemicalForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Chemical</h2>
            <form onSubmit={handleAddChemical} className="space-y-4">
              <div>
                <label htmlFor="chemicalName" className="block text-sm font-medium text-gray-700">Chemical Name</label>
                <input type="text" id="chemicalName" value={newChemicalName} onChange={e => setNewChemicalName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="chemicalCatalogNumber" className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" id="chemicalCatalogNumber" value={newChemicalCatalogNumber} onChange={e => setNewChemicalCatalogNumber(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="chemicalType" className="block text-sm font-medium text-gray-700">Type</label>
                <select id="chemicalType" value={newChemicalType} onChange={e => setNewChemicalType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                  <option value="Solid">Solid</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Stain">Stain</option>
                </select>
              </div>
              <div>
                <label htmlFor="chemicalStoragePlace" className="block text-sm font-medium text-gray-700">Location</label>
                <select id="chemicalStoragePlace" value={newChemicalStoragePlace} onChange={e => setNewChemicalStoragePlace(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                  <option value="Cupboard">Cupboard</option>
                  <option value="Freezer">Freezer</option>
                  <option value="Deep Freezer">Deep Freezer</option>
                </select>
              </div>
              <div>
                <label htmlFor="chemicalTotalWeight" className="block text-sm font-medium text-gray-700">Total Weight (g)</label>
                <input type="number" id="chemicalTotalWeight" value={newChemicalTotalWeight} onChange={e => setNewChemicalTotalWeight(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="chemicalCompany" className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" id="chemicalCompany" value={newChemicalCompany} onChange={e => setNewChemicalCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Chemical</button>
                <button type="button" onClick={() => setShowAddChemicalForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Glassware Form */}
        {showAddGlasswareForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Glassware</h2>
            <form onSubmit={handleAddGlassware} className="space-y-4">
              <div>
                <label htmlFor="glasswareName" className="block text-sm font-medium text-gray-700">Glassware Name</label>
                <input type="text" id="glasswareName" value={newGlasswareName} onChange={e => setNewGlasswareName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="glasswareType" className="block text-sm font-medium text-gray-700">Type</label>
                <input type="text" id="glasswareType" placeholder="e.g., Beaker, Flask, Test Tube" value={newGlasswareType} onChange={e => setNewGlasswareType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              {/* catalog number removed for glassware */}
              
              <div>
                <label htmlFor="glasswareStoragePlace" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="glasswareStoragePlace" value={newGlasswareStoragePlace} onChange={e => setNewGlasswareStoragePlace(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="glasswareTotalQuantity" className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" id="glasswareTotalQuantity" value={newGlasswareTotalQuantity} onChange={e => setNewGlasswareTotalQuantity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="glasswareCompany" className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" id="glasswareCompany" value={newGlasswareCompany} onChange={e => setNewGlasswareCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Add Glassware</button>
                <button type="button" onClick={() => setShowAddGlasswareForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Instrument Form */}
        {showAddInstrumentForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Instrument</h2>
            <form onSubmit={handleAddInstrument} className="space-y-4">
              <div>
                <label htmlFor="instrumentName" className="block text-sm font-medium text-gray-700">Instrument Name</label>
                <input type="text" id="instrumentName" value={newInstrumentName} onChange={e => setNewInstrumentName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="instrumentType" className="block text-sm font-medium text-gray-700">Type</label>
                <input type="text" id="instrumentType" placeholder="e.g., Microscope, Centrifuge, Spectrophotometer" value={newInstrumentType} onChange={e => setNewInstrumentType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              {/* catalog number removed for instruments */}
              
              <div>
                <label htmlFor="instrumentStoragePlace" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="instrumentStoragePlace" value={newInstrumentStoragePlace} onChange={e => setNewInstrumentStoragePlace(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="instrumentTotalQuantity" className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" id="instrumentTotalQuantity" value={newInstrumentTotalQuantity} onChange={e => setNewInstrumentTotalQuantity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="instrumentCompany" className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" id="instrumentCompany" value={newInstrumentCompany} onChange={e => setNewInstrumentCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Add Instrument</button>
                <button type="button" onClick={() => setShowAddInstrumentForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Plasticware Form */}
        {showAddPlasticwareForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Plasticware</h2>
            <form onSubmit={handleAddPlasticware} className="space-y-4">
              <div>
                <label htmlFor="plasticwareName" className="block text-sm font-medium text-gray-700">Plasticware Name</label>
                <input type="text" id="plasticwareName" value={newPlasticwareName} onChange={e => setNewPlasticwareName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="plasticwareType" className="block text-sm font-medium text-gray-700">Type</label>
                <input type="text" id="plasticwareType" placeholder="e.g., Pipette, Petri Dish, Centrifuge Tube" value={newPlasticwareType} onChange={e => setNewPlasticwareType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              {/* catalog number removed for plasticware */}
              <div>
                <label htmlFor="plasticwareStoragePlace" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="plasticwareStoragePlace" value={newPlasticwareStoragePlace} onChange={e => setNewPlasticwareStoragePlace(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="plasticwareTotalQuantity" className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" id="plasticwareTotalQuantity" value={newPlasticwareTotalQuantity} onChange={e => setNewPlasticwareTotalQuantity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="plasticwareCompany" className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" id="plasticwareCompany" value={newPlasticwareCompany} onChange={e => setNewPlasticwareCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">Add Plasticware</button>
                <button type="button" onClick={() => setShowAddPlasticwareForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Miscellaneous Form */}
        {showAddMiscForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Miscellaneous Item</h2>
            <form onSubmit={handleAddMiscellaneous} className="space-y-4">
              <div>
                <label htmlFor="miscName" className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" id="miscName" value={newMiscName} onChange={e => setNewMiscName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="miscType" className="block text-sm font-medium text-gray-700">Type</label>
                <input type="text" id="miscType" placeholder="e.g., modul, Minor Instrument" value={newMiscType} onChange={e => setNewMiscType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="miscDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" id="miscDescription" value={newMiscDescription} onChange={e => setNewMiscDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="miscStoragePlace" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="miscStoragePlace" value={newMiscStoragePlace} onChange={e => setNewMiscStoragePlace(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="miscTotalQuantity" className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" id="miscTotalQuantity" value={newMiscTotalQuantity} onChange={e => setNewMiscTotalQuantity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="miscCompany" className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" id="miscCompany" value={newMiscCompany} onChange={e => setNewMiscCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Add Miscellaneous</button>
                <button type="button" onClick={() => setShowAddMiscForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Specimens Form */}
        {showAddSpecimenForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Specimen</h2>
            <form onSubmit={handleAddSpecimen} className="space-y-4">
              <div>
                <label htmlFor="specimenName" className="block text-sm font-medium text-gray-700">Specimen Name</label>
                <input type="text" id="specimenName" value={newSpecimenName} onChange={e => setNewSpecimenName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="specimenType" className="block text-sm font-medium text-gray-700">Type</label>
                <input type="text" id="specimenType" value={newSpecimenType} onChange={e => setNewSpecimenType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="specimenDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" id="specimenDescription" value={newSpecimenDescription} onChange={e => setNewSpecimenDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="specimenStoragePlace" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="specimenStoragePlace" value={newSpecimenStoragePlace} onChange={e => setNewSpecimenStoragePlace(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="specimenTotalQuantity" className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" id="specimenTotalQuantity" value={newSpecimenTotalQuantity} onChange={e => setNewSpecimenTotalQuantity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="specimenCompany" className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" id="specimenCompany" value={newSpecimenCompany} onChange={e => setNewSpecimenCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Add Specimen</button>
                <button type="button" onClick={() => setShowAddSpecimenForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Slides Form */}
        {showAddSlideForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Slide</h2>
            <form onSubmit={handleAddSlide} className="space-y-4">
              <div>
                <label htmlFor="slideName" className="block text-sm font-medium text-gray-700">Slide Name</label>
                <input type="text" id="slideName" value={newSlideName} onChange={e => setNewSlideName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="slideDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" id="slideDescription" value={newSlideDescription} onChange={e => setNewSlideDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="slideStoragePlace" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="slideStoragePlace" value={newSlideStoragePlace} onChange={e => setNewSlideStoragePlace(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="slideTotalQuantity" className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" id="slideTotalQuantity" value={newSlideTotalQuantity} onChange={e => setNewSlideTotalQuantity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="slideCompany" className="block text-sm font-medium text-gray-700">Company (optional)</label>
                <input type="text" id="slideCompany" value={newSlideCompany} onChange={e => setNewSlideCompany(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Add Slide</button>
                <button type="button" onClick={() => setShowAddSlideForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Create Teacher Account Form */}
        {showCreateTeacherForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Teacher Account</h2>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label htmlFor="teacherUsername" className="block text-sm font-medium text-gray-700">Username</label>
                <input 
                  type="text" 
                  id="teacherUsername" 
                  value={newTeacherUsername} 
                  onChange={(e) => setNewTeacherUsername(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="teacherPassword" className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  type="password" 
                  id="teacherPassword" 
                  value={newTeacherPassword} 
                  onChange={(e) => setNewTeacherPassword(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="teacherEmail" className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  id="teacherEmail" 
                  value={newTeacherEmail} 
                  onChange={(e) => setNewTeacherEmail(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="teacherFullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  id="teacherFullName" 
                  value={newTeacherFullName} 
                  onChange={(e) => setNewTeacherFullName(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
                  required 
                />
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Teacher
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateTeacherForm(false)} 
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Create New User Form */}
        {showCreateUserForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New User</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.createUser({
                    username: newUserUsername,
                    password: newUserPassword,
                    email: newUserEmail,
                    fullName: newUserFullName,
                    role: newUserRole,
                    ...(newUserRole === 'student' ? { rollNo: newUserRollNo, category: newUserCategory, year: newUserYear, department: newUserDepartment } : {})
                  });
                  alert('User created successfully!');
                  setShowCreateUserForm(false);
                  setNewUserUsername('');
                  setNewUserPassword('');
                  setNewUserEmail('');
                  setNewUserFullName('');
                  setNewUserRole('student');
                  setNewUserRollNo('');
                  setNewUserCategory('UG/PG');
                  setNewUserYear('');
                  setNewUserDepartment('');
                  fetchData();
                } catch (err) {
                  alert('Failed to create user: ' + err.message);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" className="border p-2 rounded w-full" value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" className="border p-2 rounded w-full" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="border p-2 rounded w-full" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" className="border p-2 rounded w-full" value={newUserFullName} onChange={e => setNewUserFullName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select className="border p-2 rounded w-full" value={newUserRole} onChange={e => setNewUserRole(e.target.value)} required>
                  <option value="student">Student</option>
                  <option value="faculty">Teacher</option>
                </select>
              </div>
              {newUserRole === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roll No</label>
                    <input type="text" className="border p-2 rounded w-full" value={newUserRollNo} onChange={e => setNewUserRollNo(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select className="border p-2 rounded w-full" value={newUserCategory} onChange={e => setNewUserCategory(e.target.value)} required>
                      <option value="UG/PG">UG/PG</option>
                      <option value="PhD">PhD</option>
                      <option value="Project Student">Project Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <select className="border p-2 rounded w-full" value={newUserYear} onChange={e => setNewUserYear(e.target.value)} required>
                      <option value="">Select Year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                      <option value="5th">5th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input type="text" className="border p-2 rounded w-full" value={newUserDepartment} onChange={e => setNewUserDepartment(e.target.value)} required />
                  </div>
                </>
              )}
              <div className="flex space-x-4">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Create User</button>
                <button type="button" onClick={() => setShowCreateUserForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Manage All Users */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage All Users</h2>
          {users.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{user.fullName} ({user.username})</p>
                    <p className="text-sm text-gray-600">{user.email} | Role: {user.role}</p>
                  </div>
                  {/* Hide delete action for admins; only master admin can delete via master-admin panel */}
                  <div className="text-sm text-gray-500">Deletion restricted to Master Admin</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No users found.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {loadingActivities ? (
              <p className="text-gray-600">Loading...</p>
            ) : activityError ? (
              <p className="text-red-600">{activityError}</p>
            ) : recentActivities.length === 0 ? (
              <p className="text-gray-600">No recent activity</p>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-2">
                <ul className="divide-y divide-gray-200">
                  {recentActivities.map((log) => (
                    <li key={log.id || `${log.itemType}-${log.itemId}-${log.timestamp}` } className="py-2">
                      <span className="font-semibold capitalize">{log.action}</span> {log.itemType} <span className="font-semibold">{log.itemName}</span>
                      <span className="text-gray-500 ml-2">by {log.user || 'unknown'}</span>
                      <span className="text-gray-400 ml-2 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-refresh Interval
                  </label>
                  <select 
                    value={autoRefreshInterval} 
                    onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value={2000}>2 seconds</option>
                    <option value={5000}>5 seconds</option>
                    <option value={10000}>10 seconds</option>
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={0}>Disabled</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    How often to automatically refresh inventory data
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating FAQ Button */}
        <div>
          <button
            className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-blue-700 z-50"
            style={{ outline: 'none', border: 'none' }}
            onClick={() => setShowFaqModal(true)}
            aria-label="Open FAQ"
          >
            ?
          </button>
          {showFaqModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="relative">
                <AIFaqPage onClose={() => setShowFaqModal(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;