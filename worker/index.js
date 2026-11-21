import ASSETS from './assets.generated.js';

const CHOICES = ['责骂 Rebuke', '直接纠正 Correct directly', '耐心协作 Work together'];
const INTENTIONS = ['更注意表达 Change', '视情况 Undecided', '保持习惯 Keep habit'];
const STAGES = ['initial', 'research', 'interaction', 'reflection', 'intention', 'completed', 'ended'];
const HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function choice(value, nullable = true) {
  return (nullable && value === null) || (Number.isInteger(value) && value >= 0 && value <= 2);
}

function validateRecord(value) {
  if (!value || !/^[a-zA-Z0-9-]{8,100}$/.test(value.id || '')) return null;
  if (!choice(value.before, false) || !choice(value.after) || !choice(value.intention)) return null;
  if (!['en', 'zh', 'ko'].includes(value.language) || !STAGES.includes(value.stage)) return null;
  if (!Number.isSafeInteger(value.revision) || value.revision < 1) return null;
  if (!Number.isInteger(value.durationSeconds) || value.durationSeconds < 0 || value.durationSeconds > 604800) return null;
  if (typeof value.completed !== 'boolean' || typeof value.ended !== 'boolean') return null;
  if (value.completed && (value.after === null || value.intention === null)) return null;
  if (!Array.isArray(value.cardsOpened) || !value.cardsOpened.every(card => card === 0 || card === 1)) return null;
  if (!Array.isArray(value.turns) || value.turns.length > 200) return null;
  for (const turn of value.turns) {
    if (!['kind', 'direct', 'hostile', 'neutral'].includes(turn.kind)) return null;
    if (![turn.intensity, turn.load].every(n => Number.isFinite(n) && n >= 0 && n <= 100)) return null;
    if (!Number.isFinite(turn.latencyMs) || turn.latencyMs < 0 || turn.latencyMs > 3600000) return null;
  }
  return {
    id: value.id,
    revision: value.revision,
    language: value.language,
    before: value.before,
    after: value.after,
    intention: value.intention,
    completed: value.completed,
    ended: value.ended,
    stage: value.stage,
    durationSeconds: value.durationSeconds,
    cardsOpened: [...new Set(value.cardsOpened)],
    turns: value.turns.map(({kind, intensity, load, latencyMs}) => ({kind, intensity, load, latencyMs})),
  };
}

async function sha256(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function saveResponse(request, env) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({error: 'Origin rejected'}, 403);
  if (Number(request.headers.get('Content-Length') || 0) > 60000) return json({error: 'Too large'}, 413);
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer /, '');
  if (!/^[a-f0-9]{64}$/.test(token)) return json({error: 'Session credential required'}, 401);
  const text = await request.text();
  if (text.length > 60000) return json({error: 'Too large'}, 413);
  let parsed;
  try { parsed = JSON.parse(text); } catch { return json({error: 'Invalid JSON'}, 400); }
  const record = validateRecord(parsed);
  if (!record) return json({error: 'Invalid record'}, 400);
  const hash = await sha256(token);
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `INSERT INTO responses
    (id, token_hash, revision, created_at, updated_at, language, before_choice, after_choice, intention, completed, ended, stage, duration_seconds, cards_opened, turns)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      revision = excluded.revision, updated_at = excluded.updated_at,
      language = excluded.language, before_choice = excluded.before_choice,
      after_choice = excluded.after_choice, intention = excluded.intention,
      completed = excluded.completed, ended = excluded.ended, stage = excluded.stage,
      duration_seconds = excluded.duration_seconds, cards_opened = excluded.cards_opened, turns = excluded.turns
    WHERE responses.token_hash = excluded.token_hash
      AND excluded.revision > responses.revision`
  ).bind(
    record.id, hash, record.revision, now, now, record.language, record.before,
    record.after, record.intention, Number(record.completed), Number(record.ended),
    record.stage, record.durationSeconds, JSON.stringify(record.cardsOpened), JSON.stringify(record.turns)
  ).run();
  if (!result.meta?.changes) {
    const existing = await env.DB.prepare('SELECT token_hash, revision FROM responses WHERE id = ?').bind(record.id).first();
    if (!existing || existing.token_hash !== hash) return json({error: 'Session mismatch'}, 409);
    return json({saved: true, revision: existing.revision});
  }
  return json({saved: true, revision: record.revision});
}

async function getStats(env) {
  const totals = await env.DB.prepare(`SELECT COUNT(*) AS total,
    COALESCE(SUM(completed),0) AS completed,
    COALESCE(SUM(after_choice IS NOT NULL),0) AS paired,
    COALESCE(SUM(after_choice IS NOT NULL AND before_choice != after_choice),0) AS changed,
    COALESCE(SUM(intention IS NOT NULL),0) AS intentionAnswered,
    COALESCE(SUM(intention = 0),0) AS changeIntention
    FROM responses`).first();
  const {results} = await env.DB.prepare(
    'SELECT id, before_choice, after_choice, intention FROM responses WHERE after_choice IS NOT NULL AND intention IS NOT NULL ORDER BY updated_at DESC LIMIT 1000'
  ).all();
  return {
    ...totals,
    traces: results.map(row => ({id: row.id, before: row.before_choice, after: row.after_choice, intention: row.intention})),
  };
}

function isOwner(request, env) {
  return Boolean(env.ADMIN_OWNER_EMAIL) && request.headers.get('oai-authenticated-user-email')?.toLowerCase() === env.ADMIN_OWNER_EMAIL.toLowerCase();
}

async function adminRows(env) {
  const {results} = await env.DB.prepare('SELECT id, created_at, updated_at, language, before_choice, after_choice, intention, completed, ended, stage, duration_seconds, cards_opened, turns FROM responses ORDER BY updated_at DESC LIMIT 10000').all();
  return results.map(row => ({...row, cards_opened: JSON.parse(row.cards_opened), turns: JSON.parse(row.turns)}));
}

function csv(rows) {
  const cells = [['编号','首次选择时间','最后更新','语言','第一次选择','第二次选择','未来意向','已完成','主动结束','当前阶段','体验秒数','交互次数']];
  for (const row of rows) {
    cells.push([row.id, row.created_at, row.updated_at, row.language, CHOICES[row.before_choice],
      CHOICES[row.after_choice] || '未回答', INTENTIONS[row.intention] || '未回答',
      row.completed ? '是' : '否', row.ended ? '是' : '否', row.stage, row.duration_seconds, row.turns.length]);
  }
  return '\uFEFF' + cells.map(row => row.map(cell => '"' + String(cell).replaceAll('"', '""') + '"').join(',')).join('\r\n');
}

function escapeXML(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function paragraph(value, style = '') {
  return '<w:p>' + (style ? '<w:pPr><w:pStyle w:val="' + style + '"/></w:pPr>' : '') +
    '<w:r><w:t xml:space="preserve">' + escapeXML(value) + '</w:t></w:r></w:p>';
}

function reportDocument(rows, stats) {
  const body = [
    paragraph('Machine Sensorium', 'Title'),
    paragraph('参与者选择汇总', 'Heading1'),
    paragraph('导出时间 ' + new Date().toISOString()),
    paragraph('有选择记录 ' + stats.total + ' 份，完成全部选择 ' + stats.completed + ' 份。'),
    paragraph('前后均已回答 ' + stats.paired + ' 份，其中改变选择 ' + stats.changed + ' 份。'),
    paragraph('统计包含中途退出者。未回答保留为空，重复更新按同一会话合并。'),
    paragraph('参与者记录', 'Heading1'),
  ];
  for (const [index, row] of rows.entries()) {
    body.push(
      paragraph(String(index + 1) + '  ' + row.id, 'Heading2'),
      paragraph('第一次选择  ' + CHOICES[row.before_choice]),
      paragraph('再次选择  ' + (CHOICES[row.after_choice] || '未回答')),
      paragraph('未来意向  ' + (INTENTIONS[row.intention] || '未回答')),
      paragraph('状态  ' + (row.completed ? '已完成' : row.ended ? '主动结束' : '进行中或中途退出') + '    语言  ' + row.language + '    交互次数  ' + row.turns.length),
      paragraph('首次记录  ' + row.created_at + '    最后更新  ' + row.updated_at),
    );
  }
  const types = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
  const relationships = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  const documentRels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  const document = '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body.join('') + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1247" w:bottom="1134" w:left="1247"/></w:sectPr></w:body></w:document>';
  const styles = '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="DengXian"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:keepNext/><w:spacing w:after="200"/></w:pPr><w:rPr><w:b/><w:color w:val="000000"/><w:sz w:val="52"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="180"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>';
  return zipFiles({'[Content_Types].xml': types, '_rels/.rels': relationships, 'word/document.xml': document, 'word/styles.xml': styles, 'word/_rels/document.xml.rels': documentRels});
}

// A small, uncompressed ZIP writer keeps DOCX exports independent of server packages.
function zipFiles(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const directory = [];
  let offset = 0;
  let directorySize = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const bytes = encoder.encode(content);
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = new Uint8Array(30);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, bytes.length, true);
    view.setUint32(22, bytes.length, true);
    view.setUint16(26, nameBytes.length, true);
    chunks.push(header, nameBytes, bytes);
    const central = new Uint8Array(46);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, bytes.length, true);
    cv.setUint32(24, bytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    directory.push(central, nameBytes);
    directorySize += central.length + nameBytes.length;
    offset += header.length + nameBytes.length + bytes.length;
  }
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, directory.length / 2, true);
  ev.setUint16(10, directory.length / 2, true);
  ev.setUint32(12, directorySize, true);
  ev.setUint32(16, offset, true);
  const output = new Uint8Array(offset + directorySize + end.length);
  let position = 0;
  for (const chunk of [...chunks, ...directory, end]) {
    output.set(chunk, position);
    position += chunk.length;
  }
  return output;
}

function asset(path) {
  const file = ASSETS[path];
  if (!file) return new Response('Not found', {status: 404, headers: HEADERS});
  const data = Uint8Array.from(atob(file.body), ch => ch.charCodeAt(0));
  return new Response(data, {
    headers: { ...HEADERS, 'Content-Type': file.type, 'Cache-Control': /\.(html|js|css)$/.test(path) ? 'no-cache' : 'public, max-age=300' },
  });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === '/api/health') return json({collection: Boolean(env.DB)});
      if (url.pathname === '/api/responses' && request.method === 'POST') return await saveResponse(request, env);
      if (url.pathname === '/api/stats') return json(await getStats(env));
      if (url.pathname === '/admin') {
        if (!request.headers.get('oai-authenticated-user-id')) return asset('/admin-login.html');
        if (!isOwner(request, env)) return new Response('Only the project owner can view responses.', {status:403, headers:HEADERS});
        return asset('/admin.html');
      }
      if (url.pathname.startsWith('/api/admin/')) {
        if (!isOwner(request, env)) return json({error: 'Owner sign-in required'}, 401);
        const rows = await adminRows(env);
        if (url.pathname === '/api/admin/responses') return json({rows, stats: await getStats(env), limit: 10000});
        const format = url.pathname.split('/').pop();
        const date = new Date().toISOString().slice(0,10);
        if (format === 'export.csv') return new Response(csv(rows), {headers: {...HEADERS, 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="Machine_Sensorium_'+date+'.csv"'}});
        if (format === 'export.json') return new Response(JSON.stringify({exportedAt: new Date().toISOString(), rows}, null, 2), {headers: {...HEADERS, 'Content-Type':'application/json', 'Content-Disposition':'attachment; filename="Machine_Sensorium_'+date+'.json"'}});
        if (format === 'export.docx') return new Response(reportDocument(rows, await getStats(env)), {headers: {...HEADERS, 'Content-Type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition':'attachment; filename="Machine_Sensorium_'+date+'.docx"'}});
        return json({error:'Not found'},404);
      }
      if (!['GET','HEAD'].includes(request.method)) return json({error:'Method not allowed'},405);
      // Only explicitly bundled public assets are served. Secrets and source files stay private.
      if (url.pathname === '/admin.html') return new Response('Not found',{status:404});
      return asset(url.pathname === '/' ? '/index.html' : url.pathname);
    } catch (error) {
      console.error('Sensorium request failed', error.name);
      return json({error:'Service temporarily unavailable'},503);
    }
  },
};
