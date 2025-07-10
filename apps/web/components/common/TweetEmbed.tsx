"use client";
import React from 'react';
import { Tweet } from 'react-tweet';

interface TweetEmbedProps {
  tweetId: string;
  dark?: boolean;
  className?: string;
}

const TweetEmbed: React.FC<TweetEmbedProps> = ({ tweetId, dark = true, className }) => {
  return (
    <div className={className} data-theme={dark ? 'dark' : 'light'}>
        {/* theme={dark ? 'dark' : 'light'} */}
      <Tweet id={tweetId}  />
    </div>
  );
};

export default TweetEmbed;
