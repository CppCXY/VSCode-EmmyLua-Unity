# Change Log

## 2.0.1

`FIX` 修复没有导出属性的BUG

## 2.0.0

`NEW` 重写该插件, 支持最新的vscode-emmylua

## 1.3.1

`NEW` 清理错误的补全项`<global namespace>`, 重写导出的部分代码

`NEW` 如果有什么Feature Request可以去 https://github.com/CppCXY/EmmyLua-Unity-LS 提交

## 1.2.5

`FIX` 修复描述关于msbuild的需求描述, 要求最低dotnet sdk7

`NEW` 提升命令行的可用性


## 1.2.4

`FIX` 修复插件过多报错的问题

`FIX` 修复内部类, 内部枚举被错误的提升到全局命名空间下

## 1.2.3

`FIX` 降低msbuild.locator版本

## 1.2.2

`FIX` 修复插件不可用的问题

## 1.2.0

`NEW` 支持填写msbuild参数

`NEW` 更完善的支持命名空间过滤

`NEW` 将会加载解决方案内的所有项目文件

`NEW` sln支持填写相对路径或者采用`${workspaceFolder}`参数 

`NEW` 注明仅仅支持`dotnet sdk`下的`msbuild`

`NEW` 升级为`.net 7`

## 1.0.6

`NEW` 支持扩展方法

`NEW` 支持sumneko_lua

## 1.0.5

`NEW` 支持设定sln目录

`NEW` 版本号提高到1.0.5这样覆盖掉老版本的emmylua-unity

`NEW` 支持选择框架 xlua / tolua

`NEW` 支持选择注入插件 emmylua / sumneko_lua（但并未实现）

## 1.0.1

更新readme

## 1.0.0

首次发布

