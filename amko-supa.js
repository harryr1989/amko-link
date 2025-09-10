\
// AMKO Supabase Sync — v5 (whitelist includeKeys + remote config + friendly api)
(function(global){
  const defaults = {
    url: "",
    anonKey: "",
    table: "kv",
    namespace: "amko",
    includeKeys: [],     // ← only these keys will sync
    excludeKeys: ["amko.auth","amko.auth:exp","amko:lastPush","amko:lastPull","amko:includeKeys"],
    syncAll: false,      // ← OFF by default (use whitelist)
    autoPullMs: 5000,
    autoPushMs: 10000,
    instantPushDebounceMs: 1200,
    debug: false
  };
  let cfg = {...defaults};
  let client = null;
  let inited = false;
  let dirty = false;
  let instantTimer = null;
  const LS = window.localStorage;
  const REMOTE_INCLUDE_KEY = "amko:includeKeys";

  function log(...args){ if(cfg.debug || global.AMKO_DEBUG){ console.log("[AMKO SUPA v5]", ...args); }}

  // helper: read local include list (persisted by wizard or config)
  function getLocalInclude(){
    // merge config include + LS include
    const fromCfg = Array.isArray(cfg.includeKeys) ? cfg.includeKeys : [];
    let fromLS = [];
    try{
      const raw = LS.getItem(REMOTE_INCLUDE_KEY);
      if (raw) fromLS = JSON.parse(raw);
    }catch(_){}
    // de-dup
    const set = new Set([...(fromCfg||[]), ...(fromLS||[])]);
    return Array.from(set);
  }

  function shouldSyncKey(k){
    if (!k) return false;
    if ((cfg.excludeKeys||[]).includes(k)) return false;
    if (cfg.syncAll) return true;
    const inc = getLocalInclude();
    return inc.includes(k);
  }

  function collectAll(){
    const out = {};
    for (let i=0;i<LS.length;i++){
      const k = LS.key(i);
      if (!shouldSyncKey(k)) continue;
      const vStr = LS.getItem(k);
      try { out[k] = JSON.parse(vStr); } catch { out[k] = vStr; } // keep string as string
    }
    return out;
  }

  async function pull(){
    if (!client) return;
    try{
      const { data, error } = await client.from(cfg.table).select('key,value');
      if (error){ log("pull error:", error); return; }
      (data||[]).forEach(row=>{
        if (!shouldSyncKey(row.key) && row.key !== REMOTE_INCLUDE_KEY) return;
        try{
          const v = row.value;
          if (row.key === REMOTE_INCLUDE_KEY){
            // store remote include list into LS (merge will happen on next reads)
            LS.setItem(REMOTE_INCLUDE_KEY, JSON.stringify(v||[]));
          }else if (typeof v === "string"){
            LS.setItem(row.key, v);
          }else{
            LS.setItem(row.key, JSON.stringify(v));
          }
        }catch(e){ log("pull setItem fail:", e); }
      });
      const t = Date.now();
      LS.setItem("amko:lastPull", String(t));
      log("pulled", (data||[]).length, "keys at", new Date(t).toISOString());
    }catch(e){ log("pull exception:", e); }
  }

  async function push(force=false){
    if (!client) return;
    if (!force && !dirty) return;
    const payload = collectAll();
    // always include the includeKeys itself so other devices learn it
    try{
      const inc = getLocalInclude();
      payload[REMOTE_INCLUDE_KEY] = inc;
    }catch(_){}
    const rows = Object.entries(payload).map(([k,v]) => ({
      key: k,
      value: v,
      updated_at: new Date().toISOString()
    }));
    if (rows.length === 0) return;
    try{
      const { error } = await client.from(cfg.table).upsert(rows, { onConflict: 'key' });
      if (error){ log("push error:", error); return; }
      dirty = false;
      const t = Date.now();
      LS.setItem("amko:lastPush", String(t));
      log("pushed", rows.length, "keys at", new Date(t).toISOString());
    }catch(e){ log("push exception:", e); }
  }

  function markDirtyAndSchedule(){
    dirty = true;
    if (instantTimer) clearTimeout(instantTimer);
    instantTimer = setTimeout(()=>{ push(true); }, cfg.instantPushDebounceMs);
  }

  function wrapLocalStorage(){
    try{
      const _set = LS.setItem.bind(LS);
      LS.setItem = function(k,v){ try{ _set(k,v); } finally { if (shouldSyncKey(k)) markDirtyAndSchedule(); } };
      const _remove = LS.removeItem.bind(LS);
      LS.removeItem = function(k){ try{ _remove(k); } finally { if (shouldSyncKey(k)) markDirtyAndSchedule(); } };
      const _clear = LS.clear.bind(LS);
      LS.clear = function(){ try{ _clear(); } finally { dirty = true; } };
    }catch(_){}
  }

  function timers(){
    if (cfg.autoPullMs > 0) setInterval(pull, cfg.autoPullMs);
    if (cfg.autoPushMs > 0) setInterval(()=>push(false), cfg.autoPushMs);
  }

  function scanLocalKeys(){
    const keys = [];
    for (let i=0;i<LS.length;i++){
      const k = LS.key(i);
      if (!k) continue;
      if ((cfg.excludeKeys||[]).includes(k)) continue;
      if (k.startsWith("amko.") || k.startsWith("amko:") || k.startsWith("amko-link") || k.startsWith("trans") || k.startsWith("saldo") || k.startsWith("mutasi")){
        keys.push(k);
      }else{
        keys.push(k);
      }
    }
    keys.sort();
    return keys;
  }

  // public API for wizard
  async function setIncludeKeys(list){
    if (!Array.isArray(list)) list = [];
    // store locally and push to cloud
    LS.setItem(REMOTE_INCLUDE_KEY, JSON.stringify(list));
    dirty = true;
    await push(true);
    await pull();
    return getLocalInclude();
  }

  function init(userCfg){
    if (inited) return;
    cfg = {...defaults, ...(global.AMKO_SUPA||{}), ...(userCfg||{})};
    if (!cfg.url || !cfg.anonKey || !global.supabase){ log("missing url/key/cdn"); return; }
    client = global.supabase.createClient(cfg.url, cfg.anonKey);
    inited = true;
    wrapLocalStorage();
    setTimeout(pull, 200);
    timers();
    const onHide = ()=>{ push(true); };
    document.addEventListener("visibilitychange", ()=>{ if (document.visibilityState === "hidden") onHide(); });
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
  }

  global.amkoSupa = {
    init, auto: ()=>init(), pull, push,
    syncNow: async ()=>{ await push(true); await pull(); },
    scanLocalKeys, setIncludeKeys, getInclude: getLocalInclude
  };
})(window);
