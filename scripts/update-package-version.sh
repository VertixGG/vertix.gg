#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the contents of package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJsonString = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });

// Parse the contents of package.json as JSON
const packageJson = JSON.parse(packageJsonString);

// Increment the patch version (assuming semver format)
const [major, minor, patch] = packageJson.version.split('.');
const newPatchVersion = Number(patch) + 1;
const newVersion = `${major}.${minor}.${newPatchVersion}`;

// Update the version in package.json
packageJson.version = newVersion;
const newPackageJsonString = JSON.stringify(packageJson, null, 2) + '\n';
fs.writeFileSync(packageJsonPath, newPackageJsonString, { encoding: 'utf8' });

// Output the new version
console.log(`New version: ${newVersion}`);
