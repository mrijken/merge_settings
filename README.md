# Merge Settings README

"merge-settings" let you read settings from one or more sources and merge these settings
with the your workspace / folder settings.

## Features

Merge Settings will be executed when you execute the command `Merge Settings`  via the command palette.

It will read settings from the next sources:
- workspace folders if `mergeSettings.useWorkspaceFolders` is set to true (default). If you
  are in a workspace, all folders of the workspace are iterated (in the order as specified in
  the workspace file) over. Every workspace folder is checked for a file `.vscode/settings.default.json`.
  The file needs to be a VSCode settings.json compliant file.
  (or a different name specifed in `mergeSettings.workspaceFolderSettingsFile`). All
- a list of files as `mergeSettings.sourceSettingsFiles`. A file can be a localfile or an URL to settings.json
  compliant file.

The read settings will, be merged into the workspace settings. That will be the settings object
of the `.workspace` (when you are in a multiroot workspace) or `.vscode/settings.json` in the current folder otherwise.

## Extension Settings

This extension contributes the following settings:

- `mergeSettings.useWorkspaceFolders`: Check the workspacefolders (defaults to `true`)
- `mergeSettings.workspaceFolderSettingsFile`: The file in the workspacefolders which contain the settings to merge
  (defaults to `.vscode/default.settings.json`).
- `mergeSettings.sourceSettingsFiles`: A list of files with the settings to merge.

## Release Notes

### 0.1.2

Fix writing workspace file

### 0.1.1

Fix command ref

### 0.1.0

Initial release
