import type { Player } from './player.model'
import { computerColorFor } from '@/utils/computer-color'

// The computer player is always the second player, stored under this fixed internal name (ADR-0001).
// It's never shown: the UI goes through the display helper (`useDisplayName`), which translates it.
// It's longer than the 15-character name limit (GS-1), so a person can't type it.
export const COMPUTER_NAME = '__computer_player__'

export function isComputerPlayer(name: string | null | undefined): boolean {
  return name === COMPUTER_NAME
}

/** The computer player for a Versus computer game, colored far from the person's color (CM-9). */
export function createComputerPlayer(personColor: string | null | undefined): Player {
  return { name: COMPUTER_NAME, color: computerColorFor(personColor) }
}
