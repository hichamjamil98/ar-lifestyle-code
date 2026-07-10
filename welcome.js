
/* ==========================================================================
   BOOKING PAGE
   - Phone fields
   - Date pickers
   - Safari custom select fix
========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initializePhoneFields();
  initializeDatePickers();
  initializeCustomSelects();
});

/* ==========================================================================
   PHONE FIELDS - COUNTRY DETECTION + FORMATTING
========================================================================== */

function initializePhoneFields() {
  if (typeof window.intlTelInput !== "function") {
    console.warn("intl-tel-input n'est pas chargé.");
    return;
  }

  let countryLookupPromise = null;

  /* ------------------------------------------------------------------------
     COUNTRY LOOKUP
  ------------------------------------------------------------------------ */

  function detectVisitorCountry() {
    if (countryLookupPromise) return countryLookupPromise;

    countryLookupPromise = fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Country lookup failed");
        }

        return response.json();
      })
      .then(function (data) {
        const countryCode =
          data && typeof data.country_code === "string"
            ? data.country_code.trim().toLowerCase()
            : "";

        return countryCode || "ma";
      })
      .catch(function (error) {
        console.warn(
          "Détection du pays impossible, utilisation de MA.",
          error
        );

        return "ma";
      });

    return countryLookupPromise;
  }

  /* ------------------------------------------------------------------------
     INITIALIZE ONE PHONE INPUT
  ------------------------------------------------------------------------ */

  function initializePhoneInput(input) {
    if (!input || input.dataset.itiInitialized === "true") return;

    input.dataset.itiInitialized = "true";

    const originalName =
      input.getAttribute("name") || "Phone-number";

    const fullNumberName =
      originalName + "-full";

    const countryName =
      originalName + "-country";

    const iti = window.intlTelInput(input, {
      allowDropdown: true,
      separateDialCode: true,
      showSelectedDialCode: true,
      countrySearch: true,
      nationalMode: true,
      autoPlaceholder: "polite",

      initialCountryLookup: detectVisitorCountry,

      loadUtils: function () {
        return import(
          "https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.2/build/js/utils.js"
        );
      },

      hiddenInput: function () {
        return {
          phone: fullNumberName,
          country: countryName
        };
      }
    });

    input._intlTelInputInstance = iti;

    /* ----------------------------------------------------------------------
       PRESERVE PHONE FIELD SPACING
    ---------------------------------------------------------------------- */

    function preserveFieldSpacing() {
      input.style.setProperty(
        "padding-left",
        "6rem",
        "important"
      );

      const wrapper = input.closest(".iti");
      if (!wrapper) return;

      const selectedCountry =
        wrapper.querySelector(".iti__selected-country");

      const selectedCountryPrimary =
        wrapper.querySelector(
          ".iti__selected-country-primary"
        );

      if (selectedCountry) {
        selectedCountry.style.setProperty(
          "padding",
          "0",
          "important"
        );
      }

      if (selectedCountryPrimary) {
        selectedCountryPrimary.style.setProperty(
          "padding",
          "0",
          "important"
        );
      }
    }

    preserveFieldSpacing();
    requestAnimationFrame(preserveFieldSpacing);

    setTimeout(preserveFieldSpacing, 100);
    setTimeout(preserveFieldSpacing, 500);

    input.addEventListener(
      "countrychange",
      preserveFieldSpacing
    );

    /* ----------------------------------------------------------------------
       COUNTRY FALLBACK
    ---------------------------------------------------------------------- */

    detectVisitorCountry().then(function (countryCode) {
      const selectedCountry =
        iti.getSelectedCountryData();

      if (
        !selectedCountry ||
        !selectedCountry.iso2
      ) {
        iti.setCountry(countryCode || "ma");
      }

      preserveFieldSpacing();
    });
  }

  /* ------------------------------------------------------------------------
     INITIALIZE ALL PHONE INPUTS
  ------------------------------------------------------------------------ */

  function initializeAllPhoneInputs(root) {
    const context = root || document;

    if (
      context.matches &&
      context.matches(".text--field.is--phone")
    ) {
      initializePhoneInput(context);
    }

    if (
      typeof context.querySelectorAll === "function"
    ) {
      context
        .querySelectorAll(".text--field.is--phone")
        .forEach(initializePhoneInput);
    }
  }

  initializeAllPhoneInputs(document);

  /* ------------------------------------------------------------------------
     WATCH DYNAMICALLY ADDED PHONE INPUTS
  ------------------------------------------------------------------------ */

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (!(node instanceof HTMLElement)) return;

        initializeAllPhoneInputs(node);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/* ==========================================================================
   DATE PICKERS - PAIRS LOGIC
========================================================================== */

function initializeDatePickers() {
  if (typeof window.flatpickr !== "function") {
    console.warn("Flatpickr n'est pas chargé.");
    return;
  }

  const dateInputs = Array.from(
    document.querySelectorAll(".text--field.is--date")
  );

  if (!dateInputs.length) return;

  const datePickers = [];

  /* ------------------------------------------------------------------------
     INITIALIZE ALL DATE INPUTS
  ------------------------------------------------------------------------ */

  dateInputs.forEach(function (input) {
    if (
      input.dataset.datepickerInitialized === "true"
    ) {
      return;
    }

    input.dataset.datepickerInitialized = "true";

    const picker = window.flatpickr(input, {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "F j, Y",

      allowInput: false,
      clickOpens: true,
      disableMobile: true,
      minDate: "today",
      monthSelectorType: "static",

      locale: {
        firstDayOfWeek: 1
      },

      onReady: function (
        selectedDates,
        dateStr,
        instance
      ) {
        const visibleInput = instance.altInput;
        if (!visibleInput) return;

        visibleInput.className = input.className;

        visibleInput.classList.add(
          "flatpickr-input"
        );

        visibleInput.placeholder =
          input.getAttribute("placeholder") ||
          "Select a date";

        visibleInput.style.setProperty(
          "padding-left",
          "1.25rem",
          "important"
        );

        visibleInput.style.setProperty(
          "padding-right",
          "1.25rem",
          "important"
        );

        visibleInput.style.setProperty(
          "background",
          "transparent",
          "important"
        );

        visibleInput.style.setProperty(
          "background-color",
          "transparent",
          "important"
        );
      }
    });

    input._flatpickrInstance = picker;
    datePickers.push(picker);
  });

  /* ------------------------------------------------------------------------
     CONNECT DATE INPUTS BY PAIRS
     1 + 2, 3 + 4, 5 + 6, etc.
  ------------------------------------------------------------------------ */

  for (
    let index = 0;
    index < datePickers.length;
    index += 2
  ) {
    const firstPicker = datePickers[index];
    const secondPicker = datePickers[index + 1];

    if (!firstPicker || !secondPicker) continue;

    firstPicker.config.onChange.push(
      function (selectedDates) {
        const firstDate = selectedDates[0];

        if (!firstDate) {
          secondPicker.set("minDate", "today");
          return;
        }

        /*
         * La deuxième date doit être strictement
         * après la première.
         */
        const nextDay = new Date(firstDate);

        nextDay.setDate(
          nextDay.getDate() + 1
        );

        secondPicker.set(
          "minDate",
          nextDay
        );

        const currentSecondDate =
          secondPicker.selectedDates[0];

        if (
          currentSecondDate &&
          currentSecondDate < nextDay
        ) {
          secondPicker.clear();
        }
      }
    );

    /* ----------------------------------------------------------------------
       INITIAL VALUES
    ---------------------------------------------------------------------- */

    const initialFirstDate =
      firstPicker.selectedDates[0];

    if (initialFirstDate) {
      const nextDay =
        new Date(initialFirstDate);

      nextDay.setDate(
        nextDay.getDate() + 1
      );

      secondPicker.set(
        "minDate",
        nextDay
      );
    }
  }
}

/* ==========================================================================
   CUSTOM SELECTS - SAFARI FIX
========================================================================== */

function initializeCustomSelects() {
  function fixSelects(root) {
    const context = root || document;

    const selector =
      ".form--guest .field--wrapper select.text--field";

    const selects = [];

    if (
      context.matches &&
      context.matches(selector)
    ) {
      selects.push(context);
    }

    if (
      typeof context.querySelectorAll === "function"
    ) {
      context
        .querySelectorAll(selector)
        .forEach(function (select) {
          selects.push(select);
        });
    }

    selects.forEach(function (select) {
      if (
        select.dataset.safariSelectReady === "true"
      ) {
        return;
      }

      select.dataset.safariSelectReady = "true";

      /*
       * Retire la classe Webflow spécifique au select.
       * La classe .text--field reste présente.
       */
      select.classList.remove("w-select");

      select.style.setProperty(
        "-webkit-appearance",
        "none",
        "important"
      );

      select.style.setProperty(
        "appearance",
        "none",
        "important"
      );

      select.style.setProperty(
        "background",
        "transparent",
        "important"
      );

      select.style.setProperty(
        "background-color",
        "transparent",
        "important"
      );

      select.style.setProperty(
        "background-image",
        "none",
        "important"
      );

      select.style.setProperty(
        "background-repeat",
        "no-repeat",
        "important"
      );

      select.style.setProperty(
        "box-shadow",
        "none",
        "important"
      );

      select.style.setProperty(
        "-webkit-box-shadow",
        "none",
        "important"
      );

      select.style.setProperty(
        "padding-left",
        "1.25rem",
        "important"
      );

      select.style.setProperty(
        "padding-right",
        "3.5rem",
        "important"
      );
    });
  }

  fixSelects(document);

  /* ------------------------------------------------------------------------
     SUPPORT DYNAMICALLY ADDED GUESTS
  ------------------------------------------------------------------------ */

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (!(node instanceof HTMLElement)) return;

        fixSelects(node);
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}



























document.addEventListener("DOMContentLoaded", function () {
  /* ==========================================================================
     GUEST TABS — ELEMENTS
  ========================================================================== */

  const guestTabs =
    document.querySelector(".tabs--guest");

  if (!guestTabs) return;

  const guestFormWrapper =
    guestTabs.closest("form");

  const tabsMenu =
    guestTabs.querySelector(
      ".tabs--menu-guests"
    );

  const tabsContent =
    guestTabs.querySelector(
      ".tabs--content"
    );

  const addButton =
    tabsMenu?.querySelector(
      ".tabs--link-guest.is--add"
    );

  const firstPane =
    tabsContent?.querySelector(
      ".w-tab-pane"
    );

  const firstGuestForm =
    firstPane?.querySelector(
      ".form--guest"
    );

  if (
    !guestFormWrapper ||
    !tabsMenu ||
    !tabsContent ||
    !addButton ||
    !firstPane ||
    !firstGuestForm
  ) {
    console.warn(
      "Guest tabs : structure Webflow incomplète."
    );

    return;
  }

  /* ==========================================================================
     CONFIGURATION
  ========================================================================== */

  /*
   * null = nombre d’invités illimité.
   * Exemple : const MAX_GUESTS = 10;
   */
  const MAX_GUESTS = null;

  /*
   * Guest 1 et Guest 2 sont accessibles au départ.
   * Guest 3 devient accessible après ouverture de Guest 2.
   */
  let highestUnlockedGuest = 2;

  /*
   * Instances intl-tel-input.
   */
  const phoneInstances =
    new Map();

  /*
   * Template propre utilisé pour tous les clones.
   */
  const guestTemplate =
    createCleanGuestTemplate(
      firstGuestForm
    );

  /* ==========================================================================
     INITIALIZATION
  ========================================================================== */

  prepareInitialTabs();
  prepareFirstGuest();
  activateGuest(1);
  updateAddButtonState();
  updateTabOpacity();

  /*
   * Attend que les autres scripts de la page soient terminés
   * avant d’initialiser les plugins du premier Guest.
   */
  window.requestAnimationFrame(
    function () {
      window.requestAnimationFrame(
        function () {
          initializeGuestPlugins(
            firstGuestForm,
            1
          );

          updateTabOpacity();
        }
      );
    }
  );

  /*
   * Sécurité contre les styles inline GSAP.
   */
  window.setTimeout(
    updateTabOpacity,
    300
  );

  window.setTimeout(
    updateTabOpacity,
    1000
  );

  /* ==========================================================================
     TAB EVENTS
  ========================================================================== */

  tabsMenu.addEventListener(
    "click",
    function (event) {
      const clickedTab =
        event.target.closest(
          ".tabs--link-guest"
        );

      if (
        !clickedTab ||
        !tabsMenu.contains(clickedTab)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      /*
       * Bouton +
       */
      if (
        clickedTab.classList.contains(
          "is--add"
        )
      ) {
        if (
          clickedTab.classList.contains(
            "is--locked"
          )
        ) {
          return;
        }

        addNextGuest();
        return;
      }

      /*
       * Tab Guest normal.
       */
      const guestNumber =
        getGuestNumber(clickedTab);

      if (!guestNumber) return;

      /*
       * Empêche l’accès direct à Guest 3
       * avant l’ouverture de Guest 2.
       */
      if (
        guestNumber >
        highestUnlockedGuest
      ) {
        return;
      }

      ensureGuestExists(
        guestNumber
      );

      activateGuest(
        guestNumber
      );

      /*
       * L’ouverture du dernier Guest disponible
       * débloque le suivant s’il existe déjà.
       */
      unlockGuest(
        guestNumber + 1
      );

      updateAddButtonState();
    },
    true
  );

  /* ==========================================================================
     INITIAL TABS
  ========================================================================== */

  function prepareInitialTabs() {
    getGuestTabs().forEach(
      function (tab) {
        const guestNumber =
          getGuestNumber(tab);

        if (!guestNumber) return;

        normalizeGuestTab(
          tab,
          guestNumber
        );

        /*
         * Guest 1 et Guest 2 disponibles.
         * Guest 3 bloqué au départ.
         */
        setTabLocked(
          tab,
          guestNumber > 2
        );
      }
    );

    /*
     * Conserve uniquement le pane Guest 1.
     * Les autres panes sont créés au premier clic.
     */
    Array.from(
      tabsContent.querySelectorAll(
        ".w-tab-pane"
      )
    ).forEach(
      function (pane, index) {
        if (index > 0) {
          pane.remove();
        }
      }
    );

    /*
     * Le bouton + n’est plus un tab natif Webflow.
     */
    addButton.removeAttribute(
      "data-w-tab"
    );

    addButton.removeAttribute(
      "href"
    );

    addButton.removeAttribute(
      "aria-controls"
    );

    addButton.removeAttribute(
      "aria-selected"
    );

    addButton.setAttribute(
      "role",
      "button"
    );

    addButton.setAttribute(
      "aria-label",
      "Add another guest"
    );

    setTabLocked(
      addButton,
      true
    );
  }

  function prepareFirstGuest() {
    normalizeGuestPane(
      firstPane,
      1
    );

    firstPane.dataset.guestCreated =
      "true";

    firstGuestForm.dataset.guestNumber =
      "1";
  }

  /* ==========================================================================
     CREATE GUEST
  ========================================================================== */

  function ensureGuestExists(
    guestNumber
  ) {
    let pane =
      getGuestPane(
        guestNumber
      );

    if (
      pane &&
      pane.querySelector(
        ".form--guest"
      )
    ) {
      return pane;
    }

    /*
     * Clone exact du template propre.
     */
    const clonedGuestForm =
      guestTemplate.cloneNode(true);

    clonedGuestForm.dataset.guestNumber =
      String(guestNumber);

    clearGeneratedGridStyles(
      clonedGuestForm
    );

    suffixGuestFields(
      clonedGuestForm,
      guestNumber
    );

    resetGuestFields(
      clonedGuestForm
    );

    if (!pane) {
      pane =
        document.createElement(
          "div"
        );

      pane.className =
        "tab--pane-guest" +
        guestNumber +
        " w-tab-pane";

      normalizeGuestPane(
        pane,
        guestNumber
      );

      tabsContent.appendChild(
        pane
      );
    }

    pane.innerHTML = "";

    pane.appendChild(
      clonedGuestForm
    );

    pane.dataset.guestCreated =
      "true";

    initializeGuestPlugins(
      clonedGuestForm,
      guestNumber
    );

    return pane;
  }

  /* ==========================================================================
     ADD GUEST 4, 5, 6...
  ========================================================================== */

  function addNextGuest() {
    const nextGuestNumber =
      getHighestGuestNumber() + 1;

    if (
      MAX_GUESTS &&
      nextGuestNumber >
        MAX_GUESTS
    ) {
      return;
    }

    const newTab =
      createGuestTab(
        nextGuestNumber
      );

    tabsMenu.insertBefore(
      newTab,
      addButton
    );

    highestUnlockedGuest =
      nextGuestNumber;

    ensureGuestExists(
      nextGuestNumber
    );

    activateGuest(
      nextGuestNumber
    );

    updateAddButtonState();
  }

  function createGuestTab(
    guestNumber
  ) {
    const tab =
      document.createElement("a");

    tab.className =
      "tabs--link-guest " +
      "w-inline-block " +
      "w-tab-link";

    tab.dataset.wTab =
      "Tab " + guestNumber;

    tab.dataset.guestNumber =
      String(guestNumber);

    tab.id =
      getGuestTabId(
        guestNumber
      );

    tab.href =
      "#" +
      getGuestPaneId(
        guestNumber
      );

    tab.setAttribute(
      "role",
      "tab"
    );

    tab.setAttribute(
      "aria-controls",
      getGuestPaneId(
        guestNumber
      )
    );

    tab.setAttribute(
      "aria-selected",
      "false"
    );

    tab.setAttribute(
      "tabindex",
      "-1"
    );

    const label =
      document.createElement(
        "div"
      );

    label.textContent =
      "Guest " + guestNumber;

    tab.appendChild(label);

    return tab;
  }

  /* ==========================================================================
     ACTIVATE GUEST
  ========================================================================== */

  function activateGuest(
    guestNumber
  ) {
    const targetTab =
      getGuestTab(
        guestNumber
      );

    const targetPane =
      ensureGuestExists(
        guestNumber
      );

    if (
      !targetTab ||
      !targetPane
    ) {
      return;
    }

    /*
     * Tabs.
     */
    getGuestTabs().forEach(
      function (tab) {
        const isCurrent =
          getGuestNumber(tab) ===
          guestNumber;

        tab.classList.toggle(
          "w--current",
          isCurrent
        );

        tab.setAttribute(
          "aria-selected",
          String(isCurrent)
        );

        tab.setAttribute(
          "tabindex",
          isCurrent ? "0" : "-1"
        );
      }
    );

    /*
     * Panes.
     */
    getGuestPanes().forEach(
      function (pane) {
        const isCurrent =
          Number(
            pane.dataset.guestNumber
          ) === guestNumber;

        pane.classList.toggle(
          "w--tab-active",
          isCurrent
        );

        if (isCurrent) {
          pane.removeAttribute(
            "aria-hidden"
          );
        } else {
          pane.setAttribute(
            "aria-hidden",
            "true"
          );
        }
      }
    );

    guestTabs.setAttribute(
      "data-current",
      "Tab " + guestNumber
    );

    updateTabOpacity();

    /*
     * Recalcule les dimensions des plugins dans le tab visible.
     */
    window.requestAnimationFrame(
      function () {
        window.dispatchEvent(
          new Event("resize")
        );
      }
    );
  }

  /* ==========================================================================
     TAB OPACITY
  ========================================================================== */

  function updateTabOpacity() {
    getGuestTabs().forEach(
      function (tab) {
        const isCurrent =
          tab.classList.contains(
            "w--current"
          );

        tab.style.setProperty(
          "opacity",
          isCurrent ? "1" : "0.35",
          "important"
        );
      }
    );

    addButton.style.setProperty(
      "opacity",
      "0.35",
      "important"
    );
  }

  /* ==========================================================================
     LOCK / UNLOCK
  ========================================================================== */

  function unlockGuest(
    guestNumber
  ) {
    const tab =
      getGuestTab(
        guestNumber
      );

    if (!tab) return;

    highestUnlockedGuest =
      Math.max(
        highestUnlockedGuest,
        guestNumber
      );

    setTabLocked(
      tab,
      false
    );
  }

  function setTabLocked(
    tab,
    isLocked
  ) {
    if (!tab) return;

    tab.classList.toggle(
      "is--locked",
      isLocked
    );

    tab.setAttribute(
      "aria-disabled",
      String(isLocked)
    );

    if (isLocked) {
      tab.setAttribute(
        "tabindex",
        "-1"
      );
    }
  }

  function updateAddButtonState() {
    /*
     * Le + est disponible après la création de Guest 3.
     */
    const guestThreeExists =
      Boolean(
        getGuestPane(3)
      );

    const maximumReached =
      Boolean(
        MAX_GUESTS &&
        getHighestGuestNumber() >=
          MAX_GUESTS
      );

    setTabLocked(
      addButton,
      !guestThreeExists ||
        maximumReached
    );

    updateTabOpacity();
  }

  /* ==========================================================================
     GRID — REMOVE OLD GENERATED OVERRIDES
  ========================================================================== */

  function clearGeneratedGridStyles(
    container
  ) {
    const elements = [
      container,
      ...container.querySelectorAll(
        "*"
      )
    ];

    elements.forEach(
      function (element) {
        [
          "grid-area",
          "grid-column",
          "grid-column-start",
          "grid-column-end",
          "grid-row",
          "grid-row-start",
          "grid-row-end",
          "place-self",
          "justify-self",
          "align-self"
        ].forEach(
          function (property) {
            element.style.removeProperty(
              property
            );
          }
        );

        delete element.dataset
          .gridColumnStart;

        delete element.dataset
          .gridColumnEnd;

        delete element.dataset
          .gridRowStart;

        delete element.dataset
          .gridRowEnd;

        delete element.dataset
          .justifySelf;

        delete element.dataset
          .alignSelf;
      }
    );
  }

  /* ==========================================================================
     FIELD IDS / NAMES
  ========================================================================== */

  function suffixGuestFields(
    container,
    guestNumber
  ) {
    const suffix =
      "-guest-" + guestNumber;

    const idMap =
      new Map();

    /*
     * IDs.
     */
    container
      .querySelectorAll("[id]")
      .forEach(
        function (element) {
          const originalId =
            element.id;

          if (!originalId) return;

          /*
           * Conserve les IDs Webflow de layout.
           */
          if (
            originalId.startsWith(
              "w-node-"
            )
          ) {
            return;
          }

          /*
           * Supprime les IDs techniques de plugins.
           */
          if (
            originalId.startsWith(
              "iti-"
            ) ||
            originalId.startsWith(
              "flatpickr-"
            )
          ) {
            element.removeAttribute(
              "id"
            );

            return;
          }

          const newId =
            addSuffixOnce(
              originalId,
              suffix
            );

          idMap.set(
            originalId,
            newId
          );

          element.id =
            newId;
        }
      );

    /*
     * Names et data-name.
     */
    container
      .querySelectorAll(
        "input[name], select[name], textarea[name]"
      )
      .forEach(
        function (field) {
          const originalName =
            field.getAttribute(
              "name"
            );

          if (!originalName) return;

          field.name =
            addSuffixOnce(
              originalName,
              suffix
            );

          const originalDataName =
            field.getAttribute(
              "data-name"
            ) ||
            getReadableFieldName(
              field
            );

          field.setAttribute(
            "data-name",
            addReadableGuestSuffix(
              originalDataName,
              guestNumber
            )
          );
        }
      );

    /*
     * Labels.
     */
    container
      .querySelectorAll(
        "label[for]"
      )
      .forEach(
        function (label) {
          const originalFor =
            label.getAttribute(
              "for"
            );

          if (
            originalFor &&
            idMap.has(originalFor)
          ) {
            label.setAttribute(
              "for",
              idMap.get(
                originalFor
              )
            );
          }
        }
      );

    /*
     * Références d’IDs.
     */
    [
      "aria-controls",
      "aria-labelledby",
      "aria-describedby",
      "list"
    ].forEach(
      function (attribute) {
        container
          .querySelectorAll(
            "[" +
              attribute +
              "]"
          )
          .forEach(
            function (element) {
              const value =
                element.getAttribute(
                  attribute
                );

              if (!value) return;

              const updated =
                value
                  .split(/\s+/)
                  .map(
                    function (id) {
                      return (
                        idMap.get(id) ||
                        id
                      );
                    }
                  )
                  .join(" ");

              element.setAttribute(
                attribute,
                updated
              );
            }
          );
      }
    );
  }

  function addSuffixOnce(
    value,
    suffix
  ) {
    if (!value) return value;

    const pattern =
      /-guest-\d+$/;

    return pattern.test(value)
      ? value.replace(
          pattern,
          suffix
        )
      : value + suffix;
  }

  function getReadableFieldName(
    field
  ) {
    return (
      field.placeholder ||
      field.name ||
      field.id ||
      "Field"
    )
      .replace(/\*$/, "")
      .trim();
  }

  function addReadableGuestSuffix(
    value,
    guestNumber
  ) {
    const cleanValue =
      String(value || "Field")
        .replace(
          /\s*[-–—]?\s*Guest\s+\d+\s*$/i,
          ""
        )
        .trim();

    return (
      cleanValue +
      " - Guest " +
      guestNumber
    );
  }

  /* ==========================================================================
     CLEAN TEMPLATE
  ========================================================================== */

  function createCleanGuestTemplate(
    sourceForm
  ) {
    const template =
      sourceForm.cloneNode(true);

    clearGeneratedGridStyles(
      template
    );

    /*
     * Nettoyage intl-tel-input.
     */
    template
      .querySelectorAll(".iti")
      .forEach(
        function (itiWrapper) {
          const phoneInput =
            itiWrapper.querySelector(
              'input[type="tel"], input.is--phone'
            );

          if (!phoneInput) {
            itiWrapper.remove();
            return;
          }

          const cleanPhoneInput =
            phoneInput.cloneNode(true);

          /*
           * Le wrapper peut porter une classe w-node-*.
           */
          Array.from(
            itiWrapper.classList
          ).forEach(
            function (className) {
              if (
                className.startsWith(
                  "w-node-"
                )
              ) {
                cleanPhoneInput
                  .classList
                  .add(className);
              }
            }
          );

          cleanPhoneInput.value =
            "";

          cleanPhoneInput.removeAttribute(
            "data-iti-initialized"
          );

          cleanPhoneInput.removeAttribute(
            "data-intl-tel-input-id"
          );

          cleanPhoneInput.removeAttribute(
            "data-guest-phone-initialized"
          );

          cleanPhoneInput.removeAttribute(
            "data-guest-phone-sync-ready"
          );

          cleanPhoneInput.removeAttribute(
            "aria-invalid"
          );

          cleanPhoneInput.removeAttribute(
            "aria-describedby"
          );

          cleanPhoneInput.classList.remove(
            "iti__tel-input"
          );

          clearGeneratedGridStyles(
            cleanPhoneInput
          );

          itiWrapper.replaceWith(
            cleanPhoneInput
          );
        }
      );

    /*
     * Supprime les anciens altInputs Flatpickr.
     */
    template
      .querySelectorAll(
        [
          'input[data-flatpickr-alt="true"]',
          "input.is--date:not([name])",
          "input.form-control:not([name])"
        ].join(",")
      )
      .forEach(
        function (input) {
          input.remove();
        }
      );

    /*
     * Nettoie les vrais champs date.
     */
    template
      .querySelectorAll(
        "input.is--date[name]"
      )
      .forEach(
        function (input) {
          input._flatpickr =
            null;

          input.type =
            "text";

          input.value =
            "";

          input.readOnly =
            false;

          input.removeAttribute(
            "readonly"
          );

          input.removeAttribute(
            "data-datepicker-initialized"
          );

          input.removeAttribute(
            "data-guest-date-initialized"
          );

          input.removeAttribute(
            "data-flatpickr-alt"
          );

          input.removeAttribute(
            "aria-invalid"
          );

          input.removeAttribute(
            "aria-describedby"
          );

          input.classList.remove(
            "flatpickr-input"
          );
        }
      );

    /*
     * Supprime les hidden fields téléphone.
     */
    template
      .querySelectorAll(
        [
          'input[type="hidden"][name$="-full"]',
          'input[type="hidden"][name$="-country"]'
        ].join(",")
      )
      .forEach(
        function (input) {
          input.remove();
        }
      );

    /*
     * Supprime les états d’erreur ou succès.
     */
    template
      .querySelectorAll(
        [
          ".error-message",
          ".field-error",
          ".is--error",
          ".w-form-done",
          ".w-form-fail"
        ].join(",")
      )
      .forEach(
        function (element) {
          element.remove();
        }
      );

    return template;
  }

  /* ==========================================================================
     RESET CLONED FIELDS
  ========================================================================== */

  function resetGuestFields(
    container
  ) {
    container
      .querySelectorAll(
        "input, select, textarea"
      )
      .forEach(
        function (field) {
          field.classList.remove(
            "is--error"
          );

          field.removeAttribute(
            "aria-invalid"
          );

          field.setCustomValidity("");

          if (
            field.type ===
              "checkbox" ||
            field.type ===
              "radio"
          ) {
            field.checked =
              false;

            return;
          }

          if (
            field.type ===
              "submit" ||
            field.type ===
              "button" ||
            field.type ===
              "reset"
          ) {
            return;
          }

          if (
            field.tagName ===
            "SELECT"
          ) {
            field.selectedIndex =
              0;

            return;
          }

          field.value =
            "";
        }
      );
  }

  /* ==========================================================================
     PLUGINS
  ========================================================================== */

  function initializeGuestPlugins(
    container,
    guestNumber
  ) {
    initializeGuestPhones(
      container,
      guestNumber
    );

    initializeGuestDates(
      container
    );
  }

  /* ==========================================================================
     PHONE INITIALIZATION
  ========================================================================== */

  function initializeGuestPhones(
    container,
    guestNumber
  ) {
    const phoneInputs =
      container.querySelectorAll(
        'input[type="tel"], input.is--phone'
      );

    phoneInputs.forEach(
      function (phoneInput) {
        let instance =
          null;

        /*
         * Réutilise une instance existante pour Guest 1.
         */
        if (
          window.intlTelInput &&
          typeof window
            .intlTelInput
            .getInstance ===
            "function"
        ) {
          instance =
            window.intlTelInput
              .getInstance(
                phoneInput
              );
        }

        /*
         * Crée l’instance si nécessaire.
         */
        if (!instance) {
          if (
            phoneInput.dataset
              .guestPhoneInitialized ===
            "true"
          ) {
            return;
          }

          if (
            typeof window
              .intlTelInput !==
            "function"
          ) {
            return;
          }

          phoneInput.dataset
            .guestPhoneInitialized =
            "true";

          instance =
            window.intlTelInput(
              phoneInput,
              {
                initialCountry:
                  "ma",

                separateDialCode:
                  true,

                nationalMode:
                  true,

                autoPlaceholder:
                  "aggressive",

                countrySearch:
                  true,

                fixDropdownWidth:
                  false,

                loadUtils:
                  function () {
                    return import(
                      "https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.2/build/js/utils.js"
                    );
                  }
              }
            );
        }

        phoneInstances.set(
          phoneInput,
          instance
        );

        phoneInput.dataset
          .guestPhoneInitialized =
          "true";

        preservePhoneClass(
          phoneInput
        );

        createPhoneHiddenFields(
          container,
          phoneInput,
          instance
        );
      }
    );
  }

  function preservePhoneClass(
    phoneInput
  ) {
    const wrapper =
      phoneInput.closest(".iti");

    if (!wrapper) return;

    Array.from(
      phoneInput.classList
    ).forEach(
      function (className) {
        if (
          className.startsWith(
            "w-node-"
          )
        ) {
          wrapper.classList.add(
            className
          );
        }
      }
    );

    clearGeneratedGridStyles(
      wrapper
    );

    clearGeneratedGridStyles(
      phoneInput
    );
  }

  function createPhoneHiddenFields(
    container,
    phoneInput,
    instance
  ) {
    const fullName =
      phoneInput.name +
      "-full";

    const countryName =
      phoneInput.name +
      "-country";

    let fullField =
      container.querySelector(
        'input[type="hidden"][name="' +
          cssEscape(fullName) +
          '"]'
      );

    let countryField =
      container.querySelector(
        'input[type="hidden"][name="' +
          cssEscape(countryName) +
          '"]'
      );

    if (!fullField) {
      fullField =
        document.createElement(
          "input"
        );

      fullField.type =
        "hidden";

      fullField.name =
        fullName;

      fullField.setAttribute(
        "data-name",
        getReadableFieldName(
          phoneInput
        ) + " Full"
      );

      container.appendChild(
        fullField
      );
    }

    if (!countryField) {
      countryField =
        document.createElement(
          "input"
        );

      countryField.type =
        "hidden";

      countryField.name =
        countryName;

      countryField.setAttribute(
        "data-name",
        getReadableFieldName(
          phoneInput
        ) + " Country"
      );

      container.appendChild(
        countryField
      );
    }

    function syncPhone() {
      const country =
        instance
          .getSelectedCountryData();

      fullField.value =
        instance.getNumber() ||
        phoneInput.value ||
        "";

      countryField.value =
        country?.iso2 || "";
    }

    if (
      phoneInput.dataset
        .guestPhoneSyncReady !==
      "true"
    ) {
      phoneInput.dataset
        .guestPhoneSyncReady =
        "true";

      phoneInput.addEventListener(
        "input",
        syncPhone
      );

      phoneInput.addEventListener(
        "change",
        syncPhone
      );

      phoneInput.addEventListener(
        "countrychange",
        syncPhone
      );
    }

    syncPhone();
  }

  /* ==========================================================================
     DATES — INITIALIZATION
  ========================================================================== */

  function initializeGuestDates(
    container
  ) {
    const arrivalInput =
      findDateField(
        container,
        "arrival"
      );

    const departureInput =
      findDateField(
        container,
        "departure"
      );

    if (
      !arrivalInput ||
      !departureInput
    ) {
      return;
    }

    /*
     * Flatpickr peut être chargé après DOMContentLoaded.
     */
    if (
      typeof window.flatpickr !==
      "function"
    ) {
      window.setTimeout(
        function () {
          initializeGuestDates(
            container
          );
        },
        200
      );

      return;
    }

    /*
     * Évite une seconde initialisation valide.
     */
    if (
      arrivalInput._flatpickr &&
      departureInput._flatpickr &&
      arrivalInput.dataset
        .guestDateInitialized ===
        "true" &&
      departureInput.dataset
        .guestDateInitialized ===
        "true"
    ) {
      return;
    }

    /*
     * Nettoie les anciennes instances et altInputs.
     */
    cleanDateField(
      arrivalInput
    );

    cleanDateField(
      departureInput
    );

    removeAllDateAltInputs(
      container
    );

    prepareVisibleDateInput(
      arrivalInput
    );

    prepareVisibleDateInput(
      departureInput
    );

    let departurePicker =
      null;

    /* --------------------------------------------------------------------------
       ARRIVAL
    -------------------------------------------------------------------------- */

    const arrivalPicker =
      window.flatpickr(
        arrivalInput,
        {
          dateFormat:
            "Y-m-d",

          altInput:
            false,

          allowInput:
            false,

          clickOpens:
            true,

          /*
           * Force Flatpickr également sur mobile.
           */
          disableMobile:
            true,

          onReady:
            function (
              selectedDates,
              dateStr,
              instance
            ) {
              prepareVisibleDateInput(
                instance.input
              );
            },

          onOpen:
            function () {
              prepareVisibleDateInput(
                arrivalInput
              );
            },

          onChange:
            function (
              selectedDates
            ) {
              const arrivalDate =
                selectedDates[0] ||
                null;

              departureInput
                .setCustomValidity("");

              if (
                !departurePicker
              ) {
                return;
              }

              if (!arrivalDate) {
                departurePicker.set(
                  "minDate",
                  null
                );

                return;
              }

              /*
               * Departure doit être au minimum
               * le lendemain d’Arrival.
               */
              const minimumDeparture =
                addDays(
                  arrivalDate,
                  1
                );

              departurePicker.set(
                "minDate",
                minimumDeparture
              );

              const selectedDeparture =
                departurePicker
                  .selectedDates[0];

              /*
               * Efface Departure si elle devient invalide.
               */
              if (
                selectedDeparture &&
                selectedDeparture <=
                  arrivalDate
              ) {
                departurePicker.clear();
              }

              validateDateRange(
                arrivalInput,
                departureInput
              );
            }
        }
      );

    /* --------------------------------------------------------------------------
       DEPARTURE
    -------------------------------------------------------------------------- */

    departurePicker =
      window.flatpickr(
        departureInput,
        {
          dateFormat:
            "Y-m-d",

          altInput:
            false,

          allowInput:
            false,

          clickOpens:
            true,

          disableMobile:
            true,

          onReady:
            function (
              selectedDates,
              dateStr,
              instance
            ) {
              prepareVisibleDateInput(
                instance.input
              );
            },

          onOpen:
            function () {
              const arrivalDate =
                arrivalPicker
                  .selectedDates[0];

              if (!arrivalDate) {
                departurePicker.set(
                  "minDate",
                  null
                );

                return;
              }

              departurePicker.set(
                "minDate",
                addDays(
                  arrivalDate,
                  1
                )
              );
            },

          onChange:
            function () {
              validateDateRange(
                arrivalInput,
                departureInput
              );
            }
        }
      );

    arrivalInput.dataset
      .guestDateInitialized =
      "true";

    departureInput.dataset
      .guestDateInitialized =
      "true";

    /*
     * Ouverture explicite au clic et au focus.
     */
    bindDatePickerOpen(
      arrivalInput,
      arrivalPicker
    );

    bindDatePickerOpen(
      departureInput,
      departurePicker
    );

    /*
     * Si Arrival possède déjà une valeur.
     */
    if (
      arrivalPicker
        .selectedDates[0]
    ) {
      departurePicker.set(
        "minDate",
        addDays(
          arrivalPicker
            .selectedDates[0],
          1
        )
      );
    }
  }

  /* ==========================================================================
     DATE FIELD FINDER
  ========================================================================== */

  function findDateField(
    container,
    type
  ) {
    const fields =
      Array.from(
        container.querySelectorAll(
          "input.is--date[name]"
        )
      );

    return (
      fields.find(
        function (input) {
          const text = [
            input.name,
            input.id,
            input.getAttribute(
              "data-name"
            ),
            input.placeholder
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (type === "arrival") {
            return (
              text.includes(
                "arrival"
              ) ||
              text.includes(
                "arrivals"
              )
            );
          }

          return (
            text.includes(
              "departure"
            ) ||
            text.includes(
              "departures"
            )
          );
        }
      ) || null
    );
  }

  /* ==========================================================================
     DATE — CLEAN FIELD
  ========================================================================== */

  function cleanDateField(
    input
  ) {
    if (!input) return;

    /*
     * Retire le listener d’ouverture précédent.
     */
    if (
      input._guestDateClickHandler
    ) {
      input.removeEventListener(
        "click",
        input._guestDateClickHandler
      );

      input.removeEventListener(
        "focus",
        input._guestDateClickHandler
      );

      input.removeEventListener(
        "pointerdown",
        input._guestDateClickHandler
      );

      input._guestDateClickHandler =
        null;
    }

    /*
     * Détruit l’ancienne instance.
     */
    if (input._flatpickr) {
      input._flatpickr.destroy();
    }

    input._flatpickr =
      null;

    input.type =
      "text";

    input.readOnly =
      false;

    input.removeAttribute(
      "readonly"
    );

    input.removeAttribute(
      "data-datepicker-initialized"
    );

    input.removeAttribute(
      "data-guest-date-initialized"
    );

    input.removeAttribute(
      "data-flatpickr-alt"
    );

    input.removeAttribute(
      "aria-hidden"
    );

    input.removeAttribute(
      "tabindex"
    );

    input.classList.remove(
      "flatpickr-input"
    );
  }

  /* ==========================================================================
     DATE — REMOVE OLD ALT INPUTS
  ========================================================================== */

  function removeAllDateAltInputs(
    container
  ) {
    container
      .querySelectorAll(
        [
          'input[data-flatpickr-alt="true"]',
          "input.is--date:not([name])",
          "input.form-control:not([name])"
        ].join(",")
      )
      .forEach(
        function (input) {
          input.remove();
        }
      );
  }

  /* ==========================================================================
     DATE — VISIBLE INPUT
  ========================================================================== */

  function prepareVisibleDateInput(
    input
  ) {
    if (!input) return;

    input.type =
      "text";

    /*
     * Empêche la saisie manuelle,
     * mais le champ reste cliquable.
     */
    input.readOnly =
      true;

    input.setAttribute(
      "readonly",
      "readonly"
    );

    input.style.removeProperty(
      "display"
    );

    input.style.removeProperty(
      "visibility"
    );

    input.style.removeProperty(
      "opacity"
    );

    input.style.removeProperty(
      "pointer-events"
    );

    input.style.setProperty(
      "cursor",
      "pointer"
    );

    input.style.setProperty(
      "pointer-events",
      "auto"
    );
  }

  /* ==========================================================================
     DATE — FORCE PICKER OPEN
  ========================================================================== */

  function bindDatePickerOpen(
    input,
    picker
  ) {
    if (
      !input ||
      !picker
    ) {
      return;
    }

    /*
     * Supprime un ancien listener éventuel.
     */
    if (
      input._guestDateClickHandler
    ) {
      input.removeEventListener(
        "click",
        input._guestDateClickHandler
      );

      input.removeEventListener(
        "focus",
        input._guestDateClickHandler
      );

      input.removeEventListener(
        "pointerdown",
        input._guestDateClickHandler
      );
    }

    const openPicker =
      function (event) {
        /*
         * Ne bloque pas le comportement interne Flatpickr.
         */
        event.stopPropagation();

        window.requestAnimationFrame(
          function () {
            if (!picker.isOpen) {
              picker.open();
            }
          }
        );
      };

    input._guestDateClickHandler =
      openPicker;

    input.addEventListener(
      "click",
      openPicker
    );

    input.addEventListener(
      "focus",
      openPicker
    );

    input.addEventListener(
      "pointerdown",
      openPicker
    );
  }

  /* ==========================================================================
     DATE — ADD DAYS
  ========================================================================== */

  function addDays(
    date,
    days
  ) {
    const result =
      new Date(date);

    result.setHours(
      0,
      0,
      0,
      0
    );

    result.setDate(
      result.getDate() +
        days
    );

    return result;
  }

  /* ==========================================================================
     DATE — RANGE VALIDATION
  ========================================================================== */

  function validateDateRange(
    arrivalInput,
    departureInput
  ) {
    departureInput
      .setCustomValidity("");

    /*
     * Ne contrôle la relation que si les deux dates existent.
     */
    if (
      !arrivalInput.value ||
      !departureInput.value
    ) {
      return true;
    }

    const arrivalDate =
      parseDate(
        arrivalInput.value
      );

    const departureDate =
      parseDate(
        departureInput.value
      );

    if (
      !arrivalDate ||
      !departureDate
    ) {
      return true;
    }

    if (
      departureDate <=
      arrivalDate
    ) {
      departureInput
        .setCustomValidity(
          "Departure date must be after the arrival date."
        );

      return false;
    }

    departureInput
      .setCustomValidity("");

    return true;
  }

  function validateAllDates() {
    let valid =
      true;

    guestFormWrapper
      .querySelectorAll(
        ".form--guest"
      )
      .forEach(
        function (guestForm) {
          const arrivalInput =
            findDateField(
              guestForm,
              "arrival"
            );

          const departureInput =
            findDateField(
              guestForm,
              "departure"
            );

          if (
            arrivalInput &&
            departureInput &&
            !validateDateRange(
              arrivalInput,
              departureInput
            )
          ) {
            valid =
              false;
          }
        }
      );

    return valid;
  }

  /* ==========================================================================
     DATE — PARSE YYYY-MM-DD
  ========================================================================== */

  function parseDate(
    value
  ) {
    const parts =
      String(value).split("-");

    if (
      parts.length !== 3
    ) {
      return null;
    }

    const date =
      new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );

    date.setHours(
      0,
      0,
      0,
      0
    );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  /* ==========================================================================
     FORM VALIDATION
  ========================================================================== */

  guestFormWrapper.addEventListener(
    "invalid",
    function (event) {
      const field =
        event.target;

      if (
        !field.matches(
          "input, select, textarea"
        )
      ) {
        return;
      }

      const pane =
        field.closest(
          ".w-tab-pane[data-guest-number]"
        );

      if (!pane) return;

      const guestNumber =
        Number(
          pane.dataset.guestNumber
        );

      if (guestNumber) {
        activateGuest(
          guestNumber
        );
      }
    },
    true
  );

  /*
   * Validation au clic sur Submit.
   */
  guestFormWrapper
    .querySelectorAll(
      [
        'button[type="submit"]',
        'input[type="submit"]',
        ".submit--btn"
      ].join(",")
    )
    .forEach(
      function (button) {
        button.addEventListener(
          "click",
          function (event) {
            validateAllDates();

            const invalidField =
              getFirstInvalidField();

            if (!invalidField) {
              synchronizeAllPhones();
              return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            showInvalidField(
              invalidField
            );
          },
          true
        );
      }
    );

  /*
   * Validation finale avant Webflow.
   */
  guestFormWrapper.addEventListener(
    "submit",
    function (event) {
      validateAllDates();

      const invalidField =
        getFirstInvalidField();

      if (invalidField) {
        event.preventDefault();
        event.stopImmediatePropagation();

        showInvalidField(
          invalidField
        );

        return;
      }

      synchronizeAllPhones();
    },
    true
  );

  function getFirstInvalidField() {
    const fields =
      Array.from(
        guestFormWrapper.querySelectorAll(
          "input, select, textarea"
        )
      );

    return (
      fields.find(
        function (field) {
          if (field.disabled) {
            return false;
          }

          if (
            field.type ===
              "hidden" ||
            field.type ===
              "submit" ||
            field.type ===
              "button" ||
            field.type ===
              "reset"
          ) {
            return false;
          }

          return !field.checkValidity();
        }
      ) || null
    );
  }

  function showInvalidField(
    field
  ) {
    const pane =
      field.closest(
        ".w-tab-pane[data-guest-number]"
      );

    if (pane) {
      const guestNumber =
        Number(
          pane.dataset.guestNumber
        );

      if (guestNumber) {
        activateGuest(
          guestNumber
        );
      }
    }

    window.requestAnimationFrame(
      function () {
        /*
         * Champ Flatpickr invalide.
         */
        if (
          field._flatpickr
        ) {
          field.focus();
          field._flatpickr.open();
          return;
        }

        field.reportValidity();

        try {
          field.focus({
            preventScroll: true
          });
        } catch (error) {
          field.focus();
        }

        field.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    );
  }

  /* ==========================================================================
     PHONE SYNCHRONIZATION
  ========================================================================== */

  function synchronizeAllPhones() {
    phoneInstances.forEach(
      function (
        instance,
        phoneInput
      ) {
        const container =
          phoneInput.closest(
            ".form--guest"
          );

        if (!container) return;

        const fullField =
          container.querySelector(
            'input[name="' +
              cssEscape(
                phoneInput.name +
                  "-full"
              ) +
              '"]'
          );

        const countryField =
          container.querySelector(
            'input[name="' +
              cssEscape(
                phoneInput.name +
                  "-country"
              ) +
              '"]'
          );

        const country =
          instance
            .getSelectedCountryData();

        if (fullField) {
          fullField.value =
            instance.getNumber() ||
            phoneInput.value ||
            "";
        }

        if (countryField) {
          countryField.value =
            country?.iso2 || "";
        }
      }
    );
  }

  /* ==========================================================================
     NORMALIZATION
  ========================================================================== */

  function normalizeGuestTab(
    tab,
    guestNumber
  ) {
    tab.dataset.guestNumber =
      String(guestNumber);

    tab.dataset.wTab =
      "Tab " + guestNumber;

    tab.id =
      getGuestTabId(
        guestNumber
      );

    tab.href =
      "#" +
      getGuestPaneId(
        guestNumber
      );

    tab.setAttribute(
      "role",
      "tab"
    );

    tab.setAttribute(
      "aria-controls",
      getGuestPaneId(
        guestNumber
      )
    );
  }

  function normalizeGuestPane(
    pane,
    guestNumber
  ) {
    pane.dataset.guestNumber =
      String(guestNumber);

    pane.dataset.wTab =
      "Tab " + guestNumber;

    pane.id =
      getGuestPaneId(
        guestNumber
      );

    pane.setAttribute(
      "role",
      "tabpanel"
    );

    pane.setAttribute(
      "aria-labelledby",
      getGuestTabId(
        guestNumber
      )
    );
  }

  /* ==========================================================================
     GETTERS
  ========================================================================== */

  function getGuestTabs() {
    return Array.from(
      tabsMenu.querySelectorAll(
        ".tabs--link-guest:not(.is--add)"
      )
    );
  }

  function getGuestPanes() {
    return Array.from(
      tabsContent.querySelectorAll(
        ".w-tab-pane[data-guest-number]"
      )
    );
  }

  function getGuestTab(
    guestNumber
  ) {
    return getGuestTabs().find(
      function (tab) {
        return (
          getGuestNumber(tab) ===
          guestNumber
        );
      }
    );
  }

  function getGuestPane(
    guestNumber
  ) {
    return tabsContent.querySelector(
      '.w-tab-pane[data-guest-number="' +
        guestNumber +
        '"]'
    );
  }

  function getGuestNumber(
    tab
  ) {
    if (!tab) return null;

    if (
      tab.dataset.guestNumber
    ) {
      return Number(
        tab.dataset.guestNumber
      );
    }

    const tabName =
      tab.getAttribute(
        "data-w-tab"
      ) || "";

    const tabText =
      tab.textContent || "";

    const match =
      tabName.match(/\d+/) ||
      tabText.match(/\d+/);

    return match
      ? Number(match[0])
      : null;
  }

  function getHighestGuestNumber() {
    const numbers =
      getGuestTabs()
        .map(getGuestNumber)
        .filter(
          Number.isFinite
        );

    return numbers.length
      ? Math.max(...numbers)
      : 1;
  }

  function getGuestTabId(
    guestNumber
  ) {
    return (
      "guest-tab-" +
      guestNumber
    );
  }

  function getGuestPaneId(
    guestNumber
  ) {
    return (
      "guest-pane-" +
      guestNumber
    );
  }

  function cssEscape(
    value
  ) {
    if (
      window.CSS &&
      typeof window.CSS.escape ===
        "function"
    ) {
      return window.CSS.escape(
        value
      );
    }

    return String(value).replace(
      /["\\]/g,
      "\\$&"
    );
  }
});
