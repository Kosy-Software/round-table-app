import './styles/style.scss';

import { AppMessage, ComponentMessage } from './lib/appMessages';
import { AppState } from './lib/appState';
import { render } from './views/renderState';
import { ClientInfo } from '@kosy/kosy-app-api/types';
import { KosyApi } from '@kosy/kosy-app-api';
import { RoundManager } from "./round_manager";

module Kosy.Integration.Round {
    export class App {
        private state: AppState = { notes: null, roundManager: null };
        private initializer: ClientInfo;
        private currentClient: ClientInfo;

        private kosyApi = new KosyApi<AppState, AppMessage>({
            onClientHasJoined: (client) => this.onClientHasJoined(client),
            onClientHasLeft: (clientUuid) => this.onClientHasLeft(clientUuid),
            onReceiveMessage: (message) => this.processMessage(message),
            onRequestState: () => this.getState(),
            onProvideState: (newState: AppState) => this.setState(newState)
        })

        public async start() {
            let initialInfo = await this.kosyApi.startApp();
            this.initializer = initialInfo.clients[initialInfo.initializerClientUuid];
            this.currentClient = initialInfo.clients[initialInfo.currentClientUuid];
            this.state = initialInfo.currentAppState ?? this.state;
            if (this.state.roundManager == null) {
                this.state.roundManager = new RoundManager((message) => this.processComponentMessage(message));
                this.state.roundManager.addMember(this.currentClient);
            } else {
                this.state.roundManager = new RoundManager((message) => this.processComponentMessage(message), this.state.roundManager.members);
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
            if (this.currentClient != null && this.initializer != null) {
                this.state.roundManager.addMember(client);
            }
        }

        public onClientHasLeft(clientUuid: string) {
            if (this.currentClient.clientUuid === this.initializer.clientUuid) {
                this.state.roundManager.removeMember(clientUuid);
            }
            if (clientUuid === this.initializer.clientUuid && !this.state.notes) {
                this.kosyApi.stopApp();
            }
        }

        public processMessage(message: AppMessage) {
            switch (message.type) {
                case "receive-start-application":
                    this.state.notes = `${message.payload}`;
                    if (this.currentClient.clientUuid == this.initializer.clientUuid) {
                        this.state.roundManager.startRound();
                    }
                    this.renderComponent();
                    break;
                case "receive-end-turn":
                    this.state.roundManager.endTurn();
                    if (!this.state.roundManager.haveAllMembersTakenTurn()) {
                        this.renderComponent();
                    } else {
                        this.kosyApi.stopApp();
                    }
                    break;
                case "receive-update-turn":
                    this.state.roundManager.isPaused = !this.state.roundManager.isPaused;
                    this.renderComponent();
                    break;
                case "receive-update-timer":
                    this.renderComponent();
                    break;
            }
        }

        private processComponentMessage(message: ComponentMessage) {
            switch (message.type) {
                case "start-application":
                    //Notify all other clients that the round has started
                    this.kosyApi.relayMessage({ type: "receive-start-application", payload: message.payload });
                    break;
                case "end-turn":
                    this.kosyApi.relayMessage({ type: "receive-end-turn" });
                    break;
                case "update-turn":
                    this.kosyApi.relayMessage({ type: "receive-update-turn", payload: message.payload });
                    break;
                case "update-timer":
                    this.kosyApi.relayMessage({ type: "receive-update-timer" });
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
                roundManager: this.state.roundManager,
            }, (message) => this.processComponentMessage(message));
        }

        private log(...message: any) {
            console.log(`${this.currentClient?.clientName ?? "New user"} logged: `, ...message);
        }
    }

    new App().start();
}