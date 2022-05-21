import { tabbable } from "tabbable";

export function tabIndexOnKeyDown(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.stopPropagation();
    e.preventDefault();

    const tabbableElems = tabbable(document.body);

    tabbableElems[
      tabbableElems.indexOf(e.currentTarget) + (e.key === "ArrowDown" ? 1 : -1)
    ]?.focus();
  }
}
