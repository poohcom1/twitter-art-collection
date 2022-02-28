// DB Schema
type Platform = "twitter";

interface BaseSchema<P> {
  id: string;
  platform: P;
}

type ImageSchema = BaseSchema<Platform>;

interface TweetSchema extends BaseSchema<"twitter"> {
  ast: any;
}

interface TagSchema {
  name: string;
  images: ImageSchema[];
}

type TagCollection = Map<string, TagSchema>;

interface UserSchema {
  uid: string;
  tags: TagCollection;
}

// API Objects

interface PostTagBody extends TagSchema {}

interface PutTagBody extends TagSchema {}

interface DeleteTagBody extends TagSchema {}
