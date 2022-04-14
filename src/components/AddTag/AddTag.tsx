import { KeyboardEventHandler, useCallback, useRef, useState } from "react";
import { useStore } from "src/stores/rootStore";
import { standardizeTagName, validateTagName } from "src/utils/tagUtils";
import styled from "styled-components";

const StyledInput = styled.input`
  height: 30px;
`;

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

  const onKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (tagName !== "") {
          const tagError = validateTagName(tagName, tagList);

          if (tagError) {
            alert(tagError);

            return;
          }

          const body: TagSchema = {
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
    <StyledInput
      ref={inputRef}
      type="text"
      value={tagName}
      onChange={tagInputHandler}
      onKeyUp={onKeyUpHandler}
      placeholder="Enter a new tag name..."
    />
  );
}
