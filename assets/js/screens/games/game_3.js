const GAME_3_CONFIG = {
    max_points: 1000,
    max_stars: 3,
    tracker: [TRACKER_COINS_SIMPLE],
    tracker_max_value: [-1],
    background_img: './assets/images/szene/game_3/background.png',
    start_game_speed: 6,
    increase_speed_delay: 1000,
    start_rock_spawn_pixel_delay: 750
}

const GAME_3_BACKGROUND_WIDTH = 1797


class LevelJumpAndRun {
    constructor(master, octopus) {
        this.master = master
        this.octopus = octopus

        this.running = false
        this.last_speed_increase = 0
        this.last_rock_spawned_at = 0
        this.current_game_speed = GAME_3_CONFIG['start_game_speed']
        this.visible_rocks = []
        this.current_rock_spawn_delay = GAME_3_CONFIG['start_rock_spawn_pixel_delay']

        this.game_started_at = Date.now()
        this.total_spawned_coins = 0
    }

    getConfig() {
        return GAME_3_CONFIG
    }

    render() {
        // background
        this.first_background_img = PIXI.Sprite.from(GAME_3_CONFIG['background_img']);
        container.addChild(this.first_background_img);

        this.second_background_img = PIXI.Sprite.from(GAME_3_CONFIG['background_img']);
        this.second_background_img.x = GAME_3_BACKGROUND_WIDTH
        container.addChild(this.second_background_img);

        // first rock
        let rock = new Rock(this)
        rock.render()
        this.visible_rocks = [rock]

        this.octopus.setControlType(CONTROLTYPE_JUMP)
        this.octopus.render(100, MIN_JUMP_Y_POS - 150)
        this.octopus.scale(OCTOPUS_SCALE, OCTOPUS_SCALE)

        this.running = true
        // this.onEvent(EVENT_STARS_TRACKER_FULL)
    }

    unmount() {
        this.stop()
        if (this.first_background_img)
            this.first_background_img.destroy()
        this.first_background_img = NaN
        if (this.second_background_img)
            this.second_background_img.destroy()
        this.second_background_img = NaN
    }

    loop(delta) {
        if (this.running) {
            const current_time = Date.now()
            this.octopus.loop(delta)

            // spawn rock
            this.current_rock_spawn_delay = GAME_3_CONFIG['start_rock_spawn_pixel_delay'] + GAME_3_CONFIG['start_rock_spawn_pixel_delay'] * (this.current_game_speed * 0.02)
            this.last_rock_spawned_at += this.current_game_speed * delta
            if (this.last_rock_spawned_at > this.current_rock_spawn_delay) {
                this.last_rock_spawned_at = 0
                let rock = new Rock(this)
                rock.render()
                this.visible_rocks.push(rock)
            }

            // move background
            this.first_background_img.x -= this.current_game_speed * delta
            this.second_background_img.x -= this.current_game_speed * delta
            if (this.first_background_img.x * (-1) >= GAME_3_BACKGROUND_WIDTH) {
                this.first_background_img.x = this.second_background_img.x + GAME_3_BACKGROUND_WIDTH + 2
            }
            if (this.second_background_img.x * (-1) >= GAME_3_BACKGROUND_WIDTH) {
                this.second_background_img.x = this.first_background_img.x + GAME_3_BACKGROUND_WIDTH
            }

            // move rocks
            this.visible_rocks.forEach(function (rock) {
                rock.loop(delta, (this.current_game_speed + this.current_game_speed * 0.04) * delta)
            }.bind(this))

            // remove invisible rocks in extra loop to avoid lagging
            this.visible_rocks.forEach(function (rock) {
                if (!rock.isVisible()) {
                    this.total_spawned_coins += rock.getCoinsCount()
                    rock.unmount()
                    this.removeFromRockList(rock)
                }
            }.bind(this))


            // increase game speed
            if (current_time - this.last_speed_increase > GAME_3_CONFIG['increase_speed_delay']) {
                this.last_speed_increase = current_time
                // this.current_game_speed = this.current_game_speed * 1.015
                this.current_game_speed = this.current_game_speed + 0.01
            }
        }
    }

    removeFromRockList(rock) {
        var index = this.visible_rocks.indexOf(rock);
        if (index !== -1) {
            this.visible_rocks.splice(index, 1);
        }
    }

    stop() {
        this.running = false
        this.octopus.unmount()
        this.master.stop()
        var blurFilter = new PIXI.filters.BlurFilter();
        if (this.first_background_img)
            this.first_background_img.filters = [blurFilter]
        if (this.second_background_img)
            this.second_background_img.filters = [blurFilter]

        // unmount rocks
        this.visible_rocks.forEach(function (rock) {
            rock.unmount()
        }.bind(this))
        this.visible_rocks = []
    }

    calculateStarsAndPoints() {
        let percentage_coins_collected = this.master.getTracker(TRACKER_COINS_SIMPLE).get() / this.total_spawned_coins
        return [Math.round(GAME_3_CONFIG['max_stars'] * percentage_coins_collected), Math.round((Date.now() - this.game_started_at) / 100)]
    }

    onEvent(id) {
        if (id == EVENT_COIN_COLLECTED) {
            sound.play(SOUND_COIN)
            this.master.getTracker(TRACKER_COINS_SIMPLE).add(1)
        }
        else if (id == EVENT_OCTOPUS_DIED) {
            this.stop()
            const [stars, points] = this.master.calculateStarsAndPoints()
            this.master.showResult(false, stars, points, 'YOU DIED')
        }
    }

    getOctopus() {
        return this.octopus
    }
}