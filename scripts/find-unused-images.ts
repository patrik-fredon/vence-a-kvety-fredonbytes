#!/usr/bin/env tsx
/**
 * Find Unused Images Script
 * 
 * Scans the public folder for images and checks if they are referenced
 * in the codebase. Reports unused images that can be safely removed.
 */

import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Image extensions to check
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif", ".ico"];

// Directories to search for references
const SEARCH_DIRS = ["src", "public"];

/**
 * Get all image files from public directory
 */
function getPublicImages(dir: string = "public"): string[] {
  const images: string[] = [];

  function scanDir(currentDir: string) {
    const items = readdirSync(currentDir);

    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (stat.isFile()) {
        const ext = item.substring(item.lastIndexOf(".")).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          images.push(fullPath);
        }
      }
    }
  }

  scanDir(dir);
  return images;
}

/**
 * Check if an image is referenced in the codebase
 */
function isImageReferenced(imagePath: string): boolean {
  // Get just the filename
  const filename = imagePath.split("/").pop() || "";
  const filenameWithoutExt = filename.substring(0, filename.lastIndexOf("."));

  try {
    // Search for the filename in source files
    const grepCommand = `grep -r "${filename}" ${SEARCH_DIRS.join(" ")} --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.json" --include="*.css" --include="*.html" 2>/dev/null || true`;
    const result = execSync(grepCommand, { encoding: "utf-8" });

    if (result.trim()) {
      return true;
    }

    // Also check for filename without extension (for dynamic imports)
    const grepCommandNoExt = `grep -r "${filenameWithoutExt}" ${SEARCH_DIRS.join(" ")} --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.json" 2>/dev/null || true`;
    const resultNoExt = execSync(grepCommandNoExt, { encoding: "utf-8" });

    return resultNoExt.trim().length > 0;
  } catch (error) {
    console.error(`Error checking ${filename}:`, error);
    return true; // Assume referenced if error occurs (safer)
  }
}

/**
 * Main function
 */
function main() {
  console.log("🔍 Scanning for unused images in public folder...\n");

  const images = getPublicImages();
  console.log(`Found ${images.length} images in public folder\n`);

  const unusedImages: string[] = [];
  const usedImages: string[] = [];

  // Critical images that should never be removed
  const criticalImages = [
    "favicon.svg",
    "favicon-96x96.png",
    "apple-touch-icon.png",
    "logo.svg",
    "placeholder-product.jpg",
    "web-app-manifest-192x192.png",
    "web-app-manifest-512x512.png",
  ];

  for (const image of images) {
    const filename = image.split("/").pop() || "";

    // Skip critical images
    if (criticalImages.includes(filename)) {
      console.log(`✅ ${image} (critical - always keep)`);
      usedImages.push(image);
      continue;
    }

    const isReferenced = isImageReferenced(image);

    if (isReferenced) {
      console.log(`✅ ${image}`);
      usedImages.push(image);
    } else {
      console.log(`❌ ${image} (unused)`);
      unusedImages.push(image);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📊 Summary:");
  console.log(`   Total images: ${images.length}`);
  console.log(`   Used images: ${usedImages.length}`);
  console.log(`   Unused images: ${unusedImages.length}`);

  if (unusedImages.length > 0) {
    console.log("\n🗑️  Unused images that can be removed:");
    for (const image of unusedImages) {
      console.log(`   - ${image}`);
    }

    // Calculate total size of unused images
    let totalSize = 0;
    for (const image of unusedImages) {
      try {
        const stat = statSync(image);
        totalSize += stat.size;
      } catch (error) {
        // Ignore errors
      }
    }

    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`\n💾 Total size of unused images: ${totalSizeMB} MB`);

    console.log("\n⚠️  To remove these images, run:");
    console.log("   rm " + unusedImages.join(" "));
  } else {
    console.log("\n✨ No unused images found! All images are being used.");
  }

  console.log("\n" + "=".repeat(80));
}

main();
