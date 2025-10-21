# Build Scripts Usage Guide

## prepare.js - CLI Download Script

The `prepare.js` script downloads the EmmyLua Unity CLI tools for various platforms.

### Usage

#### Download all platforms
```bash
npm run prepare
```
or
```bash
node build/prepare.js
```

#### Download specific platform
```bash
node build/prepare.js win32-x64
node build/prepare.js darwin-x64
node build/prepare.js darwin-arm64
node build/prepare.js linux-x64
```

### Features

- ✅ **Progress tracking** - Shows download progress with percentage and MB downloaded
- ✅ **Retry mechanism** - Automatically retries failed downloads up to 3 times
- ✅ **Colored output** - Beautiful terminal output with colors and icons
- ✅ **Automatic extraction** - Extracts downloaded ZIP files automatically
- ✅ **Cleanup** - Removes temporary files after successful extraction
- ✅ **Error handling** - Comprehensive error handling with detailed messages

### Configuration

Edit `build/config.js` to customize:

```javascript
{
  cliVersion: '3.0.0',              // CLI version to download
  releaseBaseUrl: '...',            // GitHub release URL
  downloadTimeout: 60000,           // Download timeout (ms)
  retryAttempts: 3                  // Number of retry attempts
}
```

### Output

Downloaded CLI tools are placed in the `cli/` directory:

```
cli/
├── win32-x64/
│   └── EmmyLua.Unity.Cli.exe
├── darwin-x64/
│   └── EmmyLua.Unity.Cli
├── darwin-arm64/
│   └── EmmyLua.Unity.Cli
└── linux-x64/
    └── EmmyLua.Unity.Cli
```

### Troubleshooting

**Download fails:**
- Check your internet connection
- Verify the CLI version exists in the GitHub releases
- Check the GitHub release URL in `config.js`

**Extract fails:**
- Ensure you have write permissions to the `cli/` directory
- Check if the downloaded ZIP file is corrupted

**Platform not found:**
- Use one of the supported platform names: `win32-x64`, `darwin-x64`, `darwin-arm64`, `linux-x64`

## Development Workflow

### Initial Setup
```bash
# Install dependencies
npm install

# Download CLI tools
npm run prepare

# Compile TypeScript
npm run compile
```

### Development
```bash
# Watch mode (auto-compile on changes)
npm run watch

# Then press F5 in VS Code to debug
```

### Before Commit
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Compile
npm run compile

# Run tests
npm test
```

### Release
```bash
# Download all CLI tools
npm run prepare

# Package extension
npm run package

# Publish to marketplace (requires vsce login)
npm run publish
```

## Notes

- The `temp/` directory is used for temporary files and is cleaned up automatically
- The `cli/` directory is ignored by git (see `.gitignore`)
- Download progress is shown every 10% to avoid cluttering the terminal
- The script uses HTTPS with proper redirect handling for GitHub releases
