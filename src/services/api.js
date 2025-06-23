const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API error');
  }
  return response.json();
};

// Chemicals
export const fetchChemicals = () => fetch(`${API_URL}/chemicals`, { headers: headers() }).then(handleResponse);
export const createChemical = (data) => fetch(`${API_URL}/chemicals`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const updateChemical = (id, data) => fetch(`${API_URL}/chemicals/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const deleteChemical = (id) => fetch(`${API_URL}/chemicals/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// Glasswares
export const fetchGlasswares = () => fetch(`${API_URL}/glasswares`, { headers: headers() }).then(handleResponse);
export const createGlassware = (data) => fetch(`${API_URL}/glasswares`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const updateGlassware = (id, data) => fetch(`${API_URL}/glasswares/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const deleteGlassware = (id) => fetch(`${API_URL}/glasswares/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// Plasticwares
export const fetchPlasticwares = () => fetch(`${API_URL}/plasticwares`, { headers: headers() }).then(handleResponse);
export const createPlasticware = (data) => fetch(`${API_URL}/plasticwares`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const updatePlasticware = (id, data) => fetch(`${API_URL}/plasticwares/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const deletePlasticware = (id) => fetch(`${API_URL}/plasticwares/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// Instruments
export const fetchInstruments = () => fetch(`${API_URL}/instruments`, { headers: headers() }).then(handleResponse);
export const createInstrument = (data) => fetch(`${API_URL}/instruments`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const updateInstrument = (id, data) => fetch(`${API_URL}/instruments/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const deleteInstrument = (id) => fetch(`${API_URL}/instruments/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// Users
export const fetchUsers = () => fetch(`${API_URL}/users`, { headers: headers() }).then(handleResponse);
export const createUser = (data) => fetch(`${API_URL}/users`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const updateUser = (id, data) => fetch(`${API_URL}/users/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);
export const deleteUser = (id) => fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse);

// Issued Items
export const fetchIssuedItems = () => fetch(`${API_URL}/issueditems`, { headers: headers() }).then(handleResponse);

// Lab Register
export const createLabRegister = (data) => fetch(`${API_URL}/labregisters`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse);

// Teachers
export const fetchTeachers = () => fetch(`${API_URL}/users/teachers`).then(handleResponse);

export default {
  fetchChemicals,
  createChemical,
  updateChemical,
  deleteChemical,
  fetchGlasswares,
  createGlassware,
  updateGlassware,
  deleteGlassware,
  fetchPlasticwares,
  createPlasticware,
  updatePlasticware,
  deletePlasticware,
  fetchInstruments,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchIssuedItems,
  createLabRegister,
  fetchTeachers,
};
 