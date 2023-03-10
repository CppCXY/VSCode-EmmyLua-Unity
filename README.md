# EmmyLuaUnity

[English Doc Here](README_EN.md)

## 介绍

该插件是通过分析unity工程获取的C#代码提示。

与前代EmmyLua-Unity(并未上传到任何商店)插件相比，不需要打开Unity编辑器，也不会生成一大堆lua api文件。

该插件除了能让主插件提示unity api，还能提示出每一个C# api的方法/属性/类/事件的注释，还支持从lua代码跳转到C#定义处。

## 使用方式

以unity工程为根目录打开工作区，等主插件初始化完毕之后该插件会自动将unity api注入主插件中。

支持手动更新unity api，在左侧工作区面板上单击右键会出现`pull unity api`, 点击之后等待一段时间api就更新完了。

## 依赖

该插件基于`dotnet MSBUILD`，要求所在操作系统拥有`dotnet sdk`

## 问题

如果有任何问题可以去 [vscode-emmylua-unity](https://github.com/CppCXY/VSCode-EmmyLua-Unity)

## 支持的lua插件

vscode-emmylua 支持

intellij-emmylua 支持
