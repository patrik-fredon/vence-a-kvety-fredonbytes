"use client";

/**
 * Cross-Browser Test Runner Component
 *
 * A client-side component that runs cross-browser compatibility tests
 * and displays the results in a user-friendly interface.
 *
 * Usage: Add this component to a test page to run browser tests
 */

import { useEffect, useState } from "react";
import {
  detectBrowser,
  runAllTests,
  generateTestReport,
  getBrowserRecommendations,
  logBrowserInfo,
  type BrowserInfo,
  type BrowserTestSuite,
} from "@/lib/utils/cross-browser-testing";

export function CrossBrowserTestRunner() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [testSuite, setTestSuite] = useState<BrowserTestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    // Detect browser on mount
    const info = detectBrowser();
    setBrowserInfo(info);
    logBrowserInfo();
  }, []);

  const runTests = () => {
    setIsRunning(true);

    // Run tests after a short delay to allow UI to update
    setTimeout(() => {
      const suite = runAllTests();
      setTestSuite(suite);
      setIsRunning(false);
      setShowReport(true);
    }, 100);
  };

  const downloadReport = () => {
    if (!testSuite) return;

    const report = generateTestReport(testSuite);
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cross-browser-test-${testSuite.browser}-${
      new Date().toISOString().split("T")[0]
    }.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!browserInfo) {
    return (
      <div className="p-8 bg-stone-100 rounded-lg">
        <p className="text-stone-600">Loading browser information...</p>
      </div>
    );
  }

  const recommendations = getBrowserRecommendations(browserInfo);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Browser Information */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
        <h2 className="text-2xl font-bold text-teal-800 mb-4">Browser Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-stone-700">Browser:</span>
            <span className="ml-2 text-stone-900">{browserInfo.name}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">Version:</span>
            <span className="ml-2 text-stone-900">{browserInfo.version}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">Engine:</span>
            <span className="ml-2 text-stone-900">{browserInfo.engine}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">Mobile:</span>
            <span className="ml-2 text-stone-900">{browserInfo.isMobile ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">WebP Support:</span>
            <span className="ml-2 text-stone-900">{browserInfo.supportsWebP ? "✅" : "❌"}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">AVIF Support:</span>
            <span className="ml-2 text-stone-900">{browserInfo.supportsAVIF ? "✅" : "❌"}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">CSS Grid:</span>
            <span className="ml-2 text-stone-900">{browserInfo.supportsGrid ? "✅" : "❌"}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-700">Flexbox:</span>
            <span className="ml-2 text-stone-900">{browserInfo.supportsFlexbox ? "✅" : "❌"}</span>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Recommendations</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Test Runner */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
        <h2 className="text-2xl font-bold text-teal-800 mb-4">Run Tests</h2>
        <p className="text-stone-600 mb-4">
          Click the button below to run cross-browser compatibility tests. This will check
          functionality, visual consistency, and responsive behavior.
        </p>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-3 bg-teal-800 text-amber-100 rounded-lg hover:bg-teal-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? "Running Tests..." : "Run All Tests"}
        </button>
      </div>

      {/* Test Results */}
      {testSuite && showReport && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-teal-800">Test Results</h2>
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
            >
              Download Report
            </button>
          </div>

          {/* Summary */}
          <div className="mb-6 p-4 bg-stone-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-teal-800">
                  {testSuite.passRate.toFixed(1)}%
                </div>
                <div className="text-sm text-stone-600">Pass Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{testSuite.passedTests}</div>
                <div className="text-sm text-stone-600">Passed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">{testSuite.failedTests}</div>
                <div className="text-sm text-stone-600">Failed</div>
              </div>
            </div>
          </div>

          {/* Test Categories */}
          {["functionality", "visual", "responsive"].map((category) => {
            const categoryTests = testSuite.tests.filter((t) => t.category === category);
            const passed = categoryTests.filter((t) => t.passed).length;
            const total = categoryTests.length;
            const rate = total > 0 ? (passed / total) * 100 : 0;

            return (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-semibold text-teal-800 mb-3 capitalize">
                  {category} Tests
                  <span className="ml-2 text-sm text-stone-600">
                    ({passed}/{total} - {rate.toFixed(1)}%)
                  </span>
                </h3>
                <div className="space-y-2">
                  {categoryTests.map((test, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        test.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="text-xl mr-2">{test.passed ? "✅" : "❌"}</span>
                        <div className="flex-1">
                          <div className="font-medium text-stone-900">{test.testName}</div>
                          {!test.passed && (
                            <div className="text-sm text-red-700 mt-1">{test.details}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
