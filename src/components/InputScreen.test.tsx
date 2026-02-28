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
        fireEvent.click(button);

        expect(handleStartGame).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie', 'David']);
    });

    it('should handle comma separated names', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(input, { target: { value: 'Alice, Bob, Charlie, David' } });

        const button = screen.getByText('Generate Teams');
        fireEvent.click(button);

        expect(handleStartGame).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie', 'David']);
    });

    it('should disable button if fewer than 4 players', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(input, { target: { value: 'Alice\nBob' } });

        const button = screen.getByText('Generate Teams');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleStartGame).not.toHaveBeenCalled();
    });

    it('should display correct player count and validation status', () => {
        render(<InputScreen onStartGame={() => { }} />);

        const input = screen.getByPlaceholderText(/Alice/);

        // Initial state
        expect(screen.getByText(/0 players entered/)).toBeInTheDocument();
        expect(screen.getByText(/minimum 4 required/)).toBeInTheDocument();

        // Update input
        fireEvent.change(input, { target: { value: 'Alice\nBob' } });
        expect(screen.getByText(/2 players entered/)).toBeInTheDocument();

        // Valid input
        fireEvent.change(input, { target: { value: 'Alice\nBob\nCharlie\nDavid' } });
        expect(screen.getByText(/4 players entered/)).toBeInTheDocument();
        expect(screen.queryByText(/minimum 4 required/)).not.toBeInTheDocument();
    });
});
