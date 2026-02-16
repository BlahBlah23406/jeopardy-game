import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamAssignment } from './TeamAssignment';
import { Team } from '../types';

describe('TeamAssignment', () => {
    const mockTeams: Team[] = [
        { id: '1', name: 'Team Alpha', players: [{id: 'p1', name: 'Player 1'}], score: 0, playedPlayerIds: [], inventory: [] },
        { id: '2', name: 'Team Beta', players: [], score: 0, playedPlayerIds: [], inventory: [] },
    ];
    const mockOnUpdateTeam = vi.fn();
    const mockOnConfirm = vi.fn();

    it('renders team names correctly', () => {
        render(
            <TeamAssignment
                teams={mockTeams}
                onConfirm={mockOnConfirm}
                onUpdateTeam={mockOnUpdateTeam}
            />
        );
        expect(screen.getByDisplayValue('Team Alpha')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Team Beta')).toBeInTheDocument();
    });

    it('calls onUpdateTeam when name is changed', () => {
        render(
            <TeamAssignment
                teams={mockTeams}
                onConfirm={mockOnConfirm}
                onUpdateTeam={mockOnUpdateTeam}
            />
        );
        const input = screen.getByDisplayValue('Team Alpha');
        fireEvent.change(input, { target: { value: 'New Name' } });
        expect(mockOnUpdateTeam).toHaveBeenCalledWith('1', { name: 'New Name' });
    });
});
