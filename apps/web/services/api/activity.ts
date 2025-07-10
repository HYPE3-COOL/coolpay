import apiClient from './apiClient';

export async function list(params: Record<string, any> = {}) {
    const res = await apiClient.get('/activities', { params });
    return res.data;
}

export async function getByTweetId(x_tweet_id: string | number | bigint) {
    const res = await apiClient.get(`/activities/${x_tweet_id}`);
    return res.data;
}

