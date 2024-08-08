# EmmyLuaUnity

[English Doc Here](README_EN.md)

## 介绍

该插件是通过分析unity工程导出API获取的C#代码提示。

目前支持的框架:
- xlua

## 使用方式

以unity工程为根目录打开工作区，或者打开任意工作区, 通过用户配置指定unity工程所在目录, 然后写好输出目录.

在左侧工作区面板上单击右键会出现`pull unity api`, 点击之后等待一段时间api就导出完了。

## 依赖

该插件并非是`self-contain`编译, 而且必须依赖目标电脑上和本插件编译时一样版本的MSBUILD, 所以请确保电脑上拥有`dotnet sdk 8`

## 问题

如果有任何问题可以去 [vscode-emmylua-unity](https://github.com/CppCXY/VSCode-EmmyLua-Unity)

## 支持的lua插件

vscode-emmylua 支持

由于其他插件对相关语法支持不到位, 所以不支持其他插件

[TODO] intellij-emmylua 支持 (https://github.com/CppCXY/EmmyLua-Unity2)
