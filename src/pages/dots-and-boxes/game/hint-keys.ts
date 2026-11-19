// Every hint the game screen can show under the turn and score: Game picks one, and GameStatus
// reserves the height of the tallest so the area never jumps (UP-5)
export const HINT_KEYS = {
  firstLine: 'game.hintFirstLine',
  start: 'game.hintStart',
  selected: 'game.hintSelected',
} as const
