import axios from "axios";

const ML_API_URL = import.meta.env.VITE_ML_API_URL;

export const predictCrop = async (data) => {
  const response = await axios.post(`${ML_API_URL}/predict-crop`, data);
  return response.data;
};

export const predictPrice = async (data) => {
  const response = await axios.post(`${ML_API_URL}/predict-price`, data);
  return response.data;
};

export const detectDisease = async (formData) => {
  const response = await axios.post(`${ML_API_URL}/detect-disease`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
