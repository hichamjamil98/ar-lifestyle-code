
/* ==========================================================================
   GLOBAL INIT
========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === "undefined") {
    console.warn("GSAP is missing.");
    return;
  }

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  const EASE = "power4.out";

  initButtonCharacterStagger();
  initRodButtons();
  initLoadAnimations(EASE);
  initSideNav(EASE);
  initScrollAnimations(EASE);
  initVimeoPlayers();
});

/* ==========================================================================
   1. BUTTON CHARACTER STAGGER
========================================================================== */

function initButtonCharacterStagger() {
  const buttons = document.querySelectorAll("[data-button-animate-chars]");
  const delayStep = 0.012;

  buttons.forEach((button) => {
    if (button.dataset.charsReady === "true") return;

    const text = button.textContent;
    button.innerHTML = "";

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.transitionDelay = `${index * delayStep}s`;
      button.appendChild(span);
    });

    button.dataset.charsReady = "true";
  });
}

/* ==========================================================================
   2. BTN ROD HOVER
========================================================================== */

function initRodButtons() {
  if (window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".btn--wrapper").forEach((button) => {
    const rod = button.querySelector(".btn--rod");
    const text = button.querySelector("p");

    if (!rod) return;

    gsap.set(rod, {
      transformOrigin: "left center",
      scaleX: 0.35,
      scaleY: 1
    });

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        ease: "expo.out",
        duration: 0.55
      }
    });

    tl.to(rod, {
      scaleX: 1,
      scaleY: 1.35
    }, 0);

    if (text) {
      tl.to(text, {
        x: 4
      }, 0);
    }

    button.addEventListener("mouseenter", () => tl.play());
    button.addEventListener("mouseleave", () => tl.reverse());
  });
}

/* ==========================================================================
   3. LOAD ANIMATIONS
========================================================================== */

function initLoadAnimations(EASE) {
  const tl = gsap.timeline({
    defaults: {
      ease: EASE
    }
  });

  tl.fromTo(
    '[animation="load"]',
    {
      opacity: 0,
      y: "1rem"
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08
    },
    0.1
  );

  tl.fromTo(
    '[animation="load-up"]',
    {
      opacity: 0,
      y: "2rem"
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.08
    },
    0.15
  );

  tl.fromTo(
    '[animation="load-left"]',
    {
      opacity: 0,
      x: "2rem"
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.9,
      stagger: 0.08
    },
    0.15
  );

  tl.fromTo(
    '[animation="load-right"]',
    {
      opacity: 0,
      x: "-2rem"
    },
    {
      opacity: 1,
      x: 0,
      duration: 0.9,
      stagger: 0.08
    },
    0.15
  );

  document.querySelectorAll('[animation="load-split"]').forEach((el) => {
    if (el.dataset.loadSplitReady === "true") return;

    const text = el.textContent.trim();

    el.innerHTML = `
      <span class="load-split__line-mask">
        <span class="load-split__line">${text}</span>
      </span>
    `;

    el.dataset.loadSplitReady = "true";

    const line = el.querySelector(".load-split__line");

    tl.fromTo(
      line,
      {
        yPercent: 110,
        opacity: 0
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.95
      },
      0.2
    );
  });
}

/* ==========================================================================
   4. SIDE NAV OPEN / CLOSE
========================================================================== */

function initSideNav(EASE) {
  const navLeft = document.querySelector(".nav--left");
  const trigger = document.querySelector(".nav--left");
  const sideNav = document.querySelector(".side--nav");
  const sidePanel = document.querySelector(".side--nav-menu");

  const iconOpen = document.querySelector(".menu--to-open");
  const iconClose = document.querySelector(".menu--to-close");

  if (!navLeft || !trigger || !sideNav || !sidePanel) return;

  const menuLinks = sideNav.querySelectorAll(".side--nav-menu .nav--link");
  const socials = sideNav.querySelectorAll(".social--link");
  const animatedItems = [...menuLinks, ...socials];

  let isOpen = false;
  let tl;
  let ignoreOutsideClick = false;

  gsap.set(sideNav, {
    display: "none",
    opacity: 0,
    pointerEvents: "none"
  });

  gsap.set(sidePanel, {
    x: "105%",
    opacity: 1
  });

  gsap.set(animatedItems, {
    opacity: 0,
    filter: "blur(6px)"
  });

  if (iconOpen) {
    gsap.set(iconOpen, {
      opacity: 1,
      scale: 1,
      rotate: 0
    });
  }

  if (iconClose) {
    gsap.set(iconClose, {
      opacity: 0,
      scale: 0.75,
      rotate: -90
    });
  }

  function lockScroll() {
    document.documentElement.classList.add("is--locked");
    document.body.classList.add("is--locked");
  }

  function unlockScroll() {
    document.documentElement.classList.remove("is--locked");
    document.body.classList.remove("is--locked");
  }

  function openMenu() {
    if (isOpen) return;
    isOpen = true;

    sideNav.classList.add("is--open");
    navLeft.classList.add("is--menu-open");
    lockScroll();

    if (tl) tl.kill();

    tl = gsap.timeline();

    tl.set(sideNav, {
      display: "flex",
      pointerEvents: "auto"
    })

    .to(sideNav, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    }, 0)

    .to(sidePanel, {
      x: "0%",
      duration: 0.85,
      ease: "expo.out"
    }, 0.04)

    .to(animatedItems, {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.65,
      stagger: 0.045,
      ease: "power2.out"
    }, 0.32);

    if (iconOpen) {
      tl.to(iconOpen, {
        opacity: 0,
        scale: 0.75,
        rotate: 90,
        duration: 0.35,
        ease: EASE
      }, 0);
    }

    if (iconClose) {
      tl.to(iconClose, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.45,
        ease: EASE
      }, 0.08);
    }
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;

    sideNav.classList.remove("is--open");
    navLeft.classList.remove("is--menu-open");
    unlockScroll();

    if (tl) tl.kill();

    tl = gsap.timeline();

    tl.to(animatedItems, {
      opacity: 0,
      filter: "blur(6px)",
      duration: 0.3,
      stagger: {
        each: 0.02,
        from: "end"
      },
      ease: "power2.inOut"
    }, 0)

    .to(sidePanel, {
      x: "105%",
      duration: 0.75,
      ease: "expo.inOut"
    }, 0.08)

    .to(sideNav, {
      opacity: 0,
      duration: 0.55,
      ease: "power2.inOut"
    }, 0.18);

    if (iconClose) {
      tl.to(iconClose, {
        opacity: 0,
        scale: 0.75,
        rotate: -90,
        duration: 0.35,
        ease: EASE
      }, 0);
    }

    if (iconOpen) {
      tl.to(iconOpen, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.45,
        ease: EASE
      }, 0.08);
    }

    tl.set(sideNav, {
      display: "none",
      pointerEvents: "none"
    });
  }

  trigger.addEventListener("click", (e) => {
    e.preventDefault();

    ignoreOutsideClick = true;

    setTimeout(() => {
      ignoreOutsideClick = false;
    }, 0);

    isOpen ? closeMenu() : openMenu();
  });

  document.addEventListener("pointerdown", (e) => {
    if (!isOpen) return;
    if (ignoreOutsideClick) return;

    if (sidePanel.contains(e.target)) return;
    if (trigger.contains(e.target)) return;

    closeMenu();
  });

  window.addEventListener("keydown", (e) => {
    if (!isOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

/* ==========================================================================
   5. SCROLL ANIMATIONS
========================================================================== */

function initScrollAnimations(EASE) {
  if (typeof ScrollTrigger === "undefined") return;

  initFadeAnimation('[animation="fade"]', { opacity: 0, y: "1rem" }, EASE);
  initFadeAnimation('[animation="fade-up"]', { opacity: 0, y: "2rem" }, EASE);
  initFadeAnimation('[animation="fade-left"]', { opacity: 0, x: "2rem" }, EASE);
  initFadeAnimation('[animation="fade-right"]', { opacity: 0, x: "-2rem" }, EASE);
  initFadeStagger(EASE);
  initFadeSplit(EASE);
}

function initFadeAnimation(selector, fromVars, EASE) {
  document.querySelectorAll(selector).forEach((el) => {
    gsap.fromTo(
      el,
      fromVars,
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      }
    );
  });
}

function initFadeStagger(EASE) {
  document.querySelectorAll('[animation="fade-stagger"]').forEach((parent) => {
    const children = parent.children;
    if (!children.length) return;

    gsap.fromTo(
      children,
      {
        opacity: 0,
        y: "1.5rem"
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: EASE,
        scrollTrigger: {
          trigger: parent,
          start: "top 85%",
          once: true
        }
      }
    );
  });
}

function initFadeSplit(EASE) {
  document.querySelectorAll('[animation="fade-split"]').forEach((el) => {
    if (el.dataset.fadeSplitReady === "true") return;

    const text = el.textContent.trim();

    el.innerHTML = `
      <span class="fade-split__line-mask">
        <span class="fade-split__line">${text}</span>
      </span>
    `;

    el.dataset.fadeSplitReady = "true";

    const line = el.querySelector(".fade-split__line");

    gsap.fromTo(
      line,
      {
        yPercent: 110,
        opacity: 0
      },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      }
    );
  });
}

/* ==========================================================================
   6. VIMEO PLAYER BASIC
========================================================================== */

function initVimeoPlayers() {
  if (typeof Vimeo === "undefined") return;

  const players = document.querySelectorAll("[data-vimeo-player-init]");

  players.forEach((wrapper) => {
    const iframe = wrapper.querySelector("iframe");
    const videoID = wrapper.getAttribute("data-vimeo-video-id");

    if (!iframe || !videoID) return;

    iframe.src = `https://player.vimeo.com/video/${videoID}?api=1&autoplay=0&muted=0&loop=0&background=0`;

    const player = new Vimeo.Player(iframe);

    const playBtn = wrapper.querySelector('[data-vimeo-control="play"]');
    const pauseBtn = wrapper.querySelector('[data-vimeo-control="pause"]');
    const muteBtn = wrapper.querySelector('[data-vimeo-control="mute"]');
    const fullscreenBtn = wrapper.querySelector('[data-vimeo-control="fullscreen"]');
    const timeline = wrapper.querySelector('[data-vimeo-control="timeline"]');
    const progress = wrapper.querySelector(".vimeo-player__timeline-progress");
    const durationEl = wrapper.querySelector("[data-vimeo-duration]");

    wrapper.setAttribute("data-vimeo-playing", "false");
    wrapper.setAttribute("data-vimeo-loaded", "false");

    player.ready().then(() => {
      wrapper.setAttribute("data-vimeo-loaded", "true");

      player.getDuration().then((duration) => {
        if (durationEl) durationEl.textContent = formatTime(duration);
      });
    });

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        player.play();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        player.pause();
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", async () => {
        const muted = await player.getMuted();
        player.setMuted(!muted);
        wrapper.setAttribute("data-vimeo-muted", String(!muted));
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => {
        const iframeEl = wrapper.querySelector("iframe");

        if (iframeEl.requestFullscreen) {
          iframeEl.requestFullscreen();
        }
      });
    }

    if (timeline) {
      timeline.addEventListener("input", async () => {
        const duration = await player.getDuration();
        const percent = Number(timeline.value);
        player.setCurrentTime((percent / 100) * duration);
      });
    }

    player.on("play", () => {
      wrapper.setAttribute("data-vimeo-playing", "true");
    });

    player.on("pause", () => {
      wrapper.setAttribute("data-vimeo-playing", "false");
    });

    player.on("ended", () => {
      wrapper.setAttribute("data-vimeo-playing", "false");
    });

    player.on("timeupdate", (data) => {
      const percent = data.percent * 100;

      if (timeline) timeline.value = percent;
      if (progress) progress.value = percent;
    });
  });
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}
