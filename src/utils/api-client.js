import config from 'src/config';

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${config.BASE_URL}${endpoint}`;

  const token = localStorage.getItem('authToken');

  const defaultHeaders = {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  const config_options = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Default GET requests to no-store to avoid stale data issues
  if (!options.method || options.method.toUpperCase() === 'GET') {
    config_options.cache = 'no-store';
  }

  const response = await fetch(url, config_options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API Request failed');
  }

  return response.json();
};
