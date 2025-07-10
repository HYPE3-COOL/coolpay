import apiClient from './apiClient';

export async function createTransaction(body: any) {
    const res = await apiClient.post('/transactions', body, {
        headers: { 'Requires-Auth': true },
    });
    return res.data;
}

export async function list(params: Record<string, any> = {}) {
    const res = await apiClient.get(`/auth/transactions`, {
        params,
        headers: { 'Requires-Auth': true },
    });
    return res.data;
}
