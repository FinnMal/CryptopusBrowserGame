const GAME_1_BACKGROUND_IMG = './assets/images/szene/game_1/background.png'

const TRASH_SPAWN_DELAY = 80

const GAME_1_CONFIG = {
    max_points: 1000,
    max_stars: 3,
    time: 60,
    tracker: [TRACKER_HEARTS, TRACKER_COINS_SIMPLE],
    tracker_max_value: [3, -1]
}

const STATE_RUNNING = 0
const STATE_DONE = 1
const STATE_STOPPED = 2


class LevelCollectTrash {
    constructor(master, octopus) {
        this.master = master
        this.octopus = octopus
        this.trash_green = new Trash(this, octopus, 'green')
        this.trash_yellow = new Trash(this, octopus, 'yellow')

        this.last_trash_spawned_before = TRASH_SPAWN_DELAY + 1
        this.visible_trash_elements = []

        this.running = false
    }

    getConfig() {
        return GAME_1_CONFIG
    }

    getOctopus() {
        return this.octopus
    }

    render() {
        // background
        this.background_img = PIXI.Sprite.from(GAME_1_BACKGROUND_IMG);
        container.addChild(this.background_img);

        this.octopus.setControlType(CONTROLTYPE_ALL)
        this.octopus.render(100, 100)
        this.octopus.scale(OCTOPUS_SCALE, OCTOPUS_SCALE)

        // trash
        this.trash_green.render()
        this.trash_yellow.render(VIEW_WIDTH * 0.7)

        this.running = true
        // this.onEvent(EVENT_STARS_TRACKER_FULL)
    }

    trackerRendered() {
        this.master.getTracker(TRACKER_HEARTS).set(3)
    }

    unmount() {
        this.stop()
        if (this.background_img)
            this.background_img.destroy()
        this.background_img = NaN
    }

    loop(delta) {
        if (this.running) {
            this.octopus.loop(delta)
            this.trash_green.loop(delta)
            this.trash_yellow.loop(delta)

            // add falling element
            this.last_trash_spawned_before += delta
            if (this.last_trash_spawned_before > TRASH_SPAWN_DELAY) {
                this.last_trash_spawned_before = 0

                var p = Math.random()
                if (p > FATAL_ITEM_SPAWN_PERCENTAGE / 100) {
                    var trash = new FallingElement(FALLING_ELEMENTS_IDS[Math.floor(Math.random() * FALLING_ELEMENTS_IDS.length)], this)
                }
                else {
                    // create fatal element
                    var trash = new FallingElement('seeigel', this)
                }

                trash.render()
                this.visible_trash_elements.push(trash)

                // render hearts
                var p = Math.random()
                if (p < HEART_ITEM_SPAWN_PERCENTAGE / 100) {
                    var heart = new FallingElement('heart', this)
                    heart.render()
                    this.visible_trash_elements.push(heart)
                }
            }

            this.visible_trash_elements.forEach(function (trash) {
                if (trash.isVisible())
                    trash.loop(delta)
                else
                    this.removeFromTrashList(trash)
            }.bind(this))
        }
    }

    removeFromTrashList(trash) {
        var index = this.visible_trash_elements.indexOf(trash);
        if (index !== -1) {
            this.visible_trash_elements.splice(index, 1);
        }
    }

    stop() {
        this.running = false

        this.octopus.unmount()

        if (this.trash_green)
            this.trash_green.unmount()
        if (this.trash_yellow)
            this.trash_yellow.unmount()

        this.visible_trash_elements.forEach(function (ele) {
            ele.unmount()
        }.bind(this))
        this.visible_trash_elements = []

        this.master.stop()

        var blurFilter = new PIXI.filters.BlurFilter();
        if (this.background_img)
            this.background_img.filters = [blurFilter]
    }

    onEvent(id) {
        if (id == EVENT_TRASH_PIECE_COLLECTED) {
            sound.play(SOUND_PICK_UP)
            this.master.getTracker(TRACKER_COINS_SIMPLE).add(1)
        }
        else if (id == EVENT_ITEM_OUT_OF_WORLD) {
            sound.play(SOUND_HEART_REMOVED)
            this.master.getTracker(TRACKER_HEARTS).remove(1)
        }
        else if (id == EVENT_CATCHED_FATAL_ITEM) {
            sound.play(SOUND_HEART_REMOVED_OUCH)
            this.master.getTracker(TRACKER_HEARTS).remove(1)
        }
        else if (id == EVENT_TRASH_PIECE_COLLECTED_WRONG) {
            sound.play(SOUND_WRONG_TRASH)
            this.master.getTracker(TRACKER_HEARTS).remove(1)
        }
        else if (id == EVENT_HEARTS_TRACKER_ZERO) {
            this.stop()
            const [stars, points] = this.master.calculateStarsAndPoints()
            this.master.showResult(false, stars, points, 'YOU DIED')
        }
        else if (id == EVENT_CATCHED_HEART) {
            sound.play(SOUND_HEART_ADDED)
            this.master.getTracker(TRACKER_HEARTS).add(1)
        }
    }
}