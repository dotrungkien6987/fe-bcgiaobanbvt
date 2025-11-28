/**
 * inject-version.js
 *
 * Script tự động đồng bộ version từ package.json vào:
 * 1. public/service-worker.js (CACHE_NAME, API_CACHE_NAME)
 * 2. public/version.json (version info cho runtime)
 *
 * Chạy tự động khi:
 * - npm run build (prebuild hook)
 * - npm version patch/minor/major (version hook)
 *
 * Usage: node scripts/inject-version.js
 */

const fs = require("fs");
const path = require("path");

// Paths
const ROOT_DIR = path.resolve(__dirname, "..");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");
const SERVICE_WORKER_PATH = path.join(ROOT_DIR, "public", "service-worker.js");
const VERSION_JSON_PATH = path.join(ROOT_DIR, "public", "version.json");
const ENV_PRODUCTION_PATH = path.join(ROOT_DIR, ".env.production");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function main() {
  log("\n🔄 Inject Version Script Started...", "blue");

  // 1. Read package.json
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    log("❌ Error: package.json not found!", "red");
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
  const version = packageJson.version;

  log(`📦 Package version: ${version}`, "green");

  // 2. Update service-worker.js
  if (!fs.existsSync(SERVICE_WORKER_PATH)) {
    log("⚠️ Warning: service-worker.js not found, skipping...", "yellow");
  } else {
    let swContent = fs.readFileSync(SERVICE_WORKER_PATH, "utf8");

    // Update CACHE_NAME
    const cacheNameRegex = /const CACHE_NAME = "hospital-pwa-v[\d.]+"/;
    const apiCacheNameRegex = /const API_CACHE_NAME = "hospital-api-v[\d.]+"/;

    const newCacheName = `const CACHE_NAME = "hospital-pwa-v${version}"`;
    const newApiCacheName = `const API_CACHE_NAME = "hospital-api-v${version}"`;

    if (cacheNameRegex.test(swContent)) {
      swContent = swContent.replace(cacheNameRegex, newCacheName);
      log(`✅ Updated CACHE_NAME → hospital-pwa-v${version}`, "green");
    } else {
      log("⚠️ CACHE_NAME pattern not found in service-worker.js", "yellow");
    }

    if (apiCacheNameRegex.test(swContent)) {
      swContent = swContent.replace(apiCacheNameRegex, newApiCacheName);
      log(`✅ Updated API_CACHE_NAME → hospital-api-v${version}`, "green");
    } else {
      log("⚠️ API_CACHE_NAME pattern not found in service-worker.js", "yellow");
    }

    // Update Version comment at top
    const versionCommentRegex = /\* Version: [\d.]+/;
    const newVersionComment = `* Version: ${version}`;

    if (versionCommentRegex.test(swContent)) {
      swContent = swContent.replace(versionCommentRegex, newVersionComment);
      log(`✅ Updated version comment → ${version}`, "green");
    }

    fs.writeFileSync(SERVICE_WORKER_PATH, swContent, "utf8");
    log("📝 service-worker.js updated successfully!", "green");
  }

  // 3. Create/Update version.json
  const buildTime = new Date().toISOString();
  const versionInfo = {
    version: version,
    buildTime: buildTime,
    buildTimestamp: Date.now(),
    // Human readable format (Vietnamese)
    buildTimeVN: new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };

  fs.writeFileSync(
    VERSION_JSON_PATH,
    JSON.stringify(versionInfo, null, 2),
    "utf8"
  );
  log(`📝 version.json created:`, "green");
  log(`   Version: ${versionInfo.version}`, "blue");
  log(`   Build Time: ${versionInfo.buildTimeVN}`, "blue");

  // 4. Update .env.production with REACT_APP_VERSION
  if (fs.existsSync(ENV_PRODUCTION_PATH)) {
    let envContent = fs.readFileSync(ENV_PRODUCTION_PATH, "utf8");

    // Check if REACT_APP_VERSION exists
    const versionRegex = /^REACT_APP_VERSION=.*/m;
    const newVersionLine = `REACT_APP_VERSION=${version}`;

    if (versionRegex.test(envContent)) {
      envContent = envContent.replace(versionRegex, newVersionLine);
      log(`✅ Updated REACT_APP_VERSION in .env.production`, "green");
    } else {
      // Add at the end
      envContent =
        envContent.trim() +
        `\n\n# App Version (auto-generated)\n${newVersionLine}\n`;
      log(`✅ Added REACT_APP_VERSION to .env.production`, "green");
    }

    fs.writeFileSync(ENV_PRODUCTION_PATH, envContent, "utf8");
  } else {
    log("⚠️ .env.production not found, skipping...", "yellow");
  }

  log("\n✅ Version injection completed!\n", "green");
}

// Run
try {
  main();
} catch (error) {
  log(`\n❌ Error: ${error.message}\n`, "red");
  process.exit(1);
}
