import { ClientInfo } from '@kosy/kosy-app-api/types';
import { Member } from './member';

export interface AppState {
    /// This state is only set once in this app
    notes?: string;
    members?: Array<Member>;
    currentSpeaker?: Member;
    timeTurnStarted?: Date;
    isPaused?: boolean;
    pausedTime?: number;
    ended?: boolean;
    pauseStartTime?: Date;
}

export interface ComponentState extends AppState {
    /// Immutable, represents the parent kosy client
    currentClient: ClientInfo;
    /// Immutable, represents the kosy client that started the app
    initializer: ClientInfo;
}