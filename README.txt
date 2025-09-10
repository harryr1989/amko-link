# AMKO Sync v2 — Patch
File yang perlu di-replace di repo:
- `amko-sync.js` (baru, auto-pull/push + deteksi perubahan localStorage)
- `amko-sync.config.js` (sudah berisi endpoint; ada interval 15 detik)

Cara pakai:
1) Upload 2 file ini ke root repo GitHub (replace yang lama).
2) Buka aplikasi di laptop & HP pada URL yang sama.
3) Lakukan perubahan di laptop → tunggu max 15 detik → refresh HP. Atau jalankan `amkoSync.syncNow()` di console untuk sinkron instan.
