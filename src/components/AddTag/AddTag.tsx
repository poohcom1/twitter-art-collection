import { useCallback, useRef, useState } from "react";
import { useStore } from "src/stores/rootStore";
import { standardizeTagName, validateTagName } from "src/utils/tagUtils";

export default function AddTag(props: { onFinish: () => void }) {
  const tagList = useStore((state) => Array.from(state.tags.keys()));
  const addTag = useStore((state) => state.addTag);

  const inputRef = useRef<HTMLInputElement>(null);
  const [tagName, setTagName] = useState("");

  const tagInputHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTagName(standardizeTagName(e.target.value));
    },
    []
  );

  const onKeyUpHandler = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (tagName !== "") {
          const tagError = validateTagName(tagName, tagList);

          if (tagError) {
            alert(tagError);

            return;
          }

          const body: PostTagBody = {
            name: tagName,
            images: [],
          };

          addTag(body);
        }

        setTagName("");
        props.onFinish();
      }
    },
    [addTag, props, tagList, tagName]
  );

  return (
    <input
      ref={inputRef}
      type="text"
      value={tagName}
      onChange={tagInputHandler}
      onKeyUp={onKeyUpHandler}
      placeholder="Enter a new tag name..."
    />
  );
}
