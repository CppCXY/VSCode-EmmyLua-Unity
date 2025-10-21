# EmmyLua Unity

[中文文档](README.md)

## Introduction

This plugin provides C# API code hints and auto-completion for Lua development in Unity projects. It automatically analyzes Unity projects and exports API definitions, enabling full Unity C# API IntelliSense when writing Lua code.

### Supported Frameworks

- **xLua** - Tencent's open-source Lua framework
- **ToLua** - Popular Unity Lua solution

## Features

- 🚀 Automatic Unity project analysis and API definition generation
- 💡 Unity C# API IntelliSense for Lua code
- 🔄 Incremental API updates support
- 📦 Support for both xLua and ToLua frameworks

## Usage

### 1. Install the Extension

Search for "EmmyLua Unity" in the VS Code extension marketplace and install it.

### 2. Open Workspace

There are two ways to configure your workspace:

**Option 1: Open Unity Project Directly**
- Open the Unity project root directory (containing the Assets folder) in VS Code

**Option 2: Specify Unity Project Path**
- Open any workspace
- Configure the Unity project path and output directory in VS Code settings

### 3. Export API

1. In the workspace explorer on the left, right-click on any file or folder
2. Select **"Pull Unity API"** from the context menu
3. Wait for the plugin to analyze the project and generate API definition files
4. Once completed, Unity API IntelliSense will be available in your Lua code

### 4. Use in Lua Code

After exporting the API, you can enjoy full code completion in your Lua code:

```lua
-- xLua Example
local GameObject = CS.UnityEngine.GameObject
local transform = GameObject.Find("Player"):GetComponent(typeof(CS.UnityEngine.Transform))

-- ToLua Example
local GameObject = UnityEngine.GameObject
local transform = GameObject.Find("Player"):GetComponent(UnityEngine.Transform)
```

## Configuration

You can configure the following options in VS Code settings:

- Unity project path
- API output directory
- Framework type (xLua/ToLua)

## System Requirements

This plugin requires:

- ✅ **dotnet SDK 8** - The plugin depends on .NET SDK 8 and MSBuild
- ✅ **VS Code** - Latest version
- ✅ **EmmyLua Extension** - For Lua language support

> ⚠️ Note: This plugin is not self-contained and requires the same version of MSBuild (dotnet SDK 8) as used during compilation.

## Issues & Feedback

If you encounter any issues or have feature suggestions, please visit:
[GitHub Issues](https://github.com/CppCXY/VSCode-EmmyLua-Unity/issues)
