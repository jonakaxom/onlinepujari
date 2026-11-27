// progressive enhancement: reveal on scroll, back-to-top
document.documentElement.classList.add('js');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const els=[...document.querySelectorAll('.cat,.row,.promise li,.steps li,.lg a,.strip li,.card')];
if(reduce||!('IntersectionObserver' in window))els.forEach(e=>e.classList.add('rv','in'));
else{const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{rootMargin:'0px 0px -8% 0px'});
  els.forEach((e,i)=>{e.classList.add('rv');e.style.transitionDelay=(i%4)*60+'ms';io.observe(e)})}
const up=document.getElementById('up');
if(up){addEventListener('scroll',()=>up.classList.toggle('on',scrollY>700),{passive:true});up.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}))}
// tabs (puja flow), festival chips, listing filter, mobile book bar
document.querySelectorAll('[data-tabs]').forEach(w=>{const bs=[...w.querySelectorAll('.tl button')];bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>x.setAttribute('aria-selected',x===b));w.querySelectorAll('[data-p]').forEach(p=>p.hidden=p.dataset.p!==b.dataset.t)}))});
(()=>{const t=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);let first=true;
 document.querySelectorAll('#fch li[data-d],table.fest tr[data-d]').forEach(x=>{if(x.dataset.d<t)x.classList.add('past');else if(!x.dataset.n){const k=x.closest('table')?'t':'c';if(!document.querySelector('.next[data-k="'+k+'"]')){x.classList.add('next');x.dataset.k=k}}});
 [...document.querySelectorAll('#fch li:not(.past)')].slice(6).forEach(x=>x.classList.add('more'))})();
document.querySelectorAll('[data-open-form]').forEach(a=>a.addEventListener('click',e=>{const f=document.querySelector('aside form.book,form.book');if(f){e.preventDefault();f.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});const i=f.querySelector('input,select');i&&i.focus({preventScroll:true})}}));
// hero search -> services page prefill
(()=>{const q=new URLSearchParams(location.search).get('q'),i=document.querySelector('[data-search]');if(q&&i){i.value=q;i.dispatchEvent(new Event('input'))}})();
/* hero booking form: show the popular pujas first, "Show all" reveals the rest */
document.querySelectorAll('.hero .tiles-more').forEach(b=>{const t=b.previousElementSibling;if(!t)return;b.addEventListener('click',()=>{const o=t.classList.toggle('all');b.setAttribute('aria-expanded',o);b.textContent=o?'Show fewer pujas':'Show all pujas'})});
