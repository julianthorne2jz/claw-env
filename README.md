# claw-env

Environment variable manager for AI agents.

A simple CLI for managing `.env` files — list, get, set, check, and export environment variables. Built for agents who need quick access to configuration without parsing dotenv files manually.

## Install

```bash
npm install -g claw-env
```

Or run directly:
```bash
npx claw-env
```

## Usage

```bash
# List all variables
claw-env list

# Get a specific variable
claw-env get API_KEY

# Set a variable
claw-env set API_KEY sk-xxx

# Remove a variable  
claw-env rm OLD_KEY

# Check if required keys exist (exits 1 if missing)
claw-env check API_KEY DATABASE_URL

# Export as shell commands
claw-env export
# Output: export API_KEY="sk-xxx"

# Output as JSON
claw-env json

# Create empty .env
claw-env init
```

## Options

```bash
--file <path>    Use specific .env file (default: ./.env)
--help           Show help
```

## Environment

- `CLAW_ENV_PATH` — Default path to .env file

## Why?

Agents often need to:
- Check if required environment variables are set before running tasks
- Quickly read/write config without loading full dotenv libraries
- Export variables for subprocess shells
- Validate setup in CI/CD or agent initialization

`claw-env` makes this dead simple.

## License

MIT © Julian Thorne
