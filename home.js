/* ==========================================================================
   LOADING SCREEN
========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") return;
  
    document.documentElement.classList.add("is-loading");
    document.body.classList.add("is-loading");
  
    const loader = document.querySelector(".loading--screen");
    const logo = document.querySelector(".brand--loading");
    const paths = gsap.utils.toArray(".brand--loading path");
    const page = document.querySelectorAll(".main-wrapper, .navbar");
  
    if (!loader || !logo || !paths.length) return;
  
    gsap.set(loader, {
      display: "flex",
      opacity: 1,
      pointerEvents: "auto"
    });
  
    gsap.set(page, {
      opacity: 0
    });
  
    paths.forEach((path) => {
      const length = path.getTotalLength();
  
      path.setAttribute("fill", "transparent");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "1.2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
  
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length
      });
    });
  
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.inOut"
      },
      onComplete() {
        loader.style.display = "none";
  
        document.documentElement.classList.remove("is-loading");
        document.body.classList.remove("is-loading");
      }
    });
  
    tl
      .to(paths, {
        strokeDashoffset: 0,
        stagger: 0.12,
        duration: 1.35,
        ease: "power2.inOut"
      })
  
      .to(paths, {
        attr: {
          fill: "currentColor"
        },
        duration: 0.35
      })
  
      .to(
        logo,
        {
          scale: 0.93,
          duration: 0.35
        },
        "-=0.1"
      )
  
      .to(
        page,
        {
          opacity: 1,
          duration: 0.5
        },
        "-=0.2"
      )
  
      .to(
        ".loading--title",
        {
          y: -12,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out"
        },
        "-=0.1"
      )
  
      .to(
        loader,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.55,
          ease: "expo.inOut",
          pointerEvents: "none"
        },
        "-=0.25"
      )
  
      .to(
        loader,
        {
          opacity: 0.98,
          duration: 1.55,
          ease: "none"
        },
        "<"
      );
  });
  
  
  /* ==========================================================================
     HERO VIMEO COVER RESIZE
  ========================================================================== */
  
  (function () {
    const VIDEO_RATIO = 16 / 9;
  
    function resizeVimeoCover(wrapper) {
      const iframe = wrapper.querySelector("iframe");
      if (!iframe) return;
  
      const wrapperWidth = wrapper.offsetWidth;
      const wrapperHeight = wrapper.offsetHeight;
      const wrapperRatio = wrapperWidth / wrapperHeight;
  
      if (wrapperRatio > VIDEO_RATIO) {
        iframe.style.width = wrapperWidth + "px";
        iframe.style.height = wrapperWidth / VIDEO_RATIO + "px";
      } else {
        iframe.style.height = wrapperHeight + "px";
        iframe.style.width = wrapperHeight * VIDEO_RATIO + "px";
      }
    }
  
    function initVimeoCovers() {
      document.querySelectorAll("[data-vimeo-cover]").forEach((wrapper) => {
        resizeVimeoCover(wrapper);
      });
    }
  
    window.addEventListener("load", initVimeoCovers);
    window.addEventListener("resize", initVimeoCovers);
  
    if (window.ResizeObserver) {
      document.querySelectorAll("[data-vimeo-cover]").forEach((wrapper) => {
        new ResizeObserver(() => {
          resizeVimeoCover(wrapper);
        }).observe(wrapper);
      });
    }
  })();
  
  
  /* ==========================================================================
     HERO VIDEO SWITCH + PROGRESS
  ========================================================================== */
  
  document.addEventListener("DOMContentLoaded", function () {
    const DURATION = 8;
  
    const videos = document.querySelectorAll("[video]");
    const buttons = document.querySelectorAll("[video-play]");
    const progress = document.querySelector(".progress--indicator");
  
    if (!videos.length || !buttons.length) return;
  
    let activeVideo = "1";
    let progressTween;
  
    const players = {};
  
    videos.forEach(function (videoWrapper) {
      const id = videoWrapper.getAttribute("video");
      const iframe = videoWrapper.querySelector("iframe");
  
      if (iframe && window.Vimeo) {
        players[id] = new Vimeo.Player(iframe);
      }
    });
  
    function resetProgress() {
      if (!progress || typeof gsap === "undefined") return;
  
      if (progressTween) progressTween.kill();
  
      gsap.set(progress, {
        width: "0%"
      });
  
      progressTween = gsap.to(progress, {
        width: "100%",
        duration: DURATION,
        ease: "none",
        repeat: -1,
        onRepeat: function () {
          playVideo(activeVideo);
        }
      });
    }
  
    function playVideo(id) {
      Object.keys(players).forEach(function (key) {
        const player = players[key];
  
        player.pause().catch(function () {});
  
        if (key === id) {
          player.setCurrentTime(0).catch(function () {});
          player.play().catch(function () {});
        }
      });
    }
  
    function setActiveVideo(id) {
      activeVideo = id;
  
      videos.forEach(function (videoWrapper) {
        const isActive = videoWrapper.getAttribute("video") === id;
        videoWrapper.classList.toggle("is-active", isActive);
      });
  
      buttons.forEach(function (button) {
        const isActive = button.getAttribute("video-play") === id;
        button.classList.toggle("is-active", isActive);
      });
  
      playVideo(id);
      resetProgress();
    }
  
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const id = button.getAttribute("video-play");
  
        if (!id || id === activeVideo) return;
  
        setActiveVideo(id);
      });
    });
  
    setActiveVideo("1");
  });
  
  
  /* ==========================================================================
     HOME EXPERIENCES SWIPER
  ========================================================================== */
  
  document.addEventListener("DOMContentLoaded", function () {
    if (typeof Swiper === "undefined") return;
  
    const swiperEl = document.querySelector(".swiper.is--home");
    if (!swiperEl) return;
  
    const indicator = document.querySelector(
      ".swiper--pagination.is--home .pagination--indicator"
    );
  
    const homeSwiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 800,
      loop: true,
      grabCursor: true,
      watchOverflow: true,
  
      observer: true,
      observeParents: true,
  
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
  
      autoplay: {
        delay: 4000,
        disableOnInteraction: false
      },
  
      on: {
        init: function () {
          updateHomeSwiperProgress(this);
        },
        slideChange: function () {
          updateHomeSwiperProgress(this);
        }
      }
    });
  
    function updateHomeSwiperProgress(swiper) {
      if (!indicator) return;
  
      const totalSlides = swiper.slides.filter(function (slide) {
        return !slide.classList.contains("swiper-slide-duplicate");
      }).length;
  
      const currentIndex = swiper.realIndex + 1;
      const progress = currentIndex / totalSlides;
  
      indicator.style.transform = "scaleX(" + progress + ")";
    }
  });