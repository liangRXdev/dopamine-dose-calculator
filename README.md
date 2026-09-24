# Dopamine Dose Calculator (Dopamine 劑量換算工具)

**English** | [繁體中文](README.zh-TW.md)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-2563eb?style=flat-square)](https://liangrxdev.github.io/dopamine-dose-calculator/)

An instant dopamine IV dose converter built for ICU rounds, deployed as a single HTML file on GitHub Pages — no backend, no installation. The interface is in Traditional Chinese.

---

## Features

### Two-way conversion
| Mode | Input | Output |
|------|------|------|
| Find current dose | mL/hr + body weight (kg) | mcg/kg/min |
| Find target rate | mcg/kg/min + body weight (kg) | mL/hr |

### Preparation concentration
| Preset preparation | Concentration |
|----------|------|
| 600 mg / 200 mL | 3.000 mg/mL |
| 400 mg / 250 mL | 1.600 mg/mL |
| 800 mg / 250 mL | 3.200 mg/mL |
| Custom | Enter mg and mL, calculated instantly |

### Automatic pharmacological range

After conversion, the tool labels which pharmacological range the current dose falls in, with clinical warnings:

| Range | mcg/kg/min | Main receptors | Effect |
|------|-----------|---------|------|
| 🔵 Diuretic | 1–5 | Dopamine receptors | Renal blood flow ↑, urine output ↑ |
| 🟢 Inotropic | 5–10 | Beta-1 receptors | Heart rate ↑, CO ↑, contractility ↑ |
| 🔴 Vasopressor | 10–20 | Alpha receptors | SVR ↑, blood pressure ↑ |

> **Note**: Sources define the dopamine-receptor cutoff differently (some use < 2 mcg/kg/min). The dose ranges are reference values, not absolute cutoffs; adjust to the individual patient's clinical response.

### Dose range table
Based on the current weight and selected preparation, instantly computes the mL/hr range for each of the three pharmacological ranges, with the current range highlighted.

---

## Formulas

```
mcg/kg/min = mL/hr × (mg/mL × 1000) ÷ (kg × 60)

mL/hr = mcg/kg/min × kg × 60 ÷ (mg/mL × 1000)
```

---

## Deployment (GitHub Pages)

```bash
# 1. Create a repo (or use an existing one)
# 2. Put index.html in the repo root
# 3. Go to Settings → Pages → Source: Deploy from branch
#    Branch: main  /  Folder: / (root)
# 4. Save → live in about 1 minute
```

URL format after deployment: `https://<your-username>.github.io/<repo-name>/`

---

## Technical Specifications

| Item | Description |
|------|------|
| Architecture | Plain HTML / CSS / vanilla JS, single file |
| External dependencies | Google Fonts (DM Mono, Noto Sans TC) only; no JS framework |
| Backend | None |
| Dark mode | Supported (`prefers-color-scheme: dark`) |
| Mobile | Supported (viewport meta, touch-friendly inputs) |
| Accessibility | `inputmode="decimal"` brings up the numeric keypad; screen-reader friendly |

---

## Clinical Warnings

| Trigger | Warning |
|----------|---------|
| Dose < 5 mcg/kg/min | Low dose is not recommended for renal protection alone (insufficient clinical evidence); cutoff definitions vary by source |
| Dose > 10 mcg/kg/min | Watch for arrhythmia and peripheral ischemia risk |

---

## Disclaimer

This tool is only a clinical reference aid; conversion results do not replace clinical judgment. All dose adjustments should follow the individual patient's condition, physician orders and institutional policies.

---

## References

- Lexi-Comp, Drug Information © 1978–2021, Wolters Kluwer
- Dose range reference: Hollenberg SM. *Vasoactive drugs in circulatory shock.* Am J Respir Crit Care Med. 2011.

---

## Changelog

| Version | Changes |
|------|---------|
| v1.0 | Initial release: one-way conversion (mL/hr → mcg/kg/min), preset 600 mg/200 mL preparation |
| v1.1 | Added two-way conversion and 4 concentration options (including custom) |
| v1.2 | Added a note on differing dopamine-receptor cutoffs in the literature and a clinical-response reminder |
| v1.3 | Visual redesign: medical-blue primary color, dark mode optimization |
