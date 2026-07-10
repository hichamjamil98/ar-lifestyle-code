
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
  initVimeoPlayer();
  initVimeoBGVideo();
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

function initVimeoPlayer() {
  if (typeof Vimeo === "undefined") return;

  const vimeoPlayers = document.querySelectorAll("[data-vimeo-player-init]");

  vimeoPlayers.forEach(function (vimeoElement, index) {
    if (vimeoElement.dataset.vimeoInitialized === "true") return;

    const vimeoVideoID = vimeoElement.getAttribute("data-vimeo-video-id");
    if (!vimeoVideoID) return;

    const iframe = vimeoElement.querySelector("iframe");
    if (!iframe) return;

    vimeoElement.dataset.vimeoInitialized = "true";

    const vimeoVideoURL = `https://player.vimeo.com/video/${vimeoVideoID}?api=1&autoplay=0&loop=0`;
    iframe.setAttribute("src", vimeoVideoURL);

    const videoIndexID = "vimeo-player-advanced-index-" + index;
    vimeoElement.setAttribute("id", videoIndexID);

    const iframeID = vimeoElement.id;
    const player = new Vimeo.Player(iframeID);

    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      player.getVideoWidth().then(function (width) {
        player.getVideoHeight().then(function (height) {
          const beforeEl = vimeoElement.querySelector(".vimeo-player__before");
          if (beforeEl) {
            beforeEl.style.paddingTop = (height / width) * 100 + "%";
          }
        });
      });
    }

    let videoAspectRatio;

    if (vimeoElement.getAttribute("data-vimeo-update-size") === "cover") {
      player.getVideoWidth().then(function (width) {
        player.getVideoHeight().then(function (height) {
          videoAspectRatio = height / width;
          const beforeEl = vimeoElement.querySelector(".vimeo-player__before");
          if (beforeEl) {
            beforeEl.style.paddingTop = "0%";
          }
          adjustVideoSizing();
        });
      });
    }

    function adjustVideoSizing() {
      const containerRatio =
        vimeoElement.offsetHeight / vimeoElement.offsetWidth;

      const iframeWrapper = vimeoElement.querySelector(".vimeo-player__iframe");
      if (iframeWrapper && videoAspectRatio) {
        if (containerRatio > videoAspectRatio) {
          const widthFactor = containerRatio / videoAspectRatio;
          iframeWrapper.style.width = widthFactor * 100 + "%";
          iframeWrapper.style.height = "100%";
        } else {
          const heightFactor = videoAspectRatio / containerRatio;
          iframeWrapper.style.height = heightFactor * 100 + "%";
          iframeWrapper.style.width = "100%";
        }
      }
    }

    if (vimeoElement.getAttribute("data-vimeo-update-size") === "cover") {
      window.addEventListener("resize", adjustVideoSizing);
    }

    player.on("loaded", function () {
      vimeoElement.setAttribute("data-vimeo-loaded", "true");
    });

    player.on("play", function () {
      vimeoElement.setAttribute("data-vimeo-playing", "true");
    });

    if (vimeoElement.getAttribute("data-vimeo-autoplay") === "false") {
      player.setVolume(1);
      player.pause();
    } else {
      player.setVolume(0);
      vimeoElement.setAttribute("data-vimeo-muted", "true");

      if (vimeoElement.getAttribute("data-vimeo-paused-by-user") === "false") {
        function checkVisibility() {
          const rect = vimeoElement.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          inView ? vimeoPlayerPlay() : vimeoPlayerPause();
        }

        checkVisibility();
        window.addEventListener("scroll", checkVisibility);
      }
    }

    function vimeoPlayerPlay() {
      vimeoElement.setAttribute("data-vimeo-activated", "true");
      vimeoElement.setAttribute("data-vimeo-playing", "true");
      player.play();
    }

    function vimeoPlayerPause() {
      player.pause();
    }

    player.on("pause", function () {
      vimeoElement.setAttribute("data-vimeo-playing", "false");
    });

    const playBtn = vimeoElement.querySelector('[data-vimeo-control="play"]');
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        player.setVolume(0);
        vimeoPlayerPlay();

        if (vimeoElement.getAttribute("data-vimeo-muted") === "true") {
          player.setVolume(0);
        } else {
          player.setVolume(1);
        }
      });
    }

    const pauseBtn = vimeoElement.querySelector('[data-vimeo-control="pause"]');
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        vimeoPlayerPause();
        if (vimeoElement.getAttribute("data-vimeo-autoplay") === "true") {
          vimeoElement.setAttribute("data-vimeo-paused-by-user", "true");
          window.removeEventListener("scroll", checkVisibility);
        }
      });
    }

    const muteBtn = vimeoElement.querySelector('[data-vimeo-control="mute"]');
    if (muteBtn) {
      muteBtn.addEventListener("click", function () {
        if (vimeoElement.getAttribute("data-vimeo-muted") === "false") {
          player.setVolume(0);
          vimeoElement.setAttribute("data-vimeo-muted", "true");
        } else {
          player.setVolume(1);
          vimeoElement.setAttribute("data-vimeo-muted", "false");
        }
      });
    }

    const fullscreenSupported = !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );

    const fullscreenBtn = vimeoElement.querySelector(
      '[data-vimeo-control="fullscreen"]',
    );

    if (!fullscreenSupported && fullscreenBtn) {
      fullscreenBtn.style.display = "none";
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => {
        const fullscreenElement = document.getElementById(iframeID);
        if (!fullscreenElement) return;

        const isFullscreen =
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement;

        if (isFullscreen) {
          vimeoElement.setAttribute("data-vimeo-fullscreen", "false");
          (
            document.exitFullscreen ||
            document.webkitExitFullscreen ||
            document.mozCancelFullScreen ||
            document.msExitFullscreen
          ).call(document);
        } else {
          vimeoElement.setAttribute("data-vimeo-fullscreen", "true");
          (
            fullscreenElement.requestFullscreen ||
            fullscreenElement.webkitRequestFullscreen ||
            fullscreenElement.mozRequestFullScreen ||
            fullscreenElement.msRequestFullscreen
          ).call(fullscreenElement);
        }
      });
    }

    const handleFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      vimeoElement.setAttribute(
        "data-vimeo-fullscreen",
        isFullscreen ? "true" : "false",
      );
    };

    [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "msfullscreenchange",
    ].forEach((event) => {
      document.addEventListener(event, handleFullscreenChange);
    });

    function secondsTimeSpanToHMS(s) {
      let h = Math.floor(s / 3600);
      s -= h * 3600;
      let m = Math.floor(s / 60);
      s -= m * 60;
      return m + ":" + (s < 10 ? "0" + s : s);
    }

    const vimeoDuration = vimeoElement.querySelector("[data-vimeo-duration]");
    player.getDuration().then(function (duration) {
      if (vimeoDuration) {
        vimeoDuration.textContent = secondsTimeSpanToHMS(duration);
      }
      const timelineAndProgress = vimeoElement.querySelectorAll(
        '[data-vimeo-control="timeline"], progress',
      );
      timelineAndProgress.forEach((el) => {
        el.setAttribute("max", duration);
      });
    });

    const timelineElem = vimeoElement.querySelector(
      '[data-vimeo-control="timeline"]',
    );
    const progressElem = vimeoElement.querySelector("progress");

    function updateTimelineValue() {
      player.getDuration().then(function () {
        const timeVal = timelineElem.value;
        player.setCurrentTime(timeVal);
        if (progressElem) {
          progressElem.value = timeVal;
        }
      });
    }

    if (timelineElem) {
      ["input", "change"].forEach((evt) => {
        timelineElem.addEventListener(evt, updateTimelineValue);
      });
    }

    player.on("timeupdate", function (data) {
      if (timelineElem) {
        timelineElem.value = data.seconds;
      }
      if (progressElem) {
        progressElem.value = data.seconds;
      }
      if (vimeoDuration) {
        vimeoDuration.textContent = secondsTimeSpanToHMS(
          Math.trunc(data.seconds),
        );
      }
    });

    let vimeoHoverTimer;
    vimeoElement.addEventListener("mousemove", function () {
      if (vimeoElement.getAttribute("data-vimeo-hover") === "false") {
        vimeoElement.setAttribute("data-vimeo-hover", "true");
      }
      clearTimeout(vimeoHoverTimer);
      vimeoHoverTimer = setTimeout(vimeoHoverTrue, 3000);
    });

    function vimeoHoverTrue() {
      vimeoElement.setAttribute("data-vimeo-hover", "false");
    }

    function vimeoOnEnd() {
      if (vimeoElement.getAttribute("data-vimeo-autoplay") === "false") {
        vimeoElement.setAttribute("data-vimeo-activated", "false");
        vimeoElement.setAttribute("data-vimeo-playing", "false");
        player.unload();
      } else {
        player.play();
      }
    }
    player.on("ended", vimeoOnEnd);
  });
}

/* ==========================================================================
   5. VIMEO BACKGROUND VIDEO
========================================================================== */

function initVimeoBGVideo() {
  const vimeoPlayers = document.querySelectorAll("[data-vimeo-bg-init]");

  vimeoPlayers.forEach(function (vimeoElement, index) {
    const vimeoVideoID = vimeoElement.getAttribute("data-vimeo-video-id");
    if (!vimeoVideoID) return;
    const vimeoVideoURL = `https://player.vimeo.com/video/${vimeoVideoID}?api=1&background=1&autoplay=0&loop=1&muted=1`;
    vimeoElement.querySelector("iframe").setAttribute("src", vimeoVideoURL);

    const videoIndexID = "vimeo-bg-index-" + index;
    vimeoElement.setAttribute("id", videoIndexID);

    const iframeID = vimeoElement.id;
    const player = new Vimeo.Player(iframeID);

    let videoAspectRatio;

    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      player.getVideoWidth().then(function (width) {
        player.getVideoHeight().then(function (height) {
          videoAspectRatio = height / width;
          const beforeEl = vimeoElement.querySelector(".vimeo-bg__before");
          if (beforeEl) {
            beforeEl.style.paddingTop = videoAspectRatio * 100 + "%";
          }
        });
      });
    }

    function adjustVideoSizing() {
      const containerAspectRatio =
        (vimeoElement.offsetHeight / vimeoElement.offsetWidth) * 100;

      const iframeWrapper = vimeoElement.querySelector(
        ".vimeo-bg__iframe-wrapper",
      );
      if (iframeWrapper && videoAspectRatio) {
        if (containerAspectRatio > videoAspectRatio * 100) {
          iframeWrapper.style.width = `${
            (containerAspectRatio / (videoAspectRatio * 100)) * 100
          }%`;
        } else {
          iframeWrapper.style.width = "";
        }
      }
    }

    if (vimeoElement.getAttribute("data-vimeo-update-size") === "true") {
      adjustVideoSizing();
      player.getVideoWidth().then(function () {
        player.getVideoHeight().then(function () {
          adjustVideoSizing();
        });
      });
    } else {
      adjustVideoSizing();
    }

    window.addEventListener("resize", adjustVideoSizing);

    player.on("play", function () {
      vimeoElement.setAttribute("data-vimeo-loaded", "true");
    });

    if (vimeoElement.getAttribute("data-vimeo-autoplay") === "false") {
      player.pause();
    } else {
      if (vimeoElement.getAttribute("data-vimeo-paused-by-user") === "false") {
        function checkVisibility() {
          const rect = vimeoElement.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          inView ? vimeoPlayerPlay() : vimeoPlayerPause();
        }

        checkVisibility();
        window.addEventListener("scroll", checkVisibility);
      }
    }

    function vimeoPlayerPlay() {
      vimeoElement.setAttribute("data-vimeo-activated", "true");
      vimeoElement.setAttribute("data-vimeo-playing", "true");
      player.play();
    }

    function vimeoPlayerPause() {
      player.pause();
    }

    player.on("pause", function () {
      vimeoElement.setAttribute("data-vimeo-playing", "false");
    });

    const playBtn = vimeoElement.querySelector('[data-vimeo-control="play"]');
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        vimeoPlayerPlay();
      });
    }

    const pauseBtn = vimeoElement.querySelector('[data-vimeo-control="pause"]');
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        vimeoPlayerPause();
        if (vimeoElement.getAttribute("data-vimeo-autoplay") === "true") {
          vimeoElement.setAttribute("data-vimeo-paused-by-user", "true");
          window.removeEventListener("scroll", checkVisibility);
        }
      });
    }
  });
}
