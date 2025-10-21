# EmmyLua Unity

[English Doc Here](README_EN.md)

## 介绍

该插件为 Unity 项目中的 Lua 开发提供 C# API 代码提示和补全功能。通过分析 Unity 工程自动导出 API 定义，让你在编写 Lua 代码时获得完整的 Unity C# API 智能提示。

### 支持的框架

- **xLua** - Tencent 开源的 Lua 框架
- **ToLua** - 流行的 Unity Lua 解决方案

## 功能特性

- 🚀 自动分析 Unity 项目并生成 API 定义
- 💡 为 Lua 代码提供 Unity C# API 智能补全
- 🔄 支持增量更新 API
- 📦 支持 xLua 和 ToLua 两大主流框架

## 使用方法

### 1. 安装插件

在 VS Code 扩展商店搜索 "EmmyLua Unity" 并安装。

### 2. 打开工作区

有两种方式配置工作区：

**方式一：直接打开 Unity 项目**
- 直接使用 VS Code 打开 Unity 项目根目录（包含 Assets 文件夹的目录）

**方式二：指定 Unity 项目路径**
- 打开任意工作区
- 在 VS Code 设置中配置 Unity 项目路径和输出目录

### 3. 导出 API

1. 在左侧工作区资源管理器中，右键点击任意文件或文件夹
2. 选择菜单中的 **"Pull Unity API"** 选项
3. 等待插件分析项目并生成 API 定义文件
4. 完成后，Lua 代码中即可使用 Unity API 的智能提示

### 4. 在 Lua 中使用

导出 API 后，在你的 Lua 代码中就可以享受完整的代码提示：

```lua
-- xLua 示例
local GameObject = CS.UnityEngine.GameObject
local transform = GameObject.Find("Player"):GetComponent(typeof(CS.UnityEngine.Transform))

-- ToLua 示例  
local GameObject = UnityEngine.GameObject
local transform = GameObject.Find("Player"):GetComponent(UnityEngine.Transform)
```

## 配置说明

可以在 VS Code 设置中配置以下选项：

- Unity 项目路径
- API 输出目录
- 框架类型（xLua/ToLua）

## 系统要求

该插件需要系统环境：

- ✅ **dotnet SDK 8** - 插件依赖 .NET SDK 8 和 MSBuild
- ✅ **VS Code** - 最新版本
- ✅ **EmmyLua 插件** - 用于 Lua 语言支持

> ⚠️ 注意：此插件并非 self-contained 编译，必须确保系统安装了与插件编译时相同版本的 MSBuild（dotnet SDK 8）

## 问题反馈

如果遇到任何问题或有功能建议，欢迎访问：
[GitHub Issues](https://github.com/CppCXY/VSCode-EmmyLua-Unity/issues)
