
  /* ==========================================================================
   EXPERIENCES FILTER SYSTEM
========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = Array.from(
    document.querySelectorAll(
      '.filter--btn[filter="country"], .filter--btn[filter="experience"]'
    )
  );

  const resetButton = document.querySelector(
    '.filter--btn[filter="reset"]'
  );

  const items = Array.from(
    document.querySelectorAll(".experiences--list > .w-dyn-item")
  );

  const emptyResults = document.querySelector(".empty--results");

  if (!filterButtons.length || !items.length) return;


  /* ==========================================================================
     FILTER STATE
  ========================================================================== */

  const activeFilters = {
    country: null,
    experience: null
  };

  const animationDuration = 300;


  /* ==========================================================================
     NORMALIZE VALUES
  ========================================================================== */

  function normalizeValue(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }


  /* ==========================================================================
     GET ITEM FILTER VALUE
  ========================================================================== */

  function getItemFilterValue(item, type) {
    const content = item.querySelector(".experience--content") || item;

    /*
     * Structure correcte :
     * <div filter-key="country">France</div>
     * <div filter-key="experience">High</div>
     */
    let field = content.querySelector(`[filter-key="${type}"]`);

    /*
     * Compatibilité avec la structure actuelle :
     * <div country="experience">High</div>
     */
    if (!field && type === "experience") {
      field = content.querySelector('[country="experience"]');
    }

    /*
     * Compatibilité supplémentaire éventuelle :
     * <div experience="country">France</div>
     */
    if (!field && type === "country") {
      field = content.querySelector('[experience="country"]');
    }

    return field ? normalizeValue(field.textContent) : "";
  }


  /* ==========================================================================
     CHECK IF ITEM MATCHES
  ========================================================================== */

  function itemMatchesFilter(item) {
    const selectedCountry = activeFilters.country;
    const selectedExperience = activeFilters.experience;

    const itemCountry = getItemFilterValue(item, "country");
    const itemExperience = getItemFilterValue(item, "experience");

    const countryMatches =
      !selectedCountry ||
      itemCountry
        .split(",")
        .map(normalizeValue)
        .includes(selectedCountry);

    const experienceMatches =
      !selectedExperience ||
      itemExperience
        .split(",")
        .map(normalizeValue)
        .includes(selectedExperience);

    /*
     * Les groupes Country et Experience fonctionnent en AND :
     * l'élément doit correspondre aux deux filtres actifs.
     */
    return countryMatches && experienceMatches;
  }


  /* ==========================================================================
     UPDATE FILTERED ITEMS
  ========================================================================== */

  function updateItems() {
    let visibleItemsCount = 0;

    items.forEach(function (item) {
      const shouldShow = itemMatchesFilter(item);

      if (shouldShow) {
        visibleItemsCount += 1;

        item.classList.remove(
          "is--filtered-out",
          "is--filtering-out"
        );

        /*
         * Force le navigateur à prendre en compte le display
         * avant de lancer l'apparition.
         */
        void item.offsetHeight;
      } else {
        item.classList.add("is--filtering-out");

        window.setTimeout(function () {
          if (!itemMatchesFilter(item)) {
            item.classList.add("is--filtered-out");
          }
        }, animationDuration);
      }
    });

    updateEmptyResults(visibleItemsCount);
    updateResetButton();
  }


  /* ==========================================================================
     EMPTY RESULTS
  ========================================================================== */

  function updateEmptyResults(visibleItemsCount) {
    if (!emptyResults) return;

    if (visibleItemsCount === 0) {
      emptyResults.classList.add("is--visible");

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          emptyResults.classList.add("is--animated");
        });
      });
    } else {
      emptyResults.classList.remove("is--animated");

      window.setTimeout(function () {
        if (visibleItemsCount !== 0) {
          emptyResults.classList.remove("is--visible");
        }
      }, 400);
    }
  }


  /* ==========================================================================
     OPEN FILTER DROPDOWN
  ========================================================================== */

  function openFilter(button) {
    closeAllFilters(button);
    button.classList.add("is--open");
    button.setAttribute("aria-expanded", "true");
  }


  /* ==========================================================================
     CLOSE FILTER DROPDOWN
  ========================================================================== */

  function closeFilter(button) {
    button.classList.remove("is--open");
    button.setAttribute("aria-expanded", "false");
  }


  /* ==========================================================================
     CLOSE ALL FILTER DROPDOWNS
  ========================================================================== */

  function closeAllFilters(exceptionButton) {
    filterButtons.forEach(function (button) {
      if (button !== exceptionButton) {
        closeFilter(button);
      }
    });
  }


  /* ==========================================================================
     UPDATE MAIN FILTER BUTTON
  ========================================================================== */

  function updateMainButton(button) {
    const type = button.getAttribute("filter");
    const links = Array.from(
      button.querySelectorAll(".filter--link")
    );

    const hasActiveLink = links.some(function (link) {
      return link.classList.contains("is--active");
    });

    button.classList.toggle("is--active", hasActiveLink);

    /*
     * Ajoute une information accessible sur le filtre actif.
     */
    if (activeFilters[type]) {
      button.setAttribute(
        "data-active-value",
        activeFilters[type]
      );
    } else {
      button.removeAttribute("data-active-value");
    }
  }


  /* ==========================================================================
     UPDATE RESET BUTTON
  ========================================================================== */

  function updateResetButton() {
    if (!resetButton) return;

    const hasActiveFilter = Object.values(activeFilters).some(
      function (value) {
        return Boolean(value);
      }
    );

    resetButton.classList.toggle(
      "is--available",
      hasActiveFilter
    );

    resetButton.setAttribute(
      "aria-disabled",
      hasActiveFilter ? "false" : "true"
    );
  }


  /* ==========================================================================
     SELECT FILTER OPTION
  ========================================================================== */

  function selectFilterOption(button, selectedLink) {
    const type = button.getAttribute("filter");
    const value = normalizeValue(selectedLink.textContent);

    const links = Array.from(
      button.querySelectorAll(".filter--link")
    );

    const isAlreadyActive =
      selectedLink.classList.contains("is--active");

    /*
     * Une seule valeur active par groupe.
     */
    links.forEach(function (link) {
      link.classList.remove("is--active");
      link.setAttribute("aria-selected", "false");
    });

    /*
     * Un second clic sur la même option la désactive.
     */
    if (isAlreadyActive) {
      activeFilters[type] = null;
    } else {
      activeFilters[type] = value;

      selectedLink.classList.add("is--active");
      selectedLink.setAttribute("aria-selected", "true");
    }

    updateMainButton(button);
    updateItems();
    closeFilter(button);
  }


  /* ==========================================================================
     RESET ALL FILTERS
  ========================================================================== */

  function resetAllFilters() {
    activeFilters.country = null;
    activeFilters.experience = null;

    filterButtons.forEach(function (button) {
      button.classList.remove("is--active", "is--open");
      button.removeAttribute("data-active-value");
      button.setAttribute("aria-expanded", "false");

      button
        .querySelectorAll(".filter--link")
        .forEach(function (link) {
          link.classList.remove("is--active");
          link.setAttribute("aria-selected", "false");
        });
    });

    items.forEach(function (item) {
      item.classList.remove(
        "is--filtered-out",
        "is--filtering-out"
      );
    });

    updateItems();
  }


  /* ==========================================================================
     INITIALIZE FILTER BUTTONS
  ========================================================================== */

  filterButtons.forEach(function (button) {
    const dropdown = button.querySelector(".filter--drop");
    const links = Array.from(
      button.querySelectorAll(".filter--link")
    );

    button.setAttribute("aria-expanded", "false");

    /*
     * Ouverture au clic sur le bouton,
     * mais pas au clic dans le dropdown.
     */
    button.addEventListener("click", function (event) {
      const clickedLink = event.target.closest(".filter--link");

      if (clickedLink) return;

      /*
       * Empêche la fermeture si l'utilisateur clique
       * dans une zone vide du dropdown.
       */
      if (
        dropdown &&
        dropdown.contains(event.target)
      ) {
        return;
      }

      const isOpen = button.classList.contains("is--open");

      if (isOpen) {
        closeFilter(button);
      } else {
        openFilter(button);
      }
    });

    /*
     * Sélection des options.
     */
    links.forEach(function (link) {
      link.setAttribute("aria-selected", "false");

      link.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        selectFilterOption(button, link);
      });
    });
  });


  /* ==========================================================================
     RESET BUTTON
  ========================================================================== */

  if (resetButton) {
    resetButton.addEventListener("click", function (event) {
      event.preventDefault();

      if (
        !resetButton.classList.contains("is--available")
      ) {
        return;
      }

      resetAllFilters();
    });
  }


  /* ==========================================================================
     CLOSE ON OUTSIDE CLICK
  ========================================================================== */

  document.addEventListener("click", function (event) {
    const clickedInsideFilter = event.target.closest(
      '.filter--btn[filter="country"], .filter--btn[filter="experience"]'
    );

    if (!clickedInsideFilter) {
      closeAllFilters();
    }
  });


  /* ==========================================================================
     CLOSE WITH ESCAPE
  ========================================================================== */

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    closeAllFilters();
  });


  /* ==========================================================================
     INITIAL STATE
  ========================================================================== */

  updateResetButton();
  updateItems();
});
