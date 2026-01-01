import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { GameBoard } from './components/GameBoard';

// Mock specific components if needed, or test integration
// For visual components like Modal/Toast, we can verify their presence via text query

describe('App Component', () => {
    it('renders the initial input screen', () => {
        render(<App />);
        expect(screen.getByText('Generate Teams')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Alice/)).toBeInTheDocument();
    });

    it('allows entering players and progressing to game', () => {
        render(<App />);
        const textarea = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie\nDave' } });

        const startButton = screen.getByText('Generate Teams');
        fireEvent.click(startButton);

        // Should move to Assignment Phase and eventually Game
        // Since logic sets teams immediately, we check for team names in inputs
        expect(screen.getByDisplayValue('Team Alpha')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Team Beta')).toBeInTheDocument();
    });
});

describe('GameBoard Logic', () => {
    // Mock props
    const mockProps = {
        categories: [
            {
                id: '1', title: 'Test Cat', questions: [
                    { id: 'q1', points: 100, text: 'Q1 Text', answer: 'A1', isAnswered: false, isDoubleJeopardy: false }
                ]
            }
        ],
        teams: [], // Can be empty for this test
        onUpdateTeam: vi.fn(),
        onSetActiveTeam: vi.fn(),
        onAddPlayerRequest: vi.fn(),
        pointsMultiplier: 1,
        onQuestionSelected: vi.fn(),
        onQuestionAnswered: vi.fn(),
    };

    it('renders categories and questions', () => {
        render(<GameBoard {...mockProps} />);
        expect(screen.getByText('Test Cat')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('opens rep selection modal on click', () => {
        render(<GameBoard {...mockProps} />);
        const questionBtn = screen.getByText('100');
        fireEvent.click(questionBtn);

        // Rep Selection Modal should appear first
        expect(screen.getByText(/Identify Representatives/i)).toBeInTheDocument();
    });
});
