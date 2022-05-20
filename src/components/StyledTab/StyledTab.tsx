/**
 * A toggled tab with an non-active and active state
 */

import { HTMLAttributes } from "react";
import styled from "styled-components";

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  color?: string;
  borderColor?: string;
  textColor?: string;
  hoverOpacity?: number;
}

const StyledTab = styled.button<TabProps>`
  cursor: pointer;

  width: fit-content;
  margin: 4px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: ${(props) => props.textColor ?? props.theme.color.onSecondary};
  background-color: ${(props) => props.color ?? props.theme.color.secondary};
  border-color: ${(props) =>
    props.borderColor ?? props.theme.color.onSecondary};

  font: 1.1em;
  font-weight: 700;
  border-width: 2px;
  border-style: solid;
  white-space: nowrap;

  &:hover {
    opacity: ${(props) =>
      props.hoverOpacity ? props.hoverOpacity + "%" : "70%"};
  }

  ${(props) =>
    props.active
      ? `
    color: ${props.theme.color.onAccent};
    background-color: ${props.theme.color.accent};
    border-color: ${props.theme.color.onAccent};
    `
      : ""}
`;
export default StyledTab;
