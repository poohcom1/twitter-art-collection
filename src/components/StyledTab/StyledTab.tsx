import { HTMLAttributes } from "react";
import styled from "styled-components";

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  color?: string;
  colorHover?: string;
}

const StyledTab = styled.button<TabProps>`
  cursor: pointer;
  background-color: var(--primary);

  width: fit-content;
  margin: 4px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: ${(props) =>
    props.theme.color.primary[props.active ? "textActive" : "text"]};
  background-color: ${(props) =>
    props.color
      ? props.color
      : props.theme.color.primary[props.active ? "active" : "default"]};
  border-color: ${(props) =>
    props.color
      ? props.color
      : props.theme.color.primary[props.active ? "active" : "default"]};

  font: 1.1em;
  font-weight: 700;
  border-width: 2px;
  border-style: solid;

  &:hover {
    background-color: ${(props) => props.theme.color.primary.hover};
    border-color: ${(props) => props.theme.color.primary.hover};
  }

  transition: color 0.1s, background-color 0.1s, border-color 0.1s;
`;

export default StyledTab;
