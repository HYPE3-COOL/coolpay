import React, { useEffect, useState } from 'react'

import { Card, Text, Group, Stack, Box } from '@mantine/core'
import classes from './RecordCard.module.css'

import { STATUS_LABELS } from '@/constants/constant';

import { ActivityFull } from '@/db/schema';
import { showTweetExplorer } from '@/utils/string';

interface RecordCardProps {
    activity: ActivityFull;
    isSender?: boolean;
}

const RecordCard: React.FC<RecordCardProps> = ({ activity, isSender = true }) => {

    // Lookup user and creator info using hooks
    const tweet = activity?.xTweet; // Use the xTweet directly from activity

    // Fallbacks if user/creator not loaded
    const avatar = activity.user?.image || "";
    const creatorName = activity.creator?.username || '';
    const tweetId = activity.x_tweet_id?.toString?.() ?? String(activity.x_tweet_id);

    // Timer logic (formatCountdown)
    function formatCountdown(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    }

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

    const payment = activity.amount ? Number(activity.amount) / 1_000_000_000 : 0;
    const status = (activity?.payment_status || 'Funded') as keyof typeof STATUS_LABELS;
    const tweetPublishedAt = tweet?.created_at ? new Date(tweet?.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

    return (
        <Card classNames={classes} id={`record-card-${activity.id}`}>
            <Stack>
                <Group justify='space-between' align='center'>
                    <Group gap="xs">
                        <img src={avatar} style={{ width: '24px', height: '24px', aspectRatio: '1 / 1', borderRadius: '50%' }} alt="avatar" />
                        {isSender ? (
                            <div className={classes.title}>
                                Sent to <span>@{creatorName}</span>
                            </div>
                        ) : (
                            <div className={classes.title}>
                                Received by <span>@{creatorName}</span>
                            </div>
                        )}
                    </Group>
                    <Text
                        fz="xs"
                        className={classes.viewRequest}
                        component="a"
                        href={showTweetExplorer(tweetId)}
                        target='_blank'
                    >
                        View request <span className="icon-twitter" />
                    </Text>
                </Group>
                <Text c="#fff" fz="sm" fw={500}>
                    {tweet?.text}
                </Text>
                <Group justify='space-between' align='center' className={classes.footerRow}>
                    <Text className={classes.dateText}>
                        {tweetPublishedAt}
                    </Text>
                    <Group gap={18} className={classes.infoGroup}>
                        <span className={classes.infoItem}>
                            <span className={classes.infoIcon + ' icon-timer'} />
                            <span className={classes.infoValue}>{formatCountdown(secondsLeft)}</span>
                        </span>
                        <span className={classes.infoItem}>
                            <span className={classes.infoIcon + ' icon-tag'} />
                            <span className={classes.infoValue}>{payment} SOL</span>
                        </span>
                        <span className={classes.infoItem}>
                            <span className={classes.infoIcon + ' icon-status'} />
                            <span className={classes.infoValue}>{STATUS_LABELS[status] || status}</span>
                        </span>
                    </Group>
                </Group>
                
                {activity.first_reply_tweet_id && activity.replyTweet && (
                    <Card className={classes.replyCard}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
                            <img
                                src={avatar}
                                style={{
                                    width: 24,
                                    height: 24,
                                    aspectRatio: '1 / 1',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    flexShrink: 0,
                                }}
                                alt="avatar"
                            />
                            <Text c="#fff" fz="xs" fw={500} style={{ whiteSpace: 'pre-line' }} mt={4}>
                                {activity.replyTweet?.text}
                            </Text>
                        </div>
                    </Card>
                )}
            </Stack>
        </Card>
    )
}

export default RecordCard