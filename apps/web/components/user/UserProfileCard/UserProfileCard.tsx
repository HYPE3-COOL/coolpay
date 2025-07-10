import React from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';

import TwitterButton from '@/components/common/buttons/TwitterButton';

import styles from './UserProfileCard.module.css';
import { UserSelect as OriginalUserSelect } from '@/db/schema';

type UserSelect = OriginalUserSelect & {
    twitter?: {
        name?: string;
        // add other twitter fields if needed
    };
};

interface UserProfileCardProps {
    user: UserSelect
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => (
    <Group align="center" justify="space-between" w="100%" id="user-profile-card" mb={20}>
        <Group align="center" gap="md">
            <Box
                className={styles.avatar}
                style={{
                    background: `url(${user?.image || '/assets/images/default-avatar.png'}) lightgray 50% / cover no-repeat`,
                }}
            />
            <Stack gap={0} style={{ minWidth: 0 }}>
                <Text c="white" fz="xxl" fw={500}>
                    {user.twitter?.name || ""}
                </Text>
                <Text c="#03E1FF" fz="xs" fw={400}>
                    @{user.username || "Display Name"}
                </Text>
            </Stack>
        </Group>
        <TwitterButton username={user.username} />
    </Group>
);
