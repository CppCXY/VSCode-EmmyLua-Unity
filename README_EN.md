# EmmyLuaUnity

## introduce

This plugin is a C# code hint obtained by analyzing the unity project.

Compared to the previous generation EmmyLua-Unity (not uploaded to any store) plugin, there is no need to open the Unity editor, nor does it generate a whole bunch of lua api files.

In addition to allowing the main plugin to prompt the unity api, this plugin can also prompt the comments of each C# api method/property/class/event, and also supports jumping from the lua code to the C# definition.

## How to use

Open the workspace with the unity project as the root directory. After the main plugin is initialized, the plugin will automatically inject the unity api into the main plugin.

Supports manual update of unity api. Right-click on the left workspace panel and `pull unity api` will appear. After clicking, wait for a while and the api will be updated.

## dependencies

The plug-in is based on `MSBUILD` and requires the operating system to have `visual studio 2017` or above

## question

If you have any questions you can go to [vscode-emmylua-unity](https://github.com/CppCXY/VSCode-EmmyLua-Unity)

## Supported main plugins

vscode-emmmylua version 0.5.4 and above is supported

intellij-emmmylua is not yet supported

sumneko_lua is not yet supported