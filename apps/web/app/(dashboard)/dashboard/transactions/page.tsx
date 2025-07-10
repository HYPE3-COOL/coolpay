"use client";

import { PagingInfo } from "@/interfaces";
import { List } from "@refinedev/antd";
import { Pagination, Table, Tag, Input, Form, Button, Row, Col, Select } from "antd";
import { showExplorer, showTweetExplorer } from "@/utils/string";
import { ExplorerLinkButton } from "@/components/dashboard/buttons/ExplorerLinkButton";
import { TransactionSelect } from "@/db/schema";
import { useEffect, useState } from "react";
import { TransactionType, TransactionStatus } from "@/interfaces/transaction.interface";
import { useRouter, useSearchParams } from "next/navigation";

export default function TransactionList() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState<TransactionSelect[]>([]);
  const [meta, setMeta] = useState<PagingInfo>({ count: 0, total: 0, page: 1, pageCount: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  // Fetch data from API using query params
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    setLoading(true);
    fetch(`/api/v1/transactions?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data || []);
        setMeta(res.meta || { count: 0, total: 0, page: 1, pageCount: 1, pageSize: 10 });
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (values: any) => {
    setSearching(true);
    // Build query string from form values
    const params = new URLSearchParams();
    params.set("pageSize", String(searchParams.get("pageSize") || 10));
    params.set("page", "1"); // reset to first page on search
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    router.push(`/dashboard/transactions?${params.toString()}`);
    setSearching(false);
  };

  // Enum options for dropdowns
  const transactionTypeOptions = Object.values(TransactionType).map((type) => ({ label: type, value: type }));
  const transactionStatusOptions = Object.values(TransactionStatus).map((status) => ({ label: status, value: status }));

  // Color mapping for transaction types
  const typeColorMap: Record<string, string> = {
    deposited: 'green',
    withdrawal: 'red',
    refunded: 'orange',
    paid: 'blue',
    received: 'purple',
  };

  // Color mapping for transaction status
  const statusColorMap: Record<string, string> = {
    pending: 'orange',
    confirmed: 'green',
    failed: 'red',
  };

  return (
    <List canCreate={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={12}>
          <Col><Form.Item name="q" label="Text Search"><Input placeholder="Hash, Address, Tweet ID" allowClear /></Form.Item></Col>
          <Col><Form.Item name="type" label="Type"><Select placeholder="Type" allowClear options={transactionTypeOptions} style={{ minWidth: 140 }} /></Form.Item></Col>
          <Col><Form.Item name="status" label="Status"><Select placeholder="Status" allowClear options={transactionStatusOptions} style={{ minWidth: 140 }} /></Form.Item></Col>
          <Col>
            <Form.Item label=" ">
              <Button type="primary" htmlType="submit" loading={searching}>Search</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={data}
        loading={loading}
        pagination={false}
        style={{ marginBottom: 24 }}
        rowKey="id"
        scroll={{ x: true }}
      >
        {/* <Table.Column dataIndex="id" title={"ID"} /> */}
        <Table.Column dataIndex="hash" title={"Hash"} render={(value: string) => (
          <span style={{ fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
            {value?.slice(0, 8)}...{value?.slice(-6)}
            <span style={{ marginLeft: 6 }}><ExplorerLinkButton url={showExplorer(value)} /></span>
          </span>
        )} />
        <Table.Column dataIndex="type" title={"Type"} render={(type: string) => (
          <Tag color={typeColorMap[type] || 'default'}>{type.toUpperCase()}</Tag>
        )} />
        {/* <Table.Column dataIndex="user_id" title={"User ID"} /> */}
        <Table.Column
          dataIndex="x_tweet_id"
          title={"Related Tweet"}
          render={(value: string | number) => (
            value ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <a
                  href={showTweetExplorer(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 500 }}
                >
                  {value}
                </a>
                <ExplorerLinkButton url={showTweetExplorer(value)} tooltip="Open Tweet in X" />
              </span>
            ) : null
          )}
        />
        <Table.Column dataIndex="from_address" title={"Address From"} render={(value: string) => (
          value ? (
            <span style={{ fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
              {value.slice(0, 6)}...{value.slice(-4)}
              <span style={{ marginLeft: 6 }}><ExplorerLinkButton url={showExplorer(value)} /></span>
            </span>
          ) : null
        )} />
        <Table.Column dataIndex="to_address" title={"Address To"} render={(value: string) => (
          value ? (
            <span style={{ fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
              {value.slice(0, 6)}...{value.slice(-4)}
              <span style={{ marginLeft: 6 }}><ExplorerLinkButton url={showExplorer(value)} /></span>
            </span>
          ) : null
        )} />
        <Table.Column dataIndex="amount" title={"Amount (lamports)"} render={(value: string) => (
          value ? <span>{value}</span> : null
        )} />
        <Table.Column dataIndex="status" title={"Status"} render={(status: string) => (
          <Tag color={statusColorMap[status] || 'default'}>{status.toUpperCase()}</Tag>
        )} />
        <Table.Column dataIndex="created_at" title={"Created At"} render={(value: string) => (
          <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span>
        )} />
        <Table.Column dataIndex="updated_at" title={"Updated At"} render={(value: string) => (
          <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span>
        )} />
        
      </Table>
      <Pagination
        showTotal={() => `Total ${meta?.total || 0} items`}
        current={meta?.page ?? 1}
        pageSize={meta?.pageSize ?? 10}
        total={meta?.total ?? 0}
        onChange={(page, pageSize) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", String(page));
          params.set("pageSize", String(pageSize));
          router.push(`/dashboard/transactions?${params.toString()}`);
        }}
        showSizeChanger={true}
        pageSizeOptions={["10", "20", "50", "100"]}
      />
    </List>
  );
}
