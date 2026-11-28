import {el,db,F,boot,shell,pageHead,ic,stat,pill,toast,modal,confirmBox,empty,field,download,csvCell,fdate,ftime,tsMs,STATUS,setBadge} from "./ui.js";
const S=await boot("admin");const {user,profile}=S;const uid=user.uid;
const dt=t=>t&&t.toMillis?new Date(t.toMillis()).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}):"";
const load=async c=>(await F.getDocs(F.query(F.collection(db,c),F.limit(500)))).docs.map(d=>({id:d.id,...d.data()}));
const audit=(b,action,target,detail)=>b.set(F.doc(F.collection(db,"auditLog")),{by:uid,action,target,detail:String(detail||"").slice(0,200),createdAt:F.serverTimestamp()});
const meta=(i,t)=>el("span",{},ic(i,16),t);
async function review(p,approved,note,ctx){try{const b=F.writeBatch(db);b.update(F.doc(db,"pandits",p.id),{approved,reviewNote:note||"",reviewedAt:F.serverTimestamp()});audit(b,approved?"approve_pandit":note?"request_changes":"revoke_pandit",p.id,p.name+(note?": "+note:""));await b.commit();toast(approved?"Pandit approved and now visible to customers":note?"Changes requested":"Approval revoked");ctx.render()}catch(e){toast("Action failed.","err")}}
function panditCard(p,u,ctx,queue){
  return el("article",{class:"bk"},el("div",{class:"bk-h"},el("h3",{},p.name),el("span",{class:"pill "+(p.approved?"p-accepted":"p-pending")},p.approved?"Approved":p.reviewNote?"Changes requested":"Pending")),
    el("div",{class:"meta"},meta("pin",p.city),meta("clock",(p.experience||0)+" yrs"),meta("globe",(p.languages||[]).join(", ")),u?meta("user",u.email):null,u?meta("wa",u.phone):null,p.whatsapp?meta("wa","WhatsApp "+p.whatsapp):null),
    el("p",{},el("b",{},"Pujas: "),(p.services||[]).join(", ")),p.price?el("p",{},el("b",{},"Price note: "),p.price):null,p.bio?el("p",{class:"note"},p.bio):el("p",{class:"hint"},"No bio provided."),p.reviewNote?el("p",{class:"hint"},"Last note: "+p.reviewNote):null,
    el("div",{class:"acts"},p.approved?el("button",{class:"btn sm danger",type:"button",onclick:async()=>{if(await confirmBox("Revoke approval? "+p.name+" will disappear from customer search.","Revoke","danger"))review(p,false,"",ctx)}},"Revoke approval"):
      [el("button",{class:"btn sm ok",type:"button",onclick:()=>review(p,true,"",ctx)},ic("check",16),"Approve"),
       el("button",{class:"btn sm ghost",type:"button",onclick:async()=>{const t=el("textarea",{maxlength:300,placeholder:"What should the pandit fix? e.g. add a valid WhatsApp number and a short bio"});
         const r=await modal({title:"Request changes",body:field("Message to pandit",t,"Shown on the pandit's dashboard."),actions:[{label:"Cancel",kind:"ghost",value:false},{label:"Send",run:async()=>{if(t.value.trim().length<5){toast("Please write a short note.","err");return false}return true}}]});if(r)review(p,false,t.value.trim(),ctx)}},"Request changes")]))}

const routes={
async home(ctx){
  const [pn,bk,us]=await Promise.all([load("pandits"),load("bookings"),load("users")]);const pend=pn.filter(p=>!p.approved);setBadge("approvals",pend.length);
  const um=Object.fromEntries(us.map(u=>[u.id,u]));
  return [pageHead("Admin overview","Run Online Pujari from here"),
    pend.length?el("div",{class:"banner warn"},ic("shield",22),el("div",{},el("b",{},pend.length+" pandit profile"+(pend.length>1?"s":"")+" waiting for your approval"),el("span",{},"Pandits are hidden from customers until you approve them."),el("div",{class:"acts"},el("a",{class:"btn sm",href:"#/approvals"},"Review now")))):el("div",{class:"banner ok"},ic("check",22),el("div",{},el("b",{},"No pandit profiles waiting"),el("span",{},"You are all caught up."))),
    el("div",{class:"grid g4 keep2",style:"margin-bottom:20px"},stat("users","Customers",us.filter(u=>u.role==="customer").length),stat("shield","Approved pandits",pn.filter(p=>p.approved).length),stat("inbox","Open bookings",bk.filter(b=>["pending","accepted"].includes(b.status)).length),stat("check","Completed",bk.filter(b=>b.status==="completed").length)),
    el("section",{class:"card"},el("h2",{},"Unassigned bookings"),(()=>{const r=bk.filter(b=>!b.panditId&&b.status==="pending");return r.length?r.slice(0,5).map(b=>el("div",{class:"rev"},el("b",{},b.puja)," · "+fdate(b.date)+" · "+b.city,el("p",{},b.customerName+" · "+b.lang))).concat([el("a",{class:"btn sm",href:"#/bookings"},"Assign pandits")]):empty({title:"All bookings have a pandit",text:"Nothing to assign right now."})})())]},

async approvals(ctx){
  const [pn,us]=await Promise.all([load("pandits"),load("users")]);const um=Object.fromEntries(us.map(u=>[u.id,u]));const pend=pn.filter(p=>!p.approved);setBadge("approvals",pend.length);
  return [pageHead("Pandit approvals","Check each profile before customers can see it"),
    el("div",{class:"banner"},ic("shield",22),el("div",{},el("b",{},"What to check"),el("span",{},"Real name, working phone and WhatsApp, languages and pujas that match their experience. Call or WhatsApp them if unsure, then approve."))),
    pend.length?pend.map(p=>panditCard(p,um[p.id],ctx)):empty({title:"Nothing to approve",text:"New pandit sign-ups will appear here."})]},

async pandits(ctx){
  const [pn,us]=await Promise.all([load("pandits"),load("users")]);const um=Object.fromEntries(us.map(u=>[u.id,u]));const ap=pn.filter(p=>p.approved);
  const sync=async()=>{try{const rs=(await F.getDocs(F.query(F.collection(db,"reviews"),F.limit(500)))).docs.map(d=>d.data()),agg={};
      rs.forEach(r=>{const a=agg[r.panditId]||(agg[r.panditId]={s:0,n:0});a.s+=r.rating;a.n++});
      const b=F.writeBatch(db);let n=0;ap.forEach(p=>{const a=agg[p.id];if(a){b.update(F.doc(db,"pandits",p.id),{rating:Math.round(a.s/a.n*100)/100,reviewCount:a.n});n++}});
      if(n)await b.commit();toast(n?"Ratings updated for "+n+" pandit"+(n>1?"s":""):"No reviews to sync yet");ctx.render()}catch(e){toast("Could not sync ratings.","err")}};
  return [pageHead("Approved pandits",ap.length+" live on the site",el("button",{class:"btn ghost",type:"button",onclick:sync},ic("star",16),"Sync ratings to public cards")),ap.length?ap.map(p=>panditCard(p,um[p.id],ctx)):empty({title:"No approved pandits yet",text:"Approve a profile to publish it."})]},

async bookings(ctx){
  const [bk,pn]=await Promise.all([load("bookings"),load("pandits")]);bk.sort((a,b)=>tsMs(b.createdAt)-tsMs(a.createdAt));const ap=pn.filter(p=>p.approved);
  let tab="all",qy="";const tabs=el("div",{class:"tabs"}),list=el("div",{});const T=["all","unassigned","pending","accepted","completed","cancelled","declined"];
  const match={all:()=>true,unassigned:b=>!b.panditId&&b.status==="pending"};const f=b=>(match[tab]||(x=>x.status===tab))(b);
  const rows=()=>bk.filter(f).filter(b=>!qy||(b.puja+b.customerName+b.city+b.panditName+b.customerPhone).toLowerCase().includes(qy));
  const card=b=>{const sel=el("select",{"aria-label":"Assign pandit"},el("option",{value:""},"Unassigned"),...ap.map(p=>el("option",{value:p.id,selected:p.id===b.panditId},p.name+" ("+p.city+")")));
    const st=el("select",{"aria-label":"Status"},Object.keys(STATUS).map(s=>el("option",{value:s,selected:s===b.status},STATUS[s][0])));
    return el("article",{class:"bk"},el("div",{class:"bk-h"},el("h3",{},b.puja),pill(b.status)),el("div",{class:"meta"},meta("cal",fdate(b.date)+" · "+ftime(b.time)),meta("pin",b.mode==="online"?"Online":b.city),meta("globe",b.lang),meta("user",b.customerName),meta("wa",b.customerPhone)),el("p",{class:"hint"},b.address),
      el("div",{class:"row2"},el("div",{class:"fld"},el("label",{},"Pandit"),sel),el("div",{class:"fld"},el("label",{},"Status"),st)),
      el("div",{class:"acts"},el("button",{class:"btn sm",type:"button",onclick:async()=>{const p=ap.find(x=>x.id===sel.value);try{const w=F.writeBatch(db);w.update(F.doc(db,"bookings",b.id),{panditId:sel.value,panditName:p?p.name:"",status:st.value,updatedAt:F.serverTimestamp()});audit(w,"update_booking",b.id,`${st.value} / ${p?p.name:"unassigned"}`);await w.commit();toast("Booking updated");ctx.render()}catch(e){toast("Update failed.","err")}}},"Save")))};
  const draw=()=>{tabs.replaceChildren(...T.map(k=>el("button",{type:"button",class:k===tab?"on":"",onclick:()=>{tab=k;draw()}},k[0].toUpperCase()+k.slice(1),el("em",{},bk.filter(k==="all"?match.all:match[k]||(x=>x.status===k)).length))));const r=rows();list.replaceChildren(...(r.length?r.map(card):[empty({title:"No bookings",text:"Nothing matches this filter."})]))};
  const s=el("input",{type:"search",placeholder:"Search customer, puja, city, pandit or phone","aria-label":"Search bookings",oninput:e=>{qy=e.target.value.toLowerCase();draw()}});draw();
  return [pageHead("Bookings","Assign pandits and manage every booking",el("button",{class:"btn ghost",type:"button",onclick:()=>{const h=["Created","Puja","Date","Time","City","Language","Customer","Phone","Pandit","Status"];const l=[h.map(csvCell).join(",")].concat(rows().map(b=>[dt(b.createdAt),b.puja,b.date,b.time,b.city,b.lang,b.customerName,b.customerPhone,b.panditName,b.status].map(csvCell).join(",")));download("bookings.csv",l.join("\n"),"text/csv")}},ic("download",18),"Export CSV")),
    el("div",{class:"search"},ic("search",18),s),tabs,list]},

async users(ctx){
  const us=(await load("users")).sort((a,b)=>tsMs(b.createdAt)-tsMs(a.createdAt));let qy="";const body=el("tbody");
  const draw=()=>body.replaceChildren(...us.filter(u=>!qy||(u.name+u.email+u.phone).toLowerCase().includes(qy)).map(u=>el("tr",{},el("td",{},u.name),el("td",{},u.email),el("td",{},u.phone),el("td",{},el("span",{class:"pill "+(u.role==="pandit"?"p-accepted":"p-completed")},u.role)),el("td",{},dt(u.createdAt)))));
  const s=el("input",{type:"search",placeholder:"Search name, email or phone","aria-label":"Search users",oninput:e=>{qy=e.target.value.toLowerCase();draw()}});draw();
  return [pageHead("Users",us.length+" accounts"),el("div",{class:"search"},ic("search",18),s),el("div",{class:"card tblwrap"},el("table",{class:"tbl"},el("thead",{},el("tr",{},["Name","Email","Phone","Role","Joined"].map(h=>el("th",{},h)))),body))]},

async audit(ctx){
  const q=await F.getDocs(F.query(F.collection(db,"auditLog"),F.orderBy("createdAt","desc"),F.limit(100)));const rows=q.docs.map(d=>d.data());
  return [pageHead("Audit log","Every admin action is recorded and cannot be edited"),rows.length?el("div",{class:"card tblwrap"},el("table",{class:"tbl"},el("thead",{},el("tr",{},["When","Action","Target","Detail"].map(h=>el("th",{},h)))),el("tbody",{},rows.map(r=>el("tr",{},el("td",{},dt(r.createdAt)),el("td",{},r.action),el("td",{},r.target),el("td",{},r.detail)))))):empty({title:"No actions yet",text:"Approvals and booking changes will be logged here."})]}
};
shell({title:"Admin",nav:[{id:"home",label:"Overview",short:"Home",icon:"chart"},{id:"approvals",label:"Approvals",icon:"shield",badge:true},{id:"pandits",label:"Pandits",icon:"users"},{id:"bookings",label:"Bookings",icon:"list"},{id:"users",label:"Users",icon:"user"},{id:"audit",label:"Audit log",icon:"log"}],session:{profile},routes,start:"home"});
