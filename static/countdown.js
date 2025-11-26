   //  countdown script
(function(){
  // Set target in Eastern time (EDT = -04:00 during summer, -05:00 during winter; 
  // calculated based on difference from UTC)
  const target = new Date("2025-11-22T00:00:00-05:00");

  function pad(n){ return String(n).padStart(2,'0'); }

  function tick(){
    const now = new Date().getTime();
    const distance = target.getTime() - now;

    if (distance <= 0){
      document.getElementById("countdown").textContent = "HARVARD YALE";
      clearInterval(timer);
      return;
    }
    const d = Math.floor(distance / (1000*60*60*24));
    const h = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
    const m = Math.floor((distance % (1000*60*60)) / (1000*60));
    const s = Math.floor((distance % (1000*60)) / 1000);
    document.getElementById("countdown").textContent =
      d + "d " + pad(h) + "h " + pad(m) + "m " + pad(s) + "s";
  }

  tick(); // paint immediately
  const timer = setInterval(tick, 1000);
})();