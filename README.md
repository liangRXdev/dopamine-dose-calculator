# Dopamine 劑量換算工具

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-2563eb?style=flat-square)](https://liangrxdev.github.io/dopamine-dose-calculator/)

ICU 查訪專用的 Dopamine 靜脈注射劑量即時換算工具，以單一 HTML 檔案部署於 GitHub Pages，無需後端、無需安裝。

---

## 功能

### 雙向換算
| 模式 | 輸入 | 輸出 |
|------|------|------|
| 查目前劑量 | mL/hr + 體重 (kg) | mcg/kg/min |
| 查目標速率 | mcg/kg/min + 體重 (kg) | mL/hr |

### 配方濃度選擇
| 預設配方 | 濃度 |
|----------|------|
| 600 mg / 200 mL | 3.000 mg/mL |
| 400 mg / 250 mL | 1.600 mg/mL |
| 800 mg / 250 mL | 3.200 mg/mL |
| 自訂 | 輸入 mg 與 mL 即時計算 |

### 藥理分區自動判斷

換算完成後自動標示目前劑量落於哪個藥理區間，並附臨床警示：

| 區間 | mcg/kg/min | 主要受體 | 效果 |
|------|-----------|---------|------|
| 🔵 利尿 | 1–5 | Dopamine 受體 | 腎血流↑、尿量↑ |
| 🟢 強心 | 5–10 | Beta-1 受體 | 心跳↑、CO↑、心收縮↑ |
| 🔴 升壓 | 10–20 | Alpha 受體 | SVR↑、血壓↑ |

> **注意**：各文獻對 Dopamine 受體切點定義不一（部分設為 < 2 mcg/kg/min）。劑量區間為參考值，非絕對切點，仍應依個別病人臨床反應調整。

### 劑量區間對照表
依目前體重與選定配方，即時計算三個藥理區間對應的 mL/hr 範圍，當前區間自動高亮。

---

## 換算公式

```
mcg/kg/min = mL/hr × (mg/mL × 1000) ÷ (kg × 60)

mL/hr = mcg/kg/min × kg × 60 ÷ (mg/mL × 1000)
```

---

## 部署（GitHub Pages）

```bash
# 1. 建立 repo（或使用現有 repo）
# 2. 將 index.html 放置於 repo 根目錄
# 3. 前往 Settings → Pages → Source: Deploy from branch
#    Branch: main  /  Folder: / (root)
# 4. Save → 約 1 分鐘後生效
```

部署後網址格式：`https://<your-username>.github.io/<repo-name>/`

---

## 技術規格

| 項目 | 說明 |
|------|------|
| 架構 | 純 HTML / CSS / Vanilla JS，單一檔案 |
| 外部依賴 | Google Fonts（DM Mono、Noto Sans TC），僅字型，無 JS 框架 |
| 後端需求 | 無 |
| 深色模式 | 支援（`prefers-color-scheme: dark`） |
| 行動裝置 | 支援（viewport meta、touch-friendly 輸入） |
| 無障礙 | `inputmode="decimal"` 呼出數字鍵盤；螢幕閱讀器可用 |

---

## 臨床警示說明

| 觸發條件 | 警示內容 |
|----------|---------|
| 劑量 < 5 mcg/kg/min | 低劑量不建議單獨作為腎臟保護用途（缺乏充分臨床證據）；切點定義因文獻而異 |
| 劑量 > 10 mcg/kg/min | 注意心律不整及末梢缺血風險 |

---

## 免責聲明

本工具僅供臨床參考輔助，換算結果不替代臨床判斷。所有劑量調整應依病人個別狀況、醫囑及機構規範執行。

---

## 參考來源

- Lexi-Comp, Drug Information © 1978–2021, Wolters Kluwer
- 劑量分區參考：Hollenberg SM. *Vasoactive drugs in circulatory shock.* Am J Respir Crit Care Med. 2011.

---

## 版本紀錄

| 版本 | 變更內容 |
|------|---------|
| v1.0 | 初版：單向換算（mL/hr → mcg/kg/min），預設 600 mg/200 mL 配方 |
| v1.1 | 新增雙向換算模式、4 種配方濃度選擇（含自訂） |
| v1.2 | 新增 Dopa 受體切點文獻差異備註與臨床反應提醒 |
| v1.3 | 介面視覺重設計：醫療藍主色調、深色模式最佳化 |
