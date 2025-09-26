#!/usr/bin/env node

/**
 * Script to analyze and optimize imports for better bundle size
 * This script identifies large imports and suggests optimizations
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const SRC_DIR = path.join(__dirname, "../src");
const LARGE_LIBRARIES = [
  "@heroicons/react",
  "@radix-ui",
  "@stripe/react-stripe-js",
  "@supabase/supabase-js",
  "@headlessui/react",
];

/**
 * Recursively find all TypeScript/React files
 */
function findTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith(".") &&
      item !== "node_modules"
    ) {
      findTSFiles(fullPath, files);
    } else if (item.match(/\.(ts|tsx)$/)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Analyze imports in a file
 */
function analyzeImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const imports = [];

  // Match import statements
  const importRegex =
    /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const importStatement = match[0];

    imports.push({
      path: importPath,
      statement: importStatement,
      line: content.substring(0, match.index).split("\n").length,
    });
  }

  return imports;
}

/**
 * Check if import is from a large library
 */
function isLargeLibraryImport(importPath) {
  return LARGE_LIBRARIES.some((lib) => importPath.startsWith(lib));
}

/**
 * Suggest optimizations for imports
 */
function suggestOptimizations(imports, filePath) {
  const suggestions = [];

  for (const imp of imports) {
    if (isLargeLibraryImport(imp.path)) {
      // Check for non-specific imports that could be optimized
      if (
        imp.path === "@heroicons/react/24/outline" &&
        imp.statement.includes("{")
      ) {
        // Extract imported icons
        const iconsMatch = imp.statement.match(/{([^}]+)}/);
        if (iconsMatch) {
          const icons = iconsMatch[1].split(",").map((s) => s.trim());
          if (icons.length > 3) {
            suggestions.push({
              type: "icon-optimization",
              file: filePath,
              line: imp.line,
              current: imp.statement,
              suggestion: `Consider using centralized icon imports from @/lib/icons for ${icons.length} icons`,
            });
          }
        }
      }

      // Check for Radix UI imports
      if (imp.path.startsWith("@radix-ui/")) {
        suggestions.push({
          type: "radix-optimization",
          file: filePath,
          line: imp.line,
          current: imp.statement,
          suggestion:
            "Radix UI import detected - ensure it's in optimizePackageImports",
        });
      }

      // Check for Stripe imports
      if (imp.path.startsWith("@stripe/")) {
        suggestions.push({
          type: "stripe-optimization",
          file: filePath,
          line: imp.line,
          current: imp.statement,
          suggestion:
            "Consider dynamic import for Stripe components to reduce initial bundle",
        });
      }
    }
  }

  return suggestions;
}

/**
 * Main analysis function
 */
function analyzeProject() {
  console.log("🔍 Analyzing imports for bundle optimization...\n");

  const files = findTSFiles(SRC_DIR);
  const allSuggestions = [];
  const importStats = {
    totalFiles: files.length,
    filesWithLargeImports: 0,
    largeImportCount: 0,
  };

  for (const file of files) {
    const imports = analyzeImports(file);
    const largeImports = imports.filter((imp) =>
      isLargeLibraryImport(imp.path)
    );

    if (largeImports.length > 0) {
      importStats.filesWithLargeImports++;
      importStats.largeImportCount += largeImports.length;
    }

    const suggestions = suggestOptimizations(imports, file);
    allSuggestions.push(...suggestions);
  }

  // Print statistics
  console.log("📊 Import Analysis Results:");
  console.log(`   Total files analyzed: ${importStats.totalFiles}`);
  console.log(
    `   Files with large library imports: ${importStats.filesWithLargeImports}`
  );
  console.log(
    `   Total large library imports: ${importStats.largeImportCount}`
  );
  console.log(`   Optimization suggestions: ${allSuggestions.length}\n`);

  // Print suggestions
  if (allSuggestions.length > 0) {
    console.log("💡 Optimization Suggestions:\n");

    const groupedSuggestions = allSuggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.type]) {
        acc[suggestion.type] = [];
      }
      acc[suggestion.type].push(suggestion);
      return acc;
    }, {});

    for (const [type, suggestions] of Object.entries(groupedSuggestions)) {
      console.log(`🔧 ${type.toUpperCase()}:`);
      for (const suggestion of suggestions.slice(0, 5)) {
        // Limit to 5 per type
        const relativePath = path.relative(process.cwd(), suggestion.file);
        console.log(`   ${relativePath}:${suggestion.line}`);
        console.log(`   ${suggestion.suggestion}`);
        console.log(`   Current: ${suggestion.current}\n`);
      }

      if (suggestions.length > 5) {
        console.log(`   ... and ${suggestions.length - 5} more\n`);
      }
    }
  } else {
    console.log("✅ No optimization suggestions found!\n");
  }

  // Check if bundle analyzer is available
  try {
    execSync("npm list webpack-bundle-analyzer", { stdio: "ignore" });
    console.log("📦 Bundle Analysis Available:");
    console.log("   Run `npm run analyze` to generate bundle analysis");
    console.log("   Run `npm run build` to see current bundle sizes\n");
  } catch (error) {
    console.log(
      "📦 Install webpack-bundle-analyzer for detailed bundle analysis:"
    );
    console.log("   npm install --save-dev webpack-bundle-analyzer\n");
  }
}

// Run analysis
if (require.main === module) {
  analyzeProject();
}

module.exports = { analyzeProject, findTSFiles, analyzeImports };
