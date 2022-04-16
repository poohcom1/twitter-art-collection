import { forwardRef, useRef, useState, HTMLProps, useCallback } from "react";
import styled from "styled-components";

const Container = styled.div<{ dataValue: string }>`
  display: flex;
  position: relative;
  width: fit-content;
  height: 100%;
  padding: 0;
  margin: 0;

  align-items: center;

  input {
    text-align: center;
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

    color: ${(props) => props.theme.color.onPrimary};
  }
`;

export default forwardRef<
  HTMLInputElement,
  { minWidth: string } & HTMLProps<HTMLInputElement>
>(function ExpandingInput(props, ref) {
  const parentRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");

  const onChange = useCallback((text: string) => {
    setText(text + "_");
  }, []);

  return (
    <Container
      ref={parentRef}
      style={{ minWidth: props.minWidth }}
      dataValue={text}
    >
      <input
        ref={ref}
        type="text"
        {...props}
        onChange={(e) => {
          if (props.onInput) props.onInput(e);
          onChange(e.target.value);
        }}
        onBlur={(e) => {
          if (props.onBlur) props.onBlur(e);
          setText("")
        }}
      />
      <div style={{ color: "transparent", opacity: "0%", userSelect: "none" }}>
        {text}
      </div>
    </Container>
  );
});
