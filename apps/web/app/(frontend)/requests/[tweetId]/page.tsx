"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Box, Group, Stack, Text } from "@mantine/core";

import styles from './RequestDetailPage.module.css';
import TweetCard from '@/components/twitter/TweetCard';

import { useActivityByTweetId } from '@/hooks/useActivity';
import { STATUS_LABELS } from "@/constants/constant";
import { SolanaPrice } from "@/components/common/typography/SolanaPrice";

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function RequestDetailPage() {
  const params = useParams();
  const tweetId = Array.isArray(params.tweetId) ? params.tweetId[0] : params.tweetId;

  // Fetch activity by tweetId
  const { data: activity, isLoading } = useActivityByTweetId(tweetId);
  // const { data: solPrice } = getLatestSolanaPrice();

  // Calculate seconds left until activity.end_at (if available, convert UTC to local time)
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (activity?.ended_at) {
      // Parse as UTC and convert to local time
      const utcDate = new Date(activity.ended_at + 'Z'); // ensure UTC
      const localDate = new Date(utcDate.getTime());
      const now = Date.now();

      return Math.max(0, Math.floor((localDate.getTime() - now) / 1000));
    }
    return 0;
  });

  useEffect(() => {
    if (!activity?.ended_at) return;
    // Parse as UTC and convert to local time
    const utcDate = new Date(activity.ended_at + 'Z');
    const localDate = new Date(utcDate.getTime());
    setSecondsLeft(() => {
      const now = Date.now();
      return Math.max(0, Math.floor((localDate.getTime() - now) / 1000));
    });
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activity?.ended_at]);

  // Status enum
  const status = (activity?.payment_status || 'Funded') as keyof typeof STATUS_LABELS;

  // const solAmount = activity?.amount ? Number(activity.amount) / 1_000_000_000 : 0;

  return (
    <Container fluid pt={120} pb={80} px={20}>
      <Box style={{ display: "flex", flexDirection: 'column', justifyContent: "center", maxWidth: 450, margin: "0 auto" }}>
        <Group className={styles.infoRow} gap={32} align="flex-end" style={{ width: "100%", marginBottom: 32 }}>
          <Stack gap={2} className={styles.infoStack} style={{ minWidth: 0, maxWidth: 200, flex: 2 }}>
            <Text className={styles.label}>Request will expire in</Text>
            <Text className={styles.value}>{formatCountdown(secondsLeft)}</Text>
          </Stack>
          <Stack gap={2} className={styles.infoStack} style={{ flex: 1 }}>
            <Text className={styles.label}>Offer</Text>
            {activity?.amount && <SolanaPrice amount={activity?.amount} />}
          </Stack>
          <Stack gap={2} className={styles.infoStack} style={{ flex: 1 }}>
            <Text className={styles.label}>Status</Text>
            <Text className={styles.value}>{STATUS_LABELS[status] || status}</Text>
          </Stack>
        </Group>
        {activity && (
          <TweetCard
            activity={activity}
            hideViewRequest
          />)}
      </Box>
    </Container>
  );
}
