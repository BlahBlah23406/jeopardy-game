import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FinalJeopardyGame } from './FinalJeopardyGame';
import { Team, Question } from '../types';

describe('FinalJeopardyGame Speech Synthesis', () => {
    let mockSpeak: ReturnType<typeof vi.fn>;
    let mockCancel: ReturnType<typeof vi.fn>;
    let capturedUtterance: SpeechSynthesisUtterance | null = null;

    beforeEach(() => {
        mockSpeak = vi.fn((utterance) => {
            capturedUtterance = utterance;
        });
        mockCancel = vi.fn();

        window.speechSynthesis = {
            speak: mockSpeak,
            cancel: mockCancel,
            resume: vi.fn(),
        } as unknown as SpeechSynthesis;

        window.SpeechSynthesisUtterance = vi.fn().mockImplementation(function (this: any, text: string) {
            this.text = text;
        }) as any;

        window.SpeechSynthesisEvent = vi.fn().mockImplementation(function (this: any, type: string, init: any) {
            this.type = type;
            this.utterance = init?.utterance;
        }) as any;

        capturedUtterance = null;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockTeams: Team[] = [
        { id: 't1', name: 'Team 1', score: 0, players: [{ id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }], playedPlayerIds: [], inventory: [] }
    ];

    const mockQuestions: Question[] = [
        { id: 'fj1', points: 0, text: 'This is the final jeopardy text.', answer: 'What is Final?', isAnswered: false, isDoubleJeopardy: false }
    ];

    it('should speak the final jeopardy question first and hide the text until speech ends', async () => {
        render(
            <FinalJeopardyGame
                teams={mockTeams}
                questions={mockQuestions}
                onUpdateTeam={vi.fn()}
                onGameEnd={vi.fn()}
            />
        );

        // Verify we are in SELECTION phase
        expect(screen.getByText('Captains, select your champion!')).toBeInTheDocument();

        // Select player 2 (since Captain is player 1)
        const player2Button = screen.getByText(/Player 2/);
        fireEvent.click(player2Button);

        // Confirm selection to start question
        const startButton = screen.getByText('Start Question');
        fireEvent.click(startButton);

        // Wait for setTimeout to execute Speak
        await waitFor(() => {
            expect(mockSpeak).toHaveBeenCalledTimes(1);
        }, { timeout: 1000 });

        expect(capturedUtterance).not.toBeNull();
        expect(capturedUtterance?.text).toBe('This is the final jeopardy text.');

        // Verify "Reading Question..." is shown and actual question text is NOT
        expect(screen.getByText('Reading Question...')).toBeInTheDocument();
        expect(screen.queryByText('This is the final jeopardy text.')).not.toBeInTheDocument();

        // Simulate speech end
        act(() => {
            if (capturedUtterance && capturedUtterance.onend) {
                capturedUtterance.onend(new window.SpeechSynthesisEvent('end', { utterance: capturedUtterance }));
            }
        });

        // Verify "Reading Question..." is gone and question text is now shown
        expect(screen.queryByText('Reading Question...')).not.toBeInTheDocument();
        expect(screen.getByText('This is the final jeopardy text.')).toBeInTheDocument();
    });
});
