import { forwardRef, HTMLProps } from "react";
import { TagErrors } from "lib/tagValidation";
import { useAddTag } from "src/hooks/useAddTag";

interface AddTagProps {
  onFinish: (error: TagErrors, text: string) => void;
  onTextChanged?: (text: string) => void;
}
export default forwardRef<
  HTMLInputElement,
  AddTagProps & HTMLProps<HTMLInputElement>
>(function AddTag({ onFinish, onTextChanged, ...props }, ref) {
  const { inputProps } = useAddTag(onFinish, onTextChanged);

  return (
    <>
      <input
        {...props}
        ref={ref}
        type="text"
        style={{
          height: "30px",
          width: "100%",
          outline: "none",
          ...props.style,
        }}
        {...inputProps}
      />
    </>
  );
});
