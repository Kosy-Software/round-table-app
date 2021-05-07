import { Member } from "./lib/member";
import { ClientInfo } from "@kosy/kosy-app-api/types";

export class RoundManager {
    public members = new Array<Member>();
    public currentSpeaker: Member;

    public constructor(members?: Array<Member>, currentSpeaker?: Member) {
        if (members) {
            this.members = members;
        }
        this.currentSpeaker = this.members.find(member => member.tookTurn == false);
    }

    public startRound() {
        this.currentSpeaker = this.members[0];
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
    public endTurn() {
        this.currentSpeaker.tookTurn = true;

        var index: number;
        if (this.currentSpeaker != null) {
            index = this.members.indexOf(this.currentSpeaker);
            this.members.splice(index, 1, this.currentSpeaker);
        }

        if (!this.haveAllMembersTakenTurn()) {
            this.currentSpeaker = this.members.find(member => member.tookTurn == false);
        } else {
            this.currentSpeaker = null;
        }
    }

    public getNextSpeaker(): Member {
        return this.members.find(member => member.tookTurn == false && member != this.currentSpeaker);
    }

    //Check if there is any member that did not take turn yet
    public haveAllMembersTakenTurn(): boolean {
        return this.members.find(member => member.tookTurn == false) == null;
    }
}