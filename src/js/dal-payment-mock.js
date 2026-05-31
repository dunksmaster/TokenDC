import QRCode from "qrcode";
import { DAL_CONFIG } from "./dal-config.js";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function drawLightningQr(canvas, lightningAddress) {
  await QRCode.toCanvas(canvas, lightningAddress, {
    width: 200,
    margin: 1,
    color: { dark: "#0A0F2C", light: "#FFFFFF" },
  });
}

function buildProofMailto(email) {
  const subject = encodeURIComponent("DAL membership proof");
  const body = encodeURIComponent(
    `Membership email: ${email}\n\n` +
      "Attached: payment screenshot or Lightning payment hash.\n\n" +
      "Please verify my $99 membership payment and approve my Telegram join request."
  );
  return `mailto:${DAL_CONFIG.proofEmail}?subject=${subject}&body=${body}`;
}

export function initPaymentModal() {
  const overlay = document.getElementById("dal-payment-modal");
  if (!overlay) return;

  const formStep = overlay.querySelector("[data-step='form']");
  const paymentStep = overlay.querySelector("[data-step='invoice']");
  const successStep = overlay.querySelector("[data-step='success']");
  const errorEl = overlay.querySelector(".dal-modal__error");
  const emailInput = overlay.querySelector("#dal-payment-email");
  const qrCanvas = overlay.querySelector("#dal-qr-canvas");
  const addressInput = overlay.querySelector("#dal-invoice-string");
  const timerEl = overlay.querySelector("#dal-invoice-timer");
  const proofEmailEl = overlay.querySelector("#dal-proof-email-display");
  const proofMailtoBtn = overlay.querySelector("#dal-proof-mailto");
  const revealJoinBtn = overlay.querySelector("#dal-reveal-join");
  const inviteLink = overlay.querySelector("#dal-telegram-invite-link");
  const joinLinkWrap = overlay.querySelector("#dal-join-link-wrap");
  const closeBtn = overlay.querySelector(".dal-modal__close");
  const copyBtn = overlay.querySelector("#dal-copy-invoice");
  const retryBtn = overlay.querySelector("#dal-payment-retry");
  const paidBtn = overlay.querySelector("#dal-payment-paid");

  let timerInterval = null;
  let expiresAt = null;
  let memberEmail = "";

  document.querySelectorAll(".dal-payment-amount").forEach((el) => {
    el.textContent = String(DAL_CONFIG.membershipAmountUsd);
  });

  function openModal() {
    resetModal();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    emailInput?.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    clearTimers();
  }

  function clearTimers() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetModal() {
    clearTimers();
    memberEmail = "";
    errorEl.textContent = "";
    errorEl.hidden = true;
    formStep.hidden = false;
    paymentStep.hidden = true;
    successStep.hidden = true;
    if (emailInput) emailInput.value = "";
    if (joinLinkWrap) joinLinkWrap.hidden = true;
    revealJoinBtn?.removeAttribute("hidden");
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function startTimer() {
    function tick() {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      timerEl.textContent = `Complete payment within ${formatTime(remaining)}`;
      if (remaining <= 0) {
        clearTimers();
        showError("Payment window expired. Please try again or contact info@duacrypto.com.");
        paymentStep.hidden = true;
        formStep.hidden = false;
      }
    }
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  async function showPaymentStep(email) {
    memberEmail = email;
    formStep.hidden = true;
    paymentStep.hidden = false;
    expiresAt = Date.now() + DAL_CONFIG.paymentWindowMinutes * 60 * 1000;
    addressInput.value = DAL_CONFIG.lightningAddress;

    try {
      await drawLightningQr(qrCanvas, DAL_CONFIG.lightningAddress);
    } catch {
      showError("Could not render QR code. Copy the Lightning address below.");
    }

    startTimer();

    if (typeof gtag === "function") {
      gtag("event", "payment_started", {
        method: "lightning_address",
        amount_usd: DAL_CONFIG.membershipAmountUsd,
      });
    }
  }

  function showProofInstructions() {
    clearTimers();
    paymentStep.hidden = true;
    successStep.hidden = false;

    if (proofEmailEl) {
      proofEmailEl.textContent = DAL_CONFIG.proofEmail;
    }
    if (proofMailtoBtn) {
      proofMailtoBtn.href = buildProofMailto(memberEmail);
    }
    if (joinLinkWrap) {
      joinLinkWrap.hidden = true;
    }
    if (inviteLink) {
      inviteLink.href = DAL_CONFIG.telegramInviteUrl;
      inviteLink.textContent = `Request to join ${DAL_CONFIG.telegramGroupName}`;
    }

    if (typeof gtag === "function") {
      gtag("event", "payment_proof_requested", { method: "lightning_address" });
    }
  }

  function revealJoinLink() {
    if (joinLinkWrap) joinLinkWrap.hidden = false;
    revealJoinBtn?.setAttribute("hidden", "");

    if (typeof gtag === "function") {
      gtag("event", "telegram_invite_revealed", { group: DAL_CONFIG.telegramGroupName });
    }
  }

  document.querySelectorAll("[data-dal-open-payment]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
  });

  overlay.querySelector("#dal-payment-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }
    errorEl.hidden = true;
    const submitBtn = overlay.querySelector("#dal-payment-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Loading payment…";
    try {
      await showPaymentStep(email);
    } catch {
      showError("Could not load payment details. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-bolt" aria-hidden="true"></i> Continue to payment';
    }
  });

  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(addressInput.value);
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
    } catch {
      addressInput.select();
    }
  });

  retryBtn?.addEventListener("click", resetModal);
  paidBtn?.addEventListener("click", () => showProofInstructions());
  revealJoinBtn?.addEventListener("click", () => revealJoinLink());

  return { openModal, closeModal };
}
