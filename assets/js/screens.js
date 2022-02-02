const SCREEN_HOME = 'home'
const SCREEN_GAME = 'game'

const LEVEL_COLLECT_TRASH = 0
const LEVEL_COLLECT_STARS = 1
const LEVEL_JUMP_AND_RUN = 2

const NUMBER_OF_LEVELS = 3

const LEVEL_INFOS = [
    {
        name: "Collect Trash",
        screenshot: './assets/images/szene/menu/level_select/level_1.png',
        manual: './assets/images/szene/manual/level_1.png'
    },
    {
        name: "Collect Stars",
        screenshot: './assets/images/szene/menu/level_select/level_2.png',
        manual: './assets/images/szene/manual/level_2.png'
    },
    {
        name: "Jump & Run",
        screenshot: './assets/images/szene/menu/level_select/level_3.png',
        manual: './assets/images/szene/manual/level_3.png'
    }
]

class Screens {
    constructor() {
        this.home_screen = new HomeScreen(this);
        this.game_screen = new GameScreen(this);
    }

    loadScreen(name, infos = {}) {
        if (name == SCREEN_HOME) {
            this.game_screen.unmount()
            this.home_screen.render(infos)
        }
        else if (name == SCREEN_GAME) {
            this.home_screen.unmount()
            this.game_screen.render(infos)
        }
        else return false
    }

    loop(delta) {
        if (this.home_screen.isVisible()) this.home_screen.loop(delta)
        if (this.game_screen.isVisible()) this.game_screen.loop(delta)
    }
}


