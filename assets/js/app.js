const WA="919999999999"; // TODO: your WhatsApp number with country code
document.querySelector('.menu')?.addEventListener('click',e=>{const n=document.querySelector('nav');n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',n.classList.contains('open'))});
document.querySelectorAll('form.book').forEach(f=>{
  const fs=[...f.querySelectorAll('fieldset')],dots=[...f.querySelectorAll('.dots i')];let n=+f.dataset.start||1;
  const show=k=>{n=k;fs.forEach((x,i)=>x.classList.toggle('on',i===k-1));dots.forEach((d,i)=>d.classList.toggle('on',i<k))};show(n);
  const d=f.querySelector('[name=date]');if(d)d.min=new Date().toISOString().slice(0,10);
  const q=new URLSearchParams(location.search).get('puja');if(q){const r=[...f.querySelectorAll('[name=puja]')].find(x=>x.value===q);if(r){r.checked=true;show(2)}}
  const ok=()=>{const cur=fs[n-1],bad=[...cur.querySelectorAll('input,select')].find(x=>x.type!=='radio'&&!x.checkValidity())||(n===1&&!f.querySelector('[name=puja]:checked')?{}:null);
    if(bad){cur.querySelector('.err').textContent=n===1?'Please choose a puja.':'Please fill the highlighted field correctly.';bad.focus?.();return false}cur.querySelector('.err').textContent='';return true};
  f.addEventListener('click',e=>{if(e.target.matches('[data-next]')&&ok())show(n+1);if(e.target.matches('[data-back]'))show(n-1)});
  f.addEventListener('change',e=>{if(e.target.name==='puja')setTimeout(()=>show(2),150)});
  f.addEventListener('submit',e=>{e.preventDefault();if(!ok())return;const v=Object.fromEntries(new FormData(f));
    const t=encodeURIComponent(`Namaste Online Pujari 🙏\nPuja: ${v.puja}\nFor: ${v.pkg||'-'}\nMode: ${v.mode}\nLanguage: ${v.lang}\nCity: ${v.city}\nDate: ${v.help?'Help me find an auspicious date':(v.date||'Flexible')}\nName: ${v.name}\nGotra: ${v.gotra||'-'}\nPhone: ${v.phone}`);
    window.open(`https://wa.me/${WA}?text=${t}`,'_blank','noopener');});
});
const bar=document.getElementById('bar');addEventListener('scroll',()=>{const h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+'%'},{passive:true});
const cards=()=>[...document.querySelectorAll('.list>a')];let cat='',q='';
const apply=()=>cards().forEach(c=>{c.style.display=(!cat||c.dataset.cat===cat)&&c.textContent.toLowerCase().includes(q)?'':'none'});
document.querySelector('[data-search]')?.addEventListener('input',e=>{q=e.target.value.toLowerCase();apply()});
document.querySelectorAll('.chipbar button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.chipbar button').forEach(x=>x.classList.remove('on'));b.classList.add('on');cat=b.dataset.c;apply()}));
document.querySelectorAll('a[data-wa]').forEach(a=>a.href=`https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.wa)}`);
const tx=document.getElementById('tx');try{if(sessionStorage.getItem('tx'))document.getElementById("toast")?.classList.add("off")}catch(e){}
tx?.addEventListener('click',()=>{document.getElementById("toast")?.classList.add("off");try{sessionStorage.setItem('tx','1')}catch(e){}});
const rot=document.getElementById('rot');if(rot&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const w=JSON.parse(rot.dataset.w);let i=0;setInterval(()=>{rot.style.opacity=0;setTimeout(()=>{i=(i+1)%w.length;rot.textContent=w[i];rot.style.opacity=1},350)},2400)}
document.querySelectorAll('form.full').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const bad=[...f.querySelectorAll('[required]')].find(x=>!x.checkValidity());if(bad){f.querySelector('.err').textContent='Please fill the required fields.';bad.focus();return}
 const v=Object.fromEntries(new FormData(f));const t=encodeURIComponent(`Namaste Online Pujari 🙏\nPuja: ${v.puja}\nLanguage: ${v.lang}\nCity: ${v.city}\nDate: ${v.dpref==='help'?'Help me find an auspicious date':(v.date||'Flexible')}\nName: ${v.name}\nPhone: ${v.phone}\nNotes: ${v.notes||'-'}`);window.open(`https://wa.me/${WA}?text=${t}`,'_blank','noopener')}));
