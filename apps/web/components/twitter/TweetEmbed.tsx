"use client";
import React from 'react';
import { Tweet } from 'react-tweet';
import styles from "./TweetEmbed.module.css";

interface TweetEmbedProps {
  tweetId: string;
  dark?: boolean;
}

const TweetEmbed: React.FC<TweetEmbedProps> = ({ tweetId, dark = true }) => {
  return (
    <div className={styles.card} data-theme={dark ? 'dark' : 'light'} >
        {/* theme={dark ? 'dark' : 'light'} */}
      <Tweet id={tweetId}  />
    </div>
  );
};

export default TweetEmbed;
