import {usesPassword,changePassword,resetPassword,authMsg,sendVerify} from "./auth.js";
import {firstName,greet,copyText,countdown,festivals,SUPPORT,el,db,F,waLink,boot,shell,pageHead,ic,stat,pill,stars,toast,modal,confirmBox,empty,field,setErr,chips,download,ics,money,fdate,ftime,tsMs,todayStr,rel,daysUntil,initials,pujas,ratings,avg,LANGS,STATUS} from "./ui.js";
const S=await boot("customer");const {user,profile}=S;
const uid=user.uid;
const TIMES=[["Early morning","06:00"],["Morning","09:00"],["Afternoon","13:00"],["Evening","17:00"]];
let cache={};
const loadBookings=async()=>{const q=await F.getDocs(F.query(F.collection(db,"bookings"),F.where("customerId","==",uid),F.limit(200)));return q.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>tsMs(b.createdAt)-tsMs(a.createdAt))};
const loadPandits=async()=>{const q=await F.getDocs(F.query(F.collection(db,"pandits"),F.where("approved","==",true),F.limit(200)));return q.docs.map(d=>({id:d.id,...d.data()}))};
const loadFavs=async()=>{try{return (await F.getDocs(F.collection(db,"users",uid,"favs"))).docs.map(d=>d.id)}catch(e){return[]}};
const toggleFav=async(p,favs)=>{const r=F.doc(db,"users",uid,"favs",p.id);if(favs.includes(p.id)){await F.deleteDoc(r);favs.splice(favs.indexOf(p.id),1);toast("Removed from favourites")}else{await F.setDoc(r,{panditId:p.id,name:p.name,createdAt:F.serverTimestamp()});favs.push(p.id);toast("Saved to favourites")}};
const meta=(icn,t)=>el("span",{},ic(icn,16),t);

/* ---------- booking card ---------- */
function bookingCard(b,ctx,{reviewed,onChange}){
  const stop=["declined","cancelled"].includes(b.status);const order=["pending","accepted","completed"];const at=order.indexOf(b.status);
  const tl=el("div",{class:"tl"+(stop?" stop":""),"aria-label":"Booking progress"},
    el("span",{class:"on"},"Requested"),el("i",{class:at>=1?"on":""}),el("span",{class:at>=1?"on":""},"Confirmed"),el("i",{class:at>=2?"on":""}),el("span",{class:at>=2?"on":""},stop?STATUS[b.status][0]:"Completed"));
  const acts=[];
  if(b.status==="accepted"&&b.panditId){const p=(cache.pandits||[]).find(x=>x.id===b.panditId);const w=p&&waLink(p.whatsapp,`Namaste ${p.name}, this is ${profile.name} about my ${b.puja} on ${fdate(b.date)} at ${ftime(b.time)}.`);if(w)acts.push(el("a",{class:"btn sm ok",href:w,target:"_blank",rel:"noopener noreferrer"},ic("wa",16),"WhatsApp pandit"))}
  if(["pending","accepted"].includes(b.status))acts.push(el("button",{class:"btn sm ghost",type:"button",onclick:()=>download(`puja-${b.date}.ics`,ics(b),"text/calendar")},ic("cal",16),"Add to calendar"));
  acts.push(el("button",{class:"btn sm ghost",type:"button",onclick:()=>copyText(`${b.puja}\n${fdate(b.date)} at ${ftime(b.time)}\n${b.mode==="online"?"Online":b.city+", "+b.address}\nLanguage: ${b.lang}\nPandit: ${b.panditName||"to be assigned"}\nStatus: ${STATUS[b.status]?.[0]||b.status}`)},ic("copy",16),"Copy details"));
  if(b.status==="pending")acts.push(el("button",{class:"btn sm ghost",type:"button",onclick:()=>editModal(b,onChange)},ic("edit",16),"Edit"));
  if(["pending","accepted"].includes(b.status))acts.push(el("button",{class:"btn sm ghost",type:"button",onclick:async()=>{if(!await confirmBox("Cancel this booking? The pandit will be notified.","Cancel booking","danger"))return;
    try{await F.updateDoc(F.doc(db,"bookings",b.id),{status:"cancelled",updatedAt:F.serverTimestamp()});toast("Booking cancelled");onChange()}catch(e){toast("Could not cancel. Please refresh.","err")}}},ic("x",16),"Cancel"));
  if(b.status==="completed"&&b.panditId&&!reviewed.has(b.id))acts.push(el("button",{class:"btn sm gold",type:"button",onclick:()=>reviewModal(b,onChange)},ic("star",16),"Rate your pandit"));
  if(["completed","cancelled","declined"].includes(b.status))acts.push(el("button",{class:"btn sm ghost",type:"button",onclick:()=>ctx.go("book?again="+b.id)},ic("plus",16),"Book again"));
  return el("article",{class:"bk"},el("div",{class:"bk-h"},el("h3",{},b.puja),pill(b.status)),
    el("div",{class:"meta"},meta("cal",fdate(b.date)+" · "+ftime(b.time)),meta("pin",b.mode==="online"?"Online (video)":b.city),meta("globe",b.lang),meta("user",b.panditName||"Pandit to be assigned")),
    b.status!=="cancelled"&&b.status!=="declined"&&daysUntil(b.date)>=0?el("div",{class:"meta"},el("b",{},rel(b.date))):null,
    tl,b.panditNote?el("p",{class:"note"},el("b",{},"Note from pandit: "),b.panditNote):null,b.notes?el("p",{class:"hint"},"Your notes: "+b.notes):null,acts.length?el("div",{class:"acts"},acts):null)}

function editModal(b,done){
  const date=el("input",{type:"date",min:todayStr(),value:b.date,required:true}),time=el("input",{type:"time",value:b.time,required:true}),city=el("input",{value:b.city,maxlength:60}),
    lang=el("select",{},LANGS.map(l=>el("option",{value:l,selected:l===b.lang},l))),addr=el("textarea",{maxlength:300},b.address),notes=el("textarea",{maxlength:500},b.notes||"");
  addr.value=b.address;notes.value=b.notes||"";
  modal({title:"Edit booking",wide:true,body:el("div",{},el("p",{class:"hint"},"You can edit while the pandit has not confirmed yet."),el("div",{class:"row2"},field("Date",date),field("Time",time),field("City",city),field("Language",lang)),field("Address",addr),field("Notes",notes)),
    actions:[{label:"Close",kind:"ghost",value:false},{label:"Save changes",run:async()=>{
      if(!date.value||date.value<todayStr()){toast("Please pick a future date.","err");return false}
      if(!city.value.trim()||!addr.value.trim()){toast("City and address are required.","err");return false}
      try{await F.updateDoc(F.doc(db,"bookings",b.id),{date:date.value,time:time.value,city:city.value.trim(),lang:lang.value,address:addr.value.trim(),notes:notes.value.trim(),updatedAt:F.serverTimestamp()});toast("Booking updated");done();return true}catch(e){toast("Could not save changes.","err");return false}}}]})}

function reviewModal(b,done){
  let r=0;const text=el("textarea",{maxlength:300,placeholder:"How was the puja? (optional)"});
  const g=el("fieldset",{class:"starin"},el("legend",{class:"hint"},"Your rating"));
  [1,2,3,4,5].forEach(n=>{const id="st"+n;g.append(el("input",{type:"radio",name:"rt",id,value:n,onchange:()=>r=n}),el("label",{for:id,title:n+" star"},ic("star",32)))});
  modal({title:"Rate "+(b.panditName||"your pandit"),body:el("div",{},g,field("Review",text)),actions:[{label:"Later",kind:"ghost",value:false},{label:"Submit review",run:async()=>{
    if(!r){toast("Please choose a star rating.","err");return false}
    try{await F.setDoc(F.doc(db,"reviews",b.id),{bookingId:b.id,panditId:b.panditId,customerId:uid,customerName:b.customerName,rating:r,text:text.value.trim(),createdAt:F.serverTimestamp()});toast("Thank you for your review!");done();return true}catch(e){toast("Could not submit review.","err");return false}}}]})}

/* ---------- views ---------- */
const routes={
async home(ctx){
  const [bks,pz,pandits,fs]=await Promise.all([loadBookings(),pujas(),loadPandits(),festivals()]);cache.pandits=pandits;
  const t=todayStr(),first=firstName(profile.name);
  const up=bks.filter(b=>["pending","accepted"].includes(b.status)&&b.date>=t).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  const next=up[0],last=bks.find(b=>b.status!=="cancelled");
  const hero=el("section",{class:"card hero-card"},next?el("div",{},el("p",{class:"muted"},"Your next puja"),el("h2",{class:"big"},next.puja),
      el("p",{},`${fdate(next.date)} at ${ftime(next.time)} · ${rel(next.date)}`),el("p",{class:"count"},ic("clock",18),"Starts in "+countdown(next.date,next.time)),
      el("p",{class:"muted"},(next.panditName?"With "+next.panditName:"Pandit will be assigned soon")+" · "+STATUS[next.status][0]),
      el("div",{class:"acts"},el("a",{class:"btn gold",href:"#/bookings"},"View details"),el("button",{class:"btn ghost",type:"button",onclick:()=>download(`puja-${next.date}.ics`,ics(next),"text/calendar")},ic("cal",16),"Add to calendar"),el("a",{class:"btn ghost",href:"#/book"},"Book another"))):
    el("div",{},el("p",{class:"muted"},greet()),el("h2",{class:"big"},"Namaste, "+first+" 🙏"),el("p",{class:"muted"},"Ready to plan your next puja? Pick a ceremony, date and language. We confirm the pandit and muhurat before you pay."),el("div",{class:"acts"},el("a",{class:"btn gold",href:"#/book"},ic("plus",18),"Book a puja"))));
  const wa=waLink(SUPPORT.wa,`Namaste, I am ${profile.name}. I need help with a puja booking.`);
  const qa=(icn,t1,t2,href,ext)=>el("a",{class:"qa",href,...(ext?{target:"_blank",rel:"noopener noreferrer"}:{})},el("span",{class:"stat-i"},ic(icn)),el("div",{},el("b",{},t1),el("small",{},t2)));
  const actions=el("div",{class:"grid g3 qas"},qa("plus","Book a puja","Choose puja, date, language","#/book"),last?qa("log","Book again","Repeat "+last.puja,"#/book?again="+last.id):qa("list","My bookings","Track every request","#/bookings"),qa("wa","Talk to us","Get help on WhatsApp",wa||"#/help",!!wa));
  const stats=el("div",{class:"grid g4 keep2",style:"margin-bottom:20px"},stat("clock","Awaiting pandit",bks.filter(b=>b.status==="pending").length),stat("check","Confirmed",bks.filter(b=>b.status==="accepted").length),stat("star","Completed",bks.filter(b=>b.status==="completed").length),stat("list","All bookings",bks.length));
  const need=[];if(!profile.city)need.push("default city");if(!profile.address)need.push("default address");
  const nudge=need.length&&bks.length<3?el("div",{class:"banner warn"},ic("edit",22),el("div",{},el("b",{},"Book faster next time"),el("span",{},"Add your "+need.join(" and ")+" once and we prefill every booking."),el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/profile"},"Update profile")))):null;
  const FM=[[/ganesh/i,"Ganesh Puja"],[/lakshmi|diwali|dhanteras/i,"Lakshmi Puja"],[/shivaratri|mahashivratri/i,"Rudrabhishek Puja"],[/shradh|pitru/i,"Shradh and Pitru Puja"],[/navratri/i,"Kaal Sarp Dosh Puja"]];
  const fp=f=>{const m=FM.find(([r])=>r.test(f.name));const p=m&&pz.find(x=>x.name===m[1]);return p?"#/book?puja="+p.slug:"#/book"};
  const fest=fs.length?el("section",{class:"card"},el("h2",{},"Upcoming festivals"),el("p",{class:"sub"},"Pandits fill up fast in festival weeks. Plan ahead."),
    el("ul",{class:"fest-l"},fs.slice(0,3).map(f=>el("li",{},el("time",{},el("b",{},new Date(f.date+"T00:00:00").getDate()),el("span",{},new Date(f.date+"T00:00:00").toLocaleDateString("en-IN",{month:"short"}))),el("div",{},el("b",{},f.name),el("small",{},rel(f.date)+" · "+f.note)),el("a",{class:"btn sm ghost",href:fp(f)},"Book")))) ):null;
  const booked=new Set(bks.map(b=>b.puja));const sugg=pz.filter(p=>!booked.has(p.name)).slice(0,4);
  const popular=el("section",{class:"card"},el("h2",{},bks.length?"Suggested for you":"Popular pujas"),el("div",{class:"puja-grid"},sugg.map(p=>el("a",{class:"pc",href:"#/book?puja="+p.slug,style:"text-decoration:none"},el("span",{class:"hi"},p.hi),el("b",{},p.name),el("small",{},p.dur),el("span",{class:"pr"},"From "+money(p.price))))));
  const recent=el("section",{class:"card"},el("div",{class:"card-h"},el("h2",{},"Recent activity"),bks.length>3?el("a",{href:"#/bookings"},"See all"):null),bks.length?bks.slice(0,3).map(b=>bookingCard(b,ctx,{reviewed:new Set(),onChange:()=>ctx.render()})):empty({title:"No bookings yet",text:"Your bookings will appear here with live status updates.",action:el("a",{class:"btn",href:"#/book"},"Book your first puja")}));
  return [pageHead("Home",greet()+", "+first),hero,actions,nudge,stats,el("div",{class:"grid g2 top"},fest,popular),recent]},

async book(ctx,q){
  const [pz,pandits,rt,favs,bks]=await Promise.all([pujas(),loadPandits(),ratings(),loadFavs(),q.again?loadBookings():Promise.resolve([])]);cache.pandits=pandits;
  const again=bks.find(b=>b.id===q.again);
  const d={puja:q.puja?pz.find(p=>p.slug===q.puja)?.name||"":again?.puja||"",mode:again?.mode||"home",date:"",time:"09:00",lang:again?.lang||(profile.lang||"Hindi"),city:again?.city||profile.city||"",samagri:again?.samagri||"pandit_only",panditId:"",panditName:"",address:again?.address||profile.address||"",notes:""};
  let step=d.puja?2:1;const box=el("div",{});
  const labels=["Puja","Details","Pandit","Confirm"];
  const bar=()=>el("ol",{class:"steps","aria-label":"Booking steps"},labels.map((l,i)=>el("li",{"data-n":i+1,class:i+1===step?"on":i+1<step?"done":"","aria-current":i+1===step?"step":null},l)));
  const pujaObj=()=>pz.find(p=>p.name===d.puja);
  function draw(){let body;
    if(step===1)body=s1();else if(step===2)body=s2();else if(step===3)body=s3();else body=s4();
    box.replaceChildren(bar(),body);box.scrollIntoView({block:"start",behavior:"smooth"})}
  const nav=(next,back,nextLabel="Continue")=>el("div",{class:"wiz-nav"},back?el("button",{class:"btn ghost",type:"button",onclick:back},ic("back",18),"Back"):el("span"),el("button",{class:"btn",type:"button",onclick:next},nextLabel,ic("chev",18)));
  function s1(){const grid=el("div",{class:"puja-grid"});
    const paint=v=>{const q=v.trim().toLowerCase();const r=pz.filter(p=>!q||(p.name+" "+p.hi+" "+p.short).toLowerCase().includes(q));
      grid.replaceChildren(...(r.length?r.map(p=>el("button",{class:"pc",type:"button","aria-pressed":String(d.puja===p.name),onclick:()=>{d.puja=p.name;step=2;draw()}},el("span",{class:"hi"},p.hi),el("b",{},p.name),el("small",{},p.short),el("span",{class:"pr"},"From "+money(p.price)+" · "+p.dur))):[el("p",{class:"hint"},"No puja matches that. Choose \"Other puja\" or message us on WhatsApp.")]))};
    const si=el("input",{type:"search",placeholder:"Search pujas, e.g. Griha Pravesh","aria-label":"Search pujas",oninput:e=>paint(e.target.value)});paint("");
    return el("section",{class:"card"},el("h2",{},"Which puja do you need?"),el("div",{class:"search"},ic("search",18),si),grid)}
  function s2(){
    const date=el("input",{type:"date",min:todayStr(),value:d.date,required:true}),time=el("input",{type:"time",value:d.time}),city=el("input",{value:d.city,maxlength:60,placeholder:"e.g. Guwahati",autocomplete:"address-level2"}),
      lang=el("select",{},LANGS.map(l=>el("option",{value:l,selected:l===d.lang},l)));
    const mode=chips(["At my home or venue","Online (video)"],[d.mode==="online"?"Online (video)":"At my home or venue"],{single:true,name:"mode"});
    const sam=chips(["Pandit only","Pandit with samagri kit"],[d.samagri==="with_samagri"?"Pandit with samagri kit":"Pandit only"],{single:true,name:"sam"});
    const slots=el("div",{class:"chipset"},TIMES.map(([l,v])=>{const id="sl"+v.replace(":","");return el("span",{class:"chip-i slot"},el("input",{type:"radio",name:"slot",id,value:v,checked:d.time===v,onchange:()=>time.value=v}),el("label",{for:id},el("span",{},l),el("small",{},ftime(v))))}));
    const fD=field("Date of puja",date,"Pick the date you would like. Not sure? Choose any date and note it below; we will suggest a muhurat."),fC=field("City",city);
    return el("section",{class:"card"},el("h2",{},d.puja),el("p",{class:"sub"},"Tell us when, where and in which language."),
      el("div",{class:"fld"},el("label",{},"How should the puja happen?"),mode),el("div",{class:"row2"},fD,field("Language",lang)),
      el("div",{class:"fld"},el("label",{},"Preferred time"),slots),field("Exact time (optional)",time),fC,el("div",{class:"fld"},el("label",{},"Samagri"),sam),
      nav(()=>{let ok=true;setErr(date,"");setErr(city,"");if(!date.value||date.value<todayStr()){setErr(date,"Please choose today or a future date.");ok=false}
        const online=mode.value()[0]==="Online (video)";if(!online&&!city.value.trim()){setErr(city,"Please enter your city.");ok=false}if(online&&!city.value.trim())city.value="Online";if(!ok)return;
        Object.assign(d,{date:date.value,time:time.value||"09:00",lang:lang.value,city:city.value.trim(),mode:online?"online":"home",samagri:sam.value()[0]==="Pandit with samagri kit"?"with_samagri":"pandit_only"});d.panditId="";d.panditName="";step=3;draw()},()=>{step=1;draw()}))}
  function s3(){
    const p0=pujaObj();const lc=d.city.toLowerCase();
    let list=pandits.filter(p=>(p.services||[]).includes(d.puja)&&(p.languages||[]).includes(d.lang)&&(d.mode==="online"||!lc||p.city.toLowerCase().includes(lc)||lc.includes(p.city.toLowerCase())));
    list.sort((a,b)=>(favs.includes(b.id)-favs.includes(a.id))||avg(rt,b.id)-avg(rt,a.id));
    const card=p=>{const off=(p.unavailable||[]).includes(d.date);const sel=d.panditId===p.id;
      return el("div",{class:"pan"+(off?" off":""),"aria-pressed":String(sel)},el("span",{class:"av","aria-hidden":"true"},initials(p.name)),
        el("div",{},el("b",{},p.name),stars(avg(rt,p.id),rt[p.id]?.n||0),el("small",{},`${p.city} · ${p.experience||0} yrs · ${(p.languages||[]).slice(0,3).join(", ")}`),off?el("small",{style:"color:var(--bad);display:block"},"Not available on "+fdate(d.date)):null),
        el("button",{class:"icon-btn",type:"button","aria-label":favs.includes(p.id)?"Remove from favourites":"Save to favourites",style:"color:"+(favs.includes(p.id)?"var(--bad)":"var(--mut)"),onclick:async()=>{await toggleFav(p,favs);draw()}},ic("heart")),
        el("button",{class:"btn sm"+(sel?" ok":" ghost"),type:"button",disabled:off,onclick:()=>{d.panditId=sel?"":p.id;d.panditName=sel?"":p.name;draw()}},sel?"Selected":"Choose"))};
    return el("section",{class:"card"},el("h2",{},"Choose your pandit"),el("p",{class:"sub"},`Pandits who perform ${d.puja} in ${d.lang}${d.mode==="online"?"":" near "+d.city}. Or let us assign the best match.`),
      el("div",{class:"pan","aria-pressed":String(!d.panditId)},el("span",{class:"av","aria-hidden":"true"},ic("shield")),el("div",{},el("b",{},"Let Online Pujari assign"),el("small",{},"Recommended. We match language, city and availability.")),el("button",{class:"btn sm"+(!d.panditId?" ok":" ghost"),type:"button",onclick:()=>{d.panditId="";d.panditName="";draw()}},!d.panditId?"Selected":"Choose")),
      list.length?list.map(card):el("p",{class:"empty"},"No listed pandit matches yet. We will assign one for you."),
      nav(()=>{step=4;draw()},()=>{step=2;draw()}))}
  function s4(){
    const p=pujaObj();const addr=el("textarea",{maxlength:300,placeholder:d.mode==="online"?"Online puja: add your video call app (e.g. WhatsApp, Zoom)":"House no., street, area, landmark, PIN"},d.address);addr.value=d.mode==="online"&&!d.address?"Online (video)":d.address;
    const notes=el("textarea",{maxlength:500,placeholder:"Gotra, family traditions, items already at home, anything we should know"});notes.value=d.notes;
    const fa=field(d.mode==="online"?"Contact details":"Full address",addr);
    const sum=el("div",{class:"sum"},el("dl",{},[["Puja",d.puja],["When",fdate(d.date)+" at "+ftime(d.time)],["Mode",d.mode==="online"?"Online (video)":"At "+d.city],["Language",d.lang],["Samagri",d.samagri==="with_samagri"?"Pandit with kit":"Pandit only"],["Pandit",d.panditName||"Assigned by Online Pujari"],["Estimate",p?"From "+money(p.price)+" (final price confirmed before you pay)":"-"]].flatMap(([k,v])=>[el("dt",{},k),el("dd",{},v)])));
    const btn=el("button",{class:"btn",type:"button"},"Send booking request");
    btn.onclick=async()=>{setErr(addr,"");if(!addr.value.trim()){setErr(addr,"Please add your address or contact details.");return}
      btn.disabled=true;const data={customerId:uid,customerName:profile.name,customerPhone:profile.phone,puja:d.puja,date:d.date,time:d.time,city:d.city,lang:d.lang,address:addr.value.trim(),notes:notes.value.trim(),mode:d.mode,samagri:d.samagri,panditId:d.panditId,panditName:d.panditName,status:"pending",createdAt:F.serverTimestamp(),updatedAt:F.serverTimestamp()};
      try{const b=F.writeBatch(db);b.set(F.doc(F.collection(db,"bookings")),data);b.update(F.doc(db,"users",uid),{lastBookingAt:F.serverTimestamp()});await b.commit();toast("Booking request sent!");ctx.go("bookings")}
      catch(e){btn.disabled=false;toast(e.code==="permission-denied"?"Could not send. Please wait 30 seconds between bookings and check the pandit is still available on that date.":"Could not send your request. Please try again.","err")}};
    return el("section",{class:"card"},el("h2",{},"Review and confirm"),el("p",{class:"sub"},"No payment now. We confirm the pandit and muhurat first."),sum,el("div",{style:"margin-top:18px"},fa,field("Notes (optional)",notes)),
      el("div",{class:"wiz-nav"},el("button",{class:"btn ghost",type:"button",onclick:()=>{d.address=addr.value;d.notes=notes.value;step=3;draw()}},ic("back",18),"Back"),btn))}
  draw();return [pageHead("Book a puja","Four quick steps. No payment until confirmation."),box]},

async bookings(ctx){
  const [bks,rt,pandits]=await Promise.all([loadBookings(),ratings(),loadPandits()]);cache.pandits=pandits;
  const reviewed=new Set(Object.values(rt).flatMap(x=>x.list).filter(r=>r.customerId===uid).map(r=>r.id));
  let tab="all",qy="",sort="new";const t=todayStr();
  const F_={all:()=>true,upcoming:b=>["pending","accepted"].includes(b.status)&&b.date>=t,pending:b=>b.status==="pending",completed:b=>b.status==="completed",cancelled:b=>["cancelled","declined"].includes(b.status)};
  const tabs=el("div",{class:"tabs",role:"tablist"}),list=el("div",{});
  const draw=()=>{tabs.replaceChildren(...Object.keys(F_).map(k=>el("button",{type:"button",role:"tab","aria-selected":String(k===tab),class:k===tab?"on":"",onclick:()=>{tab=k;draw()}},k[0].toUpperCase()+k.slice(1),el("em",{},bks.filter(F_[k]).length))));
    const rows=bks.filter(F_[tab]).filter(b=>!qy||(b.puja+(b.panditName||"")+b.city).toLowerCase().includes(qy)).sort((a,b)=>{if(sort!=="soon")return 0;const ua=a.date>=t,ub=b.date>=t;return ua!==ub?(ua?-1:1):ua?a.date.localeCompare(b.date)||a.time.localeCompare(b.time):b.date.localeCompare(a.date)});
    list.replaceChildren(...(rows.length?rows.map(b=>bookingCard(b,ctx,{reviewed,onChange:()=>ctx.render()})):[empty({title:bks.length?"Nothing here":"No bookings yet",text:bks.length?"Try another filter.":"Book your first puja in under two minutes.",action:el("a",{class:"btn",href:"#/book"},"Book a puja")})]))};
  const s=el("input",{type:"search",placeholder:"Search by puja, pandit or city","aria-label":"Search bookings",oninput:e=>{qy=e.target.value.toLowerCase();draw()}});draw();
  const so=el("select",{"aria-label":"Sort bookings",onchange:e=>{sort=e.target.value;draw()}},el("option",{value:"new"},"Newest first"),el("option",{value:"soon"},"Upcoming pujas first"));
  return [pageHead("My bookings","Track, edit and review your pujas",el("a",{class:"btn",href:"#/book"},ic("plus",18),"New booking")),el("div",{class:"toolbar"},el("div",{class:"search"},ic("search",18),s),so),tabs,list]},

async favs(ctx){
  const [pandits,rt,favs]=await Promise.all([loadPandits(),ratings(),loadFavs()]);
  const mine=pandits.filter(p=>favs.includes(p.id));
  return [pageHead("Favourite pandits","Quickly rebook pandits you trust"),mine.length?mine.map(p=>el("div",{class:"pan"},el("span",{class:"av","aria-hidden":"true"},initials(p.name)),el("div",{},el("b",{},p.name),stars(avg(rt,p.id),rt[p.id]?.n||0),el("small",{},`${p.city} · ${p.experience||0} yrs · ${(p.languages||[]).join(", ")}`)),
    el("button",{class:"btn sm ghost",type:"button",onclick:async()=>{await toggleFav(p,favs);ctx.render()}},"Remove"))):empty({title:"No favourites yet",text:"Tap the heart on a pandit while booking to save them here.",action:el("a",{class:"btn",href:"#/book"},"Start a booking")})]},

async profile(ctx){
  const name=el("input",{value:profile.name,maxlength:80,autocomplete:"name"}),phone=el("input",{value:profile.phone,type:"tel",inputmode:"tel",maxlength:14,autocomplete:"tel"}),
    city=el("input",{value:profile.city||"",maxlength:60,placeholder:"Default city for bookings"}),addr=el("textarea",{maxlength:300,placeholder:"Default address for home pujas"});addr.value=profile.address||"";
  const fn=field("Full name",name),fp=field("Mobile number",phone);
  const form=el("form",{class:"card",novalidate:true,onsubmit:async e=>{e.preventDefault();setErr(name,"");setErr(phone,"");let ok=true;
    if(name.value.trim().length<2){setErr(name,"Please enter your name.");ok=false}if(!/^[0-9+ ]{10,14}$/.test(phone.value.trim())){setErr(phone,"Enter 10 to 14 digits.");ok=false}if(!ok)return;
    try{const u={name:name.value.trim(),phone:phone.value.trim(),city:city.value.trim(),address:addr.value.trim(),updatedAt:F.serverTimestamp()};await F.updateDoc(F.doc(db,"users",uid),u);Object.assign(profile,u);toast("Profile saved")}catch(x){toast("Could not save your profile.","err")}}},
    el("h2",{},"Your details"),el("div",{class:"row2"},fn,fp),el("div",{class:"row2"},field("Default city",city),el("div",{class:"fld"},el("label",{},"Email"),el("input",{value:profile.email,readonly:true,"aria-readonly":"true"}),el("small",{class:"hint"},"Your sign-in email. It cannot be changed here."))),field("Default address",addr,"Prefilled when you book."),el("button",{class:"btn",type:"submit"},"Save profile"));
  const pwMode=usesPassword(user),verified=user.emailVerified;
  const cur=el("input",{type:"password",autocomplete:"current-password",maxlength:128}),nw=el("input",{type:"password",autocomplete:"new-password",maxlength:128}),cf=el("input",{type:"password",autocomplete:"new-password",maxlength:128});
  const pwForm=pwMode?el("form",{novalidate:true,onsubmit:async e=>{e.preventDefault();[cur,nw,cf].forEach(i=>setErr(i,""));let ok=true;
      if(!cur.value){setErr(cur,"Enter your current password.");ok=false}
      if(nw.value.length<8||!/[A-Za-z]/.test(nw.value)||!/\d/.test(nw.value)){setErr(nw,"Use at least 8 characters with a letter and a number.");ok=false}
      if(cf.value!==nw.value){setErr(cf,"Passwords do not match.");ok=false}if(!ok)return;
      try{await changePassword(cur.value,nw.value);[cur,nw,cf].forEach(i=>i.value="");toast("Password changed")}catch(x){if(x.code==="auth/invalid-credential"||x.code==="auth/wrong-password")setErr(cur,"Current password is not correct.");else toast(authMsg(x),"err")}}},
    field("Current password",cur),el("div",{class:"row2"},field("New password",nw),field("Confirm new password",cf)),
    el("div",{class:"acts"},el("button",{class:"btn",type:"submit"},"Change password"),el("button",{class:"btn ghost",type:"button",onclick:async()=>{try{await resetPassword(user.email);toast("Reset link sent to "+user.email)}catch(x){toast(authMsg(x),"err")}}},"Email me a reset link"))):null;
  const sec=el("section",{class:"card"},el("h2",{},"Security"),
    el("ul",{class:"kv"},el("li",{},el("span",{},"Sign-in method"),el("b",{},pwMode?"Email and password":"Google")),el("li",{},el("span",{},"Email"),el("b",{},user.email+(verified?" ✓ verified":" (not verified)"))),el("li",{},el("span",{},"Auto sign-out"),el("b",{},"After 30 minutes of inactivity"))),
    !verified&&pwMode?el("div",{class:"acts"},el("button",{class:"btn sm ghost",type:"button",onclick:async()=>{try{await sendVerify(user);toast("Verification email sent")}catch(x){toast("Please wait a minute and try again.","err")}}},ic("mail",16),"Send verification email")):null,
    pwForm,el("p",{class:"hint"},"Only you and the pandit assigned to a booking can see its details."),
    el("div",{class:"acts"},el("button",{class:"btn ghost",type:"button",onclick:async()=>{const {logout}=await import("./auth.js");logout()}},ic("out",16),"Log out")));
  return [pageHead("Profile","Manage your details"),form,sec]},
async help(ctx){
  const wa=waLink(SUPPORT.wa,`Namaste, I am ${profile.name}. I need help with a puja booking.`);
  const Q=[["How does booking work?","Choose a puja, date and language. We confirm a verified pandit and the muhurat, then you pay only after confirmation. You can follow every step under My bookings."],
   ["What do the booking statuses mean?","Awaiting pandit: your request is sent. Confirmed: a pandit accepted. Completed: the puja is done and you can rate it. Declined or Cancelled: the booking will not go ahead; you can book again in one tap."],
   ["Can I change or cancel a booking?","You can edit date, time, city, language and address while the booking is still awaiting a pandit. You can cancel any time before the puja; the pandit is notified."],
   ["When do I pay?","Not at the time of booking. We confirm the pandit, muhurat and final price first, then you pay."],
   ["Who sees my phone number and address?","Only you, the pandit you are matched with, and our team. A pandit sees your phone and full address only after accepting."],
   ["What if my pandit does not respond?","Message us on WhatsApp and we will assign another verified pandit for the same date."],
   ["I forgot my password","Sign out, open the login page and choose Forgot password. You can also send yourself a reset link from your Profile."]];
  return [pageHead("Help","Answers and a human on WhatsApp"),
    el("section",{class:"card"},el("h2",{},"Talk to us"),el("p",{class:"sub"},"We usually reply within a few hours."),el("div",{class:"acts"},wa?el("a",{class:"btn ok",href:wa,target:"_blank",rel:"noopener noreferrer"},ic("wa",18),"WhatsApp"):null,el("a",{class:"btn ghost",href:"mailto:"+SUPPORT.email},ic("mail",18),SUPPORT.email),el("a",{class:"btn ghost",href:"tel:"+SUPPORT.phone.replace(/\s/g,"")},SUPPORT.phone))),
    el("section",{class:"card"},el("h2",{},"Common questions"),el("div",{class:"faq"},Q.map(([q,a],i)=>el("details",{open:i===0},el("summary",{},q),el("p",{},a)))))]}
};
shell({title:"Customer",nav:[{id:"home",label:"Home",icon:"home"},{id:"book",label:"Book a puja",short:"Book",icon:"plus"},{id:"bookings",label:"My bookings",short:"Bookings",icon:"list"},{id:"favs",label:"Favourites",short:"Saved",icon:"heart"},{id:"profile",label:"Profile",icon:"user"},{id:"help",label:"Help",icon:"help"}],session:{user,profile:{...profile,email:profile.email}},routes,start:"home"});
