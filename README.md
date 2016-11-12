# Ocaml tuareg-master README

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
* **right alt+/** - send statement the cursor is on to ocaml

## Known Issues

Currently extension does not correctly recognize multiple statements ending on the same line, for example:
```ocaml
filter (fun x -> x mod 2 = 0) [1;2;3;4;5;6;7];;filter (fun x -> x mod 2 = 0) [];;
````

The extension doesn't respect comments either, it will send commented-out code.

## Release Notes

### 1.0.1

Fixed broken image in README

### 1.0.0

Initial release of tuareg-master

-------------------------------------------------------------

**Enjoy!**