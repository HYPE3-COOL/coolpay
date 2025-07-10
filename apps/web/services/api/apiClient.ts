import axios from 'axios';
import { getAccessToken } from '@privy-io/react-auth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

const apiClient = axios.create({
    baseURL: apiUrl,
});

apiClient.interceptors.request.use(
    async (config) => {
        const access_token = await getAccessToken();

        // Check if the request requires an access token
        if (config.headers['Requires-Auth']) {
            if (access_token) {
                config.headers.Authorization = `Bearer ${access_token}`;
            } else {
                console.error('Failed to retrieve access token');
            }
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error.message);
        return Promise.reject(error);
    },
);

export default apiClient;