import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backend-6grl.onrender.com'
});

export default API;