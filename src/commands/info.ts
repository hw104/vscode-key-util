import * as vscode from "vscode";
import { getKeybindings, getKeybindingsPaths } from "../common";
import { KeyInfo } from "../types/keybinding";

export async function infoHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getKeybindingsPaths(context);
  const kbs = getKeybindings(path);
  const counter: Record<string, number> = {};
  for (const kb of kbs) {
    const info = KeyInfo.fromKeybinding(kb);
    for (const step of info.steps) {
      for (const key of step.keys) {
        counter[key.src] = (counter[key.src] ?? 0) + 1;
      }
    }
  }
  const sortedCounts = Object.entries(counter).sort((a, b) => b[1] - a[1]);
  const panel = vscode.window.createWebviewPanel(
    "openPreview",
    "Keybindings.json info",
    vscode.ViewColumn.Two
  );

  const getR = (distribution: number, shift: number): number => {
    if (distribution > 1) {
      distribution = 1;
    }
    if (distribution < 0) {
      distribution = 0;
    }
    let r = Math.round(255 * distribution) + shift;
    if (r > 255) {
      r = 255;
    }
    if (r < 0) {
      r = 0;
    }
    return r;
  };
  const getGradi = (distribution: number) => {
    const c = [
      getR(distribution, 50), // R
      0, // getR(numerator, denominator, 0), // G
      getR(distribution, -150), // B
    ];
    return c.map((e) => e.toString(16).padStart(2, "0")).join("");
  };

  // <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  const rankTable = createTable([
    ["Key", "Count"],
    ...sortedCounts.map((c) => [
      { body: `<kbd>${c[0]}</kbd>` },
      { body: c[1].toString() },
    ]),
  ]);
  const kbdTable = createTable(
    [
      ['escape', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', 'backspace'], // prettier-ignore
      [{body: "tab", params: 'colspan="2"'}, "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"], // prettier-ignore
      [{body: "ctrl", params: 'colspan="2"'}, "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"], // prettier-ignore
      ["shift", "`", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "\\", "shift"], // prettier-ignore
      [" ", " ", " ", " ", "alt", {body: "cmd", params: 'colspan="2"'}, {body: "space", params: 'colspan="2"'}, {body: "shift", params: 'colspan="2"'}, " ", " ", " "], // prettier-ignore
    ].map((col) =>
      col.map((cel) => {
        const body: string = typeof cel === "string" ? cel : cel.body;
        const params = typeof cel === "string" ? "" : cel.params;
        const grad = (counter[body] ?? 0) / 100;
        const rgb = getGradi(grad);
        const bg = grad !== 0 ? `bgcolor="#${rgb}"` : "";
        return {
          body,
          params: `${params} ${bg}`,
        };
      })
    )
  );

  const style = `<style>
span:before {
    content: "";
    // border-style: solid;
    // border-width: 0 15px 15px 15px;
    // border-color:  transparent transparent rgba(0,102,255,.5) transparent;
    height: 0;
    position: absolute;
    top: -17px;
    width: 0;
}

span {
    // background-color: rgba(0,102,255,.15);
    // border: 2px solid rgba(0,102,255,.5);
    border-radius: 10px;
    color: #000;
    display: none;
    padding: 10px;
    position: relative;
}

input {
    display: block
}

input.show-tooltip:hover + span {
    display: inline-block;
    margin: 10px 0 0 10px
}  
</style>`;

  panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Keybindings.json info</title>
  ${style}
</head>
<body>
  <h1 title="hoge">keybindings.json Info</h1>
  <h2>Configurations</h2>
  ${kbs.length}
  <h2>Count</h2>
  ${rankTable}
</body>
</html>`;
}

type Cell = string | { body: string; params?: string; header?: boolean };

function createTable(columns: Cell[][]) {
  const toCell = (body: Cell): string => {
    if (typeof body === "string") {
      return `<td align="center">${body}</td>`;
    }
    const tag = body.header ? "th" : "td";
    return `<${tag} align="center" ${body.params}>${body.body}</${tag}>`;
  };

  return `
<table border="1" cellpadding="6">
    ${columns.map((c) => `<tr>${c.map(toCell).join("\n")}</tr>`).join("\n")}
</table>
`;
}
