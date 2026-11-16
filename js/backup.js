/* Backup: export, validated import, backup status. */
function bkStatus(){
  const ch=S.ev.filter(e=>PROD.includes(e.type)&&e.t>(S.bk||0)).length;
  const t="Backup status: "+(S.bk?"last backup "+fmt(S.bk)+(ch?", "+ch+" recorded changes since then.":", no changes since."):(S.ev.length||stats().c?"never backed up. Export JSON to keep a copy.":"no backup yet."));
  ["bk","bk2"].forEach(id=>{const el=$(id);if(el)el.textContent=t})}
function buildExport(){const q=stats();
  return{app:"gpt-from-scratch-tracker",format:1,exported:new Date().toISOString(),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
    summary:{completed:q.c,inProgress:q.p,total:q.t},events:S.ev.map(e=>({...e,local:new Date(e.t).toLocaleString()})),state:S}}
function exportData(){S.bk=Date.now();save();const o=buildExport();
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:"application/json"}));
  a.download="gpt-tracker-backup-"+dk(S.bk)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);bkStatus()}
function checkBackup(o){
  const bad=m=>({err:m}),N=x=>typeof x==="number"&&isFinite(x),key=k=>{const m=/^(\d+)-(\d+)$/.exec(k);return !!m&&!!D[m[1]]&&!!D[m[1]].t[m[2]]};
  if(!o||o.app!=="gpt-from-scratch-tracker"||!o.state||typeof o.state!=="object")return bad("This file is not a GPT from Scratch tracker backup.");
  const s=o.state,n=blank();
  if(!s.s||typeof s.s!=="object")return bad("Task statuses are missing.");
  for(const [k,v] of Object.entries(s.s)){if(!key(k)||![0,1,2].includes(v))return bad("Invalid task entry: "+k+".");n.s[k]=v}
  for(const [k,v] of Object.entries(s.r||{})){if(!key(k)||typeof v!=="string")return bad("Invalid reference entry.");n.r[k]=v.slice(0,500)}
  for(const e of s.j||[]){if(!e||!Array.isArray(e.f)||e.f.length!==6||e.f.some(x=>typeof x!=="string")||!D[e.st])return bad("Invalid journal entry.");n.j.push({st:String(e.st),d:String(e.d||""),f:e.f,t:N(e.t)?e.t:0})}
  for(const e of s.ev||[]){if(!e||!N(e.t)||!["status","complete","reopen","journal","milestone","stage"].includes(e.type)||(e.k!=null&&!key(e.k))||(e.type=="milestone"&&!MS[e.m]))return bad("Invalid activity event.");
    n.ev.push({t:e.t,type:e.type,k:e.k??null,from:e.from,to:e.to,st:e.st,m:e.m})}
  n.ev.sort((a,b)=>a.t-b.t);
  for(const e of s.snap||[]){if(!e||!N(e.t)||!N(e.c)||!N(e.p))return bad("Invalid progress snapshot.");n.snap.push({t:e.t,c:e.c,p:e.p})}
  for(const t of s.vis||[]){if(!N(t))return bad("Invalid visit record.");n.vis.push(t)}
  for(const e of s.sess||[]){if(!e||!N(e.s)||!N(e.e)||!N(e.n))return bad("Invalid session record.");n.sess.push({s:e.s,e:e.e,n:e.n})}
  for(const [m,t] of Object.entries(s.ms||{})){if(!MS[m]||!N(t))return bad("Invalid milestone record.");n.ms[m]=t}
  n.cur=Number.isInteger(s.cur)&&s.cur>=-1&&s.cur<D.length?s.cur:null;n.lw=N(s.lw)?s.lw:null;n.bk=N(s.bk)?s.bk:null;
  return{state:n}}
async function importFile(f){
  let o;try{o=JSON.parse(await f.text())}catch(_){alert("Import cancelled: the file is not valid JSON. Your current data was not changed.");return}
  const r=checkBackup(o);if(r.err){alert("Import cancelled: "+r.err+" Your current data was not changed.");return}
  const c=Object.values(r.state.s).filter(v=>v==2).length;
  if(!confirm(`Replace your current progress (${stats().c} tasks completed, ${S.j.length} journal entries) with this backup (${c} tasks completed, ${r.state.j.length} journal entries, exported ${o.exported?fmt(Date.parse(o.exported)):"at an unknown time"})? This cannot be undone.`))return;
  S=r.state;normalize();save();
  document.querySelectorAll("[data-r]").forEach(i=>i.value=S.r[i.dataset.r]||"");render();jr();alert("Backup imported.")}
function bindBackup(){
  $("exj").onclick=$("exj2").onclick=exportData;
  $("imp").onclick=$("imp2").onclick=()=>$("impf").click();
  $("impf").onchange=e=>{const f=e.target.files[0];e.target.value="";if(f)importFile(f)}}
