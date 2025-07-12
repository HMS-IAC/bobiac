# 02 - <i class="fab fa-python"></i> Getting Started with Python

In this section we will talk about what is Python, how to install it, and how to run your first Python program...

## Terminal commands

Here are some basic terminal commands that will help you use the
command line effectively.  These commands work for macOS,
Linux, and the Windows PowerShell terminal (but not the windows `cmd` Prompt).

| <span style="display: inline-block; width:100px;">Command</span>  | Description |
| -------- | ----------- |
| **`ls`** | List directory contents. |
| **`cd [DIR]`** | Change directory to `[DIR]`. <br><small>_If `[DIR]` is not provided, defaults to the home directory._</small> |
| **`pwd`** | Print the current working directory. |
| **`mkdir [DIR]`** | Create a new directory named `[DIR]`. |

```{tip}
When using relative paths, you can use `..` to refer to the parent directory,
and `.` to refer to the current directory.
```

## `uv` cheat sheet

These are some basic `uv` commands that will help you get started with Python
development using `uv`.  We will use them throughout this book.

| <span style="display: inline-block; width:275px;">Command</span>  | Description |
| -------- | ----------- |
| **`uv help <COMMAND>`** | Useful way to get help on a specific `<COMMAND>`. |
| **`uv venv [ENV_PATH]`** | Create a virtual environment at the specified `ENV_PATH`.<br><small>👍 _If `[ENV_PATH]` is not provided, defaults to `.venv` in the current directory_.</small> |
| <i class="fab fa-apple"></i> `source .venv/bin/activate`<br><i class="fab fa-windows"></i> `.venv\Scripts\activate` | Activate the virtual environment in the path `.venv` |
| **`uv pip install   [PACKAGE]`**<br>**`uv pip uninstall [PACKAGE]`** | Install or uninstall `PACKAGE` in the current virtual environment.  May use multiple packages separated by space. |
| **`uv pip list`** | List all installed packages in the current virtual environment. |
| <hr> | <hr> |
| **`uv tool run <COMMAND>`**<br>_OR_: **`uvx <COMMAND>`** | Run a `<COMMAND>` provided by a Python package _of the same name_. <br>✨ _This creates an environment, installs the package, and then invokes the command all in one step!_</small> |
| **`uvx --from <PACKAGE> <COMMAND>`** | Run a `<COMMAND>` provided by package `<PACKAGE>` (of a different name than `<COMMAND>`) |
| **`uv <COMMAND> -p <PYTHON>`** | Use the specified version of python (e.g. `-p 3.10`).<br><small>_This flag works with `uv tool run`, and `uv venv` commands._</small> |

... For complete docs, see [Getting started with uv](https://docs.astral.sh/uv/getting-started/).

```{note}
While we will not be covering it here, `uv` is also frequently used
for **project management**.  If you see references to commands like
`uv sync`, `uv add`, or `uv run`, these are only relevant in the
context of using `uv` for project management.
```

## `uv` ↔️ `conda` translation table

If you are already familiar with `conda`, here is a quick translation table to
help you understand how `uv` commands map to `conda` commands:

| `uv` command | `conda` equivalent | description |
| -------- | ------------------ | ----------- |
| **`uv venv`** | **`conda create`** | Create a new env |
| **`source .venv/bin/activate`**<br>**`.venv\Scripts\activate`** | **`conda activate`** | Activate the virtual environment in the path `.venv` |
| **`uv pip install`** | **`conda install`** | Install a package into the env |
| **`uv pip uninstall`** | **`conda remove`** | Remove a package from the env |
| **`uv pip list`** | **`conda list`** | List all packages in the env |
