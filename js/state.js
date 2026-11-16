/* State, storage, events, sessions (no DOM building here). */
let D=[]; // roadmap, loaded from data/roadmap.json by main.js and frozen
const KEY="gpt-scratch-tracker-v2",NAMES=["Not started","In progress","Completed"],CLS=["","p","c"];
let S=blank();function blank(){return{s:{},r:{},j:[],ev:[],vis:[],snap:[],sess:[],ms:{},cur:null,lw:null,bk:null,stats:null}}
try{const x=JSON.parse(localStorage.getItem(KEY));if(x)S=Object.assign(blank(),x)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const get=(i,j)=>S.s[i+"-"+j]||0;
const stage=$("stages");
["ev","vis","snap","sess","j"].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]});["s","r","ms"].forEach(k=>{if(!S[k]||typeof S[k]!=="object")S[k]={}});
function stats(){let c=0,p=0,t=0;const per=D.map((g,i)=>{let n=0;g.t.forEach((_,j)=>{const v=get(i,j);t++;if(v==2){c++;n++}else if(v==1)p++});return{n,t:g.t.length}});return{c,p,t,per}}
function next(){
  
  for(let i=0;i<D.length;i++)for(let j=0;j<D[i].t.length;j++)if(get(i,j)!=2)return[i,j];
  return null}
const PROD=["status","complete","reopen","journal"],GAP=18e5,DAY=864e5,EM=`<p class="empty">No recorded activity yet.</p>`;
const MS=[["Neural network implemented",["0-10","0-12","0-13","0-15"]],["Manual backpropagation verified",["0-11","0-12","0-14"]],["First language model trained",["1-9","1-10","1-11"]],["Attention implemented",["2-4","2-5","2-8","2-9","2-11"]],["Transformer block completed",["3-3","3-5","3-6","3-7","3-9","3-10"]],["GPT architecture assembled",["4-2","4-3","4-4","4-5","4-7"]],["GPT successfully trained",["5-6","5-7","5-9","5-11"]],["Evaluation experiments completed",["6-6","6-7","6-8","6-9","6-11"]],["Bengali experiments completed",["7-5","7-6","7-7"]]];
let VIEW="w",PREV=S.vis[S.vis.length-1];
const p2=n=>String(n).padStart(2,"0"),dk=t=>{const d=new Date(t);return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())};
const sod=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
const wk=t=>{const d=new Date(sod(t));d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};
const mk=t=>{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),1).getTime()};
const fmt=t=>new Date(t).toLocaleString([],{dateStyle:"medium",timeStyle:"short"});
const tn=k=>{const [i,j]=k.split("-");return D[i].t[j].split("|")[0]};
const evText=e=>({complete:()=>"Completed: "+tn(e.k),reopen:()=>"Reopened: "+tn(e.k),status:()=>"Status "+NAMES[e.from]+" to "+NAMES[e.to]+": "+tn(e.k),journal:()=>"Journal entry for stage "+(e.st+1),milestone:()=>"Milestone reached: "+MS[e.m][0],stage:()=>e.to<0?"All stages complete":"Active stage changed to "+(e.to+1)+": "+D[e.to].n})[e.type]();
function active(){for(let i=0;i<D.length;i++)for(let j=0;j<D[i].t.length;j++)if(get(i,j)==1)return i;const n=next();return n?n[0]:-1}
function log(type,k,o){const e={t:Date.now(),type,k,...o},l=S.ev[S.ev.length-1];
  if(l&&l.type==type&&l.k==k&&l.to===e.to&&e.t-l.t<800)return;S.ev.push(e);if(PROD.includes(type)){S.lw=e.t;const s=S.sess[S.sess.length-1];if(s&&e.t-s.e<GAP){s.e=e.t;s.n++}else S.sess.push({s:e.t,e:e.t,n:1})}}
function setStatus(k,v){const f=S.s[k]||0;if(f===v)return;S.s[k]=v;
  log(v==2?"complete":f==2?"reopen":"status",k,{from:f,to:v,st:+k.split("-")[0]});after()}
function after(){const q=stats(),l=S.snap[S.snap.length-1];
  if(!l||l.c!==q.c)S.snap.push({t:Date.now(),c:q.c,p:Math.round(q.c/q.t*100)});
  const a=active();if(S.cur==null)S.cur=a;else if(a!==S.cur){log("stage",null,{from:S.cur,to:a,st:a});S.cur=a}
  MS.forEach(([n,ks],m)=>{const ok=ks.every(k=>get(...k.split("-"))==2);
    if(ok&&S.ms[m]===undefined){S.ms[m]=Date.now();log("milestone",null,{m,st:+ks[ks.length-1].split("-")[0]})}
    else if(!ok&&S.ms[m]!==undefined)delete S.ms[m]});
  S.stats={c:q.c,t:q.t,p:Math.round(q.c/q.t*100),a,at:Date.now()};save();render()}
function normalize(){const q=stats();if(!S.sess.length&&S.ev.length)S.ev.filter(e=>PROD.includes(e.type)).forEach(e=>{const s=S.sess[S.sess.length-1];if(s&&e.t-s.e<GAP){s.e=e.t;s.n++}else S.sess.push({s:e.t,e:e.t,n:1})});
  if(!S.snap.length)S.snap.push({t:Date.now(),c:q.c,p:Math.round(q.c/q.t*100)});
  if(S.cur==null)S.cur=active();
  MS.forEach(([n,ks],m)=>{if(S.ms[m]===undefined&&ks.every(k=>get(...k.split("-"))==2))S.ms[m]=0});
}
function init(){normalize();S.vis.push(Date.now());save()}
