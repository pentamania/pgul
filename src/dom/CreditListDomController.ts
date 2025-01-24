// Shorthands
const Element = document.createElement.bind(document);

const displayType: CSSStyleDeclaration["display"] = "flex";
// WIP
interface Options {
  // addCloseButton?: boolean;
}
const optionsDefault: Required<Options> = {
  // addCloseButton: false,
};

export interface CreditItem {
  name: string;
  author: string;
  licenseText: string;
}
export type CreditItemList = CreditItem[];

/**
 * [WIP]
 * Makeshift DOM controller to show credits
 *
 * @param creditData
 * @returns controller object
 */
export function createCreditListDomController(
  creditData: CreditItemList,
  options: Options = optionsDefault
  // _style?: CSSStyleDeclaration
) {
  options = { ...optionsDefault, ...options };

  // outer: flexbox
  const outerElement = Element("div");
  outerElement.style.position = "fixed";
  outerElement.style.top = outerElement.style.left = "0";
  outerElement.style.width = "100vw";
  outerElement.style.height = "100vh";
  outerElement.style.display = displayType;
  outerElement.style.alignItems = "center";
  outerElement.style.justifyContent = "center";

  // Display Controll funcs
  const show = () => {
    outerElement.style.display = displayType;
    // containerEl.style.visibility = "visible";
  };
  const hide = () => {
    outerElement.style.display = "none";
    // containerEl.style.visibility = "hidden";
  };
  hide(); // as default state

  // Inner: Main container
  const containerElement = Element("div");
  Object.assign(containerElement.style, {
    width: "80vw",
    height: "90vh",
    padding: "0 1rem",
    overflowY: "scroll",
    position: "relative",
    backgroundColor: "hsla(0, 50%, 0%, 0.7)",
    color: "white",
  });
  outerElement.appendChild(containerElement);

  // // Title
  // const titleHeaderElement = Element("h2");
  // {
  //   titleHeaderElement.style.textAlign = "center";
  //   titleHeaderElement.textContent = "CREDITS";
  //   containerElement.append(titleHeaderElement);
  // }

  // List
  const listElement = Element("ul");
  {
    listElement.style.listStyle = "none";
    listElement.style.paddingInline = "0";
    creditData.forEach((item) => {
      const li = Element("li");
      listElement.appendChild(li);

      const nameEl = Element("h3");
      nameEl.style.overflowWrap = "break-word";
      // h.textContent = `${item.name} by ${item.author}`;
      nameEl.textContent = `${item.name}`;

      // const authorEl = Element("div");
      // authorEl.textContent = `by ${item.author}`;

      const descEl = Element("span"); // "pre"だと文字があふれる
      descEl.style.overflowWrap = "break-word";
      descEl.textContent = `${item.licenseText}`;

      li.append(
        nameEl,
        // authorEl,
        descEl,
        Element("hr")
      );
    });

    containerElement.appendChild(listElement);
  }

  // // Close button
  // if (options.addCloseButton) {
  //   const button = Element("button");
  //   button.type = "button";
  //   button.innerText = "✖";
  //   button.style.position = "fixed";
  //   button.style.top = "1rem";
  //   button.style.right = "1rem";
  //   button.onclick = () => hide();
  //   containerElement.appendChild(button);
  // }

  const scrollSettings: { deltaY: number; behavior: ScrollBehavior } = {
    deltaY: 120,
    behavior: "smooth",
  };
  return {
    /** Some references of elements used/各Element参照 */
    refs: {
      outerElement,
      containerElement,
      // titleHeaderElement,
      listElement,
    },

    // controls
    show,
    hide,
    mountTo(element: HTMLElement) {
      element.appendChild(outerElement);
    },
    scrollSettings,
    scrollUp() {
      containerElement.scrollBy({
        top: -this.scrollSettings.deltaY,
        behavior: this.scrollSettings.behavior,
      });
    },
    scrollDown() {
      containerElement.scrollBy({
        top: this.scrollSettings.deltaY,
        behavior: this.scrollSettings.behavior,
      });
    },
  };
}
