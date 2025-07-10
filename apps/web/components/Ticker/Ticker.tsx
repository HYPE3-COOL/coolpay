'use client';
import React, { useRef, useState } from 'react';
import styles from './Ticker.module.css';

const TICKER_ITEMS = [
    '@hypegalonsol has paid @aeyakovenko 500 USDC',
    '@hndrsndry has paid @gork 10 USDC',
    '@talktoai has paid @sama 150 USDC',
    '@hypegalonsol has paid @cz_binance 123 USDC',
    '@ShDinnbier has paid @ye 800 USDC',
    '@mona_painting has paid @talorswift 150 USDC',
    '@talktoai has paid @sama 150 USDC',
];

const Ticker: React.FC = () => {
    const [paused, setPaused] = useState(false);
    const tickerRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        setPaused((prev) => !prev);
    };

    return (
        <div className={styles.tickerWrapper} onClick={handleClick}>
            <div
                className={styles.tickerInner}
                ref={tickerRef}
                style={{
                    animationPlayState: paused ? 'paused' : 'running',
                }}
            >
                {TICKER_ITEMS.map((item, idx) => (
                    <span className={styles.tickerItem} key={idx}>{item}</span>
                ))}
                {/* Duplicate for seamless loop */}
                {TICKER_ITEMS.map((item, idx) => (
                    <span className={styles.tickerItem} key={TICKER_ITEMS.length + idx}>{item}</span>
                ))}
            </div>
        </div>
    );
};

export default Ticker;
