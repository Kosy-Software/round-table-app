import { Member } from "./lib/member";
import { ClientInfo } from "@kosy/kosy-app-api/types";
import { ComponentMessage } from "./lib/appMessages";

export class RoundManager {
    public members = new Array<Member>();
    public currentSpeaker: Member;
    public timeTurnStarted: Date;
    public isPaused: boolean;
    public pausedTime: number;

    private currentInterval: number;

    public constructor(members?: Array<Member>, timeTurnStarted?: Date, isPaused?: boolean, pausedTime?: number) {
        if (members) {
            this.members = members;
        }
        if (timeTurnStarted) {
            this.timeTurnStarted = timeTurnStarted;
        }
        if (isPaused) {
            this.isPaused = isPaused;
        }
        if (pausedTime) {
            this.pausedTime = pausedTime;
        }
        this.currentSpeaker = this.members.find(member => member.tookTurn == false);
    }

    public startRound(dispatch: ((msg: ComponentMessage) => any)) {
        this.currentSpeaker = this.members[0];
        this.startTurn(dispatch);
    }

    //Add member to the table
    public addMember(clientInfo: ClientInfo) {
        this.members.push(new Member(clientInfo));
    }

    //Remove member from list when they leave the talbe
    public removeMember(clientUuid: string) {
        var member: Member;

        for (let index = 0; index < this.members.length; index++) {
            if (clientUuid == this.members[index].clientInfo.clientUuid) {
                member = this.members[index];
                return;
            }
        }

        var index: number;
        if (member != null) {
            index = this.members.indexOf(member);
            this.members.splice(index, 1);
        }
    }

    //End turn for member
    public endTurn(dispatch: ((msg: ComponentMessage) => any)) {
        clearInterval(this.currentInterval);

        this.timeTurnStarted = null;
        this.currentSpeaker.tookTurn = true;

        var index: number;
        if (this.currentSpeaker != null) {
            index = this.members.indexOf(this.currentSpeaker);
            this.members.splice(index, 1, this.currentSpeaker);
        }

        if (!this.haveAllMembersTakenTurn()) {
            this.currentSpeaker = this.members.find(member => member.tookTurn == false);
            this.startTurn(dispatch);
        } else {
            this.currentSpeaker = null;
        }
    }

    //Check who is next speaker
    public getNextSpeaker(): Member {
        return this.members.find(member => member.tookTurn == false && member != this.currentSpeaker);
    }

    //Check if there is any member that did not take turn yet
    public haveAllMembersTakenTurn(): boolean {
        return this.members.find(member => member.tookTurn == false) == null;
    }

    private startTurn(dispatch: ((msg: ComponentMessage) => any)) {
        this.timeTurnStarted = new Date();
        this.pausedTime = 0;
        this.isPaused = false;
        //Every second ask to update time
        this.currentInterval = window.setInterval(() => this.refreshElapsedTime(dispatch), 1000);
    }

    private refreshElapsedTime(dispatch: ((msg: ComponentMessage) => any)) {
        dispatch({ type: "update-timer" });
    }
}