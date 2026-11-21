import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import path from 'node:path';

const textFiles = ['index.html','content.js','collection.js','app.js','styles.css','admin.html','admin-login.html','admin.css','admin.js'];
const images = ['ai-hub.jpg','resources.jpg','events.png','policy.jpg','ai-talk.png'];
const files = [...textFiles, ...images.map(name => 'assets/' + name)];
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
const assets = {};
for (const file of files) {
  assets['/' + file] = {type:mime[path.extname(file)], body:readFileSync(file).toString('base64')};
}
mkdirSync('worker', {recursive:true});
writeFileSync('worker/assets.generated.js', 'export default ' + JSON.stringify(assets) + ';\n');
const worker = readFileSync('worker/index.js','utf8').replace("import ASSETS from './assets.generated.js';", 'const ASSETS = ' + JSON.stringify(assets) + ';');
mkdirSync('dist/server',{recursive:true});
mkdirSync('dist/.openai',{recursive:true});
writeFileSync('dist/server/index.js',worker);
cpSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built single-module Worker with ' + files.length + ' bundled assets.');
