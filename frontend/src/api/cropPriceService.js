// frontend/src/api/cropPriceService.js
import api from "./axiosInstance";
export const getCropPrices   = async (params = {}) => { const { data } = await api.get("/prices",      { params }); return data; };
export const addCropPrice    = async (body)         => { const { data } = await api.post("/prices",     body);       return data; };
export const updateCropPrice = async (id, body)     => { const { data } = await api.put(`/prices/${id}`, body);      return data; };
