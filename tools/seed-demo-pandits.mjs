/* Create (or remove) demo pandits: Firebase Auth user + users/<uid> + approved pandits/<uid>.
   Uses the Firebase Admin SDK, so it bypasses firestore.rules (a normal pandit can never self-approve).

   One-time setup (in the project folder):
     npm install firebase-admin
     Firebase console > Project settings > Service accounts > Generate new private key
     save it as  tools/service-account.json   (NEVER commit or deploy this file)

   Run:
     node tools/seed-demo-pandits.mjs            create 9 demo pandits (safe to run again)
     node tools/seed-demo-pandits.mjs --remove   delete all demo pandits again
   Optional: DEMO_PASSWORD="YourOwn#Pass1" node tools/seed-demo-pandits.mjs   (default: Demo@Pandit123)

   Demo accounts: demo.pandit1@onlinepujari.test ... demo.pandit9@onlinepujari.test
   Every demo doc has demo:true so --remove only ever touches demo data. */
import {readFileSync} from "node:fs";
import {initializeApp,cert} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore,FieldValue} from "firebase-admin/firestore";

const key=JSON.parse(readFileSync(new URL("./service-account.json",import.meta.url)));
initializeApp({credential:cert(key)});
const auth=getAuth(),db=getFirestore();
const PASSWORD=process.env.DEMO_PASSWORD||"Demo@Pandit123";
const REMOVE=process.argv.includes("--remove");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};

// name, city, years, languages, services, price text, rating, reviews, whatsapp, bio
const P=[
["Pt. Anand Sharma","Guwahati",15,["Hindi","Assamese"],["Griha Pravesh Puja","Satyanarayan Puja","Rudrabhishek Puja"],"Griha Pravesh from ₹5,100",5,128,"Performs home and office pujas across Guwahati with full vidhi and muhurat guidance."],
["Acharya Devendra Pandey","Lucknow",22,["Hindi","Sanskrit"],["Rudrabhishek Puja","Kaal Sarp Dosh Puja","Vastu Shanti Puja"],"Rudrabhishek from ₹4,100",4.9,212,"Learned in Vedic ritual, specialising in Shiva pujas and dosh nivaran."],
["Vadhyar Karthik Iyer","Chennai",13,["Tamil","Telugu"],["Griha Pravesh Puja","Ganesh Puja","Lakshmi Puja"],"Griha Pravesh from ₹5,100",4.8,96,"Smartha tradition priest; pujas conducted in Tamil and Sanskrit."],
["Purohit Subrata Banerjee","Kolkata",18,["Bengali","Hindi"],["Lakshmi Puja","Satyanarayan Puja","Shradh and Pitru Puja"],"Satyanarayan from ₹3,100",4.95,154,"Family purohit for Bengali festivals, shradh and satyanarayan katha."],
["Guruji Prakash Patil","Pune",9,["Marathi","Hindi"],["Ganesh Puja","Griha Pravesh Puja","Vastu Shanti Puja"],"Ganesh Puja from ₹2,100",4.7,61,"Ganesh and griha pravesh pujas in Pune and Pimpri-Chinchwad."],
["Pt. Mohan Das","Bhubaneswar",20,["Hindi","Odia"],["Bhoomi Puja","Vastu Shanti Puja","Annaprasan Puja"],"",4.85,88,"Bhoomi pujan and vastu shanti with clear step-by-step explanation."],
["Purohit Ravi Teja","Hyderabad",6,["Telugu","Hindi"],["Satyanarayan Puja","Annaprasan Puja"],"Satyanarayan from ₹3,100",0,0,"Newly joined pandit offering satyanarayan and annaprasan pujas."],
["Pt. Suresh Joshi","Delhi",25,["Hindi","English"],["Maha Mrityunjaya Homam","Rudrabhishek Puja","Kaal Sarp Dosh Puja"],"Homam from ₹7,100",5,301,"Senior pandit for homams and graha shanti across Delhi NCR."],
["Purohit Hari Nair","Kochi",11,["Malayalam","Tamil"],["Griha Pravesh Puja","Office Opening Puja"],"",4.6,42,"Kerala-style griha pravesh and office opening pujas."]
];

for(let i=0;i<P.length;i++){
  const [name,city,experience,languages,services,price,rating,reviewCount,bio]=P[i];
  const email=`demo.pandit${i+1}@onlinepujari.test`;
  let uid;
  try{uid=(await auth.getUserByEmail(email)).uid}catch(e){uid=null}
  if(REMOVE){
    if(uid){await db.doc(`pandits/${uid}`).delete();await db.doc(`users/${uid}`).delete();await auth.deleteUser(uid)}
    console.log("removed",email);continue;
  }
  if(!uid)uid=(await auth.createUser({email,password:PASSWORD,displayName:name,emailVerified:true})).uid;
  const phone="+9198000000"+String(i+1).padStart(2,"0");           // 13 chars, passes the rules' phone check
  await db.doc(`users/${uid}`).set({name,email,phone,role:"pandit",createdAt:FieldValue.serverTimestamp(),demo:true});
  const doc={name,city,languages,services,price,experience,whatsapp:phone.replace("+",""),bio,photoUrl:"",
    unavailable:i%4===3?[today()]:[],approved:true,reviewNote:"",demo:true,createdAt:FieldValue.serverTimestamp(),reviewedAt:FieldValue.serverTimestamp()};
  if(rating>0){doc.rating=rating;doc.reviewCount=reviewCount}
  await db.doc(`pandits/${uid}`).set(doc);
  console.log("ok",email,"→",name,"("+city+")");
}
console.log(REMOVE?"\nDemo pandits removed.":`\nDone. ${P.length} approved demo pandits created. Password for all: ${PASSWORD}`);
