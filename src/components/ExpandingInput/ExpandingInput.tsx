import {
  forwardRef,
  useRef,
  useState,
  HTMLProps,
  useCallback,
  useEffect,
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
    containerStyle: React.CSSProperties | undefined;
  } & HTMLProps<HTMLInputElement>
>(function ExpandingInput(props, ref) {
  const parentRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");

  const onChange = useCallback((text: string) => {
    setText(text + (text === "" ? "" : "_"));
  }, []);

  useEffect(() => {
    onChange(props.value as string);
  }, [onChange, props.value]);

  const { containerStyle, ...passProps } = props;

  return (
    <Container ref={parentRef} style={containerStyle}>
      <input
        ref={ref}
        type="text"
        {...passProps}
        onChange={(e) => {
          if (props.onChange) props.onChange(e);
          onChange(e.target.value);
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
          zIndex: 0
        }}
      >
        {text}
      </div>
    </Container>
  );
});
