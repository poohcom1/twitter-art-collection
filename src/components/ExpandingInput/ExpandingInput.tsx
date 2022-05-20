import {
  forwardRef,
  useRef,
  useState,
  HTMLProps,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  position: relative;
  width: fit-content;
  height: 100%;
  padding: 0;
  margin: 0;

  align-items: center;

  input {
    text-align: left;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font: inherit;
    padding: inherit;
    margin: 0;
    appearance: none;
    overflow: visible;
    z-index: 1;
  }
`;

export default forwardRef<
  HTMLInputElement,
  {
    containerStyle?: React.CSSProperties;
    autoSelect?: boolean;
  } & HTMLProps<HTMLInputElement>
>(function ExpandingInput(props, ref) {
  const parentRef = useRef<HTMLDivElement>(null);

  const internalRef = useRef<HTMLInputElement>(null);
  useImperativeHandle<
    HTMLInputElement | null,
    HTMLInputElement | null
  >(ref, () => internalRef.current);

  const [text, setText] = useState("");

  const onInput = useCallback((text: string) => {
    setText(text);
  }, []);

  useEffect(() => {
    onInput(props.value as string);
  }, [onInput, props.value]);

  const { containerStyle, autoSelect, ...htmlProps } = props;

  useEffect(() => {
    if (autoSelect) {
      if (internalRef && internalRef.current) {
        // Use settimeout to prevent auto scroll on focus
        const selectTimeout = setTimeout(
          () => internalRef.current?.select(),
          10
        );

        return () => clearTimeout(selectTimeout);
      }
    }
  }, [autoSelect, text.length]);

  return (
    <Container ref={parentRef} style={containerStyle}>
      <input
        ref={internalRef}
        type="text"
        {...htmlProps}
        onInput={(e) => {
          if (props.onInput) props.onInput(e);
          onInput((e.target as HTMLInputElement).value);
        }}
        onBlur={(e) => {
          if (props.onBlur) {
            props.onBlur(e);
          }
        }}
      />
      <div
        style={{
          color: "transparent",
          opacity: "0%",
          userSelect: "none",
          margin: 0,
          padding: 0,
          zIndex: 0,
        }}
      >
        {text}
      </div>
    </Container>
  );
});
