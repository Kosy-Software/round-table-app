import { ComponentState } from "../lib/appState";
import { ComponentMessage } from '../lib/appMessages';

export function renderViewingState(state: ComponentState, dispatch: ((msg: ComponentMessage) => any)): HTMLElement {
    let viewingRoot = document.querySelector("#viewing") as HTMLTemplateElement;
    let viewingElement = viewingRoot.content.firstElementChild.cloneNode(true) as HTMLElement;

    if (state.notes != null) {
        let notesElement = viewingElement.querySelector('#notes');
        notesElement.innerHTML = state.notes;
    }

    console.log("Current speaker: " + state.roundManager.currentSpeaker?.clientInfo?.clientName);

    let endTurnButton = viewingElement.querySelector("#end-turn") as HTMLInputElement;
    endTurnButton.onclick = (event: Event) => {
        dispatch({ type: "end-turn" });
    }

    if (state.roundManager.currentSpeaker != null) {
        let speakerElement = viewingElement.querySelector('#speaker');
        if (state.roundManager.currentSpeaker.clientInfo.clientUuid == state.currentClient.clientUuid) {
            speakerElement.innerHTML = 'It\s <span class="highlight">your</span> turn now!';
        } else {
            speakerElement.innerHTML = state.roundManager.getNextSpeaker() != null ? `<span class="highlight">${state.roundManager.currentSpeaker.clientInfo.clientName}</span> is taking a turn` : `<span class="highlight">${state.roundManager.currentSpeaker.clientInfo.clientName}</span> is taking the <span class="highlight">last</span> turn`;
            endTurnButton.style.visibility = 'hidden';
        }
    }
    if (state.roundManager.getNextSpeaker() != null) {
        let nextSpeakerElement = viewingElement.querySelector('#next-speaker');
        nextSpeakerElement.innerHTML = state.roundManager.getNextSpeaker().clientInfo.clientUuid == state.currentClient.clientUuid
            ? 'You are next' : `${state.roundManager.getNextSpeaker().clientInfo.clientName} is next`;
    }

    return viewingElement;
}