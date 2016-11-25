'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log('Tuareg-master is now active!');

    let tuaregController = new Tuareg();
    let tuaregList = new TuaregListener(tuaregController);

    context.subscriptions.push(tuaregController);
    context.subscriptions.push(tuaregList);
}

export function deactivate() {
}

class TuaregListener{
    private tuar: Tuareg;
    private disposables: vscode.Disposable;

    public constructor(t: Tuareg){
        this.tuar = t;

        let commands: vscode.Disposable[] = [];
        commands[0] = vscode.commands.registerCommand('tuareg.sendLine', () =>{
            this.tuar.sendStatement();
        });

        commands[1] = vscode.commands.registerCommand('tuareg.toggleTerminal', () => {
            this.tuar.toggleTerminal();
        });

        commands[2] = vscode.commands.registerTextEditorCommand('tuareg.indentSelection', (editor) =>{
            this.tuar.indentSelection(editor, editor.selection);
        });

        let subscriptions: vscode.Disposable[] = [];

        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);

        this.disposables = vscode.Disposable.from(...commands, ...subscriptions);
    }

    private onEvent(){
        this.tuar.updateLabel();
    }

    public dispose(){
        this.disposables.dispose();
    }
}

class Tuareg{
    private terminal: vscode.Terminal;
    private terminalVis: boolean;
    private barLabel: vscode.StatusBarItem;

    public constructor(){
        this.barLabel = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.barLabel.text = '$(terminal) Tuareg-master';
        this.barLabel.command = 'tuareg.toggleTerminal';
        this.barLabel.tooltip = 'Show OCaml interactive';
        this.barLabel.show();
    }

    public toggleTerminal(){
        if(!this.terminal){
            this.terminal = vscode.window.createTerminal('Tuareg-master');
            this.terminal.sendText('ocaml');
            this.terminalVis = false;
        }
        if(this.terminalVis) this.terminal.hide();
        else this.terminal.show(false);

        this.terminalVis = ! this.terminalVis;
    }

    public getCurrentStatement(): vscode.Selection{
        let editor = vscode.window.activeTextEditor;
        let doc = editor.document;
        let cursorOffs = doc.offsetAt(editor.selection.active);
        let currOffs = 0;
        let currInd = -1;
        let tokens = doc.getText().split(";;");
        for(var index = 0; index <= tokens.length; ++index){
            if(currOffs <= cursorOffs && cursorOffs <= currOffs + tokens[index].length + 1){
                currInd = index;
                break;
            }
            currOffs += tokens[index].length + 2;
        }
        return new vscode.Selection(doc.positionAt(currOffs), doc.positionAt(currOffs + tokens[currInd].length + 2));
    }

    public sendStatement(){
        let editor = vscode.window.activeTextEditor;
        let doc = editor.document;
        
        editor.selection = this.getCurrentStatement();
        editor.revealRange(editor.selection);
        let statement = doc.getText(editor.selection).trim();
        
        if(!this.terminal){
            this.terminal = vscode.window.createTerminal('Tuareg-master');
            this.terminal.sendText('ocaml');
        }
        this.terminal.show(true);
        this.terminalVis = true;
        this.terminal.sendText(statement);
    }

    public indentSelection(editor: vscode.TextEditor, sel?: vscode.Selection){
        if(!sel){
            sel = this.getCurrentStatement();
        }
        let doc = editor.document;
        let indent: number = 0;
        let result: string = "";
        let raw = doc.getText(sel);
        let indentCount: number = vscode.workspace.getConfiguration('tuareg').get('indentLength', 2);
        raw.split("\n").forEach(el => {
            el = el.trim();
            if(el.startsWith("end") || el.startsWith("done") || el == "in") --indent;

            result += (result == "" ? "" : "\n") + " ".repeat(indent * indentCount) + el;
            
            
            if(el.endsWith("with") || el.endsWith("=") || el.startsWith("begin") || el.startsWith("for") || el.startsWith("while")) ++indent;
        });

        editor.edit(function(builder){
            builder.replace(sel, result);
        });
    }

    public updateLabel(){
        let editor = vscode.window.activeTextEditor;
        if((!editor) || (editor.document.languageId != 'ocaml')){
            this.barLabel.hide();
        } else this.barLabel.show();
    }

    public dispose(){
        this.terminal.dispose();
        this.barLabel.dispose();
    }
}