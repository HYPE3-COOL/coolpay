import React from "react";
import styles from "./SendRequestButton.module.css";
import clsx from "clsx";
import { MINIMUM_REQUEST_AMOUNT } from "@/constants/constant";

interface SendRequestButtonProps {
  recipient: string;
}

const SITE_X_USERNAME = process.env.NEXT_PUBLIC_SITE_X_USERNAME;

const SendRequestButton: React.FC<SendRequestButtonProps> = ({ recipient }) => {
  const handleClick = () => {
    if (recipient) {
      const text = `Hi @${SITE_X_USERNAME} I would like to pay @${recipient} ${MINIMUM_REQUEST_AMOUNT.toString()} $SOL if he/she replies here`;
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      alert('Twitter username not found for this creator.');
    }
  };

  return (
    <button className={styles.sendRequestButton} onClick={handleClick} type="button">
      <span className={clsx(styles.iconWrapper, "icon-twitter")} />
      <span className={styles.label}>Send a request</span>
    </button>
  );
};

export default SendRequestButton;
