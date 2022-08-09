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
  // <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
  const rankTable = createTable([
    ["Key", "Count"],
    ...sortedCounts.map((c) => [
      { body: `<kbd>${c[0]}</kbd>` },
      { body: c[1].toString() },
    ]),
  ]);
  const kbdTable = createTable([
    ['escape', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', 'backspace'], // prettier-ignore
    [" ", "tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"], // prettier-ignore
    [" ", "ctrl", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"], // prettier-ignore
    ["shift", "`", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "\\", "shift"], // prettier-ignore
    [" ", " ", " ", " ", "alt", "cmd", "space", "shift", " ", " ", " ", " ", " ", ""], // prettier-ignore
  ]);

  panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Keybindings.json info</title>
</head>
<body>
  <h1>keybindings.json Info</h1>
  <h2>Configurations</h2>
  ${kbs.length}

  <h2>Count</h2>
  ${rankTable}
  ${kbdTable}
</body>
</html>`;
}

function createTable(
  columns: (string | { body: string; params?: string; header?: boolean })[][]
) {
  const toCell = (
    body: string | { body: string; params?: string; header?: boolean }
  ): string => {
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
