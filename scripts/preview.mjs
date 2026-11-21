import http from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { spawnSync } from 'node:child_process';

const built = spawnSync(process.execPath, ['scripts/build.mjs'], {stdio:'inherit'});
if (built.status !== 0) process.exit(built.status);
mkdirSync('.local', {recursive:true});
const sqlite = new DatabaseSync('.local/preview.sqlite');
if (!sqlite.prepare("SELECT name FROM sqlite_master WHERE name = 'responses'").get()) {
  sqlite.exec(readFileSync('drizzle/0000_responses.sql','utf8').replaceAll('--> statement-breakpoint',''));
}

function prepare(sql, params = []) {
  return {
    bind(...values) { return prepare(sql,values); },
    async first() { return sqlite.prepare(sql).get(...params) || null; },
    async all() { return {results:sqlite.prepare(sql).all(...params)}; },
    async run() {
      const result=sqlite.prepare(sql).run(...params);
      return {meta:{changes:Number(result.changes)}};
    },
  };
}
const {default:worker} = await import('../dist/server/index.js?preview=' + Date.now());
const env = {DB:{prepare}, ADMIN_OWNER_EMAIL:'owner@example.test'};
const server = http.createServer(async (req,res) => {
  try {
    const chunks=[];
    for await (const chunk of req) chunks.push(chunk);
    const headers=new Headers();
    for (const [name,value] of Object.entries(req.headers)) if (value) headers.set(name, Array.isArray(value)?value.join(','):value);
    headers.delete('oai-authenticated-user-id');
    headers.delete('oai-authenticated-user-email');
    if (!req.headers['x-preview-anonymous']) {
      headers.set('oai-authenticated-user-id','local-preview-owner');
      headers.set('oai-authenticated-user-email',env.ADMIN_OWNER_EMAIL);
    }
    const request=new Request('http://' + req.headers.host + req.url, {
      method:req.method, headers,
      ...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{}),
    });
    const response=await worker.fetch(request,env);
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end('Preview error');
  }
});
server.listen(8766,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:8766/ · Admin: http://127.0.0.1:8766/admin'));
