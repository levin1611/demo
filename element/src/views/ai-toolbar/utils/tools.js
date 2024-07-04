import { Message } from "element-ui";

const defaultDropWidth = 480;
const defaultDropHeight = 240;
const defaultResultWidth = 800;
const defaultResultHeight = 520;
const defaultRefWidth = 420;
const defaultButtonsWidth = 71;

export const getFocusedArea = () => {
  const focusedArea = document.activeElement;
  if (!focusedArea) {
    return;
  }
  const rect = focusedArea.getBoundingClientRect();
  return { top: rect.top + 30, left: rect.left };
};

export const getInputSelectedText = () => {
  let result;
  const activeTextarea = document.activeElement;

  if (activeTextarea) {
    const start = activeTextarea.selectionStart;
    const end = activeTextarea.selectionEnd;
    result = {
      text: activeTextarea.value.substring(start, end).trim(),
      start,
      end,
    };
  }

  return result;
};

export const getSelectedText = () => {
  let result;

  const selection = window.getSelection();
  if (selection && selection.toString().length !== 0) {
    result = {
      text: selection.toString(),
      selection,
    };
  }

  return result;
};

export const getPosition = (type, mouseX, mouseY, slashPos) => {
  const { innerWidth: wholeWidth, innerHeight: screenHeight } = window;
  const calcWidth =
    type === "inputBoxSlash" ? defaultDropWidth : defaultButtonsWidth;
  const position =
    type === "inputBoxSlash"
      ? slashPos
        ? slashPos
        : getFocusedArea()
      : {
          top: mouseY + 15,
          left: mouseX,
        };

  const offsetRight = wholeWidth - position.left - calcWidth;
  if (offsetRight < 0) {
    position.left = position.left + offsetRight - 10;
  }

  const offsetBottom = screenHeight - position.top - defaultDropHeight;
  if (offsetBottom < 0) {
    const calcVal = slashPos ? -25 : 30;
    position.bottom = defaultDropHeight + offsetBottom + calcVal;
    delete position.top;
  }

  return position;
};

export const getRePosition = (position, isShort = false) => {
  const calcWidth = isShort ? defaultDropWidth : defaultResultWidth;
  const calcHeight = isShort ? defaultDropHeight : defaultResultHeight;

  const { innerWidth: wholeWidth, innerHeight: screenHeight } = window;
  const { top, left } = position;

  const rePosition = { top, left };

  const marginRight = wholeWidth - left - calcWidth;
  if (marginRight < 0) {
    rePosition.left = left + marginRight - 10;
  }

  const offsetBottom = screenHeight - top - calcHeight;
  if (offsetBottom < 0) {
    let bottom = calcHeight + offsetBottom + 30;
    const offsetTop = screenHeight - bottom - calcHeight;
    if (offsetTop < 0) {
      rePosition.top = top + offsetBottom - 10;
    } else {
      rePosition.bottom = bottom;
      delete rePosition.top;
    }
  }

  return rePosition;
};

export const getOpenRefPos = (position, isLeft, isShort = false) => {
  if (!isLeft) {
    return;
  }
  const openRefPos = { ...position };
  if (position.left < defaultRefWidth) {
    openRefPos.left = defaultRefWidth + 10;
    return openRefPos;
  } else {
    const { left: preLeft } = getRePosition(position, isShort);
    return { ...position, left: preLeft };
  }
};

export const getReferencePosition = (ref, isAbove) => {
  const ver = isAbove ? { bottom: 0 } : { top: 0 };
  const { innerWidth: wholeWidth, innerHeight: screenHeight } = window;
  const rect = ref.getBoundingClientRect();

  const marginBottom = screenHeight - rect.top - defaultResultHeight;
  if (!isAbove && marginBottom < 0) {
    ver.top = `${marginBottom}px`;
  }

  const marginRight = wholeWidth - rect.right;
  if (marginRight > defaultRefWidth) {
    return {
      right: `${-defaultRefWidth - 5}px`,
      ...ver,
    };
  }
  return {
    left: `${-defaultRefWidth - 5}px`,
    ...ver,
  };
};

export async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    Message.success("复制成功！");
  } catch {
    Message.error("无法复制文本");
  }
}

export const coverText = (text, v, result) => {
  return `${text.substring(0, result.start)}${v}${text.substring(result.end)}`;
};

export const insertText = (text, v, result) => {
  return `${text.slice(0, result.end)}${v}${text.slice(result.end)}`;
};

export const autoSelectedNode = (
  value,
  inputDiv,
  aiRange,
  text = "",
  isCover
) => {
  const node = document.createElement("span");
  node.innerHTML = isCover ? value : text + value;

  if (aiRange) {
    aiRange.deleteContents();
  }

  if (aiRange) {
    aiRange.insertNode(node);
  } else {
    inputDiv.append(node);
  }

  const range = document.createRange();
  range.selectNode(node);
  window.getSelection().addRange(range);
};

// handle with rich text
export const aiToolId = "aiToolBarPlaceholder";
export const replaceText = ">/ai<";
export const aiToolIdText = `<span id="${aiToolId}"></span>`;
export const aiToolIdRegex = new RegExp("/ai", "i");

export const shouldUseAiToolBar = (oriContent) => {
  return oriContent.toLowerCase().includes(replaceText);
};

export const getSlashPos = (iframe) => {
  const frameRect = iframe.getBoundingClientRect();
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  const el = doc.querySelector(`span#${aiToolId}`);
  if (el) {
    const pos = el.getBoundingClientRect();

    const { left, top } = frameRect;
    return {
      left: left + pos.x - 18,
      top: top + pos.y,
    };
  }
};
