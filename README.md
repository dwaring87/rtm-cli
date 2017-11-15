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

The main usage of the program:

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

`comp` `[indices...]`

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


### Display all Lists: `lists`, `l`

This command will display the names of all Lists.  If the List is a 'Smart List',
the search criteria will be displayed alongside the list name.


### Login: `login`

This command will remove any saved RTM user information and start the
login procedure.  An Auth URL will be displayed and opened in the User's
browser.  This URL will ask the User to grant **RTM CLI** access to their
account.  Once authorized, the user's information (id, username, full name
and an Auth Token provided by RTM) will be saved locally (`$HOME/.rtm.json`
by default).


### Logout: `logout`

This command will remove any saved RTM user information.  Any future requests
to the RTM API Server will require the User to login again.


### List Tasks By List, Priority: `ls`

`ls` `[filter]`

This command will display the User's tasks sorted first by List then by
priority.  A filter, using RTM's [Advanced Search Syntax](https://www.rememberthemilk.com/help/?ctx=basics.search.advanced)
can be used to filter the tasks displayed.

Examples:
```
> ls
> ls priority:1 AND list:Work
```


### List Tasks By Due Date, Priority: `lsd`

`lsd` `[filter]`

This command will display the User's tasks sorted first by Due Date (with
tasks without a due date shown first) then by priority.  A filter, using RTM's
[Advanced Search Syntax](https://www.rememberthemilk.com/help/?ctx=basics.search.advanced)
can be used to filter the tasks displayed.

Examples:
```
> lsd
> lsd priority:1 AND list:Work
```


### List Tasks By Priority, Due Date: `lsp`

`lsp` `[filter]`

This command will display the User's tasks sorted first by priority then by
due date.  A filter, using RTM's [Advanced Search Syntax](https://www.rememberthemilk.com/help/?ctx=basics.search.advanced)
can be used to filter the tasks displayed.

Examples:
```
> lsp
> lsp priority:1 AND list:Work
```


### Set Task Priority: `pri`, `p`

`pri` `[index]` `[priority]`

This command will set the priority of the tasks.  Tasks are referenced by index
number, which are displayed when listing tasks.  Acceptable priority values
include `1`, `2`, and `3` - any other value removes the priority from the task.

If no arguments are provided, a prompt allowing for multiple task and priority
inputs is displayed.  Enter a blank line to finish adding tasks/priorities.

Examples:
```
> pri 15 1
> pri 14 0
```


### Remove a List: `removeList`, `rml`

`removeList` `[name]`

This command will remove the List matching the provided `name` from the User's
account.  Any tasks remaining in the List will be moved to the User's Inbox.

**Note:** This command will fail if there is more than one List matching the
provided list name.

If no list name is provided, a prompt allowing for multiple list names to be
entered will be displayed.  Enter a blank line to finish adding list names.

Example:
```
> removeList Bills
```


### Rename a List: `renameList`, `mvl`

`renameList` `[old name]` `[new name]`

This command will change the name of the List from `old name` to `new name`.

**Note:** This command will fail if there is more than one List matching the
provided `old name`.

**Note:** This command is unable to rename a 'Smart List' (the RTM API
considers a 'Smart List' to be read-only).

Example:
```
> renameList Food Groceries
```


### Reset Task Index Cache: `reset`

This command will regenerate the cached lookup table used to reference a
specific task to an index number.  This is helpful when many tasks have
been deleted and the task indices are getting large.


### Display all Tags: `tags`, `t`

This command will display all tag names associated with the User's tasks.  Next
to each tag will be the number of incomplete and complete Tasks for that tag.


## Interactive Mode

An interactive mode is started when no commands are given to `rtm`, which
allows commands to be given sequentially.

Use the `quit` command to leave the interactive mode.


## Configuration

