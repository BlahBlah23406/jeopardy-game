import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { GameBoard } from './components/GameBoard';

// Mock scrollIntoView since jsdom doesn't support it
window.HTMLElement.prototype.scrollIntoView = function() {};

describe('App Component', () => {
    it('navigates to input screen and handles player entry', async () => {
        render(<App />);

        // 1. Setup Phase
        const continueSetupBtn = screen.getByText(/Continue to Players/i);
        fireEvent.click(continueSetupBtn);

        // 2. Input Phase
        // Initially button should be disabled and show count
        expect(screen.getByText(/Add 4 more players/i)).toBeInTheDocument();

        const textarea = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie\nDave' } });

        // Now button should be enabled and say Generate Teams
        const startButton = screen.getByText('Generate Teams');
        expect(startButton).not.toBeDisabled();
        fireEvent.click(startButton);

        // 3. Assignment Phase
        // Use getByDisplayValue because Team Alpha is in an input field
        await waitFor(() => {
            expect(screen.getByDisplayValue('Team Alpha')).toBeInTheDocument();
        });
    });
});

describe('GameBoard Logic', () => {
    // Mock props
    const mockProps = {
        categories: [
            {
                id: '1', title: 'Test Cat', questions: [
                    { id: 'q1', points: 100, text: 'Q1 Text', answer: 'A1', isAnswered: false, moreInfo: '' }
                ]
            }
        ],
        teams: [
             { id: 't1', name: 'Team 1', players: [], score: 0, playedPlayerIds: [], inventory: [] }
        ],
        onUpdateTeam: vi.fn(),
        onSetActiveTeam: vi.fn(),
        onAddPlayerRequest: vi.fn(),
        pointsMultiplier: 1,
        onQuestionSelected: vi.fn(),
        onQuestionAnswered: vi.fn(),
    };

    it('renders categories and questions (hidden initially)', () => {
        render(<GameBoard {...mockProps} />);
        // Categories are initially hidden
        expect(screen.getByText('???')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });
});
