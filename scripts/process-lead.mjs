// 处理一条新询盘: 清洗 → 追加到 data/leads.csv
import fs from 'node:fs';
import path from 'node:path';

const CSV_PATH = path.join(process.cwd(), 'data', 'leads.csv');
const HEADER = ['ts','name','company','email','domain','email_type','country','part','source','message'];

// 免费邮箱域名清单 (粗略判断是否个人邮箱)
const FREE_MAIL = new Set(['gmail.com','yahoo.com','outlook.com','hotmail.com','live.com','icloud.com','qq.com','163.com','126.com','sina.com','foxmail.com']);

function csvEscape(v) {
  if (v == null) return '';
  v = String(v).replace(/[\r\n]+/g, ' ').trim();
  if (/[",]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}

function main() {
  const raw = process.env.PAYLOAD || '{}';
  let p;
  try { p = JSON.parse(raw); } catch (e) { console.error('PAYLOAD 不是合法 JSON:', e); process.exit(1); }

  const email = (p.email || '').toLowerCase().trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const domain = emailOk ? email.split('@')[1] : '';
  const emailType = !email ? 'missing' : (!emailOk ? 'invalid' : (FREE_MAIL.has(domain) ? 'personal' : 'corporate'));

  const row = [
    p.ts || new Date().toISOString(),
    p.name || '',
    p.company || '',
    email || '',
    domain,
    emailType,
    p.country || '',
    p.part || '',
    p.source || 'unknown',
    p.message || ''
  ];

  // 确保文件存在 & 写表头
  if (!fs.existsSync(CSV_PATH)) {
    fs.mkdirSync(path.dirname(CSV_PATH), { recursive: true });
    fs.writeFileSync(CSV_PATH, HEADER.map(csvEscape).join(',') + '\n', 'utf8');
  }

  // 去重: 同一邮箱 24 小时内不重复入库
  const existing = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n').slice(1);
  const dayAgo = Date.now() - 24*3600*1000;
  for (const line of existing) {
    const cols = line.split(',');
    if (cols[3] === email && email) {
      const t = Date.parse(cols[0]);
      if (!isNaN(t) && t > dayAgo) {
        console.log('跳过重复询盘 (24h内同邮箱):', email);
        process.exit(0);
      }
    }
  }

  fs.appendFileSync(CSV_PATH, row.map(csvEscape).join(',') + '\n', 'utf8');
  console.log('已入库:', email, '|', p.company);
}

main();
