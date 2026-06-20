/** Load Google Analytics after page load to avoid blocking LCP. */
window.addEventListener("load", function () {
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=G-BH7BJVBLP2";
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", "G-BH7BJVBLP2");
});
