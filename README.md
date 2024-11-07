# Merge Settings README

"merge-settings" let you read settings from one or more sources and merge these settings
with your workspace / folder settings.

This extension is usefull when you want to have company/community wide default settings for VS code
but do not want to specify it in every repo.

A typical usage is:
- clone that repo with `.vscode/settings.default.json` and/or a `.vscode/extensions.default.json`
- either:
  - add the repo to your workspace
  - add the paths to `.vscode/settings.default.json` and/or a `.vscode/extensions.default.json` in the settings
    of the extension
- run the `Merge Settings` command to (re)merge the settings and extensions.

## Features

Merge Settings will be executed when you execute the command `Merge Settings`  via the command palette.

It will read settings from the next sources:

- workspace folders if [mergeSettings.useWorkspaceFolders](vscode://settings/mergeSettings.useWorkspaceFolders) is set to true (default). If you
  are in a workspace, all folders of the workspace are iterated (in the order as specified in
  the workspace file) over. Every workspace folder is checked for a file `.vscode/settings.default.json`
  (or a different name specifed in [mergeSettings.workspaceFolderSettingsFile](vscode://settings/mergeSettings.workspaceFolderSettingsFile)).
  The file needs to be a VSCode settings.json compliant file.

- a list of files as specified in [mergeSettings.sourceSettingsFiles](vscode://settings/mergeSettings.sourceSettingsFiles). A file can be a localfile or an URL to settings.json
  compliant file.

It will read extensions from the next sources:

- workspace folders if [mergeSettings.useWorkspaceFolders](vscode://settings/mergeSettings.useWorkspaceFolders) is set to true (default). If you
  are in a workspace, all folders of the workspace are iterated (in the order as specified in
  the workspace file) over. Every workspace folder is checked for a file `.vscode/extensions.default.json`
  (or a different name specifed in [mergeSettings.workspaceFolderExtensionsFile](vscode://settings/mergeSettings.workspaceFolderExtensionsFile)).
  The file needs to be a VSCode extensions.json compliant file.

- a list of files as specified in [mergeSettings.sourceExtensionsFiles](vscode://settings/mergeSettings.sourceExtensionsFiles). A file can be a localfile or an URL to settings.json
  compliant file.

The read settings will, be merged into the workspace settings. That will be the settings object
of the `.workspace` (when you are in a multiroot workspace) or `.vscode/settings.json` in the current folder otherwise.

## Extension Settings

This extension contributes the following settings:

- [mergeSettings.useWorkspaceFolders](vscode://settings/mergeSettings.useWorkspaceFolders): Check the workspacefolders (defaults to `true`)
- [mergeSettings.workspaceFolderSettingsFile](vscode://settings/mergeSettings.workspaceFolderSettingsFile) (defaults to `.vscode/settings.default.json`).
- [mergeSettings.workspaceFolderExtensionsFile](vscode://settings/mergeSettings.workspaceFolderExtensionsFile) (defaults to `.vscode/extensions.default.json`).
- [mergeSettings.sourceSettingsFiles](vscode://settings/mergeSettings.sourceSettingsFiles): A list of files with the settings to merge.
- [mergeSettings.sourceExtensionsFiles](vscode://settings/mergeSettings.sourceExtensionsFiles): A list of files with the extensions to merge.

## Release Notes

## 0.2.0

Merge extensions also.

### 0.1.3

Fix merge issue in code-workspace file

### 0.1.2

Fix writing workspace file

### 0.1.1

Fix command ref

### 0.1.0

Initial release
