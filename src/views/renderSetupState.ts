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

    notesInput.oninput = (event: Event) => {
        let notes = notesInput.value;
        if (notes != null && notes != "") {
            launchAppBtn.removeAttribute("disabled");
            launchAppBtn.classList.add("valid");
        } else {
            launchAppBtn.setAttribute("disabled", "disabled");
        }
    }

    //This sets up the round notes input element -> on input changed -> relay a message
    launchAppBtn.onclick = (event: Event) => {
        let notes = notesInput.value;
        dispatch({ type: "start-application", payload: notes });
    }

    return setup;
}