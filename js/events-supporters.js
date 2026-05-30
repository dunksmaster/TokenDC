/** Placeholder supporter names — replace with real decentralized crypto companies when ready. */
const EVENTS_SUPPORTERS = Array.from({ length: 40 }, (_, i) => `Supporter ${i + 1}`);

function buildSupporterRow(names) {
  const row = document.createElement("div");
  row.className = "supporters-ticker-row";
  for (const name of names) {
    const pill = document.createElement("span");
    pill.className = "supporter-pill";
    pill.textContent = name;
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
