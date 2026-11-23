import {db,F,el,$,notice,requireUser,badge,fmtDate,tsMs} from "./auth.js";
await requireUser({allow:({isAdmin})=>isAdmin});
const app=$("#app");
let pandits=[],bookings=[],view="pandits";
const tabs=el("div",{class:"tabs"}),body=el("div",{});
[["pandits","Pandits"],["bookings","All bookings"]].forEach(([k,t])=>tabs.append(el("button",{type:"button","data-k":k,class:k===view?"on":"",onclick:()=>{view=k;[...tabs.children].forEach(b=>b.classList.toggle("on",b.dataset.k===k));render()}},t)));
async function load(){
  const [p,b]=await Promise.all([F.getDocs(F.query(F.collection(db,"pandits"),F.limit(300))),F.getDocs(F.query(F.collection(db,"bookings"),F.limit(300)))]);
  pandits=p.docs.map(d=>({id:d.id,...d.data()}));
  bookings=b.docs.map(d=>({id:d.id,...d.data()})).sort((a,c)=>tsMs(c.createdAt)-tsMs(a.createdAt));render();
}
const approve=async(p,val)=>{try{await F.updateDoc(F.doc(db,"pandits",p.id),{approved:val});load()}catch(e){notice("Failed.","err")}};
function pCard(p){return el("div",{class:"bk"},el("h3",{},p.name,el("span",{class:"badge "+(p.approved?"b-accepted":"b-pending")},p.approved?"Approved":"Pending")),
  el("p",{},`${p.city} · ${p.experience||0} yrs · ${(p.languages||[]).join(", ")}`),el("p",{},"Pujas: "+(p.services||[]).join(", ")),p.bio?el("p",{},p.bio):null,
  el("div",{class:"acts"},p.approved?el("button",{class:"btn sm danger",onclick:()=>approve(p,false)},"Revoke"):el("button",{class:"btn sm ok",onclick:()=>approve(p,true)},"Approve")))}
function bCard(b){
  const sel=el("select",{},el("option",{value:""},"— unassigned —"),...pandits.filter(p=>p.approved).map(p=>el("option",{value:p.id,selected:p.id===b.panditId},`${p.name} (${p.city})`)));
  const st=el("select",{},...["pending","accepted","declined","completed","cancelled"].map(s=>el("option",{value:s,selected:s===b.status},s)));
  return el("div",{class:"bk"},el("h3",{},b.puja,badge(b.status)),el("p",{},`${fmtDate(b.date)} ${b.time} · ${b.city} · ${b.lang}`),el("p",{},`Customer: ${b.customerName} · ${b.customerPhone}`),el("p",{},"Address: "+b.address),
    el("div",{class:"row2"},el("div",{},el("label",{class:"f"},"Assign pandit"),sel),el("div",{},el("label",{class:"f"},"Status"),st)),
    el("div",{class:"acts"},el("button",{class:"btn sm",onclick:async()=>{const p=pandits.find(x=>x.id===sel.value);
      try{await F.updateDoc(F.doc(db,"bookings",b.id),{panditId:sel.value,panditName:p?p.name:"",status:st.value,updatedAt:F.serverTimestamp()});notice("Updated.");load()}catch(e){notice("Failed.","err")}}},"Save")));
}
function render(){
  if(view==="pandits"){const s=[...pandits].sort((a,b)=>Number(a.approved)-Number(b.approved));body.replaceChildren(...(s.length?s.map(pCard):[el("p",{class:"empty"},"No pandit profiles yet.")]))}
  else body.replaceChildren(...(bookings.length?bookings.map(bCard):[el("p",{class:"empty"},"No bookings yet.")]));
}
app.replaceChildren(el("h1",{},"Admin"),el("p",{class:"sub"},"Approve pandits, assign and manage bookings."),el("div",{class:"card"},tabs,body));
load();
