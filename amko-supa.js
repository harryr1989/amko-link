// AMKO Supabase Sync — Client (instant push/pull)
(function(global){
  const defaults = {
    url: "",
    anonKey: "",
    table: "kv",
    namespace: "amko",
    syncAll: true,
    excludeKeys: [],
    autoPullMs: 5000,
    autoPushMs: 10000,
    instantPushDebounceMs: 1200
  };
  let cfg = {...defaults};
  let client = null;
  let inited = false;
  let dirty = false;
  let instantTimer = null;
  const LS = window.localStorage;

  function shouldSyncKey(k){
    if ((cfg.excludeKeys||[]).includes(k)) return false;
    if (cfg.syncAll) return true;
    const ns = (cfg.namespace||"amko") + ":";
    return k.startsWith(ns);
  }
  function collectAll(){
    const out = {};
    for (let i=0;i<LS.length;i++){
      const k = LS.key(i);
      if (!shouldSyncKey(k)) continue;
      const v = LS.getItem(k);
      try { out[k] = JSON.parse(v); } catch { out[k] = v; }
    }
    return out;
  }

  async function pull(){
    if (!client) return;
    try{
      const { data, error } = await client.from(cfg.table).select('key,value');
      if (error) return;
      (data||[]).forEach(row=>{
        try{ if (shouldSyncKey(row.key)) LS.setItem(row.key, JSON.stringify(row.value)); }catch(_){}
      });
      LS.setItem("amko:lastPull", String(Date.now()));
    }catch(_){}
  }

  async function push(force=false){
    if (!client) return;
    if (!force && !dirty) return;
    const payload = collectAll();
    const rows = Object.entries(payload).map(([k,v]) => ({
      key: k,
      value: v,
      updated_at: new Date().toISOString()
    }));
    if (rows.length === 0) return;
    try{
      const { error } = await client.from(cfg.table).upsert(rows, { onConflict: 'key' });
      if (!error) { dirty = false; LS.setItem("amko:lastPush", String(Date.now())); }
    }catch(_){}
  }

  function markDirtyAndSchedule(){
    dirty = true;
    if (instantTimer) clearTimeout(instantTimer);
    instantTimer = setTimeout(()=>{ push(true); }, cfg.instantPushDebounceMs);
  }

  function wrapLocalStorage(){
    try{
      const _set = LS.setItem.bind(LS);
      LS.setItem = function(k,v){ try{ _set(k,v); } finally { markDirtyAndSchedule(); } };
      const _remove = LS.removeItem.bind(LS);
      LS.removeItem = function(k){ try{ _remove(k); } finally { markDirtyAndSchedule(); } };
      const _clear = LS.clear.bind(LS);
      LS.clear = function(){ try{ _clear(); } finally { markDirtyAndSchedule(); } };
    }catch(_){}
  }

  function timers(){
    if (cfg.autoPullMs > 0) setInterval(pull, cfg.autoPullMs);
    if (cfg.autoPushMs > 0) setInterval(()=>push(false), cfg.autoPushMs);
  }

  function init(userCfg){
    if (inited) return;
    cfg = {...defaults, ...(global.AMKO_SUPA||{}), ...(userCfg||{})};
    if (!cfg.url || !cfg.anonKey || !global.supabase) return;
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

  global.amkoSupa = { init, auto: ()=>init(), pull, push, syncNow: async ()=>{ await push(true); await pull(); } };
})(window);