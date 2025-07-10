'use client';

import React from 'react';
import { Tabs } from '@mantine/core';
import styles from './UserActivityTabView.module.css';
import RecordCard from '@/components/common/cards/RecordCard';
import ActivityList from './ActivityList';

type UserActivityTabViewProps = {
    twitterId: bigint | string;
}

const UserActivityTabView = ({ twitterId }: UserActivityTabViewProps) => {
    return (
        <Tabs defaultValue="sent" classNames={styles}>
            <Tabs.List>
                <Tabs.Tab value="sent">Sent</Tabs.Tab>
                <Tabs.Tab value="received">Received</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="sent">
                <ActivityList
                    user_id={twitterId}
                    renderItem={(activity, idx) => (
                        <RecordCard key={activity.id || idx} activity={activity} isSender={true} />
                    )}
                />
            </Tabs.Panel>
            <Tabs.Panel value="received">
                <ActivityList
                    creator_id={twitterId}
                    renderItem={(activity, idx) => (
                        <RecordCard key={activity.id || idx} activity={activity} isSender={false} />
                    )}
                />
            </Tabs.Panel>
        </Tabs>
    )
}

export default UserActivityTabView