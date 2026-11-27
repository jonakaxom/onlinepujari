// Public pandit directory. Reads ONLY approved pandit profiles (Firestore rules allow it) over the REST API.
import {firebaseConfig as C} from "./firebase-config.js";
const root=document.querySelector("[data-pandits]");
if(root){
const limit=Number(root.dataset.limit)||0, full=root.hasAttribute("data-full");
const h=(t,p={},...k)=>{const n=document.createElement(t);for(const a in p){if(a==="class")n.className=p[a];else if(a.startsWith("on"))n.addEventListener(a.slice(2),p[a]);else if(p[a]!==false&&p[a]!=null)n.setAttribute(a,p[a])}for(const c of k.flat(9))if(c!=null&&c!==false)n.append(c.nodeType?c:document.createTextNode(c));return n};
const v=f=>f?("stringValue" in f?f.stringValue:"integerValue" in f?Number(f.integerValue):"doubleValue" in f?Number(f.doubleValue):"booleanValue" in f?f.booleanValue:"timestampValue" in f?Date.parse(f.timestampValue):"arrayValue" in f?(f.arrayValue.values||[]).map(v):null):null;
const msg=(t,x)=>root.replaceChildren(h("p",{class:"pnd-msg"},t,x||""));
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
const ini=n=>n.replace(/^(pt\.?|pandit(ji)?|shri|dr\.?)\s+/i,"").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
let all=[],q="",fl={lang:"",svc:"",city:"",exp:0},sort="exp";
async function load(){
  if(!C.apiKey||C.apiKey.startsWith("PASTE"))return [];
  const r=await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(C.projectId)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(C.apiKey)}`,{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({structuredQuery:{from:[{collectionId:"pandits"}],where:{fieldFilter:{field:{fieldPath:"approved"},op:"EQUAL",value:{booleanValue:true}}},limit:200}})});
  if(!r.ok)throw new Error("http "+r.status);
  return (await r.json()).filter(x=>x.document).map(x=>{const f=x.document.fields||{};return {id:x.document.name.split("/").pop(),name:v(f.name)||"Pandit",city:v(f.city)||"",exp:v(f.experience)||0,langs:v(f.languages)||[],svcs:v(f.services)||[],price:v(f.price)||"",bio:v(f.bio)||"",at:v(f.createdAt)||0}});
}
function card(p){
  const book=h("a",{class:"pbtn",href:"account/dashboard.html","aria-label":"Book "+p.name,onclick:()=>{try{sessionStorage.setItem("op-book",p.id)}catch(e){}}},"Book");
  return h("article",{class:"pn"},h("div",{class:"pn-av",style:`--ph:${hue(p.name)}`,"aria-hidden":"true"},ini(p.name),h("i",{title:"Verified by Online Pujari"})),
    h("div",{class:"pn-b"},h("h3",{},p.name),h("p",{class:"pn-e"},`${p.exp?`Exp. ${p.exp} year${p.exp>1?"s":""}`:"New pandit"}${p.city?" · "+p.city:""}`),
      h("p",{class:"pn-l"},p.langs.slice(0,4).join(", ")),h("p",{class:"pn-s"},p.svcs.slice(0,3).map(s=>h("span",{},s))),
      h("div",{class:"pn-f"},h("b",{},p.price||"Price on request"),book)));
}
function view(){
  let r=all.filter(p=>(!q||(p.name+" "+p.city+" "+p.svcs.join(" ")).toLowerCase().includes(q))&&(!fl.lang||p.langs.includes(fl.lang))&&(!fl.svc||p.svcs.includes(fl.svc))&&(!fl.city||p.city.toLowerCase()===fl.city)&&p.exp>=fl.exp);
  r.sort(sort==="name"?(a,b)=>a.name.localeCompare(b.name):sort==="new"?(a,b)=>b.at-a.at:(a,b)=>b.exp-a.exp);
  const n=r.length;if(limit)r=r.slice(0,limit);
  if(!r.length)return root.replaceChildren(h("p",{class:"pnd-msg"},"No pandit matches yet. ",h("a",{href:"book.html"},"Book anyway and we will assign one for you.")));
  root.replaceChildren(...r.map(card));const c=document.getElementById("pn-count");if(c)c.textContent=n+" pandit"+(n===1?"":"s");
}
function tools(){
  const T=document.getElementById("pn-tools");if(!T)return;
  const uniq=a=>[...new Set(a)].sort();const sel=(id,label,opts,key)=>{const s=h("select",{id,"aria-label":label,onchange:e=>{fl[key]=e.target.value;view()}},h("option",{value:""},label),opts.map(o=>h("option",{value:key==="city"?o.toLowerCase():o},o)));return s};
  const search=h("input",{type:"search",placeholder:"Search name, city or puja",maxlength:60,"aria-label":"Search pandits",oninput:e=>{q=e.target.value.trim().toLowerCase();view()}});
  const so=h("select",{"aria-label":"Sort",onchange:e=>{sort=e.target.value;view()}},[["exp","Most experienced"],["name","Name A to Z"],["new","Newest first"]].map(([k,t])=>h("option",{value:k},t)));
  const ex=h("select",{"aria-label":"Experience",onchange:e=>{fl.exp=Number(e.target.value);view()}},[[0,"Any experience"],[3,"3+ years"],[5,"5+ years"],[10,"10+ years"]].map(([k,t])=>h("option",{value:k},t)));
  const panel=h("div",{class:"pn-panel",id:"pn-panel",hidden:true},sel("fl-l","Any language",uniq(all.flatMap(p=>p.langs)),"lang"),sel("fl-s","Any puja",uniq(all.flatMap(p=>p.svcs)),"svc"),sel("fl-c","Any city",uniq(all.map(p=>p.city).filter(Boolean)),"city"),ex,
    h("button",{type:"button",class:"pn-clr",onclick:()=>{fl={lang:"",svc:"",city:"",exp:0};panel.querySelectorAll("select").forEach(s=>s.selectedIndex=0);view()}},"Clear filters"));
  const fb=h("button",{type:"button",class:"pn-t","aria-expanded":"false","aria-controls":"pn-panel",onclick:()=>{panel.hidden=!panel.hidden;fb.setAttribute("aria-expanded",String(!panel.hidden))}},"Filter");
  T.replaceChildren(h("div",{class:"pn-bar"},fb,h("label",{class:"pn-t pn-sort"},"Sort ",so),h("div",{class:"pn-search"},search)),panel);
}
msg("Loading pandits…");
try{all=await load();
  if(!all.length){root.replaceChildren(h("p",{class:"pnd-msg"},"Our pandit directory is opening soon. ",h("a",{href:"book.html"},"Book a puja now"),"; we will assign a verified pandit in your language."));document.getElementById("pn-tools")?.remove();document.querySelector("[data-pn-more]")?.remove()}
  else{if(full)tools();view()}
}catch(e){root.replaceChildren(h("p",{class:"pnd-msg"},"Could not load pandits right now. ",h("a",{href:"book.html"},"Book a puja"),"; we will assign one."));}
}
