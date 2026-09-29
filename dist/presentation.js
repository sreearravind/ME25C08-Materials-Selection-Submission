(function(){
  "use strict";
  const config=window.SITE_CONFIG||{};
  const data=window.PRESENTATION_DATA||{topics:[],teams:[],assignmentsPublished:false};
  const maxBytes=Number(config.maximumPresentationBytes)||10*1024*1024;
  const form=document.getElementById("presentationForm");
  const fileInput=document.getElementById("presentationFile");
  const submitButton=document.getElementById("submitButton");
  const formError=document.getElementById("formError");
  const successPanel=document.getElementById("successPanel");
  const allocationNotice=document.getElementById("allocationNotice");
  const setupNotice=document.getElementById("setupNotice");
  const endpointReady=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.appsScriptUrl||"");
  let requestTimer=null;

  document.getElementById("courseCode").textContent=config.courseCode||"ME25C08";
  document.getElementById("institutionName").textContent=config.institutionName||"Department of Mechanical Engineering";
  setupNotice.hidden=endpointReady;
  allocationNotice.hidden=Boolean(data.assignmentsPublished);

  const topicById={};
  const topicList=document.getElementById("topicList");
  (data.topics||[]).forEach(function(topic,index){
    topicById[String(topic.id)]=topic;
    const card=document.createElement("article");
    card.className="topic-card";
    card.innerHTML='<span class="topic-num">'+String(index+1).padStart(2,"0")+'</span><div><p>'+escapeHtml(topic.theme)+'</p><h3>'+escapeHtml(topic.title)+'</h3></div>';
    topicList.appendChild(card);
  });

  const teamSelect=document.getElementById("teamNumber");
  (data.teams||[]).forEach(function(team){
    const option=document.createElement("option");
    option.value=team.team;
    option.textContent="Team "+team.team;
    teamSelect.appendChild(option);
  });

  function selectedTeam(){
    return (data.teams||[]).find(function(team){return team.team===teamSelect.value;})||null;
  }

  teamSelect.addEventListener("change",function(){
    const team=selectedTeam();
    const details=document.getElementById("teamDetails");
    if(!team){details.hidden=true;document.getElementById("topicTitle").value="";return;}
    details.hidden=false;
    const topic=team.topicId?topicById[String(team.topicId)]:null;
    document.getElementById("teamMembers").textContent=(team.members&&team.members.length)?team.members.join(" · "):"Team members will appear after the faculty shuffle.";
    document.getElementById("assignedTopic").textContent=topic?topic.title:"Topic assignment pending faculty shuffle.";
    document.getElementById("topicTitle").value=topic?topic.title:"";
    clearError();
  });

  const dropzone=document.getElementById("presentationDropzone");
  fileInput.addEventListener("change",updateFileLabel);
  ["dragenter","dragover"].forEach(function(type){dropzone.addEventListener(type,function(e){e.preventDefault();dropzone.classList.add("dragover");});});
  ["dragleave","drop"].forEach(function(type){dropzone.addEventListener(type,function(e){e.preventDefault();dropzone.classList.remove("dragover");});});
  dropzone.addEventListener("drop",function(e){if(e.dataTransfer.files.length){fileInput.files=e.dataTransfer.files;updateFileLabel();}});

  function updateFileLabel(){
    const file=fileInput.files[0];
    document.getElementById("fileLabel").textContent=file?file.name:"Choose the final presentation";
    document.getElementById("fileMeta").textContent=file?formatBytes(file.size):"PDF, PPT or PPTX · maximum 10 MB";
  }

  function validateFile(file){
    if(!file)return "Choose a presentation file before submitting.";
    const ext=(file.name.split(".").pop()||"").toLowerCase();
    if(["pdf","ppt","pptx"].indexOf(ext)<0)return "Only PDF, PPT and PPTX files are accepted.";
    if(file.size===0)return "The selected file is empty.";
    if(file.size>maxBytes)return "The selected file exceeds the 10 MB limit.";
    return "";
  }

  function fileAsBase64(file){
    return new Promise(function(resolve,reject){
      const reader=new FileReader();
      reader.onload=function(){resolve(String(reader.result||"").split(",")[1]||"");};
      reader.onerror=function(){reject(new Error("The presentation file could not be read."));};
      reader.readAsDataURL(file);
    });
  }

  function showError(message){formError.textContent=message;formError.hidden=false;formError.scrollIntoView({behavior:"smooth",block:"center"});}
  function clearError(){formError.hidden=true;formError.textContent="";}
  function setBusy(busy){submitButton.disabled=busy||!data.assignmentsPublished;submitButton.querySelector(".button-text").hidden=busy;submitButton.querySelector(".button-wait").hidden=!busy;}

  if(!data.assignmentsPublished)submitButton.disabled=true;

  form.addEventListener("submit",async function(event){
    event.preventDefault();clearError();
    if(!data.assignmentsPublished){showError("Team allocation has not been published yet.");return;}
    if(!form.checkValidity()){const invalid=form.querySelector(":invalid");if(invalid)invalid.focus();showError("Please complete all required fields.");return;}
    if(!endpointReady){showError("The presentation module has not yet been connected to the faculty Google Drive.");return;}
    const team=selectedTeam();
    const topic=team&&team.topicId?topicById[String(team.topicId)]:null;
    if(!team||!topic){showError("Your team does not yet have a valid topic allocation.");return;}
    const file=fileInput.files[0];
    const fileError=validateFile(file);if(fileError){showError(fileError);return;}

    setBusy(true);
    try{
      const payload=new FormData(form);
      payload.set("action","presentationSubmission");
      payload.set("topicTitle",topic.title);
      payload.set("presentationBase64",await fileAsBase64(file));
      payload.set("presentationFileName",file.name);
      payload.set("presentationMimeType",file.type||"");
      payload.set("clientTimestamp",new Date().toISOString());

      const bridge=document.createElement("form");
      bridge.method="POST";bridge.action=config.appsScriptUrl;bridge.target="presentationTarget";bridge.hidden=true;
      payload.forEach(function(value,key){const input=document.createElement("input");input.type="hidden";input.name=key;input.value=String(value);bridge.appendChild(input);});
      document.body.appendChild(bridge);bridge.submit();bridge.remove();

      requestTimer=window.setTimeout(function(){setBusy(false);showError("No confirmation was received. Check your connection before trying again.");},60000);
    }catch(error){setBusy(false);showError(error.message||"The presentation could not be prepared for upload.");}
  });

  window.addEventListener("message",function(event){
    const frame=document.getElementById("presentationTarget");
    const trustedFrame=event.source===frame.contentWindow;
    const allowedOrigin=event.origin==="null"||event.origin==="https://script.google.com"||event.origin.endsWith(".googleusercontent.com");
    if(!trustedFrame||!allowedOrigin||!event.data||event.data.type!=="presentation-submission-result")return;
    window.clearTimeout(requestTimer);setBusy(false);
    if(!event.data.ok){showError(event.data.message||"The presentation was not accepted.");return;}
    document.getElementById("receiptId").textContent=event.data.submissionId||"Recorded";
    document.getElementById("receiptTeam").textContent="Team "+(event.data.teamNumber||teamSelect.value);
    document.getElementById("receiptTopic").textContent=event.data.topicTitle||document.getElementById("topicTitle").value;
    document.getElementById("receiptTime").textContent=event.data.submittedAt||new Date().toLocaleString();
    form.hidden=true;successPanel.hidden=false;successPanel.focus();
  });

  document.getElementById("newSubmission").addEventListener("click",function(){
    form.reset();updateFileLabel();document.getElementById("teamDetails").hidden=true;document.getElementById("topicTitle").value="";
    successPanel.hidden=true;form.hidden=false;setBusy(false);teamSelect.focus();
  });

  function escapeHtml(value){return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch];});}
  function formatBytes(bytes){return(bytes/(1024*1024)).toFixed(2)+" MB · maximum 10 MB";}
})();