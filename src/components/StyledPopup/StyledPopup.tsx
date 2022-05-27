import Popup from "reactjs-popup";
import { applyOpacity } from "src/util/themeUtil";
import styled from "styled-components";

const StyledPopup = styled(Popup)`
  @keyframes anvil {
    0% {
      transform: scale(1) translateY(0px);
      opacity: 0;
    }
    1% {
      transform: scale(0.96) translateY(10px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }

  &-content {
    padding: 10px;
    background: ${(props) => props.theme.color.popup};
    color: ${(props) => props.theme.color.onPopup};
    border: 1px solid ${(props) => props.theme.color.popupBorder};
    border-radius: 10px;
    box-shadow: 0 0 5px ${(props) => props.theme.color.shadow};
    animation: anvil 0.15s cubic-bezier(0.38, 0.1, 0.36, 0.9) forwards;
  }

  &-arrow {
    z-index: 10;
    color: ${(props) => props.theme.color.popup};
  }
`;

export const PopupItem = styled.button<{ active?: boolean }>`
  color: ${(props) => props.theme.color.onPopup};

  display: block;
  background-color: transparent;

  text-align: left;
  width: 100%;

  border: none;

  border-radius: 5px;

  padding: 3px 10px;
  cursor: pointer;
  font-size: 17px;

  &:hover,
  &:focus {
    background-color: ${(props) =>
      applyOpacity(props.theme.color.onPopup, 0.2)};
  }

  outline: none;

  ${(props) =>
    props.active &&
    "background-color:" + applyOpacity(props.theme.color.onPopup, 0.2)};

  font-weight: 590;
`;

export default StyledPopup;
