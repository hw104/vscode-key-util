import * as vscode from "vscode";
import {
  getKeybindings,
  getKeybindingsPaths,
  showSavePrompt,
  writeKeybindings,
} from "../common";
import { ErrorWithAction } from "../types/error";
import { calcAlias } from "./apply_alias";
import { compareKeybinding } from "./sort";

export async function applyAllAliasesHandler(
  context: vscode.ExtensionContext
): Promise<void> {
  const path = getKeybindingsPaths(context);
  let kbs = getKeybindings(path);
  const aliases = vscode.workspace
    .getConfiguration("key-util")
    .get<string[]>("aliases");
  if (aliases == null) {
    throw createErrorWithAction("Aliases Configuration not found");
  }
  if (typeof aliases !== "object" || !Array.isArray(aliases)) {
    throw createErrorWithAction("Invalid Aliases Configuration");
  }

  for (const alias of aliases) {
    const [aliasKey, originKey] = alias.split("=");
    console.log(`${aliasKey} -> ${originKey}`);

    if (
      aliasKey == null ||
      aliasKey.length === 0 ||
      originKey == null ||
      originKey.length === 0
    ) {
      throw createErrorWithAction(
        `Invalid alias please check configuration: ${alias}`
      );
    }

    kbs = calcAlias(kbs, originKey, aliasKey);
  }
  kbs = kbs.sort(compareKeybinding);

  const dist = await showSavePrompt(path);
  writeKeybindings(dist, kbs);
  vscode.window.showInformationMessage(`Saved to ${dist}`);
}

function createErrorWithAction(msg: string) {
  return new ErrorWithAction(msg, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Open Configuration": async () =>
      await vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "key-util.aliases"
      ),
  });
}
