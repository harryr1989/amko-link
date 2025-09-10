// AMKO Supabase Config for v5 (whitelist mode)
window.AMKO_SUPA = {
  url: "https://yagdinlqcagehxhcpzat.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZ2RpbmxxY2FnZWh4aGNwemF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0ODczMzAsImV4cCI6MjA3MzA2MzMzMH0.ttJGGNHjbZKhYB1PK_-cDMp1cg0MXlRVm3DEiaFSjho",
  table: "kv",
  namespace: "amko-link",
  includeKeys: [], // wizard akan mengisi ini
  excludeKeys: ["amko.auth","amko.auth:exp","amko:lastPush","amko:lastPull","amko:includeKeys"],
  syncAll: false,
  autoPullMs: 5000,
  autoPushMs: 10000,
  instantPushDebounceMs: 1200,
  debug: true
};
