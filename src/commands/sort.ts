import { Keybinding, KeyInfo } from "../types/keybinding";
import * as vscode from "vscode";
import * as fs from "fs";
import {
  getKeybindings,
  getKeybindingsPaths,
  writeKeybindings,
} from "../common";

export function sortKeybidings(kbs: Keybinding[]): Keybinding[] {
  return kbs
    .map((e) => new KeyInfo(e))
    .sort((a, b) => a.compare(b))
    .map((e) => e.src);
}

export async function sortHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getKeybindingsPaths(context);
  const kbs = getKeybindings(path);
  const sorted = sortKeybidings(kbs);
  const res = await vscode.window.showQuickPick([
    "Save new File",
    "Overwrite keybindings.json",
  ]);
  let dist: string | undefined;
  if (res === "Overwrite keybindings.json") {
    dist = path;
  }
  if (res === "Save new File") {
    const distUri = await vscode.window.showSaveDialog({
      saveLabel: "Save new file",
    });
    if (distUri != null) {
      dist = distUri.path;
    }
  }
  if (dist != null) {
    writeKeybindings(dist, sorted);
    vscode.window.showInformationMessage(`Saved to ${dist}`);
  }
}
