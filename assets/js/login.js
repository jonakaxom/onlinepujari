import {auth,db,F,configured,el,$,notice,signInGoogle,showSetup} from "./auth.js";
import {onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
const app=$("#app");
if(!configured)showSetup();else{
  const gIcon='<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  const showSignIn=()=>{
    const b=el("button",{class:"gbtn",type:"button",onclick:async()=>{b.disabled=true;try{await signInGoogle()}catch(e){b.disabled=false;notice(e.code==="auth/popup-closed-by-user"?"Sign-in cancelled.":"Sign-in failed. Please try again.","err")}}});
    b.innerHTML=gIcon+"<span>Continue with Google</span>"; // static markup only, no user data
    app.replaceChildren(el("div",{class:"card login"},el("h1",{},"Login or create account"),
      el("p",{class:"sub"},"One tap with your Google account. New here? We will create your account automatically."),b,
      el("p",{class:"sub",style:"margin-top:14px;font-size:.85rem"},"We only receive your name and email from Google. We never see your password.")));
  };
  const onboard=user=>{
    const name=el("input",{id:"n",required:true,maxlength:80,autocomplete:"name",value:user.displayName||""});
    const phone=el("input",{id:"p",required:true,type:"tel",maxlength:14,pattern:"[0-9+ ]{10,14}",placeholder:"+91 ...",autocomplete:"tel"});
    const role=v=>el("label",{},el("input",{type:"radio",name:"role",value:v,checked:v==="customer"}),v==="customer"?"I want to book pujas (Customer)":"I am a pandit / astrologer (Pandit)");
    const form=el("form",{class:"card login",onsubmit:async e=>{
      e.preventDefault();if(!form.reportValidity())return;
      const r=form.querySelector("[name=role]:checked").value;
      try{
        await F.setDoc(F.doc(db,"users",user.uid),{name:name.value.trim(),email:user.email,phone:phone.value.trim(),role:r,createdAt:F.serverTimestamp()});
        location.href=r==="pandit"?"pandit.html":"dashboard.html";
      }catch(err){notice("Could not create account. Check your details (phone: 10-14 digits).","err")}
    }},el("h1",{},"Almost done"),el("p",{class:"sub"},"Signed in as "+user.email),
      el("label",{class:"f",for:"n"},"Your name"),name,el("label",{class:"f",for:"p"},"Phone number"),phone,
      el("label",{class:"f"},"I am a"),el("div",{class:"chips",style:"flex-direction:column"},role("customer"),role("pandit")),
      el("p",{class:"sub",style:"font-size:.85rem"},"Pandit accounts are reviewed and approved before they appear to customers."),
      el("button",{class:"btn",type:"submit"},"Create my account"));
    app.replaceChildren(form);
  };
  onAuthStateChanged(auth,async user=>{
    if(!user)return showSignIn();
    const s=await F.getDoc(F.doc(db,"users",user.uid));
    if(!s.exists())return onboard(user);
    let admin=false;try{admin=(await F.getDoc(F.doc(db,"admins",user.uid))).exists()}catch(e){}
    location.href=admin?"admin.html":s.data().role==="pandit"?"pandit.html":"dashboard.html";
  });
}
