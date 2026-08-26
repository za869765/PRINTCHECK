const NAMES = [
  '侯晏筑', '吳美蓉', '呂佳卉', '李侞蓁', '王聖捷',
  '蔡沛汝', '蔡錦慧', '鄭兆鑫', '陳伶雯', '陳翊瑄',
  '顏詩瑋', '黃瑞培', '值班室', '醫師辦公室', '前台筆電'
];

async function ensureSchema(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    result TEXT NOT NULL,
    at TEXT NOT NULL
  )`).run();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store' }
  });
}

export async function onRequestGet({ env }) {
  await ensureSchema(env.DB);
  const { results } = await env.DB.prepare(`
    SELECT r.name, r.category, r.result, r.at FROM reports r
    JOIN (SELECT name, category, MAX(id) AS mid FROM reports GROUP BY name, category) m
      ON r.id = m.mid
  `).all();
  const latest = {};
  for (const r of results) {
    if (!latest[r.name]) latest[r.name] = {};
    latest[r.name][r.category] = { result: r.result, at: r.at };
  }
  return json({ names: NAMES, latest });
}

export async function onRequestPost({ request, env }) {
  await ensureSchema(env.DB);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const { name, category, result } = body || {};
  if (!NAMES.includes(name)) return json({ error: 'unknown name' }, 400);
  if (!['print', 'scan'].includes(category)) return json({ error: 'bad category' }, 400);
  if (!['ok', 'fail'].includes(result)) return json({ error: 'bad result' }, 400);
  const at = new Date().toISOString();
  await env.DB.prepare('INSERT INTO reports (name, category, result, at) VALUES (?,?,?,?)')
    .bind(name, category, result, at).run();
  return json({ ok: true, at });
}
