import Axios from 'axios';

const axios = Axios.create({
    baseURL: 'http://localhost', // あなたの環境のURL
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true, // 👈 これが CSRF 対策に必須
});

export default axios;