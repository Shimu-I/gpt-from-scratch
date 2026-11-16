/* Boot: load the static roadmap, then start the app. */
(function(){
  const msg=(id,t)=>{const el=$(id);el.hidden=false;el.textContent=t};
  try{localStorage.setItem("_t","1");localStorage.removeItem("_t")}
  catch(e){msg("warn","Browser storage is unavailable (private mode or blocked), so progress will not be saved. Use Export JSON to keep a copy.")}
  const freeze=o=>{Object.values(o).forEach(v=>{if(v&&typeof v=="object")freeze(v)});return Object.freeze(o)};
  function convert(j){
    if(!j||!Array.isArray(j.stages)||j.stages.length!==8)throw new Error("roadmap.json must contain exactly 8 stages");
    return freeze(j.stages.map((s,i)=>{
      if(typeof s.name!=="string"||!Array.isArray(s.tasks)||!s.tasks.length)throw new Error("stage "+(i+1)+" is invalid");
      return{n:s.name,w:String(s.why||""),c:String(s.concepts||""),t:s.tasks.map((t,k)=>{
        if(!t||typeof t.title!=="string"||typeof t.done!=="string")throw new Error("stage "+(i+1)+", task "+(k+1)+" is invalid");
        return t.title+"|"+t.done})}}))}
  fetch("data/roadmap.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(j=>{
    D=convert(j);buildTracker();bindBackup();init();render();jr();
    const n=next();if(n)$("s"+n[0]).open=true;
  }).catch(e=>msg("boot","Could not load data/roadmap.json ("+e.message+"). Serve the site over HTTP (GitHub Pages, or python3 -m http.server locally). Browsers block this file when index.html is opened directly from disk."));
})();
