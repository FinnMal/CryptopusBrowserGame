const ROCK_SMALL = 0
const ROCK_MEDIUM = 1
const ROCK_LARGE = 2

const MIN_ROCK_Y_POS = 300
const MAX_ROCK_Y_POS = 600

const ROCK_CONFIG = [
    {
        name: 'small',
        cells: 4,
        image: './assets/images/szene/game_3/rock_small.png'
    },
    {
        name: 'medium',
        cells: 5,
        image: './assets/images/szene/game_3/rock_medium.png'
    },
    {
        name: 'large',
        cells: 6,
        image: './assets/images/szene/game_3/rock_large.png'
    }
]

const TOTAL_KILLER_ROCKS = 4

const KILLER_ROCK_IMAGES = [
    './assets/images/szene/game_3/killer_rocks/1.png',
    './assets/images/szene/game_3/killer_rocks/2.png',
    './assets/images/szene/game_3/killer_rocks/3.png',
    './assets/images/szene/game_3/killer_rocks/4.png'
]

const ROCK_BAGGAGE_OFFSET = 50
const ROCK_BAGGAGE_CELL_WIDTH = 100

const KILLER_ROCK_ARISE_PERCENTAGE = 40
const NO_BAGGAGE_PERCENTAGE = 10

const BAGGAGE_COIN = 0
const BAGGAGE_KILLER_ROCK = 1
const BAGGAGE_KILLER_ROCK_PLACEHOLDER = 2

class Rock {
    constructor(game) {
        this.id = Math.floor(Math.random() * 3);
        this.config = ROCK_CONFIG[this.id]
        this.visible = false
        this.game = game
        this.octopus = this.game.getOctopus()
        this.octopus_on_rock = false

        this.baggage = []
        var p = Math.random()
        if (p > NO_BAGGAGE_PERCENTAGE / 100) {
            for (let i = 0; i < this.config['cells']; i++) {
                if (!this.baggage.includes(BAGGAGE_KILLER_ROCK) && this.config['cells'] - i >= 2) {
                    var p = Math.random()
                    if (p < KILLER_ROCK_ARISE_PERCENTAGE / 100) {
                        this.baggage.push(BAGGAGE_KILLER_ROCK)
                        this.baggage.push(BAGGAGE_KILLER_ROCK_PLACEHOLDER)
                        i = i + 1
                        continue
                    }
                }
                this.baggage.push(BAGGAGE_COIN)
            }
        }
        this.baggage_items = []
    }

    render() {
        this.sprite = PIXI.Sprite.from(this.config['image']);
        this.sprite.x = VIEW_WIDTH + 20
        // generate random y pos
        this.sprite.y = Math.random() * (MAX_ROCK_Y_POS - MIN_ROCK_Y_POS) + MIN_ROCK_Y_POS;
        container.addChild(this.sprite);

        for (let i = 0; i < this.baggage.length; i++) {
            const baggage_item = this.baggage[i]

            let x = VIEW_WIDTH + i * ROCK_BAGGAGE_CELL_WIDTH + ROCK_BAGGAGE_OFFSET
            let y = this.sprite.y

            let item = NaN
            if (baggage_item == BAGGAGE_COIN) {
                item = new Coin(this.game, this.octopus)
                item.render(x, y)
            }
            else if (baggage_item == BAGGAGE_KILLER_ROCK) {
                item = new KillerRock(this)
                item.render(x, y)
            }
            else if (baggage_item == BAGGAGE_KILLER_ROCK_PLACEHOLDER) {
                item = BAGGAGE_KILLER_ROCK_PLACEHOLDER
            }

            if (item)
                this.baggage_items.push(item)
        }
        this.visible = true
    }

    getCoinsCount() {
        return this.getSize() + 3
    }

    getY() {
        if (this.sprite)
            return this.sprite.y
        return -1
    }

    getSize() {
        return this.id
    }

    isVisible() {
        return this.visible
    }

    unmount() {
        this.visible = false
        if (this.sprite)
            this.sprite.destroy()
        this.sprite = NaN

        this.baggage_items.forEach(function (item) {
            if (item && item != BAGGAGE_KILLER_ROCK_PLACEHOLDER)
                item.unmount()
        }.bind(this))
    }

    loop(delta, speed) {
        if (this.isVisible() && this.sprite) {
            this.sprite.x -= speed

            this.baggage_items.forEach(function (item) {
                if (item && item != BAGGAGE_KILLER_ROCK_PLACEHOLDER)
                    item.loop(delta, speed)
            }.bind(this))

            if (this.sprite.getBounds) {
                if (this.sprite.x <= this.sprite.getBounds()['width'] * (-1)) {
                    this.visible = false
                    this.unmount()
                }
            }

            const oor = this.isOctopusOnRock() || this.isOctopusUnderRock()
            if (oor != this.octopus_on_rock) {
                this.octopus_on_rock = oor
                if (this.octopus_on_rock) {
                    this.octopus.setRockYPos(this.getY())
                }
                else {
                    this.octopus.resetRockYPos()
                }
            }
        }
    }

    hasIntersectionWithOctopus() {
        if (this.sprite) {
            let octopusBox = this.octopus.getBounds(false)
            let selfBox = this.sprite.getBounds()
            return octopusBox.x + octopusBox.width > selfBox.x &&
                octopusBox.x < selfBox.x + selfBox.width &&
                octopusBox.y + octopusBox.height > selfBox.y &&
                octopusBox.y < selfBox.y + selfBox.height
        }
        return false
    }

    getOctopus() {
        return this.octopus
    }

    getBounds() {
        if (this.sprite)
            return this.sprite.getBounds()
        return {}
    }

    isOctopusOnRock() {
        if (this.sprite) {
            let octopusBox = this.getOctopus().getBounds(false)
            let selfBox = this.getBounds()
            return octopusBox.x + octopusBox.width + 10 > selfBox.x &&
                selfBox.x + selfBox.width > octopusBox.x + octopusBox.width + 10 &&
                octopusBox.y < selfBox.y
        }
        return false
    }

    isOctopusUnderRock() {
        if (this.sprite) {
            let octopusBox = this.getOctopus().getBounds(false)
            let selfBox = this.getBounds()
            return octopusBox.x + octopusBox.width + 10 > selfBox.x &&
                selfBox.x + selfBox.width > octopusBox.x + octopusBox.width + 10 &&
                octopusBox.y > selfBox.y
        }
        return false
    }
}

class KillerRock {
    constructor(parent) {
        this.id = Math.floor(Math.random() * (TOTAL_KILLER_ROCKS - 1));
        this.parent = parent
        this.image = KILLER_ROCK_IMAGES[this.id]
    }

    render(x, y) {
        this.sprite = PIXI.Sprite.from(this.image);
        this.sprite.x = x
        this.sprite.y = y
        container.addChild(this.sprite);

        if (this.sprite.texture.baseTexture.valid)
            this.sprite.y = y - this.sprite.getBounds()['height'] - 1
        else {
            this.sprite.texture.baseTexture.on('loaded', function () {
                this.sprite.y = y - this.sprite.getBounds()['height'] - 1
            }.bind(this));
        }
    }

    unmount() {
        if (this.sprite)
            this.sprite.destroy()
        this.sprite = NaN
    }

    loop(delta, speed) {
        if (this.sprite) {
            this.sprite.x -= speed
            if (this.hasIntersectionWithOctopus()) {
                this.parent.game.onEvent(EVENT_OCTOPUS_DIED)
            }
        }
    }

    getBounds() {
        let bounds = this.sprite.getBounds()
        bounds.y = bounds.y + bounds.height * 0.1
        bounds.height = bounds.height * 0.7
        bounds.x = bounds.x + bounds.width * 0.25
        bounds.width = bounds.width * 0.4
        return bounds
    }

    hasIntersectionWithOctopus() {
        if (this.sprite) {
            let octopusBox = this.parent.getOctopus().getBounds(false)
            let selfBox = this.getBounds()
            return octopusBox.x + octopusBox.width > selfBox.x &&
                octopusBox.x < selfBox.x + selfBox.width &&
                octopusBox.y + octopusBox.height > selfBox.y &&
                octopusBox.y < selfBox.y + selfBox.height
        }
        return false
    }
}

class Floor {
    constructor(rock) {
        this.rock = rock
        this.had_intersection = false
        this.octopus = this.rock.getOctopus()
    }

    render() {
        this.unmount()
        this.sprite = new PIXI.Graphics();
        this.sprite.zIndex = 10
        this.sprite.lineStyle(2, 'black');

        let bounds = this.rock.getBounds()
        this.sprite.drawRect(bounds['x'], bounds['y'] - 5, bounds['width'], 30)
        container.addChild(this.sprite)
    }

    unmount() {
        if (this.sprite) {
            this.sprite.destroy()
        }
        this.sprite = null
    }

    getBounds() {
        return this.sprite.getBounds()
    }

    getY() {
        if (this.sprite)
            return this.sprite.y
        return -1
    }

    loop(delta, speed) {
        if (this.getBounds()['width'] < 10)
            this.render()

        if (this.sprite) {
            this.sprite.x -= speed
        }
    }

    hasIntersectionWithOctopus() {
        if (this.sprite) {
            let octopusBox = this.rock.getOctopus().getBounds(false)
            let selfBox = this.getBounds()
            return octopusBox.x + octopusBox.width > selfBox.x &&
                octopusBox.x < selfBox.x + selfBox.width &&
                octopusBox.y + octopusBox.height > selfBox.y &&
                octopusBox.y < selfBox.y + selfBox.height
        }
        return false
    }
}