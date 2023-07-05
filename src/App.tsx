import React, { useMemo, useState } from "react";
import "./App.css";

const sourceElementId = "buttons_source";

export default function App() {
  const parts = useMemo(() => createParts(), []);
  const [guessedPartsCount, setGuessedPartsCount] = useState(insignificantPartsCount(parts, 0));

  return (
    <div>
      <AnswerBuilding parts={parts} guessedPartsCount={guessedPartsCount} />
      <Buttons parts={parts} guessedPartsCount={guessedPartsCount} setGuessedPartsCount={setGuessedPartsCount} />
    </div>
  );
}

function AnswerBuilding(props: { parts: Part[]; guessedPartsCount: number }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      {props.parts.map((part, partIndex) => {
        return (
          <span
            key={partIndex}
            ref={(ref) => {
              if (ref) {
                ref.innerHTML = "";
                ref.appendChild(part.html.cloneNode(true));
              }
            }}
            style={{ visibility: partIndex < props.guessedPartsCount ? "visible" : "hidden", margin: "0px" }}
          ></span>
        );
      })}
    </div>
  );
}

function Buttons(props: { parts: Part[]; guessedPartsCount: number; setGuessedPartsCount: (guessedPartsCount: number) => void }) {
  const buttonsPermutation = useMemo(() => createRandomPermutation(props.parts.length), [props.parts]);

  const [usedButtons, setUsedButtons] = useState(new Set<number>());

  return (
    <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "10px" }}>
      {buttonsPermutation.map((partIndex) => {
        const part = props.parts[partIndex];
        if (part.isSignificant) {
          return (
            <button
              key={partIndex}
              ref={(ref) => {
                if (ref) {
                  ref.innerHTML = "";
                  ref.appendChild(part.html.cloneNode(true));
                }
              }}
              style={{ padding: "10px", fontSize: "xxx-large" }}
              onClick={(e) => {
                if (props.parts[partIndex].html.textContent === props.parts[props.guessedPartsCount].html.textContent) {
                  const newUsedButtons = new Set(usedButtons);
                  newUsedButtons.add(partIndex);
                  setUsedButtons(newUsedButtons);

                  const newGuessedPartsCount = props.guessedPartsCount + 1 + insignificantPartsCount(props.parts, props.guessedPartsCount + 1);
                  props.setGuessedPartsCount(newGuessedPartsCount);

                  if (newGuessedPartsCount === props.parts.length) {
                    revealAnswer();
                  }
                }
              }}
              disabled={usedButtons.has(partIndex)}
            ></button>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}

function createParts() {
  const sourceElement = getSourceElement();

  let parts: Part[] = [];

  Array.from(sourceElement.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.nodeName === "BR") {
        parts.push({ isSignificant: false, html: node.cloneNode(true) });
      } else {
        parts.push({ isSignificant: true, html: node.cloneNode(true) });
      }
    }
    if (node.nodeType === Node.TEXT_NODE) {
      let accumulatedText = "";
      let accumulatedTextSignificant = null;

      const nodeText = node.textContent ?? "";

      for (let i = 0; i < nodeText.length; ++i) {
        const nodeChar = nodeText[i];

        const nodeCharSignificant = nodeCharIsSignificant(nodeChar);

        if (accumulatedText !== "" && (accumulatedTextSignificant !== nodeCharSignificant || accumulatedTextSignificant)) {
          parts.push({ isSignificant: accumulatedTextSignificant!, html: document.createTextNode(accumulatedText) });
          accumulatedText = "";
          accumulatedTextSignificant = null;
        }

        accumulatedText += nodeChar;
        accumulatedTextSignificant = nodeCharSignificant;
      }

      if (accumulatedText !== "") {
        parts.push({ isSignificant: accumulatedTextSignificant!, html: document.createTextNode(accumulatedText) });
      }
    }
  });

  return parts;
}

function nodeCharIsSignificant(nodeChar: string) {
  if (
    nodeChar === "：" ||
    nodeChar === "、" ||
    nodeChar === "。" ||
    nodeChar === " " ||
    nodeChar === "\r" ||
    nodeChar === "\n" ||
    nodeChar === "\t" ||
    nodeChar === "[" ||
    nodeChar === "]" ||
    nodeChar === "［" ||
    nodeChar === "］" ||
    nodeChar === "(" ||
    nodeChar === ")" ||
    nodeChar === "（" ||
    nodeChar === "）" ||
    nodeChar === "/" ||
    nodeChar === "／" ||
    nodeChar === "~" ||
    nodeChar === "・" ||
    nodeChar === "「" ||
    nodeChar === "」"
  ) {
    return false;
  }

  return true;
}

function getSourceElement() {
  const sourceElement = document.getElementById(sourceElementId) as HTMLElement;

  if (sourceElement === null) {
    throw new Error(`Source element with ID ${sourceElementId} was not found.`);
  }

  return sourceElement;
}

function insignificantPartsCount(parts: Part[], startIndex: number) {
  let count = 0;

  for (let i = startIndex; i < parts.length; ++i) {
    if (parts[i].isSignificant) {
      break;
    } else {
      ++count;
    }
  }

  return count;
}

function revealAnswer() {
  const windowWithAnything = window as any;

  if (windowWithAnything.study !== undefined && windowWithAnything.study.drawAnswer !== undefined) {
    windowWithAnything.study.drawAnswer();
  } else if (windowWithAnything.showAnswer !== undefined) {
    windowWithAnything.showAnswer();
  } else {
    alert("completed");
  }
}

function createRandomPermutation(length: number) {
  let result = Array.from(Array(length).keys());

  shuffleArray(result);

  return result;
}

// https://stackoverflow.com/a/12646864/7164302
function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

interface Part {
  isSignificant: boolean;
  html: Node;
}
