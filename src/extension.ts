import * as vscode from "vscode";
import { applyAliasHandler } from "./commands/apply_alias";
import { applyAllAliasesHandler } from "./commands/apply_all_aliases";
import { infoHandler } from "./commands/info";
import { sortHandler } from "./commands/sort";
import { ErrorWithAction } from "./types/error";

export function activate(context: vscode.ExtensionContext) {
  const handler = async (cb: () => Promise<unknown>) => {
    try {
      await cb();
    } catch (e) {
      if (e instanceof ErrorWithAction) {
        const res = await vscode.window.showErrorMessage(
          e.message,
          ...Object.keys(e.actions)
        );
        if (res !== undefined) {
          await e.actions[res]();
        }
      } else {
        vscode.window.showErrorMessage(`${e}`);
        if (context.extensionMode === vscode.ExtensionMode.Development) {
          throw e;
        }
      }
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("key-util.sort", () =>
      handler(() => sortHandler(context))
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("key-util.info", () =>
      handler(() => infoHandler(context))
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("key-util.applyAlias", () =>
      handler(() => applyAliasHandler(context))
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("key-util.applyAllAliases", () =>
      handler(() => applyAllAliasesHandler(context))
    )
  );
}

export function deactivate() {}
