// Source of message keys; uk.ts must have exactly the same shape (I18N-1)
const en = {
  app: {
    title: 'Dot Line Game',
  },
  language: {
    label: 'Language',
    uk: 'Українська',
    en: 'English',
  },
  setup: {
    title: 'Game Setup',
    player: 'Player {number}',
    playerName: 'Player {number} name',
    name: 'Name',
    color: 'Color',
    size: 'Size',
    save: 'Save',
  },
  validation: {
    invalid: '{field} is not valid.',
    differentNames: 'Values must be different',
  },
  game: {
    hintFirstLine: 'Pick any dot to start the first line.',
    hintSelected:
      'Pick a highlighted neighbor to draw the line. Pick the selected dot again to cancel.',
    hintStart: 'Pick a highlighted dot to start a line.',
    dotLabel: 'Dot row {row}, column {col}',
  },
  status: {
    turn: 'Turn',
    score: 'Score',
    stop: 'Stop',
    stopTitle: 'Stop the game?',
    stopText: 'Whoever owns more squares now wins.',
    cancel: 'Cancel',
    stopGame: 'Stop game',
  },
  result: {
    title: 'Result',
    wins: '{name} wins',
    draw: 'Draw',
    completed: 'All squares are filled.',
    stopped: 'The game was stopped.',
    score: 'Score',
    newGame: 'New game',
    rematch: 'Rematch',
  },
  rules: {
    title: 'How to play',
    show: 'Show rules',
    hide: 'Hide rules',
    step1: 'Take turns drawing a line between two neighboring dots: left, right, up or down.',
    step2: 'The first line can go anywhere. After that, start from a dot that already has a line.',
    step3: 'Draw the fourth side of a square to claim it. One line can claim two squares.',
    step4: 'After every line, the turn passes to the other player.',
    step5:
      'The game ends when all squares are claimed or someone presses Stop. Most squares wins; equal scores are a draw.',
  },
}

export default en
