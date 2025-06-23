import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import InventorySection from "./InventorySection";

const AdminDashboard = () => {
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

  const [showAddGlasswareForm, setShowAddGlasswareForm] = useState(false);
  const [newGlasswareName, setNewGlasswareName] = useState('');
  const [newGlasswareType, setNewGlasswareType] = useState('');
  const [newGlasswareStoragePlace, setNewGlasswareStoragePlace] = useState('');
  const [newGlasswareTotalQuantity, setNewGlasswareTotalQuantity] = useState('');
  const [newGlasswareCompany, setNewGlasswareCompany] = useState('');

  const [showAddInstrumentForm, setShowAddInstrumentForm] = useState(false);
  const [newInstrumentName, setNewInstrumentName] = useState('');
  const [newInstrumentType, setNewInstrumentType] = useState('');
  const [newInstrumentStoragePlace, setNewInstrumentStoragePlace] = useState('');
  const [newInstrumentTotalQuantity, setNewInstrumentTotalQuantity] = useState('');
  const [newInstrumentCompany, setNewInstrumentCompany] = useState('');

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teachers = users.filter(user => user.role === 'faculty');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/register-book')} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Register Book Entry</button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onClick={() => setShowAddInstrumentForm(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Add Instrument
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
          chemicals={chemicals} 
          glasswares={glasswares} 
          instruments={instruments} 
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
                <label htmlFor="glasswareType" className="block text-sm font-medium text-gray-700">Type</label>
                <input type="text" id="glasswareType" value={newGlasswareType} onChange={e => setNewGlasswareType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
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
                <label htmlFor="instrumentType" className="block text-sm font-medium text-gray-700">Type</label>
                <input type="text" id="instrumentType" value={newInstrumentType} onChange={e => setNewInstrumentType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
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

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;