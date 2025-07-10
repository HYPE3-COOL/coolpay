"use client";

import React, { useState } from "react";
import { Card, Button, Space, Input, Typography } from "antd";
import { LINK_HOW_TO, MINIMUM_REQUEST_AMOUNT } from "@/constants/constant";
import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function TweetAnalyzerPage() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [aiResult, setAiResult] = useState<{ creator?: string; amount?: string; token?: string; platform_account?: string }>({});

    const handleAnalyze = async () => {
        setLoading(true);
        setOutput("");
        setAiResult({});

        try {
            // 1. Call server API for AI analysis
            const res = await fetch("/api/v1/tweet-analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to analyze");
            }
            const result = await res.json();
            const { creator, amount, token, platform_account } = result;
            setAiResult({ creator, amount, token, platform_account });

            // 2. Validate content (simulate the logic in cron route)
            let creatorValid = false;
            let creatorTwitterId = "0";
            // For demo, just check if @creator is mentioned in text
            if (creator && input.includes(`@${creator}`)) {
                creatorValid = true;
                creatorTwitterId = creator;
            }
            if (!creatorValid) {
                console.log("Creator not mentioned in tweet content");
                setOutput(`⚠️ Your request is incomplete. Read our FAQ here: ${LINK_HOW_TO}`);
                setLoading(false);
                return;
            }

            if (
                amount &&
                parseFloat(amount) > 0 &&
                token &&
                token.toUpperCase() === 'SOL' &&
                platform_account &&
                platform_account === process.env.NEXT_PUBLIC_SITE_X_USERNAME!
            ) {

                if (parseFloat(amount) < MINIMUM_REQUEST_AMOUNT) {
                    setOutput(`⚠️ You need to pay a minimum of ${MINIMUM_REQUEST_AMOUNT} SOL. Please tweet again with a higher amount.`);
                    setLoading(false);
                    return;
                }
            } else {
                setOutput(`⚠️ Your request is incomplete. Read our FAQ here: ${LINK_HOW_TO}`);
                setLoading(false);
                return;
            }
            // If all pass
            setOutput("validated");
        } catch (e: any) {
            setOutput("Error: " + (e?.message || e?.toString() || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    // Helper to check field validity
    const isValid = (key: string, value: any) => {
        if (key === "amount") return value && !isNaN(Number(value)) && Number(value) > 0;
        if (key === "token") return value === "SOL";
        if (key === "creator") return value && input.includes(`@${value}`);
        if (key === "platform_account") return value && value === process.env.NEXT_PUBLIC_SITE_X_USERNAME;
        return !!value;
    };

    return (
        <Card style={{ maxWidth: 700, margin: "40px auto" }}>
            <Title level={3} style={{ marginBottom: 16 }}>Tweet Analyzer</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <TextArea
                    rows={6}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Paste or type your tweet content here..."
                    style={{ marginBottom: 16 }}
                />
                <Button onClick={handleAnalyze} loading={loading} type="primary" block style={{ marginBottom: 16 }}>
                    Analyze
                </Button>
                {Object.keys(aiResult).length > 0 && (
                    <>
                        <Title level={5} style={{ margin: '8px 0 4px 0' }}>Validation of Key Variables in Tweet Content</Title>
                        <table style={{ width: '100%', marginBottom: 16, borderCollapse: 'collapse', background: '#fafafa', border: '1px solid #eee' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Field</th>
                                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Value</th>
                                    <th style={{ textAlign: 'center', padding: 8, borderBottom: '1px solid #eee' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['creator', 'amount', 'token', 'platform_account'].map((key) => {
                                    const value = aiResult[key as keyof typeof aiResult];
                                    const valid = Boolean(value && value !== '-');
                                    return (
                                        <tr key={key}>
                                            <td style={{ padding: 8 }}>{key}</td>
                                            <td style={{ padding: 8 }}>
                                                {valid ? (
                                                    <span style={{ color: '#389e0d', fontWeight: 500 }}>{value}</span>
                                                ) : (
                                                    <span style={{ color: '#d4380d', fontWeight: 500 }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ padding: 8, textAlign: 'center' }}>
                                                {valid ? (
                                                    <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />
                                                ) : (
                                                    <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 20 }} />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}
                <TextArea
                    rows={4}
                    value={output}
                    readOnly
                    style={{ marginBottom: 16, color: output === 'validated' ? 'green' : 'red', fontWeight: 500 }}
                />
                {output && output !== 'validated' && (
                    <Space align="center" style={{ marginBottom: 8 }}>
                        <CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 20 }} />
                        <Text type="danger">{output}</Text>
                    </Space>
                )}
                {output === 'validated' && (
                    <Space align="center" style={{ marginBottom: 8 }}>
                        <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />
                        <Text type="success">validated</Text>
                    </Space>
                )}
            </Space>
        </Card>
    );
}
