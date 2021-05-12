import { ComponentState } from "../lib/appState";
import { ComponentMessage } from "../lib/appMessages";

//Renders the setup state
export function renderSetupState(state: ComponentState, dispatch: ((msg: ComponentMessage) => any)): HTMLElement {
    let setupRoot = document.querySelector("#setup") as HTMLTemplateElement;
    let setup = setupRoot.content.cloneNode(true) as HTMLElement;

    let notesInput = setup.querySelector("textarea");
    let launchAppBtn = setup.querySelector("#launch-application") as HTMLInputElement;

    let viewingRoot = document.querySelector("#viewing") as HTMLTemplateElement;
    viewingRoot.hidden = true;

    //This sets up the round notes input element -> on input changed -> relay a message
    launchAppBtn.onclick = (event: Event) => {
        dispatch({ type: "start-application", payload: notesInput.value ?? "" });
    }

    return setup;
}