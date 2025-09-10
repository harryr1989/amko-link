\
// AMKO Sync (Sheets) — v3 instant-push + auto-pull/push
(function(global){
  const defaults = {
    endpoint: "",
    namespace: "amko",
    syncAll: true,
    excludeKeys: [],
    autoPullMs: 5000,
    autoPushMs: 10000,
    instantPushDebounceMs: 1200
  };
  let cfg = {...defaults};
  let inited = false;
  let dirty = false;
  let lastPush = 0, lastPull = 0;
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
  async function httpGet(url){
    const r = await fetch(url, {method:"GET", credentials:"omit"});
    return await r.json();
  }
  async function httpPost(url, bodyObj){
    const body = JSON.stringify(bodyObj||{});
    try{
      const r = await fetch(url, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body,
        keepalive: true
      });
      return await r.text();
    }catch(e){
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

  async function pull(){
    const endpoint = cfg.endpoint;
    if(!endpoint || !/^https?:\/\//.test(endpoint)) return;
    try{
      const j = await httpGet(endpoint);
      if(j && j.ok && j.data){
        for(const [k,v] of Object.entries(j.data)){
          try{ if(shouldSyncKey(k)) LS.setItem(k, JSON.stringify(v)); }catch(_){}
        }
        lastPull = Date.now();
        LS.setItem("amko:lastPull", String(lastPull));
      }
    }catch(_){/* ignore */}
  }

  async function push(force=false){
    const endpoint = cfg.endpoint;
    if(!endpoint || !/^https?:\/\//.test(endpoint)) return;
    if (!force && !dirty) return;
    try{
      const payload = collectAll();
      await httpPost(endpoint, payload);
      dirty = false;
      lastPush = Date.now();
      LS.setItem("amko:lastPush", String(lastPush));
    }catch(_){/* ignore */}
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
    cfg = {...defaults, ...(global.AMKO_SYNC_CONFIG||{}), ...(userCfg||{})};
    inited = true;
    wrapLocalStorage();
    // initial pull & timers
    setTimeout(pull, 200);
    timers();
    // push on hide/unload
    const onHide = ()=>{ push(true); };
    document.addEventListener("visibilitychange", ()=>{ if (document.visibilityState === "hidden") onHide(); });
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
  }

  global.amkoSync = {
    init,
    auto: ()=>init(),
    pull,
    push,
    syncNow: async ()=>{ await push(true); await pull(); }
  };
})(window);
