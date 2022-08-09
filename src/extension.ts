import * as vscode from "vscode";
import { infoHandler } from "./commands/info";
import { sortHandler } from "./commands/sort";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "key-util" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("key-util.sort", () => sortHandler(context))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("key-util.info", () => infoHandler(context))
  );
}

export function deactivate() {}
