# Contributing to EmmyLua Unity

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **VS Code** >= 1.95.0

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/CppCXY/VSCode-EmmyLua-Unity.git
   cd VSCode-EmmyLua-Unity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Download CLI tools**
   
   Download for all platforms:
   ```bash
   npm run prepare
   ```
   
   Or download for a specific platform:
   ```bash
   node build/prepare.js win32-x64
   node build/prepare.js darwin-x64
   node build/prepare.js darwin-arm64
   node build/prepare.js linux-x64
   ```

4. **Compile TypeScript**
   ```bash
   npm run compile
   ```

5. **Watch mode (for development)**
   ```bash
   npm run watch
   ```

### Development

1. Open the project in VS Code
2. Press `F5` to start debugging
3. A new VS Code window will open with the extension loaded

### Project Structure

```
VSCode-EmmyLua-Unity/
├── src/
│   └── extension.ts          # Main extension code
├── build/
│   ├── prepare.js            # CLI download script
│   └── config.js             # Build configuration
├── cli/                      # CLI binaries (generated)
├── out/                      # Compiled JavaScript (generated)
└── temp/                     # Temporary files (generated)
```

### Building

```bash
npm run compile
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Packaging

```bash
npm run package
```

This will create a `.vsix` file that can be installed in VS Code.

### Publishing

1. Get a Personal Access Token from [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. Login to vsce:
   ```bash
   npx vsce login <publisher-name>
   ```
3. Publish:
   ```bash
   npm run publish
   ```

## Code Style

- Use TypeScript strict mode
- Follow the existing code structure
- Use modern ES6+ features
- Add JSDoc comments for public APIs
- Use descriptive variable names

## Commit Guidelines

- Use clear and descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused on a single change

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Questions?

Feel free to open an issue or discussion on GitHub!
