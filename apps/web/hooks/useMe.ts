import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export function useMe() {
    const { data, isPending, error, isLoading, refetch } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            const response = await api.user.getMe();
            return response.data;
        },
    });

    return { data, isPending, isLoading, error, refetch }
}



