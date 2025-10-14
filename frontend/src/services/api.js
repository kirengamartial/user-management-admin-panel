import axios from 'axios';
import protobuf from 'protobufjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const createUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/users`, userData);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
  return response.data;
};

export const getUsersPerDay = async () => {
  const response = await axios.get(`${API_BASE_URL}/users/stats`);
  return response.data;
};

export const getPublicKey = async () => {
  const response = await axios.get(`${API_BASE_URL}/users/public-key`);
  return response.data.publicKey;
};

export const exportUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/export`, {
      responseType: 'arraybuffer'
    });

    const root = await protobuf.load('/proto/user.proto');
    const UserList = root.lookupType('UserList');

    const buffer = new Uint8Array(response.data);
    const message = UserList.decode(buffer);
    const object = UserList.toObject(message, {
      longs: String,
      enums: String,
      bytes: String,
    });

    return object;
  } catch (error) {
    console.error('Error fetching protobuf data:', error);
    throw error;
  }
};
