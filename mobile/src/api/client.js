import axios from 'axios';
import { getToken, clearToken } from '../storage/token';

// Хөгжүүлэлтийн үед өөрийн компьютерийн локал IP хаягаар солино уу (localhost биш —
// жинхэнэ утас/emulator-с "localhost" гэдэг нь тухайн төхөөрөмж өөрийгөө хэлнэ, компьютерийг биш).
// Жишээ: "http://192.168.1.50:5000/api"
const DEV_BASE_URL = 'http://YOUR_COMPUTER_LOCAL_IP:5000/api';
const PROD_BASE_URL = 'https://api.luma.app/api';

const api = axios.create({
  baseURL: __DEV__ ? DEV_BASE_URL : PROD_BASE_URL,
});

// ЧУХАЛ ЗАСВАР: өмнөх хувилбарт энэ interceptor байхгүй байсан тул
// нэвтэрсний дараах БҮХ хүсэлт (profile, discovery, swipe, matches, messages) 401 буцаадаг байсан.
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token хүчингүй болсон үед (401) хадгалсан token-ийг цэвэрлэнэ —
// ингэснээр дараагийн дэлгэц дээр дахин нэвтрэх шаардлагатайг илрүүлж болно
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
    }
    return Promise.reject(error);
  }
);

export default api;
