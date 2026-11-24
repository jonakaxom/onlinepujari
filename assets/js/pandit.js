import {el,db,F,waLink,digits,boot,shell,pageHead,ic,stat,pill,stars,toast,modal,confirmBox,empty,field,setErr,chips,download,ics,fdate,ftime,tsMs,todayStr,rel,daysUntil,pujas,LANGS,STATUS,setBadge} from "./ui.js";
const S=await boot("pandit");const {user,profile}=S;const uid=user.uid;const pref=F.doc(db,"pandits",uid);
let me=(await F.getDoc(pref)).data()||null;
const pz=await pujas();
const loadBookings=async()=>{const q=await F.getDocs(F.query(F.collection(db,"bookings"),F.where("panditId","==",uid),F.limit(300)));return q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>tsMs(b.createdAt)-tsMs(a.createdAt))};
const loadReviews=async()=>{try{const q=await F.getDocs(F.query(F.collection(db,"reviews"),F.where("panditId","==",uid),F.limit(200)));return q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>tsMs(b.createdAt)-tsMs(a.createdAt))}catch(e){return[]}};
const meta=(i,t)=>el("span",{},ic(i,16),t);
const complete=()=>{const m=me||{};const items=[["Display name",!!m.name],["City",!!m.city],["Languages",(m.languages||[]).length>0],["Pujas you perform",(m.services||[]).length>0],["WhatsApp number",!!m.whatsapp],["Short bio",(m.bio||"").length>=30],["Price note",!!m.price]];return {items,pct:Math.round(items.filter(i=>i[1]).length/items.length*100)}};
const setStatus=async(b,status,note,ctx)=>{try{const u={status,updatedAt:F.serverTimestamp()};if(note)u.panditNote=note;await F.updateDoc(F.doc(db,"bookings",b.id),u);toast(status==="accepted"?"Booking accepted":status==="declined"?"Booking declined":"Marked completed");ctx.render()}catch(e){toast("Action failed. The booking may have changed.","err");ctx.render()}};

function reqCard(b,ctx){
  const show=["accepted","completed"].includes(b.status);const acts=[];
  if(b.status==="pending")acts.push(el("button",{class:"btn sm ok",type:"button",onclick:()=>setStatus(b,"accepted","",ctx)},ic("check",16),"Accept"),
    el("button",{class:"btn sm ghost",type:"button",onclick:async()=>{const t=el("textarea",{maxlength:200,placeholder:"Optional reason, shown to the customer (e.g. fully booked that day)"});
      const r=await modal({title:"Decline this request?",body:field("Reason",t),actions:[{label:"Go back",kind:"ghost",value:false},{label:"Decline",kind:"danger",value:true}]});if(r)setStatus(b,"declined",t.value.trim(),ctx)}},ic("x",16),"Decline"));
  if(b.status==="accepted"){acts.push(el("button",{class:"btn sm",type:"button",onclick:async()=>{if(await confirmBox("Mark this puja as completed? The customer can then rate you.","Mark completed"))setStatus(b,"completed","",ctx)}},ic("check",16),"Mark completed"));
    const w=waLink(b.customerPhone,`Namaste ${b.customerName}, I am ${me?.name||profile.name} from Online Pujari about your ${b.puja} on ${fdate(b.date)}.`);if(w)acts.push(el("a",{class:"btn sm ok",href:w,target:"_blank",rel:"noopener noreferrer"},ic("wa",16),"WhatsApp"));
    acts.push(el("button",{class:"btn sm ghost",type:"button",onclick:()=>download(`puja-${b.date}.ics`,ics(b),"text/calendar")},ic("cal",16),"Add to calendar"))}
  return el("article",{class:"bk"},el("div",{class:"bk-h"},el("h3",{},b.puja),pill(b.status)),
    el("div",{class:"meta"},meta("cal",fdate(b.date)+" · "+ftime(b.time)),meta("pin",b.mode==="online"?"Online (video)":b.city),meta("globe",b.lang),meta("user",b.customerName),el("span",{},b.samagri==="with_samagri"?"With samagri kit":"Pandit only")),
    ["pending","accepted"].includes(b.status)&&daysUntil(b.date)>=0?el("div",{class:"meta"},el("b",{},rel(b.date))):null,
    show?el("div",{class:"meta"},meta("wa",b.customerPhone),meta("pin",b.address)):el("p",{class:"hint"},"Phone and full address are shown after you accept."),
    b.notes?el("p",{class:"note"},el("b",{},"Customer notes: "),b.notes):null,acts.length?el("div",{class:"acts"},acts):null)}

const routes={
async home(ctx){
  const [bks,rv]=await Promise.all([me?loadBookings():[],me?loadReviews():[]]);const t=todayStr();
  const pend=bks.filter(b=>b.status==="pending"),up=bks.filter(b=>b.status==="accepted"&&b.date>=t).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  setBadge("requests",pend.length);const c=complete();const avg=rv.length?rv.reduce((s,r)=>s+r.rating,0)/rv.length:0;
  const banner=!me?el("div",{class:"banner warn"},ic("edit",22),el("div",{},el("b",{},"Submit your profile to start receiving bookings"),el("span",{},"Fill in your languages, pujas and city. Our team reviews every profile before customers can see it."),el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/profile"},"Complete profile")))):
    me.approved?el("div",{class:"banner ok"},ic("shield",22),el("div",{},el("b",{},"You are live"),el("span",{},"Customers can find and book you."))):
    me.reviewNote?el("div",{class:"banner bad"},ic("x",22),el("div",{},el("b",{},"Changes requested by the Online Pujari team"),el("span",{},me.reviewNote),el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/profile"},"Update profile")))):
    el("div",{class:"banner warn"},ic("clock",22),el("div",{},el("b",{},"Your profile is under review"),el("span",{},"The Online Pujari team checks every pandit before listing. This usually takes 1 to 2 days. You will appear to customers once approved.")));
  const next=up[0];
  const hero=next?el("section",{class:"card hero-card"},el("p",{class:"muted"},"Your next puja"),el("h2",{class:"big"},next.puja),el("p",{},`${fdate(next.date)} at ${ftime(next.time)} · ${rel(next.date)}`),el("p",{class:"muted"},`${next.customerName} · ${next.mode==="online"?"Online":next.city}`),el("div",{class:"acts"},el("a",{class:"btn gold",href:"#/schedule"},"Open schedule"))):null;
  const prof=el("section",{class:"card"},el("h2",{},"Profile strength: "+c.pct+"%"),el("div",{class:"meter",role:"progressbar","aria-valuenow":c.pct,"aria-valuemin":0,"aria-valuemax":100},el("i",{style:"width:"+c.pct+"%"})),
    el("ul",{class:"todo"},c.items.map(([l,ok])=>el("li",{class:ok?"ok":""},ic(ok?"check":"x",18),l))),c.pct<100?el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/profile"},"Improve profile")):null);
  return [pageHead("Namaste, "+profile.name.split(" ")[0],"Your pandit dashboard"),banner,hero,
    el("div",{class:"grid g4 keep2",style:"margin-bottom:20px"},stat("inbox","New requests",pend.length),stat("cal","Upcoming",up.length),stat("check","Completed",bks.filter(b=>b.status==="completed").length),stat("star","Rating",avg?avg.toFixed(1):"New",rv.length?rv.length+" reviews":"")),prof]},

async requests(ctx){
  if(!me)return [pageHead("Requests"),empty({title:"Complete your profile first",text:"Bookings appear here once your profile is approved.",action:el("a",{class:"btn",href:"#/profile"},"Go to profile")})];
  const bks=await loadBookings();setBadge("requests",bks.filter(b=>b.status==="pending").length);let tab="pending";
  const tabs=el("div",{class:"tabs"}),list=el("div",{});const T=["pending","accepted","completed","declined","cancelled"];
  const draw=()=>{tabs.replaceChildren(...T.map(k=>el("button",{type:"button",class:k===tab?"on":"",onclick:()=>{tab=k;draw()}},STATUS[k][0],el("em",{},bks.filter(b=>b.status===k).length))));
    const r=bks.filter(b=>b.status===tab);list.replaceChildren(...(r.length?r.map(b=>reqCard(b,ctx)):[empty({title:"Nothing here",text:tab==="pending"?"New booking requests will appear here.":"No "+STATUS[tab][0].toLowerCase()+" bookings."})]))};draw();
  return [pageHead("Booking requests","Accept or decline requests from customers"),tabs,list]},

async schedule(ctx){
  if(!me)return [pageHead("Schedule"),empty({title:"Complete your profile first",text:"Your confirmed pujas will appear here.",action:el("a",{class:"btn",href:"#/profile"},"Go to profile")})];
  const t=todayStr();const up=(await loadBookings()).filter(b=>b.status==="accepted"&&b.date>=t).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  const by={};up.forEach(b=>(by[b.date]||=[]).push(b));
  return [pageHead("Schedule","Your confirmed pujas, day by day"),up.length?Object.keys(by).flatMap(d=>[el("h2",{class:"day"},fdate(d)+" · "+rel(d)),...by[d].map(b=>reqCard(b,ctx))]):empty({title:"No upcoming pujas",text:"Accepted bookings will show up here."})]},

async availability(ctx){
  if(!me)return [pageHead("Availability"),empty({title:"Complete your profile first",text:"Set your off days after submitting your profile.",action:el("a",{class:"btn",href:"#/profile"},"Go to profile")})];
  const off=new Set((me.unavailable||[]).filter(d=>d>=todayStr()));const busy=new Set((await loadBookings()).filter(b=>b.status==="accepted").map(b=>b.date));
  const wrap=el("div",{});const t0=new Date();
  for(let m=0;m<3;m++){const first=new Date(t0.getFullYear(),t0.getMonth()+m,1);const days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
    const g=el("div",{class:"cal"},["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>el("b",{},d)));
    for(let i=0;i<(first.getDay()+6)%7;i++)g.append(el("span"));
    for(let d=1;d<=days;d++){const s=`${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const past=s<todayStr();
      const b=el("button",{type:"button",disabled:past,"aria-pressed":String(off.has(s)),"aria-label":fdate(s)+(busy.has(s)?", has a booking":""),class:(off.has(s)?"off ":"")+(busy.has(s)?"busy":""),onclick:()=>{off.has(s)?off.delete(s):off.add(s);b.classList.toggle("off",off.has(s));b.setAttribute("aria-pressed",String(off.has(s)))}},d);g.append(b)}
    wrap.append(el("h2",{class:"day"},first.toLocaleDateString("en-IN",{month:"long",year:"numeric"})),g)}
  return [pageHead("Availability","Tap dates you are NOT available. Customers cannot book you on those days.",el("button",{class:"btn",type:"button",onclick:async()=>{try{await F.updateDoc(pref,{unavailable:[...off].sort()});me.unavailable=[...off];toast("Availability saved")}catch(e){toast("Could not save.","err")}}},"Save changes")),
    el("div",{class:"card"},el("p",{class:"hint"},"Red = unavailable. Green underline = you already have a confirmed booking."),wrap)]},

async reviews(ctx){const rv=await loadReviews();const a=rv.length?rv.reduce((s,r)=>s+r.rating,0)/rv.length:0;
  return [pageHead("Reviews","What customers say about you"),el("div",{class:"card"},el("div",{style:"display:flex;gap:18px;align-items:center;margin-bottom:10px"},el("b",{style:"font:700 2.4rem Eczar,serif"},a?a.toFixed(1):"New"),stars(a,rv.length)),
    rv.length?rv.map(r=>el("div",{class:"rev"},stars(r.rating),el("b",{style:"margin-left:8px"},r.customerName),r.text?el("p",{},r.text):null)):empty({title:"No reviews yet",text:"Customers can rate you after a completed puja."}))]},

async profile(ctx){
  const m=me||{};const locked=!!(me&&me.approved);
  const name=el("input",{value:m.name||profile.name,maxlength:80,disabled:locked}),city=el("input",{value:m.city||"",maxlength:60,placeholder:"e.g. Guwahati"}),exp=el("input",{type:"number",min:0,max:80,value:m.experience||0,inputmode:"numeric"}),
    wa=el("input",{type:"tel",inputmode:"tel",maxlength:14,value:m.whatsapp||"",placeholder:"10-digit number or with country code"}),price=el("input",{maxlength:80,value:m.price||"",placeholder:"e.g. Griha Pravesh from ₹3,100"}),bio=el("textarea",{maxlength:500,placeholder:"Your experience, traditions you follow, languages, travel radius"});bio.value=m.bio||"";
  const langs=chips(LANGS,m.languages||[],{name:"lg"}),svcs=chips(pz.map(p=>p.name),m.services||[],{name:"sv"});
  const fn=field("Display name",name,locked?"Locked after approval to protect customers. Contact support to change.":"Shown to customers."),fc=field("City",city),fw=field("WhatsApp number",wa,"Shown to customers only after you accept a booking.");
  const fl=el("div",{class:"fld"},el("label",{},"Languages you perform puja in"),langs,el("small",{class:"ferr",role:"alert"})),fs=el("div",{class:"fld"},el("label",{},"Pujas you perform"),svcs,el("small",{class:"ferr",role:"alert"}));
  const form=el("form",{class:"card",novalidate:true,onsubmit:async e=>{e.preventDefault();let ok=true;[fn,fc,fw].forEach(f=>f.classList.remove("bad"));fl.querySelector(".ferr").textContent="";fs.querySelector(".ferr").textContent="";
    if(!locked&&name.value.trim().length<2){setErr(name,"Enter your name.");ok=false}if(!city.value.trim()){setErr(city,"Enter your city.");ok=false}
    if(wa.value&&!/^\d{10,14}$/.test(digits(wa.value))){setErr(wa,"Enter a valid number.");ok=false}
    if(!langs.value().length){fl.querySelector(".ferr").textContent="Select at least one language.";ok=false}if(!svcs.value().length){fs.querySelector(".ferr").textContent="Select at least one puja.";ok=false}if(!ok)return;
    const d={name:name.value.trim(),city:city.value.trim(),languages:langs.value(),services:svcs.value(),price:price.value.trim(),experience:Math.max(0,Math.min(80,Number(exp.value)||0)),whatsapp:digits(wa.value),bio:bio.value.trim()};
    try{if(me){if(locked)delete d.name;await F.updateDoc(pref,d)}else await F.setDoc(pref,{...d,unavailable:[],approved:false,createdAt:F.serverTimestamp()});
      me=(await F.getDoc(pref)).data();toast(me.approved?"Profile saved":"Profile submitted for approval");ctx.go("home")}catch(x){toast("Could not save profile. Please check all fields.","err")}}},
    el("h2",{},me?"Edit profile":"Create your pandit profile"),!me?el("p",{class:"sub"},"Our team reviews every profile before it is shown to customers."):null,
    el("div",{class:"row2"},fn,fc),el("div",{class:"row2"},field("Years of experience",exp),fw),fl,fs,field("Price note",price,"Optional. Final price is agreed with the customer."),field("About you",bio,"At least 30 characters improves trust."),
    el("button",{class:"btn",type:"submit"},me?"Save changes":"Submit for approval"));
  return [pageHead("Profile","How customers see you"),form]}
};
const nav=[{id:"home",label:"Overview",short:"Home",icon:"home"},{id:"requests",label:"Requests",icon:"inbox",badge:true},{id:"schedule",label:"Schedule",icon:"cal"},{id:"availability",label:"Availability",short:"Days off",icon:"clock"},{id:"profile",label:"Profile",icon:"user"},{id:"reviews",label:"Reviews",icon:"star"}];
shell({title:"Pandit",nav,session:{profile},routes,start:"home"});
