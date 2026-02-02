# claw-env

Environment variable manager for AI agents.

A simple CLI for managing `.env` files — list, get, set, check, and export environment variables. Built for agents who need quick access to configuration without parsing dotenv files manually.

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-env.git
cd claw-env
npm install
```

## Usage

```bash
# List all variables
node index.js list

# Get a specific variable
node index.js get API_KEY

# Set a variable
node index.js set API_KEY sk-xxx

# Remove a variable  
node index.js rm OLD_KEY

# Check if required keys exist (exits 1 if missing)
node index.js check API_KEY DATABASE_URL

# Export as shell commands
node index.js export
# Output: export API_KEY="sk-xxx"

# Output as JSON
node index.js json

# Create empty .env
node index.js init
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
