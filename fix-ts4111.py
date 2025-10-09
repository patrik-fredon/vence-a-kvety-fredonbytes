#!/usr/bin/env python3
"""
Script to fix TS4111 errors by converting dot notation to bracket notation
for properties accessed from index signatures.
"""

import re
import sys
from pathlib import Path

def fix_process_env(content: str) -> str:
    """Fix process.env.PROPERTY to process.env['PROPERTY']"""
    # Match process.env.PROPERTY_NAME (but not already in brackets)
    pattern = r"process\.env\.([A-Z_][A-Z0-9_]*)"
    replacement = r"process.env['\1']"
    return re.sub(pattern, replacement, content)

def fix_object_property_access(content: str, patterns: list) -> str:
    """Fix specific object property accesses"""
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    return content

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
            
            # Fix other common patterns from the error list
            patterns = [
                # Translation keys
                (r'\.new\b(?!\()', "['new']"),
                (r'\.read\b(?!\()', "['read']"),
                (r'\.replied\b(?!\()', "['replied']"),
                (r'\.archived\b(?!\()', "['archived']"),
                # Metadata properties
                (r'\.title\b(?!\()', "['title']"),
                (r'\.description\b(?!\()', "['description']"),
                (r'\.url\b(?!\()', "['url']"),
                (r'\.alt\b(?!\()', "['alt']"),
                (r'\.keywords\b(?!\()', "['keywords']"),
                # User/auth properties
                (r'\.isAdmin\b(?!\()', "['isAdmin']"),
                (r'\.email\b(?!\()', "['email']"),
                (r'\.password\b(?!\()', "['password']"),
                (r'\.confirmPassword\b(?!\()', "['confirmPassword']"),
                (r'\.name\b(?!\()', "['name']"),
                (r'\.phone\b(?!\()', "['phone']"),
                (r'\.locale\b(?!\()', "['locale']"),
                # Order properties
                (r'\.orderNumber\b(?!\()', "['orderNumber']"),
                (r'\.firstName\b(?!\()', "['firstName']"),
                (r'\.lastName\b(?!\()', "['lastName']"),
                (r'\.itemCount\b(?!\()', "['itemCount']"),
                (r'\.method\b(?!\()', "['method']"),
                (r'\.status\b(?!\()', "['status']"),
                (r'\.address\b(?!\()', "['address']"),
                (r'\.preferredDate\b(?!\()', "['preferredDate']"),
                # Product/customization properties
                (r'\.productId\b(?!\()', "['productId']"),
                (r'\.orderId\b(?!\()', "['orderId']"),
                (r'\.customerEmail\b(?!\()', "['customerEmail']"),
                (r'\.options\b(?!\()', "['options']"),
                (r'\.items\b(?!\()', "['items']"),
                (r'\.choices\b(?!\()', "['choices']"),
                # Form field names
                (r'\.name_cs\b(?!\()', "['name_cs']"),
                (r'\.name_en\b(?!\()', "['name_en']"),
                (r'\.slug\b(?!\()', "['slug']"),
                (r'\.base_price\b(?!\()', "['base_price']"),
                (r'\.category_id\b(?!\()', "['category_id']"),
                (r'\.stock_quantity\b(?!\()', "['stock_quantity']"),
                (r'\.low_stock_threshold\b(?!\()', "['low_stock_threshold']"),
                # Fallback properties
                (r'\.fallbackApplied\b(?!\()', "['fallbackApplied']"),
                (r'\.svgFallbackApplied\b(?!\()', "['svgFallbackApplied']"),
                (r'\.fallbackValue\b(?!\()', "['fallbackValue']"),
                (r'\.recoveryFailed\b(?!\()', "['recoveryFailed']"),
                # Query params
                (r'\.q\b(?!\()', "['q']"),
                (r'\.category\b(?!\()', "['category']"),
                (r'\.sort\b(?!\()', "['sort']"),
                (r'\.page\b(?!\()', "['page']"),
                # Error types
                (r'\.unknown\b(?!\()', "['unknown']"),
            ]
            
            content = fix_object_property_access(content, patterns)
            
            if content != original_content:
                file_path.write_text(content)
                fixed_count += 1
                print(f"Fixed: {file_path}")
        
        except Exception as e:
            print(f"Error processing {file_path}: {e}", file=sys.stderr)
    
    print(f"\nFixed {fixed_count} files")

if __name__ == "__main__":
    main()
