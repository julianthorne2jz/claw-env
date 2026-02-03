#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

// Default .env path
const envPath = process.env.CLAW_ENV_PATH || path.join(process.cwd(), '.env');

// Parse .env file
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

// Write .env file (Safe Edit Mode)
function setVar(filePath, key, value) {
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  } else {
    // If creating new, ensure it starts clean or with a header if we want
  }

  const lines = content.split('\n');
  let found = false;
  const newLines = [];
  
  // Prepare new line
  let newLine = `${key}=${value}`;
  if (value.includes(' ') || value.includes('#') || value.includes('\n')) {
    newLine = `${key}="${value.replace(/"/g, '\\"')}"`;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    // Check if line sets this key
    let isMatch = false;
    if (trimmed && !trimmed.startsWith('#')) {
       const eqIndex = trimmed.indexOf('=');
       if (eqIndex !== -1) {
         let lineKey = trimmed.slice(0, eqIndex).trim();
         if (lineKey.startsWith('export ')) lineKey = lineKey.slice(7).trim();
         if (lineKey === key) isMatch = true;
       }
    }

    if (isMatch) {
      newLines.push(newLine);
      found = true;
    } else {
      newLines.push(line);
    }
  }

  if (!found) {
    // If last line is non-empty, add newline
    if (newLines.length > 0 && newLines[newLines.length - 1].trim() !== '') {
      newLines.push('');
    }
    newLines.push(newLine);
  }

  // Join and ensure single newline at end
  const result = newLines.join('\n').replace(/\n{2,}$/g, '\n') + '\n';
  fs.writeFileSync(filePath, result.trim() + '\n');
  console.log(`✓ Set ${key}`);
}

function rmVar(filePath, key) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let found = false;

  for (const line of lines) {
    const trimmed = line.trim();
    let isMatch = false;
    if (trimmed && !trimmed.startsWith('#')) {
       const eqIndex = trimmed.indexOf('=');
       if (eqIndex !== -1) {
         let lineKey = trimmed.slice(0, eqIndex).trim();
         if (lineKey.startsWith('export ')) lineKey = lineKey.slice(7).trim();
         if (lineKey === key) isMatch = true;
       }
    }

    if (isMatch) {
      found = true;
    } else {
      newLines.push(line);
    }
  }

  if (!found) {
    console.error(`✗ Key not found: ${key}`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, newLines.join('\n'));
  console.log(`✓ Removed ${key}`);
}

function templateEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const outLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      outLines.push(line); // Preserve comments/empty
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      outLines.push(line); // Preserve weird lines?
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    outLines.push(`${key}=`);
  }
  
  const outPath = filePath + '.example';
  fs.writeFileSync(outPath, outLines.join('\n'));
  console.log(`✓ Created ${outPath}`);
}

function showHelp() {
  console.log(`
claw-env - Environment variable manager for AI agents

Usage:
  claw-env list              List all variables
  claw-env get <KEY>         Get a specific variable
  claw-env set <KEY> <VAL>   Set a variable
  claw-env rm <KEY>          Remove a variable
  claw-env check <KEY...>    Check if keys exist (exit 1 if missing)
  claw-env template          Generate .env.example from .env
  claw-env export            Export as shell commands
  claw-env json              Output as JSON
  claw-env init              Create empty .env if missing

Options:
  --file <path>    Use specific .env file
  --help           Show this help

Environment:
  CLAW_ENV_PATH    Default .env file path
`);
}

function listVars(env) {
  const keys = Object.keys(env).sort();
  if (keys.length === 0) {
    console.log('(no variables)');
    return;
  }
  const maxLen = Math.max(...keys.map(k => k.length));
  for (const k of keys) {
    const v = env[k];
    const display = v.length > 40 ? v.slice(0, 37) + '...' : v;
    console.log(`${k.padEnd(maxLen)}  ${display}`);
  }
}

function getVar(env, key) {
  if (key in env) {
    console.log(env[key]);
  } else {
    process.exit(1);
  }
}

function checkVars(env, keys) {
  const missing = keys.filter(k => !(k in env));
  if (missing.length > 0) {
    console.error(`Missing: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('✓ All keys present');
}

function exportVars(env) {
  for (const [k, v] of Object.entries(env)) {
    console.log(`export ${k}="${v.replace(/"/g, '\\"')}"`);
  }
}

function jsonVars(env) {
  console.log(JSON.stringify(env, null, 2));
}

function initEnv(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Already exists: ${filePath}`);
  } else {
    fs.writeFileSync(filePath, '# Environment variables\n');
    console.log(`✓ Created ${filePath}`);
  }
}

// Parse --file flag
let targetPath = envPath;
const fileIdx = args.indexOf('--file');
if (fileIdx !== -1 && args[fileIdx + 1]) {
  targetPath = args[fileIdx + 1];
  args.splice(fileIdx, 2);
}

// Main
const cmd = args[0];

switch (cmd) {
  case 'list':
  case 'ls':
    listVars(parseEnv(targetPath));
    break;
  case 'get':
    if (!args[1]) { console.error('Usage: claw-env get <KEY>'); process.exit(1); }
    getVar(parseEnv(targetPath), args[1]);
    break;
  case 'set':
    if (!args[1] || args[2] === undefined) { 
      console.error('Usage: claw-env set <KEY> <VALUE>'); 
      process.exit(1); 
    }
    setVar(targetPath, args[1], args.slice(2).join(' '));
    break;
  case 'rm':
  case 'remove':
  case 'delete':
    if (!args[1]) { console.error('Usage: claw-env rm <KEY>'); process.exit(1); }
    rmVar(targetPath, args[1]);
    break;
  case 'check':
    if (args.length < 2) { console.error('Usage: claw-env check <KEY...>'); process.exit(1); }
    checkVars(parseEnv(targetPath), args.slice(1));
    break;
  case 'template':
    templateEnv(targetPath);
    break;
  case 'export':
    exportVars(parseEnv(targetPath));
    break;
  case 'json':
    jsonVars(parseEnv(targetPath));
    break;
  case 'init':
    initEnv(targetPath);
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    showHelp();
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    showHelp();
    process.exit(1);
}
