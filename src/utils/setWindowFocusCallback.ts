import { LooseFunction } from "../core/utilTypes";

export default function (onFocus: LooseFunction, onBlur: LooseFunction) {
  const cb = function () {
    if (document.hasFocus()) {
      onFocus();
    } else {
      onBlur();
    }
  };
  window.addEventListener("focus", cb);
  window.addEventListener("blur", cb);

  // initialize
  cb();
}
