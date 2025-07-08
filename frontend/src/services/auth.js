import axios from "axios";

// Replace this with your actual backend base URL
const BASE_URL = "http://localhost:8000";

export const registerUser = async (data) => {
  return await axios.post(`${BASE_URL}/register`, data);
};

export const loginUser = async (data) => {
  return await axios.post(`${BASE_URL}/login`, data);
};