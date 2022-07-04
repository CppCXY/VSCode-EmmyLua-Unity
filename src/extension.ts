// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo } from "vscode-languageclient/node";
import * as net from "net";

const LANGUAGE_ID = 'lua';
let DEBUG_MODE = true;

interface EmmyLuaExtension {
	reportAPIDoc: (docs: any)=>void
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
	startServer();
}

// this method is called when your extension is deactivated
export function deactivate() {
}

async function detectCsharpProject() {
	const cshapSln = await vscode.workspace.findFiles("*.sln");
	if (cshapSln.length === 0) {
		return null;
	}
	return cshapSln[0];
}

async function startServer() {
	const emmylua = vscode.extensions.getExtension("tangzx.emmylua")
	if (!emmylua) {
		return
	}
	emmyluaApi = await emmylua.activate();

	const sln = await detectCsharpProject();
	if (!sln) {
		return;
	}

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
			sln: sln?.fsPath
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
		// let platform: string = os.platform();

		// let command: string = "";
		// switch (platform) {
		// 	case "win32":
		// 		command = path.join(
		// 			saveContext.extensionPath,
		// 			'server',
		// 			'bin',
		// 			'CodeFormatServer.exe'
		// 		)
		// 		break;
		// 	case "linux":
		// 		command = path.join(
		// 			saveContext.extensionPath,
		// 			'server',
		// 			'bin',
		// 			'CodeFormatServer'
		// 		)
		// 		fs.chmodSync(command, '777');
		// 		break;
		// 	case "darwin":
		// 		command = path.join(
		// 			saveContext.extensionPath,
		// 			'server',
		// 			'bin',
		// 			'CodeFormatServer'
		// 		)
		// 		fs.chmodSync(command, '777');
		// 		break;
		// }
		serverOptions = {
			command: "",
			args: []
		};
	}

	client = new LanguageClient(LANGUAGE_ID, "EmmyLuaCodeStyle plugin for vscode.", serverOptions, clientOptions);
	client.start().then(() => {
		console.log("client ready");
	});
	client.onNotification("api/begin", () => {
		unityApiDocs = [];
	})
	client.onNotification("api/add", (request) => {
		unityApiDocs.push(request)
	})
	client.onNotification("api/finish", () => {
		emmyluaApi?.reportAPIDoc({
			classes: unityApiDocs
		});
		unityApiDocs = [];
	})
}
