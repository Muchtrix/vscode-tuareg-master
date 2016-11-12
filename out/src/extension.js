'use strict';
const vscode = require('vscode');
function activate(context) {
    console.log('Tuareg-master is now active!');
    let tuaregController = new Tuareg();
    let tuaregList = new TuaregListener(tuaregController);
    context.subscriptions.push(tuaregController);
    context.subscriptions.push(tuaregList);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
class TuaregListener {
    constructor(t) {
        this.tuar = t;
        let commands = [];
        commands[0] = vscode.commands.registerCommand('tuareg.sendLine', () => {
            this.tuar.sendStatement();
        });
        commands[1] = vscode.commands.registerCommand('tuareg.toggleOcaml', () => {
            this.tuar.toggleTerminal();
        });
        let subscriptions = [];
        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);
        this.disposables = vscode.Disposable.from(...commands, ...subscriptions);
    }
    onEvent() {
        this.tuar.hideLabel();
    }
    dispose() {
        this.disposables.dispose();
    }
}
class Tuareg {
    constructor() {
        this.barLabel = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.barLabel.text = '$(terminal) (Tuareg-master)';
        this.barLabel.command = 'tuareg.toggleOcaml';
        this.barLabel.tooltip = 'Show OCaml interactive';
        this.barLabel.show();
    }
    toggleTerminal() {
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal('Tuareg-master');
            this.terminal.sendText('ocaml');
            this.terminalVis = false;
        }
        if (this.terminalVis)
            this.terminal.hide();
        else
            this.terminal.show();
        this.terminalVis = !this.terminalVis;
    }
    sendStatement() {
        let editor = vscode.window.activeTextEditor;
        editor.selection = new vscode.Selection(new vscode.Position(editor.selection.active.line, 0), new vscode.Position(editor.selection.active.line, 0));
        var wzor = new RegExp('.*;;');
        while (!wzor.test(editor.document.getText(editor.selection))) {
            editor.selection = new vscode.Selection(editor.selection.start, new vscode.Position(editor.selection.active.line + 1, 0));
        }
        editor.revealRange(editor.selection);
        var statement = editor.document.getText(editor.selection);
        if (!this.terminal || !this.terminalVis)
            this.toggleTerminal();
        this.terminal.sendText(statement, false);
    }
    hideLabel() {
        let editor = vscode.window.activeTextEditor;
        if ((!editor) || (editor.document.languageId != 'ocaml')) {
            this.barLabel.hide();
        }
        else
            this.barLabel.show();
    }
    dispose() {
        this.terminal.dispose();
        this.barLabel.dispose();
    }
}
//# sourceMappingURL=extension.js.map