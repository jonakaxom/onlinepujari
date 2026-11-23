import {db,F,el,$,notice,requireUser,badge,fmtDate,tsMs,digits,waLink,LANGS,loadPujas} from "./auth.js";
const {user,profile}=await requireUser({allow:({profile,isAdmin})=>!isAdmin&&profile.role==="pandit"});
const pujas=await loadPujas();
const app=$("#app");
const pref=F.doc(db,"pandits",user.uid);
let me=(await F.getDoc(pref)).data()||null;

/* profile form */
const v=k=>me?me[k]:"";
const name=el("input",{required:true,maxlength:80,value:v("name")||profile.name}),city=el("input",{required:true,maxlength:60,value:v("city"),placeholder:"e.g. Guwahati"});
const exp=el("input",{type:"number",min:0,max:80,value:v("experience")||0}),price=el("input",{maxlength:80,value:v("price"),placeholder:"e.g. Griha Pravesh from ₹3,100"});
const wa=el("input",{type:"tel",maxlength:14,value:v("whatsapp")||"",placeholder:"WhatsApp number shown to confirmed customers"});
const bio=el("textarea",{rows:3,maxlength:500,value:v("bio")}); bio.value=v("bio")||"";
const chk=(items,sel)=>items.map(i=>el("label",{},el("input",{type:"checkbox",value:i,checked:(sel||[]).includes(i)}),i));
const langs=el("div",{class:"chips"},chk(LANGS,v("languages")));
const svcs=el("div",{class:"chips"},chk(pujas.map(p=>p[1]),v("services")));
const picked=box=>[...box.querySelectorAll("input:checked")].map(i=>i.value);
const status=()=>!me?el("span",{class:"badge b-pending"},"Profile not submitted"):me.approved?el("span",{class:"badge b-accepted"},"Approved — visible to customers"):el("span",{class:"badge b-pending"},"Waiting for approval");
const pf=el("form",{class:"card",onsubmit:async e=>{e.preventDefault();if(!pf.reportValidity())return;
  const d={name:name.value.trim(),city:city.value.trim(),languages:picked(langs),services:picked(svcs),price:price.value.trim(),experience:Number(exp.value)||0,whatsapp:digits(wa.value),bio:bio.value.trim()};
  if(!d.languages.length||!d.services.length){notice("Select at least one language and one puja.","err");return}
  try{
    if(me)await F.updateDoc(pref,d);else await F.setDoc(pref,{...d,approved:false,createdAt:F.serverTimestamp()});
    me=(await F.getDoc(pref)).data();hd.replaceChildren(el("span",{},"Profile status: "),status());notice("Profile saved.");
  }catch(x){notice("Could not save profile. Check the fields.","err")}}},
  el("h2",{},"My pandit profile"),el("p",{id:"hd"},el("span",{},"Profile status: "),status()),
  el("div",{class:"row2"},el("div",{},el("label",{class:"f"},"Display name"),name),el("div",{},el("label",{class:"f"},"City"),city),el("div",{},el("label",{class:"f"},"Years of experience"),exp),el("div",{},el("label",{class:"f"},"WhatsApp number"),wa)),
  el("label",{class:"f"},"Languages you perform puja in"),langs,el("label",{class:"f"},"Pujas you perform"),svcs,
  el("label",{class:"f"},"Price note"),price,el("label",{class:"f"},"About you"),bio,
  el("p",{style:"margin-top:12px"},el("button",{class:"btn",type:"submit"},me?"Update profile":"Submit for approval")));
const hd=pf.querySelector("#hd");

/* bookings */
let rows=[],tab="pending";
const list=el("div",{}),tabs=el("div",{class:"tabs"});
["pending","accepted","completed","declined","cancelled"].forEach(t=>tabs.append(el("button",{type:"button","data-t":t,class:t===tab?"on":"",onclick:e=>{tab=t;[...tabs.children].forEach(b=>b.classList.toggle("on",b.dataset.t===t));render()}},t[0].toUpperCase()+t.slice(1))));
async function load(){
  const q=await F.getDocs(F.query(F.collection(db,"bookings"),F.where("panditId","==",user.uid),F.limit(200)));
  rows=q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>tsMs(b.createdAt)-tsMs(a.createdAt));render();
}
const setStatus=async(b,s)=>{try{await F.updateDoc(F.doc(db,"bookings",b.id),{status:s,updatedAt:F.serverTimestamp()});load()}catch(x){notice("Action failed (the booking may have changed).","err");load()}};
function card(b){
  const acts=[];
  if(b.status==="pending")acts.push(el("button",{class:"btn sm ok",onclick:()=>setStatus(b,"accepted")},"Accept"),el("button",{class:"btn sm danger",onclick:()=>setStatus(b,"declined")},"Decline"));
  if(b.status==="accepted"){acts.push(el("button",{class:"btn sm",onclick:()=>setStatus(b,"completed")},"Mark completed"));
    const w=waLink(b.customerPhone,`Namaste ${b.customerName}, I am ${me?.name||profile.name} from Online Pujari, regarding your ${b.puja} on ${fmtDate(b.date)}.`);
    if(w)acts.push(el("a",{class:"btn sm ghost",href:w,target:"_blank",rel:"noopener noreferrer"},"WhatsApp customer"))}
  return el("div",{class:"bk"},el("h3",{},b.puja,badge(b.status)),el("p",{},`${fmtDate(b.date)} at ${b.time} · ${b.city} · ${b.lang}`),
    el("p",{},"Customer: "+b.customerName+(b.status==="accepted"||b.status==="completed"?" · "+b.customerPhone:"")),
    b.status==="accepted"||b.status==="completed"?el("p",{},"Address: "+b.address):null,b.notes?el("p",{},"Notes: "+b.notes):null,el("div",{class:"acts"},acts));
}
function render(){const r=rows.filter(b=>b.status===tab);list.replaceChildren(...(r.length?r.map(card):[el("p",{class:"empty"},"No "+tab+" bookings.")]))}
app.replaceChildren(el("h1",{},"Pandit dashboard"),el("p",{class:"sub"},"Namaste, "+profile.name+". Manage your profile and booking requests."),
  el("div",{class:"card"},el("h2",{},"Booking requests"),tabs,list),pf);
if(me)load();else list.replaceChildren(el("p",{class:"empty"},"Submit your profile below. After approval, customers can book you."));
