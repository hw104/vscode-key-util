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
  <table border="1" cellpadding="6">
    <tr> 
    <thead>
      <th>Key</th><th>Count</th> </tr>
    </thead>
    ${sortedCounts.map((c) => `
    <tr>
      <td align="center"><kbd>${c[0]}</kbd></td>
      <td align="center">${c[1]}</td>
    </tr>`).join('\n')}
  </table>

</body>
</html>`;
}
