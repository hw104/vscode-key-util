import * as vscode from "vscode";
import {
  getKeybindings,
  getKeybindingsPaths,
  showSavePrompt,
  writeKeybindings,
} from "../common";
import { Keybinding, KeyInfo } from "../types/keybinding";

export async function sortHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getKeybindingsPaths(context);
  const kbs = getKeybindings(path);
  const sorted = kbs.sort(compareKeybinding);

  const dist = await showSavePrompt(path);
  if (dist != null) {
    writeKeybindings(dist, sorted);
    vscode.window.showInformationMessage(`Saved to ${dist}`);
  }
}

function zeroToNull(n: number): number | undefined {
  return n !== 0 ? n : undefined;
}

export function compareKeybinding(a: Keybinding, b: Keybinding): number {
  return (
    zeroToNull(KeyInfo.fromKeybinding(a).compare(KeyInfo.fromKeybinding(b))) ??
    zeroToNull(a.command.localeCompare(b.command)) ??
    zeroToNull((a.when ?? "").localeCompare(b.when ?? "")) ??
    0
  );
}
