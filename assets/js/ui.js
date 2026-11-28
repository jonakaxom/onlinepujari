// Shared dashboard UI kit: app shell, router, toast, modal, skeleton, helpers. No user text is ever inserted as HTML.
import {db,F,el,$,configured,showSetup,logout,onUser,waLink,digits,sendVerify,usesPassword,auth} from "./auth.js";
export {el,$,db,F,waLink,digits};

/* ---------- icons (static markup only) ---------- */
const P={mail:"M3 6h18v12H3z M3 7l9 7 9-7",help:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.5 9.2a2.6 2.6 0 1 1 3.6 2.4c-.8.4-1.1.9-1.1 1.8 M12 17h.01",copy:"M9 9h11v11H9z M5 15V5h10",share:"M4 12v7h16v-7 M12 3v12 M7 8l5-5 5 5",home:"M3 11l9-8 9 8 M5 10v10h14V10 M10 20v-6h4v6",plus:"M12 5v14 M5 12h14",list:"M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",heart:"M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",user:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.6-7 8-7s8 3 8 7",users:"M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c0-3.300 2.700-6 6-6s6 2.700 6 6 M17 11a2.500 2.500 0 1 0 0-5 M21 19c0-2.500-1.500-4.500-4-5",cal:"M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4",star:"M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z",check:"M5 13l4 4L19 7",x:"M6 6l12 12 M18 6L6 18",shield:"M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z M9 12l2 2 4-4",inbox:"M3 13l3-8h12l3 8 M3 13v6h18v-6 M3 13h5l1 3h6l1-3h5",out:"M9 4H5v16h4 M16 8l4 4-4 4 M20 12H9",clock:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",chart:"M4 20V10 M10 20V4 M16 20v-8 M22 20H2",log:"M6 3h9l4 4v14H6z M14 3v5h5 M9 13h6 M9 17h6",download:"M12 4v12 M7 11l5 5 5-5 M4 20h16",edit:"M4 20h4L19 9l-4-4L4 16z",search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5",wa:"M3 21l1.600-4.600A8.500 8.500 0 1 1 8 19.600z M9 9.500c0 3 2.500 5.500 5.500 5.500l1-1.500-2-1-1 .8a4 4 0 0 1-1.800-1.800l.8-1-1-2z",pin:"M12 21s7-6.200 7-11a7 7 0 1 0-14 0c0 4.800 7 11 7 11z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",lock:"M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3",chev:"M9 6l6 6-6 6",back:"M15 6l-6 6 6 6",bell:"M6 17V11a6 6 0 0 1 12 0v6l2 2H4z M10 21h4",globe:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",home2:"M4 20V9l8-5 8 5v11z"};
export function ic(n,s=20){const t=document.createElement("template");t.innerHTML=`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]||P.home}"/></svg>`;return t.content.firstChild}
export const DIYA=()=>{const t=document.createElement("template");t.innerHTML='<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><g class="flame-a"><path d="M16 1c3.200 4.200 4.400 6.400 4.400 9a4.400 4.400 0 0 1-8.800 0C11.600 7.400 12.800 5.200 16 1z" fill="#ffb703"/><path d="M16 6c1.500 2 2.200 3.200 2.200 4.400a2.200 2.200 0 0 1-4.400 0c0-1.200.7-2.400 2.200-4.400z" fill="#d9480f"/></g><path d="M2 17h28c0 6.500-6 12-14 12S2 23.500 2 17z" fill="#ffb703"/><path d="M2 17h28" stroke="#d9480f" stroke-width="1.600"/></svg>';return t.content.firstChild};

/* ---------- formatting ---------- */
export const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
export const todayStr=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
export const fdate=s=>{const d=new Date(s+"T00:00:00");return isNaN(d)?String(s):d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})};
export const ftime=t=>{const [h,m]=String(t).split(":").map(Number);if(isNaN(h))return t;return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`};
export const tsMs=t=>t&&t.toMillis?t.toMillis():0;
export const daysUntil=s=>Math.round((new Date(s+"T00:00:00")-new Date(todayStr()+"T00:00:00"))/864e5);
export const rel=s=>{const d=daysUntil(s);return d===0?"Today":d===1?"Tomorrow":d>1?`In ${d} days`:d===-1?"Yesterday":`${-d} days ago`};
export const initials=n=>String(n||"?").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
export const STATUS={pending:["Awaiting pandit","pending"],accepted:["Confirmed","accepted"],completed:["Completed","completed"],declined:["Declined","declined"],cancelled:["Cancelled","cancelled"]};
export const pill=s=>el("span",{class:"pill p-"+s},STATUS[s]?.[0]||s);
export const LANGS=["Hindi","Tamil","Telugu","Kannada","Marathi","Bengali","Gujarati","Malayalam","Assamese","English","Sanskrit"];
export async function pujas(){try{return (await (await fetch(new URL("../data/pujas.json",import.meta.url))).json()).map(a=>({slug:a[0],name:a[1],hi:a[2],short:a[3],price:a[4],dur:a[5]}))}catch(e){return[]}}
export async function ratings(){const m={};try{const q=await F.getDocs(F.query(F.collection(db,"reviews"),F.limit(500)));q.docs.forEach(d=>{const r=d.data();(m[r.panditId]||={sum:0,n:0,list:[]});m[r.panditId].sum+=r.rating;m[r.panditId].n++;m[r.panditId].list.push({id:d.id,...r})})}catch(e){}return m}
export const avg=(m,id)=>m[id]?.n?m[id].sum/m[id].n:0;
export function stars(v,n=0){const w=el("span",{class:"stars","aria-label":v?`${v.toFixed(1)} out of 5`:"No ratings yet",role:"img"});for(let i=1;i<=5;i++){const s=ic("star",15);s.classList.toggle("on",v>=i-.25);w.append(s)}if(v)w.append(el("b",{},v.toFixed(1)),el("small",{}," ("+n+")"));else w.append(el("small",{}," New"));return w}

/* ---------- toast / modal / confirm / skeleton / empty ---------- */
export function toast(msg,kind="ok"){let c=$("#toasts");if(!c){c=el("div",{id:"toasts","aria-live":"polite"});document.body.append(c)}const t=el("div",{class:"toast t-"+kind,role:kind==="err"?"alert":"status"},msg);c.append(t);setTimeout(()=>t.classList.add("out"),3800);setTimeout(()=>t.remove(),4300)}
export function modal({title,body,actions=[],wide=false}){return new Promise(res=>{const d=el("dialog",{class:"modal"+(wide?" wide":"")});const close=v=>{d.close();d.remove();res(v)};
  d.append(el("div",{class:"m-h"},el("h3",{},title),el("button",{class:"icon-btn",type:"button","aria-label":"Close",onclick:()=>close(null)},ic("x"))),el("div",{class:"m-b"},body),
    el("div",{class:"m-f"},actions.map(a=>el("button",{class:"btn "+(a.kind||""),type:"button",onclick:async()=>{if(a.run){const r=await a.run();if(r===false)return;close(r===undefined?a.value:r)}else close(a.value)}},a.label))));
  d.addEventListener("cancel",e=>{e.preventDefault();close(null)});document.body.append(d);d.showModal()})}
export const confirmBox=(msg,ok="Confirm",kind="")=>modal({title:"Please confirm",body:el("p",{},msg),actions:[{label:"Go back",kind:"ghost",value:false},{label:ok,kind,value:true}]}).then(v=>!!v);
export const skel=(n=3)=>el("div",{class:"skel-wrap","aria-busy":"true"},Array.from({length:n},()=>el("div",{class:"skel"})));
export function empty({title,text,action}){return el("div",{class:"empty"},el("div",{class:"empty-art","aria-hidden":"true"},DIYA()),el("h3",{},title),el("p",{},text),action||null)}
export const stat=(icon,label,value,hint)=>el("div",{class:"stat"},el("span",{class:"stat-i"},ic(icon)),el("div",{},el("b",{},value),el("span",{},label),hint?el("small",{},hint):null));
export const field=(label,input,hint,id)=>{const i=id||"f"+Math.random().toString(36).slice(2,8);input.id=i;return el("div",{class:"fld"},el("label",{for:i},label),input,hint?el("small",{class:"hint"},hint):null,el("small",{class:"ferr",role:"alert"}))};
export const setErr=(inp,msg)=>{const f=inp.closest(".fld");if(!f)return;f.classList.toggle("bad",!!msg);f.querySelector(".ferr").textContent=msg||"";inp.setAttribute("aria-invalid",msg?"true":"false")};
export function chips(items,selected=[],{single=false,name="c"}={}){const w=el("div",{class:"chipset",role:single?"radiogroup":"group"});items.forEach(v=>{const id=name+Math.random().toString(36).slice(2,7);const i=el("input",{type:single?"radio":"checkbox",name:single?name:null,value:v,id,checked:selected.includes(v)});w.append(el("span",{class:"chip-i"},i,el("label",{for:id},v)))});w.value=()=>[...w.querySelectorAll("input:checked")].map(i=>i.value);return w}
export function download(name,text,type="text/plain"){const a=el("a",{href:URL.createObjectURL(new Blob([text],{type})),download:name});document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
export const csvCell=v=>{let s=String(v??"");if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
export function ics(b){const d=b.date.replace(/-/g,""),t=b.time.replace(":","")+"00";const e=s=>String(s).replace(/[\;,]/g,m=>"\\"+m).replace(/\n/g," ");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Online Pujari//EN","BEGIN:VEVENT",`UID:${(b.id||Date.now())}@onlinepujari`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,`DTSTART:${d}T${t}`,`DURATION:PT3H`,`SUMMARY:${e(b.puja)}`,`LOCATION:${e(b.mode==="online"?"Online":b.address+", "+b.city)}`,`DESCRIPTION:${e("Pandit: "+(b.panditName||"to be assigned")+". Booked via Online Pujari")}`,"END:VEVENT","END:VCALENDAR"].join("\r\n")}

/* ---------- session + idle sign-out ---------- */
export function boot(role){return new Promise(res=>{if(!configured){showSetup();return}
  onUser(async user=>{if(!user){location.href="login.html";return}
    const [snap,isAdmin]=await Promise.all([F.getDoc(F.doc(db,"users",user.uid)),F.getDoc(F.doc(db,"admins",user.uid)).then(d=>d.exists(),()=>false)]);if(!snap.exists()){location.href="login.html";return}
    const profile=snap.data();
    const home=isAdmin?"admin.html":profile.role==="pandit"?"pandit.html":"dashboard.html";
    const ok=role==="admin"?isAdmin:role==="pandit"?(!isAdmin&&profile.role==="pandit"):(!isAdmin&&profile.role==="customer");
    if(!ok){location.href=home;return}
    let t;const reset=()=>{clearTimeout(t);t=setTimeout(()=>{toast("Signed out after 30 minutes of inactivity.","err");setTimeout(logout,1500)},30*60*1e3)};
    ["click","keydown","touchstart","scroll"].forEach(e=>addEventListener(e,reset,{passive:true}));reset();
    res({user,profile,isAdmin})})})}

/* ---------- app shell + hash router ---------- */
export function shell({title,nav,session,routes,start}){
  const app=$("#app");const main=el("main",{class:"main",id:"main",tabindex:"-1"});
  const side=el("aside",{class:"side"},el("a",{class:"brand",href:"../index.html"},DIYA(),el("span",{},"Online",el("b",{},"Pujari"))),
    el("small",{class:"role"},title),el("nav",{"aria-label":"Dashboard"},nav.map(n=>el("a",{href:"#/"+n.id,"data-r":n.id},ic(n.icon),el("span",{},n.label),n.badge?el("i",{class:"dot","data-badge":n.id},""):null))),
    el("div",{class:"me"},el("span",{class:"av","aria-hidden":"true"},initials(session.profile.name)),el("div",{},el("b",{},session.profile.name),el("small",{},session.profile.email)),
      el("button",{class:"icon-btn",type:"button","aria-label":"Log out",title:"Log out",onclick:logout},ic("out"))));
  const bottom=el("nav",{class:"bottom","aria-label":"Dashboard"},nav.slice(0,5).map(n=>el("a",{href:"#/"+n.id,"data-r":n.id},ic(n.icon,22),el("span",{},n.short||n.label))));
  const top=el("header",{class:"mtop"},el("a",{class:"brand",href:"../index.html"},DIYA(),el("span",{},"Online",el("b",{},"Pujari"))),el("button",{class:"icon-btn",type:"button","aria-label":"Log out",onclick:logout},ic("out")));
  const vb=(()=>{const u=session.user;if(!u||u.emailVerified||!usesPassword(u))return null;const b=el("div",{class:"vbar",role:"status"},ic("mail",18),el("span",{},"Please verify your email ("+u.email+"). Check your inbox for the link."));
    const r=el("button",{type:"button",class:"linkb",onclick:async()=>{r.disabled=true;try{await sendVerify(u);toast("Verification email sent")}catch(e){toast("Please wait a minute before asking again.","err")}setTimeout(()=>r.disabled=false,30000)}},"Resend email");b.append(r);return b})();
  app.replaceChildren(el("a",{class:"skip",href:"#main"},"Skip to content"),el("div",{class:"shell"},side,el("div",{class:"col"},top,vb,main),bottom));
  const ctx={main,go:r=>{location.hash="#/"+r},render:()=>route()};
  async function route(){const h=(location.hash||"#/"+start).slice(2);const [name,qs]=h.split("?");const r=routes[name]?name:start;const q=Object.fromEntries(new URLSearchParams(qs||""));
    document.querySelectorAll("[data-r]").forEach(a=>a.classList.toggle("on",a.dataset.r===r));
    main.replaceChildren(skel(4));try{const v=await routes[r](ctx,q);main.replaceChildren(...[v].flat(Infinity).filter(Boolean))}catch(e){console.error(e);main.replaceChildren(empty({title:"Something went wrong",text:"Please refresh the page. If it keeps happening, contact support."}))}
    document.title=(nav.find(n=>n.id===r)?.label||"Dashboard")+" | Online Pujari";scrollTo(0,0)}
  addEventListener("hashchange",route);route();return ctx}
export const pageHead=(t,sub,...actions)=>el("div",{class:"ph"},el("div",{},el("h1",{},t),sub?el("p",{},sub):null),el("div",{class:"ph-a"},actions));
export const setBadge=(id,n)=>{const d=document.querySelector(`[data-badge="${id}"]`);if(d){d.textContent=n||"";d.style.display=n?"inline-flex":"none"}};

/* ---------- shared helpers for dashboards ---------- */
export const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"};
export const mapsLink=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
export async function copyText(t){try{await navigator.clipboard.writeText(t);toast("Copied");return true}catch(e){toast("Could not copy. Select the text and copy it manually.","err");return false}}
/* "in 3 days, 4 hours" style countdown to a booking */
export function countdown(date,time){const at=new Date(date+"T"+(time||"09:00")+":00");const ms=at-Date.now();if(isNaN(ms))return"";if(ms<0)return"Happening now or today";
  const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);return d>0?`${d} day${d>1?"s":""}, ${h} hr`:h>0?`${h} hr ${m} min`:`${m} min`}
export async function festivals(){try{return (await (await fetch(new URL("../data/festivals.json",import.meta.url))).json()).map(a=>({name:a[0],date:a[1],note:a[2]})).filter(f=>f.date>=todayStr()).sort((a,b)=>a.date.localeCompare(b.date))}catch(e){return[]}}
export const dayName=s=>new Date(s+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short"});
export const SUPPORT={wa:"919999999999",phone:"+91 99999 99999",email:"care@onlinepujari.in"}; /* same placeholders as the website footer: replace with your real numbers */
/* "Pt. Ramesh Mishra" -> "Pt. Ramesh"; "Anita Sharma" -> "Anita" */
export const firstName=n=>{const p=String(n||"").trim().split(/\s+/);return /^(pt|pandit|shri|sri|dr|mr|mrs|ms)\.?$/i.test(p[0])&&p[1]?p[0]+" "+p[1]:p[0]||""};
