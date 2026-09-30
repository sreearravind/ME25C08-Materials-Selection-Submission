(function(){
  "use strict";
  const data=window.REVISION_DATA||{units:{},assessments:{}};
  const config=window.SITE_CONFIG||{};
  document.getElementById("courseCode").textContent=config.courseCode||"ME25C08";
  document.getElementById("institutionName").textContent=config.institutionName||"Department of Mechanical Engineering";

  const assessmentSelect=document.getElementById("assessmentSelect");
  const timeSelect=document.getElementById("timeSelect");
  const checklist=document.getElementById("topicChecklist");
  const progressLabel=document.getElementById("progressLabel");
  const progressMeta=document.getElementById("progressMeta");
  const progressBar=document.getElementById("progressBar");
  const checklistTitle=document.getElementById("checklistTitle");
  const planOutput=document.getElementById("planOutput");

  function storageKey(code){return "ME25C08_revision_"+code;}
  function readProgress(code){
    try{return JSON.parse(localStorage.getItem(storageKey(code))||"{}");}
    catch(_){return {};}
  }
  function saveProgress(code,state){
    try{localStorage.setItem(storageKey(code),JSON.stringify(state));}catch(_){}
  }

  function renderAssessmentCards(){
    const target=document.getElementById("assessmentCards");
    Object.keys(data.assessments).forEach(function(code){
      const a=data.assessments[code];
      const article=document.createElement("article");
      article.className="assessment-card";
      const chips=a.units.map(function(u){return '<span class="chip">Unit '+u+'</span>';}).join("");
      article.innerHTML='<p class="mini">'+code+'</p><h3>'+escapeHtml(a.title)+'</h3><div class="unit-chips">'+chips+'</div><p>'+escapeHtml(a.note)+'</p><button type="button" data-code="'+code+'">Revise this assessment</button>';
      article.querySelector("button").addEventListener("click",function(){
        assessmentSelect.value=code;
        renderChecklist();
        buildPlan();
        document.getElementById("checklistTitle").scrollIntoView({behavior:"smooth",block:"start"});
      });
      target.appendChild(article);
    });
  }

  function renderChecklist(){
    const code=assessmentSelect.value;
    const assessment=data.assessments[code];
    const saved=readProgress(code);
    checklist.innerHTML="";
    checklistTitle.textContent=assessment.title+" revision checklist";

    assessment.units.forEach(function(unitCode){
      const unit=data.units[unitCode];
      const details=document.createElement("details");
      details.className="unit-check";
      details.open=true;
      const body=document.createElement("div");
      body.className="unit-check-body";

      unit.topics.forEach(function(topic,index){
        const id=unitCode+"-"+index;
        const row=document.createElement("label");
        row.className="topic-check";
        const box=document.createElement("input");
        box.type="checkbox";
        box.checked=Boolean(saved[id]);
        box.addEventListener("change",function(){
          const state=readProgress(code);
          if(box.checked) state[id]=true; else delete state[id];
          saveProgress(code,state);
          updateProgress();
        });
        const span=document.createElement("span");
        span.textContent=topic;
        row.appendChild(box);row.appendChild(span);
        body.appendChild(row);
      });

      const links=document.createElement("div");
      links.className="resource-links";
      if(unit.material){
        links.innerHTML='<a href="'+unit.material+'">Open Unit '+unitCode+' materials</a>';
      }else{
        links.innerHTML='<span class="status pending">Unit V student PDF pending</span><a href="course-info.html#syllabus">View handout syllabus</a>';
      }
      if(unitCode==="III"||unitCode==="IV"){
        links.innerHTML+='<a href="question-bank.html">Units III–IV Question Bank</a>';
      }
      body.appendChild(links);
      details.innerHTML='<summary>Unit '+unitCode+' · '+escapeHtml(unit.title)+' · '+unit.co+'</summary>';
      details.appendChild(body);
      checklist.appendChild(details);
    });
    updateProgress();
  }

  function updateProgress(){
    const code=assessmentSelect.value;
    const assessment=data.assessments[code];
    const saved=readProgress(code);
    let total=0,done=0;
    assessment.units.forEach(function(u){
      data.units[u].topics.forEach(function(_,i){
        total++;
        if(saved[u+"-"+i]) done++;
      });
    });
    const pct=total?Math.round(done/total*100):0;
    progressLabel.textContent=pct+"% completed";
    progressMeta.textContent=done+" / "+total+" topics";
    progressBar.style.width=pct+"%";
  }

  function buildPlan(){
    const code=assessmentSelect.value;
    const minutes=Number(timeSelect.value)||60;
    const assessment=data.assessments[code];
    const perUnit=Math.floor(minutes/assessment.units.length);
    const remainder=minutes-(perUnit*assessment.units.length);
    const blocks=assessment.units.map(function(u,index){
      const allocated=perUnit+(index<remainder?1:0);
      const learn=Math.max(1,Math.round(allocated*0.55));
      const recall=Math.max(1,Math.round(allocated*0.20));
      const practice=Math.max(1,allocated-learn-recall);
      return '<div class="plan-block"><h4>Unit '+u+' · '+escapeHtml(data.units[u].title)+'</h4><p>'+allocated+' minutes total</p><div class="plan-split"><span class="time-chip">'+learn+' min · notes/concepts</span><span class="time-chip">'+recall+' min · closed-book recall</span><span class="time-chip">'+practice+' min · questions</span></div></div>';
    }).join("");
    planOutput.innerHTML='<div class="plan-block"><h4>'+escapeHtml(assessment.title)+'</h4><p>'+escapeHtml(assessment.note)+'</p></div>'+blocks+'<div class="plan-block"><h4>Finish with retrieval</h4><p>Use the Practice MCQ page after the session. Treat incorrect answers as a signal to return to the related unit checklist, not simply as a score.</p></div>';
  }

  document.getElementById("buildPlan").addEventListener("click",buildPlan);
  document.getElementById("resetProgress").addEventListener("click",function(){
    const code=assessmentSelect.value;
    if(window.confirm("Reset the saved checklist for "+data.assessments[code].title+" on this browser?")){
      try{localStorage.removeItem(storageKey(code));}catch(_){}
      renderChecklist();
    }
  });
  assessmentSelect.addEventListener("change",function(){renderChecklist();buildPlan();});
  timeSelect.addEventListener("change",buildPlan);

  function escapeHtml(value){
    return String(value==null?"":value).replace(/[&<>"']/g,function(ch){
      return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch];
    });
  }

  renderAssessmentCards();
  renderChecklist();
  buildPlan();
})();