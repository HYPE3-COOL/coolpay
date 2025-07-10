import { snakeCase } from 'lodash';
import React from "react";

/**
 * Converts tweet text to an array of React elements with clickable @mentions and URLs.
 * Usage: renderTweetText(text) in a React component.
 */
export function renderTweetText(text: string): (string | React.ReactElement)[] {
  if (!text) return [];
  const mentionRegex = /@[a-zA-Z0-9_]{1,15}/g;
  const urlRegex = /https?:\/\/t\.co\/[a-zA-Z0-9]+/g;
  const combinedRegex = new RegExp(`${mentionRegex.source}|${urlRegex.source}`, 'g');
  const result: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    const part = match[0];
    if (part.startsWith('@')) {
      const username = part.slice(1);
      result.push(
        React.createElement(
          'a',
          {
            key: `mention-${match.index}`,
            href: `https://x.com/${username}`,
            target: '_blank',
            rel: 'noopener noreferrer',
            style: { color: '#1da1f2', fontWeight: 500 },
          },
          part
        )
      );
    } else if (part.startsWith('http')) {
      result.push(
        React.createElement(
          'a',
          {
            key: `url-${match.index}`,
            href: part,
            target: '_blank',
            rel: 'noopener noreferrer',
            style: { color: '#1da1f2', textDecoration: 'underline' },
          },
          part
        )
      );
    }
    lastIndex = match.index + part.length;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

export function dictToXml(dict: Record<string, string>) {
  let xml = '';
  Object.entries(dict).forEach(([key, value]) => (xml += `<${key}>${value}</${key}>\n`));
  return xml;
}

type UnknownString = string | null | undefined;
export function hasText(str: UnknownString): str is string {
  return typeof str === 'string' && str.trim().length !== 0;
}

export function inject<P extends Record<string, string>>(template: string, params: P): string {
  return template.replace(/{(.*?)}/g, (match, key) => {
    return key in params ? (params[key] as string) : match;
  });
}

// export function sha256(data: string) {
//   return createHash('sha256').update(data).digest('hex');
// }

export const Cursor = {
  of(prev: bigint, next: bigint) {
    return { prev: this.encode(prev), next: this.encode(next) };
  },
  empty() {
    return { prev: '', next: '' };
  },
  encode(id: bigint): string {
    return Buffer.from(id.toString(), 'utf-8').toString('base64');
  },
  decode(token: string): bigint {
    return BigInt(Buffer.from(token, 'base64').toString('utf-8'));
  },
};

export const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item));
  } else if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = snakeCase(key);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  } else if (obj instanceof Date) {
    return obj.toISOString(); // Convert Date objects to ISO string format
  }
  return obj;
};


export const getSolanaAddressFromUser = (data: any): string | null => {
  const solanaAccount = data.find(
    (account: any) => account.chain_type === 'solana' || account.chainType === 'solana',
  );
  return solanaAccount && solanaAccount.address ? solanaAccount.address : null;
}

export const showExplorer = (address: string) => {
  const network = process.env.NEXT_PUBLIC_SOLANA_ENV === 'mainnet-beta' ? 'mainnet' : 'devnet';
  return `https://solscan.io/account/${address}?cluster=${network}`;
};

export const showTransactionInExplorer = (hash: string) => {
  const network = process.env.NEXT_PUBLIC_SOLANA_ENV === 'mainnet-beta' ? 'mainnet' : 'devnet';
  return `https://solscan.io/tx/${hash}?cluster=${network}`;
};

export const showTweetExplorer = (tweetId: string | number) => {
  return `https://x.com/i/status/${tweetId}`;
};

export const showXUserExplorer = (username: string) => {
  return `https://x.com/${username}`;
};

export const showXUserByIdExplorer = (twitterId: string | number) => {
  return `https://x.com/i/user/${twitterId}`;
};

export function formatRequests(val: number) {
  return val.toLocaleString();
}
export function formatCost(val: number) {
  // Accepts lamports or SOL, formats as $X.XX (assume val is in SOL for now)
  return `$${val.toFixed(2)}`;
}
export function formatPercent(val: number) {
  return `${val}%`;
}

export function getHighResTwitterImage(url: string): string {
  if (!url) return url;
  return url.replace(/_normal(\.[a-zA-Z0-9]+)$/, '_400x400$1');
}