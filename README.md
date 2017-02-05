# Tuareg-master 

## Prequisites

* Installed **OCaml** exstension by hackwaly
* ocaml installed and set in path

## Features

![usage](images/main.gif)

Emulation of Emacs Tuareg extension's interactive mode for Visual Studio Code.

User can send single OCaml interactive statement by single keystroke.
Cursor then moves to beginning of the next one.

## Shortcuts

Plug-in adds following shortcuts by default:
* **ctrl+k ctrl+o** - open OCaml in integrated terminal
* **right alt+/** (**Ctrl+alt+/** on mac) - send statement the cursor is on to ocaml interactive
* **right alt+\\** (**Ctrl+alt+\\** on mac) - send previous statement to ocaml interactive

## Known Issues

The extension doesn't respect comments, it will send commented-out code.

## Release Notes

### 1.0.3

Added shortcut to send previous statement and fixed shortcuts description on mac.

### 1.0.2

Changed the way statements are selected, fixed bug ocurring when user forgot
to end final statement in file with ";;", added experimental indent-formatter.

### 1.0.1

Fixed broken image in README

### 1.0.0

Initial release of tuareg-master
