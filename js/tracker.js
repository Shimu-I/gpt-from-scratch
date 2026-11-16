/* Tracker tab: stage list, task rows, journal, tabs. */
function buildTracker(){
D.forEach((g,i)=>{
  const d=document.createElement("details");d.className="stage";d.id="s"+i;
  d.innerHTML=`<summary><span class="sn">Stage ${i+1}: ${g.n}</span><span class="sp"></span><div class="sb"><i></i></div></summary>
  <div class="sbody"><p class="sinfo"><b>Why:</b> ${g.w}<br><b>Concepts:</b> ${g.c}</p>
  ${g.t.map((t,j)=>{const [a,b]=t.split("|");return `<div class="task" id="k${i}-${j}">
    <div class="trow"><input type="checkbox" data-k="${i}-${j}" aria-label="Complete: ${a}">
    <button class="ttl" data-o="${i}-${j}">${j+1}. ${a}</button>
    <button class="st" data-c="${i}-${j}" title="Click to change status"></button></div>
    <div class="det" id="d${i}-${j}" hidden>
      <p><b>Done when:</b> ${b}</p>
      <p class="flow">Understand, implement, test, document, complete.</p>
      <input data-r="${i}-${j}" placeholder="Reference: book, chapter, page" aria-label="Reference for ${a}" value="${esc(S.r[i+"-"+j]||"")}">
    </div></div>`}).join("")}</div>`;
  stage.appendChild(d);
});
$("jst").innerHTML=D.map((g,i)=>`<option value="${i}">Stage ${i+1}: ${g.n}</option>`).join("");
}
function render(){ren2();bkStatus();
  const q=stats(),pc=Math.round(q.c/q.t*100);
  $("pct").textContent=pc+"%";$("pbar").style.width=pc+"%";
  $("chips").innerHTML=`<span><b>${q.c}</b> of ${q.t} completed</span><span><b>${q.p}</b> in progress</span><span><b>${q.t-q.c-q.p}</b> not started</span>`;
  const nx=next();
  $("mini").innerHTML=q.per.map((r,i)=>`<div class="${active()==i?"cur":""}" title="Stage ${i+1}: ${r.n}/${r.t}"><i style="height:${r.n/r.t*100}%"></i><span>${i+1}</span></div>`).join("");
  if(nx){{const z=active();$("cur").textContent="Stage "+(z+1)+": "+D[z].n}const [a,b]=D[nx[0]].t[nx[1]].split("|");
    $("nxt").textContent=a;$("nchk").textContent="Done when: "+b;$("go").hidden=false}
  else{$("cur").textContent="All stages complete";$("nxt").textContent="Write up your findings";$("nchk").textContent="";$("go").hidden=true}
  D.forEach((g,i)=>{const r=q.per[i],d=$("s"+i);
    d.querySelector(".sp").textContent=r.n+"/"+r.t+" ("+Math.round(r.n/r.t*100)+"%)";
    d.querySelector(".sb i").style.width=r.n/r.t*100+"%";
    g.t.forEach((_,j)=>{const v=get(i,j),k=$("k"+i+"-"+j);
      k.className="task"+(v==2?" done":"");k.querySelector("input").checked=v==2;
      const b=k.querySelector(".st");b.textContent=NAMES[v];b.className="st "+CLS[v]})});
}
stage.addEventListener("click",e=>{
  const o=e.target.dataset.o,c=e.target.dataset.c;
  if(o){const d=$("d"+o);d.hidden=!d.hidden}
  if(c)setStatus(c,((S.s[c]||0)+1)%3)});
stage.addEventListener("change",e=>{const k=e.target.dataset.k;if(!k)return;setStatus(k,e.target.checked?2:0)});
stage.addEventListener("input",e=>{const r=e.target.dataset.r;if(r){S.r[r]=e.target.value;save()}});
$("go").onclick=()=>{const n=next();if(!n)return;tab("1");$("s"+n[0]).open=true;const d=$("d"+n[0]+"-"+n[1]);d.hidden=false;$("k"+n[0]+"-"+n[1]).scrollIntoView({behavior:"smooth",block:"center"})};
$("exp").onclick=()=>document.querySelectorAll("details.stage").forEach(d=>d.open=true);
$("col").onclick=()=>document.querySelectorAll("details.stage").forEach(d=>d.open=false);
$("rst").onclick=()=>{if(!confirm("Reset all progress, references, and journal entries? This cannot be undone."))return;
  S=blank();init();save();document.querySelectorAll("[data-r]").forEach(i=>i.value="");render();jr();bkStatus()};

function tab(n){["1","2","3"].forEach(k=>{$("p"+k).hidden=k!=n;$("t"+k).setAttribute("aria-selected",k==n)})}
$("t1").onclick=()=>tab("1");$("t2").onclick=()=>tab("2");
const JL=["Problem","What went wrong","Root cause","Concepts learned","Solution","Verification"];
function jr(){const l=$("jlist");
  if(!S.j.length){l.innerHTML='<p class="empty">No entries yet. Record bugs and lessons as you hit them.</p>';return}
  l.innerHTML=S.j.map((e,k)=>`<div class="entry"><b>Stage ${+e.st+1}: ${D[e.st].n}</b> <span class="lbl">${esc(e.d)}</span>
  <button data-x="${k}" style="float:right">Delete</button><dl>${e.f.map((v,i)=>v?`<dt>${JL[i]}</dt><dd>${esc(v)}</dd>`:"").join("")}</dl></div>`).join("")}
$("jadd").onclick=()=>{const f=[0,1,2,3,4,5].map(i=>$("j"+i).value.trim());
  if(!f.some(Boolean)){alert("Fill in at least one field.");return}
  S.j.unshift({st:$("jst").value,d:new Date().toLocaleDateString(),f,t:Date.now()});log("journal",null,{st:+$("jst").value});save();render();
  [0,1,2,3,4,5].forEach(i=>$("j"+i).value="");jr()};
$("jlist").addEventListener("click",e=>{const x=e.target.dataset.x;if(x===undefined)return;
  if(confirm("Delete this entry?")){S.j.splice(+x,1);save();jr()}});
