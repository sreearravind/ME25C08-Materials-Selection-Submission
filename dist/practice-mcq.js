(function(){
  "use strict";
  const data=window.REVISION_DATA||{units:{},assessments:{},questions:[]};
  const config=window.SITE_CONFIG||{};
  document.getElementById("courseCode").textContent=config.courseCode||"ME25C08";
  document.getElementById("institutionName").textContent=config.institutionName||"Department of Mechanical Engineering";

  const scopeSelect=document.getElementById("scopeSelect");
  const countSelect=document.getElementById("countSelect");
  const setupSection=document.getElementById("setupSection");
  const quizSection=document.getElementById("quizSection");
  const resultSection=document.getElementById("resultSection");
  const questionCounter=document.getElementById("questionCounter");
  const runningScore=document.getElementById("runningScore");
  const questionUnit=document.getElementById("questionUnit");
  const questionText=document.getElementById("questionText");
  const optionList=document.getElementById("optionList");
  const feedback=document.getElementById("feedback");
  const nextButton=document.getElementById("nextQuestion");

  let questions=[],index=0,score=0,answered=false,records=[];

  function unitsForScope(scope){
    if(scope.indexOf("UNIT:")===0) return [scope.split(":")[1]];
    return (data.assessments[scope]||{units:[]}).units.slice();
  }

  function shuffled(array){
    const a=array.slice();
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      const temp=a[i];a[i]=a[j];a[j]=temp;
    }
    return a;
  }

  function buildSet(){
    const scope=scopeSelect.value;
    const units=unitsForScope(scope);
    let pool=data.questions.filter(function(q){return units.indexOf(q.unit)>=0;});
    pool=shuffled(pool);
    const requested=countSelect.value==="ALL"?pool.length:Number(countSelect.value);
    return pool.slice(0,Math.min(requested,pool.length));
  }

  function start(){
    questions=buildSet();
    index=0;score=0;answered=false;records=[];
    setupSection.hidden=true;resultSection.hidden=true;quizSection.hidden=false;
    renderQuestion();
    quizSection.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function renderQuestion(){
    const q=questions[index];
    answered=false;
    feedback.hidden=true;feedback.className="feedback";feedback.innerHTML="";
    nextButton.hidden=true;
    questionCounter.textContent="Question "+(index+1)+" of "+questions.length;
    runningScore.textContent="Score "+score;
    questionUnit.textContent="UNIT "+q.unit+" · "+(data.units[q.unit]?data.units[q.unit].co:"");
    questionText.textContent=q.q;
    optionList.innerHTML="";
    const displayOptions=shuffled(q.options.map(function(text,originalIndex){
      return {text:text,originalIndex:originalIndex};
    }));
    displayOptions.forEach(function(item){
      const label=document.createElement("label");
      label.className="option";
      label.dataset.originalIndex=String(item.originalIndex);
      const radio=document.createElement("input");
      radio.type="radio";radio.name="practiceAnswer";radio.value=String(item.originalIndex);
      const span=document.createElement("span");span.textContent=item.text;
      label.appendChild(radio);label.appendChild(span);
      label.addEventListener("click",function(){
        if(!answered) chooseAnswer(item.originalIndex);
      });
      optionList.appendChild(label);
    });
  }

  function chooseAnswer(selected){
    if(answered)return;
    answered=true;
    const q=questions[index];
    const correct=selected===q.answer;
    if(correct)score++;
    const options=Array.from(optionList.children);
    options.forEach(function(el){
      const originalIndex=Number(el.dataset.originalIndex);
      const radio=el.querySelector("input");
      radio.disabled=true;
      if(originalIndex===q.answer)el.classList.add("correct");
      if(originalIndex===selected&&originalIndex!==q.answer)el.classList.add("incorrect");
    });
    records.push({q:q,selected:selected,correct:correct});
    feedback.hidden=false;
    feedback.classList.add(correct?"good":"bad");
    feedback.innerHTML="<strong>"+(correct?"Correct.":"Not quite.")+"</strong><p>"+escapeHtml(q.explanation)+"</p>";
    runningScore.textContent="Score "+score;
    nextButton.textContent=index===questions.length-1?"View results":"Next question";
    nextButton.hidden=false;
  }

  function next(){
    if(!answered)return;
    if(index<questions.length-1){
      index++;renderQuestion();
    }else{
      showResults();
    }
  }

  function showResults(){
    quizSection.hidden=true;resultSection.hidden=false;
    document.getElementById("finalScore").textContent=score+" / "+questions.length;
    const pct=questions.length?Math.round(score/questions.length*100):0;
    let note="Use the missed questions to decide what to revise next.";
    if(pct>=80)note="Strong recall in this practice set. Review the missed items, then try another shuffled set.";
    else if(pct>=60)note="A useful first pass. Revisit the weaker units and retry after closed-book revision.";
    else note="Return to the unit materials and topic checklist before attempting another set.";
    document.getElementById("finalNote").textContent=pct+"% · "+note;

    const unitResults=document.getElementById("unitResults");
    unitResults.innerHTML="";
    const byUnit={};
    records.forEach(function(r){
      if(!byUnit[r.q.unit])byUnit[r.q.unit]={total:0,correct:0};
      byUnit[r.q.unit].total++;
      if(r.correct)byUnit[r.q.unit].correct++;
    });
    Object.keys(byUnit).sort().forEach(function(unit){
      const div=document.createElement("div");
      div.className="unit-result";
      div.innerHTML="<strong>Unit "+unit+"</strong><br>"+byUnit[unit].correct+" / "+byUnit[unit].total+" correct";
      unitResults.appendChild(div);
    });

    const missed=records.filter(function(r){return !r.correct;});
    const missedWrap=document.getElementById("missedWrap");
    const missedList=document.getElementById("missedList");
    missedList.innerHTML="";
    missedWrap.hidden=missed.length===0;
    missed.forEach(function(r){
      const item=document.createElement("div");
      item.className="missed-item";
      item.innerHTML="<strong>Unit "+r.q.unit+" · "+escapeHtml(r.q.q)+"</strong><span>"+escapeHtml(r.q.explanation)+"</span>";
      missedList.appendChild(item);
    });
    resultSection.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function reset(){
    resultSection.hidden=true;quizSection.hidden=true;setupSection.hidden=false;
    setupSection.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function escapeHtml(value){
    return String(value==null?"":value).replace(/[&<>"']/g,function(ch){
      return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch];
    });
  }

  document.getElementById("startQuiz").addEventListener("click",start);
  nextButton.addEventListener("click",next);
  document.getElementById("retryQuiz").addEventListener("click",reset);
})();