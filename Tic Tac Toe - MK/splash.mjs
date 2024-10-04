import { ANSI } from './ansi.mjs';
const { RED, YELLOW, GREEN, BLUE } = ANSI.COLOR;

const ART = ` 

${BLUE} ______  ____   __      ______   ____    __      ______   ___     ___${ANSI.RESET}
${RED}|      ||    | /  ]    |      | /    |  /  ]    |      | /   \\   /  _]${ANSI.RESET}
${YELLOW}     |      | |  | /  /     |      ||  o  |   /     |      ||     |   ${ANSI.RESET}
${BLUE}|_|  |_| |  |/  /      |_|  |_||     |/  /      |_|  |_||  O  ||    _]${ANSI.RESET}
${YELLOW}  |  |   |  /   \\_       |  |  |  _  /   \\_       |  |  |     ||   [_${ANSI.RESET}
${RED}  |  |   |  \\     |      |  |  |  |  \\     |      |  |  |     ||     |${ANSI.RESET}
${YELLOW}  |__|  |____\\____|      |__|  |__|__|\\____|      |__|   \\___/ |_____|${ANSI.RESET}

`

function showSplashScreen() {
    console.log(ART);
}

export default showSplashScreen;
