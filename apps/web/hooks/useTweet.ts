import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function getTweet(twitterId: string) {
    return useQuery({
        queryKey: ['tweet', twitterId],
        queryFn: async () => {
            if (!twitterId) return undefined;
            const response = await api.xTweet.getById(twitterId);
            return response.data;
        },
        enabled: !!twitterId,
    });
}

// export function useTweetReplies(tweetId: string | number | bigint, creatorId: string | number | bigint) {
//     return useQuery({
//         queryKey: ['tweet-replies', tweetId, creatorId],
//         queryFn: async () => {
//             if (!tweetId || !creatorId) return [];
//             const response = await api.xTweet.getReplies(String(tweetId));
//             // Filter out replies where author_id === creatorId
//             return (response.data || []).filter((reply: any) => String(reply.author_id) === String(creatorId));
//         },
//         enabled: !!tweetId && !!creatorId,
//     });
// }
