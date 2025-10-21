/**
 * Configuration for EmmyLua Unity CLI download
 */
module.exports = {
	// CLI version to download
	cliVersion: '3.0.0',
	
	// GitHub release URL
	releaseBaseUrl: 'https://github.com/CppCXY/EmmyLua-Unity-Cli/releases/download',
	
	// Platform-specific build names
	platforms: {
		win32: 'win32-x64',
		darwin: 'darwin',  // Will be suffixed with -x64 or -arm64
		linux: 'linux-x64'
	},
	
	// Download timeout in milliseconds
	downloadTimeout: 60000,
	
	// Retry attempts for failed downloads
	retryAttempts: 3
};


