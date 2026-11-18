import { onBeforeUnmount, readonly, ref, watch } from 'vue'
import { chooseComputerLine, type DotLineGame } from '@/models'

// a fixed pause so the computer's move is easy to follow, not a measure of real work (CM-15)
export const COMPUTER_DELAY_MS = 1000

/**
 * Plays the computer player's turns on the game screen. Whenever the game is playing and it's the
 * computer's turn (including a game just restored from storage, CM-31), it waits COMPUTER_DELAY_MS
 * and then draws the strategy's line through the normal `drawLine` (CM-20).
 *
 * `isThinking` is true while a move is pending: the board is locked then (CM-16), and #16 shows
 * "Thinking…" from it (CM-14). Call `cancel()` on Stop, Rematch and New game settings (CM-17); unmounting
 * cancels too. A finished game never schedules a move.
 *
 * While `paused()` is true (the Stop dialog or the rules panel is open) no move is pending; when it
 * turns false again the computer gets its full pause before moving (VC-13, VR-31).
 */
export function useComputerTurn(game: () => DotLineGame, paused: () => boolean) {
  const isThinking = ref(false)
  let pendingMove: ReturnType<typeof setTimeout> | null = null

  function cancel() {
    if (pendingMove !== null) clearTimeout(pendingMove)
    pendingMove = null
    isThinking.value = false
  }

  function move() {
    pendingMove = null
    isThinking.value = false
    const current = game()
    // a computer game always has a difficulty (the model defaults it)
    if (!current.isComputerTurn || !current.difficulty) return
    const line = chooseComputerLine(current, current.difficulty)
    if (line) current.drawLine(line)
  }

  // changes on every computer turn: null when it isn't one (or it's paused), else the number of
  // lines drawn so far
  watch(
    () => (game().isComputerTurn && !paused() ? game().lines.length : null),
    (turn) => {
      cancel()
      if (turn === null) return
      isThinking.value = true
      pendingMove = setTimeout(move, COMPUTER_DELAY_MS)
    },
    { immediate: true },
  )

  onBeforeUnmount(cancel)

  return { isThinking: readonly(isThinking), cancel }
}
