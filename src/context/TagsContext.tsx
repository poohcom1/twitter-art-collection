import _ from "lodash";
import { useEffect } from "react";
import { useRef } from "react";
import { createContext, useContext, useReducer } from "react";

const TagsContext = createContext<
  { state: TagCollection; dispatch: Dispatch } | undefined
>(undefined);

interface Action<Type> {
  type: Type;
}

interface ImageAction extends Action<"add_image" | "remove_image"> {
  image: ImageSchema;
  tag: TagSchema;
}

interface TagAction extends Action<"add_tag"> {
  tag: TagSchema;
}

interface TagsAction extends Action<"replace_tags"> {
  tags: TagCollection;
}

type TagActions = TagAction | ImageAction | TagsAction;

type Dispatch = (action: TagActions) => void;

function tagsReducer(state: TagCollection, action: TagActions): TagCollection {
  let tag;
  switch (action.type) {
    case "add_image":
      tag = state.get(action.tag.name);
      tag?.images.push(action.image);
      return new Map(state.set(tag!.name, tag!));
    case "remove_image":
      tag = state.get(action.tag.name);

      _.remove(tag!.images, action.image);
      return new Map(state.set(tag!.name, tag!));
    case "add_tag":
      return new Map(state.set(action.tag.name, action.tag));
    case "replace_tags":
      return new Map(action.tags);
  }
}

function TagsProvider(props: {
  tags: TagCollection;
  children: React.ReactNode;
}) {
  const tags = useRef(props.tags);
  const [state, dispatch] = useReducer(tagsReducer, props.tags);

  useEffect(() => {
    if (tags.current !== props.tags) {
      tags.current = props.tags;
      dispatch({ type: "replace_tags", tags: props.tags });
    }
  });

  const value = { state, dispatch };

  return (
    <TagsContext.Provider value={value}>{props.children}</TagsContext.Provider>
  );
}

function useTags() {
  const tags = useContext(TagsContext);

  if (tags) {
    return { tags: tags.state, dispatchTags: tags.dispatch };
  } else {
    throw new Error("Tags not provided");
  }
}

export { TagsProvider, useTags };
