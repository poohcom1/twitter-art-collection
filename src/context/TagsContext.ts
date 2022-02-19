import type { TagCollection, TagSchema } from "api";
import { createContext } from "react";

interface ITagContext {
    tags: TagCollection;
    setTags: (tags: TagCollection) => void;
}

const TagsContext = createContext<ITagContext>(
    { tags: new Map(), setTags: (tags) => { } }
)


export default TagsContext