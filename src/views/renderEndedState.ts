import { ComponentState } from "../lib/appState";
import { ComponentMessage } from "../lib/appMessages";

//Renders the setup state
export function renderEndedState(state: ComponentState, dispatch: ((msg: ComponentMessage) => any)): HTMLElement {
    let endedRoot = document.querySelector("#ended") as HTMLTemplateElement;
    let ended = endedRoot.content.cloneNode(true) as HTMLElement;

    let restartAppBtn = ended.querySelector("#restart-application") as HTMLInputElement;
    let closeAppBtn = ended.querySelector("#close-application") as HTMLInputElement;

    let viewingRoot = document.querySelector("#viewing") as HTMLTemplateElement;
    viewingRoot.hidden = true;

    if (state.currentClient.clientUuid != state.initializer.clientUuid) {
        restartAppBtn.style.display = 'none';
        closeAppBtn.style.display = 'none';
    }

    restartAppBtn.onclick = (event: Event) => {
        dispatch({ type: "restart-round" });
    }

    closeAppBtn.onclick = (event: Event) => {
        dispatch({ type: "close-application" });
    }

    return ended;
}