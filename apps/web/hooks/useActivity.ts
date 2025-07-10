import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';


type GetActivitiesParams = {
    user_id?: string | number | bigint;
    creator_id?: string | number | bigint;
    x_tweet_id?: string | number | bigint;
    status?: string;
    payment_status?: string;
    is_responsed?: boolean;
    is_live?: boolean;
    pageSize?: number;
    page?: number;
};

export function getActivities(params: GetActivitiesParams = {}) {
    return useQuery({
        queryKey: ['activities', params],
        queryFn: async () => {
            const response = await api.activity.list(params);
            return { activities: response.data, meta: response.meta };
        }
    }); 
}


export function getCreatorActivities(twitter_id?: string | number | bigint) {
    const enabled = !!twitter_id;
    return useQuery({
        queryKey: ['activities', { creator_id: twitter_id }],
        queryFn: async () => {
            const response = await api.activity.list({ creator_id: twitter_id });
            return response.data;
        },
        enabled,
    });
}

export function useActivityByTweetId(x_tweet_id: string | number | bigint) {
    return useQuery({
        queryKey: ['activity', x_tweet_id],
        queryFn: async () => {
            const response = await api.activity.getByTweetId(x_tweet_id);
            return response.data;
        },
        enabled: !!x_tweet_id,
    });
}