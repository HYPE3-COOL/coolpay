import React from 'react'
import styles from './LiveCircleIcon.module.css';

const LiveCircleIcon = () => {
    return (
        <span className={styles.liveIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="3" fill="#03E1FF" />
                <circle cx="6" cy="6" r="5.25" stroke="#03E1FF" strokeOpacity="0.5" strokeWidth="0.5" />
            </svg>
        </span>
    )
}

export default LiveCircleIcon;