import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameBoard } from './GameBoard';
import { Category, Team } from '../types';

describe('GameBoard Component', () => {
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

    it('should render categories and questions correctly', () => {
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

        // Category is hidden initially (rendered as "???")
        expect(screen.getByText('???')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should open representative selection modal when a question is clicked', async () => {
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

        const questionButton = screen.getByText('100');
        fireEvent.click(questionButton);

        // Header for Rep Selection is "Identify Representatives"
        expect(screen.getByText('Identify Representatives')).toBeInTheDocument();
        expect(screen.getByText('Player 1')).toBeInTheDocument();
    });
});
