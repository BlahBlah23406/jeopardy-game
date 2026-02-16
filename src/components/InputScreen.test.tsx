import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputScreen } from './InputScreen';

describe('InputScreen', () => {
    it('should render the title', () => {
        render(<InputScreen onStartGame={() => { }} />);
        expect(screen.getByText('Player Registration')).toBeInTheDocument();
    });

    it('should initially disable the generate button', () => {
        render(<InputScreen onStartGame={() => { }} />);
        const button = screen.getByRole('button', { name: /generate teams/i });
        expect(button).toBeDisabled();
    });

    it('should show helper text with current count', () => {
        render(<InputScreen onStartGame={() => { }} />);
        expect(screen.getByText(/0 \/ 4 required/)).toBeInTheDocument();
    });

    it('should call onStartGame with parsed player names when valid', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByLabelText(/enter player names/i);
        fireEvent.change(input, { target: { value: 'Alice\nBob\nCharlie\nDavid' } });

        expect(screen.getByText(/4 \/ 4 required/)).toBeInTheDocument();

        const button = screen.getByRole('button', { name: /generate teams/i });
        expect(button).toBeEnabled();
        fireEvent.click(button);

        expect(handleStartGame).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie', 'David']);
    });

    it('should handle comma separated names', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByLabelText(/enter player names/i);
        fireEvent.change(input, { target: { value: 'Alice, Bob, Charlie, David' } });

        const button = screen.getByRole('button', { name: /generate teams/i });
        expect(button).toBeEnabled();
        fireEvent.click(button);

        expect(handleStartGame).toHaveBeenCalledWith(['Alice', 'Bob', 'Charlie', 'David']);
    });

    it('should remain disabled if fewer than 4 players', () => {
        const handleStartGame = vi.fn();
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByLabelText(/enter player names/i);
        fireEvent.change(input, { target: { value: 'Alice\nBob' } });

        expect(screen.getByText(/2 \/ 4 required/)).toBeInTheDocument();

        const button = screen.getByRole('button', { name: /generate teams/i });
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleStartGame).not.toHaveBeenCalled();
    });
});
