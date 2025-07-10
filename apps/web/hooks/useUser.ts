import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
// import { mapUserApiResultToIUser } from '@/interfaces/user.interface';


export function useCreators() {
    const { data, isPending, error, isLoading, refetch } = useQuery({
        queryKey: ['creators'],
        queryFn: async () => {
            // Use the user API module to fetch creators
            const response = await api.user.list({ is_creator: 1 });
            return response.data;
            // If your API returns { data: users, meta }, map as needed
            // return response.data.map(mapUserApiResultToIUser);
        },
    });

    return { data, isPending, isLoading, error, refetch };
}

export function useCreatorByUsername(username: string) {
    return useQuery({
        queryKey: ['creator', username],
        queryFn: async () => {
            if (!username) return undefined;
            const response = await api.user.getByUsername(username);
            return response.data;
            // API returns { data }, so mapUserApiResultToIUser
            // return mapUserApiResultToIUser(response.data);
        },
        enabled: !!username,
    });
}

// export function useCreatorTweetsByUsername(username: string) {
//     return useQuery({
//         queryKey: ['creator-tweets', username],
//         queryFn: async () => {
//             if (!username) return [];
//             const response = await api.creator.getTweetsByUsername(username);
//             // API returns { data: [...] }
//             return response.data;
//         },
//         enabled: !!username,
//     });
// }
