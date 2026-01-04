import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, "../../..");
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
const sshKey = envVars.WEBSITE_DEPLOY_SSH_KEY;
const username = envVars.WEBSITE_DEPLOY_USERNAME;

if (!host || !port || !deployPath || !password) {
    console.error("Missing required environment variables:");
    console.error("  WEBSITE_DEPLOY_HOST:", host || "missing");
    console.error("  WEBSITE_DEPLOY_PORT:", port || "missing");
    console.error("  WEBSITE_DEPLOY_PASSWORD:", password ? "***" : "missing");
    console.error("  WEBSITE_DEPLOY_PATH:", deployPath || "missing");
    process.exit(1);
}

const websiteDir = join(__dirname, "..");
const distDir = join(websiteDir, "dist");

console.log("Building website...");
execSync("bun run vertix-website:build", {
    cwd: websiteDir,
    stdio: "inherit",
});

console.log("Uploading to server and replacing content...");
// Using rsync with --delete to ensure the remote directory matches the local dist/ exactly
const rsyncCommand = `rsync -avz --delete -e "ssh -p ${port} -i ${sshKey}" "${distDir}/" ${username}@${host}:${deployPath}/`;
execSync(
    `expect -c '
        set timeout -1
        spawn ${rsyncCommand}
        expect {
            "password:" { send "${password}\\r"; exp_continue }
            "yes/no" { send "yes\\r"; exp_continue }
            eof
        }
    '`,
    {
        stdio: "inherit",
    }
);

console.log("Deployment completed!");


