import { ChangeEvent, forwardRef, HTMLProps, useCallback, useRef } from "react";
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
  }

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
  }
`;

export default forwardRef<
  HTMLInputElement,
  { minWidth: string } & HTMLProps<HTMLInputElement>
>(function ExpandingInput(props, ref) {
  const parentRef = useRef<HTMLDivElement>(null);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.parentNode) {
      (e.target.parentNode as HTMLElement).dataset.value =
        e.target.value.replaceAll(" ", "_") + "_";
    }
  }, []);

  return (
    <Container
      className="input-sizer"
      ref={parentRef}
      style={{ minWidth: props.minWidth }}
    >
      <input type="text" onChange={onChange} {...props} ref={ref} />
    </Container>
  );
});
