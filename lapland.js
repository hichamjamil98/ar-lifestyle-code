/* ==========================================================================
   MAP - ROD DRAW ON SCROLL
========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const rods = document.querySelectorAll(".map--rod");
  
    if (!rods.length) return;
  
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
  
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35
      }
    );
  
    rods.forEach(function (rod) {
      observer.observe(rod);
    });
  });