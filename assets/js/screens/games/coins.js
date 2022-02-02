const COIN_IMAGE = './assets/images/coin.png'

class Coins {
    constructor(game, count) {
        this.game = game
        this.octopus = this.game.getOctopus()
        this.count = count
        this.coin_objects = []
    }

    render(x_pos = VIEW_WIDTH + 110, y_pos = -1) {
        // render coins in row
        let x_pos_begin = x_pos
        for (let i = 0; i < this.count; i++) {
            let coin = new Coin(this.game, this.octopus)
            coin.render(x_pos_begin + i * 60, y_pos)
            this.coin_objects.push(coin)
        }
    }

    unmount() {
        this.coin_objects.forEach(function (coin) {
            coin.unmount()
        }.bind(this))
    }

    loop(delta, speed) {
        this.coin_objects.forEach(function (coin) {
            coin.loop(delta, speed)
        }.bind(this))
    }
}

const COIN_MAX_MOVE_PIXEL = 20
class Coin {
    constructor(game, octopus) {
        this.collected = false
        this.start_y_pos = -1
        this.moving_up = true
        this.game = game
        this.octopus = octopus
    }

    render(x = -1, y = -1) {
        this.sprite = PIXI.Sprite.from(COIN_IMAGE);
        this.sprite.x = x
        this.sprite.y = y - 60
        container.addChild(this.sprite);
        this.collected = false

        this.start_y_pos = this.sprite.y
    }

    unmount() {
        if (this.sprite)
            this.sprite.destroy()
        this.sprite = NaN
    }

    isCollected() {
        return this.collected
    }

    collect() {
        this.game.onEvent(EVENT_COIN_COLLECTED)
        this.collected = true
        this.unmount()
    }

    loop(delta, speed) {
        if (!this.isCollected() && this.sprite) {
            if (this.moving_up && this.sprite.y == this.start_y_pos - COIN_MAX_MOVE_PIXEL) this.moving_up = false
            else if (!this.moving_up && this.sprite.y == this.start_y_pos) this.moving_up = true

            this.sprite.y += this.moving_up ? -0.25 : 0.25

            this.sprite.x -= speed

            if (this.hasIntersectionWithOctopus()) {
                this.collect()
            }
        }
    }

    hasIntersectionWithOctopus() {
        let octopusBox = this.octopus.getBounds(false)
        let selfBox = this.sprite.getBounds()
        return octopusBox.x + octopusBox.width > selfBox.x &&
            octopusBox.x < selfBox.x + selfBox.width &&
            octopusBox.y + octopusBox.height > selfBox.y &&
            octopusBox.y < selfBox.y + selfBox.height
    }
}