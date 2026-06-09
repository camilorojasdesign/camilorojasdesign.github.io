const h=document.querySelector("[data-header]"),m=document.querySelector("[data-menu]"),n=document.querySelector("[data-nav]"),y=document.querySelector("[data-year]");if(y)y.textContent=new Date().getFullYear();const s=()=>h&&h.classList.toggle("scrolled",scrollY>14);s();addEventListener("scroll",s,{passive:true});if(m&&n){
  // Ensure keyboard accessibility: focus first link when opened, close on Escape
  m.addEventListener("click",()=>{
    const o=m.getAttribute("aria-expanded")==="true";
    m.setAttribute("aria-expanded",String(!o));
    n.classList.toggle("open",!o);
    if(!o){
      const firstLink=n.querySelector('a');
      if(firstLink) firstLink.focus();
    } else {
      m.focus();
    }
  });
  n.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{m.setAttribute("aria-expanded","false");n.classList.remove("open")}));
  document.addEventListener('keydown', (ev)=>{
    if(ev.key==="Escape"){
      if(n.classList.contains('open')){
        n.classList.remove('open');
        m.setAttribute('aria-expanded','false');
        m.focus();
      }
    }
  });
}const r=document.querySelectorAll(".reveal");if(matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver"in window))r.forEach(e=>e.classList.add("show"));else{const o=new IntersectionObserver((es,ob)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("show");ob.unobserve(e.target)}}),{threshold:.1});r.forEach(e=>o.observe(e))}