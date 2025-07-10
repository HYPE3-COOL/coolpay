CREATE TABLE "coolpaybot"."activities" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coolpaybot"."activities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"creator_id" bigint NOT NULL,
	"x_tweet_id" bigint NOT NULL,
	"amount" bigint,
	"token" varchar(16) DEFAULT 'SOL' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"response_count" integer DEFAULT 0 NOT NULL,
	"is_responsed" boolean DEFAULT false NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"payment_status" varchar(20) NOT NULL,
	"first_reply_tweet_id" bigint,
	"fund_hash" varchar(100),
	"refund_hash" varchar(100),
	"paid_hash" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "coolpaybot"."user" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coolpaybot"."user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"privy_user_id" varchar(50) NOT NULL,
	"twitter_id" bigint NOT NULL,
	"username" varchar(30) NOT NULL,
	"image" varchar(255) NOT NULL,
	"privy_wallet_id" varchar(50) NOT NULL,
	"privy_wallet_address" varchar(100) NOT NULL,
	"linked_accounts" jsonb,
	"twitter" jsonb,
	"is_new_user" boolean DEFAULT false NOT NULL,
	"is_creator" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"no_of_requests" integer DEFAULT 0 NOT NULL,
	"no_of_followers" integer DEFAULT 0 NOT NULL,
	"success_rate" double precision DEFAULT 0 NOT NULL,
	"avg_cost" bigint NOT NULL,
	"public_metrics" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coolpaybot"."x_tweet" (
	"id" bigint PRIMARY KEY NOT NULL,
	"author_id" bigint,
	"text" varchar(4000) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"lang" varchar(35),
	"source" varchar(32),
	"possibly_sensitive" boolean,
	"conversation_id" bigint,
	"referenced_tweets" jsonb,
	"public_metrics" jsonb,
	"entities" jsonb,
	"includes" jsonb,
	"note_tweet" jsonb
);
--> statement-breakpoint
CREATE TABLE "coolpaybot"."x_user" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"username" varchar(30) NOT NULL,
	"profile_image_url" varchar(128) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"verified" boolean,
	"protected" boolean,
	"url" varchar(100),
	"location" varchar(100),
	"description" varchar(256),
	"public_metrics" jsonb,
	"entities" jsonb
);
--> statement-breakpoint
CREATE TABLE "coolpaybot"."x_tweet_queue" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coolpaybot"."x_tweet_queue_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"tweet_id" bigint NOT NULL,
	"type" varchar(32) DEFAULT 'mentions' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"failed_reason" varchar(50) DEFAULT '' NOT NULL,
	"amount" bigint,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coolpaybot"."transaction" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coolpaybot"."transaction_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"hash" varchar(100) NOT NULL,
	"type" varchar(20) DEFAULT 'deposited' NOT NULL,
	"user_id" bigint NOT NULL,
	"x_tweet_id" bigint,
	"from_address" varchar(100),
	"to_address" varchar(100),
	"amount" bigint,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activities_user_id_idx" ON "coolpaybot"."activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activities_creator_id_idx" ON "coolpaybot"."activities" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "activities_x_tweet_id_idx" ON "coolpaybot"."activities" USING btree ("x_tweet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_privy_user_id_idx" ON "coolpaybot"."user" USING btree ("privy_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_idx" ON "coolpaybot"."user" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "user_twitter_id_idx" ON "coolpaybot"."user" USING btree ("twitter_id");--> statement-breakpoint
CREATE INDEX "x_tweet_author_id_idx" ON "coolpaybot"."x_tweet" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "x_tweet_created_at_idx" ON "coolpaybot"."x_tweet" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "x_user_username_idx" ON "coolpaybot"."x_user" USING btree ("username");--> statement-breakpoint
CREATE INDEX "x_user_created_at_idx" ON "coolpaybot"."x_user" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "x_tweet_queue_tweet_id_idx" ON "coolpaybot"."x_tweet_queue" USING btree ("tweet_id");--> statement-breakpoint
CREATE INDEX "x_tweet_queue_type_idx" ON "coolpaybot"."x_tweet_queue" USING btree ("type");--> statement-breakpoint
CREATE INDEX "x_tweet_queue_status_idx" ON "coolpaybot"."x_tweet_queue" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_hash_idx" ON "coolpaybot"."transaction" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "transactions_from_address_idx" ON "coolpaybot"."transaction" USING btree ("from_address");--> statement-breakpoint
CREATE INDEX "transactions_to_address_idx" ON "coolpaybot"."transaction" USING btree ("to_address");