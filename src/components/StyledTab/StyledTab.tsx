/**
 * A toggled tab with an non-active and active state
 */

import { HTMLAttributes } from "react";
import styled from "styled-components";

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  color?: string;
  textColor?: string;
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
  border-color: ${(props) => props.color ?? props.theme.color.secondary};

  font: 1.1em;
  font-weight: 700;
  border-width: 2px;
  border-style: solid;

  &:hover,
  &:focus {
    opacity: 70%;
  }

  &:active {
    color: ${(props) => props.theme.color.onAccent};
    background-color: ${(props) => props.theme.color.accent};
    border-color: ${(props) => props.theme.color.onAccent};
  }

  ${(props) =>
    props.active
      ? `
    color: ${props.theme.color.onAccent};
    background-color: ${props.theme.color.accent};
    border-color: ${props.theme.color.onAccent};
    `
      : ""}

  transition: color 0.1s, background-color 0.1s, border-color 0.1s;
`;
export default StyledTab;
