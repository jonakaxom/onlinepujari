import {auth,db,F,configured,el,$,signInGoogle,showSetup,onUser} from "./auth.js";
import {ic,DIYA,toast,field,setErr} from "./ui.js";
const app=$("#app");
const art=()=>el("section",{class:"auth-art"},el("a",{class:"brand",href:"../index.html"},DIYA(),el("span",{},"Online",el("b",{},"Pujari"))),
  el("div",{},el("h2",{},"Your puja, done right, in your own language"),el("p",{},"Book verified pandits for home, office and online pujas. Track every booking in one place."),
  el("ul",{},["Muhurat confirmed before you pay","Pandits in 8+ languages across India","Your data stays private and protected"].map(t=>el("li",{},ic("check"),t)))));
const layout=card=>app.replaceChildren(el("div",{class:"auth"},art(),el("section",{class:"auth-form"},card)));
if(!configured)showSetup();else{
  const gIcon='<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.900-2.100 15.900-5.800l-7.600-5.900c-2.100 1.400-4.900 2.300-8.300 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>';
  const msg=el("p",{class:"ferr",role:"alert"});
  const signIn=()=>{const b=el("button",{class:"gbtn",type:"button",onclick:async()=>{b.disabled=true;msg.textContent="";try{await signInGoogle()}catch(e){b.disabled=false;msg.textContent=e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request"?"Sign-in was cancelled. Please try again.":e.code==="auth/unauthorized-domain"?"This website address is not authorised in Firebase yet (Authentication > Settings > Authorized domains).":"Sign-in failed. Please try again."}}});
    b.innerHTML=gIcon+"<span>Continue with Google</span>";
    layout(el("div",{class:"auth-card"},el("h1",{},"Welcome"),el("p",{class:"sub"},"Log in or create your account in one tap."),b,msg,
      el("p",{class:"trustnote"},ic("lock",18),el("span",{},"We only receive your name and email from Google. We never see your password.")),
      el("p",{class:"trustnote"},el("a",{href:"../index.html"},"← Back to website"))))};
  const onboard=user=>{
    const name=el("input",{required:true,maxlength:80,autocomplete:"name",value:user.displayName||""});
    const phone=el("input",{required:true,type:"tel",inputmode:"tel",maxlength:14,autocomplete:"tel",placeholder:"+91 98765 43210"});
    const role=(v,t,s,on)=>el("div",{class:"role-c"},el("input",{type:"radio",name:"role",id:"r-"+v,value:v,checked:on}),el("label",{for:"r-"+v},el("b",{},t),el("small",{},s)));
    const fn=field("Your name",name),fp=field("Mobile number",phone,"Used only to coordinate your puja.");
    const form=el("form",{class:"auth-card",novalidate:true,onsubmit:async e=>{e.preventDefault();
      let ok=true;setErr(name,"");setErr(phone,"");
      if(name.value.trim().length<2){setErr(name,"Please enter your full name.");ok=false}
      if(!/^[0-9+ ]{10,14}$/.test(phone.value.trim())){setErr(phone,"Enter a valid mobile number (10 to 14 digits).");ok=false}
      if(!ok)return;const r=form.querySelector("[name=role]:checked").value;const btn=form.querySelector("button[type=submit]");btn.disabled=true;
      try{await F.setDoc(F.doc(db,"users",user.uid),{name:name.value.trim(),email:user.email,phone:phone.value.trim(),role:r,createdAt:F.serverTimestamp()});location.href=r==="pandit"?"pandit.html":"dashboard.html"}
      catch(err){btn.disabled=false;toast("Could not create your account. Please check your details.","err")}}},
      el("h1",{},"Almost done"),el("p",{class:"sub"},"Signed in as "+user.email),
      el("fieldset",{style:"border:0;padding:0;margin:0 0 6px"},el("legend",{style:"font-weight:700;margin-bottom:8px"},"I want to"),el("div",{class:"roles"},role("customer","Book pujas","I am a customer",true),role("pandit","Offer pujas","I am a pandit",false))),
      fn,fp,el("p",{class:"hint",style:"margin-top:-4px"},"Pandit accounts are reviewed by our team before they appear to customers."),el("button",{class:"btn",type:"submit",style:"width:100%"},"Create my account"));
    layout(form)};
  onUser(async user=>{if(!user)return signIn();
    const s=await F.getDoc(F.doc(db,"users",user.uid));if(!s.exists())return onboard(user);
    let admin=false;try{admin=(await F.getDoc(F.doc(db,"admins",user.uid))).exists()}catch(e){}
    location.href=admin?"admin.html":s.data().role==="pandit"?"pandit.html":"dashboard.html"});
}
