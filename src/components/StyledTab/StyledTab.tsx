import { InputHTMLAttributes } from "react";
import styled from "styled-components";

interface TabProps extends InputHTMLAttributes<HTMLDivElement> {
  selected?: boolean;
}

const StyledTab = styled.div<TabProps>`
  cursor: pointer;
  background-color: var(--primary);

  width: fit-content;

  display: flex;
  justify-content: center;
  align-items: center;

  color: ${(props) =>
    props.theme.color.primary[props.selected ? "textSelected" : "text"]};
  background-color: ${(props) =>
    props.theme.color.primary[props.selected ? "selected" : "main"]};
  border-color: ${(props) =>
    props.theme.color.primary[props.selected ? "selected" : "main"]};

  font-weight: 700;
  border-width: 2px;
  border-style: solid;

  &:hover {
    background-color: ${(props) => props.theme.color.primary.hover};
    border-color: ${(props) => props.theme.color.primary.hover};
  }

  transition: all 0.1s;
`;

export default StyledTab;
