import { ComponentState } from "../lib/appState";
import { ComponentMessage } from '../lib/appMessages';

export function renderViewingState(state: ComponentState, dispatch: ((msg: ComponentMessage) => any)): HTMLElement {
    let viewingRoot = document.querySelector("#viewing") as HTMLTemplateElement;
    let viewingElement = viewingRoot.content.firstElementChild.cloneNode(true) as HTMLElement;

    if (state.notes != null) {
        let notesElement = viewingElement.querySelector('#notes');
        notesElement.innerHTML = state.notes;
    }

    let endTurnButton = viewingElement.querySelector("#end-turn") as HTMLInputElement;
    endTurnButton.onclick = (event: Event) => {
        dispatch({ type: "end-turn" });
    }

    let pauseTurnButton = viewingElement.querySelector("#pause-turn") as HTMLInputElement;
    let playTurnButton = viewingElement.querySelector("#play-turn") as HTMLInputElement;

    pauseTurnButton.style.display = state.roundManager.isPaused ? 'none' : 'shown';
    playTurnButton.style.display = state.roundManager.isPaused ? 'shown' : 'none';

    playTurnButton.onclick = (event: Event) => {
        dispatch({ type: "update-turn", payload: true });
    }
    pauseTurnButton.onclick = (event: Event) => {
        dispatch({ type: "update-turn", payload: false });
    }

    let timerElement = viewingElement.querySelector('#timer');
    if (state.roundManager.timeTurnStarted != null) {
        timerElement.innerHTML = formatDifference(state.roundManager.timeTurnStarted, state.roundManager.pausedTime);
    } else {
        timerElement.innerHTML = '00:00';
    }

    if (state.roundManager.isPaused) {
        state.roundManager.pausedTime += 1000;
    }

    if (state.roundManager.currentSpeaker != null) {
        let speakerElement = viewingElement.querySelector('#speaker');
        if (state.roundManager.currentSpeaker.clientInfo.clientUuid == state.currentClient.clientUuid) {
            speakerElement.innerHTML = 'It\s <span class="highlight">your</span> turn now!';
        } else {
            pauseTurnButton.style.display = 'none';
            playTurnButton.style.display = 'none';
            endTurnButton.style.display = 'none';
            speakerElement.innerHTML = state.roundManager.getNextSpeaker() != null ? `<span class="highlight">${state.roundManager.currentSpeaker.clientInfo.clientName}</span> is taking a turn` : `<span class="highlight">${state.roundManager.currentSpeaker.clientInfo.clientName}</span> is taking the <span class="highlight">last</span> turn`;
        }
    }
    if (state.roundManager.getNextSpeaker() != null) {
        let nextSpeakerElement = viewingElement.querySelector('#next-speaker');
        nextSpeakerElement.innerHTML = state.roundManager.getNextSpeaker().clientInfo.clientUuid == state.currentClient.clientUuid
            ? 'You are next' : `${state.roundManager.getNextSpeaker().clientInfo.clientName} is next`;
    }

    return viewingElement;
}

function formatDifference(startDate: Date, pausedTime: number): string {
    let updatedTime = new Date().getTime();

    let difference = (updatedTime - startDate.getTime()) - pausedTime;

    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);

    let minutesString = (minutes < 10) ? "0" + minutes : minutes;
    let secondsString = (seconds < 10) ? "0" + seconds : seconds;

    return minutesString + ':' + secondsString;
}