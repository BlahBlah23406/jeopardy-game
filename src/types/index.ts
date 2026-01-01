export type GamePhase = 'SETUP' | 'INPUT' | 'ASSIGNMENT' | 'INTRO_RULES' | 'GAME' | 'FINAL_JEOPARDY_RULES' | 'DRAFTING' | 'FINAL_JEOPARDY' | 'WINNER';

export interface Player {
    id: string;
    name: string;
}

export interface Team {
    id: string;
    name: string;
    players: Player[];
    score: number;
    playedPlayerIds: string[];
    inventory: AdvantageCard[];
}

export type AdvantageCardType = 'DOUBLE_POINTS' | 'STEAL_SELECTION' | 'RESET_REP';

export interface AdvantageCard {
    id: string;
    type: AdvantageCardType;
    name: string;
    description: string;
}

export interface Question {
    id: string;
    points: number;
    text: string;
    answer: string;
    isAnswered: boolean;
    isDoubleJeopardy?: boolean;
    rewardCard?: AdvantageCardType;
    moreInfo?: string;
}

export interface Category {
    id: string;
    title: string;
    questions: Question[];
}
