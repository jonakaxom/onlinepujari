// progressive enhancement: reveal on scroll, back-to-top
document.documentElement.classList.add('js');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const els=[...document.querySelectorAll('.cat,.row,.promise li,.steps li,.lg a,.strip li,.card')];
if(reduce||!('IntersectionObserver' in window))els.forEach(e=>e.classList.add('rv','in'));
else{const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{rootMargin:'0px 0px -8% 0px'});
  els.forEach((e,i)=>{e.classList.add('rv');e.style.transitionDelay=(i%4)*60+'ms';io.observe(e)})}
const up=document.getElementById('up');
if(up){addEventListener('scroll',()=>up.classList.toggle('on',scrollY>700),{passive:true});up.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}))}
