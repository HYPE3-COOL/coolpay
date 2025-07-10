'use client';

import React from 'react';
import { Container, ContainerProps, rem, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import ExploreActivityTabView from '@/components/activity/ExploreActivityTabView';

export default function ExplorePage() {
    const tablet_match = useMediaQuery('(max-width: 768px)');
    const BOX_PROPS: ContainerProps = {
        pt: rem(120),
        pb: rem(80),
        px: tablet_match ? rem(20) : rem(20 * 3),
    };

    return (
        <Container fluid {...BOX_PROPS}>
            <Box style={{ display: "flex", flexDirection: 'column', justifyContent: "center", maxWidth: 450, margin: "0 auto" }}>
                <ExploreActivityTabView />
            </Box>
        </Container>
    );
}