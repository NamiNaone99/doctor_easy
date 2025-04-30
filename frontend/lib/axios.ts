import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Ensure this environment variable is set
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  // If you're using CSRF protection, you might need to add the token here
  // For example:
  // const csrfToken = getCookie('csrf_token');
  // if (csrfToken) {
  //   config.headers['X-CSRF-Token'] = csrfToken;
  // }
  return config;
});

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors
      console.error('Unauthorized request - possibly expired session');
      // You might want to trigger logout here
    }
    return Promise.reject(error);
  }
);

export default apiClient;
