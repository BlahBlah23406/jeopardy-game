import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FinalJeopardyGame } from './FinalJeopardyGame';
import { Team, Question } from '../types';

describe('FinalJeopardyGame Component', () => {
    const mockTeams: Team[] = [
        { id: 't1', name: 'Team 1', score: 0, players: [{ id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }], playedPlayerIds: [], inventory: [] }
    ];

    const mockQuestions: Question[] = [
        { id: 'fj1', points: 0, text: 'This is the final jeopardy text.', answer: 'What is Final?', isAnswered: false, isDoubleJeopardy: false }
    ];

    it('should proceed through selection, question and reveal phases', () => {
        render(
            <FinalJeopardyGame
                teams={mockTeams}
                questions={mockQuestions}
                onUpdateTeam={vi.fn()}
                onGameEnd={vi.fn()}
            />
        );

        // Selection Phase
        expect(screen.getByText('Captains, select your champion!')).toBeInTheDocument();

        // Select player 2 (since Captain is player 1)
        const player2Button = screen.getByText(/Player 2/);
        fireEvent.click(player2Button);

        // Confirm selection to start question
        const startButton = screen.getByText('Start Question');
        fireEvent.click(startButton);

        // Question Phase
        expect(screen.getByText('This is the final jeopardy text.')).toBeInTheDocument();
        const revealButton = screen.getByText('Reveal Answer');
        fireEvent.click(revealButton);

        // Reveal Phase
        expect(screen.getByText('What is Final?')).toBeInTheDocument();
        expect(screen.getByText('✓')).toBeInTheDocument();
        expect(screen.getByText('✗')).toBeInTheDocument();
    });
});
