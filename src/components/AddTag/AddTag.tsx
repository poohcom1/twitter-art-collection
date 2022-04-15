import {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "src/stores/rootStore";
import {
  standardizeTagName,
  TagErrors,
  validateTagName,
} from "src/utils/tagUtils";
import styled from "styled-components";

const StyledInput = styled.input`
  height: 30px;
  outline: none;
`;

export default function AddTag(props: {
  onFinish: (error: TagErrors, text: string) => void;
  onChange?: (text: string) => void;
}) {
  const tagList = useStore((state) => Array.from(state.tags.keys()));
  const addTag = useStore((state) => state.addTag);

  const inputRef = useRef<HTMLInputElement>(null);
  const [tagName, setTagName] = useState("");

  const tagInputHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = standardizeTagName(e.target.value);
      if (props.onChange) props.onChange(text);
      setTagName(text);
    },
    [props]
  );

  const onKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        let tagError: TagErrors = "";
        if (tagName !== "") {
          tagError = validateTagName(tagName, tagList);

          if (tagError) {
            props.onFinish(tagError, tagName);

            return;
          }

          const body: TagSchema = {
            name: tagName,
            images: [],
          };

          addTag(body);
        }

        setTagName("");
        props.onFinish("", tagName);
      }
    },
    [addTag, props, tagList, tagName]
  );

  useEffect(() => {
    if (inputRef.current) inputRef.current.select();
  }, []);

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
