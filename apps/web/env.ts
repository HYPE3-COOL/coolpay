import 'dotenv/config';
import { z } from 'zod';

const zBoolean = z.enum(['true', 'false']).transform((value) => value === 'true');

const schema = z.object({
  CRON_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production']),
  // FUCK_GFW: zBoolean.default('false'),
  // PROXY_URL: z.string(),
  // PORT: z.coerce.number().default(18080),
  REDIS_URL: z.string(),
  DATABASE_URL: z.string(),
  X_API_KEY: z.string(),
  X_CLIENT_ID: z.string(),
  X_CLIENT_SECRET: z.string(),
  X_ACCESS_TOKEN: z.string(),

  X2_API_KEY: z.string(),
  X2_API_KEY_SECRET: z.string(),
  X2_ACCESS_TOKEN: z.string(),
  X2_ACCESS_TOKEN_SECRET: z.string(),

  PRIVY_APP_ID: z.string(),
  PRIVY_APP_SECRET: z.string(),

  RPC_URL: z.string(),

  SITE_X_USERNAME: z.string(),
  SITE_PRIVY_WALLET: z.string(),
  SITE_PRIVY_ID: z.string(),
  HOST: z.string(),

  MONITOR_DURATION: z.coerce.number().default(48),

  // solana
  SOLANA_ENV: z.string(),

  // APIFY_API_KEY: z.string(),
  // IPINFO_TOKEN: z.string().optional(),
  // TIMING_ENABLED: zBoolean.default('false'),
  
  // AI
  OPENAI_API_KEY: z.string(),
  // ANTHROPIC_API_KEY: z.string(),
  // GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  // TAVILY_API_KEY: z.string(),
  // TOGETHER_AI_API_KEY: z.string(),
  // CF_ACCOUNT_ID: z.string(),
  // CF_GATEWAY_ID: z.string(),
  // web3
  // INFURA_API_KEY: z.string(),
  // COINMARKETCAP_API_KEY: z.string(),
  // ETHERSCAN_API_KEY: z.string(),
  // CRAWLBASE_API_KEY: z.string(),
  // CRAWLBASE_JS_API_KEY: z.string(),
  // TG_X_INFLUENCER_NOTIFICATION_BOT_TOKEN: z.string(),
});

export const env = schema.parse(process.env);
