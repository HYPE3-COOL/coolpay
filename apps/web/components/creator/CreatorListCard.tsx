import React from "react";
import { Box, Card, Group, Stack, Text } from "@mantine/core";
import { formatRequests, formatCost, formatPercent } from "@/utils/userCardFormat";
import { useRouter } from 'next/navigation';
import styles from "./CreatorListCard.module.css";

import { UserSelect } from "@/db/schema"
import { SolanaPrice } from "../common/typography/SolanaPrice";

export interface CreatorListCardProps {
    user: UserSelect;
}

export const CreatorListCard = ({
    user
}: CreatorListCardProps) => {
    const router = useRouter();
    const percent = Math.round(user.success_rate * 100) || 0;
    const twitter = user.twitter as any;
    
    return (
        <Card
            id={`creator-card-${user.id}`}
            className={styles.card}
            shadow="sm"
            padding={15}
            onClick={() => router.push(`/creators/${user.username.replace(/^@/, '')}`)}
            style={{ cursor: 'pointer' }}
        >
            <Group align="start" gap={14}>
                <Box className={styles.avatar} mr={0} style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={user.image}
                        alt="avatar"
                        width="100%"
                        height="100%"
                    />
                </Box>
                <Stack gap={2} justify="center" style={{ height: '100%', justifyContent: 'center' }}>
                    <Text className={styles.name} fz="h2">{twitter.name || ''}</Text>
                    <Text fz="h6" c="#03e1ff" fw="normal">@{user.username}</Text>
                </Stack>
            </Group>

            <Group mt={18} gap={0} style={{ width: '100%' }}>
                <Stack
                    gap={4}
                    style={{ flex: 2, textAlign: 'left' }}
                >
                    <Text fz="h6" c="rgba(255, 255, 255, 0.50)">Requests</Text>
                    <Text c="#fff" fz="h3" fw={500}>{formatRequests(user.no_of_requests ?? 0)}</Text>
                </Stack>

                <Stack
                    gap={4}
                    style={{ flex: 5, textAlign: 'left' }}
                >
                    <Text fz="h6" c="rgba(255, 255, 255, 0.50)">Average cost/request</Text>
                    {user.avg_cost && <SolanaPrice amount={user.avg_cost ?? 0} />}
                </Stack>

                <Stack
                    gap={4}
                    style={{ flex: 3, textAlign: 'left' }}
                >
                    <Text fz="h6" c="rgba(255, 255, 255, 0.50)"> Response Rate</Text>
                    <Text c="#fff" fz="h3" fw={500}>{formatPercent(percent)}</Text>
                </Stack>
            </Group>
        </Card>

    );
};
