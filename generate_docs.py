import ast
import os

output_lines = ["# Подробная документация", ""]

for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.py') and not file.startswith('__init__'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                try:
                    tree = ast.parse(f.read(), filename=path)
                except Exception as e:
                    continue
            rel_path = os.path.relpath(path, '.')
            output_lines.append(f"## {rel_path}")
            for node in tree.body:
                if isinstance(node, ast.FunctionDef):
                    doc = ast.get_docstring(node)
                    sig = f"def {node.name}({', '.join(arg.arg for arg in node.args.args)})"
                    output_lines.append(f"- `{sig}`")
                    if doc:
                        first_line = doc.strip().splitlines()[0]
                        output_lines.append(f"  - {first_line}")
                elif isinstance(node, ast.ClassDef):
                    cdoc = ast.get_docstring(node)
                    output_lines.append(f"- `class {node.name}`")
                    if cdoc:
                        first_line = cdoc.strip().splitlines()[0]
                        output_lines.append(f"  - {first_line}")
                    for item in node.body:
                        if isinstance(item, ast.FunctionDef):
                            doc = ast.get_docstring(item)
                            sig = f"    def {item.name}({', '.join(arg.arg for arg in item.args.args)})"
                            output_lines.append(f"  - `{sig}`")
                            if doc:
                                first_line = doc.strip().splitlines()[0]
                                output_lines.append(f"    - {first_line}")
            output_lines.append("")

with open('DOCUMENTATION.md', 'w', encoding='utf-8') as out:
    out.write('\n'.join(output_lines))
