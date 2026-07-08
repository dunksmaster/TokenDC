/** CEX.IO href must match CEX_IO_AFFILIATE_HREF in src/js/affiliates-data.js */
const CEX_IO_AFFILIATE_HREF =
  "https://cex.io/join?c=20&a=513&o=3&s=sc&prid=referral-promo";

const EVENTS_SUPPORTERS_2026 = [
  { name: "Ballet", href: "https://bit.ly/43mMBs9" },
  { name: "Trezor", href: "https://affil.trezor.io/aff_c?offer_id=382&aff_id=33259" },
  { name: "Bitget", href: "https://www.bitget.com/referral/register?clacCode=GK802F53" },
  { name: "CEX.IO", href: CEX_IO_AFFILIATE_HREF },
  { name: "Tangem", href: "https://tangem.com/invite/BITCOINZAT" },
  { name: "Ledger", href: "https://shop.ledger.com/?r=2deb3872c973" },
  { name: "Deeper Network", href: "https://shop.deeper.network?sca_ref=2063681.3aWn8PiBjI" },
  { name: "Konsensus Network", href: "https://konsensus.network" },
  { name: "Bitcoinbook.shop", href: "https://bitcoinbook.shop" },
  { name: "ABC News Albania", href: "https://abcnews.al" },
  { name: "Top Channel", href: "https://top-channel.tv" },
  { name: "DuaCrypto Telegram", href: "https://t.me/dua_crypto" },
  { name: "DuaCrypto Events", href: "/events.html#balkans-crypto-2026" },
];

const EVENTS_SUPPORTERS = Array.from({ length: 4 }, () => EVENTS_SUPPORTERS_2026).flat();

function buildSupporterRow(supporters) {
  const row = document.createElement("div");
  row.className = "supporters-ticker-row";
  for (const item of supporters) {
    const pill = document.createElement("a");
    pill.className = "supporter-pill";
    pill.href = item.href;
    pill.textContent = item.name;
    if (item.href.startsWith("http")) {
      pill.target = "_blank";
      pill.rel = "noopener sponsored";
      pill.referrerPolicy = "unsafe-url";
    }
    row.appendChild(pill);
  }
  return row;
}

export function initEventsSupporters() {
  const track = document.getElementById("supporters-ticker-track");
  if (!track) return;

  const row = buildSupporterRow(EVENTS_SUPPORTERS);
  const duplicate = row.cloneNode(true);
  duplicate.setAttribute("aria-hidden", "true");
  track.append(row, duplicate);
}

export function initEventCards() {
  const cards = document.querySelectorAll(".event-card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach((card) => observer.observe(card));
}
