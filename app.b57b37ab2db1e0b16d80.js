(()=>{"use strict";(()=>{function e(e,t){let s=document.querySelector("#viewing").content.firstElementChild.cloneNode(!0);e.notes?s.querySelector("#notes").innerHTML=e.notes:s.querySelector("#notes-box").style.display="none";let n=s.querySelector("#end-turn");n.onclick=e=>{t({type:"end-turn"})};let i=s.querySelector("#update-turn"),a=s.querySelector("#play");s.querySelector("#pause").style.display=e.isPaused?"none":"shown",a.style.display=e.isPaused?"shown":"none",i.onclick=s=>{t({type:"update-turn",payload:!e.isPaused})};let r=s.querySelector("#timer");null!=e.timeTurnStarted&&(r.innerHTML=function(e,t){let s=(new Date).getTime()-e.getTime()-t,n=Math.floor(s%36e5/6e4);var i=Math.floor(s%6e4/1e3);return(n<10?"0"+n:n)+":"+(i<10?"0"+i:i)}(e.timeTurnStarted,e.pausedTime));let l=e.members.find((t=>0==t.tookTurn&&t!=e.currentSpeaker));if(null!=e.currentSpeaker){let t=s.querySelector("#speaker");e.currentSpeaker.clientInfo.clientUuid==e.currentClient.clientUuid?t.innerHTML='Its <span class="highlight">your</span> turn now!':(i.style.display="none",n.style.display="none",t.innerHTML=null!=l?`<span class="highlight">${e.currentSpeaker.clientInfo.clientName}</span> is taking a turn`:`<span class="highlight">${e.currentSpeaker.clientInfo.clientName}</span> is taking the <span class="highlight">last</span> turn`)}return null!=l&&(s.querySelector("#next-speaker").innerHTML=l.clientInfo.clientUuid==e.currentClient.clientUuid?"You are next":`${l.clientInfo.clientName} is next`),s}function t(e,t){let s=document.querySelector("#setup").content.cloneNode(!0),n=s.querySelector("textarea"),i=s.querySelector("#launch-application");return document.querySelector("#viewing").hidden=!0,i.onclick=e=>{var s;t({type:"start-application",payload:null!==(s=n.value)&&void 0!==s?s:""})},s}function s(e,t){let s=document.querySelector("#waiting").content.firstElementChild.cloneNode(!0);return s.querySelector("label").innerHTML=`${e.initializer.clientName} is setting up the app`,s}function n(e,t){let s=document.querySelector("#ended").content.cloneNode(!0),n=s.querySelector("#restart-application"),i=s.querySelector("#close-application");return document.querySelector("#viewing").hidden=!0,e.currentClient.clientUuid!=e.initializer.clientUuid&&(n.style.display="none",i.style.display="none"),n.onclick=e=>{t({type:"restart-round"})},i.onclick=e=>{t({type:"close-application"})},s}class i{constructor(e){this.kosyClient=window.parent,this.kosyApp=e}startApp(){return new Promise(((e,t)=>{window.addEventListener("message",(t=>{let s=t.data;switch(s.type){case"receive-initial-info":e(s.payload);break;case"client-has-joined":this.kosyApp.onClientHasJoined(s.payload);break;case"client-has-left":this.kosyApp.onClientHasLeft(s.clientUuid);break;case"get-app-state":const t=this.kosyApp.onRequestState();this._sendMessageToKosy({type:"receive-app-state",payload:t,clientUuids:s.clientUuids});break;case"set-app-state":this.kosyApp.onProvideState(s.state);break;case"receive-message":this.kosyApp.onReceiveMessage(s.payload)}})),this._sendMessageToKosy({type:"ready-and-listening"})}))}stopApp(){this._sendMessageToKosy({type:"stop-app"})}relayMessage(e){this._sendMessageToKosy({type:"relay-message",payload:e})}_sendMessageToKosy(e){this.kosyClient.postMessage(e,"*")}}class a{constructor(e){this.clientInfo=e,this.tookTurn=!1}}var r;!function(r){var l;(function(r){class l{constructor(){this.state={},this.kosyApi=new i({onClientHasJoined:e=>this.onClientHasJoined(e),onClientHasLeft:e=>this.onClientHasLeft(e),onReceiveMessage:e=>this.processMessage(e),onRequestState:()=>this.getState(),onProvideState:e=>this.setState(e)})}start(){var e,t,s,n,i;return t=this,s=void 0,i=function*(){let t=yield this.kosyApi.startApp();this.initializer=t.clients[t.initializerClientUuid],this.currentClient=t.clients[t.currentClientUuid],this.state=null!==(e=t.currentAppState)&&void 0!==e?e:this.state,console.log(this.state),null==this.state.members&&(this.state.members=new Array,this.currentClient.clientUuid==this.initializer.clientUuid&&this.addMember(this.currentClient)),this.renderComponent(),window.addEventListener("message",(e=>{this.processComponentMessage(e.data)}))},new((n=void 0)||(n=Promise))((function(e,a){function r(e){try{o(i.next(e))}catch(e){a(e)}}function l(e){try{o(i.throw(e))}catch(e){a(e)}}function o(t){var s;t.done?e(t.value):(s=t.value,s instanceof n?s:new n((function(e){e(s)}))).then(r,l)}o((i=i.apply(t,s||[])).next())}))}setState(e){this.state=e,this.renderComponent()}getState(){return this.state}onClientHasJoined(e){null!=this.currentClient&&null!=this.initializer&&(this.addMember(e),this.renderComponent())}onClientHasLeft(e){this.removeMember(e),this.renderComponent(),e!==this.initializer.clientUuid||this.state.notes||this.kosyApi.stopApp()}processMessage(e){switch(e.type){case"receive-start-application":this.state.notes=`${e.payload}`,this.startRound(),this.renderComponent();break;case"receive-close-application":this.kosyApi.stopApp();break;case"receive-end-turn":this.endTurn(),this.haveAllMembersTakenTurn()&&(this.state.ended=!0,this.state.notes=null),this.renderComponent();break;case"receive-restart-round":this.state.ended=null,this.state.currentSpeaker=null,this.state.pauseStartTime=null,this.state.notes=null,this.state.isPaused=!1,this.state.timeTurnStarted=null,this.renderComponent();break;case"receive-update-turn":if(this.state.isPaused=e.payload,this.state.isPaused)this.state.pauseStartTime=new Date,this.endInterval();else{let e=(new Date).getTime()-this.state.pauseStartTime.getTime();this.state.pausedTime+=e,this.state.pauseStartTime=null,this.startInterval()}this.renderComponent();break;case"receive-update-timer":this.renderComponent()}}processComponentMessage(e){switch(e.type){case"start-application":this.kosyApi.relayMessage({type:"receive-start-application",payload:e.payload});break;case"close-application":this.kosyApi.relayMessage({type:"receive-close-application"});break;case"end-turn":this.kosyApi.relayMessage({type:"receive-end-turn"});break;case"update-turn":this.kosyApi.relayMessage({type:"receive-update-turn",payload:e.payload});break;case"update-timer":this.kosyApi.relayMessage({type:"receive-update-timer"});break;case"restart-round":this.kosyApi.relayMessage({type:"receive-restart-round"})}}renderComponent(){!function(i,a){let r,l=document.getElementById("root");r=null!=(null==i?void 0:i.notes)?e:i.currentClient.clientUuid==i.initializer.clientUuid?i.ended?n:t:s;var o=l.cloneNode(!1);l.parentNode.replaceChild(o,l),o.appendChild(r(i,a))}({notes:this.state.notes,currentClient:this.currentClient,initializer:this.initializer,members:this.state.members,timeTurnStarted:this.state.timeTurnStarted,currentSpeaker:this.state.currentSpeaker,pausedTime:this.state.pausedTime,pauseStartTime:this.state.pauseStartTime,isPaused:this.state.isPaused,ended:this.state.ended},(e=>this.processComponentMessage(e)))}log(...e){var t,s;console.log(`${null!==(s=null===(t=this.currentClient)||void 0===t?void 0:t.clientName)&&void 0!==s?s:"New user"} logged: `,...e)}startRound(){this.state.currentSpeaker=this.state.members[0],this.startTurn()}addMember(e){this.state.members.push(new a(e))}removeMember(e){let t=this.state.members.find((t=>t.clientInfo.clientUuid==e));if(null!=t){let e=this.state.members.indexOf(t);this.state.members.splice(e,1)}}endTurn(){var e;this.endInterval(),this.state.timeTurnStarted=null,this.state.currentSpeaker.tookTurn=!0,null!=this.state.currentSpeaker&&(e=this.state.members.indexOf(this.state.currentSpeaker),this.state.members.splice(e,1,this.state.currentSpeaker)),this.haveAllMembersTakenTurn()?this.state.currentSpeaker=null:(this.state.currentSpeaker=this.state.members.find((e=>0==e.tookTurn)),this.startTurn())}haveAllMembersTakenTurn(){return null==this.state.members.find((e=>0==e.tookTurn))}startTurn(){this.state.timeTurnStarted=new Date,this.state.pausedTime=0,this.state.isPaused=!1,this.startInterval()}startInterval(){this.currentInterval=window.setInterval((()=>this.refreshElapsedTime()),1e3)}endInterval(){window.clearInterval(this.currentInterval)}refreshElapsedTime(){this.processComponentMessage({type:"update-timer"})}}r.App=l,(new l).start()})((l=r.Integration||(r.Integration={})).Round||(l.Round={}))}(r||(r={}))})()})();