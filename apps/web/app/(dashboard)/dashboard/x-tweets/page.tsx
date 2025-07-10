"use client";

import { PagingInfo } from "@/interfaces";
import {
  List,
  useTable,
} from "@refinedev/antd";
import { Pagination, Table, Tag, Modal, Button } from "antd";
import { showExplorer, showTweetExplorer, showXUserByIdExplorer, renderTweetText } from "@/utils/string";
import { ExplorerLinkButton, CopyButton } from "@/components/dashboard/buttons";
import { XTweetSelect } from "@/db/schema";
import React, { useState } from "react";

export default function ActivityList() {
  const { tableProps, tableQuery, setCurrent, setPageSize } = useTable<any>({
    resource: "xTweets",
    syncWithLocation: true,
    filters: {
      initial: [],
      mode: "server",
    },
  });

  const appData = tableQuery.data?.data as unknown as { data: XTweetSelect[]; meta: PagingInfo };
  const [entitiesModal, setEntitiesModal] = useState<{ open: boolean; value: any }>({ open: false, value: null });

  return (
    <List canCreate={false}>
      <Table
        {...tableProps}
        dataSource={appData?.data ?? []}
        pagination={false}
        style={{ marginBottom: 24 }}
        rowKey="id"
        scroll={{ x: true }}
      >
        <Table.Column
          dataIndex="id"
          title={"Tweet ID"}
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
        <Table.Column
          title={
            <>
              Author X ID /<br />Conversation ID
            </>
          }
          render={(_, record: XTweetSelect) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {record.author_id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={showXUserByIdExplorer(record.author_id.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {record.author_id.toString()}
                  </a>
                  <ExplorerLinkButton url={showXUserByIdExplorer(record.author_id.toString())} tooltip="Open X Profile by ID" />
                </span>
              ) : null}
              {record.conversation_id ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <a
                    href={showXUserByIdExplorer(record.conversation_id.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 500 }}
                  >
                    {record.conversation_id.toString()}
                  </a>
                  <ExplorerLinkButton url={showXUserByIdExplorer(record.conversation_id.toString())} tooltip="Open X Profile by ID" />
                </span>
              ) : null}
            </div>
          )}
        />
        <Table.Column dataIndex="text" title={"Text"} render={(value: string) => (
          <span style={{ maxWidth: 400, display: 'inline-block', whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>{renderTweetText(value)}</span>
        )} />
        <Table.Column dataIndex="created_at" title={"Created At"} render={(value: string) => (
          <span style={{ fontSize: 12 }}>{new Date(value).toLocaleString()}</span>
        )} />
        <Table.Column dataIndex="lang" title={"Lang"} />
        <Table.Column dataIndex="source" title={"Source"} />
        <Table.Column dataIndex="public_metrics" title={"Metrics"} render={(metrics: any) => (
          metrics ? (
            <span style={{ fontSize: 12 }}>
              🗨️ {metrics.reply_count ?? 0} &nbsp;🔁 {metrics.retweet_count ?? 0} &nbsp;❤️ {metrics.like_count ?? 0} &nbsp;👁️ {metrics.impression_count ?? 0}
            </span>
          ) : null
        )} />
        <Table.Column dataIndex="possibly_sensitive" title={"Sensitive"} render={(v: boolean) => v ? 'Yes' : 'No'} />
        <Table.Column
          dataIndex="referenced_tweets"
          title={"Referenced Tweets"}
          render={(v: any) =>
            v && Array.isArray(v) && v.length > 0 ? (
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {v.map((t: any) => (
                  <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <a
                      href={showTweetExplorer(t.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontWeight: 500 }}
                    >
                      {t.id}
                    </a>
                    <ExplorerLinkButton url={showTweetExplorer(t.id)} tooltip="Open Tweet in X" />
                  </span>
                ))}
              </span>
            ) : ''
          }
        />
        <Table.Column
          dataIndex="entities"
          title={"Entities"}
          width={120}
          render={(v: any) => (
            v ? (
              <Button size="small" onClick={() => setEntitiesModal({ open: true, value: v })}>
                View JSON
              </Button>
            ) : ''
          )}
        />
        <Table.Column dataIndex="includes" title={"Includes"} render={(v: any) => v ? JSON.stringify(v) : ''} />
        <Table.Column dataIndex="note_tweet" title={"Note Tweet"} render={(v: any) => v ? JSON.stringify(v) : ''} />
      </Table>
      <Pagination
        showTotal={() => `Total ${appData?.meta?.total || 0} items`}
        current={appData?.meta?.page ?? 1}
        pageSize={appData?.meta?.pageSize ?? 10}
        total={appData?.meta?.total ?? 0}
        onChange={(page, pageSize) => {
          setCurrent(page);
        }}
        onShowSizeChange={(_, size) => {
          setPageSize(size);
        }}
        showSizeChanger={true}
        pageSizeOptions={["10", "20", "50", "100"]}
      />
      <Modal
        open={entitiesModal.open}
        onCancel={() => setEntitiesModal({ open: false, value: null })}
        onOk={() => setEntitiesModal({ open: false, value: null })}
        title="Entities JSON"
        width={700}
        footer={null}
      >
        <pre style={{ fontSize: 12, maxWidth: 650, whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f6f6f6', borderRadius: 4, padding: 12, margin: 0 }}>
          {entitiesModal.value ? JSON.stringify(entitiesModal.value, null, 2) : ''}
        </pre>
      </Modal>
    </List>
  );
}
