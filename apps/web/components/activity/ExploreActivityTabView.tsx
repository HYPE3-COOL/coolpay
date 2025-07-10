'use client';

import React, { useState, useEffect } from 'react';
import { Group, Tabs } from '@mantine/core';
import styles from './ExploreActivityTabView.module.css';

import ActivityList from './ActivityList';
import TweetCard from '../twitter/TweetCard';
import LiveCircleIcon from '../common/icons/LiveCircleIcon';
import { getActivities } from '@/hooks/useActivity';
import { PAGE_SIZE } from '@/constants/constant';



const ExploreActivityTabView = () => {

    const [tab, setTab] = useState<'live' | 'ended'>('live');

    const { data, isLoading } = getActivities({ is_live: true, pageSize: PAGE_SIZE, page: 1 });
    const activities = data?.activities ?? [];
    
    useEffect(() => {
        if (!isLoading && activities.length === 0) {
            setTab('ended');
        }
    }, [isLoading, activities]);

    return (
        <Tabs
            value={tab}
            onChange={setTab as any}
            classNames={styles}>
            <Tabs.List justify="center">
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
                    is_live={true}
                    renderItem={(activity, idx) => (
                        <TweetCard key={activity.id || idx} activity={activity} />
                    )}
                />
            </Tabs.Panel>
            
            <Tabs.Panel value="ended">
                <ActivityList
                    is_live={false}
                    renderItem={(activity, idx) => (
                        <TweetCard key={activity.id || idx} activity={activity} />
                    )}
                />
            </Tabs.Panel>
        </Tabs>
    )
}

export default ExploreActivityTabView