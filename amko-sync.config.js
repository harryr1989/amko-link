// AMKO Sync Config (v3). Edit only if needed.
window.AMKO_SYNC_CONFIG = window.AMKO_SYNC_CONFIG || {
  endpoint: "https://script.google.com/macros/s/AKfycbygQu_iacFPaBhRcnIDFeCAc89BoV2pwIIN1U3f_sz4i0icsxFH5bpH6UTV-LjOBWMO/exec",
  namespace: "amko-link",
  syncAll: true,
  excludeKeys: [],
  autoPullMs: 5000,    // tarik dari cloud tiap 5 detik
  autoPushMs: 10000,   // fallback push tiap 10 detik
  instantPushDebounceMs: 1200 // push cepat setelah ada perubahan (debounce)
};
