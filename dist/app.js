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

  const studentAssignments = [
  {
    "number": 1,
    "roll": "25ME001",
    "name": "Bharath R",
    "application": "Select a material for an automotive engine crankshaft subjected to cyclic bending and torsion."
  },
  {
    "number": 2,
    "roll": "25ME002",
    "name": "Darwin Cyril S",
    "application": "Select a material for an automotive suspension coil spring requiring high fatigue resistance."
  },
  {
    "number": 3,
    "roll": "25ME003",
    "name": "Devendhiran S",
    "application": "Select a material for a railway wheel subjected to repeated rolling contact and impact loading."
  },
  {
    "number": 4,
    "roll": "25ME004",
    "name": "Felix Josh Anson A",
    "application": "Select a material for a food-processing mixer shaft requiring strength and corrosion resistance."
  },
  {
    "number": 5,
    "roll": "25ME005",
    "name": "Gurusaran R",
    "application": "Select a material for a hot-forging die exposed to impact, wear and elevated temperature."
  },
  {
    "number": 6,
    "roll": "25ME006",
    "name": "Harish Maruthu R",
    "application": "Select a material for an automobile engine block requiring vibration damping, castability and wear resistance."
  },
  {
    "number": 7,
    "roll": "25ME007",
    "name": "Hewin Amala Inigo M",
    "application": "Select a material for a heavy-duty manhole cover subjected to impact and traffic loading."
  },
  {
    "number": 8,
    "roll": "25ME008",
    "name": "Idris A",
    "application": "Select a lightweight material for commercial aircraft fuselage skin."
  },
  {
    "number": 9,
    "roll": "25ME010",
    "name": "Koushik N",
    "application": "Select a material for an electric-vehicle battery enclosure requiring low weight, crash resistance and heat dissipation."
  },
  {
    "number": 10,
    "roll": "25ME011",
    "name": "Maheswaran A",
    "application": "Select a material for a lightweight bicycle frame requiring strength, corrosion resistance and manufacturability."
  },
  {
    "number": 11,
    "roll": "25ME012",
    "name": "Manikandan K",
    "application": "Select a material for marine heat-exchanger tubes exposed to seawater corrosion."
  },
  {
    "number": 12,
    "roll": "25ME013",
    "name": "Manivel S",
    "application": "Select a material for a high-current electrical connector requiring conductivity, strength and thermal resistance."
  },
  {
    "number": 13,
    "roll": "25ME014",
    "name": "Mathubalan T",
    "application": "Select a lightweight material for the structural frame of a delivery drone."
  },
  {
    "number": 14,
    "roll": "25ME015",
    "name": "Menaka S",
    "application": "Select a material for a lightweight automobile gearbox housing requiring castability and vibration control."
  },
  {
    "number": 15,
    "roll": "25ME016",
    "name": "Nasilan N",
    "application": "Select a biocompatible material for a load-bearing hip implant stem."
  },
  {
    "number": 16,
    "roll": "25ME017",
    "name": "Navin P",
    "application": "Select a material for an aircraft compressor blade requiring high specific strength and fatigue resistance."
  },
  {
    "number": 17,
    "roll": "25ME018",
    "name": "Nishanth S",
    "application": "Select a material for a self-adjusting orthodontic archwire."
  },
  {
    "number": 18,
    "roll": "25ME019",
    "name": "Nithish Kumar I",
    "application": "Select a material for a temperature-activated automatic valve actuator."
  },
  {
    "number": 19,
    "roll": "25ME020",
    "name": "Pratheesh Kumar B",
    "application": "Select a material for a lightweight satellite structural panel requiring dimensional stability."
  },
  {
    "number": 20,
    "roll": "25ME021",
    "name": "Sanjai L",
    "application": "Select a material for a high-speed robotic arm requiring high stiffness and low inertia."
  },
  {
    "number": 21,
    "roll": "25ME022",
    "name": "Sanjay K",
    "application": "Select a material for a small wind-turbine blade exposed to cyclic loading and outdoor conditions."
  },
  {
    "number": 22,
    "roll": "25ME023",
    "name": "Santhosh R",
    "application": "Select a material for a chemical-storage tank requiring corrosion resistance and economical fabrication."
  },
  {
    "number": 23,
    "roll": "25ME024",
    "name": "Santhosh S",
    "application": "Select a material for a pump mechanical seal operating with abrasive and corrosive fluids."
  },
  {
    "number": 24,
    "roll": "25ME025",
    "name": "Saravana D",
    "application": "Select a material for a high-performance vehicle brake disc exposed to severe wear and temperature."
  },
  {
    "number": 25,
    "roll": "25ME026",
    "name": "Sribhuvan B",
    "application": "Select a material for high-speed bearing balls used in a machine-tool spindle."
  },
  {
    "number": 26,
    "roll": "25ME027",
    "name": "Venkatesh P",
    "application": "Select a material for a dental crown requiring strength, wear resistance and aesthetic appearance."
  },
  {
    "number": 27,
    "roll": "25ME028",
    "name": "Vimalraj D",
    "application": "Select a cutting-tool material for high-speed machining of nickel-based superalloys."
  },
  {
    "number": 28,
    "roll": "25ME029",
    "name": "Vishal Kiptson S",
    "application": "Select a polymer for an aircraft bearing cage requiring low weight, wear resistance and temperature stability."
  },
  {
    "number": 29,
    "roll": "25ME030",
    "name": "Yogeshwara S",
    "application": "Select a transparent material for an industrial safety visor requiring impact resistance."
  },
  {
    "number": 30,
    "roll": "25ME031",
    "name": "Vishal V",
    "application": "Select a polymer for an automotive air-intake manifold exposed to heat, vibration and oil vapours."
  },
  {
    "number": 31,
    "roll": "26LME01",
    "name": "Siva Prasath M",
    "application": "Select a material for a chemical-processing valve seat requiring low friction and chemical resistance."
  },
  {
    "number": 32,
    "roll": "26LME02",
    "name": "Suthesh M",
    "application": "Select a material for an automobile lead-acid battery casing requiring chemical and impact resistance."
  },
  {
    "number": 33,
    "roll": "26LME03",
    "name": "Vignesh S",
    "application": "Select a material for an underground drinking-water pipeline requiring corrosion resistance and flexibility."
  }
];

  document.getElementById("courseCode").textContent = config.courseCode || "ME25C08";
  document.getElementById("institutionName").textContent = config.institutionName || "Department of Mechanical Engineering";

  const endpointReady = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.appsScriptUrl || "");
  setupNotice.hidden = endpointReady;

  const studentSelector = document.getElementById("studentSelector");
  const studentName = document.getElementById("studentName");
  const registrationNumber = document.getElementById("registrationNumber");
  const assignedApplication = document.getElementById("assignedApplication");

  studentAssignments.forEach(function (student) {
    const option = document.createElement("option");
    option.value = student.roll;
    option.textContent = student.number + ". " + student.name + " (" + student.roll + ")";
    studentSelector.appendChild(option);
  });

  studentSelector.addEventListener("change", function () {
    const selected = studentAssignments.find(function (student) {
      return student.roll === studentSelector.value;
    });
    studentName.value = selected ? selected.name : "";
    registrationNumber.value = selected ? selected.roll : "";
    assignedApplication.value = selected ? selected.application : "";
    clearError();
  });

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
    studentSelector.focus();
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
          studentSelector.focus();
          return { status: "ready", firstField: "studentName" };
        }
      });
    } catch (_) { /* WebMCP is optional. */ }
  }
})();
