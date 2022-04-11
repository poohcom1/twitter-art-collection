// DB Schema
type Platform = "twitter";

interface BaseSchema<P> {
  id: string;
  platform: P;
}

type ImageSchema = BaseSchema<Platform>;

// Tweet

type TweetAst = Array<{ data: { id: string }, nodes: Node[] }>;

interface Node {
  tag: string
  nodes: Node[]
  props: {
    src: string
  }
}

interface TweetSchema extends BaseSchema<"twitter"> {
  ast: TweetAst | null;
}

interface TagSchema {
  name: string;
  images: ImageSchema[];
}

type TagCollection = Map<string, TagSchema>;

interface UserSchema {
  uid: string;
  tags: TagCollection;
  tweetIds: string[]
}

// Request Body Types

type PostTagBody = TagSchema;

type PutTagBody = TagSchema;

type DeleteTagBody = TagSchema;

// Response Types

interface TweetsResponse {
  tweets: TweetSchema[] | null;
}

interface AllTweetsResponse extends TweetsResponse {
  /**
   * The amount of pages fetched from twitter
   */
  next_token?: string;
}

interface UserDataResponse<T extends string> {
  tweets: TweetSchema[]

  type: T
}

interface FullUserDataResponse extends UserDataResponse<"full"> {
  tags: TagCollection
}


interface PartialUserDataResponse extends UserDataResponse<"partial"> {
  next_token: string | undefined
}

// Error handling
interface Result<T, E> {
  error: E;
  data: T;
}
