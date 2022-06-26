# Change Log

## 0.12.0

`NEW` 当代码超过指定行宽时会自动折行，该行为可能会产生不如意的代码排版。这时候建议ctrl z之后手动排版再格式化。

`FIX` 修复索引表达式中涉及长字符串时，格式化导致的语法错误

## 0.11.4

`CHANGE` 更新基本词典

`NEW` 支持字符串中的拼写检查

## 0.11.3

`CHANGE` 更新词典

`CHANGE` 语言服务按lsp3.17版本重新设计, 诊断采用lsp规定的方式诊断。

## 0.11.2

`CHANGE` 更新lua常用词词典 

## 0.11.0

`CHANGE` 重构了语言服务的代码组织，暂时移除插件对补全的影响，插件不在代码补全时提示模块了

`CHANGE` 优化了模块诊断时提示的内容

`NEW` 提供针对lua优化的标识符单词拼写检查算法

`NEW` 提供了新的格式化选项:
* `remove_empty_header_and_footer_lines_in_function` 允许移除函数的上面和下面多余空行
* `remove_expression_list_finish_comma` 允许移除函数调用时最后一个逗号(这本身是一个语法错误)

## 0.10.3

`NEW` 命令行工具支持使用通配符过滤

## 0.10.2

`CHANGE` 默认情况下namedef和attribute会有一个空格的距离

`NEW` 行布局支持使用`maxLine:$n`指定与下一行的最大行距

`NEW` 行宽允许设定为unset

`CHANGE` 函数调用的排版方式变更，更符合lua中的一些使用习惯


## 0.10.0

`NEW` vscode插件端实现配置EmmyluaCodeStyle开关`模块诊断`,`代码风格诊断`, `模块补全`.

`NEW` 行距诊断换一种表现方式

`NEW` 支持通过设置`align_chained_expression_statement=true`使链式表达式对齐到第一个'.'或者':' 

`NEW` 支持通过设置`if_branch_comments_after_block_no_indent`允许else或者elseif之上的注释对齐到关键词上


## 0.9.7

`IMPL` [#31](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/31)

`IMPL` [#30](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/30)

1. 格式化会移除注释的尾部空白
2. 通过选项`if_branch_comments_after_block_no_indent = true` 允许在else/elseif分支之上的注释不会缩进到语句块内部

## 0.9.6

命令行工具帮助打印更规范
## 0.9.5

命令行工具在指定单输入文件时可以指定工作区，这可以帮助detect config。

## 0.9.4

修复命令行工具无法输出到文件的bug

## 0.9.2

命令行工具支持批量格式化和批量诊断

## 0.9.0

1. 命令行工具现在会自动寻找并使用最近的editorconfig配置
2. 长字符串和长注释会采用配置的行尾格式化

## 0.8.7

重写命令行工具

## 0.8.5

修复一个bug:纯注释文件会被直接清空

## 0.8.4

`FIX` [#27](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/27)
## 0.8.3

`FIX` [#26](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/26)

## 0.8.2

`FIX` [#25](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/25)

## 0.8.1

`FIX` [#24](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/24)

## 0.8.0

`Resolve` [#20](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/20)

`Resolve` [#17](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/17)

`Resolve` [#16](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/16)

`Resolve` [#15](https://github.com/CppCXY/EmmyLuaCodeStyle/issues/15)

主要更新的特性为允许设定单双引号风格，对齐时采用最小对齐,允许移除函数调用的括号

## 0.7.0

1. 修复存在某些语法错误的情况下仍然格式化的问题
2. 支持if的条件表达式互相对齐
3. table表达式内支持不同的连续有不同的对齐
4. 形如t[#t+1]可以无空白包含
5. sumneko_lua 集成了该插件的主要功能
    
    
## 0.6.1

更新文档，更新editorconfig模板


## 0.6.0

1. 提高测试的覆盖率,每一个格式化选项都有专门的测试
2. 重构缩进算法,更好的支持使用tab作为缩进
3. 提供许多与缩进有关的格式化选项
4. 部分格式化选项重新命名了
5. 修复许多bug


## 0.5.1

修复linux下不可用的问题

## 0.5.0

将语言服务由单线程分离io线程和逻辑线程。io线程会尽可能快的读取消息，逻辑线程为单线程内无锁异步(不含asio自己控制的锁)
采用增量更新，单次发包量大幅度降低，语言服务采用原地增量更新算法(极少重新申请空间储存代码)
语言服务实现调度机制，代码诊断实现后端防抖，防抖区间暂定0.3秒。
大幅度提高插件性能，代码诊断不再成为性能瓶颈，在10万行以内的代码不会影响插件的正常使用

## 0.4.5

修复由于linux下编译器版本为gcc11导致在大部分linux环境下不可用的问题

## 0.4.4

修复枚举不一致
## 0.4.3

修复诊断bug

## 0.4.2

1. 修改格式化规则，连续调用表达式中如果存在单参数省略括号的表达形式，则该参数与下一个调用参数列表保持一个间距。
2. 修复一个识别错误的bug

## 0.4.1

提供模块的特殊export.rule规则，使用形式待考虑

## 0.4.0

提供auto import 功能

## 0.3.2

修复label导致格式化结果不稳定的bug

## 0.3.1

现在修改配置会立即刷新所有打开的文件了

## 0.3.0

修复许多bug，重构迭代算法，增加测试用例

## 0.2.6

降低插件体积，插件实现分系统分发不同的包。

## 0.2.5

修复一个连续调用函数时格式化错误的问题

## 0.2.4 

修复因为cin.readsome无法在linux和macosx上正确工作导致无法正确运行的问题，windows上仍然使用cin,cout
linux和macosx上使用asio封装过的接口

## 0.2.2

优化节点的内存占用，优化常驻内存，采用mimalloc优化内存分配性能，优化内存碎片。

## 0.2.1

修复内存方面的问题，降低内存消耗

## 0.2.0

1. 重写.editorconfig读取规则，支持editorconfig的基本匹配规则和所有基本选项
2. 支持基于lua语法特性和日常习惯的lua命名风格检测规则
3. 语言服务实现内采用异常提前中断没必要的解析

## 0.1.18
    
修复命名风格检查未能正确工作的bug

## 0.1.17

1. 修改配置选项名称，和editorconfig使用的名称保持一直（建议重新导入配置）

2. 支持检测是否以新行结束文本

3. 支持命名风格检测（默认不开启）

## 0.1.16

代码诊断本地化

## 0.1.15

修复bug
