import axios from 'axios';

// Khởi tạo một Axios instance với cấu hình mặc định
const api = axios.create({
  // Trình duyệt dùng API cùng origin; server-side proxy chịu trách nhiệm gọi Laravel.
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Bật withCredentials nếu Laravel của bạn sử dụng Sanctum cookie-based auth
  // withCredentials: true, 
});

// Interceptor cho Request (Trước khi request được gửi đi)
api.interceptors.request.use(
  (config) => {
    // Nếu bạn dùng JWT token, bạn có thể lấy token từ localStorage và gắn vào header ở đây
    // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response (Sau khi nhận được phản hồi từ server)
api.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu trực tiếp nếu thành công
    return response;
  },
  (error) => {
    // Xử lý các lỗi chung ở đây (ví dụ: Token hết hạn, không có quyền...)
    if (error.response?.status === 401) {
      // Có thể tự động đăng xuất hoặc chuyển hướng về trang /login
      console.error('Unauthorized! Please login again.');
      // if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
