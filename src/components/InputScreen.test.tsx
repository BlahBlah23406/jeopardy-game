import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputScreen } from './InputScreen';

describe('InputScreen', () => {
    it('should render the title', () => {
        render(<InputScreen onStartGame={() => { }} />);
        expect(screen.getByText('Player Registration')).toBeInTheDocument();
    });

    it('should call onStartGame with parsed player names', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(input, { target: { value: 'Alice\nBob\nCharlie\nDavid' } });

        const button = screen.getByText('Generate Teams');
        expect(button).not.toBeDisabled();
        fireEvent.click(button);

        expect(handleStartGame).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie', 'David']);
    });

    it('should handle comma separated names', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(input, { target: { value: 'Alice, Bob, Charlie, David' } });

        const button = screen.getByText('Generate Teams');
        expect(button).not.toBeDisabled();
        fireEvent.click(button);

        expect(handleStartGame).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie', 'David']);
    });

    it('should disable button if fewer than 4 players', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(input, { target: { value: 'Alice\nBob' } });

        // Button should be disabled and show remaining count
        const button = screen.getByText(/Add 2 more players/i);
        expect(button).toBeDisabled();

        fireEvent.click(button);

        expect(handleStartGame).not.toHaveBeenCalled();
    });
});
