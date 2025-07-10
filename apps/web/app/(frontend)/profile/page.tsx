'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Container, ContainerProps, Group, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import styles from './ProfilePage.module.css';

import { useMe } from '@/hooks/useMe';

import { UserProfileCard } from '@/components/user/UserProfileCard/UserProfileCard';
import { UserWalletCard } from '@/components/user/UserWalletCard/UserWalletCard';
import { usePrivy } from '@privy-io/react-auth';
import UserActivityTabView from '@/components/activity/UserActivityTabView';

export default function ProfilePage() {
  const router = useRouter();
  const tablet_match = useMediaQuery('(max-width: 768px)');
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    if (!ready || !authenticated) {
      router.replace('/')
    }
  }, [ready, authenticated]);

  const { data: authUser } = useMe();
  const BOX_PROPS: ContainerProps = {
    pt: rem(120),
    pb: rem(80),
    px: tablet_match ? rem(20) : rem(20 * 3),
  };

  return (
    <Container fluid {...BOX_PROPS}>
      <Group className={styles.container}>
        {authUser && <UserProfileCard user={authUser} />}
        {authUser && <UserWalletCard />}
        {(authenticated && authUser?.twitter_id) && <UserActivityTabView twitterId={authUser?.twitter_id} />}
      </Group>
    </Container>
  );
}