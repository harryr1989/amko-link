// AMKO Sync (Sheets) — Client
(function(global){
  const cfg = { endpoint: "", namespace: "amko", syncAll: true, excludeKeys: [] };
  let inited = false;
  function init(userCfg){
    if (inited) return;
    Object.assign(cfg, userCfg || {}, (global.AMKO_SYNC_CONFIG||{}));
    inited = true;
  }
  function shouldSyncKey(k){
    const exclude = (global.AMKO_SYNC_CONFIG?.excludeKeys || cfg.excludeKeys);
    if (exclude.includes(k)) return false;
    const syncAll = (global.AMKO_SYNC_CONFIG?.syncAll ?? cfg.syncAll);
    if (syncAll) return true;
    const ns = (global.AMKO_SYNC_CONFIG?.namespace || cfg.namespace) + ":";
    return k.startsWith(ns);
  }
  async function pull(){
    try{
      const endpoint = (global.AMKO_SYNC_CONFIG?.endpoint || cfg.endpoint);
      if(!endpoint || !/^https?:\/\//.test(endpoint)) return;
      const r = await fetch(endpoint, { method:"GET", credentials:"omit" });
      const j = await r.json();
      if(j && j.ok && j.data){
        for(const [k,v] of Object.entries(j.data)){
          try{ if (shouldSyncKey(k)) localStorage.setItem(k, JSON.stringify(v)); }catch(e){}
        }
      }
    }catch(e){}
  }
  function _collectAll(){
    const out = {};
    for (let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if (!shouldSyncKey(k)) continue;
      let val = localStorage.getItem(k);
      try{ out[k] = JSON.parse(val); }catch(e){ out[k] = val; }
    }
    return out;
  }
  async function push(){
    try{
      const endpoint = (global.AMKO_SYNC_CONFIG?.endpoint || cfg.endpoint);
      if(!endpoint || !/^https?:\/\//.test(endpoint)) return;
      const payload = _collectAll();
      await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload), keepalive:true });
    }catch(e){}
  }
  function auto(){
    init();
    const onReady = () => setTimeout(pull, 150);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady, {once:true});
    else onReady();
    const onHide = () => { push(); };
    document.addEventListener('visibilitychange', ()=>{ if (document.visibilityState === 'hidden') onHide(); });
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onHide);
  }
  global.amkoSync = { init, pull, push, auto };
})(window);