import React, { useState } from 'react'
import { Flex, Stack } from '@mantine/core'

import { LoadMoreButton } from '@/components/common/buttons';

import { ActivityFull } from "@/db/schema"
import { PAGE_SIZE } from '@/constants/constant';
import { getActivities } from '@/hooks/useActivity';
import { ActivityStatus } from '@/interfaces';

type ActivityListProps = {
    user_id?: string | number | bigint;
    creator_id?: string | number | bigint;
    is_live?: boolean;
    renderItem: (activity: ActivityFull, idx: number) => React.ReactNode;
}

const ActivityList = ({ user_id, creator_id, is_live, renderItem }: ActivityListProps) => {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<ActivityFull[]>([]);
    const { data, isLoading } = getActivities({ user_id, creator_id, is_live, pageSize: PAGE_SIZE, page });
    // const activities = data?.activities ?? [];
    const activities: ActivityFull[] = (data?.activities ?? []).filter(
        (a: ActivityFull) => a.status !== ActivityStatus.Failed && a.status !== ActivityStatus.Pending
    );
    const meta = data?.meta;

    React.useEffect(() => {
        if (activities && activities.length > 0) {
            setItems((prev) => page === 1 ? activities : [...prev, ...activities]);
        }
    }, [activities, page]);



    const hasMore = meta ? page < meta.pageCount : false;

    return (
        <>
            <Stack gap={25}>
                {isLoading && <div>Loading...</div>}
                {items.length > 0
                    ? items.map((item, idx) => renderItem(item, idx))
                    : !isLoading && <div>No record found.</div>
                }
            </Stack>
            {hasMore && (
                <Flex justify="center" pt={54}>
                    <LoadMoreButton onClick={() => setPage((p) => p + 1)} />
                </Flex>
            )}
        </>
    )
}

export default ActivityList