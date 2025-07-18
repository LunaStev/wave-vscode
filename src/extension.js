const vscode = require('vscode');
const os = require('os');
const path = require('path');

function windowsPathToWsl(winPath) {
    // 예: D:\Programming\Wave\test.wave → /mnt/d/Programming/Wave/test.wave
    const driveLetter = winPath[0].toLowerCase(); // d
    const withoutDrive = winPath.substring(2).replace(/\\/g, '/'); // /Programming/Wave/test.wave
    return `/mnt/${driveLetter}${withoutDrive}`;
}

function activate(context) {
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
            // Windows → WSL 경로 변환 후 실행
            const wslPath = windowsPathToWsl(filePath);
            terminal.sendText(`wsl wavec run "${wslPath}"`);
        } else {
            // Linux & macOS는 그대로 실행
            terminal.sendText(`wavec run "${filePath}"`);
        }
    });

    const codeLensProvider = {
        provideCodeLenses(document) {
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

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
