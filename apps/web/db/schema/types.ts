import type { ActivitySelect } from './activity';
import type { UserPublicSelect } from './user';
import type { XTweetSelect } from './x';

export interface ActivityFull extends ActivitySelect {
  user: UserPublicSelect;
  creator: UserPublicSelect;
  xTweet: XTweetSelect;
  replyTweet: XTweetSelect | null;
}
