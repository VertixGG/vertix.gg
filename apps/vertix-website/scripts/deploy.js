import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, "../..");
const envPath = join(projectRoot, ".env");

const envContent = readFileSync(envPath, "utf-8");
const envVars = {};

for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
        continue;
    }
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
    }
}

const host = envVars.WEBSITE_DEPLOY_HOST;
const port = envVars.WEBSITE_DEPLOY_PORT;
const password = envVars.WEBSITE_DEPLOY_PASSWORD;
const deployPath = envVars.WEBSITE_DEPLOY_PATH;
const sshKey = "/Users/inewlegend/Documents/id_rsa";
const username = "vertktbr";

if (!host || !port || !password || !deployPath) {
    console.error("Missing required environment variables:");
    console.error("  WEBSITE_DEPLOY_HOST:", host || "missing");
    console.error("  WEBSITE_DEPLOY_PORT:", port || "missing");
    console.error("  WEBSITE_DEPLOY_PASSWORD:", password ? "***" : "missing");
    console.error("  WEBSITE_DEPLOY_PATH:", deployPath || "missing");
    process.exit(1);
}

const websiteDir = join(__dirname, "..");
const distDir = join(websiteDir, "dist");
const zipFile = join(projectRoot, "website.zip");

console.log("Building website...");
execSync("bun run vertix-website:build", {
    cwd: websiteDir,
    stdio: "inherit",
});

console.log("Creating password-protected zip...");
const zipPassword = password;
execSync(
    `zip -r -e -P "${zipPassword}" "${zipFile}" ./dist/*`,
    {
        cwd: websiteDir,
        stdio: "inherit",
    }
);

console.log("Uploading to server...");
execSync(
    `scp -v -i "${sshKey}" -P ${port} "${zipFile}" ${username}@${host}:${deployPath}/website.zip`,
    {
        stdio: "inherit",
    }
);

console.log(`\nUnzip command for server:\nunzip -P "${zipPassword}" ${deployPath}/website.zip`);

console.log("Cleaning up...");
execSync(`rm -f "${zipFile}"`, {
    stdio: "inherit",
});

console.log("Deployment completed!");

