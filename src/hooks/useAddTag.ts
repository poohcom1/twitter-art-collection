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

  const setText = useCallback(
    (_text) => {
      _setText(_text);
      onTextChanged && onTextChanged(_text);
    },
    [onTextChanged]
  );

  const tagSetText = useCallback(
    (_text) => {
      const standardizedText = standardizeTagName(_text);
      setText(standardizedText);
    },
    [setText]
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

      console.warn(tagError);

      return;
    }

    const newTag: TagSchema = {
      name: text,
      images: [],
    };

    addTag(newTag);
    setSelectedList([text]);

    setText("");
    if (onFinish) onFinish("", text);
  }, [addTag, onFinish, setSelectedList, setText, tagList, text]);

  const inputHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => tagSetText(e.target.value),
    [tagSetText]
  );

  const onKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        submit();
      } else if (e.key === "Escape") {
        setText("");
        tagRef?.current?.blur();
      }
    },
    [setText, submit]
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
