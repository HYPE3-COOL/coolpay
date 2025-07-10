import React from "react";
import { Card, Stack, Text } from "@mantine/core";
import { clsx } from "clsx";
import { LINK_HOW_TO } from "@/constants/constant";
import styles from "./UsageCard.module.css";

export const UsageCard = () => {
  return (
    <Card className={styles.card}>
      <Stack justify="center" align="center" p={15}>

        <span className={clsx(styles.logo, "icon-twitter")} />
        <Text className={styles.message}>
          Tag @coolpaybot to request & pay any X user
        </Text>
        <a href={LINK_HOW_TO} target="_blank" rel="noopener noreferrer">
          <Text className={styles.link}>Read Docs</Text>
        </a>
      </Stack>
    </Card>
  );
};
