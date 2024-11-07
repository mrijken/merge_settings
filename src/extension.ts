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

interface SettingsObject {
	[key: string]: any
}

async function mergeSettings(sourceSettings: SettingsObject, destinationFile: string) {
	let log = vscode.window.createOutputChannel("MergeSettings");

	let destinationSettings: SettingsObject = await readJson(destinationFile);

	const isWorkspaceFile = destinationFile.endsWith(".code-workspace");

	if (isWorkspaceFile) {
		destinationSettings.settings = Object.assign(
			{},
			destinationSettings.settings,
			sourceSettings,
		);

	} else {
		destinationSettings = Object.assign(
			{},
			destinationSettings,
			sourceSettings,
		);

	}
	await writeJson(
		destinationFile,
		destinationSettings
	);

}

interface ExtensionsObject {
	recommendations: string[];
}

async function mergeExtensions(sourceExtensions: ExtensionsObject, destinationFile: string) {
	let log = vscode.window.createOutputChannel("MergeSettings");

	let destinationSettings: SettingsObject = await readJson(destinationFile);

	const isWorkspaceFile = destinationFile.endsWith(".code-workspace");

	if (isWorkspaceFile) {
		let recommendations: string[] = destinationSettings?.extensions?.recommendations || [];
		recommendations = recommendations.concat(sourceExtensions?.recommendations || []);
		destinationSettings.extensions = { recommendations };

	} else {
		let recommendations: string[] = destinationSettings?.recommendations || [];
		recommendations = recommendations.concat(sourceExtensions?.recommendations || []);
		destinationSettings = { recommendations };

	}
	await writeJson(destinationFile, destinationSettings);

}

async function readJson(path: string): Promise<SettingsObject> {
	let content = await readFile(
		path,
		{
			encoding: "utf8",
		}
	);

	return parseJson(content);
}

function parseJson(content: string): SettingsObject {
	const errors: ParseError[] = [];
	const json = parse(
		content,
		errors,
		{
			allowTrailingComma: true,
		}
	);
	if (errors.length > 0) {
		throw new Error(
			"Failed to parse settings.json. Please make sure it contains correct JSON content."
		);
	}

	return json;
}


async function writeJson(path: string, json: any) {
	await writeFile(
		path,
		JSON.stringify(json, null, 2),
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

		const workspaceFolderExtensionsFile: string = vscode.workspace
			.getConfiguration("mergeSettings")
			.get("workspaceFolderExtensionsFile") || "";

		const useWorkspaceFolders = vscode.workspace.getConfiguration("mergeSettings").get("useWorkspaceFolders");

		const sourceSettingsFiles: string = vscode.workspace.getConfiguration("mergeSettings").get("sourceSettingsFiles") || "";
		const sourceExtensionsFiles: string = vscode.workspace.getConfiguration("mergeSettings").get("sourceExtensionsFiles") || "";

		const workspaceFile = vscode.workspace.workspaceFile;
		if (workspaceFile) {
			if (useWorkspaceFolders) {
				if (!vscode.workspace.workspaceFolders) {
					log.appendLine("No workspace folders found, so there are no settings to read.");
				} else {
					vscode.workspace.workspaceFolders.map(async (folder) => {
						const defaultSettingsFileLocation = path.resolve(
							folder.uri.fsPath,
							workspaceFolderSettingsFile
						);
						const defaultSettings = await readJson(
							defaultSettingsFileLocation,
						);

						mergeSettings(defaultSettings, workspaceFile.fsPath);

						const defaultExtensionsFileLocation = path.resolve(
							folder.uri.fsPath,
							workspaceFolderExtensionsFile
						);
						const defaultExtensions = (await readJson(
							defaultExtensionsFileLocation,
						))?.extensions || { recommendations: [] };

						mergeExtensions(defaultExtensions, workspaceFile.fsPath);

					});

				}
			}
		} else {
			const defaultSettings = await readJson(
				workspaceFolderSettingsFile, // use separate (ie folderSettingsFile)
			);

			mergeSettings(defaultSettings, ".vscode/settings.json");

			const defaultExtensions = (await readJson(
				workspaceFolderExtensionsFile, // use separate (ie folderExtensionsFile)
			)) || { recommendations: [] };

			mergeExtensions(defaultExtensions, ".vscode/extensions.json");
		}
		sourceSettingsFiles.split('\n').map(async (sourceSettingsFile) => {
			let sourceSettings: SettingsObject;

			if (sourceSettingsFile.startsWith("http://") || sourceSettingsFile.startsWith("https://")) {
				sourceSettings = parseJson(await fetch(sourceSettingsFile).then(res => res.text()));

			} else {
				sourceSettings = await readJson(sourceSettingsFile);
			}

			mergeSettings(sourceSettings, workspaceFile.fsPath);
		});

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
