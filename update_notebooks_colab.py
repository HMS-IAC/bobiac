import re
import sys
from pathlib import Path

import nbformat

EXCLUDE = [
    "cellpose_notebook.ipynb",
    "cellpose_retraining_notebook.ipynb",
]


def convert_to_colab_notebook(input_path: str | Path, output_path: str | Path) -> None:
    # Check if the file should be excluded
    input_filename = Path(input_path).name
    if input_filename in EXCLUDE:
        print(f"Skipping excluded file: {input_filename}")
        return

    nb = nbformat.read(input_path, as_version=4)
    new_cells = []
    use_ndv: bool = False

    for i, cell in enumerate(nb.cells):
        tags = cell.get("metadata", {}).get("tags", [])

        # remove buttons from the first cell and keep only the title
        # (only if buttons are present)
        if (
            i == 0
            and cell.cell_type == "markdown"
            and "custom-button-row" in cell.source
        ):
            lines = cell.source.strip().splitlines()
            if lines and lines[0].startswith("# "):
                cell.source = lines[0]

        # clear the cell input if it has the 'teacher' tag (it is an exercise)
        if "teacher" in tags:
            # remove the tag
            tags.remove("teacher")
            # clear the cell content
            cell.source = ""
            # clear the cell output if any
            if cell.cell_type == "code":
                cell.outputs = []
                cell.execution_count = None

        # remove entire cell if it contains certain tags
        if any(tag in tags for tag in ["remove-input", "remove-output", "remove-cell"]):
            continue

        # remove 'skip-execution' tag if present
        if "skip-execution" in tags:
            tags.remove("skip-execution")
            cell["metadata"]["tags"] = tags

        # replace the script cell with pip installs for Colab
        if cell.cell_type == "code" and "# /// script" in cell.source:
            if install_commands := _create_pip_install_dependencies_cell(cell):
                cell.source = "\n".join(install_commands)
                if not use_ndv and "ndv" in cell.source:
                    use_ndv = True
                    # Ensure matplotlib is included when ndv is present
                    if "matplotlib" not in cell.source:
                        cell.source += "\n%pip install matplotlib"

        # comment out any cell that uses ndv
        if cell.cell_type == "code" and "ndv" in cell.source:
            lines = cell.source.splitlines()
            updated_lines = []
            for line in lines:
                if "ndv" in line:
                    updated_lines.append(f"# {line}")
                else:
                    updated_lines.append(line)
            cell.source = "\n".join(updated_lines)

        # Apply styling to markdown headers and replace internal links
        if cell.cell_type in ["markdown", "code"]:
            content = cell.source
            lines = content.split("\n")
            modified = False

            for i, line in enumerate(lines):
                # Replace internal links with online GitHub raw URLs
                # (only for _static/ paths)
                if "../" in line and "_static/" in line:
                    # Simple string replacement for any path starting with ../ and
                    # containing _static/ - now handles spaces in filenames
                    def replace_path(match):
                        path = match.group(1)
                        # URL encode spaces in the path
                        encoded_path = path.replace(" ", "%20")
                        return f"https://raw.githubusercontent.com/HMS-IAC/bobiac/main/{encoded_path}"

                    updated_line = re.sub(
                        r'(\.\./.*?_static/[^"\')\]]*)',
                        replace_path,
                        line,
                    )
                    # Clean up any ../ at the beginning of the GitHub URL
                    updated_line = re.sub(
                        r"https://raw\.githubusercontent\.com/HMS-IAC/bobiac/main/(\.\./)*",
                        "https://raw.githubusercontent.com/HMS-IAC/bobiac/main/",
                        updated_line,
                    )
                    if updated_line != line:
                        lines[i] = updated_line
                        modified = True

            if modified:
                cell.source = "\n".join(lines)

        new_cells.append(cell)

    # Add a new cell at the top for pip installs
    if use_ndv:
        pip_install_cell = nbformat.v4.new_code_cell(
            source=(
                "# NOTE: The `ndv` package is not yet supported in Colab. Most of the "
                "`ndv` lines are commented out.\n# The `matplotlib` package can be used "
                "instead (already included in the pip list)."
            )
        )
        new_cells.insert(0, pip_install_cell)

    nb.cells = new_cells
    nbformat.write(nb, output_path)


def _create_pip_install_dependencies_cell(cell: nbformat.NotebookNode) -> list[str]:
    """Create a list of pip install commands from the cell source."""
    lines = cell.source.splitlines()
    inside_deps = False
    install_commands = []
    deps = []

    for line in lines:
        line = line.strip()
        if line.startswith("# dependencies"):
            inside_deps = True
            continue
        if inside_deps:
            if line.startswith("# ]"):
                break
            if line.startswith("#") and '"' in line:
                deps.append(line.split('"')[1])

    # Generate pip install commands (quoted if extras used)
    for dep in deps:
        if "[" in dep or "]" in dep:
            dep = f'"{dep}"'
        install_commands.append(f"%pip install {dep}")

    return install_commands


if __name__ == "__main__":
    src = Path(sys.argv[1])
    dest = Path(sys.argv[2])
    convert_to_colab_notebook(src, dest)
