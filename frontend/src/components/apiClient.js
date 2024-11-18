  // src/services/apiClient.js
  import axios from 'axios';

  const apiClient = axios.create({
    baseURL: 'http://localhost:5001',
  });

  export default apiClient;