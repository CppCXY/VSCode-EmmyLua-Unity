#!/usr/bin/env node

/**
 * Prepare script for EmmyLua Unity extension
 * Downloads and extracts the CLI tools for different platforms
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const AdmZip = require('adm-zip');
const config = require('./config');

// ANSI color codes for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	cyan: '\x1b[36m'
};

/**
 * Logger utility
 */
class Logger {
	static info(message) {
		console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
	}

	static success(message) {
		console.log(`${colors.green}✓${colors.reset} ${message}`);
	}

	static error(message) {
		console.error(`${colors.red}✗${colors.reset} ${message}`);
	}

	static warn(message) {
		console.warn(`${colors.yellow}⚠${colors.reset} ${message}`);
	}

	static step(message) {
		console.log(`${colors.cyan}→${colors.reset} ${message}`);
	}
}

/**
 * Download a file from URL with retry support
 */
async function downloadFile(url, outputPath, retries = config.retryAttempts) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			if (attempt > 1) {
				Logger.warn(`Retry attempt ${attempt}/${retries}...`);
			}

			await new Promise((resolve, reject) => {
				const file = fsSync.createWriteStream(outputPath);
				
				Logger.step(`Downloading from: ${url}`);
				
				https.get(url, {
					timeout: config.downloadTimeout,
					headers: {
						'User-Agent': 'EmmyLua-Unity-Extension'
					}
				}, (response) => {
					// Handle redirects
					if (response.statusCode === 302 || response.statusCode === 301) {
						https.get(response.headers.location, (redirectResponse) => {
							const totalBytes = parseInt(redirectResponse.headers['content-length'], 10);
							let downloadedBytes = 0;
							let lastProgress = 0;

							redirectResponse.on('data', (chunk) => {
								downloadedBytes += chunk.length;
								const progress = Math.floor((downloadedBytes / totalBytes) * 100);
								
								// Only log every 10%
								if (progress >= lastProgress + 10) {
									Logger.step(`Progress: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
									lastProgress = progress;
								}
							});

							redirectResponse.pipe(file);
							
							file.on('finish', () => {
								file.close();
								Logger.success(`Downloaded successfully`);
								resolve();
							});
						}).on('error', (err) => {
							fsSync.unlinkSync(outputPath);
							reject(err);
						});
						return;
					}

					if (response.statusCode !== 200) {
						reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
						return;
					}

					const totalBytes = parseInt(response.headers['content-length'], 10);
					let downloadedBytes = 0;
					let lastProgress = 0;

					response.on('data', (chunk) => {
						downloadedBytes += chunk.length;
						const progress = Math.floor((downloadedBytes / totalBytes) * 100);
						
						// Only log every 10%
						if (progress >= lastProgress + 10) {
							Logger.step(`Progress: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
							lastProgress = progress;
						}
					});

					response.pipe(file);
					
					file.on('finish', () => {
						file.close();
						Logger.success(`Downloaded successfully`);
						resolve();
					});
				}).on('error', (err) => {
					fsSync.unlinkSync(outputPath);
					reject(err);
				});
			});

			return; // Success, exit retry loop
		} catch (error) {
			if (attempt === retries) {
				throw new Error(`Failed to download after ${retries} attempts: ${error.message}`);
			}
			Logger.warn(`Download failed: ${error.message}`);
			await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
		}
	}
}

/**
 * Extract a zip file
 */
async function extractZip(zipPath, outputDir) {
	Logger.step(`Extracting ${path.basename(zipPath)} to ${outputDir}...`);
	
	try {
		const zip = new AdmZip(zipPath);
		zip.extractAllTo(outputDir, true);
		Logger.success(`Extracted successfully`);
	} catch (error) {
		throw new Error(`Failed to extract ${zipPath}: ${error.message}`);
	}
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath) {
	try {
		await fs.access(dirPath);
	} catch {
		await fs.mkdir(dirPath, { recursive: true });
	}
}

/**
 * Clean directory
 */
async function cleanDir(dirPath) {
	try {
		await fs.rm(dirPath, { recursive: true, force: true });
		Logger.success(`Cleaned directory: ${dirPath}`);
	} catch (error) {
		Logger.warn(`Failed to clean directory: ${error.message}`);
	}
}

/**
 * Get platform-specific download info
 */
function getPlatformInfo(platformArg) {
	const platform = platformArg || process.platform;
	
	const platformMap = {
		'win32-x64': { name: 'win32-x64', fileName: 'win32-x64.zip' },
		'darwin-x64': { name: 'darwin-x64', fileName: 'darwin-x64.zip' },
		'darwin-arm64': { name: 'darwin-arm64', fileName: 'darwin-arm64.zip' },
		'linux-x64': { name: 'linux-x64', fileName: 'linux-x64.zip' }
	};

	// Auto-detect platform if not specified
	if (!platformArg) {
		if (platform === 'win32') {
			return platformMap['win32-x64'];
		} else if (platform === 'darwin') {
			const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
			return platformMap[`darwin-${arch}`];
		} else if (platform === 'linux') {
			return platformMap['linux-x64'];
		}
	}

	return platformMap[platformArg] || null;
}

/**
 * Download CLI for specific platform
 */
async function downloadPlatformCli(platformName) {
	const platformInfo = getPlatformInfo(platformName);
	
	if (!platformInfo) {
		throw new Error(`Unsupported platform: ${platformName}`);
	}

	Logger.info(`Processing platform: ${platformInfo.name}`);

	const url = `${config.releaseBaseUrl}/${config.cliVersion}/${platformInfo.fileName}`;
	const tempDir = path.join(process.cwd(), 'temp');
	const cliDir = path.join(process.cwd(), 'cli');
	const zipPath = path.join(tempDir, platformInfo.fileName);

	// Ensure directories exist
	await ensureDir(tempDir);
	await ensureDir(cliDir);

	// Download
	Logger.step(`Downloading CLI for ${platformInfo.name}...`);
	await downloadFile(url, zipPath);

	// Extract
	await extractZip(zipPath, cliDir);

	// Clean up zip file
	await fs.unlink(zipPath);
	Logger.success(`Cleaned up temporary file: ${platformInfo.fileName}`);
}

/**
 * Main build process
 */
async function build() {
	console.log(`\n${colors.bright}${colors.cyan}EmmyLua Unity CLI Preparation${colors.reset}\n`);
	
	try {
		const startTime = Date.now();

		// Get platform from command line args or download all
		const platformArg = process.argv[2];
		
		if (platformArg) {
			// Download specific platform
			await downloadPlatformCli(platformArg);
		} else {
			// Download all platforms
			Logger.info('Downloading CLI for all platforms...\n');
			
			const platforms = ['win32-x64', 'darwin-x64', 'darwin-arm64', 'linux-x64'];
			
			for (const platform of platforms) {
				await downloadPlatformCli(platform);
				console.log(''); // Empty line between platforms
			}
		}

		// Clean temp directory
		const tempDir = path.join(process.cwd(), 'temp');
		await cleanDir(tempDir);

		const duration = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log(`\n${colors.green}${colors.bright}✓ Preparation completed in ${duration}s${colors.reset}\n`);
		
	} catch (error) {
		Logger.error(`Preparation failed: ${error.message}`);
		if (error.stack) {
			console.error(`\n${colors.red}${error.stack}${colors.reset}`);
		}
		process.exit(1);
	}
}

// Run the build
if (require.main === module) {
	build();
}

module.exports = { build, downloadPlatformCli };

