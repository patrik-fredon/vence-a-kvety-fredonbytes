#!/usr/bin/env python3
"""
Script to fix TS4111 errors for process.env property accesses only.
Converts process.env.PROPERTY to process.env['PROPERTY']
"""

import re
from pathlib import Path

def fix_process_env(content: str) -> str:
    """Fix process.env.PROPERTY to process.env['PROPERTY']"""
    # Match process.env.PROPERTY_NAME (uppercase with underscores)
    # Only match if not already in brackets
    pattern = r"process\.env\.([A-Z_][A-Z0-9_]*)"
    
    def replace_match(match):
        prop_name = match.group(1)
        return f"process.env['{prop_name}']"
    
    return re.sub(pattern, replace_match, content)

def main():
    # Get all TypeScript files
    src_path = Path("src")
    scripts_path = Path("scripts")
    
    ts_files = list(src_path.rglob("*.ts")) + list(src_path.rglob("*.tsx"))
    ts_files += list(scripts_path.rglob("*.ts"))
    ts_files.append(Path("next.config.ts"))
    
    fixed_count = 0
    
    for file_path in ts_files:
        try:
            content = file_path.read_text()
            original_content = content
            
            # Fix process.env accesses
            content = fix_process_env(content)
            
            if content != original_content:
                file_path.write_text(content)
                fixed_count += 1
                print(f"Fixed: {file_path}")
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == "__main__":
    main()
