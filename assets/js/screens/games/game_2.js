
const STAR_SPAWN_DELAY = 45

const GAME_2_CONFIG = {
    max_points: 1000,
    max_stars: 3,
    time: 60,
    background_img: './assets/images/szene/game_2/background.png',
    tracker: [TRACKER_STARS, TRACKER_HEARTS, TRACKER_COINS_SIMPLE],
    tracker_max_value: [3, 3, -1]
}


class LevelCollectStars {
    constructor(master, octopus) {
        this.master = master
        this.octopus = octopus
        this.last_star_spawned_before = STAR_SPAWN_DELAY + 1
        this.visible_stars = []
        this.running = false
        //this.countdown = new Countdown(this, GAME_2_CONFIG['time'])
    }

    getConfig() {
        return GAME_2_CONFIG
    }

    render() {
        // background
        this.background_img = PIXI.Sprite.from(GAME_2_CONFIG['background_img']);
        container.addChild(this.background_img);

        this.octopus.setControlType(CONTROLTYPE_LEFT_RIGHT)
        this.octopus.render(VIEW_WIDTH * 0.45, VIEW_HEIGHT * 0.7)
        this.octopus.scale(OCTOPUS_SCALE, OCTOPUS_SCALE)

        let ele = new CatchedElement(CATCHED_NET, this.octopus)
        ele.render()
        this.octopus.setCatchedElement(ele)

        this.running = true
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

            // spawn star
            this.last_star_spawned_before += delta
            if (this.last_star_spawned_before > STAR_SPAWN_DELAY) {
                this.last_star_spawned_before = 0

                var p = Math.random()
                if (p > FATAL_ITEM_SPAWN_PERCENTAGE / 100) {
                    var item = new Star(this, this.octopus)
                }
                else {
                    // create fatal element
                    var item = new FallingElement('seeigel', this, true)
                }

                item.render()
                this.visible_stars.push(item)

                // render hearts
                var p = Math.random()
                if (p < HEART_ITEM_SPAWN_PERCENTAGE / 100) {
                    var heart = new FallingElement('heart', this)
                    heart.render()
                    this.visible_stars.push(heart)
                }
            }

            this.visible_stars.forEach(function (star) {
                if (star.isVisible())
                    star.loop(delta)
                else
                    this.removeFromStarList(star)
            }.bind(this))
        }
    }

    removeFromStarList(star) {
        var index = this.visible_stars.indexOf(star);
        if (index !== -1) {
            this.visible_stars.splice(index, 1);
        }
    }

    stop() {
        this.running = false

        this.octopus.unmount()

        this.visible_stars.forEach(function (ele) {
            ele.unmount()
        }.bind(this))
        this.visible_stars = []

        this.master.stop()

        var blurFilter = new PIXI.filters.BlurFilter()
        if (this.background_img)
            this.background_img.filters = [blurFilter]
    }

    getOctopus() {
        return this.octopus
    }

    onEvent(id) {
        if (id == EVENT_STAR_COLLECTED) {
            sound.play(SOUND_COIN)
            this.master.getTracker(TRACKER_STARS).add(1)
        }
        else if (id == EVENT_ITEM_OUT_OF_WORLD) {
            sound.play(SOUND_HEART_REMOVED)
            this.master.getTracker(TRACKER_HEARTS).remove(1)
        }
        else if (id == EVENT_CATCHED_FATAL_ITEM) {
            sound.play(SOUND_HEART_REMOVED_OUCH)
            this.master.getTracker(TRACKER_HEARTS).remove(1)
        }
        else if (id == EVENT_STARS_TRACKER_FULL) {
            this.master.getTracker(TRACKER_STARS).set(0)
            this.master.getTracker(TRACKER_COINS_SIMPLE).add(1)
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