/* ==========================================================================
   GALLERY SWIPER
========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  if (typeof Swiper === "undefined") return;

  const galleryElements = document.querySelectorAll(
    ".swiper.is--gallery"
  );

  if (!galleryElements.length) return;

  galleryElements.forEach(function (swiperElement) {
    initializeGallerySwiper(swiperElement);
  });


  /* ==========================================================================
     INITIALIZE GALLERY
  ========================================================================== */

  function initializeGallerySwiper(swiperElement) {
    const wrapper = swiperElement.querySelector(
      ".swiper-wrapper"
    );

    if (!wrapper) return;

    /*
     * Détruit une éventuelle ancienne instance.
     */
    if (swiperElement.swiper) {
      swiperElement.swiper.destroy(true, true);
    }

    /*
     * Supprime tous les clones créés par une ancienne version.
     */
    wrapper
      .querySelectorAll('[data-gallery-clone="true"]')
      .forEach(function (clone) {
        clone.remove();
      });

    /*
     * Nettoie les classes et styles Swiper existants.
     */
    swiperElement.classList.remove(
      "swiper-initialized",
      "swiper-horizontal",
      "swiper-vertical",
      "swiper-watch-progress",
      "swiper-backface-hidden",
      "is-repositioning"
    );

    swiperElement.style.removeProperty("overflow");

    wrapper.removeAttribute("style");
    wrapper.removeAttribute("id");
    wrapper.removeAttribute("aria-live");

    /*
     * Récupère uniquement les quatre slides originales.
     */
    const originalSlides = Array.from(
      wrapper.children
    ).filter(function (element) {
      return (
        element.classList.contains("swiper-slide") &&
        element.dataset.galleryClone !== "true"
      );
    });

    const totalSlides = originalSlides.length;

    if (totalSlides < 2) return;

    originalSlides.forEach(function (slide, index) {
      cleanSlide(slide);

      slide.dataset.galleryRealIndex = index;
      slide.dataset.galleryOriginal = "true";

      delete slide.dataset.galleryClone;
      delete slide.dataset.galleryGroup;
    });

    /*
     * Groupe de clones placé avant les originaux.
     */
    const previousFragment =
      document.createDocumentFragment();

    originalSlides.forEach(function (slide, index) {
      const clone = createGalleryClone(
        slide,
        index,
        "previous"
      );

      previousFragment.appendChild(clone);
    });

    wrapper.insertBefore(
      previousFragment,
      wrapper.firstChild
    );

    /*
     * Groupe de clones placé après les originaux.
     */
    const nextFragment =
      document.createDocumentFragment();

    originalSlides.forEach(function (slide, index) {
      const clone = createGalleryClone(
        slide,
        index,
        "next"
      );

      nextFragment.appendChild(clone);
    });

    wrapper.appendChild(nextFragment);

    const section = swiperElement.closest(".section");

    const indicator = section
      ? section.querySelector(
          ".swiper--pagination.is--gallery " +
          ".pagination--indicator"
        )
      : null;

    const gallerySwiper = new Swiper(swiperElement, {
      slidesPerView: "auto",
      centeredSlides: true,

      /*
       * Groupe gauche = 4 slides.
       * L'index 4 correspond donc à la première originale.
       */
      initialSlide: totalSlides,

      /*
       * Boucle manuelle stable.
       */
      loop: false,

      /*
       * Gap exact.
       */
      spaceBetween: getGalleryGap(),

      /*
       * Assez rapide, mais assez long pour bien voir le scale.
       */
      speed: 380,

      grabCursor: true,
      watchOverflow: false,
      watchSlidesProgress: true,

      observer: false,
      observeParents: false,
      observeSlideChildren: false,

      resistance: true,
      resistanceRatio: 0.7,

      threshold: 3,

      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.15,
      longSwipesMs: 180,

      preventClicks: true,
      preventClicksPropagation: true,

      keyboard: {
        enabled: true,
        onlyInViewport: true
      },

      autoplay: {
        delay: 1900,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
        waitForTransition: true
      },

      on: {
        init: function () {
          const swiper = this;

          /*
           * Place immédiatement la première originale au centre.
           */
          swiper.slideTo(totalSlides, 0, false);

          requestAnimationFrame(function () {
            updateGalleryStates(swiper);
            updateGalleryProgress(
              swiper,
              indicator,
              totalSlides
            );
          });
        },

        slideChangeTransitionStart: function () {
          updateGalleryStates(this);

          updateGalleryProgress(
            this,
            indicator,
            totalSlides
          );
        },

        slideChange: function () {
          updateGalleryStates(this);

          updateGalleryProgress(
            this,
            indicator,
            totalSlides
          );
        },

        transitionEnd: function () {
          normalizeGalleryPosition(
            this,
            swiperElement,
            totalSlides
          );

          updateGalleryStates(this);

          updateGalleryProgress(
            this,
            indicator,
            totalSlides
          );
        },

        resize: function () {
          this.params.spaceBetween =
            getGalleryGap();

          this.update();

          normalizeGalleryPosition(
            this,
            swiperElement,
            totalSlides
          );

          updateGalleryStates(this);

          updateGalleryProgress(
            this,
            indicator,
            totalSlides
          );
        }
      }
    });
  }


  /* ==========================================================================
     CREATE GALLERY CLONE
  ========================================================================== */

  function createGalleryClone(
    originalSlide,
    realIndex,
    group
  ) {
    const clone = originalSlide.cloneNode(true);

    cleanSlide(clone);

    clone.dataset.galleryClone = "true";
    clone.dataset.galleryGroup = group;
    clone.dataset.galleryRealIndex = realIndex;

    delete clone.dataset.galleryOriginal;

    clone.removeAttribute("id");

    clone.querySelectorAll("[id]").forEach(function (element) {
      element.removeAttribute("id");
    });

    return clone;
  }


  /* ==========================================================================
     CLEAN SLIDE
  ========================================================================== */

  function cleanSlide(slide) {
    slide.classList.remove(
      "swiper-slide-active",
      "swiper-slide-prev",
      "swiper-slide-next",
      "swiper-slide-visible",
      "swiper-slide-fully-visible",
      "is-gallery-active",
      "is-gallery-prev",
      "is-gallery-next"
    );

    slide.removeAttribute("style");
    slide.removeAttribute("aria-label");
    slide.removeAttribute("aria-hidden");
    slide.removeAttribute("data-swiper-slide-index");
  }


  /* ==========================================================================
     GALLERY VISUAL STATES
  ========================================================================== */

  function updateGalleryStates(swiper) {
    const slides = Array.from(swiper.slides);
    const activeIndex = swiper.activeIndex;

    slides.forEach(function (slide, index) {
      slide.classList.toggle(
        "is-gallery-active",
        index === activeIndex
      );

      slide.classList.toggle(
        "is-gallery-prev",
        index === activeIndex - 1
      );

      slide.classList.toggle(
        "is-gallery-next",
        index === activeIndex + 1
      );

      const isVisible =
        index === activeIndex ||
        index === activeIndex - 1 ||
        index === activeIndex + 1;

      slide.setAttribute(
        "aria-hidden",
        isVisible ? "false" : "true"
      );
    });
  }


  /* ==========================================================================
     NORMALIZE INFINITE POSITION
  ========================================================================== */

  function normalizeGalleryPosition(
    swiper,
    swiperElement,
    totalSlides
  ) {
    const activeIndex = swiper.activeIndex;

    let destinationIndex = null;

    /*
     * Groupe cloné de gauche.
     */
    if (activeIndex < totalSlides) {
      destinationIndex =
        activeIndex + totalSlides;
    }

    /*
     * Groupe cloné de droite.
     */
    if (activeIndex >= totalSlides * 2) {
      destinationIndex =
        activeIndex - totalSlides;
    }

    if (destinationIndex === null) return;

    /*
     * Désactive temporairement les transitions visuelles.
     */
    swiperElement.classList.add(
      "is-repositioning"
    );

    swiper.slideTo(
      destinationIndex,
      0,
      false
    );

    updateGalleryStates(swiper);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        swiperElement.classList.remove(
          "is-repositioning"
        );
      });
    });
  }


  /* ==========================================================================
     GALLERY GAP
  ========================================================================== */

  function getGalleryGap() {
    return window.innerWidth <= 767
      ? 16
      : 30;
  }


  /* ==========================================================================
     GALLERY PROGRESS
  ========================================================================== */

  function updateGalleryProgress(
    swiper,
    indicator,
    totalSlides
  ) {
    if (!indicator || !totalSlides) return;

    const activeSlide =
      swiper.slides[swiper.activeIndex];

    if (!activeSlide) return;

    const realIndex = Number(
      activeSlide.dataset.galleryRealIndex || 0
    );

    const progress =
      (realIndex + 1) / totalSlides;

    indicator.style.transform =
      "scaleX(" + progress + ")";
  }
});
