import * as fs from "fs";
import * as JSONC from "jsonc-parser";
import * as vscode from "vscode";
import { Uri } from "vscode";
import { Keybinding } from "./types/keybinding";

export function getKeybindingsPaths(context: vscode.ExtensionContext): Uri {
  return Uri.joinPath(
    context.globalStorageUri,
    "../../../User/keybindings.json"
  );
}

export function getKeybindings(path: Uri): Keybinding[] {
  return JSONC.parse(fs.readFileSync(path.fsPath).toString());
}

export function writeKeybindings(path: Uri, kbs: Keybinding[]) {
  const str = JSON.stringify(kbs, null, 4);
  fs.writeFileSync(path.fsPath, str);
}

export function keybindingToString(kb: Keybinding): string {
  return `{"key":"${kb.key}","command":"${kb.command}"${
    kb.when == null ? "" : `,"when":"${kb.when}"`
  }}`;
}

export async function showSavePrompt(
  overwritePath: vscode.Uri
): Promise<vscode.Uri> {
  const res = await vscode.window.showQuickPick([
    "Save new File",
    "Overwrite keybindings.json",
  ]);
  if (res == null) {
    throw new Error("Invalid Path");
  }

  if (res === "Overwrite keybindings.json") {
    return overwritePath;
  }
  if (res === "Save new File") {
    const distUri = await vscode.window.showSaveDialog({
      saveLabel: "Save new file",
    });
    if (distUri == null) {
      throw new Error("Invalid Path");
    }
    return distUri;
  }

  throw new Error("Unreachable");
}
