"use client";

import { PagingInfo } from "@/interfaces";
import { List } from "@refinedev/antd";
import { Pagination, Table, Input, Form, Button, Row, Col } from "antd";
import { UserSelect } from "@/db/schema";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { showExplorer, showXUserExplorer } from "@/utils/string";
import { ExplorerLinkButton } from "@/components/dashboard/buttons";

export default function UserList() {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState<UserSelect[]>([]);
  const [meta, setMeta] = useState<PagingInfo>({ count: 0, total: 0, page: 1, pageCount: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    setLoading(true);
    fetch(`/api/v1/users?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data || []);
        setMeta(res.meta || { count: 0, total: 0, page: 1, pageCount: 1, pageSize: 10 });
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSearch = (values: any) => {
    setSearching(true);
    const params = new URLSearchParams();
    params.set("pageSize", String(searchParams.get("pageSize") || 10));
    params.set("page", "1");
    if (values.q !== undefined && values.q !== "") {
      params.set("q", values.q);
    }
    router.push(`/dashboard/users?${params.toString()}`);
    setSearching(false);
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
          <Col><Form.Item name="q" label="Text Search"><Input placeholder="username, wallet, twitter id..." allowClear /></Form.Item></Col>
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
        <Table.Column
          dataIndex="image"
          title={"Avatar"}
          render={(value: string) => (
            <img src={value} alt="Avatar" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: "50%" }} />
          )}
        />
        <Table.Column
          title={
            <>
              Username /<br />
              Twitter ID
            </>
          }
          render={(_, record: UserSelect) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {record.username ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={showXUserExplorer(record.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {record.username}
                  </a>
                  <ExplorerLinkButton url={showXUserExplorer(record.username)} tooltip="Open in X" />
                </span>
              ) : null}
              {record.twitter_id ? (
                <span style={{ fontSize: 12, color: '#888' }}>{record.twitter_id}</span>
              ) : null}
            </div>
          )}
        />
        <Table.Column
          title={
            <>
              Privy User ID /<br />Wallet Address
            </>
          }
          render={(_, record: UserSelect) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {record.privy_user_id && (
                <span style={{ fontSize: 13 }}>{record.privy_user_id}</span>
              )}
              {record.privy_wallet_address && (
                <span style={{ fontFamily: 'monospace', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
                  {record.privy_wallet_address.slice(0, 8)}...{record.privy_wallet_address.slice(-6)}
                  <span style={{ marginLeft: 6 }}>
                    <ExplorerLinkButton url={showExplorer(record.privy_wallet_address)} tooltip="Open in Solscan" />
                  </span>
                </span>
              )}
            </div>
          )}
        />
        <Table.Column dataIndex="is_new_user" title={"New User"} render={(v: boolean) => v ? 'Yes' : 'No'} />
        <Table.Column dataIndex="is_creator" title={"Creator"} render={(v: boolean) => v ? 'Yes' : 'No'} />
        <Table.Column dataIndex="is_admin" title={"Admin"} render={(v: boolean) => v ? 'Yes' : 'No'} />
        <Table.Column dataIndex="no_of_requests" title={"Requests"} sorter={(a, b) => a.no_of_requests - b.no_of_requests} />
        <Table.Column dataIndex="no_of_followers" title={"Followers"} sorter={(a, b) => a.no_of_followers - b.no_of_followers} />
        <Table.Column dataIndex="success_rate" title={"Success Rate"} render={(v: number) => `${(v * 100).toFixed(1)}%`} sorter={(a, b) => a.success_rate - b.success_rate} />
        <Table.Column dataIndex="avg_cost" title={
          <>
            Avg Cost<br />(lamports)
          </>
        } sorter={(a, b) => a.avg_cost - b.avg_cost} />
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
          router.push(`/dashboard/users?${params.toString()}`);
        }}
        showSizeChanger={true}
        pageSizeOptions={["10", "20", "50", "100"]}
      />
    </List>
  );
}
