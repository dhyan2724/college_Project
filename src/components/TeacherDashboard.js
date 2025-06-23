import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../services/api';
import InventorySection from './InventorySection';

const TeacherDashboard = () => {
  const { chemicals, glasswares, plasticwares, instruments, logout } = useContext(AuthContext);
  const [issuedItems, setIssuedItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch issued items and pending requests
    const fetchIssued = async () => {
      try {
        const items = await api.fetchIssuedItems();
        setIssuedItems(items);
      } catch (error) {
        setIssuedItems([]);
      }
    };
    // For pending requests, you would use a similar API call if available
    setPendingRequests([]); // Placeholder
    fetchIssued();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/register-book')} className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Register Book Entry</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
        </div>
      </div>
      <InventorySection 
        chemicals={chemicals} 
        glasswares={glasswares} 
        plasticwares={plasticwares} 
        instruments={instruments} 
      />
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">All Issued Items</h2>
        {issuedItems.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity/Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issuedItems.map(item => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.issuedTo?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity || item.totalWeightIssued || ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'Not returned'}</td>
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
      {/* Pending requests section can be added here if API is available */}
    </div>
  );
};

export default TeacherDashboard; 