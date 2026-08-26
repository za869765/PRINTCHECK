# PRINTCHECK 列印/掃描回報

類似 Google 問卷的回報頁：拉選自己是誰 → 點「列印OK/無法列印」「掃描OK/掃描失敗」即完成回報，支援手機、可代填。

- 前端：`public/index.html`（單檔，Google Forms 風格）
- 後端：Cloudflare Pages Functions + D1（`functions/api/status.js`）
- 資料：`reports` 表保留完整歷史，總覽只顯示每台電腦最新狀態

## 部署

```bash
npx wrangler pages deploy public --project-name=printcheck
```

⚠️ push 不會自動部署，改完必跑上面指令。
