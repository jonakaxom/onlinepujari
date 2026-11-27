import {auth,db,F,configured,el,$,signInGoogle,signUpEmail,signInEmail,resetPassword,showSetup,onUser} from "./auth.js";
import {ic,DIYA,toast,field,setErr} from "./ui.js";
const app=$("#app");
const art=()=>el("section",{class:"auth-art"},el("a",{class:"brand",href:"../index.html"},DIYA(),el("span",{},"Online",el("b",{},"Pujari"))),
  el("div",{},el("h2",{},"Your puja, done right, in your own language"),el("p",{},"Book verified pandits for home, office and online pujas. Track every booking in one place."),
  el("ul",{},["Muhurat confirmed before you pay","Pandits in 8+ languages across India","Your data stays private and protected"].map(t=>el("li",{},ic("check"),t)))));
const layout=card=>app.replaceChildren(el("div",{class:"auth"},art(),el("section",{class:"auth-form"},card)));
if(!configured)showSetup();else{
  const gIcon='<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.900-2.100 15.900-5.800l-7.600-5.900c-2.100 1.400-4.900 2.300-8.300 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>';
  let creating=false;
  const ERR={"auth/invalid-credential":"Email or password is incorrect.","auth/wrong-password":"Email or password is incorrect.","auth/user-not-found":"No account with this email. Try Sign up.","auth/email-already-in-use":"This email already has an account. Please sign in.","auth/weak-password":"Password must be at least 8 characters.","auth/too-many-requests":"Too many attempts. Please wait a few minutes.","auth/network-request-failed":"Network problem. Check your connection.","auth/operation-not-allowed":"Email sign-in is not enabled yet. Use Google or ask the site owner to enable it.","auth/popup-closed-by-user":"Sign-in was cancelled.","auth/cancelled-popup-request":"Sign-in was cancelled.","auth/unauthorized-domain":"This website address is not authorised in Firebase yet (Authentication > Settings > Authorized domains)."};
  const say=(m,e)=>{m.textContent=ERR[e.code]||"Something went wrong. Please try again."};
  const pw=(id,auto)=>{const i=el("input",{type:"password",id,minlength:8,maxlength:64,autocomplete:auto,required:true,placeholder:"At least 8 characters"});
    const t=el("button",{type:"button",class:"pw-t","aria-label":"Show password",onclick:()=>{const s=i.type==="password";i.type=s?"text":"password";t.textContent=s?"Hide":"Show";t.setAttribute("aria-label",s?"Hide password":"Show password")}},"Show");
    return [i,el("div",{class:"pw"},i,t)]};
  const strength=i=>{const bar=el("div",{class:"pwm"},el("i"));const lab=el("small",{class:"hint"},"");
    i.addEventListener("input",()=>{const v=i.value;let n=0;if(v.length>=8)n++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))n++;if(/\d/.test(v))n++;if(/[^A-Za-z0-9]/.test(v)||v.length>=12)n++;
      bar.firstChild.style.width=(v?n*25:0)+"%";bar.dataset.l=n;lab.textContent=v?["Too weak","Weak","Fair","Good","Strong"][n]:""});return [bar,lab]};
  const gbtn=msg=>{const b=el("button",{class:"gbtn",type:"button",onclick:async()=>{b.disabled=true;msg.textContent="";try{await signInGoogle()}catch(e){b.disabled=false;say(msg,e)}}});b.innerHTML=gIcon+"<span>Continue with Google</span>";return b};
  const tabs=(cur)=>el("div",{class:"auth-tabs",role:"tablist"},[["in","Sign in"],["up","Sign up"]].map(([k,t])=>el("button",{type:"button",role:"tab","aria-selected":String(k===cur),class:k===cur?"on":"",onclick:()=>k==="in"?signIn():signUp()},t)));
  const foot=el("p",{class:"trustnote"},ic("lock",18),el("span",{},"Passwords are handled by Google Firebase and are never visible to us."));
  const back=el("p",{class:"trustnote"},el("a",{href:"../index.html"},"← Back to website"));
  const or=()=>el("div",{class:"or"},el("span",{},"or with email"));
  function signIn(){
    const msg=el("p",{class:"ferr",role:"alert"});const email=el("input",{type:"email",required:true,autocomplete:"email",inputmode:"email",placeholder:"you@example.com"});const [pi,pwrap]=pw("pw1","current-password");
    const fe=field("Email",email),fp=el("div",{class:"fld"},el("label",{for:"pw1"},"Password"),pwrap,el("small",{class:"ferr",role:"alert"}));
    const form=el("form",{novalidate:true,onsubmit:async e=>{e.preventDefault();msg.textContent="";setErr(email,"");fp.querySelector(".ferr").textContent="";let ok=true;
      if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){setErr(email,"Enter a valid email.");ok=false}if(!pi.value){fp.querySelector(".ferr").textContent="Enter your password.";ok=false}if(!ok)return;
      const b=form.querySelector("[type=submit]");b.disabled=true;b.textContent="Signing in…";try{await signInEmail(email.value.trim(),pi.value)}catch(x){b.disabled=false;b.textContent="Sign in";say(msg,x)}}},
      fe,fp,el("div",{class:"forgot"},el("button",{type:"button",class:"link",onclick:()=>forgot(email.value)},"Forgot password?")),msg,el("button",{class:"btn",type:"submit",style:"width:100%"},"Sign in"));
    layout(el("div",{class:"auth-card"},tabs("in"),el("h1",{},"Welcome back"),el("p",{class:"sub"},"Sign in to manage your pujas and bookings."),gbtn(msg),or(),form,el("p",{class:"swap"},"New here? ",el("button",{type:"button",class:"link",onclick:signUp},"Create an account")),foot,back))}
  function forgot(v){
    const msg=el("p",{class:"ferr",role:"alert"});const email=el("input",{type:"email",required:true,autocomplete:"email",value:v||""});
    const form=el("form",{novalidate:true,onsubmit:async e=>{e.preventDefault();setErr(email,"");if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){setErr(email,"Enter a valid email.");return}
      try{await resetPassword(email.value.trim())}catch(x){}
      form.replaceChildren(el("p",{class:"okmsg"},ic("check",18),"If an account exists for that email, a reset link has been sent. Check your inbox and spam folder."),el("button",{type:"button",class:"btn",style:"width:100%",onclick:signIn},"Back to sign in"))}},
      field("Email",email),msg,el("button",{class:"btn",type:"submit",style:"width:100%"},"Send reset link"));
    layout(el("div",{class:"auth-card"},el("h1",{},"Reset password"),el("p",{class:"sub"},"We will email you a link to choose a new password."),form,el("p",{class:"swap"},el("button",{type:"button",class:"link",onclick:signIn},"← Back to sign in"))))}
  function signUp(){
    const msg=el("p",{class:"ferr",role:"alert"});
    const name=el("input",{required:true,maxlength:80,autocomplete:"name"}),email=el("input",{type:"email",required:true,autocomplete:"email",inputmode:"email"}),phone=el("input",{required:true,type:"tel",inputmode:"tel",maxlength:14,autocomplete:"tel",placeholder:"+91 98765 43210"});
    const [pi,pwrap]=pw("pw2","new-password");const [pj,pwrap2]=pw("pw3","new-password");pj.placeholder="Re-enter password";
    const role=(v,t,s,on)=>el("div",{class:"role-c"},el("input",{type:"radio",name:"role",id:"r-"+v,value:v,checked:on}),el("label",{for:"r-"+v},el("b",{},t),el("small",{},s)));
    const fp=el("div",{class:"fld"},el("label",{for:"pw2"},"Create password"),pwrap,...strength(pi),el("small",{class:"ferr",role:"alert"})),fq=el("div",{class:"fld"},el("label",{for:"pw3"},"Confirm password"),pwrap2,el("small",{class:"ferr",role:"alert"}));
    const terms=el("input",{type:"checkbox",id:"tc"});const ft=el("div",{class:"fld"},el("label",{class:"chk",for:"tc"},terms,el("span",{},"I agree to the ",el("a",{href:"../terms/",target:"_blank",rel:"noopener"},"Terms")," and ",el("a",{href:"../privacy/",target:"_blank",rel:"noopener"},"Privacy Policy"))),el("small",{class:"ferr",role:"alert"}));
    const fn=field("Full name",name),fe=field("Email",email),fh=field("Mobile number",phone,"Used only to coordinate your puja.");
    const clr=e=>{const f=e.target.closest(".fld");if(f){f.classList.remove("bad");const x=f.querySelector(".ferr");if(x)x.textContent=""}};
    const form=el("form",{novalidate:true,oninput:clr,onchange:clr,onsubmit:async e=>{e.preventDefault();msg.textContent="";[name,email,phone].forEach(i=>setErr(i,""));[fp,fq,ft].forEach(f=>f.querySelector(".ferr").textContent="");let ok=true;
      if(name.value.trim().length<2){setErr(name,"Please enter your full name.");ok=false}if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){setErr(email,"Enter a valid email.");ok=false}
      if(!/^[0-9+ ]{10,14}$/.test(phone.value.trim())){setErr(phone,"Enter a valid mobile number (10 to 14 digits).");ok=false}
      if(pi.value.length<8){fp.querySelector(".ferr").textContent="Use at least 8 characters.";ok=false}if(pj.value!==pi.value){fq.querySelector(".ferr").textContent="Passwords do not match.";ok=false}
      if(!terms.checked){ft.querySelector(".ferr").textContent="Please accept to continue.";ok=false}if(!ok)return;
      const r=form.querySelector("[name=role]:checked").value;const b=form.querySelector("[type=submit]");b.disabled=true;b.textContent="Creating account…";creating=true;
      try{const c=await signUpEmail(email.value.trim(),pi.value,name.value.trim());
        await F.setDoc(F.doc(db,"users",c.user.uid),{name:name.value.trim(),email:c.user.email,phone:phone.value.trim(),role:r,createdAt:F.serverTimestamp()});location.href=r==="pandit"?"pandit.html":"dashboard.html"}
      catch(x){creating=false;b.disabled=false;b.textContent="Create account";x.code?say(msg,x):toast("Could not create your account.","err")}}},
      el("fieldset",{style:"border:0;padding:0;margin:0 0 6px"},el("legend",{style:"font-weight:700;margin-bottom:8px"},"I want to"),el("div",{class:"roles"},role("customer","Book pujas","I am a customer",true),role("pandit","Offer pujas","I am a pandit",false))),
      fn,fe,fh,fp,fq,ft,el("p",{class:"hint"},"Pandit accounts are reviewed by our team before they appear to customers."),msg,el("button",{class:"btn",type:"submit",style:"width:100%"},"Create account"));
    layout(el("div",{class:"auth-card"},tabs("up"),el("h1",{},"Create your account"),el("p",{class:"sub"},"Free to join. Takes under a minute."),gbtn(msg),or(),form,el("p",{class:"swap"},"Already registered? ",el("button",{type:"button",class:"link",onclick:signIn},"Sign in")),foot,back))}
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
  onUser(async user=>{if(creating)return;if(!user)return signIn();
    const s=await F.getDoc(F.doc(db,"users",user.uid));if(!s.exists())return onboard(user);
    let admin=false;try{admin=(await F.getDoc(F.doc(db,"admins",user.uid))).exists()}catch(e){}
    location.href=admin?"admin.html":s.data().role==="pandit"?"pandit.html":"dashboard.html"});
}
