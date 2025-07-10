"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, Group, Stack, Box, Text, Container, rem, ContainerProps, useMantineTheme } from '@mantine/core';

import { useMediaQuery } from '@mantine/hooks';
import { useCreatorByUsername } from '@/hooks/useUser';

import SendRequestButton from '@/components/twitter/SendRequestButton';
import TwitterButton from '@/components/common/buttons/TwitterButton';
import { SolanaPrice } from '@/components/common/typography/SolanaPrice';
import CreatorActivityTabView from '@/components/activity/CreatorActivityTabView';
import { formatRequests, formatPercent } from '@/utils/string';
import styles from '../CreatorPage.module.css';

export default function CreatorDetailPage() {
    const params = useParams();
    const theme = useMantineTheme();
    const username = Array.isArray(params.username) ? params.username[0] : params.username;
    const { data: creator, isLoading, error } = useCreatorByUsername(username);

    const tablet_match = useMediaQuery('(max-width: 768px)');
    const BOX_PROPS: ContainerProps = {
        pt: rem(120),
        pb: rem(80),
        px: tablet_match ? rem(20) : rem(20 * 3),
    };

    if (isLoading) {
        return <Container><Text>Loading...</Text></Container>;
    }
    if (error || !creator) {
        return <Container><Text>User not found</Text></Container>;
    }

    return (
        <Container fluid {...BOX_PROPS}>
            <Box style={{ display: "flex", flexDirection: 'column', justifyContent: "center", maxWidth: 450, margin: "0 auto" }}>
                <Card
                    shadow="sm"
                    padding={0}
                    mb={46}
                    style={{
                        minWidth: 320,
                        maxWidth: 600,
                        backdropFilter: "blur(2px)",
                    }}
                >
                    <Group align="stretch" gap={0}>
                        <Box style={{ minWidth: 120, maxWidth: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img
                                src={creator.image || creator?.twitter?.profilePictureUrl}
                                className={styles.avatar}
                                alt="avatar"
                            />
                        </Box>
                        <Stack justify="space-between" style={{ flex: 1, paddingLeft: 27, paddingTop: 8, paddingBottom: 8 }}>
                            <Group align="center" justify="space-between" w="100%">
                                <Box>
                                    <Text fz="xxl" fw={700} c="#fff" style={{ lineHeight: 1 }}>{creator.twitter?.name || creator.username}</Text>
                                    <Text fz="xs" c="#03e1ff" fw={500} style={{ marginTop: 2 }}>@{creator.username}</Text>
                                </Box>
                                <TwitterButton username={creator?.twitter?.username} />
                            </Group>
                            <Group gap={16} align="flex-end" style={{ width: "100%" }}>
                                <Stack gap={2} style={{ textAlign: "left" }}>
                                    <Text fz={11} c={theme.colors.gray[0]}>Requests</Text>
                                    <Text c="#fff" fz="md" fw={600}>{formatRequests(creator.no_of_requests ?? 0)}</Text>
                                </Stack>
                                <Stack gap={2} style={{ textAlign: "left" }}>
                                    <Text fz={11} c={theme.colors.gray[0]}>Average cost/request</Text>
                                    {creator?.avg_cost && <SolanaPrice amount={creator.avg_cost ?? 0} fw={600} />}
                                </Stack>
                                <Stack gap={2} style={{ textAlign: "left" }}>
                                    <Text fz={11} c={theme.colors.gray[0]}>Response Rate</Text>
                                    <Text c="#fff" fz="md" fw={600}>{formatPercent(typeof creator.responseRate === 'number' ? Math.round(creator.responseRate * 100) : 0)}</Text>
                                </Stack>
                            </Group>
                        </Stack>

                    </Group>
                </Card>
                <SendRequestButton recipient={creator?.twitter?.username} />
                {creator?.twitter_id && <CreatorActivityTabView twitterId={creator?.twitter_id} />}
            </Box>
        </Container>
    );
}
