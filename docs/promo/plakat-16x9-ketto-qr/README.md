# TechALARM fekvő plakát (16:9) – két QR-kóddal

| Fájl | Mire jó |
|---|---|
| `pdf/plakat-16x9-ketto-qr-160x90cm.pdf` | Vektoros PDF, 160 × 90 cm (16:9) – arányosan átméretezhető |
| `preview/plakat-16x9-ketto-qr-4k.png` | 3840 × 2160 px – nagy kijelzőre / vetítésre |
| `preview/plakat-16x9-ketto-qr-fullhd.png` | 1920 × 1080 px – iskolai TV-re, közösségi felületre |

- **Weboldal** QR → `https://tech-alarm.vercel.app/`
- **Kérdőív** QR → `https://forms.gle/YcREVdZa2MUa7WGT9`

A két QR-kódot a renderelt 4K képről visszaolvasva ellenőriztem (OpenCV QRCodeDetector), mindkettő a fenti címet adja.

**Újragenerálás:** `pip install segno && python3 gen-qr.py && node build.mjs && node render.mjs` (Playwright + Chromium kell).
