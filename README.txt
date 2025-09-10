# AMKO Sync v3 (Instant Push)
Ganti 2 file ini di repo:
- `amko-sync.js` (v3: push cepat setelah ada perubahan, auto-pull 5s, fallback push 10s)
- `amko-sync.config.js` (endpoint + interval sudah diset)

Setelah replace:
1) Buka aplikasi di laptop & tambah transaksi → dalam ≤2 detik data di-push.
2) HP auto-pull tiap 5 detik → refresh/datang sendiri.
3) Bisa pakai perintah manual: `amkoSync.syncNow()` di Console untuk tarik/kirim instan.

Tips debug:
- Buka endpoint Web App di browser → harus tampil JSON `{ "ok": true, ... }`.
- Cek `localStorage.getItem("amko:lastPush")` di Console → harus berubah setelah simpan.
