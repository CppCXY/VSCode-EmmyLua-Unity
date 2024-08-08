// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from 'vscode';
import * as os from "os";
import * as fs from "fs"

const LANGUAGE_ID = 'lua';
let DEBUG_MODE = true;
let saveContext: vscode.ExtensionContext;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	DEBUG_MODE = process.env['EMMY_UNITY_DEV'] === "true";
	saveContext = context;
	context.subscriptions.push(vscode.commands.registerCommand('emmylua.unity.pull', () => {
		pullUnityApi()
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

async function pullUnityApi() {
	const config = vscode.workspace.getConfiguration();
	const slnPath = await findSlnProject();
	if (!slnPath) {
		vscode.window.showErrorMessage("Can't find unity project");
		return;
	}
	let framework = config.get<string>("emmylua.unity.framework");
	if (!framework) {
		framework = "XLua";
	}

	const properties = config.get<any>("emmylua.unity.msbuild_properties");
	let outputDir = config.get<string>("emmylua.unity.output_dir");
	if (!outputDir) {
		outputDir = ".EmmyLuaUnity"
	}

	let exePath = await getCliExePath();
	let args = ["-s", `"${slnPath}"`, "-o", `${outputDir}`, "-b", framework, "-n", "UnityEngine"];
	if (properties) {
		let first = true;
		for (let key in properties) {
			if (first) {
				args.push("-p");
				first = false;
			}
			args.push(`${key}=${properties[key]}`);
		}
	}

	const terminalName = "EmmyLua.Unity";
	let cli = vscode.window.terminals.find(t => t.name === terminalName);

	if (!cli) {
		cli = vscode.window.createTerminal(terminalName);
	}

	cli.show();
	cli.sendText(`${exePath} ${args.join(" ")}`);
	 
	vscode.window.showInformationMessage("Pulling unity api, please wait...");
}

async function findSlnProject() {
	if (!vscode.workspace.workspaceFolders) {
		return null;
	}

	const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	let configSln = vscode.workspace.getConfiguration().get<string>("emmylua.unity.project_workspace");
	if (configSln && configSln.length !== 0 && configSln.endsWith(".sln")) {
		if (!path.isAbsolute(configSln)) {
			if (configSln.startsWith(".")) {
				configSln = path.join(workspacePath, configSln);
			}
			else if (configSln.includes("${workspaceFolder}")) {
				configSln = configSln.replace("${workspaceFolder}", workspacePath);
			}
		}
		let absPath = path.resolve(configSln);
		if (fs.existsSync(absPath)) {
			return absPath;
		}
	}

	const cshapSln = await vscode.workspace.findFiles("*.sln");
	if (cshapSln.length === 0) {
		return null;
	}
	return cshapSln[0]?.fsPath;
}

async function getCliExePath() {
	const cliPath = path.join(saveContext.extensionPath, "cli");
	let platform = os.platform();
	let cliExe = "";
	if (platform === "win32") {
		return path.join(cliPath, "win32-x64/EmmyLua.Unity.Cli.exe");
	}
	else if (platform === "darwin") {
		if (os.arch() === "arm64") {
			cliExe = path.join(cliPath, "darwin-arm64/EmmyLua.Unity.Cli");
		}
		else {
			cliExe = path.join(cliPath, "darwin-x64/EmmyLua.Unity.Cli");
		}
	}
	else if (platform === "linux") {
		cliExe = path.join(cliPath, "linux-x64/EmmyLua.Unity.Cli");
	}

	fs.chmodSync(cliExe, '777');
	return cliExe;
}