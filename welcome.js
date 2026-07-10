
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
