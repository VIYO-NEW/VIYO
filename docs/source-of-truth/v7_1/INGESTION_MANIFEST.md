# VIYO v7.1 Source-of-Truth Ingestion Manifest

This manifest records the eight Google Drive source-of-truth documents ingested after the Architecture Broadcast pre-flight on 2026-04-29. The raw multipart exports are retained under `raw/`; the clean Markdown files in this directory are the files to read before selecting or planning the next VIYO task.

| File | Drive File ID | Source Folder | Modified Time | Lines | Bytes |
|---|---|---|---:|---:|---:|
| `VIYO_PRD_V6_Addendum_Enterprise_SaaS_Hardening.md` | `13JuiTLSDS_oEmkKeY0tkUMCMhQsTPLAP` | 01_PRD_and_Architecture | 2026-04-29T19:14:47.495Z | 1608 | 126698 |
| `VIYO_Architecture_Lock_V7.md` | `1HAcOs38LkvI00ULs4nkyQzyWQlq1oUcN` | 04_Task_Architecture_Locks | 2026-04-29T19:11:25.828Z | 162 | 11524 |
| `R32_Deployment_Operations_Spec.md` | `1Vf2EGRYMnigXdPAAeYqdHJZ1miuf5f9e` | 02_Research_Specs | 2026-04-29T19:16:36.474Z | 152 | 8734 |
| `R33_Email_Infrastructure_Spec.md` | `1GaayaaUxSX3GF6ViGcPJByYwpl_7xXqU` | 02_Research_Specs | 2026-04-29T19:16:38.249Z | 156 | 8719 |
| `R34_Security_Compliance_Spec.md` | `1tetll1N72_j0vwKVwk9y0_GUmK1xkCDC` | 02_Research_Specs | 2026-04-29T19:16:39.999Z | 178 | 8840 |
| `R35_Ai_Operations_Spec.md` | `1tmjUBrmEIElJtQh9l-Ga3Jy-KmYhXSYi` | 02_Research_Specs | 2026-04-29T19:16:41.456Z | 132 | 7820 |
| `R36_Enterprise_Readiness_Spec.md` | `1uenArQfHpEPfPQ7Hx44KBm0S2HF0ZvDF` | 02_Research_Specs | 2026-04-29T19:16:42.999Z | 188 | 7792 |
| `R37_Testing_Quality_Spec.md` | `1kOaM0CjFM82i6QQxy0DZNBXuC1cHpbCI` | 02_Research_Specs | 2026-04-29T19:16:44.506Z | 143 | 8243 |

## Ingestion Gate

No new VIYO Taskmaster task should be planned until these v7.1 sources have been reviewed against the candidate task's architecture and Build Tracker Feature IDs.
