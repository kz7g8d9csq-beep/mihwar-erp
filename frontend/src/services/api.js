import axios from 'axios';

const API = axios.create({
  baseURL: 'https://mihwar-backend.onrender.com'
});

export default API;