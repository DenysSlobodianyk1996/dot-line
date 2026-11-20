// Source of message keys; uk.ts must have exactly the same shape (I18N-1)
const en = {
  app: {
    title: 'Dots and Boxes',
    // header name, the bold name in GameGoal and the install manifest short_name (NG-1, NG-7)
    shortName: 'Dots and Boxes',
  },
  // the language button's label, read in the language it switches to: each locale names the
  // switch to itself (NG-4)
  language: {
    switchTo: 'Switch to English',
  },
  // the theme button names the theme it switches to (VR-16)
  theme: {
    light: 'Light theme',
    dark: 'Dark theme',
  },
  // the setup screen's footer (FT-1, FT-3)
  footer: {
    privacy: 'Privacy',
    contact: 'Contact',
  },
  // the privacy policy: the in-app screen and the static store page share it (AR-15, PV-1)
  privacy: {
    title: 'Privacy policy',
    updated: 'Updated:',
    // the app's version under the date (PV-5)
    version: 'Version:',
    noDataTitle: 'No personal data',
    noData:
      'The app does not collect any personal data. It does not send data to any server, store data remotely or share data with anyone.',
    onDeviceTitle: 'What stays on your device',
    onDevice:
      'To let you continue later, the app saves the current game, the language, the theme, the game mode and the difficulty on your device only. Removing the app or clearing its data deletes them.',
    noAdsTitle: 'No ads, analytics, accounts or permissions',
    noAds:
      'The app shows no ads, uses no analytics or tracking, needs no account and asks for no device permissions.',
    childrenTitle: 'Children',
    children:
      'The app is suitable for children. Because it collects nothing, it collects nothing from children either.',
    contactTitle: 'Contact',
    contactIntro: 'Questions about this policy or the app:',
    email: 'Email:',
    developerTitle: 'Developer',
    createdBy: 'Created by Denys Slobodianyk',
    back: 'Back to the game',
    openGame: 'Open the game',
  },
  setup: {
    title: 'Settings',
    player: 'Player {number}',
    playerName: 'Player {number} name',
    name: 'Name',
    color: 'Color',
    size: 'Size',
    sizeHint: 'From {min} to {max}',
    save: 'Save',
    mode: 'Game mode',
    modeComputer: 'Versus computer',
    modeTwoPlayers: 'Two players',
    you: 'You',
    opponent: 'Opponent',
    difficulty: 'Difficulty',
    easy: 'Easy',
    normal: 'Normal',
    easyHint: 'The computer picks a random line.',
    normalHint: 'The computer takes squares whenever it can and tries not to give you any.',
  },
  colors: {
    coral: 'Coral',
    teal: 'Teal',
    sunflower: 'Sunflower',
    sky: 'Sky',
    lavender: 'Lavender',
    leaf: 'Leaf',
    berry: 'Berry',
    tangerine: 'Tangerine',
    // validation: the other player already has this swatch (VR-36)
    taken: 'This color is already taken',
  },
  players: {
    computer: 'Computer',
  },
  validation: {
    invalid: '{field} is not valid.',
    maxLength: '{field} can be at most {length} characters.',
    computerName: 'This name belongs to the computer',
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
    yourTurn: 'Your turn',
    thinking: 'Thinking…',
    // announced politely after the computer's line (CM-37)
    computerDrew: 'Computer drew a line',
    computerClaimedOne: 'Computer drew a line and claimed a square',
    computerClaimedTwo: 'Computer drew a line and claimed two squares',
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
    youWon: 'You won!',
    computerWon: 'Computer won',
    draw: 'Draw',
    completed: 'All squares are filled.',
    stopped: 'The game was stopped.',
    score: 'Score',
    settings: 'Settings',
    rematch: 'Rematch',
  },
  rules: {
    title: 'How to play',
    open: 'Rules',
    close: 'Close rules',
    // the game's goal, first on setup and in the rules panel; {name} is the bold game name (NG-5, NG-7)
    goal: '{name} — whoever owns more squares when the board is full wins.',
    howToPlay: 'How to play →',
    step1: 'Take turns drawing a line between two neighboring dots: left, right, up or down.',
    step2: 'The first line can go anywhere. After that, start from a dot that already has a line.',
    step3: 'Draw the fourth side of a square to claim it. One line can claim two squares.',
    step4: 'After every line, the turn passes to the other player.',
    step5:
      'The game ends when all squares are claimed or someone presses Stop. Most squares wins; equal scores are a draw.',
    // the still storyboard under the steps (RL-7); captions must stay true to the rules (RL-5)
    storyboard: {
      title: 'In pictures',
      frame1: 'The first line goes anywhere.',
      frame2: 'Next lines start from a drawn one: pick a dot, then a neighbor.',
      frame3: 'Draw the fourth side and the square is yours.',
      frame4: 'One line can close two squares.',
    },
  },
}

export default en
