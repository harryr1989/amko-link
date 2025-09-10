// AMKO Sync Config (unchanged). Edit endpoint if needed.
window.AMKO_SYNC_CONFIG = window.AMKO_SYNC_CONFIG || {
  endpoint: "https://script.google.com/macros/s/AKfycbygQu_iacFPaBhRcnIDFeCAc89BoV2pwIIN1U3f_sz4i0icsxFH5bpH6UTV-LjOBWMO/exec",
  namespace: "amko-link",
  syncAll: true,
  excludeKeys: [],
  autoPullMs: 15000,  // tarik dari cloud tiap 15 detik
  autoPushMs: 15000   // kirim ke cloud tiap 15 detik (hanya jika ada perubahan)
};
