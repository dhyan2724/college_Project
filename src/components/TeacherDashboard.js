import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import api from '../services/api';
import InventorySection from './InventorySection';

const TeacherDashboard = () => {
  const { chemicals, glasswares, plasticwares, instruments, logout, user, fetchData } = useContext(AuthContext);
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
    const fetchPending = async () => {
      try {
        const requests = await api.fetchPendingRequests();
        setPendingRequests(Array.isArray(requests) ? requests : []);
      } catch (error) {
        setPendingRequests([]);
      }
    };
    fetchIssued();
    fetchPending();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Approve or reject a pending request
  const handleRequestAction = async (requestId, status) => {
    try {
      await api.updatePendingRequest(requestId, { status });
      // Refresh the pending requests list
      const requests = await api.fetchPendingRequests();
      setPendingRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      alert('Failed to update request: ' + (error.message || error));
    }
  };

  // Issue item(s) for a request
  const handleIssueItem = async (request) => {
    try {
      for (const item of request.items) {
        await api.createIssuedItem({
          itemType: item.itemType,
          itemId: item.itemId,
          issuedTo: request.requestedByUser,
          facultyInCharge: request.facultyInCharge,
          quantity: item.quantity,
          totalWeightIssued: item.totalWeightRequested,
          purpose: request.purpose,
          returnDate: request.desiredReturnTime,
          notes: request.notes,
          pendingRequestId: request._id, // <-- add this line
        });
      }
      alert('Item(s) issued!');
      // Refresh issued items and inventory data
      const items = await api.fetchIssuedItems();
      setIssuedItems(items);
      // Refresh inventory data to show updated quantities
      if (fetchData) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to issue item: ' + (err.message || err));
    }
  };

  // Mark item as returned
  const handleReturnItem = async (itemId) => {
    try {
      await api.updateIssuedItem(itemId, { status: 'returned' });
      alert('Item marked as returned!');
      // Refresh issued items and inventory data
      const items = await api.fetchIssuedItems();
      setIssuedItems(items);
      // Refresh inventory data to show updated quantities
      if (fetchData) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to return item: ' + (err.message || err));
    }
  };

  // Helper: Check if a request has already been issued
  const isRequestIssued = (request) => {
    // If any issuedItem has pendingRequestId matching this request's _id, consider it issued
    return issuedItems.some(item => item.pendingRequestId === request._id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <div className="flex gap-2">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity/Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.status === 'issued' && (
                        <button
                          onClick={() => handleReturnItem(item._id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                        >
                          Return
                        </button>
                      )}
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
      {/* Pending requests section for this teacher */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Pending Requests Assigned to You</h2>
        {pendingRequests.length > 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map(request => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestedByName} ({request.requestedByRollNo})</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {request.items.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.itemType}: {item.itemId?.name || 'Unknown'}
                            {item.quantity && ` (${item.quantity})`}
                            {item.totalWeightRequested && ` - ${item.totalWeightRequested}g`}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{request.purpose}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(request.desiredIssueTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(request.desiredReturnTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.status}
                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleRequestAction(request._id, 'approved')}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                          >Approve</button>
                          <button
                            onClick={() => handleRequestAction(request._id, 'rejected')}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                          >Reject</button>
                        </div>
                      )}
                      {request.status === 'approved' && !isRequestIssued(request) && (
                        <button
                          onClick={() => handleIssueItem(request)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs ml-2"
                        >Issue Item</button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(request.requestDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No pending requests</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard; 