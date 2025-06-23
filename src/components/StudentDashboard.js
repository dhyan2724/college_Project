import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../services/api';

const StudentDashboard = () => {
  const { user, chemicals, glasswares, plasticwares, instruments, pendingRequests, issuedItems, fetchData, API_URL, logout, users } = useContext(AuthContext);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [itemType, setItemType] = useState('chemical');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalWeightRequested, setTotalWeightRequested] = useState('');
  const [purpose, setPurpose] = useState('');
  const [desiredIssueTime, setDesiredIssueTime] = useState('');
  const [desiredReturnTime, setDesiredReturnTime] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { itemType: 'chemical', itemId: '', quantity: '', totalWeightRequested: '' }
  ]);
  const [facultyInCharge, setFacultyInCharge] = useState('');
  const [teachers, setTeachers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  useEffect(() => {
    if (user && user.role === 'student') {
      api.fetchTeachers().then(setTeachers);
    }
  }, [user]);

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addItem = () => {
    setItems(prev => ([...prev, { itemType: 'chemical', itemId: '', quantity: '', totalWeightRequested: '' }]));
  };
  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await api.createPendingRequest({
        items: items.map(item => ({
          itemType: item.itemType,
          itemId: item.itemId,
          quantity: item.itemType !== 'instrument' ? parseFloat(item.quantity) : undefined,
          totalWeightRequested: item.itemType === 'chemical' ? parseFloat(item.totalWeightRequested) : undefined,
        })),
        facultyInCharge,
        purpose,
        desiredIssueTime,
        desiredReturnTime,
        notes
      });
      alert('Request submitted successfully!');
      setShowRequestForm(false);
      setItems([{ itemType: 'chemical', itemId: '', quantity: '', totalWeightRequested: '' }]);
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

  // Filter requests and issued items for the current user
  const userPendingRequests = pendingRequests.filter(request => request.requestedByUser === user.id);
  const userIssuedItems = issuedItems.filter(item => item.issuedByUser === user.id);

  const getItemOptions = () => {
    switch (itemType) {
      case 'chemical':
        return chemicals;
      case 'glassware':
        return glasswares;
      case 'plasticware':
        return plasticwares;
      case 'instrument':
        return instruments;
      default:
        return [];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/register-book')} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Register Book Entry</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Request Item
        </button>
      </div>

      {showRequestForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Items</h2>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
              <select value={facultyInCharge} onChange={e => setFacultyInCharge(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                <option value="">Select a teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.fullName} ({t.username})</option>
                ))}
              </select>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="border p-4 rounded mb-2 bg-gray-50">
                <div className="flex gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-700">Item Type</label>
                  <select value={item.itemType} onChange={e => handleItemChange(idx, 'itemType', e.target.value)} className="ml-2 border rounded p-1">
                    <option value="chemical">Chemical</option>
                    <option value="glassware">Glassware</option>
                    <option value="plasticware">Plasticware</option>
                    <option value="instrument">Instrument</option>
                  </select>
                  <button type="button" onClick={() => removeItem(idx)} className="ml-auto text-red-600">Remove</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item</label>
                  <select value={item.itemId} onChange={e => handleItemChange(idx, 'itemId', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                    <option value="">Select an item</option>
                    {(item.itemType === 'chemical' ? chemicals : item.itemType === 'glassware' ? glasswares : item.itemType === 'plasticware' ? plasticwares : instruments).map(opt => (
                      <option key={opt._id} value={opt._id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                {item.itemType !== 'instrument' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required min="1" />
                  </div>
                )}
                {item.itemType === 'chemical' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Weight Requested (g)</label>
                    <input type="number" value={item.totalWeightRequested} onChange={e => handleItemChange(idx, 'totalWeightRequested', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required min="0.1" step="0.1" />
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="bg-green-500 text-white px-3 py-1 rounded">Add Another Item</button>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required rows="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Desired Issue Time</label>
              <input type="datetime-local" value={desiredIssueTime} onChange={e => setDesiredIssueTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Desired Return Time</label>
              <input type="datetime-local" value={desiredReturnTime} onChange={e => setDesiredReturnTime(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="2" />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Submit Request</button>
              <button type="button" onClick={() => setShowRequestForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Pending Requests</h2>
        {userPendingRequests.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPendingRequests.map(request => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.itemType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getItemOptions().find(item => item._id === request.itemId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No pending requests</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Issued Items</h2>
        {userIssuedItems.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userIssuedItems.map(item => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getItemOptions().find(i => i._id === item.itemId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'Not returned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No issued items</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 