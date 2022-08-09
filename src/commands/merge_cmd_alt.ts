import * as vscode from "vscode";
import {
  getKeybindings,
  getKeybindingsPaths,
  keybindingToString,
  writeKeybindings,
} from "../common";
import { Keybinding, KeyInfo } from "../types/keybinding";
import { sortKeybidings } from "./sort";

export async function mergeCmdAltHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getKeybindingsPaths(context);
  const kbs = getKeybindings(path);

  const merged = mergeCmdAlt(kbs);
  const sorted = sortKeybidings(merged);

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

export function mergeCmdAlt(kbs: Keybinding[]): Keybinding[] {
  const merged = kbs.reduce<Keybinding[]>((prev, current) => {
    return [
      ...prev,
      current,
      {
        ...current,
        key: KeyInfo.fromKeybinding(current).replace("cmd", "alt").toString(),
      },
      {
        ...current,
        key: KeyInfo.fromKeybinding(current).replace("alt", "cmd").toString(),
      },
    ];
  }, []);

  const deduplicated = Object.values(
    merged.reduce<Record<string, Keybinding>>(
      (prev, current) => ({ ...prev, [keybindingToString(current)]: current }),
      {}
    )
  );

  return deduplicated;
}
