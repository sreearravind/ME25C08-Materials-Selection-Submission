(function(){
  "use strict";
  const config=window.SITE_CONFIG||{};
  const auth=window.CourseAuth;
  const TOKEN_KEY="ME25C08_FACULTY_TOKEN";
  let token=sessionStorage.getItem(TOKEN_KEY)||"";
  let students=[];
  let selectedReg="";

  document.getElementById("courseCode").textContent=config.courseCode||"ME25C08";
  document.getElementById("institutionName").textContent=config.institutionName||"Department of Mechanical Engineering";

  const loginView=document.getElementById("loginView");
  const loadingView=document.getElementById("loadingView");
  const dashboardView=document.getElementById("dashboardView");
  const loginError=document.getElementById("loginError");
  const editor=document.getElementById("studentEditor");
  const editorError=document.getElementById("editorError");

  function setView(name){
    loginView.hidden=name!=="login";loadingView.hidden=name!=="loading";dashboardView.hidden=name!=="dashboard";
    document.getElementById("logoutTop").hidden=name!=="dashboard";
  }
  function showError(el,msg){el.textContent=msg;el.hidden=false;}
  function clearError(el){el.hidden=true;el.textContent="";}
  function showMessage(msg){
    const el=document.getElementById("adminMessage");el.textContent=msg;el.hidden=false;
    window.setTimeout(function(){el.hidden=true;},6000);
  }

  document.getElementById("loginForm").addEventListener("submit",async function(event){
    event.preventDefault();clearError(loginError);
    const button=document.getElementById("loginButton");button.disabled=true;
    try{
      const response=await auth.request("facultyLogin",{password:document.getElementById("facultyPassword").value});
      token=response.token;sessionStorage.setItem(TOKEN_KEY,token);
      document.getElementById("facultyPassword").value="";
      await loadDashboard();
    }catch(error){showError(loginError,error.message);}
    finally{button.disabled=false;}
  });

  async function loadDashboard(){
    if(!token){setView("login");return;}
    setView("loading");
    try{
      const response=await auth.request("facultyDashboard",{token:token});
      renderDashboard(response.dashboard||{});
      setView("dashboard");
    }catch(error){
      sessionStorage.removeItem(TOKEN_KEY);token="";setView("login");showError(loginError,error.message);
    }
  }

  function renderDashboard(d){
    const s=d.summary||{};
    document.getElementById("sumStudents").textContent=s.students||0;
    document.getElementById("sumActive").textContent=s.activeStudents||0;
    document.getElementById("sumMaterials").textContent=s.materialsSubmitted||0;
    document.getElementById("sumQuiz").textContent=s.quizSubmitted||0;
    document.getElementById("sumResults").textContent=s.evaluationsPublished||0;
    students=Array.isArray(d.students)?d.students:[];
    renderTable();
    renderMarksTable();
    if(selectedReg){
      const current=students.find(function(x){return x.registrationNumber===selectedReg;});
      if(current) openEditor(current);
    }
  }

  function renderTable(){
    const body=document.getElementById("studentTableBody");body.innerHTML="";
    const q=document.getElementById("studentSearch").value.trim().toLowerCase();
    students.filter(function(s){
      return !q||((s.name+" "+s.registrationNumber).toLowerCase().includes(q));
    }).forEach(function(s){
      const tr=document.createElement("tr");
      const materials=s.materials&&s.materials.count>0?(s.materials.count+" submission"+(s.materials.count>1?"s":"")):"—";
      const quiz=s.quiz?(s.quiz.percentage+"%"):"—";
      const presentation=s.presentation?(s.presentation.status||"Recorded"):(s.teamNumber?"Pending":"—");
      const evaluation=s.evaluation?(s.evaluation.published?"Published":"Hidden"):"—";
      tr.innerHTML=
        '<td><span class="student-name">'+escapeHtml(s.name)+'</span><br><span class="muted">'+escapeHtml(s.registrationNumber)+'</span></td>'+
        '<td>'+(s.teamNumber?"Team "+escapeHtml(s.teamNumber):"—")+'</td>'+
        '<td><span class="status-pill '+(s.active?"good":"pending")+'">'+(s.active?"Active":"Inactive")+'</span>'+(s.mustChangePin?'<br><span class="muted">Temp PIN</span>':'')+'</td>'+
        '<td>'+escapeHtml(materials)+'</td><td>'+escapeHtml(quiz)+'</td><td>'+escapeHtml(presentation)+'</td><td>'+escapeHtml(evaluation)+'</td>'+
        '<td><button type="button" class="small-button edit-student" data-reg="'+escapeHtml(s.registrationNumber)+'">Edit</button></td>';
      body.appendChild(tr);
    });
  }

  document.getElementById("studentTableBody").addEventListener("click",function(event){
    const button=event.target.closest(".edit-student");if(!button)return;
    const student=students.find(function(s){return s.registrationNumber===button.dataset.reg;});
    if(student)openEditor(student);
  });
  document.getElementById("studentSearch").addEventListener("input",renderTable);

  function openEditor(student){
    selectedReg=student.registrationNumber;
    editor.hidden=false;clearError(editorError);document.getElementById("pinOutput").hidden=true;
    document.getElementById("editorTitle").textContent="Edit "+student.name;
    document.getElementById("editReg").value=student.registrationNumber;
    document.getElementById("editReg").readOnly=true;
    document.getElementById("editName").value=student.name||"";
    document.getElementById("editApplication").value=student.application||"";
    document.getElementById("editTeam").value=student.teamNumber||"";
    document.getElementById("editActive").checked=Boolean(student.active);
    const toggle=document.getElementById("toggleResultButton");
    toggle.disabled=!student.evaluation;
    toggle.textContent=student.evaluation&&student.evaluation.published?"Unpublish evaluation":"Publish evaluation";
    editor.scrollIntoView({behavior:"smooth",block:"start"});
  }

  document.getElementById("newStudent").addEventListener("click",function(){
    selectedReg="";editor.hidden=false;clearError(editorError);document.getElementById("pinOutput").hidden=true;
    document.getElementById("editorTitle").textContent="Add student";
    document.getElementById("editReg").value="";document.getElementById("editReg").readOnly=false;
    document.getElementById("editName").value="";document.getElementById("editApplication").value="";
    document.getElementById("editTeam").value="";document.getElementById("editActive").checked=true;
    document.getElementById("toggleResultButton").disabled=true;
    document.getElementById("toggleResultButton").textContent="Publish evaluation";
    editor.scrollIntoView({behavior:"smooth",block:"start"});
  });

  document.getElementById("closeEditor").addEventListener("click",function(){editor.hidden=true;selectedReg="";});
  document.getElementById("studentForm").addEventListener("submit",async function(event){
    event.preventDefault();clearError(editorError);document.getElementById("pinOutput").hidden=true;
    try{
      const reg=document.getElementById("editReg").value.trim().toUpperCase();
      const response=await auth.request("facultySaveStudent",{
        token:token,registrationNumber:reg,studentName:document.getElementById("editName").value.trim(),
        application:document.getElementById("editApplication").value.trim(),
        teamNumber:document.getElementById("editTeam").value,
        active:document.getElementById("editActive").checked?"true":"false"
      });
      selectedReg=reg;
      if(response.temporaryPin)showTemporaryPin(response.temporaryPin);
      showMessage("Student access record saved.");
      await refreshWithoutViewReset();
    }catch(error){showError(editorError,error.message);}
  });

  document.getElementById("resetPinButton").addEventListener("click",async function(){
    const reg=document.getElementById("editReg").value.trim().toUpperCase();
    if(!reg){showError(editorError,"Choose an existing student first.");return;}
    if(!window.confirm("Reset the PIN for "+reg+"? Existing student sessions will be signed out."))return;
    clearError(editorError);
    try{
      const response=await auth.request("facultyResetStudentPin",{token:token,registrationNumber:reg});
      showTemporaryPin(response.temporaryPin);
      showMessage("Temporary PIN generated. Copy it now and send it securely to the student.");
      await refreshWithoutViewReset();
    }catch(error){showError(editorError,error.message);}
  });

  document.getElementById("toggleResultButton").addEventListener("click",async function(){
    const reg=document.getElementById("editReg").value.trim().toUpperCase();
    const student=students.find(function(s){return s.registrationNumber===reg;});
    if(!student||!student.evaluation)return;
    clearError(editorError);
    try{
      await auth.request("facultyToggleResult",{token:token,registrationNumber:reg,published:student.evaluation.published?"false":"true"});
      showMessage(student.evaluation.published?"Evaluation unpublished.":"Evaluation published to the student's private dashboard.");
      selectedReg=reg;await refreshWithoutViewReset();
    }catch(error){showError(editorError,error.message);}
  });

  function showTemporaryPin(pin){
    document.getElementById("pinValue").textContent=pin||"";
    document.getElementById("pinOutput").hidden=!pin;
  }

  document.getElementById("passwordForm").addEventListener("submit",async function(event){
    event.preventDefault();
    const error=document.getElementById("passwordError");clearError(error);
    const p1=document.getElementById("newFacultyPassword").value;
    const p2=document.getElementById("confirmFacultyPassword").value;
    if(p1!==p2){showError(error,"The two password entries do not match.");return;}
    if(p1.length<10){showError(error,"Use at least 10 characters.");return;}
    try{
      await auth.request("facultyChangePassword",{token:token,newPassword:p1});
      this.reset();
      sessionStorage.removeItem(TOKEN_KEY);token="";setView("login");
      showError(loginError,"Faculty password changed. Sign in again with the new password.");
    }catch(e){showError(error,e.message);}
  });

  async function refreshWithoutViewReset(){
    const response=await auth.request("facultyDashboard",{token:token});
    renderDashboard(response.dashboard||{});
  }

  async function logout(){
    if(token){try{await auth.request("logoutSession",{token:token},15000);}catch(_){}}
    sessionStorage.removeItem(TOKEN_KEY);token="";setView("login");
  }
  document.getElementById("logoutButton").addEventListener("click",logout);
  document.getElementById("logoutTop").addEventListener("click",logout);
  document.getElementById("refreshDashboard").addEventListener("click",refreshWithoutViewReset);

  function escapeHtml(value){return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch];});}
  if(!auth||!auth.ready){showError(loginError,"The authentication service is not connected to the deployed Apps Script.");}
  loadDashboard();
})();