import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://172.168.2.130:5000/api'; // Make sure this matches your backend API URL

const StudentRegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          email,
          fullName,
          rollNo,
          role: 'student',
          category, // Add category to request
          year,        // Add year to request
          department,
        }),
      });
      if (response.ok) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.message}`);
      }
    } catch (error) {
      alert('An error occurred during registration.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Division of Biomedical and Life Sciences</h1>
        <p className="text-gray-600">Laboratory Management System</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Student Registration</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-2 border rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-4 p-2 border rounded"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Roll Number"
          className="w-full mb-4 p-2 border rounded"
          value={rollNo}
          onChange={e => setRollNo(e.target.value)}
          required
        />
        {/* Category Dropdown */}
        <select
          className="w-full mb-4 p-2 border rounded"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        >
          <option value="">Select Program</option>
          <option value="UG/PG">UG/PG</option>
          <option value="PhD">PhD</option>
          <option value="Project Student">Project Student</option>
        </select>
        <select
            className="w-full mb-4 p-2 border rounded"
            value={year}
            onChange={e => setYear(e.target.value)}
            required>
            <option value="">Select Year</option>
            <option value="1st">1st Year</option>
            <option value="2nd">2nd Year</option>
            <option value="3rd">3rd Year</option>
            <option value="4th">4th Year</option>
            <option value="5th">5th Year</option>
          </select>
          <input
            type="text"
            placeholder="Department"
            className="w-full mb-4 p-2 border rounded"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            required
          />
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <button type="button" className="text-blue-600 underline" onClick={() => navigate('/login')}>Login</button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegisterPage; 