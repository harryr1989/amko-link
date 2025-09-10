\
// AMKO Sync (Sheets) — v2 with auto intervals + dirty tracking
(function(global){
  const cfgDefaults = {
    endpoint: "",
    namespace: "amko",
    syncAll: true,
    excludeKeys: [],
    autoPullMs: 15000,
    autoPushMs: 15000
  };
  let cfg = {...cfgDefaults};
  let inited = false;
  let lastPull = 0, lastPush = 0;
  let dirty = false; // true jika localStorage berubah
  const LS = window.localStorage;

  // --- util ---
  function now(){ return Date.now(); }
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
  async function httpGet(url){
    const r = await fetch(url, {method:"GET", credentials:"omit"});
    return await r.json();
  }
  async function httpPost(url, json){
    const body = JSON.stringify(json||{});
    try{
      const r = await fetch(url, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body,
        keepalive:true
      });
      return await r.text();
    }catch(e){
      // Fallback for pagehide/beforeunload
      try{
        if (navigator.sendBeacon){
          const blob = new Blob([body], {type:"application/json"});
          navigator.sendBeacon(url, blob);
          return "beacon";
        }
      }catch(_){}
      throw e;
    }
  }

  // --- core ---
  async function pull(){
    const endpoint = cfg.endpoint;
    if(!endpoint || !/^https?:\/\//.test(endpoint)) return;
    try{
      const j = await httpGet(endpoint);
      if (j && j.ok && j.data){
        Object.entries(j.data).forEach(([k,v])=>{
          try{ if(shouldSyncKey(k)) LS.setItem(k, JSON.stringify(v)); }catch(_){}
        });
        lastPull = now();
        LS.setItem("amko:lastPull", String(lastPull));
      }
    }catch(_){ /* ignore network */ }
  }

  async function push(force=false){
    const endpoint = cfg.endpoint;
    if(!endpoint || !/^https?:\/\//.test(endpoint)) return;
    try{
      if (!force && !dirty) return; // kirim hanya jika ada perubahan
      const payload = collectAll();
      await httpPost(endpoint, payload);
      dirty = false;
      lastPush = now();
      LS.setItem("amko:lastPush", String(lastPush));
    }catch(_){ /* ignore network */ }
  }

  function wrapLocalStorage(){
    try{
      const _set = LS.setItem.bind(LS);
      LS.setItem = function(k,v){ try{ _set(k,v); } finally { dirty = true; } };
      const _remove = LS.removeItem.bind(LS);
      LS.removeItem = function(k){ try{ _remove(k); } finally { dirty = true; } };
      const _clear = LS.clear.bind(LS);
      LS.clear = function(){ try{ _clear(); } finally { dirty = true; } };
    }catch(_){}
  }

  function timers(){
    if (cfg.autoPullMs > 0){
      setInterval(()=>{ pull(); }, cfg.autoPullMs);
    }
    if (cfg.autoPushMs > 0){
      setInterval(()=>{ push(false); }, cfg.autoPushMs);
    }
  }

  function init(userCfg){
    if (inited) return;
    cfg = {...cfgDefaults, ...(global.AMKO_SYNC_CONFIG||{}), ...(userCfg||{})};
    inited = true;
    wrapLocalStorage();
    // initial pull
    setTimeout(pull, 150);
    // push on hide/unload
    const onHide = ()=>{ push(true); };
    document.addEventListener("visibilitychange", ()=>{ if (document.visibilityState === "hidden") onHide(); });
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    timers();
  }

  // expose
  global.amkoSync = {
    init,
    auto: ()=>init(),
    pull,
    push,
    syncNow: async ()=>{ await push(true); await pull(); }
  };
})(window);
