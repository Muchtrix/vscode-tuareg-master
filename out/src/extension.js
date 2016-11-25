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
        commands[1] = vscode.commands.registerCommand('tuareg.toggleTerminal', () => {
            this.tuar.toggleTerminal();
        });
        commands[2] = vscode.commands.registerTextEditorCommand('tuareg.indentSelection', (editor) => {
            this.tuar.indentSelection(editor, editor.selection);
        });
        let subscriptions = [];
        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);
        this.disposables = vscode.Disposable.from(...commands, ...subscriptions);
    }
    onEvent() {
        this.tuar.updateLabel();
    }
    dispose() {
        this.disposables.dispose();
    }
}
class Tuareg {
    constructor() {
        this.barLabel = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.barLabel.text = '$(terminal) Tuareg-master';
        this.barLabel.command = 'tuareg.toggleTerminal';
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
            this.terminal.show(false);
        this.terminalVis = !this.terminalVis;
    }
    getCurrentStatement() {
        let editor = vscode.window.activeTextEditor;
        let doc = editor.document;
        let cursorOffs = doc.offsetAt(editor.selection.active);
        let currOffs = 0;
        let currInd = -1;
        let tokens = doc.getText().split(";;");
        for (var index = 0; index <= tokens.length; ++index) {
            if (currOffs <= cursorOffs && cursorOffs <= currOffs + tokens[index].length + 1) {
                currInd = index;
                break;
            }
            currOffs += tokens[index].length + 2;
        }
        return new vscode.Selection(doc.positionAt(currOffs), doc.positionAt(currOffs + tokens[currInd].length + 2));
    }
    sendStatement() {
        let editor = vscode.window.activeTextEditor;
        let doc = editor.document;
        editor.selection = this.getCurrentStatement();
        editor.revealRange(editor.selection);
        let statement = doc.getText(editor.selection).trim();
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal('Tuareg-master');
            this.terminal.sendText('ocaml');
        }
        this.terminal.show(true);
        this.terminalVis = true;
        this.terminal.sendText(statement);
    }
    indentSelection(editor, sel) {
        if (!sel) {
            sel = this.getCurrentStatement();
        }
        let doc = editor.document;
        let indent = 0;
        let result = "";
        let raw = doc.getText(sel);
        let indentCount = vscode.workspace.getConfiguration('tuareg').get('indentLength', 2);
        raw.split("\n").forEach(el => {
            el = el.trim();
            if (el.startsWith("end") || el.startsWith("done") || el == "in")
                --indent;
            result += (result == "" ? "" : "\n") + " ".repeat(indent * indentCount) + el;
            if (el.endsWith("with") || el.endsWith("=") || el.startsWith("begin") || el.startsWith("for") || el.startsWith("while"))
                ++indent;
        });
        editor.edit(function (builder) {
            builder.replace(sel, result);
        });
    }
    updateLabel() {
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