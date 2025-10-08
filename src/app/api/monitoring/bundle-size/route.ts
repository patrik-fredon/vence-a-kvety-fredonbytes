import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface BundleData {
  name: string;
  size: number;
  gzipSize?: number;
}

interface BundleSizeRequest {
  buildId: string;
  bundles: BundleData[];
  totalSize: number;
  totalGzipSize: number;
  commitHash?: string;
  branch?: string;
  timestamp: string;
}

/**
 * POST /api/monitoring/bundle-size
 * Receives bundle size data from CI/CD pipeline
 * Requirements: 7.7, 5.5
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is coming from CI/CD (check for auth token or IP)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.MONITORING_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as BundleSizeRequest;
    const { buildId, bundles, totalSize, totalGzipSize, commitHash, branch, timestamp } = body;

    // Validate required fields
    if (!buildId || !bundles || !Array.isArray(bundles)) {
      return NextResponse.json({ error: "Invalid bundle data" }, { status: 400 });
    }

    const supabase = createClient();

    // Store bundle size data
    const bundleRecords = bundles.map((bundle) => ({
      build_id: buildId,
      bundle_name: bundle.name,
      size_bytes: bundle.size,
      gzip_size_bytes: bundle.gzipSize,
      commit_hash: commitHash,
      branch: branch || "main",
      environment: process.env.NODE_ENV || "production",
      metadata: {
        totalSize,
        totalGzipSize,
        timestamp,
      },
      created_at: new Date(timestamp).toISOString(),
    }));

    const { error: insertError } = await supabase.from("bundle_sizes").insert(bundleRecords);

    if (insertError) {
      console.error("Error storing bundle size data:", insertError);
      return NextResponse.json({ error: "Failed to store bundle data" }, { status: 500 });
    }

    // Check for size increase warnings
    const warnings = await checkBundleSizeWarnings(supabase, buildId, totalSize);

    return NextResponse.json({
      success: true,
      message: "Bundle size data stored successfully",
      buildId,
      bundleCount: bundles.length,
      totalSize,
      warnings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in bundle-size endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/monitoring/bundle-size
 * Retrieves bundle size history
 * Query params:
 * - builds: number of builds to retrieve (default: 10)
 * - branch: filter by branch (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const builds = Number.parseInt(searchParams.get("builds") || "10", 10);
    const branchFilter = searchParams.get("branch");

    const supabase = createClient();

    let query = supabase
      .from("bundle_sizes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(builds * 10); // Get more records to group by build_id

    if (branchFilter) {
      query = query.eq("branch", branchFilter);
    }

    const { data: bundleData, error } = await query;

    if (error) {
      console.error("Error fetching bundle sizes:", error);
      return NextResponse.json({ error: "Failed to fetch bundle data" }, { status: 500 });
    }

    // Group by build_id
    const buildGroups = (bundleData || []).reduce(
      (acc, record) => {
        if (!acc[record.build_id]) {
          acc[record.build_id] = [];
        }
        acc[record.build_id].push(record);
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Get summary for each build
    const buildSummaries = Object.entries(buildGroups)
      .slice(0, builds)
      .map(([buildId, records]) => {
        const totalSize = records.reduce((sum, r) => sum + Number(r.size_bytes), 0);
        const totalGzipSize = records.reduce(
          (sum, r) => sum + (Number(r.gzip_size_bytes) || 0),
          0
        );

        return {
          buildId,
          timestamp: records[0].created_at,
          commitHash: records[0].commit_hash,
          branch: records[0].branch,
          totalSize,
          totalGzipSize,
          bundleCount: records.length,
          largestBundle: records.sort((a, b) => b.size_bytes - a.size_bytes)[0],
        };
      });

    return NextResponse.json({
      success: true,
      builds: buildSummaries,
      count: buildSummaries.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching bundle sizes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Check for bundle size warnings
 */
async function checkBundleSizeWarnings(
  supabase: any,
  currentBuildId: string,
  currentTotalSize: number
): Promise<string[]> {
  const warnings: string[] = [];

  try {
    // Get previous build
    const { data: previousBuilds } = await supabase
      .from("bundle_sizes")
      .select("build_id, metadata")
      .neq("build_id", currentBuildId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (previousBuilds && previousBuilds.length > 0) {
      const previousTotalSize = previousBuilds[0].metadata?.totalSize || 0;
      const sizeIncrease = currentTotalSize - previousTotalSize;
      const percentIncrease = (sizeIncrease / previousTotalSize) * 100;

      // Check for > 10% increase
      if (percentIncrease > 10) {
        warnings.push(
          `Bundle size increased by ${percentIncrease.toFixed(2)}% (${formatBytes(sizeIncrease)})`
        );
      }
    }

    // Check absolute size threshold (200KB)
    if (currentTotalSize > 200 * 1024) {
      warnings.push(`Total bundle size (${formatBytes(currentTotalSize)}) exceeds 200KB threshold`);
    }
  } catch (error) {
    console.error("Error checking bundle size warnings:", error);
  }

  return warnings;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
