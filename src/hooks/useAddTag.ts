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

  const [text, _setText] = useState("");

  const setTagName = useCallback(
    (text) => {
      _setText(text);
      onTextChanged && onTextChanged(text);
    },
    [onTextChanged]
  );

  const tagSetText = useCallback(
    (text) => {
      const standardizedText = standardizeTagName(text);
      setTagName(standardizedText);
    },
    [setTagName]
  );

  const submit = useCallback(() => {
    let tagError: TagErrors = "";
    tagError = validateTagName(
      text,
      tagList.map((t) => t.name)
    );

    if (tagError) {
      if (onFinish) {
        onFinish(tagError, text);
      }

      return;
    }

    const newTag: TagSchema = {
      name: text,
      images: [],
    };

    addTag(newTag);
    setSelectedList([text]);

    setTagName("");
    if (onFinish) onFinish("", text);
  }, [addTag, onFinish, setSelectedList, setTagName, tagList, text]);

  const inputHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => tagSetText(e.target.value),
    [tagSetText]
  );

  const onKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        submit();
      } else if (e.key === "Escape") {
        setTagName("");
        tagRef?.current?.blur();
      }
    },
    [setTagName, submit]
  );

  return {
    tagRef,
    tagText: text,
    tagSetText,
    tagInputHandler: inputHandler,
    tagSubmitHandler: submit,
    tagKeyHandler: onKeyUpHandler,
    inputProps: {
      value: text,
      onInput: inputHandler,
      onKeyUp: onKeyUpHandler,
    },
  };
}
