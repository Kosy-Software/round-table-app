import './styles/style.scss';

import { AppMessage, ComponentMessage } from './lib/appMessages';
import { AppState } from './lib/appState';
import { render } from './views/renderState';
import { ClientInfo } from '@kosy/kosy-app-api/types';
import { KosyApi } from '@kosy/kosy-app-api';
import { Member } from './lib/member';

module Kosy.Integration.Round {
    export class App {
        private state: AppState = { timePassed: 0 };
        private initializer: ClientInfo;
        private currentClient: ClientInfo;
        private currentInterval: number;

        private kosyApi = new KosyApi<AppState, AppMessage, AppMessage>({
            onClientHasJoined: (client) => this.onClientHasJoined(client),
            onClientHasLeft: (clientUuid) => this.onClientHasLeft(clientUuid),
            onReceiveMessageAsClient: (message) => this.processMessage(message),
            onReceiveMessageAsHost: (message) => this.processMessageAsHost(message),
            onRequestState: () => this.getState(),
            onProvideState: (newState: AppState) => this.setState(newState)
        })

        public async start() {
            let initialInfo = await this.kosyApi.startApp();
            this.initializer = initialInfo.clients[initialInfo.initializerClientUuid];
            this.currentClient = initialInfo.clients[initialInfo.currentClientUuid];
            this.state = initialInfo.currentAppState ?? this.state;

            this.log(initialInfo);

            if (this.state.members == null) {
                this.state.members = new Array<Member>();
                if (initialInfo.clients && Object.keys(initialInfo.clients).length > 0) {
                    Object.keys(initialInfo.clients).forEach((element) => this.addMember(initialInfo.clients[element]));
                }
                else {
                    if (this.currentClient.clientUuid == this.initializer.clientUuid) {
                        this.addMember(this.currentClient);
                    }
                }
                this.sortMembers();
            }

            this.renderComponent();

            window.addEventListener("message", (event: MessageEvent<ComponentMessage>) => {
                this.processComponentMessage(event.data)
            });
        }

        public setState(newState: AppState) {
            this.state = newState;
            this.renderComponent();
        }

        public getState() {
            return this.state;
        }

        public onClientHasJoined(client: ClientInfo) {
            this.log(`New client (Name: ${client.clientName}) is sitting at: ${client.seatNumber ?? "non-existing table"}`);
            if (this.currentClient != null && this.initializer != null) {
                this.addMember(client);
                this.sortMembers();
            }
        }

        public onClientHasLeft(clientUuid: string) {
            this.log("A client has left: " + clientUuid);
            this.removeMember(clientUuid);
            this.sortMembers();
        }

        public processMessageAsHost(message: AppMessage) {
            this.log("Message received as host: " + message.type);
            switch (message.type) {
                case "receive-start-application":
                    this.resetTurn();
                    this.startInterval();
                    message.payload.currentSpeaker = this.state.members[0];
                    break;
                case "receive-end-turn":
                    this.endTurn();
                    let nextSpeakingMember = this.nextSpeaker();
                    message.payload.nextSpeaker = nextSpeakingMember;
                    break;
            }

            return message;
        }

        public processMessage(message: AppMessage) {
            switch (message.type) {
                case "receive-start-application":
                    this.resetTurn();
                    this.state.notes = `${message.payload.note}`;
                    this.state.currentSpeaker = message.payload.currentSpeaker;
                    this.renderComponent();
                    break;
                case "receive-close-application":
                    this.kosyApi.stopApp();
                    break;
                case "receive-end-turn":
                    this.endTurn();
                    this.state.currentSpeaker = message.payload.nextSpeaker;
                    if (this.state.currentSpeaker != null) {
                        this.resetTurn();
                    } else {
                        this.endInterval();
                        this.state.isPaused = null;
                        this.state.ended = true;
                        this.state.notes = null;
                    }
                    this.renderComponent();
                    break;
                case "receive-restart-round":
                    this.state.ended = null;
                    this.state.currentSpeaker = null;
                    this.state.notes = null;
                    this.state.isPaused = false;
                    this.resetMembers();
                    this.renderComponent();
                    break;
                case "receive-update-turn":
                    this.state.isPaused = message.payload;
                    this.renderComponent();
                    break;
                case "receive-update-timer":
                    if (!this.state.isPaused) {
                        this.state.timePassed += 1000.0;
                        this.renderComponent();
                    }
                    break;
            }
        }

        private processComponentMessage(message: ComponentMessage) {
            this.log("Message received as client: " + message.type);
            switch (message.type) {
                case "start-application":
                    //Notify all other clients that the round has started
                    this.kosyApi.relayMessage({ type: "receive-start-application", payload: { note: message.payload, currentSpeaker: null } });
                    break;
                case "close-application":
                    //Notify all other clients that the app has ended
                    this.kosyApi.relayMessage({ type: "receive-close-application" });
                    break;
                case "end-turn":
                    this.kosyApi.relayMessage({ type: "receive-end-turn", payload: { endedSpeaker: this.state.currentSpeaker, nextSpeaker: null } });
                    break;
                case "update-turn":
                    this.kosyApi.relayMessage({ type: "receive-update-turn", payload: message.payload });
                    break;
                case "update-timer":
                    this.kosyApi.relayMessage({ type: "receive-update-timer" });
                    break;
                case "restart-round":
                    this.kosyApi.relayMessage({ type: "receive-restart-round" });
                    break;
                default:
                    break;
            }
        }

        //Poor man's react, so we don't need to fetch the entire react library for this tiny app...
        private renderComponent() {
            render({
                notes: this.state.notes,
                currentClient: this.currentClient,
                initializer: this.initializer,
                members: this.state.members,
                currentSpeaker: this.state.currentSpeaker,
                isPaused: this.state.isPaused,
                ended: this.state.ended,
                timePassed: this.state.timePassed,
            }, (message) => this.processComponentMessage(message));
        }

        private log(...message: any) {
            console.log(`${this.currentClient?.clientName ?? "New user"} logged: `, ...message);
        }

        private sortMembers() {
            if (this.state.members.every(member => member.clientInfo.seatNumber === 0 || member.clientInfo.seatNumber > 0)) {
                let sortOrder = [0, 2, 6, 5, 9, 7, 3, 1, 8, 4];
                this.state.members.sort((a, b) => sortOrder.indexOf(a.clientInfo.seatNumber ?? 0) > sortOrder.indexOf(b.clientInfo.seatNumber ?? 0) ? 1 : -1);
            } else {
                this.state.members.sort((a, b) => a.clientInfo.clientUuid.localeCompare(b.clientInfo.clientUuid));
            }
        }

        //Add member to the table
        private addMember(clientInfo: ClientInfo) {
            this.state.members.push(new Member(clientInfo));
        }

        //Remove member from list when they leave the table
        private removeMember(clientUuid: string) {
            let member = this.state.members.find((m) => m.clientInfo.clientUuid == clientUuid);
            if (member != null) {
                let index = this.state.members.indexOf(member);
                this.state.members.splice(index, 1);
            }
        }

        //End turn for member
        private endTurn() {
            for (let index = 0; index < this.state.members.length; index++) {
                if (this.state.members[index].clientInfo.clientUuid == this.state.currentSpeaker.clientInfo.clientUuid) {
                    this.state.members[index].tookTurn = true;
                }
            }
        }

        private nextSpeaker(): Member {
            if (!this.haveAllMembersTakenTurn()) {
                return this.state.members.find(member => member.tookTurn == false);
            }

            return null;
        }

        //Check if there is any member that did not take turn yet
        private haveAllMembersTakenTurn(): boolean {
            return this.state.members.find(member => member.tookTurn == false) == null;
        }

        private resetMembers() {
            this.state.members.forEach((element) => element.tookTurn = false);
        }

        private resetTurn() {
            this.state.timePassed = 0;
            this.state.isPaused = false;
        }

        private startInterval() {
            this.log("Starting interval");
            this.currentInterval = window.setInterval(() => this.refreshElapsedTime(), 1000);
            this.log("Current interval: " + this.currentInterval);
        }

        private endInterval() {
            if (this.currentInterval) {
                this.log("Clearing interval");
                this.log("Current interval to clear: " + this.currentInterval);
                window.clearInterval(this.currentInterval);
            }
        }

        private refreshElapsedTime() {
            this.processComponentMessage({ type: "update-timer" });
        }
    }


    new App().start();
}