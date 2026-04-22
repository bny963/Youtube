import Axios from 'axios';

const axios = Axios.create({
    baseURL: 'http://localhost', // LaravelのURL
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true,
});

// リクエスト送信時にトークンがあれば載せる
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

export default axios;