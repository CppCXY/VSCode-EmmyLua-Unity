# EmmyLuaUnity

## Introduction

This plugin provides C# code suggestions by analyzing exported APIs from Unity projects.

Currently supported frameworks:
- xlua

## Usage

Open the workspace with the Unity project as the root directory or open any workspace and specify the directory of the Unity project through user configuration. Then, specify the output directory.

Right-click on the workspace panel on the left side and select "pull unity api". Wait for a while and the API will be exported.

## Dependencies

This plugin is not self-contained and requires the same version of MSBUILD as the one used during compilation. Make sure you have `dotnet sdk 8` installed on your computer.

## Issues

If you have any issues, please visit [vscode-emmylua-unity](https://github.com/CppCXY/VSCode-EmmyLua-Unity).

## Supported Lua plugins

Supported by vscode-emmylua.

Due to inadequate support for related syntax by other plugins, they are not supported.

[TODO] Supported by intellij-emmylua (https://github.com/CppCXY/EmmyLua-Unity2)
