import React from "react";
import { Paper, Group, Box, Text } from "@mantine/core";
import TweetEmbed from "./TweetEmbed";
import styles from "./TweetCard.module.css";
import { useRouter } from 'next/navigation';

import { ActivityFull, UserSelect } from "@/db/schema";

interface TweetCardProps {
  activity: ActivityFull;
  hideViewRequest?: boolean;
}

const TweetCard: React.FC<TweetCardProps> = ({
  activity,
  hideViewRequest = false,
}) => {
  const router = useRouter();
  const tweetId = activity.x_tweet_id?.toString?.() ?? String(activity.x_tweet_id);

  return (
    <Paper className={styles.tweetCard} withBorder>
      <Group justify="space-between" align="center" className={styles.header}>
        <Group gap={8} align="center" style={{ flex: 1 }}>
          <div
            className={styles.avatar}
            style={{ backgroundImage: `url(${activity.user?.image})` }}
          />
          <Text fz="xs" className={styles.desc}>
            {activity.user.username ? `@${activity.user.username} ` : ""}
            <span>sent a request to </span>
            {activity.creator.username ? `${activity.creator.username}` : ""}
          </Text>
        </Group>
        {!hideViewRequest && (
          <Text
            fz="xs"
            className={styles.viewRequest}
            component="a"
            href={`/requests/${tweetId}`}
            onClick={e => {
              e.preventDefault();
              router.push(`/requests/${tweetId}`);
            }}
          >
            View request
          </Text>
        )}
      </Group>
      <Box className={styles.tweetContent}>
        <TweetEmbed tweetId={tweetId} />
      </Box>
    </Paper>
  );
};

export default TweetCard;