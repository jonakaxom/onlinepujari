import {db,F,el,$,notice,requireUser,badge,fmtDate,tsMs,waLink,loadPujas,LANGS} from "./auth.js";
const {user,profile}=await requireUser({allow:({profile,isAdmin})=>!isAdmin&&profile.role==="customer"});
const [pujas,pq]=await Promise.all([loadPujas(),F.getDocs(F.query(F.collection(db,"pandits"),F.where("approved","==",true),F.limit(100)))]);
const pandits=pq.docs.map(d=>({id:d.id,...d.data()}));
const app=$("#app");

/* profile */
const pn=el("input",{value:profile.name,maxlength:80,required:true}),pp=el("input",{value:profile.phone,type:"tel",pattern:"[0-9+ ]{10,14}",required:true});
const pf=el("form",{class:"card",onsubmit:async e=>{e.preventDefault();if(!pf.reportValidity())return;
  try{await F.updateDoc(F.doc(db,"users",user.uid),{name:pn.value.trim(),phone:pp.value.trim(),updatedAt:F.serverTimestamp()});profile.name=pn.value.trim();profile.phone=pp.value.trim();$("#who").textContent=profile.name;notice("Profile saved.")}catch(x){notice("Could not save profile.","err")}}},
  el("h2",{},"My profile"),el("div",{class:"row2"},el("div",{},el("label",{class:"f"},"Name"),pn),el("div",{},el("label",{class:"f"},"Phone"),pp)),
  el("p",{style:"margin:6px 0"},"Email: "+profile.email),el("button",{class:"btn sm",type:"submit"},"Save profile"));

/* new booking */
const f={};const mk=(k,tag,props)=>f[k]=el(tag,props);
mk("puja","select",{required:true});f.puja.append(el("option",{value:""},"Select puja"),...pujas.map(p=>el("option",{value:p[1]},p[1])));
mk("date","input",{type:"date",required:true,min:new Date().toISOString().slice(0,10)});
mk("time","input",{type:"time",required:true,value:"09:00"});
mk("city","input",{required:true,maxlength:60,placeholder:"e.g. Guwahati"});
mk("lang","select",{});f.lang.append(...LANGS.map(l=>el("option",{value:l},l)));
mk("address","textarea",{required:true,rows:2,maxlength:300,placeholder:"Full address where the puja will be held (or write: Online)"});
mk("pandit","select",{});f.pandit.append(el("option",{value:""},"Any pandit — Online Pujari will assign"),...pandits.map(p=>el("option",{value:p.id},`${p.name} — ${p.city}`)));
mk("notes","textarea",{rows:2,maxlength:500,placeholder:"Special requirements (optional)"});
const L=(t,n)=>[el("label",{class:"f"},t),n];
const bf=el("form",{class:"card",onsubmit:async e=>{e.preventDefault();if(!bf.reportValidity())return;
  const pid=f.pandit.value,pd=pandits.find(p=>p.id===pid);
  const data={customerId:user.uid,customerName:profile.name,customerPhone:profile.phone,puja:f.puja.value,date:f.date.value,time:f.time.value,city:f.city.value.trim(),
    lang:f.lang.value,address:f.address.value.trim(),notes:f.notes.value.trim(),panditId:pid,panditName:pd?pd.name:"",status:"pending",createdAt:F.serverTimestamp(),updatedAt:F.serverTimestamp()};
  try{await F.addDoc(F.collection(db,"bookings"),data);bf.reset();notice("Booking request sent! You will see updates below.");load()}catch(x){notice("Could not create booking. Please check the fields.","err")}}},
  el("h2",{},"Book a puja"),
  el("div",{class:"row2"},el("div",{},L("Puja",f.puja)),el("div",{},L("Preferred pandit",f.pandit)),el("div",{},L("Date",f.date)),el("div",{},L("Time",f.time)),el("div",{},L("City",f.city)),el("div",{},L("Language",f.lang))),
  L("Address",f.address),L("Notes",f.notes),el("p",{style:"margin-top:12px"},el("button",{class:"btn",type:"submit"},"Send booking request")));

/* my bookings */
const list=el("div",{});
async function load(){
  const q=await F.getDocs(F.query(F.collection(db,"bookings"),F.where("customerId","==",user.uid),F.limit(100)));
  const rows=q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>tsMs(b.createdAt)-tsMs(a.createdAt));
  list.replaceChildren(...(rows.length?rows.map(card):[el("p",{class:"empty"},"No bookings yet. Book your first puja above.")]));
}
function card(b){
  const p=pandits.find(x=>x.id===b.panditId);
  const wa=b.status==="accepted"&&p?waLink(p.whatsapp,`Namaste ${p.name}, this is ${profile.name}. Regarding my ${b.puja} booking on ${fmtDate(b.date)} at ${b.time}.`):null;
  const cancel=["pending","accepted"].includes(b.status)?el("button",{class:"btn sm danger",onclick:async()=>{if(!confirm("Cancel this booking?"))return;
    try{await F.updateDoc(F.doc(db,"bookings",b.id),{status:"cancelled",updatedAt:F.serverTimestamp()});load()}catch(x){notice("Could not cancel.","err")}}},"Cancel"):null;
  return el("div",{class:"bk"},el("h3",{},b.puja,badge(b.status)),el("p",{},`${fmtDate(b.date)} at ${b.time} · ${b.city} · ${b.lang}`),
    el("p",{},"Pandit: "+(b.panditName||"To be assigned by Online Pujari")),el("p",{},"Address: "+b.address),b.notes?el("p",{},"Notes: "+b.notes):null,
    el("div",{class:"acts"},wa?el("a",{class:"btn sm ok",href:wa,target:"_blank",rel:"noopener noreferrer"},"WhatsApp pandit"):null,cancel));
}
app.replaceChildren(el("h1",{},"Namaste, "+profile.name.split(" ")[0]),el("p",{class:"sub"},"Your bookings and profile"),bf,el("div",{class:"card"},el("h2",{},"My bookings"),list),pf);
load();
