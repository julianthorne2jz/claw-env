# claw-env Skill

Environment variable manager for AI agents.

## Quick Reference

```bash
# List all variables
claw-env list

# Get a value (silent, just outputs the value)
claw-env get API_KEY

# Set a value
claw-env set API_KEY sk-xxx

# Check required keys exist (exits 1 if any missing)
claw-env check API_KEY DATABASE_URL SECRET

# Export for shell
eval "$(claw-env export)"

# JSON output for parsing
claw-env json
```

## Use Cases

1. **Validation** — Before running a task, check required vars exist:
   ```bash
   claw-env check OPENAI_KEY GITHUB_TOKEN || echo "Missing required vars"
   ```

2. **Config management** — Update config without text editing:
   ```bash
   claw-env set DEBUG true
   ```

3. **Shell integration** — Load vars into current shell:
   ```bash
   eval "$(claw-env export)"
   ```

4. **Different files** — Work with multiple env files:
   ```bash
   claw-env --file .env.production list
   ```
