import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { parse, ParseError } from "jsonc-parser";

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const COMMAND_NAME = "merge-settings.sync";

async function mergeSettings(sourceSettingsContent: string, destinationFile: string) {
	let log = vscode.window.createOutputChannel("MergeSettings");

	// get source settings
	const sourceSettingsErrors: ParseError[] = [];
	const sourceSettings = parse(
		sourceSettingsContent,
		sourceSettingsErrors,
		{
			allowTrailingComma: true,
		}
	);
	if (sourceSettingsErrors.length > 0) {
		log.appendLine("Failed to parse source settings. Please make sure it contains correct JSON content.");
		throw new Error(
			"Failed to parse source settings. Please make sure it contains correct JSON content."
		);
	}

	// get destination settings
	const destinationSettingsContent = await readFile(destinationFile, {
		encoding: "utf8",
	});
	const destinationSettingsErrors: ParseError[] = [];
	let destinationSettings = parse(
		destinationSettingsContent,
		destinationSettingsErrors,
		{
			allowTrailingComma: true,
		}
	);
	if (destinationSettingsErrors.length > 0) {
		log.appendLine("Failed to parse destination settings. Please make sure it contains correct JSON content.");
		throw new Error(
			"Failed to parse settings.json. Please make sure it contains correct JSON content."
		);
	}

	// merge settings
	const isWorkspaceFile = destinationFile.endsWith(".code-workspace");
	let mergedSettings;
	if (isWorkspaceFile) {
		mergedSettings = Object.assign(
			{},
			destinationSettings,
			isWorkspaceFile ? { settings: sourceSettings } : sourceSettings,
		);

	} else {
		mergedSettings = Object.assign(
			{},
			destinationSettings,
			sourceSettings,
		);

	}
	await writeFile(
		destinationFile,
		JSON.stringify(mergedSettings, null, 2),
		{ encoding: "utf8" }
	);

}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand(COMMAND_NAME, async () => {
		let log = vscode.window.createOutputChannel("MergeSettings");

		let areSettingsSynced = false;

		const workspaceFolderSettingsFile: string = vscode.workspace
			.getConfiguration("mergeSettings")
			.get("workspaceFolderSettingsFile") || "";

		const useWorkspaceFolders = vscode.workspace.getConfiguration("mergeSettings").get("useWorkspaceFolders");

		const sourceSettingsFiles: string = vscode.workspace.getConfiguration("mergeSettings").get("sourceSettingsFiles") || "";

		const workspaceFile = vscode.workspace.workspaceFile;
		if (!workspaceFile) {
			log.appendLine("No workspace file found, so we do not known where to write the merged settings.");
			return;
		}


		if (useWorkspaceFolders) {
			if (!vscode.workspace.workspaceFolders) {
				log.appendLine("No workspace folders found, so we do not know where to read the merged settings.");
			} else {
				vscode.workspace.workspaceFolders.map(async (folder) => {
					const defaultSettingsFileLocation = path.resolve(
						folder.uri.fsPath,
						workspaceFolderSettingsFile
					);
					const defaultSettingsContent = await readFile(
						defaultSettingsFileLocation,
						{
							encoding: "utf8",
						}
					);

					mergeSettings(defaultSettingsContent, workspaceFile.fsPath);
					log.appendLine(`Merged settings from ${defaultSettingsFileLocation}`);
					areSettingsSynced = true;
				});

			}
			sourceSettingsFiles.split('\n').map(async (sourceSettingsFile) => {
				let sourceSettingsContent: string;

				if (sourceSettingsFile.startsWith("http://") || sourceSettingsFile.startsWith("https://")) {
					sourceSettingsContent = await fetch(sourceSettingsFile).then(res => res.text());

				} else {
					sourceSettingsContent = await readFile(sourceSettingsFile, {
						encoding: "utf8",
					});

				}

				mergeSettings(sourceSettingsContent, workspaceFile.fsPath);
				log.appendLine(`Merged settings from ${sourceSettingsFile}`);
				areSettingsSynced = true;
			});
		}

		vscode.window.showInformationMessage("Workspace Settings Synchronized");
	});

	context.subscriptions.push(disposable);
	if (
		vscode.workspace
			.getConfiguration("workspace-settings")
			.get("runOnActivation")
	) {
		vscode.commands.executeCommand(COMMAND_NAME);
	}
}
