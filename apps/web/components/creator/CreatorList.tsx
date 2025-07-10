'use client';

import React, { useState } from 'react'
import { Flex, Container } from '@mantine/core'

import { CreatorListCard } from './CreatorListCard';
import { UsageCard } from '../user/UsageCard/UsageCard';
import { LoadMoreButton } from '@/components/common/buttons';

import { getCreators } from '@/hooks/useCreator';
import { UserSelect } from "@/db/schema"
import { PAGE_SIZE } from '@/constants/constant';


const CreatorList = () => {
    const [page, setPage] = useState(1);
    const [allCreators, setAllCreators] = useState<UserSelect[]>([]);
    const { data, isLoading } = getCreators({ pageSize: PAGE_SIZE, page });
    const creators = data?.creators as UserSelect[] ?? [];
    const meta = data?.meta;

    React.useEffect(() => {
        if (creators && creators.length > 0) {
            setAllCreators((prev) => page === 1 ? creators : [...prev, ...creators]);
        }
    }, [creators, page]);

    const hasMore = meta ? page < meta.pageCount : false;

    return (
        <>
            <Container size={1440} px={0} style={{ display: 'flex', justifyContent: 'center' }}>
                <Flex
                    wrap="wrap"
                    justify="center"
                    gap={{ base: 20, lg: 50 }}
                    style={{ width: '100%', maxWidth: 1440, margin: '0 auto' }}
                >
                    <Flex justify="center" style={{ width: '100%', maxWidth: 340, margin: 6 }}>
                        <UsageCard />
                    </Flex>
                    {allCreators.map((user: UserSelect, idx: number) => {
                        return (
                            <Flex justify="center" key={user.username + idx} style={{ width: '100%', maxWidth: 340, margin: 6 }}>
                                <CreatorListCard user={user} />
                            </Flex>
                        );
                    })}
                </Flex>
            </Container>
            {hasMore && (
                <Flex justify="center" pt={54}>
                    <LoadMoreButton onClick={() => setPage((p) => p + 1)} />
                </Flex>
            )}
        </>
    )
}

export default CreatorList