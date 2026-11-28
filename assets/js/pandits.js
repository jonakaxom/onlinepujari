/* Public pandit directory (home preview + /pages/pandits.html).
   Reads APPROVED pandit profiles straight from Firestore over its REST API (no SDK, no login):
   firestore.rules lets anyone read a profile only when approved == true.
   All text is inserted with textContent; photos only if they are https links. */
import {firebaseConfig as C} from "./firebase-config.js";
const root=document.querySelector("[data-pd]");
if(root){
const MODE=root.dataset.pd;                       // "home" or "full"
const qs=new URLSearchParams(location.search);
const DEMO=qs.has("demo");
const READY=C&&C.projectId&&!/PASTE/i.test(C.projectId);
const $=(s,r=document)=>r.querySelector(s);
const link=k=>($(`.pd-ln[data-k="${k}"]`)||{}).getAttribute?.("href")||"#";
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const[n,v]of Object.entries(a)){if(v===false||v==null)continue;if(n==="class")e.className=v;else if(n.startsWith("on"))e.addEventListener(n.slice(2),v);else e.setAttribute(n,v===true?"":v)}k.flat().forEach(c=>c!=null&&e.append(c.nodeType?c:document.createTextNode(c)));return e};
const svg=(d,s=18)=>{const x=document.createElementNS("http://www.w3.org/2000/svg","svg");x.setAttribute("viewBox","0 0 24 24");x.setAttribute("width",s);x.setAttribute("height",s);x.setAttribute("fill","none");x.setAttribute("stroke","currentColor");x.setAttribute("stroke-width","2");x.setAttribute("stroke-linecap","round");x.setAttribute("stroke-linejoin","round");x.setAttribute("aria-hidden","true");const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",d);x.append(p);return x};
const ICO={filter:"M3 5h18l-7 8v6l-4 2v-8z",sort:"M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3",search:"M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM21 21l-4.3-4.3",pin:"M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",x:"M6 6l12 12M18 6L6 18",star:"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"};

/* ---------- data ---------- */
const val=v=>v==null?null:"stringValue"in v?v.stringValue:"integerValue"in v?Number(v.integerValue):"doubleValue"in v?v.doubleValue:"booleanValue"in v?v.booleanValue:"arrayValue"in v?(v.arrayValue.values||[]).map(val):"mapValue"in v?Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,val(x)])):null;
const fromDoc=d=>{const o={};for(const[k,v]of Object.entries(d.fields||{}))o[k]=val(v);o.id=d.name.split("/").pop();return o};
const clean=p=>({id:String(p.id),name:String(p.name||"Pandit").slice(0,80),city:String(p.city||"").slice(0,60),exp:Math.max(0,Number(p.experience)||0),langs:(Array.isArray(p.languages)?p.languages:[]).map(String),svcs:(Array.isArray(p.services)?p.services:[]).map(String),price:String(p.price||"").slice(0,80),photo:/^https:\/\/\S+$/.test(p.photoUrl||"")?p.photoUrl:"",rating:Number(p.rating)>0?Number(p.rating):0,rc:Number(p.reviewCount)||0,off:Array.isArray(p.unavailable)?p.unavailable.map(String):[]});
const DEMO_DATA=[["Pt. Anand Sharma","Guwahati",15,["Hindi","Assamese"],["Griha Pravesh Puja","Satyanarayan Puja","Rudrabhishek Puja"],"Griha Pravesh from ₹5,100",5,128],["Acharya Devendra Pandey","Lucknow",22,["Hindi","Sanskrit"],["Rudrabhishek Puja","Kaal Sarp Dosh Puja","Vastu Shanti Puja"],"Rudrabhishek from ₹4,100",4.9,212],["Vadhyar Karthik Iyer","Chennai",13,["Tamil","Telugu"],["Griha Pravesh Puja","Ganesh Puja","Lakshmi Puja"],"Griha Pravesh from ₹5,100",4.8,96],["Purohit Subrata Banerjee","Kolkata",18,["Bengali","Hindi"],["Lakshmi Puja","Satyanarayan Puja","Shradh and Pitru Puja"],"Satyanarayan from ₹3,100",4.95,154],["Guruji Prakash Patil","Pune",9,["Marathi","Hindi"],["Ganesh Puja","Griha Pravesh Puja","Vastu Shanti Puja"],"Ganesh Puja from ₹2,100",4.7,61],["Pt. Mohan Das","Bhubaneswar",20,["Hindi","Odia"],["Bhoomi Puja","Vastu Shanti Puja","Annaprasan Puja"],"",4.85,88],["Purohit Ravi Teja","Hyderabad",6,["Telugu","Hindi"],["Satyanarayan Puja","Annaprasan Puja"],"Satyanarayan from ₹3,100",0,0],["Pt. Suresh Joshi","Delhi",25,["Hindi","English"],["Maha Mrityunjaya Homam","Rudrabhishek Puja","Kaal Sarp Dosh Puja"],"Homam from ₹7,100",5,301],["Purohit Hari Nair","Kochi",11,["Malayalam","Tamil"],["Griha Pravesh Puja","Office Opening Puja"],"",4.6,42]].map((d,i)=>clean({id:"demo-"+i,name:d[0],city:d[1],experience:d[2],languages:d[3],services:d[4],price:d[5],rating:d[6],reviewCount:d[7],unavailable:i%4===3?[todayStr()]:[]}));
function todayStr(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
async function load(){
  if(DEMO)return DEMO_DATA;
  if(!READY)return null;
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),9000);
  try{const r=await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(C.projectId)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(C.apiKey)}`,{method:"POST",headers:{"Content-Type":"application/json"},signal:ctl.signal,
      body:JSON.stringify({structuredQuery:{from:[{collectionId:"pandits"}],where:{fieldFilter:{field:{fieldPath:"approved"},op:"EQUAL",value:{booleanValue:true}}},limit:100}})});
    if(!r.ok){let m="";try{m=(await r.json()).error.message}catch(_){}throw new Error("Firestore HTTP "+r.status+(m?": "+m:""))}
    return (await r.json()).filter(x=>x.document).map(x=>clean(fromDoc(x.document)))}
  catch(e){console.error("[pandits] could not load directory:",e);throw e}
  finally{clearTimeout(t)}}

/* ---------- card ---------- */
const HON=/^(pt|pandit|shri|sri|dr|acharya|guruji|vadhyar|purohit|poojari|pujari|mr|mrs|ms)\.?$/i;
const initials=n=>{const w=n.split(/\s+/).filter(x=>x&&!HON.test(x));return ((w[0]||n)[0]+((w[1]||"")[0]||"")).toUpperCase()};
const hue=n=>[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%6;
const money=s=>s;
function avatar(p){const w=h("div",{class:"pd-av c"+hue(p.name)});
  const ini=()=>{w.replaceChildren(h("span",{"aria-hidden":"true"},initials(p.name)),h("i",{class:"dot "+(p.off.includes(todayStr())?"off":"on"),title:p.off.includes(todayStr())?"Not available today":"Available today"}))};
  if(p.photo){const im=h("img",{src:p.photo,alt:"",width:96,height:96,loading:"lazy",decoding:"async",referrerpolicy:"no-referrer"});im.addEventListener("error",ini);w.append(im,h("i",{class:"dot "+(p.off.includes(todayStr())?"off":"on"),title:p.off.includes(todayStr())?"Not available today":"Available today"}))}else ini();return w}
function card(p){
  const t=p.svcs.slice(0,2).map(s=>s.replace(/ Puja$/,"")),more=p.svcs.length-2;
  const go=e=>{if(DEMO){e.preventDefault();return}try{sessionStorage.setItem("op-book-pandit",p.id)}catch(_){}};
  return h("article",{class:"pd"},
    h("div",{class:"pd-l"},avatar(p),p.rating?h("span",{class:"pd-r"},svg(ICO.star,12),fmt(p.rating)):h("span",{class:"pd-r new"},"New")),
    h("div",{class:"pd-b"},
      h("h3",{},p.name),
      h("p",{class:"pd-x"},p.exp?`Exp. ${p.exp} year${p.exp>1?"s":""}`:"Newly joined",p.rc?h("small",{}," · "+p.rc+" review"+(p.rc>1?"s":"")):null),
      h("p",{class:"pd-lg"},p.langs.slice(0,4).join(", ")),
      h("p",{class:"pd-tg"},t.map(s=>h("span",{},s)),more>0?h("span",{class:"m"},"+"+more):null),
      h("p",{class:"pd-ct"},svg(ICO.pin,14),p.city||"Online"),
      h("div",{class:"pd-f"},h("span",{class:"pd-pr"},p.price||"Price on request"),h("a",{class:"pd-btn",href:DEMO?link("book"):link("acct")+"#/book?pandit="+encodeURIComponent(p.id),onclick:go,"aria-label":"Book "+p.name},"Book"))));
}
const skel=n=>Array.from({length:n},()=>h("article",{class:"pd skel","aria-hidden":"true"},h("div",{class:"pd-l"},h("div",{class:"pd-av"})),h("div",{class:"pd-b"},h("h3",{}," "),h("p",{}," "),h("p",{}," "))));
const fmt=r=>r%1===0?r.toFixed(1):String(+r.toFixed(2));
const rec=p=>(p.rating||0)*20+Math.min(p.exp,30)+p.rc*.5;
const SORTS={rec:["Recommended",(a,b)=>rec(b)-rec(a)||a.name.localeCompare(b.name)],exp:["Experience: high to low",(a,b)=>b.exp-a.exp||a.name.localeCompare(b.name)],rating:["Rating: high to low",(a,b)=>b.rating-a.rating||b.rc-a.rc||a.name.localeCompare(b.name)],name:["Name: A to Z",(a,b)=>a.name.localeCompare(b.name)]};
const grid=$("#pd-grid");
const note=()=>DEMO&&h("p",{class:"pd-demo",role:"note"},"Sample profiles for layout preview only. Real pandits appear here as soon as you approve them.");

/* ---------- home preview ---------- */
async function home(){
  grid.replaceChildren(...skel(6));root.hidden=false;
  let d;try{d=await load()}catch(e){root.hidden=true;return}
  if(!d||!d.length){root.hidden=true;return}
  grid.replaceChildren(...d.sort(SORTS.rec[1]).slice(0,6).map(card));
  const n=note();n&&grid.after(n);
  const cnt=$("#pd-total");if(cnt)cnt.textContent=d.length>6?`Showing 6 of ${d.length} pandits`:`${d.length} pandit${d.length>1?"s":""} on Online Pujari`;
}

/* ---------- full directory ---------- */
async function full(){
  const S={q:qs.get("q")||"",city:qs.get("city")||"",langs:new Set((qs.get("lang")||"").split(",").filter(Boolean)),puja:qs.get("puja")||"",exp:Number(qs.get("exp"))||0,rating:Number(qs.get("rating"))||0,today:qs.get("today")==="1",sort:SORTS[qs.get("sort")]?qs.get("sort"):"rec",shown:12};
  const tools=$("#pd-tools"),chips=$("#pd-chips"),count=$("#pd-count"),more=$("#pd-more"),state=$("#pd-state");
  grid.replaceChildren(...skel(6));
  let all;try{all=await load()}catch(e){return fail()}
  if(all===null||!all.length){grid.replaceChildren();tools.hidden=true;state.replaceChildren(h("div",{class:"pd-empty"},h("h2",{},"Pandit profiles are coming soon"),h("p",{},"We review every pandit before listing. In the meantime, tell us your puja and city and we will match one for you."),h("p",{},h("a",{class:"btn",href:link("book")},"Book a pandit")," ",h("a",{class:"btn alt",href:link("join")},"Join as a pandit"))));return}
  const uniq=f=>[...new Set(all.flatMap(f))].filter(Boolean).sort((a,b)=>a.localeCompare(b));
  const cities=uniq(p=>[p.city]),langs=uniq(p=>p.langs),pujas=uniq(p=>p.svcs),hasRating=all.some(p=>p.rating>0);
  /* toolbar */
  const input=h("input",{type:"search",placeholder:"Search name, city or puja..","aria-label":"Search pandits by name, city or puja",value:S.q,autocomplete:"off",maxlength:60});
  const sel=h("select",{"aria-label":"Sort pandits"},Object.entries(SORTS).filter(([k])=>k!=="rating"||hasRating).map(([k,[l]])=>h("option",{value:k,selected:k===S.sort},l)));
  const fcount=h("b",{class:"cnt",hidden:true});
  const fbtn=h("button",{type:"button",class:"pd-tb","aria-haspopup":"dialog"},svg(ICO.filter),"Filter",fcount);
  tools.replaceChildren(fbtn,h("label",{class:"pd-tb pd-sb"},svg(ICO.sort),"Sort",sel),h("div",{class:"pd-sr"},input,svg(ICO.search)));
  /* filter dialog */
  const dlg=h("dialog",{class:"pd-dlg","aria-labelledby":"pd-dt"});
  const city=h("select",{id:"pf-city"},h("option",{value:""},"All cities"),cities.map(c=>h("option",{value:c},c)));
  const puja=h("select",{id:"pf-puja"},h("option",{value:""},"Any puja"),pujas.map(c=>h("option",{value:c},c)));
  const exp=h("select",{id:"pf-exp"},[[0,"Any experience"],[5,"5+ years"],[10,"10+ years"],[15,"15+ years"],[20,"20+ years"]].map(([v,l])=>h("option",{value:v},l)));
  const rate=h("select",{id:"pf-rate"},[[0,"Any rating"],[4,"4.0 and above"],[4.5,"4.5 and above"],[4.8,"4.8 and above"]].map(([v,l])=>h("option",{value:v},l)));
  const today=h("input",{type:"checkbox",id:"pf-today"});
  const lbox=h("div",{class:"pd-lc",role:"group","aria-label":"Languages"},langs.map(l=>{const c=h("input",{type:"checkbox",value:l,id:"pl-"+l});c.checked=S.langs.has(l);c.addEventListener("change",()=>{c.checked?S.langs.add(l):S.langs.delete(l);run()});return h("label",{class:"pd-chip",for:"pl-"+l},c,h("span",{},l))}));
  const apply=h("button",{type:"button",class:"btn",onclick:()=>dlg.close()},"Show results");
  const clear=()=>{S.q="";S.city="";S.langs.clear();S.puja="";S.exp=0;S.rating=0;S.today=false;sync();run()};
  const row=(l,c,id)=>h("div",{class:"pd-fr"},h("label",{for:id},l),c);
  dlg.append(h("form",{method:"dialog",onsubmit:e=>e.preventDefault()},h("div",{class:"pd-dh"},h("h2",{id:"pd-dt"},"Filter pandits"),h("button",{type:"button",class:"pd-x2","aria-label":"Close filters",onclick:()=>dlg.close()},svg(ICO.x,20))),
    h("div",{class:"pd-db"},row("City",city,"pf-city"),h("div",{class:"pd-fr"},h("span",{class:"lbl"},"Languages"),lbox),row("Puja",puja,"pf-puja"),row("Experience",exp,"pf-exp"),hasRating?row("Rating",rate,"pf-rate"):null,h("label",{class:"pd-ck",for:"pf-today"},today,h("span",{},"Available today"))),
    h("div",{class:"pd-df"},h("button",{type:"button",class:"btn ghost",onclick:clear},"Clear all"),apply)));
  document.body.append(dlg);
  dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
  fbtn.addEventListener("click",()=>dlg.showModal());
  const sync=()=>{input.value=S.q;sel.value=S.sort;city.value=S.city;puja.value=S.puja;exp.value=String(S.exp);rate.value=String(S.rating);today.checked=S.today;lbox.querySelectorAll("input").forEach(c=>c.checked=S.langs.has(c.value))};
  city.onchange=()=>{S.city=city.value;run()};puja.onchange=()=>{S.puja=puja.value;run()};exp.onchange=()=>{S.exp=Number(exp.value);run()};rate.onchange=()=>{S.rating=Number(rate.value);run()};today.onchange=()=>{S.today=today.checked;run()};
  sel.onchange=()=>{S.sort=sel.value;run()};
  let tm;input.addEventListener("input",()=>{clearTimeout(tm);tm=setTimeout(()=>{S.q=input.value.trim();run()},140)});
  more.addEventListener("click",()=>{S.shown+=12;paint()});
  const match=p=>{const q=S.q.toLowerCase();return(!q||(p.name+" "+p.city+" "+p.svcs.join(" ")+" "+p.langs.join(" ")).toLowerCase().includes(q))&&(!S.city||p.city===S.city)&&(!S.langs.size||[...S.langs].every(l=>p.langs.includes(l)))&&(!S.puja||p.svcs.includes(S.puja))&&p.exp>=S.exp&&p.rating>=S.rating&&(!S.today||!p.off.includes(todayStr()))};
  let list=[];
  function run(){S.shown=12;list=all.filter(match).sort(SORTS[S.sort][1]);paint();url()}
  function paint(){
    grid.replaceChildren(...list.slice(0,S.shown).map(card));
    more.hidden=list.length<=S.shown;more.textContent=`Show more pandits (${list.length-S.shown} left)`;
    count.textContent=`${list.length} pandit${list.length===1?"":"s"}${list.length!==all.length?" match your filters":""}`;
    apply.textContent=`Show ${list.length} result${list.length===1?"":"s"}`;
    const act=[];if(S.city)act.push(["City: "+S.city,()=>{S.city=""}]);S.langs.forEach(l=>act.push([l,()=>S.langs.delete(l)]));if(S.puja)act.push([S.puja,()=>{S.puja=""}]);if(S.exp)act.push([S.exp+"+ years",()=>{S.exp=0}]);if(S.rating)act.push([S.rating+"+ rating",()=>{S.rating=0}]);if(S.today)act.push(["Available today",()=>{S.today=false}]);
    fcount.hidden=!act.length;fcount.textContent=act.length;
    chips.replaceChildren(...act.map(([l,f])=>h("button",{type:"button",class:"pd-ac","aria-label":"Remove filter "+l,onclick:()=>{f();sync();run()}},l,svg(ICO.x,14))),...(act.length?[h("button",{type:"button",class:"linkb",onclick:clear},"Clear all")]:[]));
    state.replaceChildren(...(list.length?[]:[h("div",{class:"pd-empty"},h("h2",{},"No pandits match these filters"),h("p",{},"Try removing a filter or searching a nearby city."),h("button",{class:"btn",type:"button",onclick:clear},"Clear all filters"))]));
  }
  function url(){const p=new URLSearchParams();if(S.q)p.set("q",S.q);if(S.city)p.set("city",S.city);if(S.langs.size)p.set("lang",[...S.langs].join(","));if(S.puja)p.set("puja",S.puja);if(S.exp)p.set("exp",S.exp);if(S.rating)p.set("rating",S.rating);if(S.today)p.set("today","1");if(S.sort!=="rec")p.set("sort",S.sort);if(DEMO)p.set("demo","1");history.replaceState(null,"",location.pathname+(p.size?"?"+p:""))}
  sync();run();
  const n=note();n&&$("#pd-top").after(n);
  function fail(){grid.replaceChildren();tools.hidden=true;state.replaceChildren(h("div",{class:"pd-empty"},h("h2",{},"We could not load pandits"),h("p",{},"Please check your connection and try again."),h("button",{class:"btn",type:"button",onclick:()=>location.reload()},"Try again")))}
}
(MODE==="home"?home:full)();
}
