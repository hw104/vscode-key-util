import * as vscode from "vscode";
import { sortHandler } from "./commands/sort";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "key-util" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand("key-util.sort", () => sortHandler(context))
  );
}

export function deactivate() {}
