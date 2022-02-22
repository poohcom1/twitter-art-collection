import { HTMLAttributes } from "react";
import type { IButton } from "src/styled";
import styled from "styled-components";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  palette?: IButton;
  selected?: boolean;
}

const Button = styled.button<ButtonProps>`
  color: ${(props) =>
    props.palette ? props.palette.text : props.theme.color.button.text};
  background-color: ${(props) =>
    props.palette ? props.palette.main : props.theme.color.button.main};
  padding: 5px 15px;
  cursor: pointer;

  border-color: ${(props) =>
    props.palette ? props.palette.main : props.theme.color.button.main};
  border-radius: 5em;
  margin: 8px;
  padding: 16px;
  font-size: 1.1em;

  &:hover {
    color: ${(props) =>
      props.palette ? props.palette.text : props.theme.color.button.text};
    background-color: ${(props) =>
      props.palette ? props.palette.hover : props.theme.color.button.hover};
    border-color: ${(props) =>
      props.palette ? props.palette.hover : props.theme.color.button.hover};
  }

  &:active {
    color: ${(props) =>
      props.palette
        ? props.palette.textSelected
        : props.theme.color.button.textSelected};
    background-color: ${(props) =>
      props.palette
        ? props.palette.selected
        : props.theme.color.button.selected};
  }
`;

export default Button;
