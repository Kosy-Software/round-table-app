(()=>{"use strict";(()=>{function e(e,t){var n,i;let s=document.querySelector("#viewing").content.firstElementChild.cloneNode(!0);null!=e.notes&&(s.querySelector("#notes").innerHTML=e.notes),console.log("Current speaker: "+(null===(i=null===(n=e.roundManager.currentSpeaker)||void 0===n?void 0:n.clientInfo)||void 0===i?void 0:i.clientName));let r=s.querySelector("#end-turn");if(r.onclick=e=>{t({type:"end-turn"})},null!=e.roundManager.currentSpeaker){let t=s.querySelector("#speaker");e.roundManager.currentSpeaker.clientInfo.clientUuid==e.currentClient.clientUuid?t.innerHTML='Its <span class="highlight">your</span> turn now!':(t.innerHTML=null!=e.roundManager.getNextSpeaker()?`<span class="highlight">${e.roundManager.currentSpeaker.clientInfo.clientName}</span> is taking a turn`:`<span class="highlight">${e.roundManager.currentSpeaker.clientInfo.clientName}</span> is taking the <span class="highlight">last</span> turn`,r.style.visibility="hidden")}return null!=e.roundManager.getNextSpeaker()&&(s.querySelector("#next-speaker").innerHTML=e.roundManager.getNextSpeaker().clientInfo.clientUuid==e.currentClient.clientUuid?"You are next":`${e.roundManager.getNextSpeaker().clientInfo.clientName} is next`),s}function t(e,t){let n=document.querySelector("#setup").content.cloneNode(!0),i=n.querySelector("textarea"),s=n.querySelector("#launch-application");return document.querySelector("#viewing").hidden=!0,i.oninput=e=>{let t=i.value;null!=t&&""!=t?(s.removeAttribute("disabled"),s.classList.add("valid")):s.setAttribute("disabled","disabled")},s.onclick=e=>{let n=i.value;t({type:"start-application",payload:n})},n}function n(e,t){let n=document.querySelector("#waiting").content.firstElementChild.cloneNode(!0);return n.querySelector("label").innerHTML=`${e.initializer.clientName} is setting up the app`,n}class i{constructor(e){this.kosyClient=window.parent,this.kosyApp=e}startApp(){return new Promise(((e,t)=>{window.addEventListener("message",(t=>{let n=t.data;switch(n.type){case"receive-initial-info":e(n.payload);break;case"client-has-joined":this.kosyApp.onClientHasJoined(n.payload);break;case"client-has-left":this.kosyApp.onClientHasLeft(n.clientUuid);break;case"get-app-state":const t=this.kosyApp.onRequestState();this._sendMessageToKosy({type:"receive-app-state",payload:t,clientUuids:n.clientUuids});break;case"set-app-state":this.kosyApp.onProvideState(n.state);break;case"receive-message":this.kosyApp.onReceiveMessage(n.payload)}})),this._sendMessageToKosy({type:"ready-and-listening"})}))}stopApp(){this._sendMessageToKosy({type:"stop-app"})}relayMessage(e){this._sendMessageToKosy({type:"relay-message",payload:e})}_sendMessageToKosy(e){this.kosyClient.postMessage(e,"*")}}class s{constructor(e){this.clientInfo=e,this.tookTurn=!1}}class r{constructor(e,t){this.members=new Array,e&&(this.members=e),this.currentSpeaker=this.members.find((e=>0==e.tookTurn))}startRound(){this.currentSpeaker=this.members[0]}addMember(e){this.members.push(new s(e))}removeMember(e){var t,n;for(let n=0;n<this.members.length;n++)if(e==this.members[n].clientInfo.clientUuid)return void(t=this.members[n]);null!=t&&(n=this.members.indexOf(t),this.members.splice(n,1))}endTurn(){var e;this.currentSpeaker.tookTurn=!0,null!=this.currentSpeaker&&(e=this.members.indexOf(this.currentSpeaker),this.members.splice(e,1,this.currentSpeaker)),this.haveAllMembersTakenTurn()?this.currentSpeaker=null:this.currentSpeaker=this.members.find((e=>0==e.tookTurn))}getNextSpeaker(){return this.members.find((e=>0==e.tookTurn&&e!=this.currentSpeaker))}haveAllMembersTakenTurn(){return null==this.members.find((e=>0==e.tookTurn))}}var a;!function(s){var a;(function(s){class a{constructor(){this.state={notes:null,roundManager:null},this.kosyApi=new i({onClientHasJoined:e=>this.onClientHasJoined(e),onClientHasLeft:e=>this.onClientHasLeft(e),onReceiveMessage:e=>this.processMessage(e),onRequestState:()=>this.getState(),onProvideState:e=>this.setState(e)})}start(){var e,t,n,i,s;return t=this,n=void 0,s=function*(){let t=yield this.kosyApi.startApp();this.initializer=t.clients[t.initializerClientUuid],this.currentClient=t.clients[t.currentClientUuid],this.state=null!==(e=t.currentAppState)&&void 0!==e?e:this.state,null==this.state.roundManager?(this.state.roundManager=new r,this.state.roundManager.addMember(this.currentClient)):(console.log(this.state),this.state.roundManager=new r(this.state.roundManager.members)),this.renderComponent(),window.addEventListener("message",(e=>{this.processComponentMessage(e.data)}))},new((i=void 0)||(i=Promise))((function(e,r){function a(e){try{l(s.next(e))}catch(e){r(e)}}function o(e){try{l(s.throw(e))}catch(e){r(e)}}function l(t){var n;t.done?e(t.value):(n=t.value,n instanceof i?n:new i((function(e){e(n)}))).then(a,o)}l((s=s.apply(t,n||[])).next())}))}setState(e){this.state=e,this.renderComponent()}getState(){return this.state}onClientHasJoined(e){null!=this.currentClient&&null!=this.initializer&&this.state.roundManager.addMember(e)}onClientHasLeft(e){this.currentClient.clientUuid===this.initializer.clientUuid&&this.state.roundManager.removeMember(e),e!==this.initializer.clientUuid||this.state.notes||this.kosyApi.stopApp()}processMessage(e){switch(e.type){case"receive-start-application":this.state.notes=`${e.payload}`,this.currentClient.clientUuid==this.initializer.clientUuid&&this.state.roundManager.startRound(),this.renderComponent();break;case"receive-end-turn":this.state.roundManager.endTurn(),console.log(this.state.roundManager),this.state.roundManager.haveAllMembersTakenTurn()?this.kosyApi.stopApp():this.renderComponent()}}processComponentMessage(e){switch(e.type){case"start-application":this.kosyApi.relayMessage({type:"receive-start-application",payload:e.payload});break;case"end-turn":this.kosyApi.relayMessage({type:"receive-end-turn"})}}renderComponent(){!function(i,s){let r,a=document.getElementById("root");r=(null==i?void 0:i.notes)?e:i.currentClient.clientUuid==i.initializer.clientUuid?t:n;var o=a.cloneNode(!1);a.parentNode.replaceChild(o,a),o.appendChild(r(i,s))}({notes:this.state.notes,currentClient:this.currentClient,initializer:this.initializer,roundManager:this.state.roundManager},(e=>this.processComponentMessage(e)))}log(...e){var t,n;console.log(`${null!==(n=null===(t=this.currentClient)||void 0===t?void 0:t.clientName)&&void 0!==n?n:"New user"} logged: `,...e)}}s.App=a,(new a).start()})((a=s.Integration||(s.Integration={})).Youtube||(a.Youtube={}))}(a||(a={}))})()})();