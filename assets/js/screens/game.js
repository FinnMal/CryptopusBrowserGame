const EVENT_TRASH_PIECE_COLLECTED = 0

const EVENT_HEARTS_TRACKER_FULL = 1
const EVENT_COUNTDOWN_ENDED = 2
const EVENT_STARS_TRACKER_FULL = 3
const EVENT_STAR_COLLECTED = 4
const EVENT_COIN_COLLECTED = 5
const EVENT_OCTOPUS_DIED = 6
const EVENT_COINS_TRACKER_FULL = 7
const EVENT_ITEM_OUT_OF_WORLD = 8
const EVENT_CATCHED_FATAL_ITEM = 9

const EVENT_HEARTS_TRACKER_ZERO = 10
const EVENT_STARS_TRACKER_ZERO = 11
const EVENT_COINS_TRACKER_ZERO = 12

const EVENT_TRASH_PIECE_COLLECTED_WRONG = 13
const EVENT_CATCHED_HEART = 14

const FALLING_ELEMENT_SPEED = 5
const FALLING_ELEMENT_MARGIN_LEFT = 190
const FALLING_ELEMENT_MARGIN_RIGHT = 400

const FATAL_ITEM_SPAWN_PERCENTAGE = 30
const HEART_ITEM_SPAWN_PERCENTAGE = 10

const OCTOPUS_SCALE = 0.9

class GameScreen {
    constructor(screen_handler) {
        this.cur_level = NaN
        this.visible = false
        this.screen_handler = screen_handler
        this.render_infos = {}
        this.tracker_list = []

        this.current_manual = NaN
    }

    restart(do_unmount = true) {
        if (do_unmount)
            this.unmount()
        this.cur_level = NaN
        this.visible = false

        if (this.resultBoard)
            this.resultBoard.unmount()
        this.resultBoard = NaN

        this.render(this.render_infos)
    }

    startNextGame() {
        this.unmount()

        this.cur_level = NaN
        this.visible = false

        if (this.resultBoard)
            this.resultBoard.unmount()
        this.resultBoard = NaN

        let next_level_id = this.render_infos['level_id'] + 1
        if (0 > next_level_id || next_level_id > NUMBER_OF_LEVELS - 1) next_level_id = 0
        this.render_infos['level_id'] = next_level_id
        this.render(this.render_infos)
    }

    render(infos) {
        this.render_infos = infos
        if (infos['level_id'] == LEVEL_COLLECT_TRASH)
            this.cur_level = new LevelCollectTrash(this, infos['octopus'])
        else if (infos['level_id'] == LEVEL_COLLECT_STARS)
            this.cur_level = new LevelCollectStars(this, infos['octopus'])
        else if (infos['level_id'] == LEVEL_JUMP_AND_RUN)
            this.cur_level = new LevelJumpAndRun(this, infos['octopus'])
        else
            this.cur_level = new LevelCollectTrash(this, infos['octopus'])

        this.cur_level.render()

        // render buttons
        let btn_x = VIEW_WIDTH * 0.88
        let btn_y = VIEW_HEIGHT * 0.897
        this.retry_btn = new Button(BUTTON_RETRY, () => this.restart())
        this.retry_btn.render(btn_x, btn_y)

        this.overview_btn = new Button(BUTTON_OVERVIEW, () => this.showOverview())
        this.overview_btn.render(btn_x + 60, btn_y)

        // render point tracker
        let tracker_x = VIEW_WIDTH * 0.845
        let tracker_y = 30

        this.tracker_list = []

        var i = 0
        this.cur_level.getConfig()['tracker'].forEach(function (tracker_id) {
            const tracker = new Tracker(tracker_id, this.cur_level, this.cur_level.getConfig()['tracker_max_value'][i])
            tracker.render(tracker_x, tracker_y)
            this.tracker_list.push(tracker)

            tracker_y += 80
            i = i + 1
        }.bind(this))

        this.visible = true

        if (this.cur_level.trackerRendered)
            this.cur_level.trackerRendered()

        this.visible = true
    }

    unmount() {
        if (this.cur_level) {
            this.cur_level.unmount()
            this.retry_btn.unmount()
            this.overview_btn.unmount()
        }

        this.tracker_list.forEach(function (tracker) {
            tracker.unmount()
        })

        if (this.resultBoard) {
            this.resultBoard.unmount()
            this.resultBoard = NaN
        }
    }

    isVisible() {
        return this.visible
    }

    loop(delta) {
        if (this.cur_level) this.cur_level.loop(delta)
        if (this.resultBoard) this.resultBoard.loop(delta)
    }

    getTracker(id) {
        return this.tracker_list[this.cur_level.getConfig()['tracker'].indexOf(id)]
    }

    showResult(won, stars, points, result_text = false) {
        if (this.resultBoard) this.resultBoard.unmount()
        this.resultBoard = new ResultBoard(this, won, stars, points, result_text)
        this.resultBoard.render()
    }

    stop() {
        this.retry_btn.unmount()
        this.overview_btn.unmount()

        this.tracker_list.forEach(function (tracker) {
            tracker.unmount()
        })
    }

    showOverview() {
        this.unmount()
        this.screen_handler.loadScreen(SCREEN_HOME, { screen: SCREEN_LEVEL_SELECT, octopus: this.render_infos['octopus'] })
    }

    calculateStarsAndPoints() {
        const tracker = this.getTracker(TRACKER_COINS_SIMPLE)
        let coins = tracker.get()
        let stars = 1
        if (coins >= 50)
            stars = 3
        else if (coins >= 20)
            stars = 2
        return [stars, coins]
    }

    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    getItemSpawnXPos() {
        return this.getRandomInRange(FALLING_ELEMENT_MARGIN_LEFT, VIEW_WIDTH - FALLING_ELEMENT_MARGIN_RIGHT)
    }
}