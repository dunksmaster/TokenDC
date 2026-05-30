/** Balkans Crypto 2026 — linked partners, media, and community supporters for the events hero ticker. */
const EVENTS_SUPPORTERS_2026 = [
  { name: "Ballet", href: "https://bit.ly/43mMBs9" },
  { name: "Trezor", href: "https://satoshilabs.visualbook.pro/trezor" },
  { name: "Bitget", href: "https://www.bitget.com/referral/register?clacCode=GK802F53" },
  { name: "CEX.IO", href: "https://cex.io/join?c=20&a=513&o=3&s=sc&prid=referral-promo" },
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
  for (const { name, href } of supporters) {
    const pill = document.createElement("a");
    pill.className = "supporter-pill";
    pill.href = href;
    pill.textContent = name;
    if (href.startsWith("http")) {
      pill.target = "_blank";
      pill.rel = "noopener noreferrer";
    }
    row.appendChild(pill);
  }
  return row;
}

document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("supporters-ticker-track");
  if (!track) return;

  const row = buildSupporterRow(EVENTS_SUPPORTERS);
  const duplicate = row.cloneNode(true);
  duplicate.setAttribute("aria-hidden", "true");
  track.append(row, duplicate);
});
