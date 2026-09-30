(function(){
  "use strict";
  const config=window.SITE_CONFIG||{};
  const auth=window.CourseAuth;
  const TOKEN_KEY="ME25C08_STUDENT_TOKEN";
  const criteria=[
    ["Definition of application and service conditions",10],
    ["Identification of material requirements",15],
    ["Candidate comparison and selection method",20],
    ["Technical accuracy",15],
    ["Verification and quality of sources",15],
    ["Critical use of AI and reflection",10],
    ["Report clarity and organization",5]
  ];

  document.getElementById("courseCode").textContent=config.courseCode||"ME25C08";
  document.getElementById("institutionName").textContent=config.institutionName||"Department of Mechanical Engineering";

  const loginView=document.getElementById("loginView");
  const loadingView=document.getElementById("loadingView");
  const dashboardView=document.getElementById("dashboardView");
  const loginError=document.getElementById("loginError");
  let token=sessionStorage.getItem(TOKEN_KEY)||"";

  function showError(el,message){el.textContent=message;el.hidden=false;}
  function clearError(el){el.hidden=true;el.textContent="";}
  function setView(name){
    loginView.hidden=name!=="login";
    loadingView.hidden=name!=="loading";
    dashboardView.hidden=name!=="dashboard";
    document.getElementById("logoutTop").hidden=name!=="dashboard";
  }

  async function loadDashboard(){
    if(!token){setView("login");return;}
    setView("loading");
    try{
      const response=await auth.request("studentDashboard",{token:token});
      renderDashboard(response.dashboard);
      setView("dashboard");
    }catch(error){
      sessionStorage.removeItem(TOKEN_KEY);token="";
      setView("login");showError(loginError,error.message);
    }
  }

  document.getElementById("loginForm").addEventListener("submit",async function(event){
    event.preventDefault();clearError(loginError);
    if(!this.checkValidity()){showError(loginError,"Enter your registration number and PIN.");return;}
    const button=document.getElementById("loginButton");button.disabled=true;
    try{
      const response=await auth.request("studentLogin",{
        registrationNumber:document.getElementById("registrationNumber").value.trim(),
        pin:document.getElementById("pin").value
      });
      token=response.token;sessionStorage.setItem(TOKEN_KEY,token);
      document.getElementById("pin").value="";
      await loadDashboard();
    }catch(error){showError(loginError,error.message);}
    finally{button.disabled=false;}
  });

  function renderDashboard(d){
    const p=d.profile||{};
    document.getElementById("studentGreeting").textContent="Welcome, "+(p.name||"Student");
    document.getElementById("studentMeta").textContent=(p.registrationNumber||"")+" · ME25C08";
    document.getElementById("profileName").textContent=p.name||"—";
    document.getElementById("profileReg").textContent=p.registrationNumber||"—";
    document.getElementById("profileApplication").textContent=p.application||"No application is currently assigned.";
    document.getElementById("profileTeam").textContent=p.teamNumber?"Team "+p.teamNumber:"Not assigned";
    document.getElementById("profileTeamNote").textContent=p.teamNumber?"Your presentation status is shown below.":"Faculty can publish team allocation later.";

    document.getElementById("pinChangeNotice").hidden=!p.mustChangePin;
    document.getElementById("pinChangePanel").hidden=!p.mustChangePin;

    const m=d.materials||{};
    if(m.submitted){
      setPill("materialsPill","good",m.status||"Submitted");
      document.getElementById("materialsDetail").textContent="Latest submission: "+formatDate(m.submittedAt)+(m.count>1?" · "+m.count+" submissions recorded":"");
    }else{
      setPill("materialsPill","pending","No submission recorded");
      document.getElementById("materialsDetail").textContent="No submission is currently linked to this registration number.";
    }

    const q=d.quiz||{};
    if(q.submitted){
      setPill("quizPill","good","Submitted");
      document.getElementById("quizTitle").textContent=(q.score||0)+" / "+(q.total||0)+" · "+(q.percentage||0)+"%";
      document.getElementById("quizDetail").textContent="Latest formal MCQ submission: "+formatDate(q.submittedAt);
    }else{
      setPill("quizPill","pending","No result recorded");
      document.getElementById("quizTitle").textContent="MCQ Assessment";
      document.getElementById("quizDetail").textContent="No submitted formal MCQ result is currently linked to this registration number.";
    }

    const pr=d.presentation||{};
    if(!pr.assigned){
      setPill("presentationPill","pending","Team allocation pending");
      document.getElementById("presentationDetail").textContent="Your team status will appear after team allocation is entered by the faculty.";
    }else if(pr.submitted){
      setPill("presentationPill","good",pr.status||"Submitted");
      document.getElementById("presentationTitle").textContent="Team "+pr.teamNumber+" · "+(pr.topic||"Presentation");
      document.getElementById("presentationDetail").textContent="Latest submission: "+formatDate(pr.submittedAt);
    }else{
      setPill("presentationPill","neutral","Team "+pr.teamNumber);
      document.getElementById("presentationTitle").textContent="Team "+pr.teamNumber+" · submission pending";
      document.getElementById("presentationDetail").textContent="No presentation file has been recorded for your team yet.";
    }

    const ev=d.evaluation||{};
    const panel=document.getElementById("evaluationPanel");
    if(ev.available&&ev.published){
      setPill("evaluationPill","good","Published");
      document.getElementById("evaluationDetail").textContent="Your private written-submission feedback is available below.";
      panel.hidden=false;
      renderEvaluation(ev);
    }else if(ev.available){
      setPill("evaluationPill","pending","Not published");
      document.getElementById("evaluationDetail").textContent="An evaluation record exists but is not currently published to your dashboard.";
      panel.hidden=true;
    }else{
      setPill("evaluationPill","pending","No evaluation yet");
      document.getElementById("evaluationDetail").textContent="No secure evaluation is currently linked to this registration number.";
      panel.hidden=true;
    }
  }

  function renderEvaluation(ev){
    document.getElementById("evaluationApplication").textContent=ev.application||"Materials Selection";
    document.getElementById("evaluationTotal").textContent=(ev.writtenTotal||0)+" / 90";
    document.getElementById("evaluationGood").textContent=ev.good||"—";
    document.getElementById("evaluationImprove").textContent=ev.improve||"—";
    const scores=Array.isArray(ev.scores)?ev.scores:[];
    const body=document.getElementById("rubricBody");body.innerHTML="";
    criteria.forEach(function(c,i){
      const tr=document.createElement("tr");
      tr.innerHTML="<td>"+escapeHtml(c[0])+"</td><td><strong>"+Number(scores[i]||0)+"</strong></td><td>"+c[1]+"</td>";
      body.appendChild(tr);
    });
  }

  document.getElementById("pinChangeForm").addEventListener("submit",async function(event){
    event.preventDefault();
    const error=document.getElementById("pinError");clearError(error);
    const first=document.getElementById("newPin").value;
    const second=document.getElementById("confirmPin").value;
    if(first!==second){showError(error,"The two PIN entries do not match.");return;}
    if(first.length<6||/\s/.test(first)){showError(error,"Use 6–32 characters with no spaces.");return;}
    try{
      await auth.request("changeStudentPin",{token:token,newPin:first});
      this.reset();
      document.getElementById("pinChangeNotice").hidden=true;
      document.getElementById("pinChangePanel").hidden=true;
      await loadDashboard();
    }catch(e){showError(error,e.message);}
  });

  async function logout(){
    if(token){try{await auth.request("logoutSession",{token:token},15000);}catch(_){}}
    sessionStorage.removeItem(TOKEN_KEY);token="";setView("login");
  }
  document.getElementById("logoutButton").addEventListener("click",logout);
  document.getElementById("logoutTop").addEventListener("click",logout);
  document.getElementById("refreshDashboard").addEventListener("click",loadDashboard);

  function setPill(id,type,text){const el=document.getElementById(id);el.className="status-pill "+type;el.textContent=text;}
  function formatDate(value){if(!value)return "—";const d=new Date(value);return isNaN(d.getTime())?String(value):d.toLocaleString();}
  function escapeHtml(value){return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch];});}

  if(!auth||!auth.ready){showError(loginError,"The authentication service is not connected to the deployed Apps Script.");}
  loadDashboard();
})();