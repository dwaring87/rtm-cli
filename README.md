Remember The Milk Command Line Interface
========================================

**node module:** [rtm-cli](https://www.npmjs.com/package/rtm-cli)<br />
**GitHub repo:** [dwaring87/rtm-cli](https://github.com/dwaring87/rtm-cli)

---

> **NOTE:** This project is still being actively developed and features
> may be added/removed/changed between updates without notice.

This Node module provides a command line interface, written in JavaScript,
for the popular [Remember the Milk](https://www.rememberthemilk.com/) task list
manager.

This module uses the [rtm-api](https://github.com/dwaring87/rtm-api) module as
a wrapper for the Remember the Milk API service.


## Installation

### NPM

If you already have [Node](https://nodejs.org) installed, this program can be
installed via `npm`:

```shell
npm install -g rtm-cli
```

which will install the executable `rtm` into your `$PATH`.

### Executable Releases

**COMING SOON**

Standalone executables, that do not require a pre-existing installation of Node,
will soon be released.


## Usage

The main usage of the CLI:

```
  Usage: rtm [options] <command> [command arguments]


  Options:

    -V, --version  output the version number
    -p, --plain    Do not print styled/colored text
    -h, --help     output usage information


  Commands:

    add|a [task...]                     Add a new Task [task name due date p:priority l:list t:tag]
    addList|al [name...]                Add a new List or Smart List
    comp|x [indices...]                 Complete one or more Tasks
    lists|l                             Display all lists
    login                               Add RTM User information
    logout                              Remove RTM User information
    ls [filter...]                      List all tasks sorted first by list then by priority
    lsd [filter...]                     List all tasks sorted first by due date then by priority
    lsp [filter...]                     List all tasks sorted first by priority then due date
    pri|p [index] [priority]            Change Task Priority
    removeList|rml [name...]            Remove a List
    renameList|mvl [oldName] [newName]  Rename a List
    reset                               Reset cached task indices
    tags|t                              Display all tags
```

## Commands


### Add a Task: `add`, `a`

`add` `[Task Name]`

The `Task Name` can use RTM's [Smart Add Syntax](https://www.rememberthemilk.com/help/answer/basics-smartadd-howdoiuse).
Additionally, to minimize the need to escape special characters at the command line,
the following properties can be specified:

  - priority as `p:{priority}`
  - list as `l:{list}`
  - tags as `t:tag1 t:tag2`
  - due date as `due:{due date}`

If `Task Name` is not provided, a prompt allowing multiple new task entries
will be displayed.  Enter a blank line to finish adding new tasks.

Examples:
```
> add Buy Milk ^tomorrow !2 #Shopping
> add Feed The Cat today p:1 l:Chores t:pets *daily
```


### Add a List: `addList`, `al`

`addList` `[List Name]` `[Smart List Filter]`

This command will add a new empty List to the User's account or if a
`Smart List Filer` is provided, a Smart List using the provided
[advanced search criteria](https://www.rememberthemilk.com/help/?ctx=basics.search.advanced)
will be created.

If no arguments are provided, a prompt allowing multiple new list names
will be displayed.  Enter a blank line to finish add new lists.

Examples:
```
> addList Bills
> addList Important priority:1 OR priority:2
```


### Complete a Task: `comp`, `x`

`comp` `[task indices...]`

This command will mark the Tasks as complete.  Tasks are referenced by index
number, which are displayed when listing tasks.  Multiple task indices can be
provided as arguments to this command.

If no arguments are provided, a prompt allowing multiple task indices to be
entered will be displayed.  Enter a blank line to finish addind task indices.

Examples:
```
> comp 15
> comp 1 9 8
```




## Interactive Mode

An interactive mode is started when no commands are given to `rtm`, which
allows commands to be given sequentially.

Use the `quit` command to leave the interactive mode.


## Configuration

