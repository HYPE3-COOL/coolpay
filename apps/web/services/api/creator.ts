import apiClient from './apiClient';

export async function getTweetsByUsername(username: string) {
    const res = await apiClient.get(`/creators/${username}/tweets`);
    return res.data;
}

export async function list(params: Record<string, any> = {}) {
    const res = await apiClient.get('/creators', { params });
    return res.data;
}

export async function getByUsername(username: string) {
    const res = await apiClient.get(`/creators/${username}`);
    return res.data;
}

export async function getByTwitterId(twitter_id: string) {
    const res = await apiClient.get(`/creators/twitter/${twitter_id}`);
    return res.data;
}