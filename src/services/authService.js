// src/services/authService.js
import API from "../utils/api";

/**
 * Signup a new user (Admin creates users)
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const signup = async (userData) => {
  const res = await API.post("/admin/signup", userData);
  return res.data;
};

/**
 * Login user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
export const login = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};