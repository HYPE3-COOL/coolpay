import { UserV2 } from "twitter-api-v2";

export interface IxUser {
	id: string; // bigint in DB, represented as string
	name: string;
	username: string;
	profile_image_url: string;
	created_at: string; // timestamp with timezone
	verified: boolean | null;
	protected: boolean | null;
	url: string | null;
	location: string | null;
	description: string | null;
	public_metrics: UserV2["public_metrics"] | null;
	entities: UserV2["entities"] | null;
}
