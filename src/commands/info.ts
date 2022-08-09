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

  const getR = (
    numerator: number,
    denominator: number,
    shift: number
  ): number => {
    let r = Math.round(255 * (numerator / denominator)) + shift;
    if (r > 255) {
      r = 255;
    }
    if (r < 0) {
      r = 0;
    }
    return r;
    // return r.toString(16).padStart(2, "0");
  };
  const getGradi = (numerator: number, denominator: number) => {
    const c = [
      getR(numerator, denominator, 50), // R
      0, // getR(numerator, denominator, 0), // G
      getR(numerator, denominator, -150), // B
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
        return typeof cel === "string"
          ? { body: cel, params: `bgcolor="#${getGradi(counter[cel], 300)}"` }
          : {
              ...cel,
              body: cel.body + `(${counter[cel.body]})`,
              param: `${cel.params ?? ""} bgcolor="#${getGradi(
                counter[cel.body],
                300
              )}"`,
            };
      })
    )
  );

  panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Keybindings.json info</title>
</head>
<body>
${createTable(
  Array.from({ length: 10 }).map((_, i) =>
    Array.from({ length: 10 }).map((__, j) => {
      const g = getGradi(i * 10 + j, 100);
      return { body: g, params: `bgcolor="#${g}"` };
    })
  )
  // .map((_, i) => getGradi(i, 100))
  // .map((c) => ({ body: c, params: `bgcolor="#${c}"` })),
)}
  <h1>keybindings.json Info</h1>
  <h2>Configurations</h2>
  ${kbs.length}

  <h2>Count</h2>
  ${rankTable}
  ${kbdTable}
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
