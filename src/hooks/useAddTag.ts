import {
  standardizeTagName,
  TagErrors,
  validateTagName,
} from "lib/tagValidation";
import { useState, useCallback, KeyboardEventHandler, useRef } from "react";
import { useStore } from "src/stores/rootStore";

export function useAddTag<T extends HTMLElement>(
  onFinish?: (error: TagErrors, text: string) => void,
  onTextChanged?: (text: string) => void
) {
  const tagRef = useRef<T>(null);

  const tagList = useStore((state) => Array.from(state.tags.keys()));
  const addTag = useStore((state) => state.addTag);

  const [tagName, setTagName] = useState("");

  const tagSetText = useCallback(
    (text) => {
      const standardizedText = standardizeTagName(text);
      if (onTextChanged) {
        onTextChanged(standardizedText);
      }
      setTagName(standardizedText);
    },
    [onTextChanged]
  );

  const submit = useCallback(() => {
    let tagError: TagErrors = "";
    tagError = validateTagName(tagName, tagList);

    if (tagError) {
      if (onFinish) {
        onFinish(tagError, tagName);
      }

      return;
    }

    const body: TagSchema = {
      name: tagName,
      images: [],
    };

    addTag(body);

    setTagName("");
    if (onFinish) {
      onFinish("", tagName);
    }
  }, [addTag, onFinish, tagList, tagName]);

  const inputHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => tagSetText(e.target.value),
    [tagSetText]
  );

  const onKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        submit();
      } else if (e.key === "Escape") {
        tagRef?.current?.blur();
      }
    },
    [tagRef, submit]
  );

  return {
    tagRef,
    tagText: tagName,
    tagSetText,
    tagInputHandler: inputHandler,
    tagSubmitHandler: submit,
    tagKeyHandler: onKeyUpHandler,
    inputProps: {
      value: tagName,
      onChange: inputHandler,
      onKeyUp: onKeyUpHandler,
    },
  };
}
