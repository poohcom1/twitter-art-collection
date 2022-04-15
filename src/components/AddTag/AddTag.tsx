import {
  forwardRef,
  HTMLProps,
  KeyboardEventHandler,
  MutableRefObject,
  useCallback,
  useState,
} from "react";
import { useStore } from "src/stores/rootStore";
import {
  standardizeTagName,
  TagErrors,
  validateTagName,
} from "lib/tagValidation";

interface AddTagProps {
  onFinish: (error: TagErrors, text: string) => void;
  onTextChanged?: (text: string) => void;
}
export default forwardRef<
  HTMLInputElement,
  AddTagProps & HTMLProps<HTMLInputElement>
>(function AddTag({ onFinish, onTextChanged, ...props }, ref) {
  const tagList = useStore((state) => Array.from(state.tags.keys()));
  const addTag = useStore((state) => state.addTag);

  const [tagName, setTagName] = useState("");

  const tagInputHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = standardizeTagName(e.target.value);
      if (onTextChanged) onTextChanged(text);
      setTagName(text);
    },
    [onTextChanged]
  );

  const onKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === "Enter") {
        let tagError: TagErrors = "";
        if (tagName !== "") {
          tagError = validateTagName(tagName, tagList);

          if (tagError) {
            onFinish(tagError, tagName);

            return;
          }

          const body: TagSchema = {
            name: tagName,
            images: [],
          };

          addTag(body);
        }

        setTagName("");
        onFinish("", tagName);
      } else if (e.key === "Escape") {
        (ref as MutableRefObject<HTMLInputElement>)?.current?.blur()
      }
    },
    [addTag, onFinish, ref, tagList, tagName]
  );

  return (
    <>
      <input
        {...props}
        ref={ref}
        type="text"
        value={tagName}
        onChange={tagInputHandler}
        onKeyUp={onKeyUpHandler}
        onBlur={() => setTagName("")}
        style={{ height: "30px", width: "100%", outline: "none", ...props.style }}
      />
    </>
  );
});
