(function(){
  'use strict';
  const config=window.SITE_CONFIG||{};
  const logEndpoint=config.appsScriptUrl||'';
  const students=[
    ['25ME001','Bharath R'],['25ME002','Darwin Cyril S'],['25ME003','Devendhiran S'],['25ME004','Felix Josh Anson A'],['25ME005','Gurusaran R'],['25ME006','Harish Maruthu R'],['25ME007','Hewin Amala Inigo M'],['25ME008','Idris A'],['25ME010','Koushik N'],['25ME011','Maheswaran A'],['25ME012','Manikandan K'],['25ME013','Manivel S'],['25ME014','Mathubalan T'],['25ME015','Menaka S'],['25ME016','Nasilan N'],['25ME017','Navin P'],['25ME018','Nishanth S'],['25ME019','Nithish Kumar I'],['25ME020','Pratheesh Kumar B'],['25ME021','Sanjai L'],['25ME022','Sanjay K'],['25ME023','Santhosh R'],['25ME024','Santhosh S'],['25ME025','Saravana D'],['25ME026','Sribhuvan B'],['25ME027','Venkatesh P'],['25ME028','Vimalraj D'],['25ME029','Vishal Kiptson S'],['25ME030','Yogeshwara S'],['25ME031','Vishal V'],['26LME01','Siva Prasath M'],['26LME02','Suthesh M'],['26LME03','Vignesh S']
  ];
  const q=(unit,text,options,answer,why)=>({unit,text,options,answer,why});
  const questions=[
    q('Unit III','A stainless-steel vessel must resist rusting during service. Which alloying element is most directly responsible for forming a thin, stable protective passive oxide film?',['Manganese (Mn)','Chromium (Cr)','Vanadium (V)','Tungsten (W)'],1,'Chromium forms a stable, adherent chromium-rich oxide film that passivates the steel and limits further corrosion.'),
    q('Unit III','A cutting tool must retain high hardness even when the cutting edge becomes hot during high-speed machining. Which steel class and alloying element are associated with hot/red hardness?',['Tool steel with Tungsten (W)','Mild steel with Copper (Cu)','Cast iron with Silicon (Si)','HSLA steel with Zinc (Zn)'],0,'Tungsten forms stable hard carbides and supports hot or red hardness in high-speed tool steels.'),
    q('Unit III','A seawater condenser tube requires excellent resistance to marine corrosion and biofouling/erosion. Which copper alloy is most suitable?',['Commercial brass (Cu-Zn)','Phosphor bronze (Cu-Sn)','Cupronickel (Cu-Ni)','Duralumin (Al-Cu)'],2,'Cupronickel alloys are widely used for seawater tubing because they resist marine corrosion, erosion and biofouling.'),
    q('Unit III','In precipitation hardening of an Al-Cu alloy, what essential heat-treatment step follows solution treatment and rapid quenching to form fine strengthening precipitates?',['Spheroidising','Aging (natural or artificial)','Carburising','Normalising'],1,'Aging permits controlled formation of fine precipitates from the supersaturated solid solution, increasing strength.'),
    q('Unit III','A deformed engineering component recovers its pre-set original shape upon heating due to a reversible martensitic transformation. Identify this material class.',['High-speed tool steel','Shape-memory alloy (Ni-Ti)','Grey cast iron','HSLA steel'],1,'Shape-memory alloys recover their trained form through a reversible martensite-to-austenite transformation.'),
    q('Unit III','Which cast iron is preferred for heavy machine-tool beds because its graphite flakes provide high vibration damping and excellent machinability?',['White cast iron','Grey cast iron','Malleable cast iron','Spheroidal graphite iron'],1,'Graphite flakes in grey iron dissipate vibration and assist chip breaking during machining.'),
    q('Unit III','A heavy-duty crusher roll requires maximum abrasion and wear resistance and can tolerate brittleness. Which cast iron is selected?',['Grey cast iron','White cast iron','Malleable cast iron','Nodular cast iron'],1,'White iron contains a large amount of hard cementite, giving excellent abrasion resistance but low toughness.'),
    q('Unit III','Pipe fittings require better ductility and shock resistance than white iron. Which cast iron is produced by prolonged annealing of white cast iron to form temper-carbon nodules?',['Grey cast iron','Malleable cast iron','Chilled cast iron','Spheroidal graphite iron'],1,'Prolonged annealing decomposes cementite in white iron and produces temper-carbon aggregates, giving malleable iron improved ductility.'),
    q('Unit III','An automotive crankshaft demands high tensile strength, fatigue resistance and toughness with good castability. Which cast iron is ideal?',['White cast iron','Grey cast iron','Spheroidal graphite (ductile) iron','Mottled cast iron'],2,'Spheroidal graphite reduces stress concentration compared with graphite flakes, improving strength, fatigue resistance and toughness.'),
    q('Unit III','A heavy sleeve-bearing bush requires high wear resistance, low friction and good load-carrying capacity. Which non-ferrous alloy family is standard?',['Bronze (Cu-Sn)','Cupronickel (Cu-Ni)','Pure aluminium','Magnesium alloy'],0,'Bearing bronzes combine good anti-friction behaviour, wear resistance and load-carrying capacity.'),
    q('Unit III','Which alloying element is added to steel primarily to improve toughness and ductility, particularly at sub-zero temperatures, while stabilizing austenite?',['Nickel (Ni)','Sulfur (S)','Phosphorus (P)','Lead (Pb)'],0,'Nickel stabilizes austenite and improves toughness, including low-temperature notch toughness.'),
    q('Unit III','An automotive chassis frame needs high yield strength to reduce section thickness and vehicle weight while retaining good weldability. Select the suitable steel class.',['White cast iron','High-strength low-alloy (HSLA) steel','High-carbon tool steel','Maraging steel'],1,'HSLA steels use controlled alloying and microalloying to raise yield strength while retaining useful weldability.'),
    q('Unit III','An ultra-high-strength steel contains very low carbon, high nickel (about 18%) and is strengthened by aging to precipitate fine intermetallic compounds. Identify this steel.',['Maraging steel','Mild steel','Austenitic stainless steel','Spring steel'],0,'Maraging steel is a low-carbon Fe-Ni martensitic alloy strengthened by aging-induced intermetallic precipitation.'),
    q('Unit III','Which alloying element in steel acts as a powerful deoxidizer, increases elastic limit and is a key addition in silicon-spring steels?',['Silicon (Si)','Copper (Cu)','Lead (Pb)','Tin (Sn)'],0,'Silicon is an effective deoxidizer and increases strength and elastic limit, making it important in spring steels.'),
    q('Unit III','Which alloying element forms fine carbides and nitrides in steel, refines grain size and provides secondary hardening during tempering?',['Vanadium (V)','Sulfur (S)','Bismuth (Bi)','Cadmium (Cd)'],0,'Vanadium forms fine V(C,N) particles that control grain size and strengthen steel, including during secondary hardening.'),
    q('Unit III','Why are aluminium alloys widely chosen for aircraft airframes and structural transport applications?',['Extremely high density and melting point','Low density combined with high specific strength','High magnetic permeability','Ultra-high room-temperature brittleness'],1,'Aluminium alloys combine low density (about 2.7 g/cm³) with useful strength, producing high strength-to-weight performance.'),
    q('Unit III','Which high-performance material family is essential for jet-engine gas-turbine hot-section blades operating above 800°C under heavy stress and oxidation?',['Nickel-based superalloys','Mild steel','Grey cast iron','Brass'],0,'Nickel-based superalloys retain strength and resist creep and oxidation at the high temperatures of turbine hot sections.'),
    q('Unit III','In austenitic stainless steel such as 18/8 grade, what is the role of Nickel in addition to Chromium?',['Stabilizes FCC austenite and enhances toughness/formability','Promotes brittle cleavage fracture','Lowers corrosion resistance','Makes the steel non-weldable'],0,'Nickel stabilizes the FCC austenitic structure and improves toughness and formability.'),
    q('Unit III','What is the primary function of Manganese in general commercial structural steels?',['Combines with sulfur as MnS, preventing hot-shortness, and increases hardenability','Causes severe embrittlement','Reduces tensile strength drastically','Prevents corrosion completely'],0,'Manganese ties up sulfur as MnS, reducing hot-shortness, and also contributes to strength and hardenability.'),
    q('Unit III','Why are national or international material standards such as IS, AISI and ASTM critical when purchasing engineering alloys?',['They replace supplier names with random numbers','They specify composition limits, property requirements and test procedures','They double raw-material cost','They eliminate heat treatment'],1,'Standards create consistent composition, property and test requirements independent of trade names.'),
    q('Unit IV','A low-cost, highly flexible packaging film with good moisture resistance is required. Which commodity polymer is most widely used?',['Polyethylene (PE/LDPE)','PEEK','SIALON','Phenol formaldehyde'],0,'LDPE is inexpensive, flexible, tough and moisture resistant, making it widely used for packaging films.'),
    q('Unit IV','A lightweight food container requires good stiffness, chemical resistance and the ability to form living hinges. Select the suitable commodity polymer.',['Polypropylene (PP)','Partially stabilized zirconia','Alumina','Phosphor bronze'],0,'Polypropylene has low density, chemical resistance and excellent flex-fatigue behaviour in living hinges.'),
    q('Unit IV','A transparent but relatively brittle disposable container or cutlery is needed at minimum cost. Which polymer is a common choice?',['Polystyrene (PS)','PEEK','PTFE','Polyamide (Nylon)'],0,'General-purpose polystyrene is low cost, clear and rigid but relatively brittle.'),
    q('Unit IV','A transparent display sheet requires exceptional optical clarity and outdoor weather/UV resistance, where extreme impact resistance is not critical. Identify the polymer.',['PMMA (acrylic)','PTFE','PPS','Urea formaldehyde'],0,'PMMA provides excellent transparency and weathering/UV resistance, although it is less impact resistant than polycarbonate.'),
    q('Unit IV','A transparent safety cover or machine guard must withstand heavy accidental impact without shattering. Which engineering polymer is vastly superior?',['Polycarbonate (PC)','PMMA','General-purpose polystyrene','Urea formaldehyde'],0,'Polycarbonate combines optical transparency with very high impact toughness and resists brittle shattering.'),
    q('Unit IV','A lightweight plastic gear or bushing needs high wear resistance, low friction, noise reduction and self-lubrication. Which engineering polymer is preferred?',['Polyamide (PA/Nylon)','PVC','Polystyrene','Bakelite'],0,'Nylon grades are widely used for gears and bushes because of wear resistance, low friction, damping and relatively quiet operation.'),
    q('Unit IV','An ultra-high-performance engineering polymer operates continuously above 200°C in aggressive chemicals and mechanical stress. Select the material.',['PEEK','Polyethylene','PVC','Polystyrene'],0,'PEEK retains useful mechanical properties at high temperature and has excellent chemical resistance.'),
    q('Unit IV','A chemical valve seal or non-stick bearing sleeve requires an extremely low coefficient of friction and near-total chemical inertness. Identify it.',['PTFE (Teflon)','PET','ABS','Polypropylene'],0,'PTFE has exceptionally low friction and broad chemical resistance because of its strong carbon-fluorine bonds.'),
    q('Unit IV','Which cross-linked thermosetting polymer is widely used for heat-resistant electrical switch bodies, cookware handles and moulded panels?',['Phenol formaldehyde (Bakelite)','Polyethylene','Polypropylene','PET'],0,'Phenol formaldehyde forms a permanently cross-linked network with useful heat resistance and electrical insulation.'),
    q('Unit IV','Which engineering ceramic is extensively used as an electrical insulator, spark-plug body and wear-resistant substrate because of high dielectric strength and hardness?',['Alumina (Al₂O₃)','Polyethylene','Brass','PVC'],0,'Alumina combines high electrical resistivity and dielectric strength with hardness, wear resistance and chemical stability.'),
    q('Unit IV','An abrasive grinding wheel or high-temperature heating element requires extreme hardness, high thermal conductivity and oxidation resistance. Select the ceramic.',['Silicon carbide (SiC)','Low-density polyethylene','Nylon','Polystyrene'],0,'Silicon carbide is extremely hard, thermally conductive and suitable for abrasives and high-temperature electrical heating elements.'),
    q('Unit IV','A high-speed ceramic rolling-element bearing needs low density, high strength, high fracture toughness and thermal-shock resistance. Identify it.',['Silicon nitride (Si₃N₄)','Pure lead','PMMA','Polystyrene'],0,'Silicon nitride combines low density with high strength, toughness and thermal-shock resistance, making it suitable for high-speed bearings.'),
    q('Unit IV','Which advanced ceramic achieves high fracture toughness through a stress-induced tetragonal-to-monoclinic transformation that creates compressive stress at crack tips?',['Partially stabilized zirconia (PSZ)','Silicon carbide','Alumina','SIALON'],0,'Transformation toughening in zirconia creates a local volume expansion and compressive stress that opposes crack growth.'),
    q('Unit IV','In a fibre-reinforced composite such as a glass-epoxy leaf spring, which constituent primarily carries tensile/bending load and provides high stiffness?',['Reinforcement fibres','Matrix resin','Plasticiser','Colour pigment'],0,'The fibres are the principal high-strength, high-stiffness load-bearing phase in the fibre direction.'),
    q('Unit IV','What is the primary structural role of the polymer matrix in a fibre-reinforced composite?',['Binds and protects fibres, maintains shape and transfers load by interface shear','Carries 100% of tensile load directly','Dissolves the fibres','Makes the component electrically conducting'],0,'The matrix positions and protects the fibres and transfers load between them through interfacial shear.'),
    q('Unit IV','A polymer matrix modified with a small percentage of nanoscale clay or graphene to improve mechanical, barrier and stiffness properties is known as a:',['Nanocomposite','Intermetallic compound','Solid solution','White cast iron'],0,'A nanocomposite contains at least one dispersed phase with nanoscale dimensions and a very large interfacial area.'),
    q('Unit IV','How do thermoplastics differ fundamentally from thermosetting polymers regarding heat behaviour?',['Thermoplastics soften repeatedly; thermosets cross-link permanently and do not remelt','Thermosets melt easily at 50°C','Thermoplastics cannot be recycled or moulded','Thermosets are linear chains without chemical bonds'],0,'Thermoplastics can soften and be reshaped repeatedly, whereas curing creates a permanent cross-linked network in thermosets.'),
    q('Unit IV','Which ceramic cutting-tool material synthesized from Si-Al-O-N combines high hot hardness with superior thermal-shock resistance compared with pure oxides?',['SIALON','Pure polyethylene','White cast iron','Brass'],0,'SIALON ceramics retain hot hardness and offer strong thermal-shock resistance for demanding cutting conditions.'),
    q('Unit IV','Why can nanocomposites significantly improve strength, barrier properties and stiffness with only about 1-5% nanoreinforcement?',['Extremely high surface-area-to-volume ratio creates a vast polymer-filler interface','Nanoparticles lower density to zero','Nanoparticles convert polymer into steel','Nanoparticles eliminate all atomic bonds'],0,'The enormous interfacial area lets well-dispersed nanoparticles strongly constrain polymer chains and alter transport paths at low loading.'),
    q('Unit IV','An automobile leaf spring made of GFRP has major advantages over a traditional multi-leaf steel spring primarily because of:',['Large weight reduction, high specific strain-energy storage, and fatigue/corrosion resistance','Lower cost than pig iron','Ability to withstand 2000°C','Zero tensile strength'],0,'GFRP reduces mass while offering high specific strain-energy capacity, corrosion resistance and useful fatigue performance.'),
  ];

  const $=s=>document.querySelector(s);
  const studentSelect=$('#studentSelect');
  students.forEach(([roll,name],i)=>studentSelect.add(new Option(`${i+1}. ${name} (${roll})`,roll)));
  const answers=Array(questions.length).fill(null);
  let current=0,focusCount=0,fullscreenExits=0,active=false,submitted=false,startedAt=null,sessionId='',heartbeatTimer=null;

  function selectedStudent(){ return students.find(x=>x[0]===studentSelect.value)||['','']; }
  function signal(eventType,detail,extra){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(logEndpoint)||!sessionId)return;
    const student=selectedStudent();
    const body=new URLSearchParams(Object.assign({
      action:'quizEvent',eventType,detail:detail||'',sessionId,
      registrationNumber:student[0],studentName:student[1],
      currentQuestion:String(current+1),answered:String(answers.filter(x=>x!==null).length),
      pageHidden:String(focusCount),fullscreenExits:String(fullscreenExits),
      isFullscreen:String(Boolean(document.fullscreenElement)),clientTimestamp:new Date().toISOString()
    },extra||{}));
    fetch(logEndpoint,{method:'POST',mode:'no-cors',body,keepalive:true}).catch(()=>{});
  }
  function startHeartbeat(){
    clearInterval(heartbeatTimer);
    heartbeatTimer=setInterval(()=>{if(active&&!submitted)signal('heartbeat','');},30000);
  }

  function renderPalette(){
    $('#palette').innerHTML=questions.map((_,i)=>`<button type="button" data-index="${i}" class="${answers[i]!==null?'answered ':''}${i===current?'current':''}">${i+1}</button>`).join('');
  }
  function updateProgress(){
    const n=answers.filter(x=>x!==null).length;
    $('#answeredCount').textContent=n;
    $('#progressBar').style.width=`${n/questions.length*100}%`;
    renderPalette();
  }
  function renderQuestion(){
    const item=questions[current];
    $('#unitLabel').textContent=item.unit;
    $('#questionNumber').textContent=`Question ${current+1} of ${questions.length}`;
    $('#questionText').textContent=item.text;
    $('#options').innerHTML=item.options.map((opt,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" ${answers[current]===i?'checked':''}><span class="option-key">${String.fromCharCode(65+i)}</span><span>${opt}</span></label>`).join('');
    $('#prevButton').disabled=current===0;
    $('#nextButton').hidden=current===questions.length-1;
    $('#submitButton').hidden=current!==questions.length-1;
    $('#testError').hidden=true;
    updateProgress();
  }
  async function enterFullscreen(){
    try{ if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); }catch(_){ /* Fullscreen may be denied; test still works. */ }
  }
  $('#startButton').addEventListener('click',async()=>{
    if(!studentSelect.value||!$('#honourCheck').checked){ $('#startError').textContent='Select your name and confirm the independent-attempt statement.'; $('#startError').hidden=false; return; }
    $('#startError').hidden=true; await enterFullscreen();
    sessionId=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);
    active=true; startedAt=Date.now(); document.body.classList.add('test-active'); $('#startPanel').hidden=true; $('#testPanel').hidden=false; renderQuestion();
    signal('start',document.fullscreenElement?'fullscreen-started':'fullscreen-unavailable-or-denied');startHeartbeat();
  });
  $('#options').addEventListener('change',e=>{ if(e.target.name==='answer'){answers[current]=Number(e.target.value);updateProgress();} });
  $('#palette').addEventListener('click',e=>{const b=e.target.closest('button');if(b){current=Number(b.dataset.index);renderQuestion();}});
  $('#prevButton').addEventListener('click',()=>{if(current>0){current--;renderQuestion();}});
  $('#nextButton').addEventListener('click',()=>{if(current<questions.length-1){current++;renderQuestion();}});
  document.addEventListener('visibilitychange',()=>{if(active&&!submitted&&document.hidden){focusCount++;$('#focusCount').textContent=focusCount;signal('page_hidden','Student page became hidden');}});
  document.addEventListener('fullscreenchange',()=>{if(active&&!submitted&&!document.fullscreenElement){fullscreenExits++;signal('fullscreen_exit','Student exited fullscreen mode');}});
  document.addEventListener('selectstart',e=>{if(active&&!submitted&&e.target.closest('#testPanel'))e.preventDefault();});
  document.addEventListener('copy',e=>{if(active&&!submitted)e.preventDefault();});
  document.addEventListener('cut',e=>{if(active&&!submitted)e.preventDefault();});
  document.addEventListener('dragstart',e=>{if(active&&!submitted&&e.target.closest('#testPanel'))e.preventDefault();});
  document.addEventListener('contextmenu',e=>{if(active&&!submitted)e.preventDefault();});
  $('#submitButton').addEventListener('click',()=>{
    const missing=answers.map((x,i)=>x===null?i+1:null).filter(Boolean);
    if(missing.length){$('#testError').textContent=`Answer all questions before submitting. Unanswered: ${missing.join(', ')}.`;$('#testError').hidden=false;return;}
    if(!confirm('Submit your final answers? You cannot change them after submission.')) return;
    finishTest();
  });
  function finishTest(){
    submitted=true;active=false;document.body.classList.remove('test-active');clearInterval(heartbeatTimer);
    if(document.fullscreenElement&&document.exitFullscreen) document.exitFullscreen().catch(()=>{});
    const selected=students.find(x=>x[0]===studentSelect.value);
    const score=answers.filter((a,i)=>a===questions[i].answer).length;
    const elapsed=Math.max(1,Math.round((Date.now()-startedAt)/60000));
    const durationSeconds=Math.max(1,Math.round((Date.now()-startedAt)/1000));
    if(/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(logEndpoint)){
      const body=new URLSearchParams({action:'quizResult',sessionId,registrationNumber:selected[0],studentName:selected[1],score:String(score),total:String(questions.length),durationSeconds:String(durationSeconds),pageHidden:String(focusCount),fullscreenExits:String(fullscreenExits),clientTimestamp:new Date().toISOString()});
      fetch(logEndpoint,{method:'POST',mode:'no-cors',body,keepalive:true}).catch(()=>{});
    }
    $('#testPanel').hidden=true;$('#resultPanel').hidden=false;
    $('#resultName').textContent=selected[1];
    $('#resultMeta').textContent=`${selected[0]} · Completed in ${elapsed} minute${elapsed===1?'':'s'}`;
    $('#scoreValue').textContent=score;$('#percentValue').textContent=`${Math.round(score/questions.length*100)}%`;$('#correctValue').textContent=score;$('#incorrectValue').textContent=questions.length-score;$('#focusResult').textContent=focusCount;
    $('#answerReview').innerHTML=questions.map((item,i)=>{
      const ok=answers[i]===item.answer;
      return `<details class="review-item ${ok?'correct':'incorrect'}"><summary>Q${i+1}. ${ok?'Correct':'Incorrect'} · ${item.text}</summary><div class="review-body"><p><strong>Your answer:</strong> ${item.options[answers[i]]}</p><p><strong>Correct answer:</strong> ${item.options[item.answer]}</p><p class="explanation"><strong>Why:</strong> ${item.why}</p></div></details>`;
    }).join('');
    $('#resultPanel').focus();window.scrollTo({top:0,behavior:'smooth'});
    localStorage.setItem('me25c08LastQuiz',JSON.stringify({roll:selected[0],name:selected[1],score,total:questions.length,focusCount,completedAt:new Date().toISOString()}));
  }
  $('#printButton').addEventListener('click',()=>window.print());
  $('#restartButton').addEventListener('click',()=>location.reload());
})();
