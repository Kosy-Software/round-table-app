import { Member } from "./member"

/// Messages that are relayed to all of the clients
export type AppMessage =
    | ReceiveStartApplication | ReceiveEndTurn

export interface ReceiveStartApplication {
    type: "receive-start-application";
    payload: string;
}

export interface ReceiveEndTurn {
    type: "receive-end-turn";
}

/// Internal component messages
export type ComponentMessage =
    | StartApplication | EndTurn

export interface StartApplication {
    type: "start-application";
    payload: string;
}

export interface EndTurn {
    type: "end-turn";
}

