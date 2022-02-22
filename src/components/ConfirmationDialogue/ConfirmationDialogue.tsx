import { ForwardedRef, forwardRef } from "react";
import type { IButton } from "src/styled";
import styled from "styled-components";
import { Button } from "..";

const DialogueDiv = styled.div`
  padding: 32px;
  background-color: ${(props) => props.theme.color.bg.secondary};
`;

const ButtonDiv = styled.div`
  display: flex;
  justify-content: flex-end;
`;

interface ConfirmationDialogueProps {
  closeCallback: Function;
  title?: string;
  text?: string;
  acceptText?: string;
  cancelText?: string;

  acceptColor?: IButton;
  cancelColor?: IButton;

  onAccept?: Function;
}

export default forwardRef(function ConfirmationDialogue(
  props: ConfirmationDialogueProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <DialogueDiv ref={ref}>
      <h1>{props.title}</h1>
      <br />
      <p>{props.text}</p>
      <br />
      <ButtonDiv>
        <Button onClick={() => (props.onAccept ? props.onAccept() : {})}>
          {props.acceptText ?? "Accept"}
        </Button>
        <Button onClick={() => props.closeCallback()}>
          {props.cancelText ?? "Cancel"}
        </Button>
      </ButtonDiv>
    </DialogueDiv>
  );
});
