import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,sendEmailVerification,updateProfile,updatePassword,reauthenticateWithCredential,EmailAuthProvider,setPersistence,browserLocalPersistence,browserSessionPersistence} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import * as fs from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {firebaseConfig,APP_CHECK_SITE_KEY} from "./firebase-config.js";

export const configured=!firebaseConfig.apiKey.startsWith("PASTE");
export const F=fs;
let app,auth,db;
if(configured){
  app=initializeApp(firebaseConfig);
  if(APP_CHECK_SITE_KEY){
    const m=await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js");
    m.initializeAppCheck(app,{provider:new m.ReCaptchaV3Provider(APP_CHECK_SITE_KEY),isTokenAutoRefreshEnabled:true});
  }
  auth=getAuth(app);db=fs.getFirestore(app);
}
export {auth,db};

/* ---- safe DOM builder: text is ALWAYS inserted as text, never as HTML (prevents XSS) ---- */
export function el(tag,props={},...kids){
  const n=document.createElement(tag);
  for(const [k,v] of Object.entries(props||{})){
    if(v==null||v===false)continue;
    if(k==="class")n.className=v;
    else if(k.startsWith("on")&&typeof v==="function")n.addEventListener(k.slice(2),v);
    else n.setAttribute(k,v===true?"":v);
  }
  for(const c of kids.flat(Infinity))if(c!=null&&c!==false)n.append(c instanceof Node?c:document.createTextNode(String(c)));
  return n;
}
export const $=s=>document.querySelector(s);
export function notice(msg,kind="ok"){const b=$("#msg");if(!b)return;b.className="notice "+kind;b.textContent=msg;b.hidden=false;if(kind==="ok")setTimeout(()=>b.hidden=true,4000)}
export const digits=s=>String(s||"").replace(/\D/g,"");
export const waLink=(num,text)=>{const d=digits(num);return d.length>=10&&d.length<=15?`https://wa.me/${d.length===10?"91"+d:d}?text=${encodeURIComponent(text)}`:null};
export const fmtDate=s=>{const d=new Date(s+"T00:00:00");return isNaN(d)?s:d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})};
export const tsMs=t=>t&&t.toMillis?t.toMillis():0;

export const onUser=cb=>onAuthStateChanged(auth,cb);
export async function signInGoogle(){return signInWithPopup(auth,new GoogleAuthProvider())}
const persist=async keep=>{try{await setPersistence(auth,keep===false?browserSessionPersistence:browserLocalPersistence)}catch(e){}};
export async function signInEmail(email,pw,keep=true){await persist(keep);return signInWithEmailAndPassword(auth,email.trim(),pw)}
export async function signUpEmail(email,pw,name,keep=true){await persist(keep);const c=await createUserWithEmailAndPassword(auth,email.trim(),pw);try{await updateProfile(c.user,{displayName:name})}catch(e){}return c}
export const resetPassword=email=>sendPasswordResetEmail(auth,email.trim());
export const sendVerify=u=>sendEmailVerification(u||auth.currentUser);
export const usesPassword=u=>!!(u||auth.currentUser)?.providerData?.some(p=>p.providerId==="password");
export async function changePassword(current,next){const u=auth.currentUser;await reauthenticateWithCredential(u,EmailAuthProvider.credential(u.email,current));await updatePassword(u,next)}
/* friendly, specific messages for Firebase auth errors */
export function authMsg(e){const c=e&&e.code||"";return({
 "auth/invalid-credential":"Email or password is not correct. Check both, or use Forgot password.",
 "auth/wrong-password":"Email or password is not correct. Check both, or use Forgot password.",
 "auth/user-not-found":"No account found for this email. Create one on the Create account tab.",
 "auth/email-already-in-use":"An account with this email already exists. Sign in instead, or use Forgot password.",
 "auth/weak-password":"Choose a stronger password with at least 8 characters.",
 "auth/invalid-email":"Enter a valid email address.",
 "auth/too-many-requests":"Too many attempts. Please wait a few minutes and try again.",
 "auth/network-request-failed":"Network problem. Check your internet connection and try again.",
 "auth/popup-closed-by-user":"Sign-in was cancelled. Please try again.",
 "auth/cancelled-popup-request":"Sign-in was cancelled. Please try again.",
 "auth/popup-blocked":"Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
 "auth/operation-not-allowed":"This sign-in method is not switched on in Firebase yet (Authentication > Sign-in method).",
 "auth/unauthorized-domain":"This website address is not authorised in Firebase yet (Authentication > Settings > Authorized domains).",
 "auth/requires-recent-login":"Please sign in again before changing your password."})[c]||"Something went wrong. Please try again."}
export async function logout(){await signOut(auth);location.href="login.html"}

/* Resolves {user,profile,isAdmin}. Redirects to login.html when signed out or not onboarded. */
export function requireUser({allow}={}){
  return new Promise(res=>{
    if(!configured){showSetup();return}
    onAuthStateChanged(auth,async user=>{
      if(!user){location.href="login.html";return}
      const snap=await fs.getDoc(fs.doc(db,"users",user.uid));
      if(!snap.exists()){location.href="login.html";return}
      const profile=snap.data();
      let isAdmin=false;
      try{isAdmin=(await fs.getDoc(fs.doc(db,"admins",user.uid))).exists()}catch(e){}
      const home=isAdmin?"admin.html":profile.role==="pandit"?"pandit.html":"dashboard.html";
      if(allow&&!allow({profile,isAdmin})){location.href=home;return}
      const who=$("#who");if(who)who.textContent=profile.name;
      $("#logout")?.addEventListener("click",logout);
      res({user,profile,isAdmin,home});
    });
  });
}
export function showSetup(){
  const m=$("#app")||document.body;
  m.replaceChildren(el("div",{class:"card"},el("h2",{},"Setup needed"),
    el("p",{},"Open assets/js/firebase-config.js and paste your Firebase web app config. See docs/FIREBASE-SETUP.md.")));
}
export const STATUS_LABEL={pending:"Pending",accepted:"Accepted",declined:"Declined",completed:"Completed",cancelled:"Cancelled"};
export const badge=s=>el("span",{class:"badge b-"+s},STATUS_LABEL[s]||s);
export const LANGS=["Hindi","Tamil","Telugu","Kannada","Marathi","Bengali","Gujarati","Malayalam","Assamese","English","Sanskrit"];
export async function loadPujas(){try{return await (await fetch(new URL("../data/pujas.json",import.meta.url))).json()}catch(e){return []}}
