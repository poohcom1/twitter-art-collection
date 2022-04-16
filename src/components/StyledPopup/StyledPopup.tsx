import Popup from "reactjs-popup";
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
    background: white;
    border-radius: 15px;
    box-shadow: 4px 4px 15px;
    animation: anvil 0.15s cubic-bezier(0.38, 0.1, 0.36, 0.9) forwards;
  }

  &-arrow {
    color: white;
  }
`;

export const PopupItem = styled.button`
  display: block;
  background-color: transparent;

  text-align: left;
  width: 100%;

  border: none;
  outline: none;

  border-radius: 5px;

  padding: 3px 10px;
  cursor: pointer;
  font-size: 17px;

  &:hover {
    background-color: #00000019;
  }

  &:focus {
    background-color: #00000031;
  }
`;

export default StyledPopup;
