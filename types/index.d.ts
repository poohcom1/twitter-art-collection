// DB Schema
type Platform = "twitter";

interface BaseSchema<P> {
  id: string;
  platform: P;
}

type ImageSchema = BaseSchema<Platform>;

// Tweet
type TweetAst = Array<{ data: { id: string }; nodes: Node[] }>;

interface Node {
  tag: string;
  nodes: Node[];
  props: {
    src: string;
  };
}

interface TweetSchema extends BaseSchema<"twitter"> {
  data?: TweetExpansions;

  loading?: boolean;
  deleted?: boolean;
}

interface TweetImage {
  url: string;
  width: number;
  height: number;
}

interface TweetExpansions {
  id: string;
  url: string;
  date: string | undefined;

  avatar: string | undefined;
  name: string | undefined;
  username: string | undefined;
  content: {
    text: string | undefined;
    media: TweetImage[] | undefined;
  };
}

// Data types
interface TagSchema {
  name: string;
  images: string[];
}

type DBTagSchema = Omit<TagSchema, "name">;

interface Settings {
  showTagDeleteWarning?: boolean;
}

interface RawUserSchema {
  uid: string;
  tags: Record<string, TagSchema>;
}

interface DBUserSchema {
  uid: string;
  tags: Record<string, DBTagSchema>;
  pinnedTags: string[];
  tweetIds?: string[];
}

interface UserSchema extends DBUserSchema {
  tags: Record<string, TagSchema>;
}

// Request Body Types
type PostTagBody = TagSchema;

type PutTagBody = TagSchema;

type DeleteTagBody = TagSchema;

// Response Types
interface UserDataResponse extends Omit<UserSchema, "uid"> {
  newUser?: boolean;
}

interface UserDataResponseV2 {
  tweets: TweetSchema[];

  newUser?: boolean;
}

interface TweetsV1Response {
  tweets: TweetSchema[];
  since_id?: string;
}

interface TweetsResponse {
  tweets: TweetSchema[];
  nextToken?: string;
}

// Error handling

type Result<T> =
  | {
      error: null;
      data: T;
    }
  | {
      error: string;
      data: null;
    };
