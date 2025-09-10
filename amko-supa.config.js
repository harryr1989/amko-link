window.AMKO_SUPA = {
  url: "https://yagdinlqcagehxhcpzat.supabase.co",
  anonKey: "…anon public key kamu…",
  table: "kv",
  namespace: "amko-link",
  syncAll: true,
  excludeKeys: [
    "amko.auth",       // ⛔ JANGAN sinkronkan sesi
    "amko.auth:exp"    // ⛔ JANGAN sinkronkan expiry sesi
    // (opsional) preferensi per perangkat:
    // "theme", "sidebar-collapsed"
  ],
  autoPullMs: 5000,
  autoPushMs: 10000,
  instantPushDebounceMs: 1200
};
