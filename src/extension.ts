import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';

function windowsPathToWsl(winPath: string): string {
    const driveLetter = winPath[0].toLowerCase();
    const withoutDrive = winPath.substring(2).replace(/\\/g, '/');
    return `/mnt/${driveLetter}${withoutDrive}`;
}

export function activate(context: vscode.ExtensionContext) {
    let runWave = vscode.commands.registerCommand('wave.runCurrentFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor!");
            return;
        }

        let filePath = editor.document.fileName;
        const terminal = vscode.window.createTerminal("Wave Runner");
        terminal.show();

        if (os.platform() === 'win32') {
            const wslPath = windowsPathToWsl(filePath);
            terminal.sendText(`wsl wavec run "${wslPath}"`);
        } else {
            terminal.sendText(`wavec run "${filePath}"`);
        }
    });

    const codeLensProvider: vscode.CodeLensProvider = {
        provideCodeLenses(document: vscode.TextDocument) {
            if (document.languageId === 'wave') {
                const topOfFile = new vscode.Range(0, 0, 0, 0);
                return [
                    new vscode.CodeLens(topOfFile, {
                        title: "▶ Run Wave",
                        command: "wave.runCurrentFile"
                    })
                ];
            }
            return [];
        }
    };

    context.subscriptions.push(runWave);
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider('wave', codeLensProvider)
    );
}

export function deactivate() {}
