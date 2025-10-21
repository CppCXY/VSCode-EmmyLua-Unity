import * as path from 'path';
import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

// Constants
const LANGUAGE_ID = 'lua';
const TERMINAL_NAME = 'EmmyLua.Unity';
const CONFIG_SECTION = 'emmylua.unity';
const DEFAULT_OUTPUT_DIR = '.EmmyLuaUnity';
const DEFAULT_FRAMEWORK = 'XLua';

// Types
interface UnityConfig {
	framework: string;
	projectSln: string;
	outputDir: string;
	msbuildProperties: Record<string, string>;
}

interface PlatformInfo {
	platform: NodeJS.Platform;
	arch: string;
}

// Extension state
class ExtensionState {
	private static instance: ExtensionState;
	private _context?: vscode.ExtensionContext;
	private _outputChannel?: vscode.OutputChannel;
	private _statusBarItem?: vscode.StatusBarItem;

	private constructor() {}

	static getInstance(): ExtensionState {
		if (!ExtensionState.instance) {
			ExtensionState.instance = new ExtensionState();
		}
		return ExtensionState.instance;
	}

	get context(): vscode.ExtensionContext {
		if (!this._context) {
			throw new Error('Extension context not initialized');
		}
		return this._context;
	}

	set context(value: vscode.ExtensionContext) {
		this._context = value;
	}

	get outputChannel(): vscode.OutputChannel {
		if (!this._outputChannel) {
			this._outputChannel = vscode.window.createOutputChannel('EmmyLua Unity');
		}
		return this._outputChannel;
	}

	get statusBarItem(): vscode.StatusBarItem {
		if (!this._statusBarItem) {
			this._statusBarItem = vscode.window.createStatusBarItem(
				vscode.StatusBarAlignment.Right,
				100
			);
			this._statusBarItem.command = 'emmylua.unity.pull';
			this._statusBarItem.text = '$(sync) Unity API';
			this._statusBarItem.tooltip = 'Pull Unity API for Lua';
		}
		return this._statusBarItem;
	}

	dispose(): void {
		this._outputChannel?.dispose();
		this._statusBarItem?.dispose();
	}
}

// Configuration manager
class ConfigurationManager {
	private static getConfig(): vscode.WorkspaceConfiguration {
		return vscode.workspace.getConfiguration(CONFIG_SECTION);
	}

	static getUnityConfig(): UnityConfig {
		const config = this.getConfig();
		return {
			framework: config.get<string>('framework') || DEFAULT_FRAMEWORK,
			projectSln: config.get<string>('project_sln') || '',
			outputDir: config.get<string>('output_dir') || DEFAULT_OUTPUT_DIR,
			msbuildProperties: config.get<Record<string, string>>('msbuild_properties') || {}
		};
	}

	static async updateConfig(key: string, value: any): Promise<void> {
		const config = this.getConfig();
		await config.update(key, value, vscode.ConfigurationTarget.Workspace);
	}
}

// Logger
class Logger {
	private static output = ExtensionState.getInstance().outputChannel;

	static info(message: string): void {
		this.output.appendLine(`[INFO] ${new Date().toISOString()}: ${message}`);
	}

	static error(message: string, error?: Error): void {
		this.output.appendLine(`[ERROR] ${new Date().toISOString()}: ${message}`);
		if (error) {
			this.output.appendLine(`  ${error.message}`);
			if (error.stack) {
				this.output.appendLine(`  ${error.stack}`);
			}
		}
	}

	static warn(message: string): void {
		this.output.appendLine(`[WARN] ${new Date().toISOString()}: ${message}`);
	}

	static show(): void {
		this.output.show();
	}
}

// Unity project finder
class UnityProjectFinder {
	static async findSlnProject(): Promise<string | null> {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			Logger.warn('No workspace folder found');
			return null;
		}

		const workspacePath = workspaceFolders[0].uri.fsPath;
		const config = ConfigurationManager.getUnityConfig();

		// Try configured path first
		if (config.projectSln) {
			const configPath = await this.resolveConfigPath(config.projectSln, workspacePath);
			if (configPath) {
				Logger.info(`Using configured project: ${configPath}`);
				return configPath;
			}
		}

		// Search for .sln files
		Logger.info('Searching for Unity project (.sln files)...');
		const slnFiles = await vscode.workspace.findFiles('*.sln', '**/node_modules/**', 10);
		
		if (slnFiles.length === 0) {
			Logger.error('No .sln files found in workspace');
			return null;
		}

		if (slnFiles.length > 1) {
			// Let user choose if multiple .sln files found
			const selectedFile = await this.promptUserToSelectSln(slnFiles);
			return selectedFile?.fsPath || null;
		}

		Logger.info(`Found Unity project: ${slnFiles[0].fsPath}`);
		return slnFiles[0].fsPath;
	}

	private static async resolveConfigPath(configPath: string, workspacePath: string): Promise<string | null> {
		if (!configPath.endsWith('.sln')) {
			Logger.warn(`Configured path does not end with .sln: ${configPath}`);
			return null;
		}

		let resolvedPath = configPath;

		// Handle relative paths
		if (!path.isAbsolute(configPath)) {
			if (configPath.startsWith('.')) {
				resolvedPath = path.join(workspacePath, configPath);
			} else if (configPath.includes('${workspaceFolder}')) {
				resolvedPath = configPath.replace(/\$\{workspaceFolder\}/g, workspacePath);
			}
		}

		const absolutePath = path.resolve(resolvedPath);
		
		if (existsSync(absolutePath)) {
			return absolutePath;
		}

		Logger.warn(`Configured .sln file not found: ${absolutePath}`);
		return null;
	}

	private static async promptUserToSelectSln(slnFiles: vscode.Uri[]): Promise<vscode.Uri | undefined> {
		const items = slnFiles.map(uri => ({
			label: path.basename(uri.fsPath),
			description: path.dirname(uri.fsPath),
			uri
		}));

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Multiple Unity projects found. Please select one:',
			matchOnDescription: true
		});

		return selected?.uri;
	}
}

// CLI executor
class CliExecutor {
	private static getPlatformInfo(): PlatformInfo {
		return {
			platform: os.platform(),
			arch: os.arch()
		};
	}

	static async getCliExePath(): Promise<string> {
		const state = ExtensionState.getInstance();
		const cliBasePath = path.join(state.context.extensionPath, 'cli');
		const { platform, arch } = this.getPlatformInfo();

		let cliExe: string;

		switch (platform) {
			case 'win32':
				cliExe = path.join(cliBasePath, 'win32-x64', 'EmmyLua.Unity.Cli.exe');
				break;
			case 'darwin':
				const macArch = arch === 'arm64' ? 'arm64' : 'x64';
				cliExe = path.join(cliBasePath, `darwin-${macArch}`, 'EmmyLua.Unity.Cli');
				break;
			case 'linux':
				cliExe = path.join(cliBasePath, 'linux-x64', 'EmmyLua.Unity.Cli');
				break;
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}

		// Set executable permissions on Unix-like systems
		if (platform !== 'win32') {
			try {
				await fs.chmod(cliExe, 0o755);
			} catch (error) {
				Logger.warn(`Failed to set executable permissions: ${error}`);
			}
		}

		if (!existsSync(cliExe)) {
			throw new Error(`CLI executable not found: ${cliExe}`);
		}

		Logger.info(`Using CLI executable: ${cliExe}`);
		return cliExe;
	}

	private static buildCommandArgs(slnPath: string, config: UnityConfig): string[] {
		const args: string[] = [
			'-s', `"${slnPath}"`,
			'-o', config.outputDir,
			'-b', config.framework,
		];

		// Add MSBuild properties
		const properties = config.msbuildProperties;
		if (properties && Object.keys(properties).length > 0) {
			args.push('-p');
			for (const [key, value] of Object.entries(properties)) {
				args.push(`${key}=${value}`);
			}
		}

		return args;
	}

	private static getOrCreateTerminal(): vscode.Terminal {
		// Find existing terminal
		const existingTerminal = vscode.window.terminals.find(t => t.name === TERMINAL_NAME);
		
		if (existingTerminal) {
			Logger.info('Reusing existing terminal');
			return existingTerminal;
		}

		// Create new terminal
		Logger.info('Creating new terminal');
		return vscode.window.createTerminal({
			name: TERMINAL_NAME,
			iconPath: new vscode.ThemeIcon('symbol-namespace')
		});
	}

	private static escapePathForTerminal(exePath: string): string {
		// For PowerShell on Windows, handle spaces in paths
		if (os.platform() === 'win32' && exePath.includes(' ')) {
			return `& "${exePath}"`;
		}
		return exePath;
	}

	static async execute(slnPath: string, config: UnityConfig): Promise<void> {
		try {
			const exePath = await this.getCliExePath();
			const args = this.buildCommandArgs(slnPath, config);
			const terminal = this.getOrCreateTerminal();

			terminal.show();

			// Build command with proper escaping
			const escapedExePath = this.escapePathForTerminal(exePath);
			const command = `${escapedExePath} ${args.join(' ')}`;
			
			Logger.info(`Executing command: ${command}`);
			terminal.sendText(command);

		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error('Failed to execute CLI', error instanceof Error ? error : undefined);
			throw new Error(`CLI execution failed: ${message}`);
		}
	}
}

// Main API puller
class UnityApiPuller {
	static async pull(): Promise<void> {
		const statusBar = ExtensionState.getInstance().statusBarItem;
		
		try {
			statusBar.text = '$(sync~spin) Pulling Unity API...';
			statusBar.show();

			Logger.info('Starting Unity API pull...');

			// Find Unity project
			const slnPath = await UnityProjectFinder.findSlnProject();
			if (!slnPath) {
				const message = 'Cannot find Unity project (.sln file) in workspace';
				Logger.error(message);
				vscode.window.showErrorMessage(message);
				return;
			}

			// Get configuration
			const config = ConfigurationManager.getUnityConfig();
			Logger.info(`Using framework: ${config.framework}`);
			Logger.info(`Output directory: ${config.outputDir}`);

			// Show progress notification
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'EmmyLua Unity',
					cancellable: false
				},
				async (progress) => {
					progress.report({ message: 'Analyzing Unity project...' });
					
					// Execute CLI
					await CliExecutor.execute(slnPath, config);
					
					progress.report({ message: 'API generation started. Check terminal for progress.' });
					
					// Show success message
					const message = `Unity API pull started. Output: ${config.outputDir}`;
					Logger.info(message);
					
					const action = await vscode.window.showInformationMessage(
						'Unity API generation started. Check the terminal for progress.',
						'Show Output',
						'Open Output Folder'
					);

					if (action === 'Show Output') {
						Logger.show();
					} else if (action === 'Open Output Folder') {
						const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
						if (workspacePath) {
							const outputPath = path.isAbsolute(config.outputDir) 
								? config.outputDir 
								: path.join(workspacePath, config.outputDir);
							vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputPath));
						}
					}
				}
			);

		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error occurred';
			Logger.error('Unity API pull failed', error instanceof Error ? error : undefined);
			vscode.window.showErrorMessage(`Failed to pull Unity API: ${message}`);
		} finally {
			statusBar.text = '$(sync) Unity API';
			setTimeout(() => statusBar.hide(), 3000);
		}
	}
}

// Command handlers
class CommandHandlers {
	static registerCommands(context: vscode.ExtensionContext): void {
		// Pull Unity API command
		context.subscriptions.push(
			vscode.commands.registerCommand('emmylua.unity.pull', async () => {
				await UnityApiPuller.pull();
			})
		);

		// Show output command
		context.subscriptions.push(
			vscode.commands.registerCommand('emmylua.unity.showOutput', () => {
				Logger.show();
			})
		);

		// Open settings command
		context.subscriptions.push(
			vscode.commands.registerCommand('emmylua.unity.openSettings', () => {
				vscode.commands.executeCommand('workbench.action.openSettings', CONFIG_SECTION);
			})
		);

		Logger.info('Commands registered');
	}
}

// Extension activation
export function activate(context: vscode.ExtensionContext): void {
	Logger.info('EmmyLua Unity extension activating...');

	// Initialize extension state
	const state = ExtensionState.getInstance();
	state.context = context;

	// Register commands
	CommandHandlers.registerCommands(context);

	// Show status bar item in Lua files
	const statusBar = state.statusBarItem;
	context.subscriptions.push(statusBar);

	// Show/hide status bar based on active editor
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor && editor.document.languageId === LANGUAGE_ID) {
				statusBar.show();
			} else {
				statusBar.hide();
			}
		})
	);

	// Show status bar if current file is Lua
	if (vscode.window.activeTextEditor?.document.languageId === LANGUAGE_ID) {
		statusBar.show();
	}

	Logger.info('EmmyLua Unity extension activated successfully');
}

// Extension deactivation
export function deactivate(): void {
	Logger.info('EmmyLua Unity extension deactivating...');
	ExtensionState.getInstance().dispose();
	Logger.info('EmmyLua Unity extension deactivated');
}