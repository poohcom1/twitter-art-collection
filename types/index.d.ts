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
  images: ImageSchema[];
}

type TagCollection = Map<string, TagSchema>;

interface Settings {
  showTagDeleteWarning?: boolean;
}

interface UserSchema {
  uid: string;
  tags: TagCollection;
  tweetIds: string[];
}

// Request Body Types
type PostTagBody = TagSchema;

type PutTagBody = TagSchema;

type DeleteTagBody = TagSchema;

// Response Types
interface UserDataResponse {
  tweets: TweetSchema[];
  tags: TagCollection;

  newUser?: boolean;
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
