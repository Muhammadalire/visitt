(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- floating hearts ---------- */
  function popHearts(x, y, count) {
    for (var i = 0; i < count; i++) {
      var h = document.createElement("span");
      h.className = "pop";
      h.textContent = "\u2665";
      h.style.left = x + "px";
      h.style.top = y + "px";
      h.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      h.style.setProperty("--dy", (-(Math.random() * 120 + 80)) + "px");
      h.style.setProperty("--size", (Math.random() * 18 + 14) + "px");
      h.style.setProperty("--dur", (Math.random() * 0.8 + 1.1) + "s");
      h.style.color = ["#ff3d77", "#ff8fb1", "#b9a2f0", "#ffb347"][Math.floor(Math.random() * 4)];
      document.body.appendChild(h);
      h.addEventListener("animationend", function (e) { e.target.remove(); });
    }
  }

  /* ---------- heart travelling along the dotted line ---------- */
  var route = document.getElementById("route");
  var heart = document.getElementById("travel-heart");
  var total = route.getTotalLength();
  var travelling = false;

  function place(t) {
    var p = route.getPointAtLength(total * t);
    heart.setAttribute("transform", "translate(" + p.x + " " + p.y + ")");
  }

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function send(direction, done) {
    if (reduceMotion) { place(direction > 0 ? 1 : 0); if (done) done(); return; }
    travelling = true;
    var start = null, ms = 2200;
    function frame(now) {
      if (!start) start = now;
      var t = Math.min((now - start) / ms, 1);
      place(direction > 0 ? ease(t) : 1 - ease(t));
      if (t < 1) { requestAnimationFrame(frame); }
      else { travelling = false; if (done) done(); }
    }
    requestAnimationFrame(frame);
  }

  var atHer = false;

  function arrive() {
    var r = heart.getBoundingClientRect();
    popHearts(r.left + r.width / 2, r.top + r.height / 2, 10);
  }

  // the single entrance moment: the heart sets off once on load
  place(0);
  setTimeout(function () {
    send(1, function () { atHer = true; arrive(); });
  }, 500);

  function bounce() {
    if (travelling) return;
    var r = heart.getBoundingClientRect();
    popHearts(r.left + r.width / 2, r.top + r.height / 2, 8);
    send(atHer ? -1 : 1, function () { atHer = !atHer; arrive(); });
  }

  heart.addEventListener("click", bounce);
  heart.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bounce(); }
  });

  /* ---------- photobooth frames ---------- */
  document.querySelectorAll(".frame").forEach(function (f) {
    f.addEventListener("click", function () {
      f.classList.remove("flash");
      void f.offsetWidth;
      f.classList.add("flash");
      var r = f.getBoundingClientRect();
      popHearts(r.left + r.width / 2, r.top + r.height / 2, 3);
    });
  });

  /* ---------- pinky promise ---------- */
  var promise = document.getElementById("promise");
  promise.addEventListener("click", function () {
    var r = promise.getBoundingClientRect();
    popHearts(r.left + r.width / 2, r.top, 36);
    promise.textContent = "Promised, forever";
    promise.classList.add("done");
  });

  /* ---------- background music on first click ---------- */
var bgMusic = new Audio("song.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5; // adjust 0.0 – 1.0 as you like
var musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  bgMusic.play().catch(function (err) {
    console.warn("Audio play blocked:", err);
    musicStarted = false; // allow retry on next click if it failed
  });
  document.removeEventListener("click", startMusic);
}

document.addEventListener("click", startMusic);
})();
