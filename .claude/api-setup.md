# Claude API Setup

To enable real Claude AI scoring instead of mock scoring:

## Option 1: Environment Variable (Recommended)
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Then restart your terminal or run:
```bash
source ~/.bashrc  # or ~/.zshrc
```

## Option 2: React Environment Variable
Create a `.env` file in the `frontend/` directory:
```
REACT_APP_ANTHROPIC_API_KEY=your-api-key-here
```

## Testing
The app will automatically:
1. Try the real Claude API first
2. If that fails (no API key or network issue), fall back to mock scoring
3. Log the attempt in browser console

You can test by checking the browser console - it will show either "Using Claude API" or "Claude API unavailable, using mock scoring".