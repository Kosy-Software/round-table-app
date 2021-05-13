import { ComponentState } from "../lib/appState";
import { ComponentMessage } from '../lib/appMessages';

export function renderViewingState(state: ComponentState, dispatch: ((msg: ComponentMessage) => any)): HTMLElement {
    let viewingRoot = document.querySelector("#viewing") as HTMLTemplateElement;
    let viewingElement = viewingRoot.content.firstElementChild.cloneNode(true) as HTMLElement;

    if (state.notes) {
        let notesElement = viewingElement.querySelector('#notes');
        notesElement.innerHTML = state.notes;
    } else {
        let notesBoxElement = viewingElement.querySelector('#notes-box') as HTMLElement;
        notesBoxElement.style.display = 'none';
    }

    let endTurnButton = viewingElement.querySelector("#end-turn") as HTMLInputElement;
    endTurnButton.onclick = (event: Event) => {
        dispatch({ type: "end-turn" });
    }

    let updateTurnButton = viewingElement.querySelector("#update-turn") as HTMLInputElement;

    let playImage = viewingElement.querySelector('#play') as HTMLImageElement;
    let pauseImage = viewingElement.querySelector('#pause') as HTMLImageElement;

    pauseImage.style.display = state.isPaused ? 'none' : 'shown';
    playImage.style.display = state.isPaused ? 'shown' : 'none';

    updateTurnButton.onclick = (event: Event) => {
        dispatch({ type: "update-turn", payload: !state.isPaused });
    }

    let timerElement = viewingElement.querySelector('#timer');
    if (state.timeTurnStarted != null) {
        let hasNoPausedTime = !state.pausedTime && state.isPaused && state.pauseStartTime;
        timerElement.innerHTML = formatDifference(state.timeTurnStarted, state.pausedTime, hasNoPausedTime ? state.pauseStartTime : null);
    }

    let nextSpeaker = state.members.find(member => member.tookTurn == false && member != state.currentSpeaker);

    if (state.currentSpeaker != null) {
        let speakerElement = viewingElement.querySelector('#speaker');
        if (state.currentSpeaker.clientInfo.clientUuid == state.currentClient.clientUuid) {
            speakerElement.innerHTML = 'It\s <span class="highlight">your</span> turn now!';
        } else {
            updateTurnButton.style.display = 'none';
            endTurnButton.style.display = 'none';
            speakerElement.innerHTML = nextSpeaker != null ? `<span class="highlight">${state.currentSpeaker.clientInfo.clientName}</span> is taking a turn` : `<span class="highlight">${state.currentSpeaker.clientInfo.clientName}</span> is taking the <span class="highlight">last</span> turn`;
        }
    }
    if (nextSpeaker != null) {
        let nextSpeakerElement = viewingElement.querySelector('#next-speaker');
        nextSpeakerElement.innerHTML = nextSpeaker.clientInfo.clientUuid == state.currentClient.clientUuid
            ? 'You are next' : `${nextSpeaker.clientInfo.clientName} is next`;
    }

    return viewingElement;
}

function formatDifference(startDate: Date, pausedTime: number, referenceDate?: Date): string {
    var updatedTime = new Date().getTime();
    if (referenceDate) {
        updatedTime = referenceDate.getTime();
    }

    let difference = (updatedTime - startDate.getTime()) - pausedTime;

    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);

    let minutesString = (minutes < 10) ? "0" + minutes : minutes;
    let secondsString = (seconds < 10) ? "0" + seconds : seconds;

    return minutesString + ':' + secondsString;
}
