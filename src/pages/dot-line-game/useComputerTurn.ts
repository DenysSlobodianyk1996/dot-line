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
 * "Thinking…" from it (CM-14). Call `cancel()` on Stop, Rematch and New game (CM-17); unmounting
 * cancels too. A finished game never schedules a move.
 */
export function useComputerTurn(game: () => DotLineGame, delay = COMPUTER_DELAY_MS) {
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
    if (!current.isComputerTurn) return
    const line = chooseComputerLine(current, current.difficulty ?? 'easy')
    if (line) current.drawLine(line.from, line.to)
  }

  // changes on every computer turn: null when it isn't one, else the number of lines drawn so far
  watch(
    () => (game().isComputerTurn ? game().lines.length : null),
    (turn) => {
      cancel()
      if (turn === null) return
      isThinking.value = true
      pendingMove = setTimeout(move, delay)
    },
    { immediate: true },
  )

  onBeforeUnmount(cancel)

  return { isThinking: readonly(isThinking), cancel }
}
