# AMKO Sync — Setup v5 (Whitelist)
File di paket ini:
- amko-supa.js (v5, whitelist + remote includeKeys)
- amko-supa.config.js (sudah berisi Supabase URL & anon key kamu)
- sync-setup.html (wizard satu halaman untuk memilih kunci yang akan disinkronkan)

Cara pakai ringkas:
1) Upload tiga file ini ke root repo GitHub Pages kamu (replace amko-supa.js yang lama).
2) Buka https://username.github.io/amko-link/sync-setup.html di perangkat A (laptop).
3) Klik "Scan", centang kunci-kunci data yang ingin disinkronkan → klik "Simpan & Push daftar".
4) Di perangkat B (HP), buka halaman yang sama → klik "Pull dari Cloud" atau "Sync Now".
5) Setelah itu, buka aplikasi utama (tombol "Buka Aplikasi") dan tes transaksi seperti biasa.

Catatan:
- Kunci sesi login (`amko.auth`, `amko.auth:exp`) otomatis tidak ikut sinkron.
- Daftar kunci yang dipilih otomatis tersimpan ke cloud di key `amko:includeKeys` agar semua perangkat tahu apa saja yang disinkronkan.
