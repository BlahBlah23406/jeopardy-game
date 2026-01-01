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

    it('should alert if fewer than 4 players', () => {
        const handleStartGame = vi.fn();
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
        render(<InputScreen onStartGame={handleStartGame} />);

        const input = screen.getByPlaceholderText(/Alice/);
        fireEvent.change(input, { target: { value: 'Alice\nBob' } });

        const button = screen.getByText('Generate Teams');
        fireEvent.click(button);

        expect(alertMock).toHaveBeenCalledWith('Please enter at least 4 players!');
        expect(handleStartGame).not.toHaveBeenCalled();
        alertMock.mockRestore();
    });
});
