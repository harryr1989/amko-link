# AMKO — Sync (Sheets) + Nav Patch — Ready to Replace
- Endpoint: https://script.google.com/macros/s/AKfycbygQu_iacFPaBhRcnIDFeCAc89BoV2pwIIN1U3f_sz4i0icsxFH5bpH6UTV-LjOBWMO/exec
- Sheet ID: 1OmQX_7FFaxk7z9IMUIyyrHAcAcMaH5OPn6pTSbvwrFk

## Replace steps
1) Extract ZIP ini, upload **semua file** ke root repo GitHub Pages (mis. `amko-link`).
2) Pastikan `index.html` ada di root. `404.html` ikut di root.
3) Buka `https://harryr1989.github.io/amko-link/`.

## Fitur dalam paket
- **amkoGoto()**: navigasi aman (membersihkan kutip dan garis miring), mencegah 404 ke root domain.
- **<base href="./">**: semua link relatif ke folder repo.
- **amkoLogout()**: clear storage + redirect ke `index.html`.
- **Google Sheets Sync**: `amko-sync.js` + `amko-sync.config.js` (endpoint sudah diisi). Pull saat buka, push saat tutup.
- **404.html**: auto-redirect ke `index.html` kalau URL nyasar.
