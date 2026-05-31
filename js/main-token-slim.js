(function () {
  "use strict";

  function hideSpinner() {
    var spinner = document.getElementById("spinner");
    if (!spinner) return;
    spinner.classList.remove("show");
    setTimeout(function () {
      spinner.remove();
    }, 500);
  }

  function initScrollUi() {
    var nav = document.querySelector(".sticky-top");
    var backToTop = document.querySelector(".back-to-top");

    function onScroll() {
      var scrolled = window.scrollY > 300;
      if (nav) {
        nav.classList.toggle("shadow-sm", scrolled);
        nav.style.top = scrolled ? "0px" : "-100px";
      }
      if (backToTop) {
        backToTop.classList.toggle("show", scrolled);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      hideSpinner();
      initScrollUi();
    });
  } else {
    hideSpinner();
    initScrollUi();
  }
})();
