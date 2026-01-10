const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Función helper para hacer peticiones fetch
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    console.error(`🔴 API Error: ${endpoint} - ${error.detail || `HTTP error! status: ${response.status}`}`);
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

    // Si la respuesta está vacía (status 204), retornar null
    if (response.status === 204) {
      console.log(`✅ API Success: ${endpoint} - No Content (204)`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ API Success: ${endpoint} - ${response.status} (${Array.isArray(data) ? data.length + ' items' : typeof data === 'object' ? 'object' : 'data'})`);
    return data;
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
}

// ========== Users API ==========
export const usersApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return request(`/api/users?${queryParams}`);
  },
  getById: (id) => request(`/api/users/${id}`),
  create: (data) => request('/api/users', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/users/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
};

// ========== Objectives API ==========
export const objectivesApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return request(`/api/objectives?${queryParams}`);
  },
  getById: (id) => request(`/api/objectives/${id}`),
  create: (data) => request('/api/objectives', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/objectives/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/api/objectives/${id}`, { method: 'DELETE' }),
};

// ========== Check-ins API ==========
export const checkInsApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return request(`/api/check-ins?${queryParams}`);
  },
  getById: (id) => request(`/api/check-ins/${id}`),
  create: (data) => request('/api/check-ins', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/check-ins/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/api/check-ins/${id}`, { method: 'DELETE' }),
};

// ========== Evaluations API ==========
export const evaluationsApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return request(`/api/evaluations?${queryParams}`);
  },
  getById: (id) => request(`/api/evaluations/${id}`),
  create: (data) => request('/api/evaluations', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/evaluations/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/api/evaluations/${id}`, { method: 'DELETE' }),
};

// ========== Competencies API ==========
export const competenciesApi = {
getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    return request(`/api/competencies/${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => request(`/api/competencies/${id}`),
  create: (data) => request('/api/competencies', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/competencies/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/api/competencies/${id}`, { method: 'DELETE' }),
};

// ========== PDI API ==========
export const pdisApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return request(`/api/pdis?${queryParams}`);
  },
  getById: (id) => request(`/api/pdis/${id}`),
  create: (data) => request('/api/pdis', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/pdis/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/api/pdis/${id}`, { method: 'DELETE' }),
};

// ========== Cycles API ==========
export const cyclesApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return request(`/api/cycles?${queryParams}`);
  },
  getById: (id) => request(`/api/cycles/${id}`),
  create: (data) => request('/api/cycles', { method: 'POST', body: data }),
  update: (id, data) => request(`/api/cycles/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/api/cycles/${id}`, { method: 'DELETE' }),
};

// ========== Dashboard API ==========
export const dashboardApi = {
  getCurrentCycle: () => request('/api/dashboard/current-cycle'),
  getMetrics: (cycleId) => {
    const params = cycleId ? `?cycle_id=${cycleId}` : '';
    return request(`/api/dashboard/metrics${params}`);
  },
  getDepartmentProgress: (cycleId) => {
    const params = cycleId ? `?cycle_id=${cycleId}` : '';
    return request(`/api/dashboard/department-progress${params}`);
  },
  getMonthlyProgress: (cycleId) => {
    const params = cycleId ? `?cycle_id=${cycleId}` : '';
    return request(`/api/dashboard/monthly-progress${params}`);
  },
};

// ========== Settings API ==========
export const settingsApi = {
  get: () => request('/api/settings'),
  update: (data) => request('/api/settings', { method: 'PUT', body: data }),
};


