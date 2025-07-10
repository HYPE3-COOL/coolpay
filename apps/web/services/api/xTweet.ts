import apiClient from './apiClient';

export async function getById(id: string) {
    const res = await apiClient.get(`/xTweets/${id}`);
    return res.data;
}

// export async function getReplies(tweetId: string) {
//     const res = await apiClient.get(`/xTweets/${tweetId}/replies`);
//     return res.data;
// }