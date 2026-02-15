import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { TeamAssignment } from './TeamAssignment';
import { Team } from '../types';

// Variable must start with 'mock' to be accessible inside vi.mock factory due to hoisting
const mockCardRenderSpy = vi.fn();

vi.mock('./TeamAssignmentCard', async () => {
    const React = await import('react');
    const MockComponent = (props: any) => {
        mockCardRenderSpy(props.team.id);
        return <div data-testid={`card-${props.team.id}`}>{props.team.name}</div>;
    };
    // We must wrap the mock in memo to simulate the real component's behavior.
    // This allows us to verify that TeamAssignment is passing stable props.
    // If TeamAssignment passed unstable props, memo would re-render.
    return {
        TeamAssignmentCard: React.memo(MockComponent)
    };
});

describe('TeamAssignment Optimization', () => {
    afterEach(() => {
        cleanup();
        mockCardRenderSpy.mockClear();
    });

    it('optimizes re-renders when updating one team', () => {
        const teams: Team[] = [
            { id: '1', name: 'Team Alpha', players: [], score: 0, playedPlayerIds: [], inventory: [] },
            { id: '2', name: 'Team Beta', players: [], score: 0, playedPlayerIds: [], inventory: [] }
        ];

        const onUpdateTeam = vi.fn();
        const onConfirm = vi.fn();

        const { rerender } = render(
            <TeamAssignment
                teams={teams}
                onConfirm={onConfirm}
                onUpdateTeam={onUpdateTeam}
            />
        );

        // Initial render: 2 teams -> 2 calls
        expect(mockCardRenderSpy).toHaveBeenCalledTimes(2);

        // Simulate App state update: Change Team 1 name
        const newTeams = [
            { ...teams[0], name: 'Team A' }, // New object (changed)
            teams[1] // Same reference (unchanged)
        ];

        rerender(
            <TeamAssignment
                teams={newTeams}
                onConfirm={onConfirm}
                onUpdateTeam={onUpdateTeam}
            />
        );

        // Optimization Check:
        // Team 1 changed -> Should re-render (1 call)
        // Team 2 unchanged -> Should NOT re-render (0 calls)
        // Total expected calls: 2 + 1 = 3

        // If the parent was passing unstable props (e.g. inline Arrow function),
        // Team 2 would also re-render, resulting in 4 calls.
        expect(mockCardRenderSpy).toHaveBeenCalledTimes(3);

        // Verify specifically that Team 2 was NOT rendered in the second batch
        // The last call should be for Team 1
        expect(mockCardRenderSpy).toHaveBeenLastCalledWith('1');
    });
});
