import { HTMLAttributes } from "react";
import styled, { IButtonPalette } from "styled-components";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  palette?: IButtonPalette;
  color?: string;
  textColor?: string;
}

const StyledButton = styled.button<ButtonProps>`
  padding: 5px 15px;
  cursor: pointer;

  border-style: solid;
  border-radius: 5em;
  margin: 8px;
  padding: 16px;
  font-size: 1.1em;
  white-space: nowrap;

  height: 2.75em;

  display: flex;
  align-items: center;

  color: ${(props) => props.textColor ?? props.theme.color.onSecondary};
  background-color: ${(props) => props.color ?? props.theme.color.secondary};
  border-color: ${(props) => props.color ?? props.theme.color.secondary};

  &:hover {
    opacity: 70%;
  }

  &:focus {
    opacity: 70%;
  }

  &:active {
    color: ${(props) => props.theme.color.onAccent};
    background-color: ${(props) => props.theme.color.accent};
    border-color: ${(props) => props.theme.color.onAccent};
  }
`;

export default StyledButton;
