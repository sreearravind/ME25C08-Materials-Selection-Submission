(function(){
  "use strict";
  const config=window.SITE_CONFIG||{};
  const endpoint=config.appsScriptUrl||"";
  const ready=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);

  function request(action,payload,timeoutMs){
    return new Promise(function(resolve,reject){
      if(!ready){reject(new Error("The authentication service is not connected to the deployed Apps Script."));return;}
      const requestId="AUTH-"+Date.now()+"-"+Math.random().toString(36).slice(2,10);
      const iframe=document.createElement("iframe");
      const frameName="authFrame_"+requestId.replace(/[^A-Za-z0-9_]/g,"");
      iframe.name=frameName;iframe.hidden=true;iframe.title="Authentication response";
      document.body.appendChild(iframe);

      let timer=null;
      function cleanup(){
        window.removeEventListener("message",onMessage);
        window.clearTimeout(timer);
        iframe.remove();
      }
      function onMessage(event){
        const allowed=event.origin==="null"||event.origin==="https://script.google.com"||event.origin.endsWith(".googleusercontent.com");
        if(event.source!==iframe.contentWindow||!allowed||!event.data||event.data.requestId!==requestId)return;
        cleanup();
        if(event.data.ok)resolve(event.data);
        else reject(new Error(event.data.message||"The request could not be completed."));
      }
      window.addEventListener("message",onMessage);
      timer=window.setTimeout(function(){cleanup();reject(new Error("No response was received. Check the connection and try again."));},timeoutMs||45000);

      const form=document.createElement("form");
      form.method="POST";form.action=endpoint;form.target=frameName;form.hidden=true;
      const values=Object.assign({},payload||{},{action:action,requestId:requestId});
      Object.keys(values).forEach(function(key){
        const input=document.createElement("input");
        input.type="hidden";input.name=key;input.value=String(values[key]==null?"":values[key]);
        form.appendChild(input);
      });
      document.body.appendChild(form);form.submit();form.remove();
    });
  }

  window.CourseAuth={request:request,ready:ready};
})();