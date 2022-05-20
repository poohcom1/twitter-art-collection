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

  const tagList = useStore((state) => state.getTagList());
  const addTag = useStore((state) => state.addTag);
  const setSelectedList = useStore((state) => state.setSelectedList);

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
    tagError = validateTagName(
      tagName,
      tagList.map((t) => t.name)
    );

    if (tagError) {
      if (onFinish) {
        onFinish(tagError, tagName);
      }

      return;
    }

    const newTag: TagSchema = {
      name: tagName,
      images: [],
    };

    addTag(newTag);
    setSelectedList([tagName]);

    setTagName("");
    if (onTextChanged) onTextChanged("");
    if (onFinish) onFinish("", tagName);
  }, [addTag, onFinish, onTextChanged, setSelectedList, tagList, tagName]);

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
      onInput: inputHandler,
      onKeyUp: onKeyUpHandler,
    },
  };
}
