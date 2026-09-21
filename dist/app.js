(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const form = document.getElementById("submissionForm");
  const pdfInput = document.getElementById("reportPdf");
  const reportText = document.getElementById("reportText");
  const submitButton = document.getElementById("submitButton");
  const formError = document.getElementById("formError");
  const successPanel = document.getElementById("successPanel");
  const setupNotice = document.getElementById("setupNotice");
  const maxBytes = Number(config.maximumPdfBytes) || 3 * 1024 * 1024;
  let requestTimer = null;

  document.getElementById("courseCode").textContent = config.courseCode || "ME25C08";
  document.getElementById("institutionName").textContent = config.institutionName || "Department of Mechanical Engineering";

  const endpointReady = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.appsScriptUrl || "");
  setupNotice.hidden = endpointReady;

  document.getElementById("aiModel").addEventListener("change", function (event) {
    const isOther = event.target.value === "Other";
    document.getElementById("otherModelWrap").hidden = !isOther;
    document.getElementById("otherModel").required = isOther;
  });

  document.querySelectorAll('input[name="reportMode"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      const usePdf = radio.value === "pdf" && radio.checked;
      document.getElementById("pdfSection").hidden = !usePdf;
      document.getElementById("textSection").hidden = usePdf;
      pdfInput.required = usePdf;
      reportText.required = !usePdf;
      clearError();
    });
  });
  pdfInput.required = true;

  reportText.addEventListener("input", function () {
    document.getElementById("reportCount").textContent = reportText.value.length.toLocaleString();
  });

  pdfInput.addEventListener("change", updateFileLabel);
  const dropzone = document.getElementById("dropzone");
  ["dragenter", "dragover"].forEach(function (type) {
    dropzone.addEventListener(type, function (event) { event.preventDefault(); dropzone.classList.add("dragover"); });
  });
  ["dragleave", "drop"].forEach(function (type) {
    dropzone.addEventListener(type, function (event) { event.preventDefault(); dropzone.classList.remove("dragover"); });
  });
  dropzone.addEventListener("drop", function (event) {
    if (event.dataTransfer.files.length) {
      pdfInput.files = event.dataTransfer.files;
      updateFileLabel();
    }
  });

  function updateFileLabel() {
    const file = pdfInput.files[0];
    const label = document.getElementById("fileLabel");
    const meta = document.getElementById("fileMeta");
    if (!file) {
      label.textContent = "Choose your report PDF";
      meta.textContent = "PDF only · maximum 3 MB";
      return;
    }
    label.textContent = file.name;
    meta.textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
    formError.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function clearError() { formError.hidden = true; formError.textContent = ""; }
  function setBusy(busy) {
    submitButton.disabled = busy;
    submitButton.querySelector(".button-text").hidden = busy;
    submitButton.querySelector(".button-wait").hidden = !busy;
  }

  function validatePdf(file) {
    if (!file) return "Choose a PDF report before submitting.";
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return "The report must be a PDF file.";
    if (file.size > maxBytes) return "The selected PDF exceeds the 3 MB limit. Please compress it and try again.";
    if (file.size === 0) return "The selected PDF is empty.";
    return "";
  }

  function fileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const result = String(reader.result || "");
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = function () { reject(new Error("The PDF could not be read.")); };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearError();

    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    if (!form.checkValidity()) {
      const invalid = form.querySelector(":invalid");
      if (invalid) { invalid.setAttribute("aria-invalid", "true"); invalid.focus(); }
      showError("Please complete all required fields before submitting.");
      return;
    }
    if (!endpointReady) {
      showError("This submission site has not yet been connected to the faculty's Google Drive.");
      return;
    }

    const mode = form.elements.reportMode.value;
    const file = pdfInput.files[0];
    if (mode === "pdf") {
      const pdfError = validatePdf(file);
      if (pdfError) { showError(pdfError); return; }
    }

    setBusy(true);
    try {
      const payload = new FormData(form);
      payload.delete("reportPdf");
      payload.set("clientTimestamp", new Date().toISOString());
      payload.set("reportMode", mode);
      if (mode === "pdf") {
        payload.set("pdfBase64", await fileAsBase64(file));
        payload.set("pdfFileName", file.name);
        payload.set("pdfMimeType", "application/pdf");
      } else {
        payload.set("pdfBase64", "");
        payload.set("pdfFileName", "");
      }

      const bridgeForm = document.createElement("form");
      bridgeForm.method = "POST";
      bridgeForm.action = config.appsScriptUrl;
      bridgeForm.target = "submissionTarget";
      bridgeForm.hidden = true;
      payload.forEach(function (value, key) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        bridgeForm.appendChild(input);
      });
      document.body.appendChild(bridgeForm);
      bridgeForm.submit();
      bridgeForm.remove();

      requestTimer = window.setTimeout(function () {
        setBusy(false);
        showError("No confirmation was received. Check your connection before trying again; if uncertain, contact the faculty before resubmitting.");
      }, 45000);
    } catch (error) {
      setBusy(false);
      showError(error.message || "The submission could not be prepared.");
    }
  });

  window.addEventListener("message", function (event) {
    const responseFrame = document.getElementById("submissionTarget");
    const trustedFrame = event.source === responseFrame.contentWindow;
    const allowedOrigin = event.origin === "null" || event.origin === "https://script.google.com" || event.origin.endsWith(".googleusercontent.com");
    if (!trustedFrame || !allowedOrigin || !event.data || event.data.type !== "materials-submission-result") return;
    window.clearTimeout(requestTimer);
    setBusy(false);

    if (!event.data.ok) {
      showError(event.data.message || "The submission was not accepted.");
      return;
    }

    document.getElementById("receiptId").textContent = event.data.submissionId || "Recorded";
    document.getElementById("receiptReg").textContent = event.data.registrationNumber || form.elements.registrationNumber.value;
    document.getElementById("receiptTime").textContent = event.data.submittedAt || new Date().toLocaleString();
    form.hidden = true;
    document.querySelector(".form-heading").hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  });

  document.getElementById("newSubmission").addEventListener("click", function () {
    form.reset();
    pdfInput.required = true;
    reportText.required = false;
    updateFileLabel();
    document.getElementById("reportCount").textContent = "0";
    document.getElementById("pdfSection").hidden = false;
    document.getElementById("textSection").hidden = true;
    document.getElementById("otherModelWrap").hidden = true;
    successPanel.hidden = true;
    form.hidden = false;
    document.querySelector(".form-heading").hidden = false;
    form.elements.studentName.focus();
  });

  const modelContext = document.modelContext;
  if (modelContext && typeof modelContext.registerTool === "function") {
    try {
      modelContext.registerTool({
        name: "start_materials_submission",
        title: "Start materials submission",
        description: "Focus the first field of the materials-selection submission form without submitting data.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: function () {
          form.elements.studentName.focus();
          return { status: "ready", firstField: "studentName" };
        }
      });
    } catch (_) { /* WebMCP is optional. */ }
  }
})();
