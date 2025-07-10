// src/api/userService.ts

import apiClient from './apiClient';

export async function getMe() {
    const res = await apiClient.get('/auth/me', {
        headers: { 'Requires-Auth': true },
    });
    return res.data;
}

export async function list(params: Record<string, any> = {}) {
    const res = await apiClient.get('/users', { params });
    return res.data;
}

export async function getByUsername(username: string) {
    const res = await apiClient.get(`/creators/${username}`);
    return res.data;
}