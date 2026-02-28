import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameBoard } from './GameBoard';
import { Category, Team } from '../types';

describe('GameBoard Speech Synthesis', () => {
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
        } as unknown as SpeechSynthesis;

        window.SpeechSynthesisUtterance = vi.fn().mockImplementation(function (this: any, text: string) {
            this.text = text;
        }) as any;

        window.SpeechSynthesisEvent = vi.fn().mockImplementation(function (this: any, type: string, init: any) {
            this.type = type;
            this.utterance = init?.utterance;
        }) as any;

        // Mock global Audio to prevent errors when clicking questions
        window.Audio = vi.fn().mockImplementation(() => ({
            play: vi.fn().mockResolvedValue(undefined),
            pause: vi.fn(),
        })) as any;

        capturedUtterance = null;
    });

    const mockCategories: Category[] = [
        {
            id: 'cat1',
            title: 'Test Category',
            questions: [
                { id: 'q1', points: 100, text: 'This is the question text.', answer: 'What is Test?', isAnswered: false, isDoubleJeopardy: false },
            ]
        }
    ];

    const mockTeams: Team[] = [
        { id: 't1', name: 'Team 1', score: 0, players: [{ id: 'p1', name: 'Player 1' }], playedPlayerIds: [], inventory: [] }
    ];

    it('should speak the question first and hide the text until speech ends', async () => {
        render(
            <GameBoard
                categories={mockCategories}
                teams={mockTeams}
                onUpdateTeam={vi.fn()}
                onSetActiveTeam={vi.fn()}
                onAddPlayerRequest={vi.fn()}
                pointsMultiplier={1}
                onQuestionSelected={vi.fn()}
                onQuestionAnswered={vi.fn()}
            />
        );

        // Click the question to open modal
        const questionButton = screen.getByText('100');
        fireEvent.click(questionButton);

        // At this point, it might ask for team rep selection if not double jeopardy/advantage,
        // Wait, looking at GameBoard.tsx, normal questions set `isSelectingRep` to true,
        // and doesn't set `activeQuestion` until after rep is selected.
        // Let's select the rep to reveal the question modal.
        const playerSelectButton = await screen.findByText('Player 1');
        fireEvent.click(playerSelectButton);

        // Confirm rep selection to proceed to QuestionModalContent
        const startButton = screen.getByText('Reveal Question');
        fireEvent.click(startButton);

        // Now the QuestionModalContent should be rendered
        // Verify speaking state
        expect(mockSpeak).toHaveBeenCalledTimes(1);
        expect(capturedUtterance).not.toBeNull();
        expect(capturedUtterance?.text).toBe('This is the question text.');

        // Verify "Reading Question..." is shown and actual question text is NOT
        expect(screen.getByText('Reading Question...')).toBeInTheDocument();
        expect(screen.queryByText('This is the question text.')).not.toBeInTheDocument();

        // Simulate speech end
        act(() => {
            if (capturedUtterance && capturedUtterance.onend) {
                capturedUtterance.onend(new window.SpeechSynthesisEvent('end', { utterance: capturedUtterance }));
            }
        });

        // Verify "Reading Question..." is gone and question text is now shown
        expect(screen.queryByText('Reading Question...')).not.toBeInTheDocument();
        expect(screen.getByText('This is the question text.')).toBeInTheDocument();
    });
});
