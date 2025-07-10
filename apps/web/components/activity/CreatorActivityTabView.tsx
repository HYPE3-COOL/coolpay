'use client';

import React, { useState, useEffect } from 'react';
import { Group, Tabs } from '@mantine/core';
import styles from './CreatorActivityTabView.module.css';

import ActivityList from './ActivityList';
import TweetCard from '../twitter/TweetCard';
import LiveCircleIcon from '../common/icons/LiveCircleIcon';
import { getActivities } from '@/hooks/useActivity';
import { PAGE_SIZE } from '@/constants/constant';

type CreatorActivityTabViewProps = {
    twitterId: bigint | string;
}

const CreatorActivityTabView = ({ twitterId }: CreatorActivityTabViewProps) => {

    const [tab, setTab] = useState<'live' | 'ended'>('live');

    const { data, isLoading } = getActivities({ creator_id: twitterId, is_live: true, pageSize: PAGE_SIZE, page: 1 });
    const activities = data?.activities ?? [];

    useEffect(() => {
        if (!isLoading && activities.length === 0) {
            setTab('ended');
        }
    }, [isLoading, activities]);

    return (
        <Tabs value={tab}
            onChange={setTab as any}
            classNames={styles}>
            <Tabs.List>
                <Tabs.Tab value="live">
                    <Group gap={0}>
                        <LiveCircleIcon />
                        Live
                    </Group>
                </Tabs.Tab>
                <Tabs.Tab value="ended">Ended</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="live">
                <ActivityList
                    creator_id={twitterId}
                    is_live={true}
                    renderItem={(activity, idx) => (
                        <TweetCard key={activity.id || idx} activity={activity} />
                    )}
                />
            </Tabs.Panel>
            <Tabs.Panel value="ended">
                <ActivityList
                    creator_id={twitterId}
                    is_live={false}
                    renderItem={(activity, idx) => (
                        <TweetCard key={activity.id || idx} activity={activity} />
                    )}
                />
            </Tabs.Panel>
        </Tabs>
    )
}

export default CreatorActivityTabView