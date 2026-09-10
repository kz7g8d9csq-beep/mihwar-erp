import axios from 'axios';

const API = axios.create({
  baseURL: 'https://RENDER_BACKEND_URL_HERE.onrender.com'
});

export default API;
