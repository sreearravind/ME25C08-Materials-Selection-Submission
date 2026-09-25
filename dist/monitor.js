(function(){
  'use strict';
  const endpoint=(window.SITE_CONFIG||{}).appsScriptUrl||'';
  const $=s=>document.querySelector(s);
  let key='',timer=null,pendingScript=null;
  function connect(){
    key=$('#monitorKey').value.trim();
    if(!key){$('#accessError').textContent='Enter the private monitor key.';$('#accessError').hidden=false;return;}
    sessionStorage.setItem('me25c08MonitorKey',key);location.hash=encodeURIComponent(key);$('#accessError').hidden=true;load();
  }
  function load(){
    if(!key||!endpoint)return;
    if(pendingScript)pendingScript.remove();
    pendingScript=document.createElement('script');
    pendingScript.src=`${endpoint}?action=quizMonitor&key=${encodeURIComponent(key)}&callback=receiveQuizMonitor&_=${Date.now()}`;
    pendingScript.onerror=()=>showError('Could not reach the monitoring service.');document.body.appendChild(pendingScript);
  }
  window.receiveQuizMonitor=function(data){
    if(!data||!data.ok){showError(data&&data.message?data.message:'Monitor access was rejected.');return;}
    $('#accessPanel').hidden=true;$('#dashboard').hidden=false;$('#liveBadge').textContent='Live · '+new Date(data.generatedAt).toLocaleTimeString();$('#liveBadge').classList.add('online');render(data);
    clearTimeout(timer);timer=setTimeout(load,5000);
  };
  function showError(message){$('#accessError').textContent=message;$('#accessError').hidden=false;$('#liveBadge').textContent='Offline';clearTimeout(timer);}
  function esc(v){const d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML;}
  function ago(iso){const sec=Math.max(0,Math.round((Date.now()-new Date(iso).getTime())/1000));return sec<60?`${sec}s ago`:`${Math.round(sec/60)}m ago`;}
  function render(data){
    const live=data.live||[],results=data.results||[],events=data.events||[];
    const active=live.filter(x=>x.active);
    $('#activeCount').textContent=active.length;$('#submittedCount').textContent=results.length;$('#exitCount').textContent=events.filter(x=>x.eventType==='fullscreen_exit').length;$('#hiddenCount').textContent=events.filter(x=>x.eventType==='page_hidden').length;
    $('#liveRows').innerHTML=(live.length?live:[{}]).map(x=>x.registrationNumber?`<tr><td><strong>${esc(x.studentName)}</strong><br><small>${esc(x.registrationNumber)}</small></td><td class="${x.active?'status-live':'status-stale'}">${x.active?'Active':'Stale / submitted'}</td><td>Q${esc(x.currentQuestion)} · ${esc(x.answered)}/40</td><td>${x.isFullscreen==='true'?'Yes':'No / unavailable'} · exits ${esc(x.fullscreenExits)}</td><td>${ago(x.lastSeen)}</td></tr>`:'<tr><td colspan="5">No quiz signals yet.</td></tr>').join('');
    $('#resultRows').innerHTML=(results.length?results:[{}]).map(x=>x.registrationNumber?`<tr><td><strong>${esc(x.studentName)}</strong><br><small>${esc(x.registrationNumber)}</small></td><td><strong>${esc(x.score)}/${esc(x.total)}</strong> (${esc(x.percentage)}%)</td><td>${Math.ceil(Number(x.durationSeconds)/60)} min</td><td>${esc(x.pageHidden)}</td><td>${esc(x.fullscreenExits)}</td><td>${new Date(x.serverTimestamp).toLocaleTimeString()}</td></tr>`:'<tr><td colspan="6">No submitted results yet.</td></tr>').join('');
    $('#eventList').innerHTML=(events.length?events:[{}]).map(x=>x.eventType?`<div class="event"><strong>${esc(x.studentName)}<br><small>${esc(x.registrationNumber)}</small></strong><span>${esc(x.eventType.replaceAll('_',' '))}${x.detail?' · '+esc(x.detail):''}</span><small>${new Date(x.serverTimestamp).toLocaleTimeString()}</small></div>`:'<p>No integrity events yet.</p>').join('');
  }
  $('#connectButton').addEventListener('click',connect);$('#refreshButton').addEventListener('click',load);
  const hash=decodeURIComponent(location.hash.slice(1));key=hash||sessionStorage.getItem('me25c08MonitorKey')||'';
  if(key){$('#monitorKey').value=key;load();}
})();
