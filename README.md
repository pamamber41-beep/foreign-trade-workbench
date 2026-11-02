# 外贸询盘工作台 (GitHub 版)

零服务器、零费用。工作台是一个网页，询盘进来后自动写进 `data/leads.csv`，并推送到飞书。

## 文件结构

```
index.html                     ← 工作台网页 (GitHub Pages 托管)
.github/workflows/lead-intake.yml  ← 收询盘的后台任务
scripts/process-lead.mjs       ← 清洗、去重、写 CSV
scripts/notify-feishu.mjs      ← 推飞书
data/leads.csv                 ← 线索池 (自动追加)
```

## 上传到 GitHub (3 分钟, 不用装 git)

1. 打开 https://github.com/new
2. Repository name 填 `foreign-trade-workbench`，选 **Public**，点 Create repository
3. 点页面上的 **uploading an existing file** 链接
4. 把本文件夹里 **所有文件** 拖进去（保留目录结构，`.github/workflows/` 这层不能丢）
5. 点 Commit changes

## 开启工作台网页 (GitHub Pages)

1. 仓库 → Settings → 左侧 Pages
2. Source 选 **Deploy from a branch**
3. Branch 选 **main**，目录选 **/ (root)**，Save
4. 等 1 分钟，顶部会出现你的网址：
   `https://你的用户名.github.io/foreign-trade-workbench/`

## 配飞书通知 (可选)

1. 飞书群 → 设置 → 群机器人 → 添加 → 自定义机器人 → 复制 Webhook 地址
2. 仓库 → Settings → Secrets and variables → Actions → New repository secret
3. Name 填 `FEISHU_WEBHOOK`，Secret 粘贴 Webhook 地址 → Add

## 生成调用用的 Token (PAT)

1. 打开 https://github.com/settings/tokens?type=beta
2. Generate new token，名字随便填，过期时间选 90 天
3. Repository access 选 Only select repositories → 选刚建的这个
4. Permissions 勾：
   - **Contents**: Read and write
   - **Actions**: Read and write
   - **Workflows**: Read and write
5. Generate → 复制 `ghp_xxx` 那串（只显示一次）

## 开始用

1. 打开你的 Pages 网址
2. 切到「仓库设置」页：填 GitHub 用户名、仓库名、PAT → 保存
3. 切到「录入询盘」页：随便填一条测试 → 提交
4. 去仓库 Actions 页看任务是不是绿勾
5. 飞书群应该收到一条新询盘通知
6. 「最近线索」页能看到这条记录

## 注意

- PAT 只存在你自己浏览器 localStorage，不要发给别人
- 每次 Actions 跑约消耗 10-30 秒，免费额度每月 2000 分钟，个人用绰绰有余
- 想接官网表单：让官网表单 POST 到 `https://api.github.com/repos/{owner}/{repo}/dispatches`（带 PAT + event_type=new_lead + client_payload），和网页按钮走的是同一条路
