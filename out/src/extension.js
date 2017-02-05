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
            this.tuar.sendStatement(false);
        });
        commands[1] = vscode.commands.registerCommand('tuareg.sendPreviousLine', () => {
            this.tuar.sendStatement(true);
        });
        commands[2] = vscode.commands.registerCommand('tuareg.toggleTerminal', () => {
            this.tuar.toggleTerminal();
        });
        commands[3] = vscode.commands.registerTextEditorCommand('tuareg.indentSelection', (editor) => {
            this.tuar.indentSelection(editor, editor.selection);
        });
        let subscriptions = [];
        vscode.window.onDidChangeActiveTextEditor(this.onFileChange, this, subscriptions);
        this.disposables = vscode.Disposable.from(...commands, ...subscriptions);
    }
    onFileChange() {
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
    getStatement(previousStatement = false) {
        let editor = vscode.window.activeTextEditor;
        let doc = editor.document;
        let cursorOffs = doc.offsetAt(editor.selection.active);
        let currOffs = 0;
        let currInd = -1;
        let tokens = doc.getText().split(";;");
        for (var index = 0; index <= tokens.length; ++index) {
            if (previousStatement) {
                if (currOffs <= cursorOffs && cursorOffs <= currOffs + tokens[index].length + 1) {
                    if (index == 0) {
                        return new vscode.Selection(doc.positionAt(tokens[0].length + 2), doc.positionAt(0));
                    }
                    currOffs -= tokens[index - 1].length + 2;
                    break;
                }
                currInd = index;
                currOffs += tokens[index].length + 2;
            }
            else {
                if (currOffs <= cursorOffs && cursorOffs <= currOffs + tokens[index].length + 1) {
                    currInd = index;
                    break;
                }
                currOffs += tokens[index].length + 2;
            }
        }
        if (previousStatement) {
            return new vscode.Selection(doc.positionAt(currOffs + tokens[currInd].length + 2), doc.positionAt(currOffs));
        }
        else {
            return new vscode.Selection(doc.positionAt(currOffs), doc.positionAt(currOffs + tokens[currInd].length + 2));
        }
    }
    sendStatement(prev = false) {
        let editor = vscode.window.activeTextEditor;
        let doc = editor.document;
        editor.selection = this.getStatement(prev);
        editor.revealRange(editor.selection);
        let statement = doc.getText(editor.selection).trim();
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal('Tuareg-master');
            let dirname = doc.fileName.split('\\');
            dirname.pop();
            this.terminal.sendText('cd "' + dirname.join('\\') + '"');
            this.terminal.sendText('ocaml');
        }
        this.terminal.show(true);
        this.terminalVis = true;
        this.terminal.sendText(statement);
    }
    indentSelection(editor, sel) {
        if (!sel) {
            sel = this.getStatement();
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