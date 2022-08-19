import * as vscode from "vscode";
import {
  getKeybindings,
  getKeybindingsPaths,
  keybindingToString,
  showSavePrompt,
  writeKeybindings,
} from "../common";
import { Keybinding, KeyInfo } from "../types/keybinding";
import { compareKeybinding } from "./sort";

export async function applyAliasHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getKeybindingsPaths(context);
  const kbs = getKeybindings(path);

  const originKey = await vscode.window.showInputBox({ title: "Origin Key" });
  if (originKey == null || originKey.length === 0) {
    throw new Error("Please specify valid key");
  }
  const aliasKey = await vscode.window.showInputBox({ title: "Origin Key" });
  if (aliasKey == null || aliasKey.length === 0) {
    throw new Error("Please specify valid key");
  }

  const merged = calcAlias(kbs, originKey, aliasKey).sort(compareKeybinding);
  const dist = await showSavePrompt(path);
  writeKeybindings(dist, merged);
  vscode.window.showInformationMessage(`Saved to ${dist}`);
}

export function calcAlias(
  kbs: Keybinding[],
  origin: string,
  alias: string
): Keybinding[] {
  const merged = kbs.reduce<Keybinding[]>((prev, current) => {
    return [
      ...prev,
      current,
      {
        ...current,
        key: KeyInfo.fromKeybinding(current).replace(origin, alias).toString(),
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
