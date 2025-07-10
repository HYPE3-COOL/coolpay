import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';

type GetTransactionsParams = {
    user_id?: string | number | bigint;
    pageSize?: number;
    page?: number;
};


export function useCreateTransaction() {
    return useMutation({
        mutationFn: async (body: any) => {
            const { data } = await api.transaction.createTransaction(body);
            return data;
        },
    });
}

export function getTransactions(params: GetTransactionsParams = {}) {
    return useQuery({
        queryKey: ['transactions', params],
        queryFn: async () => {
            const response = await api.transaction.list(params);
            return { transactions: response.data, meta: response.meta };
        },
    });
}



