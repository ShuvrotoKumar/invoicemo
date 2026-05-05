const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const apiRequest = async (endpoint, options = {}) => {
  const { headers, ...rest } = options;
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
    ...rest,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getMe: () => apiRequest('/auth/profile'),
};

export const invoiceApi = {
  create: (invoiceData) => apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/invoices?${query}`);
  },
  getById: (id) => apiRequest(`/invoices/${id}`),
  update: (id, invoiceData) => apiRequest(`/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(invoiceData),
  }),
  delete: (id) => apiRequest(`/invoices/${id}`, {
    method: 'DELETE',
  }),
  send: (id) => apiRequest(`/invoices/${id}/send`, {
    method: 'POST',
  }),
  getAnalytics: () => apiRequest('/invoices/analytics'),
};
