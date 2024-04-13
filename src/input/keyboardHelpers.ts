let keyboardDefaultScrollingDisabled = false;

/**
 * Disables default arrow & space keys scrolling behavior via preventDefault
 */
export function disableKeyboardDefaultScrolling() {
  if (keyboardDefaultScrollingDisabled) return;
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.code === "Space"
    ) {
      e.preventDefault();
      keyboardDefaultScrollingDisabled = true;
    }
  });
}
