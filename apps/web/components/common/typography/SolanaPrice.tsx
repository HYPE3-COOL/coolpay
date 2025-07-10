'use client';
import React from "react";

import { Text } from "@mantine/core";
import { getLatestSolanaPrice } from "@/hooks/useSolana";

export interface SolanaPriceProps {
    amount: bigint | number | string;
    fw?: number;
}

export const SolanaPrice = ({
    amount, fw = 500,
}: SolanaPriceProps) => {

    const solAmount = amount ? Number(amount) / 1_000_000_000 : 0;
    const { data: solPrice } = getLatestSolanaPrice();

    return (
        <Text
            c="white"
            fz="md"
            fw={fw}
            style={{ whiteSpace: "nowrap", minWidth: 0, width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
            title={`${solAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOL (~$${solPrice && solAmount ? (solAmount * solPrice).toFixed(2) : '-'})`}
        >
            {solAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOL&nbsp;
            <span style={{ fontSize: '12px' }}>
                (~${solPrice && solAmount ? (solAmount * solPrice).toFixed(2) : '-'})
            </span>
        </Text>
    )
}