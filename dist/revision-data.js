window.REVISION_DATA = {
  units: {
    I: {
      title: "Constitution of Alloys and Phase Diagrams",
      co: "CO1",
      material: "unit-i.html",
      topics: [
        "Constitution and classification of engineering alloys",
        "Substitutional and interstitial solid solutions",
        "Binary phase diagrams: basic terms and interpretation",
        "Isomorphous phase diagram and lever rule",
        "Eutectic and eutectoid reactions",
        "Peritectic and peritectoid reactions",
        "Iron–iron carbide equilibrium diagram",
        "Classification of steels",
        "Classification of cast irons"
      ]
    },
    II: {
      title: "Heat Treatment",
      co: "CO2",
      material: "unit-ii.html",
      topics: [
        "Heat treatment: definition, objectives and process variables",
        "Full annealing and stress-relief annealing",
        "Recrystallisation and spheroidising annealing",
        "Normalising, hardening and tempering of steel",
        "Isothermal transformation (TTT) diagrams",
        "Continuous cooling transformation (CCT) diagrams",
        "Austempering and martempering",
        "Hardenability and Jominy end-quench test",
        "Case and surface hardening; thermo-mechanical treatment and sintering"
      ]
    },
    III: {
      title: "Ferrous and Non-Ferrous Metals",
      co: "CO3",
      material: "unit-iii.html",
      topics: [
        "Effect of alloying elements on steels: Mn, Si, Cr and Mo",
        "Effect of alloying elements on steels: Ni, V, Ti and W",
        "Stainless steels and tool steels",
        "HSLA and maraging steels",
        "Alloy cast irons",
        "Copper and its alloys: brass, bronze and cupronickel",
        "Aluminium alloys and Al–Cu precipitation strengthening",
        "Titanium alloys, magnesium alloys and nickel-based superalloys",
        "Shape-memory alloys and overview of materials standards"
      ]
    },
    IV: {
      title: "Non-Metallic Materials",
      co: "CO4",
      material: "unit-iv.html",
      topics: [
        "Polymers: classification, structure and engineering significance",
        "Properties and applications of PE, PP, PS and PVC",
        "Properties and applications of PMMA, PET, PC, PA and ABS",
        "High-performance polymers: PAI, PPO, PPS, PEEK and PTFE",
        "Thermoset polymers: urea-formaldehyde and phenol-formaldehyde",
        "Engineering ceramics: Al2O3, SiC and Si3N4",
        "PSZ, SIALON and intermetallic materials",
        "Composites: matrix and reinforcement materials",
        "Applications of composites and nanocomposites"
      ]
    },
    V: {
      title: "Mechanical Properties and Deformation Mechanisms",
      co: "CO5",
      material: "",
      topics: [
        "Mechanisms of plastic deformation: slip",
        "Twinning and comparison with slip",
        "Types of fracture: ductile, brittle and fatigue fracture",
        "Fracture mechanics and Griffith theory",
        "Testing under tensile, compression and shear loads",
        "Hardness tests: Brinell, Vickers and Rockwell",
        "Micro-hardness and nano-hardness tests",
        "Impact tests: Izod and Charpy",
        "Fatigue and creep failure mechanisms"
      ]
    }
  },

  assessments: {
    AT1: {
      title: "Assessment Test 1",
      units: ["I", "II"],
      note: "Revise Units I and II. The academic calendar places AT1 after completion of Unit II."
    },
    AT2: {
      title: "Assessment Test 2",
      units: ["III", "IV"],
      note: "Revise Units III and IV. The uploaded Question Bank / AT2 Q&A resource currently supports these units."
    },
    AT3: {
      title: "Assessment Test 3",
      units: ["V"],
      note: "Revise Unit V. The handout schedules AT3 after Unit V; the Unit V student-notes PDF is not yet available in the repository."
    },
    MODEL: {
      title: "Model Examination",
      units: ["I", "II", "III", "IV", "V"],
      note: "Use all five units for cumulative revision. Unit V preparation is currently handout-based until its student material is uploaded."
    }
  },

  questions: [
    {id:"I01",unit:"I",q:"In a substitutional solid solution, the solute atoms primarily:",options:["occupy normal lattice sites by replacing solvent atoms","occupy only grain boundaries","form pores within the lattice","remain completely outside the crystal"],answer:0,explanation:"A substitutional solid solution forms when solute atoms replace solvent atoms on regular lattice sites."},
    {id:"I02",unit:"I",q:"An interstitial solid solution is formed when solute atoms:",options:["replace every solvent atom","occupy spaces between the solvent atoms","form only a second liquid phase","remain at the specimen surface"],answer:1,explanation:"Small solute atoms can occupy interstitial spaces between the atoms of the host lattice."},
    {id:"I03",unit:"I",q:"The lever rule in a two-phase region of a binary phase diagram is used to estimate:",options:["grain size","phase fractions","elastic modulus","cooling rate"],answer:1,explanation:"The lever rule uses the tie-line segment lengths to determine the relative amounts of phases present."},
    {id:"I04",unit:"I",q:"A eutectic reaction is best represented as:",options:["one solid → two solids","liquid → two solid phases","liquid + solid → new solid","two solids → liquid"],answer:1,explanation:"At the eutectic temperature and composition, one liquid transforms into two solid phases."},
    {id:"I05",unit:"I",q:"A eutectoid reaction differs from a eutectic reaction because the parent phase is:",options:["a gas","a liquid","a solid","always cementite"],answer:2,explanation:"A eutectoid reaction is a solid-state reaction in which one solid phase transforms into two different solid phases."},
    {id:"I06",unit:"I",q:"A peritectic reaction involves:",options:["liquid + solid → a new solid phase","solid → liquid + gas","two solids → two liquids","only a change in grain size"],answer:0,explanation:"The characteristic peritectic reaction is liquid plus an existing solid transforming into a different solid phase."},
    {id:"I07",unit:"I",q:"The chemical formula of cementite in the iron–iron carbide system is:",options:["Fe2C","Fe3C","FeC3","Fe4C"],answer:1,explanation:"Cementite is iron carbide with the composition Fe3C."},
    {id:"I08",unit:"I",q:"Which cast iron is characterised by graphite in approximately spheroidal or nodular form?",options:["White cast iron","Grey cast iron","Spheroidal graphite cast iron","Malleable cast iron before heat treatment"],answer:2,explanation:"Spheroidal graphite (ductile) cast iron contains graphite as nodules rather than flakes."},

    {id:"II01",unit:"II",q:"Full annealing of steel normally uses slow cooling mainly to:",options:["retain maximum quench stresses","promote a softer equilibrium-type microstructure","form only martensite","increase residual stress"],answer:1,explanation:"Full annealing uses slow cooling to obtain a softer, more equilibrium-like microstructure and improve machinability/ductility."},
    {id:"II02",unit:"II",q:"The main purpose of stress-relief annealing is to:",options:["introduce residual stresses","reduce residual stresses with limited microstructural change","produce martensite","add carbon to the surface"],answer:1,explanation:"Stress-relief annealing is intended to lower residual stresses without the major phase changes associated with full heat treatment."},
    {id:"II03",unit:"II",q:"Normalising differs from full annealing mainly because normalising typically uses:",options:["air cooling after heating","furnace cooling only","water quenching from room temperature","no heating stage"],answer:0,explanation:"Normalising generally cools the austenitised steel in air, faster than furnace cooling used in full annealing."},
    {id:"II04",unit:"II",q:"Hardening of steel commonly aims to form:",options:["graphite flakes","martensite","only ferrite","only pearlite by very slow cooling"],answer:1,explanation:"Rapid quenching from the austenitic condition is used to form hard martensite."},
    {id:"II05",unit:"II",q:"Tempering is normally performed after hardening mainly to:",options:["increase brittleness","reduce brittleness and adjust strength/toughness","remove all carbon","convert steel to cast iron"],answer:1,explanation:"Tempering reduces the excessive brittleness and residual stresses of as-quenched martensitic steel while tuning its properties."},
    {id:"II06",unit:"II",q:"A TTT diagram describes transformation behaviour under:",options:["continuous loading","isothermal holding conditions","only room-temperature deformation","constant chemical composition without time"],answer:1,explanation:"TTT means Time–Temperature–Transformation and describes transformations during isothermal holding."},
    {id:"II07",unit:"II",q:"A CCT diagram is particularly useful because it represents transformations during:",options:["continuous cooling","constant-temperature holding only","electroplating","tensile testing"],answer:0,explanation:"CCT means Continuous Cooling Transformation and is useful for practical cooling paths."},
    {id:"II08",unit:"II",q:"The Jominy end-quench test is primarily used to evaluate:",options:["hardenability","impact toughness","creep life","electrical conductivity"],answer:0,explanation:"The Jominy test evaluates hardenability—the ability of steel to harden to a certain depth under specified cooling conditions."},

    {id:"III01",unit:"III",q:"Which alloying element is central to the corrosion resistance of stainless steels?",options:["Chromium","Lead","Sulfur","Carbon only"],answer:0,explanation:"Chromium promotes formation of a protective passive oxide film and is the key alloying element in stainless steels."},
    {id:"III02",unit:"III",q:"Tool steels are selected for cutting and forming tools mainly because they can provide:",options:["high hardness and wear resistance","very low strength","extremely low melting point","high electrical insulation"],answer:0,explanation:"Tool steels are designed for high hardness, wear resistance and, in many grades, retention of hardness at elevated temperature."},
    {id:"III03",unit:"III",q:"HSLA stands for:",options:["High Strength Low Alloy","Heat Stabilised Light Aluminium","High Silicon Low Austenite","Hard Surface Layer Alloy"],answer:0,explanation:"HSLA means High Strength Low Alloy steel."},
    {id:"III04",unit:"III",q:"Maraging steels obtain much of their high strength through:",options:["precipitation during ageing","high carbon pearlite only","graphite formation","polymer crosslinking"],answer:0,explanation:"Maraging steels are low-carbon steels strengthened by precipitation of intermetallic compounds during ageing."},
    {id:"III05",unit:"III",q:"Brass is principally an alloy of:",options:["Copper and zinc","Copper and tin","Copper and nickel","Aluminium and copper"],answer:0,explanation:"Brass is the common name for Cu–Zn alloys."},
    {id:"III06",unit:"III",q:"Cupronickel is principally based on:",options:["Copper and nickel","Copper and zinc","Copper and tin","Nickel and chromium only"],answer:0,explanation:"Cupronickel alloys contain copper and nickel as the principal constituents."},
    {id:"III07",unit:"III",q:"Precipitation strengthening of Al–Cu alloys depends on:",options:["controlled formation of fine precipitates during ageing","complete removal of copper","graphite nodule formation","surface carburising"],answer:0,explanation:"Solution treatment, quenching and ageing produce fine precipitates that obstruct dislocation motion and strengthen Al–Cu alloys."},
    {id:"III08",unit:"III",q:"Shape-memory alloys recover a previously defined shape because of a reversible:",options:["martensitic phase transformation","melting process","corrosion reaction","creep rupture process"],answer:0,explanation:"The shape-memory effect is associated with a reversible martensitic transformation between low- and high-temperature phases."},

    {id:"IV01",unit:"IV",q:"A thermoplastic differs from a thermoset because a thermoplastic can generally:",options:["be softened and reshaped repeatedly by heating","never soften on heating","only be used as a ceramic","form an irreversible crosslinked network during the first cure"],answer:0,explanation:"Thermoplastics can usually soften on heating and harden on cooling repeatedly, unlike permanently crosslinked thermosets."},
    {id:"IV02",unit:"IV",q:"Which polymer is widely recognised for a low coefficient of friction and strong chemical resistance?",options:["PTFE","PMMA","PS","Urea-formaldehyde"],answer:0,explanation:"PTFE is noted for very low friction and excellent chemical resistance."},
    {id:"IV03",unit:"IV",q:"Which engineering polymer is well known for high impact resistance and is used where transparent toughness is required?",options:["Polycarbonate (PC)","Phenol-formaldehyde","PTFE only","Polystyrene foam"],answer:0,explanation:"Polycarbonate combines transparency with high impact resistance."},
    {id:"IV04",unit:"IV",q:"PEEK is classified as a:",options:["high-performance engineering polymer","commodity metal","cast iron","thermosetting ceramic"],answer:0,explanation:"PEEK is a high-performance thermoplastic used where strength, temperature capability and chemical resistance are important."},
    {id:"IV05",unit:"IV",q:"Which ceramic is widely associated with transformation toughening?",options:["Partially stabilised zirconia (PSZ)","Aluminium metal","Polyethylene","Grey cast iron"],answer:0,explanation:"PSZ can gain toughness from stress-induced transformation of zirconia phases near a crack tip."},
    {id:"IV06",unit:"IV",q:"In a fibre-reinforced composite, the matrix primarily:",options:["binds/protects the reinforcement and transfers load to it","acts only as an air gap","eliminates all reinforcement loading","must always be metallic"],answer:0,explanation:"The matrix holds the reinforcement, protects it and transfers stresses between the applied load and reinforcement."},
    {id:"IV07",unit:"IV",q:"The principal role of a strong reinforcement in a structural composite is to:",options:["carry a significant share of the applied load","increase porosity deliberately","prevent any bonding with the matrix","act only as a pigment"],answer:0,explanation:"Reinforcement provides much of the strength/stiffness and carries a major share of load when bonded effectively to the matrix."},
    {id:"IV08",unit:"IV",q:"A nanocomposite is distinguished by the use of reinforcement or structure with dimensions typically in the:",options:["nanometre scale","metre scale only","kilometre scale","centimetre scale only"],answer:0,explanation:"Nanocomposites contain at least one phase or reinforcing feature with nanoscale dimensions."},

    {id:"V01",unit:"V",q:"Plastic deformation by slip occurs mainly through:",options:["dislocation motion on crystallographic slip systems","melting of the entire specimen","diffusion of all atoms out of the material","formation of a liquid film"],answer:0,explanation:"Slip is the principal plastic-deformation mechanism in many crystalline metals and proceeds by dislocation motion."},
    {id:"V02",unit:"V",q:"Twinning involves:",options:["coordinated lattice reorientation in a region of the crystal","complete melting","only crack growth","surface oxidation"],answer:0,explanation:"Twinning produces a mirror-like reorientation of part of the crystal lattice through coordinated atomic movement."},
    {id:"V03",unit:"V",q:"Compared with ductile fracture, brittle fracture generally shows:",options:["little plastic deformation before fracture","very large necking in every case","only time-dependent strain","no crack propagation"],answer:0,explanation:"Brittle fracture is characterised by limited plastic deformation and can propagate rapidly once a critical crack condition is reached."},
    {id:"V04",unit:"V",q:"Griffith's theory explains brittle fracture using a balance between:",options:["elastic strain energy release and surface-energy requirement","electrical and magnetic energy only","density and colour","hardness and conductivity"],answer:0,explanation:"Griffith's energy criterion compares the elastic strain energy released as a crack grows with the energy needed to create new crack surfaces."},
    {id:"V05",unit:"V",q:"The Vickers hardness test uses an indenter that is a:",options:["diamond pyramid","steel wire","flat polymer disc","graphite sphere"],answer:0,explanation:"The Vickers test uses a diamond pyramidal indenter and determines hardness from the indentation dimensions."},
    {id:"V06",unit:"V",q:"Rockwell hardness is determined primarily from:",options:["indentation depth under specified loading","specimen colour","mass loss after corrosion","crack length under fatigue"],answer:0,explanation:"Rockwell hardness is based on the depth of penetration produced by a specified minor/major load sequence."},
    {id:"V07",unit:"V",q:"Fatigue failure is associated most directly with:",options:["repeated or cyclic loading","a single heat-treatment soak only","steady-state electrical current only","chemical composition with no loading"],answer:0,explanation:"Fatigue damage develops under repeated/cyclic stresses and may cause failure at stresses below the static strength."},
    {id:"V08",unit:"V",q:"Creep is best described as:",options:["time-dependent deformation under sustained stress, especially important at elevated temperature","instantaneous elastic recovery only","hardness increase caused by polishing","a form of impact testing"],answer:0,explanation:"Creep is progressive, time-dependent deformation under sustained load and becomes particularly important at elevated homologous temperatures."}
  ]
};