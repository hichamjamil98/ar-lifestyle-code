
/* ==========================================================================
   PHONE FIELD - CONTACT FORM
========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#email-form");
  const phoneInput = document.querySelector("#Phone-number");

  if (!form || !phoneInput || !window.intlTelInput) return;

  phoneInput.name = "Phone number";
  phoneInput.setAttribute("data-name", "Phone number");
  phoneInput.setAttribute("autocomplete", "tel");

  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",

    geoIpLookup: function (success) {
      fetch("https://ipwho.is/")
        .then((response) => response.json())
        .then((data) => {
          if (data && data.success !== false && data.country_code) {
            success(data.country_code.toLowerCase());
          } else {
            success("ma");
          }
        })
        .catch(() => success("ma"));
    },

    preferredCountries: ["ma", "fr", "cn", "ae", "be", "ch", "es"],
    separateDialCode: true,
    nationalMode: false,
    formatAsYouType: true,
    autoPlaceholder: "off",
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@25/build/js/utils.js"
  });

  const countryCodeInput = document.createElement("input");
  countryCodeInput.type = "hidden";
  countryCodeInput.name = "Country code";
  countryCodeInput.setAttribute("data-name", "Country code");
  form.appendChild(countryCodeInput);

  function updateCountryCode() {
    const country = iti.getSelectedCountryData();
    countryCodeInput.value = country?.dialCode ? `+${country.dialCode}` : "";
  }

  function refreshPhoneField() {
    updateCountryCode();
  }

  refreshPhoneField();
  setTimeout(refreshPhoneField, 400);
  setTimeout(refreshPhoneField, 1000);

  phoneInput.addEventListener("countrychange", refreshPhoneField);

  form.addEventListener("submit", () => {
    refreshPhoneField();
    phoneInput.value = phoneInput.value.trim();
  });
});
