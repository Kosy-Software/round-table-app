import { Member } from "./member"

/// Messages that are relayed to all of the clients
export type AppMessage =
    | ReceiveStartApplication | ReceiveEndTurn | ReceiveUpdateTimer | ReceiveUpdateTurn | ReceiveRestartRound | ReceiveCloseApplication

export interface ReceiveStartApplication {
    type: "receive-start-application";
    payload: { note: string, currentSpeaker: Member };
}

export interface ReceiveCloseApplication {
    type: "receive-close-application";
}

export interface ReceiveRestartRound {
    type: "receive-restart-round";
}

export interface ReceiveEndTurn {
    type: "receive-end-turn";
    payload: { endedSpeaker: Member, nextSpeaker: Member }
}

export interface ReceiveUpdateTurn {
    type: "receive-update-turn";
    payload: boolean;
}

export interface ReceiveUpdateTimer {
    type: "receive-update-timer";
}

/// Internal component messages
export type ComponentMessage =
    | StartApplication | EndTurn | UpdateTimer | UpdateTurn | RestartRound | CloseApplication

export interface StartApplication {
    type: "start-application";
    payload: string;
}

export interface CloseApplication {
    type: "close-application";
}

export interface RestartRound {
    type: "restart-round";
}

export interface EndTurn {
    type: "end-turn";
}

export interface UpdateTurn {
    type: "update-turn";
    payload: boolean;
}

export interface UpdateTimer {
    type: "update-timer";
}

