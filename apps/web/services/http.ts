import axios from 'axios';

export const http = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api'
      : process.env.NEXT_PUBLIC_API_URL,
});
