/// Messages that are relayed to all of the clients
export type AppMessage =
    | ReceiveStartApplication | ReceiveEndTurn | ReceiveUpdateTimer | ReceiveUpdateTurn

export interface ReceiveStartApplication {
    type: "receive-start-application";
    payload: string;
}

export interface ReceiveEndTurn {
    type: "receive-end-turn";
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
    | StartApplication | EndTurn | UpdateTimer | UpdateTurn

export interface StartApplication {
    type: "start-application";
    payload: string;
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

