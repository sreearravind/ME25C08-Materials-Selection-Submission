(function () {
  "use strict";

  // Student-facing suggestions are deterministic, browser-only and not an aptitude assessment.
  const fieldOrder = ["materials", "design", "manufacturing", "thermal", "automotive", "automation", "sustainability", "data"];
  const fields = {
    materials: {
      title: "Materials, Metallurgy & Failure Analysis",
      about: "Explore why materials behave differently, how they are selected, and why components corrode, wear or fail.",
      search: "materials selection, steel corrosion, polymer properties, mechanical failure",
      ideas: [
        { title: "Choose a suitable material for a bicycle carrier bracket", method: "Compare properties, cost and fabrication constraints from published sources; justify a choice.", need: "desk" },
        { title: "Investigate causes of corrosion in an everyday steel component", method: "Document an example, research likely mechanisms and compare prevention options.", need: "desk" },
        { title: "Compare mild-steel corrosion in two water conditions", method: "Plan and conduct a supervised, low-risk laboratory comparison with consistent observations.", need: "lab" }
      ]
    },
    design: {
      title: "Machine Design & CAD",
      about: "Understand mechanisms, forces, dimensions and how a product can be improved through sketches and CAD.",
      search: "mechanism design, levers, CAD modelling, design optimisation",
      ideas: [
        { title: "Conceptual design of a manual plastic-bottle crusher", method: "Sketch two mechanisms, estimate force and justify a preferred layout.", need: "desk" },
        { title: "Compare hinge and linkage arrangements for a folding stand", method: "Build simple kinematic sketches, compare motion and present a feasible CAD concept.", need: "desk" },
        { title: "Prototype a lightweight folding book stand", method: "Build a supervised cardboard model and measure stability against a stated load.", need: "workshop" }
      ]
    },
    manufacturing: {
      title: "Manufacturing & Production",
      about: "Investigate how components are fabricated, how processes affect quality and how waste or effort can be reduced.",
      search: "casting, machining, sheet-metal forming, manufacturing process selection",
      ideas: [
        { title: "Plan the manufacturing route for a small metal bracket", method: "Compare machining, bending and joining; propose process steps and inspection points.", need: "desk" },
        { title: "Compare casting and machining for a simple component", method: "Study process suitability, defects, batch size and likely material waste.", need: "desk" },
        { title: "Study dimensional variation of basic workshop samples", method: "Measure permitted samples under workshop supervision and summarise the variation.", need: "workshop" }
      ]
    },
    thermal: {
      title: "Thermal Engineering & Energy",
      about: "Look at heat, cooling, energy use and simple ways to improve thermal performance.",
      search: "heat transfer, natural convection, solar dryer, energy efficiency",
      ideas: [
        { title: "Conceptual design of a low-cost solar crop dryer", method: "Compare published dryer layouts and make a labelled heat-flow concept and assumptions.", need: "desk" },
        { title: "Compare passive cooling approaches for an electronics enclosure", method: "Sketch ventilation concepts and estimate heat-transfer trade-offs using references.", need: "desk" },
        { title: "Compare cooling of water in different container materials", method: "Make a supervised, safe temperature-versus-time study using available lab instruments.", need: "lab" }
      ]
    },
    automotive: {
      title: "Automotive & Mobility Engineering",
      about: "Investigate vehicle mechanisms, performance, safety and the engineering behind mobility systems.",
      search: "vehicle suspension, braking systems, bicycle drivetrain, electric vehicle components",
      ideas: [
        { title: "Compare disc and drum brake mechanisms", method: "Study working principles, materials and maintenance considerations; make a comparison chart.", need: "desk" },
        { title: "Study bicycle drivetrain ratios and pedalling effort", method: "Use gear-tooth counts and simple mechanics to compare practical configurations.", need: "desk" },
        { title: "Build a small educational steering-geometry mock-up", method: "Make a non-roadworthy model with mentor-approved materials and document wheel-angle behaviour.", need: "workshop" }
      ]
    },
    automation: {
      title: "Automation, Sensors & Mechatronics",
      about: "Explore how sensors, mechanisms and control logic can help machines sense and respond.",
      search: "object counting sensors, simple automation, Arduino, machine monitoring",
      ideas: [
        { title: "Design a non-contact object counting concept", method: "Compare infrared and optical sensors, show a block diagram and discuss counting errors.", need: "desk" },
        { title: "Plan an automatic water-level indicator", method: "Research sensor options, sketch a low-voltage system and define how it would be tested.", need: "desk" },
        { title: "Demonstrate a low-voltage optical object counter", method: "With mentor support, assemble a basic sensor and microcontroller demonstration.", need: "kit" }
      ]
    },
    sustainability: {
      title: "Sustainable Engineering & Circular Design",
      about: "Examine material use, reuse, waste, energy and practical solutions with environmental benefits.",
      search: "recycled materials, sustainable packaging, waste reduction, circular engineering",
      ideas: [
        { title: "Compare areca-leaf and plastic food-plate materials", method: "Define comparison boundaries and assess durability, reusability and disposal using sources.", need: "desk" },
        { title: "Map material waste in one campus activity", method: "Use permission-based observations to suggest engineering-led waste-reduction opportunities.", need: "desk" },
        { title: "Prototype a manual waste-segregation aid", method: "Develop a basic mock-up from permitted recycled materials and record usability.", need: "workshop" }
      ]
    },
    data: {
      title: "Engineering Simulation & Data Analysis",
      about: "Use calculations, spreadsheets and simple computational tools to compare engineering decisions.",
      search: "engineering spreadsheet analysis, parameter study, material ranking, basic simulation",
      ideas: [
        { title: "Create a material-selection decision matrix", method: "Use published material properties and explain each criterion, weight and source.", need: "desk" },
        { title: "Compare two beam designs using elementary calculations", method: "Estimate bending stress or deflection, clearly state assumptions and compare results.", need: "desk" },
        { title: "Analyse measured component dimensions in a spreadsheet", method: "With permitted readings, calculate spread, plot results and explain measurement limitations.", need: "lab" }
      ]
    }
  };

  function fieldChoices(labels) {
    return labels.map(function (label, index) { return { label: label, field: fieldOrder[index] }; });
  }
  function choices(labels, values) {
    return labels.map(function (label, index) { return { label: label, value: values[index] }; });
  }

  const questions = [
    {
      prompt: "Which topic immediately catches your attention?",
      hint: "Choose what you genuinely feel curious about, even if you have not studied it yet.",
      weight: 3,
      options: fieldChoices(["Why a metal component fails or rusts", "How a mechanism or product is designed", "How a part is manufactured", "How a device heats or cools", "How bicycles or vehicles work", "How machines sense or automate tasks", "How we can reduce engineering waste", "How calculations and software solve problems"])
    },
    {
      prompt: "Which activity would you most enjoy trying?",
      hint: "You do not need prior experience.",
      weight: 2,
      options: fieldChoices(["Compare the properties of materials", "Sketch and model a new mechanism", "Improve a production sequence", "Measure heat flow or cooling", "Examine a vehicle subsystem", "Connect sensors to a small device", "Reduce resource use in a process", "Analyse results with a spreadsheet"])
    },
    {
      prompt: "Which everyday problem would you choose to investigate?",
      hint: "Think about the question you would want to answer.",
      weight: 2,
      options: fieldChoices(["A steel part corroding too quickly", "A folding mechanism that is difficult to operate", "Excess waste from making a component", "Food needing more efficient drying", "A bicycle that is hard to pedal uphill", "Items needing to be counted automatically", "Too much single-use material waste", "Two engineering options needing objective comparison"])
    },
    {
      prompt: "Which kind of final output sounds most satisfying?",
      hint: "All choices can lead to meaningful individual projects.",
      weight: 2,
      options: fieldChoices(["A tested material comparison", "A mechanism sketch or CAD design", "A process plan with measurements", "A thermal performance comparison", "A mobility-system analysis", "A sensing or control demonstration", "A resource-saving engineering solution", "A model, graph or decision tool"])
    },
    {
      prompt: "Which video or article would you open first?",
      hint: "Imagine browsing an engineering learning website.",
      weight: 2,
      options: fieldChoices(["How engineers investigate fractured components", "How gears and linkages are designed", "How castings and machined parts are produced", "How solar dryers and heat exchangers work", "How suspension and brakes function", "How sensors are used in factories", "How discarded materials can be reused", "How engineers interpret experimental graphs"])
    },
    {
      prompt: "If you could improve one existing product, you would focus on…",
      hint: "Select the improvement closest to your interests.",
      weight: 2,
      options: fieldChoices(["Choosing a more suitable material", "Changing its shape or motion", "Making it simpler to manufacture", "Reducing unwanted heating or cooling loss", "Improving its mobility-related mechanism", "Adding a sensing or counting function", "Reducing its waste or environmental impact", "Measuring and comparing its performance"])
    },
    {
      prompt: "During a project discussion, what role appeals most to you?",
      hint: "This is about interest, not your current skill level.",
      weight: 2,
      options: fieldChoices(["Investigating material behaviour", "Planning the design and dimensions", "Working out fabrication steps", "Estimating temperature or energy changes", "Analysing vehicle functions", "Planning a sensor-control approach", "Identifying sustainable alternatives", "Organising data and calculations"])
    },
    {
      prompt: "Which second field would you also like to explore?",
      hint: "It is okay if you choose the same field again; choose freely.",
      weight: 2,
      options: fieldChoices(["Materials and failure", "Design and CAD", "Manufacturing", "Thermal and energy", "Automotive", "Automation and sensors", "Sustainability", "Engineering data and simulation"])
    },
    {
      prompt: "What style of project would you prefer?",
      hint: "This preference helps us choose appropriate starter examples; it does not decide your interest field.",
      key: "style",
      options: choices(["Research, calculations or a design report", "A physical prototype or mechanism", "A practical measurement or experiment", "I am open to any of these"], ["desk", "prototype", "experiment", "open"])
    },
    {
      prompt: "Which resources could you realistically access?",
      hint: "Do not assume a lab or workshop is available until your mentor confirms access.",
      key: "access",
      options: choices(["Phone or laptop, internet, paper and pencil", "The above plus a supervised workshop", "The above plus an approved laboratory", "Workshop and laboratory, or a supervised electronics kit"], ["desk", "workshop", "lab", "full"])
    },
    {
      prompt: "What is your project spending situation?",
      hint: "This is only for feasibility planning; spending more is not better.",
      key: "budget",
      options: choices(["No personal spending preferred", "A small purchase may be possible", "Institutional resources may be available", "Not sure — I will discuss with my mentor"], ["none", "small", "institution", "unknown"])
    },
    {
      prompt: "How confident are you about learning new project tools?",
      hint: "Beginners are welcome — this question will guide the next-step advice.",
      key: "confidence",
      options: choices(["I am new and need a guided introduction", "I can learn from tutorials and practice", "I have already used some engineering tools", "I would like to learn but need help choosing where to start"], ["beginner", "growing", "experienced", "unsure"])
    }
  ];

  const form = document.getElementById("interestForm");
  const group = document.getElementById("questionGroup");
  const choiceRoot = document.getElementById("choices");
  const quiz = document.getElementById("explorer");
  const result = document.getElementById("result");
  const error = document.getElementById("questionError");
  const nextButton = document.getElementById("nextButton");
  const previousButton = document.getElementById("previousButton");
  const answers = Array(questions.length).fill(null);
  let step = 0;
  let lastSummary = "";

  function renderQuestion() {
    const q = questions[step];
    document.getElementById("questionText").textContent = q.prompt;
    document.getElementById("questionHint").textContent = q.hint;
    document.getElementById("counter").textContent = "Question " + (step + 1) + " of " + questions.length;
    document.getElementById("progress").setAttribute("aria-valuenow", String(step + 1));
    document.getElementById("progressFill").style.width = (100 * (step + 1) / questions.length) + "%";
    choiceRoot.replaceChildren();
    q.options.forEach(function (option, index) {
      const wrapper = document.createElement("label");
      wrapper.className = "choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "project-interest";
      input.value = String(index);
      input.checked = answers[step] === index;
      input.addEventListener("change", function () {
        answers[step] = index;
        error.hidden = true;
      });
      const visual = document.createElement("span");
      visual.className = "option";
      const indicator = document.createElement("span");
      indicator.className = "indicator";
      indicator.setAttribute("aria-hidden", "true");
      const caption = document.createElement("span");
      caption.textContent = option.label;
      visual.append(indicator, caption);
      wrapper.append(input, visual);
      choiceRoot.append(wrapper);
    });
    error.hidden = true;
    previousButton.disabled = step === 0;
    nextButton.textContent = step === questions.length - 1 ? "See my project directions →" : "Next question →";
  }

  function selectedOption(index) {
    const selection = answers[index];
    return selection === null ? null : questions[index].options[selection];
  }

  function getPreferences() {
    const p = {};
    questions.forEach(function (question, index) {
      if (question.key) {
        const option = selectedOption(index);
        p[question.key] = option ? option.value : "unknown";
      }
    });
    return p;
  }

  function scoreFields() {
    const scores = Object.fromEntries(fieldOrder.map(function (id) { return [id, 0]; }));
    const signals = Object.fromEntries(fieldOrder.map(function (id) { return [id, []]; }));
    questions.forEach(function (q, index) {
      const answer = selectedOption(index);
      if (!answer || !q.weight) return;
      scores[answer.field] += q.weight;
      signals[answer.field].push(answer.label);
    });
    // Break ties using the earliest stated interest, then keep the documented field order.
    const ranking = fieldOrder.slice().sort(function (a, b) {
      if (scores[b] !== scores[a]) return scores[b] - scores[a];
      const primary = selectedOption(0);
      if (primary && primary.field === a) return -1;
      if (primary && primary.field === b) return 1;
      const secondary = selectedOption(7);
      if (secondary && secondary.field === a) return -1;
      if (secondary && secondary.field === b) return 1;
      return fieldOrder.indexOf(a) - fieldOrder.indexOf(b);
    });
    return { ranking: ranking, scores: scores, signals: signals };
  }

  function chooseIdeas(field, preferences) {
    const allowed = { desk: true };
    if (preferences.access === "workshop" || preferences.access === "full") allowed.workshop = true;
    if (preferences.access === "lab" || preferences.access === "full") allowed.lab = true;
    if (preferences.access === "full") allowed.kit = true;
    const available = field.ideas.filter(function (idea) {
      if (!allowed[idea.need]) return false;
      if (preferences.budget === "none" && idea.need === "kit") return false;
      return true;
    });
    const preferredNeed = preferences.style === "prototype" ? ["workshop", "kit"] : preferences.style === "experiment" ? ["lab"] : ["desk"];
    available.sort(function (a, b) {
      const aa = preferredNeed.includes(a.need) ? 1 : 0;
      const bb = preferredNeed.includes(b.need) ? 1 : 0;
      return bb - aa;
    });
    return available.slice(0, 2);
  }

  function node(tag, cls, value) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (value !== undefined) el.textContent = value;
    return el;
  }

  function showResults() {
    const graded = scoreFields();
    const prefs = getPreferences();
    const winners = graded.ranking.slice(0, 3);
    const max = Math.max.apply(null, winners.map(function (id) { return graded.scores[id]; })) || 1;
    const root = document.getElementById("resultCards");
    root.replaceChildren();
    const first = fields[winners[0]].title;
    document.getElementById("resultIntro").textContent =
      "Your answers suggest starting with " + first + ". Other fields below may also interest you. Explore all three before choosing a topic; these are interest signals, not skill ratings or guaranteed project matches.";

    const textLines = [
      "MINI-PROJECT EXPLORATION SUMMARY",
      "Indicative interests from a self-reflection questionnaire — not a grade or approved project.",
      "Suggested areas: " + winners.map(function (id) { return fields[id].title; }).join("; "),
      ""
    ];
    winners.forEach(function (id, rankIndex) {
      const info = fields[id];
      const card = node("article", "match-card");
      const top = node("div", "match-top");
      const titleBox = node("div");
      titleBox.append(node("span", "rank", rankIndex === 0 ? "First area to explore" : "Alternative area " + (rankIndex + 1)), node("h3", "", info.title));
      const matchLabel = node("span", "signal", "Interest signals: " + graded.scores[id] + " points");
      top.append(titleBox, matchLabel);
      card.append(top, node("p", "", info.about));
      const bar = node("div", "match-bar");
      const fill = node("div");
      fill.style.width = Math.round(100 * graded.scores[id] / max) + "%";
      bar.append(fill);
      card.append(bar);
      const signalText = graded.signals[id].slice(0, 3).join(" · ") || "Area to explore further";
      card.append(node("p", "signal", "Your choices included: " + signalText));
      card.append(node("p", "signal", "Useful search terms: " + info.search));
      const listTitle = node("strong", "", "Starter directions to discuss with your mentor:");
      const list = node("ul");
      const ideas = chooseIdeas(info, prefs);
      ideas.forEach(function (idea) {
        const li = node("li");
        li.append(node("strong", "", idea.title + " — "), document.createTextNode(idea.method));
        list.append(li);
      });
      card.append(listTitle, list);
      root.append(card);
      textLines.push((rankIndex + 1) + ". " + info.title);
      textLines.push("Why this may suit you: " + info.about);
      textLines.push("Your choices: " + signalText);
      textLines.push("Search terms: " + info.search);
      ideas.forEach(function (idea) { textLines.push("- " + idea.title + ": " + idea.method); });
      textLines.push("");
    });

    const advice = prefs.confidence === "beginner" || prefs.confidence === "unsure"
      ? "Start with one introductory video, one diagram or sketch, and a short discussion with your mentor."
      : "Select a focused problem and prepare a basic method, measurable output and list of sources.";
    textLines.push("Suggested next action: " + advice);
    textLines.push("Common research resources (same for all students):");
    textLines.push("National Digital Library of India: https://ndl.iitkgp.ac.in/");
    textLines.push("NPTEL: https://nptel.ac.in/courses");
    textLines.push("Virtual Labs: https://www.vlab.co.in/");
    textLines.push("NIF: https://nif.org.in/");
    textLines.push("SWAYAM: https://swayam.gov.in/");
    textLines.push("Shodhganga: https://shodhganga.inflibnet.ac.in/");
    textLines.push("Final topic must be approved by the mentor; verify sources independently.");
    lastSummary = textLines.join("\n");

    quiz.hidden = true;
    result.hidden = false;
    document.getElementById("copyStatus").textContent = "";
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const checked = choiceRoot.querySelector('input[type="radio"]:checked');
    if (!checked) {
      error.hidden = false;
      const firstChoice = choiceRoot.querySelector("input");
      if (firstChoice) firstChoice.focus();
      return;
    }
    answers[step] = Number(checked.value);
    if (step < questions.length - 1) {
      step += 1;
      renderQuestion();
      group.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      showResults();
    }
  });
  previousButton.addEventListener("click", function () {
    if (step > 0) { step -= 1; renderQuestion(); group.scrollIntoView({ behavior: "smooth", block: "center" }); }
  });
  document.getElementById("restartButton").addEventListener("click", function () {
    answers.fill(null);
    step = 0;
    result.hidden = true;
    quiz.hidden = false;
    lastSummary = "";
    renderQuestion();
    quiz.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("printButton").addEventListener("click", function () { window.print(); });
  document.getElementById("copyButton").addEventListener("click", async function () {
    const status = document.getElementById("copyStatus");
    try {
      await navigator.clipboard.writeText(lastSummary);
      status.textContent = "Summary copied. You can paste it into your notes or share it with your mentor.";
    } catch (err) {
      status.textContent = "Copy was blocked by this browser. Please use Print / Save as PDF.";
    }
  });
  // Deliberately no analytics, cookies, localStorage or network submission.
  renderQuestion();
}());
