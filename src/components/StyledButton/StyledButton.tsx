import { HTMLAttributes } from "react";
import styled, { IButtonPalette } from "styled-components";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  palette?: IButtonPalette;
}

const StyledButton = styled.button<ButtonProps>`
  color: ${(props) =>
    props.palette ? props.palette.color : props.theme.color.button.color};
  background-color: ${(props) =>
    props.palette ? props.palette.bgColor : props.theme.color.button.bgColor};
  padding: 5px 15px;
  cursor: pointer;

  border-color: ${(props) =>
    props.palette ? props.palette.bgColor : props.theme.color.button.bgColor};
  border-style: solid;
  border-radius: 5em;
  margin: 8px;
  padding: 16px;
  font-size: 1.1em;

  &:hover {
    color: ${(props) =>
      props.palette ? props.palette.color : props.theme.color.button.color};
    background-color: ${(props) =>
      props.palette ? props.palette.bgHover : props.theme.color.button.bgHover};
    border-color: ${(props) =>
      props.palette ? props.palette.bgHover : props.theme.color.button.bgHover};
  }

  &:active {
    color: ${(props) =>
      props.palette ? props.palette.active : props.theme.color.button.active};
    background-color: ${(props) =>
      props.palette
        ? props.palette.bgActive
        : props.theme.color.button.bgActive};
  }
`;

export default StyledButton;
