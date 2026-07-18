import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 120000,
});

export async function uploadForDetection(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/post/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export default api;
