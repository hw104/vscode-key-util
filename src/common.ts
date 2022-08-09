import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Keybinding } from "./types/keybinding";

export function getKeybindingsPaths(context: vscode.ExtensionContext): string {
  const globalStorage = context.globalStorageUri.path;
  const codePath = path.resolve(globalStorage, "../../..");
  const userPath = path.resolve(codePath, "User");
  return path.resolve(userPath, "keybindings.json");
}

export function getKeybindings(path: string): Keybinding[] {
  return JSON.parse(fs.readFileSync(path).toString());
}

export function writeKeybindings(path: string, kbs: Keybinding[]) {
  const str = JSON.stringify(kbs, null, 4);
  fs.writeFileSync(path, str);
}

export function keybindingToString(kb: Keybinding): string {
  return `{"key":"${kb.key}","command":"${kb.command}"${
    kb.when == null ? "" : `,"when":"${kb.when}"`
  }}`;
}
