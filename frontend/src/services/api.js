import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 120000,
});

export const runAnalysis = async () => {
  const response = await api.get("/analyze");
  return response.data;
};

export default api;
