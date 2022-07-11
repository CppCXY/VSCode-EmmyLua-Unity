const fs = require('fs');
const download = require('download');
const decompress = require('decompress')
const config = require('./config').default;
const args = process.argv

async function downloadTo(url, path) {
    return new Promise((r, e) => {
        const d = download(url);
        d.then(r).catch(err => e(err));
        d.pipe(fs.createWriteStream(path));
    });
}

async function downloadDepends() {
    await Promise.all([        
        downloadTo(`${config.lanServerUrl}/${config.lanServerVersion}/${args[2]}.zip`, 'temp/unity.zip'),
    ]);
}

async function build() {
    if (!fs.existsSync('temp')) {
        fs.mkdirSync('temp');
    }
    
    await downloadDepends();
    
    await decompress('temp/unity.zip', 'temp/server');

}

build().catch(console.error);
