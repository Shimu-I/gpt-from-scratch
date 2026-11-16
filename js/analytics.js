/* Analytics dashboard rendering and its controls. */
const bars=(v,l)=>{if(!v.length)return EM;const m=Math.max(...v,1),W=Math.max(v.length*30,240);
  return `<svg class="ch" viewBox="0 0 ${W} 110">${v.map((x,i)=>{const h=x/m*70;return `<rect x="${i*30+4}" y="${88-h}" width="22" height="${h}" fill="#1f5d3a"/><text x="${i*30+15}" y="${84-h}" font-size="9" text-anchor="middle" fill="currentColor">${x}</text><text x="${i*30+15}" y="104" font-size="8" text-anchor="middle" fill="#5d6a62">${l[i]}</text>`}).join("")}</svg>`};
const line=(v,a,b,mx)=>{if(!v.length)return EM;const m=mx||Math.max(...v,1),W=Math.max(v.length*30,240),x=i=>v.length>1?10+i*(W-20)/(v.length-1):W/2,y=p=>88-p/m*70;
  return `<svg class="ch" viewBox="0 0 ${W} 110"><polyline points="${v.map((p,i)=>x(i)+","+y(p)).join(" ")}" fill="none" stroke="#1f5d3a" stroke-width="2"/>${v.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p)}" r="2.5" fill="#1f5d3a"/>`).join("")}<text x="2" y="10" font-size="9" fill="#5d6a62">max ${m}</text><text x="2" y="104" font-size="8" fill="#5d6a62">${a}</text><text x="${W-2}" y="104" font-size="8" text-anchor="end" fill="#5d6a62">${b}</text></svg>`};
function ren2(){
  const q=stats(),now=Date.now(),E=S.ev,P=E.filter(e=>PROD.includes(e.type)),a=active(),n=next();
  const kv=(v,l)=>`<div class="kv"><b>${v}</b><span>${l}</span></div>`;
  const ss=D.map((g,i)=>{let c=0,p=0;g.t.forEach((_,j)=>{const v=get(i,j);if(v==2)c++;else if(v==1)p++});const t=g.t.length;return{n:c,t,pc:Math.round(c/t*100),s:c==t?"Completed":c+p?"In progress":"Not started"}});
  $("a1").innerHTML=kv(Math.round(q.c/q.t*100)+"%","Complete")+kv(q.t,"Total tasks")+kv(q.c,"Completed")+kv(q.t-q.c,"Remaining")+kv(q.p,"In progress")+kv(q.t-q.c-q.p,"Not started")+kv(ss.filter(r=>r.n==r.t).length+" / 8","Stages completed")+kv(a<0?"All done":"Stage "+(a+1),"Active stage");
  $("a2").innerHTML=ss.map((r,i)=>`<div class="hb"><span>${i+1}. ${D[i].n}</span><div class="bar"><i style="width:${r.pc}%"></i></div><span>${r.n}/${r.t}, ${r.pc}%, ${r.s}</span></div>`).join("");
  const pcs=ss.map(r=>r.pc),mx=Math.max(...pcs),mn=Math.min(...pcs),nb=a<0?-1:ss.findIndex((r,i)=>i>a&&r.s=="Not started");
  $("a2s").innerHTML=`<span>Most advanced: <b>${mx?"Stage "+(pcs.indexOf(mx)+1):"none yet"}</b></span><span>Least advanced: <b>${mx==mn?(mx?"all equal":"none started"):"Stage "+(pcs.indexOf(mn)+1)}</b></span><span>Active: <b>${a<0?"none":"Stage "+(a+1)}</b></span><span>Next to begin: <b>${nb<0?"none":"Stage "+(nb+1)}</b></span>`;
  if(n){const[t,c]=D[n[0]].t[n[1]].split("|"),pos=D.slice(0,n[0]).reduce((s,g)=>s+g.t.length,0)+n[1];
    $("a3").innerHTML=`<p class="next">${t}</p><p class="sinfo">Stage ${n[0]+1}: ${D[n[0]].n}, task ${n[1]+1} of ${D[n[0]].t.length}. ${pos?"All "+pos+" earlier tasks are completed.":"No prerequisites."}</p><p><b>Accomplish:</b> ${t}.<br><b>Expected output and completion criteria:</b> ${c}</p><button class="pri" id="go2">Go to this task</button>`}
  else $("a3").textContent="All tasks are completed.";
  const lastC={};E.forEach(e=>{if(e.type=="complete")lastC[e.k]=e.t;if(e.type=="reopen")delete lastC[e.k]});
  const cv=Object.values(lastC),cnt=f=>cv.filter(f).length,days=new Set(P.map(e=>dk(e.t))),w0=wk(now),m0=mk(now),ad=[...days].map(d=>new Date(d+"T12:00").getTime());
  const sess=S.sess.length;
  const lw=P[P.length-1];
  $("a4").innerHTML=kv(lw?fmt(lw.t):"None yet","Last worked on")+kv(PREV?fmt(PREV):"First visit","Previous tracker visit")+kv(sess,"Working sessions")+kv(ad.filter(t=>wk(t)==w0).length,"Active days this week")+kv(ad.filter(t=>mk(t)==m0).length,"Active days this month")+kv(cnt(t=>dk(t)==dk(now)),"Completed today")+kv(cnt(t=>t>=w0),"Completed this week")+kv(cnt(t=>t>=m0),"Completed this month")+kv(days.size?(cv.length/days.size).toFixed(1):"n/a","Tasks per active day");
  const pre=q.c-cv.length;
  $("a4n").textContent=(lw?"Last action: "+evText(lw)+". ":"")+"A session is a group of recorded actions less than 30 minutes apart. Opening the tracker is not counted as work ("+S.vis.length+" visits recorded). Weeks start on Monday, local time."+(pre>0?" "+pre+" completed tasks predate activity tracking and are excluded from time-based figures.":"");
  const wm=VIEW=="w",bk=wm?wk:mk,comp=E.filter(e=>e.type=="complete"||e.type=="reopen"),B=[];
  if(comp.length){let b=bk(comp[0].t);while(b<=bk(now)){B.push(b);const d=new Date(b);if(wm)d.setDate(d.getDate()+7);else d.setMonth(d.getMonth()+1);b=d.getTime()}}
  const per=B.map(b=>comp.filter(e=>e.type=="complete"&&bk(e.t)==b).length),net=B.map(b=>comp.reduce((s,e)=>bk(e.t)<=b?s+(e.type=="complete"?1:-1):s,0));
  const lab=b=>new Date(b).toLocaleDateString([],wm?{month:"short",day:"numeric"}:{month:"short",year:"2-digit"}),Bs=B.slice(-12);
  $("c2l").textContent="Tasks completed per "+(wm?"week":"month");
  $("c1").innerHTML=line(net.slice(-12),Bs.length?lab(Bs[0]):"",Bs.length?lab(Bs[Bs.length-1]):"");
  $("c2").innerHTML=bars(per.slice(-12),Bs.map(lab));
  const sn=S.snap,fd=t=>new Date(t).toLocaleDateString([],{month:"short",day:"numeric"});
  $("c3").innerHTML=line(sn.map(s=>s.p),fd(sn[0].t),fd(sn[sn.length-1].t),100);
  const ac=D.map((_,i)=>P.filter(e=>e.st==i).length),am=Math.max(...ac,1);
  $("c4").innerHTML=P.length?ac.map((v,i)=>`<div class="hb" style="grid-template-columns:64px 1fr 28px"><span>Stage ${i+1}</span><div class="bar"><i style="width:${v/am*100}%"></i></div><span>${v}</span></div>`).join(""):EM;
  $("a6").innerHTML=MS.map(([nm,ks],m)=>{const d=ks.filter(k=>get(...k.split("-"))==2).length,ok=d==ks.length;
    return `<div class="ms${ok?" ok":""}" title="Requires: ${ks.map(tn).join("; ")}"><span><b>${ok?"Done":"Open"}</b> ${nm}</span><span class="lbl">${ok?(S.ms[m]?fmt(S.ms[m]):"completed before tracking"):d+"/"+ks.length+" required tasks"}</span></div>`}).join("");
  const lastSt=D.map((_,i)=>{const l=P.filter(e=>e.st==i);return l.length?l[l.length-1].t:0}),ins=[];
  const slow=ss.map((r,i)=>[r,i]).filter(([r,i])=>lastSt[i]&&r.n<r.t&&now-lastSt[i]>14*DAY);
  ins.push(slow.length?"No recorded activity for over 14 days while tasks remain: "+slow.map(([r,i])=>`Stage ${i+1} (${Math.floor((now-lastSt[i])/DAY)} days, ${r.t-r.n} tasks left)`).join("; ")+".":"No stage with remaining tasks has a recorded gap longer than 14 days.");
  const rc={};E.forEach(e=>{if(e.type=="reopen")rc[e.k]=(rc[e.k]||0)+1});const rr=Object.entries(rc).filter(([k,v])=>v>=2);
  ins.push(rr.length?"Tasks reopened 2 or more times: "+rr.map(([k,v])=>`${tn(k)} (${v})`).join("; ")+".":"Reopen events recorded: "+Object.values(rc).reduce((x,y)=>x+y,0)+". No task has been reopened more than once.");
  ins.push(`Journal: ${S.j.length} entries, ${S.j.filter(e=>e.f[0]).length} with a problem recorded, ${S.j.filter(e=>e.f[4]).length} with a solution recorded.`);
  ins.push(P.length?`Most recorded actions: Stage ${ac.indexOf(Math.max(...ac))+1} (${Math.max(...ac)} actions).`:"Most frequently worked stage: no recorded actions yet.");
  ins.push(lw?`Days since the last recorded update: ${Math.round((sod(now)-sod(lw.t))/DAY)} (${fmt(lw.t)}).`:"Days since the last recorded update: no updates recorded yet.");
  $("a7").innerHTML=ins.map(s=>`<li>${s}</li>`).join("");
  const H=[...E].reverse(),all=$("evm").dataset.all=="1";
  $("a8").innerHTML=H.length?(all?H:H.slice(0,25)).map(e=>`<div class="ev"><time>${fmt(e.t)}</time><span>${evText(e)}</span></div>`).join(""):`<p class="empty">No activity recorded yet. Events appear when you change a task status or add a journal entry.</p>`;
  $("evm").hidden=H.length<=25;$("evm").textContent=all?"Show recent only":"Show all "+H.length;
}
$("t3").onclick=()=>tab("3");
$("a3").onclick=e=>{if(e.target.id=="go2")$("go").click()};
$("evm").onclick=()=>{$("evm").dataset.all=$("evm").dataset.all=="1"?"0":"1";render()};
function setV(v){VIEW=v;$("vw").setAttribute("aria-pressed",v=="w");$("vm").setAttribute("aria-pressed",v=="m");render()}
$("vw").onclick=()=>setV("w");$("vm").onclick=()=>setV("m");
