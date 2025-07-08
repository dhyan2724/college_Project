import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import RegisterBookForm from './components/RegisterBookForm';
import StudentDashboard from './components/StudentDashboard';
import StudentRegisterPage from './components/StudentRegisterPage';
import TeacherDashboard from './components/TeacherDashboard';

const API_URL = 'http://localhost:5000/api';

export const AuthContext = createContext(null);

function App() {
    const [user, setUser] = useState(null);
    const [chemicals, setChemicals] = useState([]);
    const [glasswares, setGlasswares] = useState([]);
    const [plasticwares, setPlasticwares] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [users, setUsers] = useState([]);
    const [issuedItems, setIssuedItems] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        console.log('Stored user from localStorage:', storedUser, 2);
        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Validate parsedUser to ensure it has a role and is one of the expected roles
                if (parsedUser && (parsedUser.role === 'admin' || parsedUser.role === 'faculty' || parsedUser.role === 'student')) {
                    setUser(parsedUser);
                } else {
                    console.warn('Invalid user data in localStorage, clearing...');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (e) {
                console.error('Error parsing user from localStorage, clearing...', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            }
        }
    }, []);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, skipping data fetch.');
            return;
        }
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const fetches = [
                fetch(`${API_URL}/chemicals`, { headers }),
                fetch(`${API_URL}/glasswares`, { headers }),
                fetch(`${API_URL}/plasticwares`, { headers }),
                fetch(`${API_URL}/instruments`, { headers }),
                fetch(`${API_URL}/pendingrequests`, { headers }),
                fetch(`${API_URL}/issueditems`, { headers }),
            ];

            let isAdminOrFaculty = user && (user.role === 'admin' || user.role === 'faculty');
            if (isAdminOrFaculty) {
                fetches.push(fetch(`${API_URL}/users`, { headers }));
            }

            const responses = await Promise.all(fetches);
            if (responses.some(res => res.status === 401 || res.status === 403)) {
                console.log('Token expired or invalid, logging out...');
                logout();
                return;
            }

            const [chemicalsData, glasswaresData, plasticwaresData, instrumentsData, pendingRequestsData, issuedItemsData, usersData] =
                await Promise.all(responses.map(res => res.json()));

            setChemicals(chemicalsData);
            setGlasswares(glasswaresData);
            setPlasticwares(plasticwaresData);
            setInstruments(instrumentsData);
            setPendingRequests(pendingRequestsData);
            setIssuedItems(issuedItemsData);
            if (isAdminOrFaculty) {
                setUsers(usersData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.log('Token expired or invalid, logging out...');
                logout();
            }
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [fetchData, user]);

    const login = async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                await fetchData(); // Fetch initial data after login
                return true;
            } else {
                const errorData = await response.json();
                alert(`Login failed: ${errorData.message}`);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setChemicals([]);
        setGlasswares([]);
        setPlasticwares([]);
        setInstruments([]);
        setUsers([]);
        setIssuedItems([]);
        setPendingRequests([]);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, chemicals, setChemicals, glasswares, setGlasswares, plasticwares, setPlasticwares, instruments, setInstruments, users, setUsers, issuedItems, setIssuedItems, pendingRequests, setPendingRequests, fetchData, API_URL }}>
            <Header />
            <Router>
                <Routes>
                    <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
                    <Route path="/register" element={user ? <Navigate to="/" replace /> : <StudentRegisterPage />} />
                    <Route
                        path="/"
                        element={
                            user ? (
                                user.role === 'admin' ? (
                                    <Navigate to="/admin" replace />
                                ) : user.role === 'faculty' ? (
                                    <Navigate to="/teacher" replace />
                                ) : user.role === 'student' ? (
                                    <Navigate to="/student" replace />
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} />
                    <Route path="/teacher" element={user && user.role === 'faculty' ? <TeacherDashboard /> : <Navigate to="/login" replace />} />
                    <Route path="/student" element={user && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" replace />} />
                    <Route path="/register-book" element={user ? <RegisterBookForm /> : <Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;