// 读 leads.csv 最后一行 → 推送到飞书自定义机器人
import fs from 'node:fs';
import path from 'node:path';

const WEBHOOK = process.env.FEISHU_WEBHOOK || '';
if (!WEBHOOK) {
  console.log('未配置 FEISHU_WEBHOOK, 跳过飞书通知');
  process.exit(0);
}

const CSV_PATH = path.join(process.cwd(), 'data', 'leads.csv');
const lines = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n');
if (lines.length < 2) { console.log('没有新线索'); process.exit(0); }

const header = lines[0].split(',');
const last = lines[lines.length - 1].split(',');
const row = {};
header.forEach((h, i) => row[h] = (last[i] || '').replace(/^"|"$/g, ''));

const text = [
  '🔔 新询盘入库',
  `姓名: ${row.name || '-'}`,
  `公司: ${row.company || '-'}`,
  `邮箱: ${row.email || '-'}  (${row.email_type})`,
  `国家: ${row.country || '-'}`,
  `型号/需求: ${row.part || '-'}`,
  `来源: ${row.source}`,
  `时间: ${row.ts}`,
  row.message ? `\n留言:\n${row.message}` : ''
].filter(Boolean).join('\n');

const res = await fetch(WEBHOOK, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ msg_type: 'text', content: { text } })
});
const data = await res.text();
console.log('飞书返回:', res.status, data);
