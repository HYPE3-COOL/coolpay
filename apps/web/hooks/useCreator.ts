import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

import { PAGE_SIZE } from '@/constants/constant';

export interface GetCreatorsQueryParams {
    pageSize?: number;
    page?: number;
}

export function getCreators(params: GetCreatorsQueryParams = {
    pageSize: PAGE_SIZE,
    page: 1,
}) {
    return useQuery({
        queryKey: ['creators', params],
        queryFn: async () => {
            const response = await api.creator.list(params);
            return { creators: response.data, meta: response.meta };
        },
    });
}
