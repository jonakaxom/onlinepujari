import {firstName,greet,mapsLink,copyText,countdown,dayName,initials,money,el,db,F,waLink,digits,boot,shell,pageHead,ic,stat,pill,stars,toast,modal,confirmBox,empty,field,setErr,chips,download,ics,fdate,ftime,tsMs,todayStr,rel,daysUntil,pujas,LANGS,STATUS,setBadge} from "./ui.js";
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
    acts.push(el("button",{class:"btn sm ghost",type:"button",onclick:()=>download(`puja-${b.date}.ics`,ics(b),"text/calendar")},ic("cal",16),"Add to calendar"));
    if(b.mode!=="online"&&b.address){acts.push(el("a",{class:"btn sm ghost",href:mapsLink(b.address+", "+b.city),target:"_blank",rel:"noopener noreferrer"},ic("pin",16),"Open in Maps"),el("button",{class:"btn sm ghost",type:"button",onclick:()=>copyText(b.address+", "+b.city)},ic("copy",16),"Copy address"))}}
  const soon=["pending","accepted"].includes(b.status)&&daysUntil(b.date)>=0&&daysUntil(b.date)<=2;
  return el("article",{class:"bk"+(soon?" soon":"")},el("div",{class:"bk-h"},el("h3",{},b.puja),el("span",{class:"bk-p"},soon?el("span",{class:"pill p-urgent"},daysUntil(b.date)===0?"Today":daysUntil(b.date)===1?"Tomorrow":"In 2 days"):null,pill(b.status))),
    el("div",{class:"meta"},meta("cal",fdate(b.date)+" · "+ftime(b.time)),meta("pin",b.mode==="online"?"Online (video)":b.city),meta("globe",b.lang),meta("user",b.customerName),el("span",{},b.samagri==="with_samagri"?"With samagri kit":"Pandit only")),
    !soon&&["pending","accepted"].includes(b.status)&&daysUntil(b.date)>=0?el("div",{class:"meta"},el("b",{},rel(b.date))):null,
    show?el("div",{class:"meta"},meta("wa",b.customerPhone),meta("pin",b.address)):el("p",{class:"hint"},"Phone and full address are shown after you accept."),
    b.notes?el("p",{class:"note"},el("b",{},"Customer notes: "),b.notes):null,acts.length?el("div",{class:"acts"},acts):null)}

const routes={
async home(ctx){
  const [bks,rv]=await Promise.all([me?loadBookings():[],me?loadReviews():[]]);const t=todayStr();
  const pend=bks.filter(b=>b.status==="pending").sort((a,b)=>a.date.localeCompare(b.date)),up=bks.filter(b=>b.status==="accepted"&&b.date>=t).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  setBadge("requests",pend.length);const c=complete();const avg=rv.length?rv.reduce((s,r)=>s+r.rating,0)/rv.length:0;
  const first=firstName(profile.name);
  const banner=!me?el("div",{class:"banner warn"},ic("edit",22),el("div",{},el("b",{},"Submit your profile to start receiving bookings"),el("span",{},"Fill in your languages, pujas and city. Our team reviews every profile before customers can see it."),el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/profile"},"Complete profile")))):
    me.approved?null:
    me.reviewNote?el("div",{class:"banner bad"},ic("x",22),el("div",{},el("b",{},"Changes requested by the Online Pujari team"),el("span",{},me.reviewNote),el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/profile"},"Update profile")))):
    el("div",{class:"banner warn"},ic("clock",22),el("div",{},el("b",{},"Your profile is under review"),el("span",{},"The Online Pujari team checks every pandit before listing. This usually takes 1 to 2 days. You will appear to customers once approved.")));
  const today=up.filter(b=>b.date===t),next=up[0];
  const hero=el("section",{class:"card hero-card"},el("p",{class:"muted"},greet()+(me&&me.approved?" · You are live":"")),el("h2",{class:"big"},"Namaste, "+first),
    today.length?el("p",{},`${today.length} puja${today.length>1?"s":""} today: `+today.map(b=>`${b.puja} at ${ftime(b.time)}`).join(", ")):next?el("p",{},`Next: ${next.puja} on ${fdate(next.date)} at ${ftime(next.time)}`):el("p",{class:"muted"},pend.length?`${pend.length} request${pend.length>1?"s":""} waiting for your reply.`:"No pujas scheduled yet. New requests appear here."),
    next?el("p",{class:"count"},ic("clock",18),"Starts in "+countdown(next.date,next.time)):null,
    el("div",{class:"acts"},pend.length?el("a",{class:"btn gold",href:"#/requests"},ic("inbox",18),pend.length+" new request"+(pend.length>1?"s":"")):null,el("a",{class:"btn ghost",href:"#/schedule"},"Open schedule"),el("a",{class:"btn ghost",href:"#/availability"},"Set days off")));
  /* performance */
  const decided=bks.filter(b=>["accepted","completed","declined"].includes(b.status)).length,acc=bks.filter(b=>["accepted","completed"].includes(b.status)).length;
  const rate=decided?Math.round(acc/decided*100):null;const ym=t.slice(0,7);const thisM=bks.filter(b=>["accepted","completed"].includes(b.status)&&b.date.startsWith(ym)).length;
  const stats=el("div",{class:"grid g4 keep2",style:"margin-bottom:20px"},stat("inbox","New requests",pend.length),stat("cal","Upcoming",up.length),stat("check","Completed",bks.filter(b=>b.status==="completed").length),stat("star","Rating",avg?avg.toFixed(1):"New",rv.length?rv.length+" review"+(rv.length>1?"s":""):""));
  const stats2=el("div",{class:"grid g3 keep2",style:"margin-bottom:20px"},stat("chart","This month",thisM,"confirmed pujas"),stat("shield","Acceptance rate",rate===null?"-":rate+"%",decided?"of "+decided+" decided":"No decisions yet"),stat("users","All time",bks.length,"requests received"));
  /* last 6 months chart */
  const months=[];const d0=new Date();for(let i=5;i>=0;i--){const d=new Date(d0.getFullYear(),d0.getMonth()-i,1);months.push({k:d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"),l:d.toLocaleDateString("en-IN",{month:"short"}),n:0})}
  bks.filter(b=>["accepted","completed"].includes(b.status)).forEach(b=>{const m=months.find(x=>b.date.startsWith(x.k));if(m)m.n++});const mx=Math.max(1,...months.map(m=>m.n));
  const chart=el("section",{class:"card"},el("h2",{},"Pujas by month"),el("p",{class:"sub"},"Confirmed and completed pujas, last 6 months"),
    el("div",{class:"bars",role:"img","aria-label":"Pujas per month: "+months.map(m=>m.l+" "+m.n).join(", ")},months.map(m=>el("div",{class:"bar"},el("b",{},m.n),el("i",{style:`height:${Math.max(4,m.n/mx*100)}%`}),el("span",{},m.l)))));
  const prof=el("section",{class:"card"},el("h2",{},"Profile strength: "+c.pct+"%"),el("div",{class:"meter",role:"progressbar","aria-valuenow":c.pct,"aria-valuemin":0,"aria-valuemax":100},el("i",{style:"width:"+c.pct+"%"})),
    el("ul",{class:"todo"},c.items.map(([l,ok])=>el("li",{class:ok?"ok":""},ic(ok?"check":"x",18),l))),c.pct<100?el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/profile"},"Improve profile")):null);
  const inbox=pend.length?el("section",{class:"card"},el("div",{class:"card-h"},el("h2",{},"Waiting for your reply"),pend.length>2?el("a",{href:"#/requests"},"See all "+pend.length):null),pend.slice(0,2).map(b=>reqCard(b,ctx))):null;
  return [pageHead("Overview","Your pandit dashboard at a glance"),banner,hero,inbox,stats,stats2,el("div",{class:"grid g2 top"},chart,prof)]},

async requests(ctx){
  if(!me)return [pageHead("Requests"),empty({title:"Complete your profile first",text:"Bookings appear here once your profile is approved.",action:el("a",{class:"btn",href:"#/profile"},"Go to profile")})];
  const bks=await loadBookings();setBadge("requests",bks.filter(b=>b.status==="pending").length);let tab=bks.some(b=>b.status==="pending")?"pending":"accepted",qy="",sort="date";
  const tabs=el("div",{class:"tabs"}),list=el("div",{});const T=["pending","accepted","completed","declined","cancelled"];
  const draw=()=>{tabs.replaceChildren(...T.map(k=>el("button",{type:"button",class:k===tab?"on":"",onclick:()=>{tab=k;draw()}},STATUS[k][0],el("em",{},bks.filter(b=>b.status===k).length))));
    const r=bks.filter(b=>b.status===tab).filter(b=>!qy||(b.puja+b.customerName+b.city).toLowerCase().includes(qy)).sort((a,b)=>sort==="date"&&["pending","accepted"].includes(tab)?a.date.localeCompare(b.date)||a.time.localeCompare(b.time):0);
    list.replaceChildren(...(r.length?r.map(b=>reqCard(b,ctx)):[empty({title:qy?"No matches":"Nothing here",text:qy?"Try a different search.":tab==="pending"?"New booking requests will appear here.":"No "+STATUS[tab][0].toLowerCase()+" bookings."})]))};draw();
  const si=el("input",{type:"search",placeholder:"Search by puja, customer or city","aria-label":"Search requests",oninput:e=>{qy=e.target.value.toLowerCase();draw()}});
  const so=el("select",{"aria-label":"Sort",onchange:e=>{sort=e.target.value;draw()}},el("option",{value:"date"},"Puja date, earliest first"),el("option",{value:"new"},"Newest first"));
  return [pageHead("Booking requests","Accept or decline requests from customers"),el("div",{class:"toolbar"},el("div",{class:"search"},ic("search",18),si),so),tabs,list]},

async schedule(ctx){
  if(!me)return [pageHead("Schedule"),empty({title:"Complete your profile first",text:"Your confirmed pujas will appear here.",action:el("a",{class:"btn",href:"#/profile"},"Go to profile")})];
  const t=todayStr();const all=(await loadBookings()).filter(b=>b.status==="accepted");const up=all.filter(b=>b.date>=t).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  const off=new Set(me.unavailable||[]);let view="list",ym=new Date(),pick=null;const body=el("div",{});
  const toggle=el("div",{class:"seg sm",role:"tablist"});
  const listView=()=>{const by={};up.forEach(b=>(by[b.date]||=[]).push(b));return up.length?Object.keys(by).flatMap(d=>[el("h2",{class:"day"},fdate(d)+" · "+rel(d)),...by[d].map(b=>reqCard(b,ctx))]):[empty({title:"No upcoming pujas",text:"Accepted bookings will show up here.",action:el("a",{class:"btn",href:"#/requests"},"Check requests")})]};
  const monthView=()=>{const y=ym.getFullYear(),m=ym.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate();
    const key=d=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const g=el("div",{class:"cal big"},["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>el("b",{},d)));
    for(let i=0;i<(first.getDay()+6)%7;i++)g.append(el("span"));
    for(let d=1;d<=days;d++){const k=key(d),n=all.filter(b=>b.date===k).length;
      g.append(el("button",{type:"button","aria-pressed":String(pick===k),class:(k===t?"today ":"")+(off.has(k)?"offd ":"")+(n?"has":""),"aria-label":fdate(k)+(n?`, ${n} puja${n>1?"s":""}`:"")+(off.has(k)?", day off":""),onclick:()=>{pick=pick===k?null:k;draw()}},el("span",{},d),n?el("i",{},n):null))}
    const dayList=pick?all.filter(b=>b.date===pick).sort((a,b)=>a.time.localeCompare(b.time)):[];
    return [el("div",{class:"mnav"},el("button",{class:"icon-btn",type:"button","aria-label":"Previous month",onclick:()=>{ym=new Date(y,m-1,1);draw()}},ic("back")),el("h2",{},first.toLocaleDateString("en-IN",{month:"long",year:"numeric"})),el("button",{class:"icon-btn",type:"button","aria-label":"Next month",onclick:()=>{ym=new Date(y,m+1,1);draw()}},ic("chev"))),
      el("div",{class:"card"},g,el("p",{class:"hint"},"Numbers show confirmed pujas. Tap a date to see them. Crossed-out dates are your days off.")),
      pick?el("div",{},el("h2",{class:"day"},fdate(pick)),...(dayList.length?dayList.map(b=>reqCard(b,ctx)):[el("p",{class:"hint"},"No confirmed pujas on this date.")])):null]};
  function draw(){toggle.replaceChildren(...[["list","List"],["month","Month"]].map(([k,l])=>el("button",{type:"button",role:"tab","aria-selected":String(view===k),class:"seg-b",onclick:()=>{view=k;draw()}},l)));body.replaceChildren(...[view==="list"?listView():monthView()].flat().filter(Boolean))}
  draw();return [pageHead("Schedule","Your confirmed pujas",toggle),body]},

async availability(ctx){
  if(!me)return [pageHead("Availability"),empty({title:"Complete your profile first",text:"Set your off days after submitting your profile.",action:el("a",{class:"btn",href:"#/profile"},"Go to profile")})];
  const t=todayStr();const saved=new Set((me.unavailable||[]).filter(d=>d>=t)),off=new Set(saved);const busy=new Set((await loadBookings()).filter(b=>b.status==="accepted").map(b=>b.date));
  const wrap=el("div",{}),btns={};const t0=new Date();const sk=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const bar=el("div",{class:"savebar",hidden:true,role:"status"}),dirty=()=>off.size!==saved.size||[...off].some(d=>!saved.has(d));
  const sync=()=>{Object.entries(btns).forEach(([s,b])=>{b.classList.toggle("off",off.has(s));b.setAttribute("aria-pressed",String(off.has(s)))});count.textContent=off.size+" day"+(off.size===1?"":"s")+" off";
    bar.hidden=!dirty();bar.replaceChildren(el("span",{},"You have unsaved changes"),el("div",{class:"acts"},el("button",{class:"btn sm ghost",type:"button",onclick:()=>{off.clear();saved.forEach(d=>off.add(d));sync()}},"Discard"),el("button",{class:"btn sm",type:"button",onclick:save},"Save changes")))};
  const save=async()=>{try{await F.updateDoc(pref,{unavailable:[...off].sort()});me.unavailable=[...off];saved.clear();off.forEach(d=>saved.add(d));toast("Availability saved");sync()}catch(e){toast("Could not save.","err")}};
  const count=el("b",{});
  for(let m=0;m<3;m++){const first=new Date(t0.getFullYear(),t0.getMonth()+m,1);const days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
    const g=el("div",{class:"cal"},["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>el("b",{},d)));
    for(let i=0;i<(first.getDay()+6)%7;i++)g.append(el("span"));
    for(let d=1;d<=days;d++){const dt=new Date(first.getFullYear(),first.getMonth(),d),s=sk(dt);const past=s<t;
      const b=el("button",{type:"button",disabled:past,"aria-pressed":"false","aria-label":fdate(s)+(busy.has(s)?", has a booking":""),class:(busy.has(s)?"busy ":"")+(s===t?"today":""),onclick:()=>{off.has(s)?off.delete(s):off.add(s);sync()}},d);btns[s]=b;g.append(b)}
    wrap.append(el("h2",{class:"day"},first.toLocaleDateString("en-IN",{month:"long",year:"numeric"})),g)}
  const quick=(label,fn)=>el("button",{class:"btn sm ghost",type:"button",onclick:()=>{fn();sync()}},label);
  const dow=(...days)=>()=>Object.keys(btns).forEach(s=>{if(!btns[s].disabled&&days.includes(new Date(s+"T00:00:00").getDay()))off.add(s)});
  sync();
  return [pageHead("Availability","Tap the dates you are NOT available. Customers cannot book you on those days.",el("button",{class:"btn",type:"button",onclick:save},"Save changes")),
    el("div",{class:"card"},el("div",{class:"legend"},el("span",{class:"lg-off"},"Day off"),el("span",{class:"lg-busy"},"Confirmed booking"),el("span",{class:"lg-today"},"Today"),count),
      el("div",{class:"acts qk"},quick("Block all Sundays",dow(0)),quick("Block all Saturdays",dow(6)),quick("Block weekends",dow(0,6)),quick("Clear all",()=>off.clear())),wrap),bar]},

async reviews(ctx){const rv=await loadReviews();const a=rv.length?rv.reduce((s,r)=>s+r.rating,0)/rv.length:0;
  const dist=[5,4,3,2,1].map(n=>[n,rv.filter(r=>r.rating===n).length]);
  const ds=el("div",{class:"dist"},dist.map(([n,c])=>el("div",{class:"dist-r"},el("span",{},n+" ★"),el("div",{class:"dist-b"},el("i",{style:`width:${rv.length?c/rv.length*100:0}%`})),el("span",{},c))));
  return [pageHead("Reviews","What customers say about you"),el("div",{class:"card"},el("div",{class:"rv-top"},el("div",{class:"rv-big"},el("b",{},a?a.toFixed(1):"New"),stars(a,rv.length),el("small",{},rv.length?rv.length+" review"+(rv.length>1?"s":""):"No reviews yet")),rv.length?ds:null),
    rv.length?rv.map(r=>el("div",{class:"rev"},el("div",{class:"rev-h"},stars(r.rating),el("b",{},r.customerName),tsMs(r.createdAt)?el("small",{},new Date(tsMs(r.createdAt)).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})):null),r.text?el("p",{},r.text):null)):empty({title:"No reviews yet",text:"Customers can rate you after a completed puja. Marking pujas as completed promptly helps."}))]},

async profile(ctx){
  const m=me||{};const locked=!!(me&&me.approved);
  const name=el("input",{value:m.name||profile.name,maxlength:80,disabled:locked}),city=el("input",{value:m.city||"",maxlength:60,placeholder:"e.g. Guwahati"}),exp=el("input",{type:"number",min:0,max:80,value:m.experience||0,inputmode:"numeric"}),
    wa=el("input",{type:"tel",inputmode:"tel",maxlength:14,value:m.whatsapp||"",placeholder:"10-digit number or with country code"}),price=el("input",{maxlength:80,value:m.price||"",placeholder:"e.g. Griha Pravesh from ₹3,100"}),bio=el("textarea",{maxlength:500,placeholder:"Your experience, traditions you follow, languages, travel radius"}),photo=el("input",{type:"url",inputmode:"url",maxlength:400,value:m.photoUrl||"",placeholder:"https://..."});bio.value=m.bio||"";
  const langs=chips(LANGS,m.languages||[],{name:"lg"}),svcs=chips(pz.map(p=>p.name),m.services||[],{name:"sv"});
  const fn=field("Display name",name,locked?"Locked after approval to protect customers. Contact support to change.":"Shown to customers."),fc=field("City",city),fw=field("WhatsApp number",wa,"Shown to customers only after you accept a booking.");
  const fl=el("div",{class:"fld"},el("label",{},"Languages you perform puja in"),langs,el("small",{class:"ferr",role:"alert"})),fs=el("div",{class:"fld"},el("label",{},"Pujas you perform"),svcs,el("small",{class:"ferr",role:"alert"}));
  const form=el("form",{class:"card",novalidate:true,onsubmit:async e=>{e.preventDefault();let ok=true;[fn,fc,fw].forEach(f=>f.classList.remove("bad"));fl.querySelector(".ferr").textContent="";fs.querySelector(".ferr").textContent="";
    if(!locked&&name.value.trim().length<2){setErr(name,"Enter your name.");ok=false}if(!city.value.trim()){setErr(city,"Enter your city.");ok=false}
    if(wa.value&&!/^\d{10,14}$/.test(digits(wa.value))){setErr(wa,"Enter a valid number.");ok=false}
    if(!langs.value().length){fl.querySelector(".ferr").textContent="Select at least one language.";ok=false}if(!svcs.value().length){fs.querySelector(".ferr").textContent="Select at least one puja.";ok=false}if(!ok)return;
    const d={name:name.value.trim(),city:city.value.trim(),languages:langs.value(),services:svcs.value(),price:price.value.trim(),experience:Math.max(0,Math.min(80,Number(exp.value)||0)),whatsapp:digits(wa.value),bio:bio.value.trim()};
    const pu=photo.value.trim()||user.photoURL||"";if(pu)d.photoUrl=pu;else if(me&&me.photoUrl)d.photoUrl="";   /* only sent when used, so profiles still save before the new rules are deployed */
    if(d.photoUrl&&!/^https:\/\/\S+$/.test(d.photoUrl)){setErr(photo,"Use a link that starts with https://");return}
    try{if(me){if(locked)delete d.name;await F.updateDoc(pref,d)}else await F.setDoc(pref,{...d,unavailable:[],approved:false,createdAt:F.serverTimestamp()});
      me=(await F.getDoc(pref)).data();toast(me.approved?"Profile saved":"Profile submitted for approval");ctx.go("home")}catch(x){toast("Could not save profile. Please check all fields.","err")}}},
    el("h2",{},me?"Edit profile":"Create your pandit profile"),!me?el("p",{class:"sub"},"Our team reviews every profile before it is shown to customers."):null,
    el("div",{class:"row2"},fn,fc),el("div",{class:"row2"},field("Years of experience",exp),fw),fl,fs,field("Price note",price,"Optional. Final price is agreed with the customer."),field("Photo link (optional)",photo,"A clear face photo shown on your public card. If you sign in with Google and leave this empty, your Google photo is used."),field("About you",bio,"At least 30 characters improves trust."),
    el("button",{class:"btn",type:"submit"},me?"Save changes":"Submit for approval"));
  const pv=el("aside",{class:"card pv"});
  const paintPv=()=>{const ls=langs.value(),sv=svcs.value();pv.replaceChildren(el("p",{class:"hint"},"Preview: how customers see you"),el("div",{class:"pan pv-c"},(/^https:\/\/\S+$/.test(photo.value.trim())?el("img",{class:"av",src:photo.value.trim(),alt:"",referrerpolicy:"no-referrer",style:"object-fit:cover;border-radius:50%"}):el("span",{class:"av","aria-hidden":"true"},initials(name.value||profile.name))),el("div",{},el("b",{},name.value||profile.name),el("small",{},`${city.value||"Your city"} · ${Number(exp.value)||0} yrs · ${ls.slice(0,3).join(", ")||"Add languages"}`))),
    bio.value?el("p",{class:"pv-bio"},bio.value):el("p",{class:"hint"},"Add a short bio so customers can trust you."),
    el("div",{class:"chipset pv-ch"},sv.slice(0,6).map(x=>el("span",{class:"tag"},x)),sv.length>6?el("span",{class:"tag"},"+"+(sv.length-6)):null),price.value?el("p",{class:"hint"},"Price note: "+price.value):null)};
  form.addEventListener("input",paintPv);form.addEventListener("change",paintPv);paintPv();
  return [pageHead("Profile","How customers see you"),el("div",{class:"prof-g"},form,pv)]}
};
const nav=[{id:"home",label:"Overview",short:"Home",icon:"home"},{id:"requests",label:"Requests",icon:"inbox",badge:true},{id:"schedule",label:"Schedule",icon:"cal"},{id:"availability",label:"Availability",short:"Days off",icon:"clock"},{id:"profile",label:"Profile",icon:"user"},{id:"reviews",label:"Reviews",icon:"star"}];
shell({title:"Pandit",nav,session:{user,profile},routes,start:"home"});
