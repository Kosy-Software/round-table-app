import { ClientInfo } from "@kosy/kosy-app-api/types";

export class Member {
    public clientInfo: ClientInfo;
    public tookTurn: boolean;

    public constructor(clientInfo: ClientInfo) {
        this.clientInfo = clientInfo;
        this.tookTurn = false;
    }
}