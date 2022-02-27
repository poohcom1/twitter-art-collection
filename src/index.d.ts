// DB Schema
type Platform = "twitter";

interface ImageSchema<Platform> {
  id: string;
  platform: P;
}

interface TweetSchema extends ImageSchema<"twitter"> {
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
