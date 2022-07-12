// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo } from "vscode-languageclient/node";
import * as net from "net";
import * as os from "os";
import * as fs from "fs"

const LANGUAGE_ID = 'lua';
let DEBUG_MODE = true;

interface EmmyLuaExtension {
	reportAPIDoc: (docs: any) => void
}

let client: LanguageClient;
let saveContext: vscode.ExtensionContext;
let emmyluaApi: EmmyLuaExtension;
let unityApiDocs: any[] = [];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	DEBUG_MODE = process.env['EMMY_UNITY_DEV'] === "true";
	saveContext = context;
	context.subscriptions.push(vscode.commands.registerCommand('emmylua.unity.pull', () => {
		const exportNamespace = vscode.workspace.getConfiguration().get<string[]>("emmylua.unity.namespace");
		client?.sendNotification("api/pull", {
			export: exportNamespace
		})
	}));

	startServer();
}

// this method is called when your extension is deactivated
export function deactivate() {
}

async function detectCsharpProject() {
	const slnPath = vscode.workspace.getConfiguration().get<string>("emmylua.unity.sln");
	if (slnPath && slnPath.length !== 0) {
		if (fs.existsSync(slnPath)) {
			return slnPath;
		}
	}

	const cshapSln = await vscode.workspace.findFiles("*.sln");
	if (cshapSln.length === 0) {
		return null;
	}
	return cshapSln[0]?.fsPath;
}

async function startServer() {
	const target = vscode.workspace.getConfiguration().get<string>("emmylua.unity.targetPlugin");
	let targetIdentify = "tangzx.emmylua"
	if (target === "emmylua") {
		targetIdentify = "tangzx.emmylua"
	}
	else if (target === "sumneko_lua") {
		targetIdentify = "sumneko.lua"
	}

	const emmylua = vscode.extensions.getExtension(targetIdentify);
	if (!emmylua) {
		return;
	}
	emmyluaApi = await emmylua.activate();

	let sln = await detectCsharpProject();
	if (!sln) {
		return;
	}

	let root = "CS";
	const framework = vscode.workspace.getConfiguration().get<string>("emmylua.unity.framework");
	if (framework === "xlua") {
		root = "CS";
	}
	else if (framework === "tolua") {
		root = "";
	}

	const exportNamespace = vscode.workspace.getConfiguration().get<string[]>("emmylua.unity.namespace");

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: LANGUAGE_ID }],
		synchronize: {
			configurationSection: ["emmylua.unity", "files.associations"],
			fileEvents: [
				vscode.workspace.createFileSystemWatcher("**/*.cs")
			]
		},
		initializationOptions: {
			workspaceFolders: vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.map(f => f.uri.toString()) : null,
			client: 'vsc',
			sln,
			export: exportNamespace
		}
	};

	let serverOptions: ServerOptions;
	if (DEBUG_MODE) {
		// The server is a started as a separate app and listens on port 5008
		const connectionInfo = {
			port: 5009,
		};
		serverOptions = () => {
			// Connect to language server via socket
			let socket = net.connect(connectionInfo);
			let result: StreamInfo = {
				writer: socket,
				reader: socket as NodeJS.ReadableStream
			};
			socket.on("close", () => {
				console.log("client connect error!");
			});
			return Promise.resolve(result);
		};
	} else {
		let platform: string = os.platform();

		let command: string = "";
		switch (platform) {
			case "win32":
				command = path.join(
					saveContext.extensionPath,
					'server',
					'unity.exe'
				);
				break;
			case "linux":
				command = path.join(
					saveContext.extensionPath,
					'server',
					'unity'
				);
				break;
			case "darwin":
				command = path.join(
					saveContext.extensionPath,
					'server',
					'unity'
				);
				break;
		}
		serverOptions = {
			command,
			args: []
		};
	}

	client = new LanguageClient(LANGUAGE_ID, "EmmyLuaUnity plugin for vscode.", serverOptions, clientOptions);
	client.start().then(() => {
		console.log("client ready");
	});
	client.onNotification("api/begin", () => {
		unityApiDocs = [];
	});
	client.onNotification("api/add", (request) => {
		unityApiDocs.push(request);
	});
	client.onNotification("api/finish", () => {
		emmyluaApi?.reportAPIDoc({
			classes: unityApiDocs,
			root
		});

		unityApiDocs = [];
	});
}
