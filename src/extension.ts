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

        commands[1] = vscode.commands.registerCommand('tuareg.toggleOcaml', () => {
            this.tuar.toggleTerminal();
        });

        let subscriptions: vscode.Disposable[] = [];

        vscode.window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);

        this.disposables = vscode.Disposable.from(...commands, ...subscriptions);
    }

    private onEvent(){
        this.tuar.hideLabel();
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
        this.barLabel.command = 'tuareg.toggleOcaml';
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
        else this.terminal.show();

        this.terminalVis = ! this.terminalVis;
    }

    public sendStatement(){
        let editor = vscode.window.activeTextEditor;
        editor.selection = new vscode.Selection(
            new vscode.Position(editor.selection.active.line, 0),
            new vscode.Position(editor.selection.active.line, 0)
        );

        var wzor = new RegExp('.*;;');
        
        while(! wzor.test(editor.document.getText(editor.selection))){
            editor.selection = new vscode.Selection(editor.selection.start, new vscode.Position(editor.selection.active.line + 1, 0));
        }
        editor.revealRange(editor.selection);
        var statement = editor.document.getText(editor.selection);
        if(!this.terminal || !this.terminalVis) this.toggleTerminal();
        this.terminal.sendText(statement, false);
    }

    public hideLabel(){
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