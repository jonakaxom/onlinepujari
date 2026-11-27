import {auth,db,F,configured,el,$,signInGoogle,signInEmail,signUpEmail,resetPassword,sendVerify,authMsg,showSetup,onUser} from "./auth.js";
import {ic,DIYA,toast,field,setErr} from "./ui.js";
const app=$("#app");
const qs=new URLSearchParams(location.search);
const art=()=>el("section",{class:"auth-art"},el("a",{class:"brand",href:"../index.html"},DIYA(),el("span",{},"Online",el("b",{},"Pujari"))),
  el("div",{},el("h2",{},"Your puja, done right, in your own language"),el("p",{},"Book verified pandits for home, office and online pujas. Track every booking in one place."),
  el("ul",{},["Muhurat confirmed before you pay","Pandits in 8+ languages across India","Your data stays private and protected"].map(t=>el("li",{},ic("check"),t)))));
const layout=card=>{app.replaceChildren(el("div",{class:"auth"},art(),el("section",{class:"auth-form"},card)));const f=app.querySelector("input:not([type=radio]):not([type=checkbox])");f&&f.focus({preventScroll:true})};
if(!configured)showSetup();else{
  const gIcon='<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  let busy=false,shown=false;
  const go=(role,admin)=>{location.href=admin?"admin.html":role==="pandit"?"pandit.html":"dashboard.html"};
  const bad=(box,m)=>{box.textContent=m;box.hidden=!m};
  const alertBox=()=>{const b=el("p",{class:"form-alert",role:"alert"});b.hidden=true;return b};
  const pwInput=(id,auto,ph)=>{const i=el("input",{type:"password",required:true,autocomplete:auto,maxlength:128,placeholder:ph||""});
    const t=el("button",{type:"button",class:"pw-t","aria-label":"Show password","aria-pressed":"false",onclick:()=>{const s=i.type==="password";i.type=s?"text":"password";t.textContent=s?"Hide":"Show";t.setAttribute("aria-pressed",s);t.setAttribute("aria-label",s?"Hide password":"Show password")}},"Show");
    return {input:i,wrap:el("div",{class:"pw"},i,t)}};
  const pwf=(pw,id)=>{pw.input.id=id;const f=field("Password",pw.wrap,null,id+"-wrap");f.querySelector("label").setAttribute("for",id);return f};
  const scorePw=v=>{let s=0;if(v.length>=8)s++;if(v.length>=12)s++;if(/[a-z]/.test(v)&&/[A-Z]/.test(v))s++;if(/\d/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;return Math.min(4,Math.max(v?1:0,s-(v.length<8?1:0)))};
  const googleBtn=(label,box)=>{const b=el("button",{class:"gbtn",type:"button",onclick:async()=>{b.disabled=true;bad(box,"");try{await signInGoogle()}catch(e){b.disabled=false;bad(box,authMsg(e))}}});b.innerHTML=gIcon+"<span>"+label+"</span>";return b};
  const tabs=cur=>el("div",{class:"seg",role:"tablist"},[["signin","Sign in"],["signup","Create account"]].map(([k,t])=>
    el("button",{type:"button",role:"tab",class:"seg-b",id:"tab-"+k,"aria-selected":String(k===cur),onclick:()=>k===cur||(history.replaceState(null,"","?mode="+k),k==="signin"?signIn():signUp())},t)));
  const divider=()=>el("div",{class:"or"},el("span",{},"or with email"));
  const foot=()=>el("p",{class:"trustnote"},el("a",{href:"../index.html"},"← Back to website"));

  function signIn(){shown=true;
    const alert=alertBox(),email=el("input",{type:"email",required:true,autocomplete:"email",inputmode:"email",maxlength:120,placeholder:"you@example.com"}),pw=pwInput("p","current-password");
    const keep=el("input",{type:"checkbox",checked:true,id:"keep"});
    const form=el("form",{class:"auth-card",novalidate:true,onsubmit:async e=>{e.preventDefault();bad(alert,"");setErr(email,"");setErr(pw.input,"");let ok=true;
      if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){setErr(email,"Enter a valid email address.");ok=false}
      if(!pw.input.value){setErr(pw.input,"Enter your password.");ok=false}if(!ok)return;
      const btn=form.querySelector("button[type=submit]");btn.disabled=true;btn.textContent="Signing in…";
      try{await signInEmail(email.value,pw.input.value,keep.checked)}catch(err){btn.disabled=false;btn.textContent="Sign in";bad(alert,authMsg(err));pw.input.focus()}}},
      el("h1",{},"Welcome back"),el("p",{class:"sub"},"Sign in to manage your pujas and bookings."),tabs("signin"),
      googleBtn("Continue with Google",alert),divider(),alert,
      field("Email",email),pwf(pw,"pw-in"),
      el("div",{class:"row-s"},el("label",{class:"chk",for:"keep"},keep,el("span",{},"Keep me signed in")),el("button",{type:"button",class:"linkb",onclick:()=>forgot(email.value)},"Forgot password?")),
      el("button",{class:"btn",type:"submit",style:"width:100%"},"Sign in"),
      el("p",{class:"swap"},"New to Online Pujari? ",el("button",{type:"button",class:"linkb",onclick:()=>{history.replaceState(null,"","?mode=signup");signUp()}},"Create an account")),foot());
    layout(form)}

  function signUp(){shown=true;
    const alert=alertBox();
    const want=qs.get("role")==="pandit"?"pandit":"customer";
    const role=(v,t,s)=>el("div",{class:"role-c"},el("input",{type:"radio",name:"role",id:"r-"+v,value:v,checked:v===want}),el("label",{for:"r-"+v},el("b",{},t),el("small",{},s)));
    const name=el("input",{required:true,maxlength:80,autocomplete:"name",placeholder:"Your full name"}),
      phone=el("input",{required:true,type:"tel",inputmode:"tel",maxlength:14,autocomplete:"tel",placeholder:"+91 98765 43210"}),
      email=el("input",{type:"email",required:true,autocomplete:"email",inputmode:"email",maxlength:120,placeholder:"you@example.com"}),
      pw=pwInput("p","new-password","At least 8 characters");
    const meter=el("div",{class:"pwmeter","aria-hidden":"true"},el("i"),el("i"),el("i"),el("i")),mlabel=el("small",{class:"hint",id:"pwm"},"Use 8+ characters with a letter and a number.");
    pw.input.addEventListener("input",()=>{const s=scorePw(pw.input.value);meter.dataset.s=s;mlabel.textContent=pw.input.value?["","Weak","Fair","Good","Strong"][s]+" password":"Use 8+ characters with a letter and a number."});
    const terms=el("input",{type:"checkbox",id:"terms"});
    const form=el("form",{class:"auth-card",novalidate:true,onsubmit:async e=>{e.preventDefault();bad(alert,"");
      [name,phone,email,pw.input].forEach(i=>setErr(i,""));let ok=true;
      if(name.value.trim().length<2){setErr(name,"Please enter your full name.");ok=false}
      if(!/^[0-9+ ]{10,14}$/.test(phone.value.trim())){setErr(phone,"Enter a valid mobile number (10 to 14 digits).");ok=false}
      if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){setErr(email,"Enter a valid email address.");ok=false}
      const v=pw.input.value;if(v.length<8||!/[A-Za-z]/.test(v)||!/\d/.test(v)){setErr(pw.input,"Use at least 8 characters with a letter and a number.");ok=false}
      if(!terms.checked){bad(alert,"Please accept the Terms and Privacy policy to continue.");ok=false}
      if(!ok)return;
      const r=form.querySelector("[name=role]:checked").value,btn=form.querySelector("button[type=submit]");btn.disabled=true;btn.textContent="Creating account…";busy=true;
      try{const c=await signUpEmail(email.value,v,name.value.trim());
        try{await F.setDoc(F.doc(db,"users",c.user.uid),{name:name.value.trim(),email:c.user.email,phone:phone.value.trim(),role:r,createdAt:F.serverTimestamp()})}
        catch(e2){busy=false;btn.disabled=false;btn.textContent="Create account";return onboard(c.user)}
        sendVerify(c.user).catch(()=>{});location.href=r==="pandit"?"pandit.html":"dashboard.html"}
      catch(err){busy=false;btn.disabled=false;btn.textContent="Create account";bad(alert,authMsg(err));if(err.code==="auth/email-already-in-use")setErr(email,"This email already has an account.")}}},
      el("h1",{},"Create your account"),el("p",{class:"sub"},"It takes a minute. No payment needed to sign up."),tabs("signup"),
      el("fieldset",{class:"rolefs"},el("legend",{},"I want to"),el("div",{class:"roles"},role("customer","Book pujas","I am a customer"),role("pandit","Offer pujas","I am a pandit"))),
      alert,
      field("Full name",name),field("Mobile number",phone,"Used only to coordinate your puja."),field("Email",email),
      pwf(pw,"pw-up"),el("div",{class:"pwm"},meter,mlabel),
      el("label",{class:"chk terms",for:"terms"},terms,el("span",{},"I agree to the ",el("a",{href:"../terms.html",target:"_blank",rel:"noopener"},"Terms"),", ",el("a",{href:"../privacy.html",target:"_blank",rel:"noopener"},"Privacy policy")," and ",el("a",{href:"../refund.html",target:"_blank",rel:"noopener"},"Refund policy"),".")),
      el("p",{class:"hint pandit-n"},"Pandit accounts are reviewed by our team before they appear to customers."),
      el("button",{class:"btn",type:"submit",style:"width:100%"},"Create account"),
      el("div",{class:"or"},el("span",{},"or")),googleBtn("Sign up with Google",alert),
      el("p",{class:"swap"},"Already have an account? ",el("button",{type:"button",class:"linkb",onclick:()=>{history.replaceState(null,"","?mode=signin");signIn()}},"Sign in")),foot());
    layout(form);form.querySelectorAll("[name=role]").forEach(r=>r.addEventListener("change",()=>qs.set("role",r.value)))}

  function forgot(prefill){shown=true;
    const alert=alertBox(),email=el("input",{type:"email",required:true,autocomplete:"email",inputmode:"email",maxlength:120,value:/^\S+@\S+\.\S+$/.test(prefill||"")?prefill.trim():"",placeholder:"you@example.com"});
    const form=el("form",{class:"auth-card",novalidate:true,onsubmit:async e=>{e.preventDefault();bad(alert,"");setErr(email,"");
      if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){setErr(email,"Enter a valid email address.");return}
      const btn=form.querySelector("button[type=submit]");btn.disabled=true;
      try{await resetPassword(email.value)}catch(err){if(err.code!=="auth/user-not-found"){btn.disabled=false;bad(alert,authMsg(err));return}}
      /* same message whether or not the account exists, so emails cannot be probed */
      layout(el("div",{class:"auth-card"},el("div",{class:"ok-ico"},ic("check",30)),el("h1",{},"Check your email"),
        el("p",{class:"sub"},"If an account exists for "+email.value.trim()+", we have sent a link to reset the password. It can take a few minutes; check spam too."),
        el("button",{class:"btn",type:"button",style:"width:100%",onclick:signIn},"Back to sign in")))}},
      el("h1",{},"Reset password"),el("p",{class:"sub"},"Enter your account email and we will send a reset link."),alert,field("Email",email),
      el("button",{class:"btn",type:"submit",style:"width:100%"},"Send reset link"),
      el("p",{class:"swap"},el("button",{type:"button",class:"linkb",onclick:signIn},"← Back to sign in")));
    layout(form)}

  const onboard=user=>{busy=true;
    const name=el("input",{required:true,maxlength:80,autocomplete:"name",value:user.displayName||""});
    const phone=el("input",{required:true,type:"tel",inputmode:"tel",maxlength:14,autocomplete:"tel",placeholder:"+91 98765 43210"});
    const want=qs.get("role")==="pandit"?"pandit":"customer";
    const role=(v,t,s)=>el("div",{class:"role-c"},el("input",{type:"radio",name:"role",id:"r-"+v,value:v,checked:v===want}),el("label",{for:"r-"+v},el("b",{},t),el("small",{},s)));
    const fn=field("Your name",name),fp=field("Mobile number",phone,"Used only to coordinate your puja.");
    const form=el("form",{class:"auth-card",novalidate:true,onsubmit:async e=>{e.preventDefault();
      let ok=true;setErr(name,"");setErr(phone,"");
      if(name.value.trim().length<2){setErr(name,"Please enter your full name.");ok=false}
      if(!/^[0-9+ ]{10,14}$/.test(phone.value.trim())){setErr(phone,"Enter a valid mobile number (10 to 14 digits).");ok=false}
      if(!ok)return;const r=form.querySelector("[name=role]:checked").value;const btn=form.querySelector("button[type=submit]");btn.disabled=true;
      try{await F.setDoc(F.doc(db,"users",user.uid),{name:name.value.trim(),email:user.email,phone:phone.value.trim(),role:r,createdAt:F.serverTimestamp()});go(r)}
      catch(err){btn.disabled=false;toast("Could not create your account. Please check your details.","err")}}},
      el("h1",{},"Almost done"),el("p",{class:"sub"},"Signed in as "+user.email),
      el("fieldset",{class:"rolefs"},el("legend",{},"I want to"),el("div",{class:"roles"},role("customer","Book pujas","I am a customer"),role("pandit","Offer pujas","I am a pandit"))),
      fn,fp,el("p",{class:"hint pandit-n"},"Pandit accounts are reviewed by our team before they appear to customers."),el("button",{class:"btn",type:"submit",style:"width:100%"},"Create my account"),
      el("p",{class:"swap"},el("button",{type:"button",class:"linkb",onclick:async()=>{const {logout}=await import("./auth.js");logout()}},"Use a different account")));
    layout(form)};

  onUser(async user=>{if(busy)return;
    if(!user){if(!shown)qs.get("mode")==="signup"?signUp():signIn();return}
    const s=await F.getDoc(F.doc(db,"users",user.uid));if(!s.exists())return onboard(user);
    let admin=false;try{admin=(await F.getDoc(F.doc(db,"admins",user.uid))).exists()}catch(e){}
    go(s.data().role,admin)});
}
