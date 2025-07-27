import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../services/api';
import AIFaqPage from './AIFaqPage';
import InventorySection from "./InventorySection";

const AdminDashboard = ({ miscellaneous = [], setMiscellaneous }) => {
  const { chemicals, glasswares, instruments, users, setUsers, fetchData, API_URL, logout } = useContext(AuthContext);
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
  const [newGlasswareCatalogNumber, setNewGlasswareCatalogNumber] = useState("");

  const [showAddInstrumentForm, setShowAddInstrumentForm] = useState(false);
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [newInstrumentType, setNewInstrumentType] = useState('');
  const [newInstrumentStoragePlace, setNewInstrumentStoragePlace] = useState('');
  const [newInstrumentTotalQuantity, setNewInstrumentTotalQuantity] = useState('');
  const [newInstrumentCompany, setNewInstrumentCompany] = useState('');
  const [newInstrumentCatalogNumber, setNewInstrumentCatalogNumber] = useState("");

  const [showAddPlasticwareForm, setShowAddPlasticwareForm] = useState(false);
  const [newPlasticwareName, setNewPlasticwareName] = useState('');
  const [newPlasticwareStoragePlace, setNewPlasticwareStoragePlace] = useState('');
  const [newPlasticwareTotalQuantity, setNewPlasticwareTotalQuantity] = useState('');
  const [newPlasticwareCompany, setNewPlasticwareCompany] = useState('');
  const [newPlasticwareCatalogNumber, setNewPlasticwareCatalogNumber] = useState("");

  const [showAddMiscForm, setShowAddMiscForm] = useState(false);
  const [newMiscName, setNewMiscName] = useState('');
  const [newMiscDescription, setNewMiscDescription] = useState('');
  const [newMiscStoragePlace, setNewMiscStoragePlace] = useState('');
  const [newMiscTotalQuantity, setNewMiscTotalQuantity] = useState('');
  const [newMiscCompany, setNewMiscCompany] = useState('');
  const [newMiscCatalogNumber, setNewMiscCatalogNumber] = useState('');

  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activityError, setActivityError] = useState(null);

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
        fetchData(); // Refresh user data after creating a new teacher
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
        fetchData(); // Refresh chemical data after adding a new chemical
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
          catalogNumber: newGlasswareCatalogNumber,
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
        setNewGlasswareCatalogNumber('');
        fetchData(); // Refresh glassware data after adding new glassware
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
          catalogNumber: newInstrumentCatalogNumber,
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
        setNewInstrumentCatalogNumber('');
        fetchData(); // Refresh instrument data after adding new instrument
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
          storagePlace: newPlasticwareStoragePlace,
          totalQuantity: parseFloat(newPlasticwareTotalQuantity),
          company: newPlasticwareCompany,
          catalogNumber: newPlasticwareCatalogNumber,
        }),
      });
      if (response.ok) {
        alert('Plasticware added successfully!');
        setShowAddPlasticwareForm(false);
        setNewPlasticwareName('');
        setNewPlasticwareStoragePlace('');
        setNewPlasticwareTotalQuantity('');
        setNewPlasticwareCompany('');
        setNewPlasticwareCatalogNumber('');
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to add plasticware: ${errorData.message}`);
      }
    } catch (error) {
      alert('An error occurred while adding the plasticware.');
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
          description: newMiscDescription,
          storagePlace: newMiscStoragePlace,
          totalQuantity: parseFloat(newMiscTotalQuantity),
          company: newMiscCompany,
          catalogNumber: newMiscCatalogNumber,
        }),
      });
      if (response.ok) {
        alert('Miscellaneous item added successfully!');
        setShowAddMiscForm(false);
        setNewMiscName('');
        setNewMiscDescription('');
        setNewMiscStoragePlace('');
        setNewMiscTotalQuantity('');
        setNewMiscCompany('');
        setNewMiscCatalogNumber('');
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to add miscellaneous item: ${errorData.message}`);
      }
    } catch (error) {
      alert('An error occurred while adding the miscellaneous item.');
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

  const [showAddSpecimenForm, setShowAddSpecimenForm] = useState(false);
  const [showAddSlideForm, setShowAddSlideForm] = useState(false);
  const [showAddMinorInstrumentForm, setShowAddMinorInstrumentForm] = useState(false);

  // Specimen form state
  const [newSpecimenName, setNewSpecimenName] = useState('');
  const [newSpecimenType, setNewSpecimenType] = useState('Plant');
  const [newSpecimenTotalQuantity, setNewSpecimenTotalQuantity] = useState('');
  const [newSpecimenCompany, setNewSpecimenCompany] = useState('');
  const [newSpecimenCatalogNumber, setNewSpecimenCatalogNumber] = useState('');

  // Slide form state
  const [newSlideName, setNewSlideName] = useState('');
  const [newSlideTotalQuantity, setNewSlideTotalQuantity] = useState('');
  const [newSlideCompany, setNewSlideCompany] = useState('');
  const [newSlideCatalogNumber, setNewSlideCatalogNumber] = useState('');

  // Minor Instrument form state
  const [newMinorInstrumentName, setNewMinorInstrumentName] = useState('');
  const [newMinorInstrumentType, setNewMinorInstrumentType] = useState('Kit');
  const [newMinorInstrumentTotalQuantity, setNewMinorInstrumentTotalQuantity] = useState('');
  const [newMinorInstrumentCompany, setNewMinorInstrumentCompany] = useState('');
  const [newMinorInstrumentCatalogNumber, setNewMinorInstrumentCatalogNumber] = useState('');

  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserRollNo, setNewUserRollNo] = useState('');
  const [newUserCategory, setNewUserCategory] = useState('UG/PG');

  const [showFaqModal, setShowFaqModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
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
              onClick={() => setShowCreateTeacherForm(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Create Teacher Account
            </button>
            {/* New: Add Specimen */}
            <button
              onClick={() => setShowAddSpecimenForm(true)}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            >
              Add Specimen
            </button>
            {/* New: Add Slide */}
            <button
              onClick={() => setShowAddSlideForm(true)}
              className="bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-800"
            >
              Add Slide
            </button>
            {/* New: Add Minor Instrument */}
            <button
              onClick={() => setShowAddMinorInstrumentForm(true)}
              className="bg-fuchsia-700 text-white px-4 py-2 rounded hover:bg-fuchsia-800"
            >
              Add Minor Instrument
            </button>
          </div>
        </div>

        {/* Inventory Section */}
        <InventorySection 
          chemicals={chemicals} 
          glasswares={glasswares} 
          instruments={instruments} 
          plasticwares={miscellaneous}
          miscellaneous={miscellaneous}
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
                <label htmlFor="chemicalStoragePlace" className="block text-sm font-medium text-gray-700">Storage Place</label>
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
                <label htmlFor="glasswareCatalogNumber" className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" id="glasswareCatalogNumber" value={newGlasswareCatalogNumber} onChange={e => setNewGlasswareCatalogNumber(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              
              <div>
                <label htmlFor="glasswareStoragePlace" className="block text-sm font-medium text-gray-700">Storage Place</label>
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
                <label htmlFor="instrumentCatalogNumber" className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" id="instrumentCatalogNumber" value={newInstrumentCatalogNumber} onChange={e => setNewInstrumentCatalogNumber(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              
              <div>
                <label htmlFor="instrumentStoragePlace" className="block text-sm font-medium text-gray-700">Storage Place</label>
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
                <label htmlFor="plasticwareCatalogNumber" className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" id="plasticwareCatalogNumber" value={newPlasticwareCatalogNumber} onChange={e => setNewPlasticwareCatalogNumber(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label htmlFor="plasticwareStoragePlace" className="block text-sm font-medium text-gray-700">Storage Place</label>
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
                <label htmlFor="miscDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" id="miscDescription" value={newMiscDescription} onChange={e => setNewMiscDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="miscCatalogNumber" className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" id="miscCatalogNumber" value={newMiscCatalogNumber} onChange={e => setNewMiscCatalogNumber(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
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

        {/* Add Specimen Form */}
        {showAddSpecimenForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Specimen</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Specimen Name</label>
                <input type="text" className="border p-2 rounded w-full" value={newSpecimenName} onChange={e => setNewSpecimenName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="border p-2 rounded w-full" value={newSpecimenType} onChange={e => setNewSpecimenType(e.target.value)}>
                  <option value="Plant">Plant</option>
                  <option value="Animal">Animal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" className="border p-2 rounded w-full" value={newSpecimenTotalQuantity} onChange={e => setNewSpecimenTotalQuantity(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input type="text" className="border p-2 rounded w-full" value={newSpecimenCompany} onChange={e => setNewSpecimenCompany(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" className="border p-2 rounded w-full" value={newSpecimenCatalogNumber} onChange={e => setNewSpecimenCatalogNumber(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowAddSpecimenForm(false)}>Cancel</button>
                <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded">Add Specimen</button>
              </div>
            </form>
          </div>
        )}
        {/* Add Slide Form */}
        {showAddSlideForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Slide</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Slide Name</label>
                <input type="text" className="border p-2 rounded w-full" value={newSlideName} onChange={e => setNewSlideName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" className="border p-2 rounded w-full" value={newSlideTotalQuantity} onChange={e => setNewSlideTotalQuantity(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input type="text" className="border p-2 rounded w-full" value={newSlideCompany} onChange={e => setNewSlideCompany(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" className="border p-2 rounded w-full" value={newSlideCatalogNumber} onChange={e => setNewSlideCatalogNumber(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowAddSlideForm(false)}>Cancel</button>
                <button type="submit" className="bg-cyan-700 text-white px-4 py-2 rounded">Add Slide</button>
              </div>
            </form>
          </div>
        )}
        {/* Add Minor Instrument Form */}
        {showAddMinorInstrumentForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Minor Instrument</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Instrument Name</label>
                <input type="text" className="border p-2 rounded w-full" value={newMinorInstrumentName} onChange={e => setNewMinorInstrumentName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="border p-2 rounded w-full" value={newMinorInstrumentType} onChange={e => setNewMinorInstrumentType(e.target.value)}>
                  <option value="Kit">Kit</option>
                  <option value="Module">Module</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Quantity</label>
                <input type="number" className="border p-2 rounded w-full" value={newMinorInstrumentTotalQuantity} onChange={e => setNewMinorInstrumentTotalQuantity(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input type="text" className="border p-2 rounded w-full" value={newMinorInstrumentCompany} onChange={e => setNewMinorInstrumentCompany(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Catalog Number</label>
                <input type="text" className="border p-2 rounded w-full" value={newMinorInstrumentCatalogNumber} onChange={e => setNewMinorInstrumentCatalogNumber(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowAddMinorInstrumentForm(false)}>Cancel</button>
                <button type="submit" className="bg-fuchsia-700 text-white px-4 py-2 rounded">Add Minor Instrument</button>
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
                    ...(newUserRole === 'student' ? { rollNo: newUserRollNo, category: newUserCategory } : {})
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
                </>
              )}
              <div className="flex space-x-4">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Create User</button>
                <button type="button" onClick={() => setShowCreateUserForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Teacher Accounts */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Teacher Accounts</h2>
          {teachers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {teachers.map(teacher => (
                <li key={teacher._id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{teacher.fullName} ({teacher.username})</p>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                  {/* Add delete/edit buttons here later */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No teacher accounts found.</p>
          )}
        </div>

        {/* Manage All Users */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage All Users</h2>
          {users.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user._id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{user.fullName} ({user.username})</p>
                    <p className="text-sm text-gray-600">{user.email} | Role: {user.role}</p>
                  </div>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete user ${user.fullName}?`)) {
                        try {
                          await api.deleteUser(user._id);
                          alert('User deleted successfully!');
                          fetchData();
                        } catch (err) {
                          alert('Failed to delete user: ' + err.message);
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
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
              <ul className="divide-y divide-gray-200">
                {recentActivities.map((log) => (
                  <li key={log._id} className="py-2">
                    <span className="font-semibold capitalize">{log.action}</span> {log.itemType} <span className="font-semibold">{log.itemName}</span>
                    <span className="text-gray-500 ml-2">by {log.user || 'unknown'}</span>
                    <span className="text-gray-400 ml-2 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

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