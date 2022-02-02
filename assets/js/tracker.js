const TRACKER_STARS = 0
const TRACKER_HEARTS = 1
const TRACKER_COINS = 2
const TRACKER_COINS_SIMPLE = 3

const TRACKER_INFOS = [
    {
        name: 'stars',
        color: '#F5A912',
        image: './assets/images/tracker/stars.png',

    },
    {
        name: 'hearts',
        color: '#ED32A0',
        image: './assets/images/tracker/hearts.png'
    },
    {
        name: 'coins',
        color: '#EFA900',
        image: './assets/images/tracker/coins.png'
    },
    {
        name: 'coins_simple',
        marginLeft: 100,
        show_count_as_text: true,
        image: './assets/images/tracker/coin.png'
    }
]


class Tracker {
    constructor(id, game, max_value = 5) {
        this.id = id
        this.game = game
        this.value = 0
        this.max_value = max_value
        this.infos = TRACKER_INFOS[this.id]
    }

    getID() {
        return this.id
    }

    getX() {
        return this.sprite.x
    }

    getY() {
        return this.sprite.y
    }

    add(v) {
        this.set(this.value + v)
    }

    remove(v) {
        this.set(this.value - v)
    }

    set(v) {
        if (v <= this.max_value || this.max_value == -1) {
            this.value = v
            if (this.id != TRACKER_COINS_SIMPLE && this.filler)
                this.filler.setPercentage((this.value / this.max_value) * 100)


            // update text counter
            if (this.infos['show_count_as_text']) {
                this.text.destroy()
                this.text = new PIXI.Text(this.value, { fontFamily: 'Riffic Free', fontSize: 45, fill: 'white', align: 'center', fontWeight: '500', dropShadow: true, dropShadowColor: 'white' })
                this.text.x = this.sprite.x - (30 + this.value.toString().length * 20)
                this.text.y = this.sprite.y
                container.addChild(this.text)
            }
        }

        if (this.value >= this.max_value && this.max_value > -1) {
            if (this.id == TRACKER_HEARTS) this.game.onEvent(EVENT_HEARTS_TRACKER_FULL)
            if (this.id == TRACKER_STARS) this.game.onEvent(EVENT_STARS_TRACKER_FULL)
            if (this.id == TRACKER_COINS) this.game.onEvent(EVENT_COINS_TRACKER_FULL)
        }

        if (this.value <= 0) {
            if (this.id == TRACKER_HEARTS) this.game.onEvent(EVENT_HEARTS_TRACKER_ZERO)
            if (this.id == TRACKER_STARS) this.game.onEvent(EVENT_STARS_TRACKER_ZERO)
            if (this.id == TRACKER_COINS) this.game.onEvent(EVENT_COINS_TRACKER_ZERO)
        }
    }

    get() {
        return this.value
    }

    getMaxValue() {
        return this.max_value
    }

    render(x = NaN, y = NaN) {
        if (this.infos['marginLeft']) {
            x = x + this.infos['marginLeft']
        }

        this.sprite = PIXI.Sprite.from(this.infos['image']);
        this.sprite.zIndex = 9
        if (x != NaN)
            this.sprite.x = x
        if (y != NaN)
            this.sprite.y = y
        container.addChild(this.sprite);

        // filler
        if (this.infos['color'] && this.infos['show_count_as_text'] !== true) {
            this.filler = new TrackerFiller(this, this.infos['color'])
            this.filler.render();
            this.filler.setPercentage(0)
        }
        else if (this.infos['show_count_as_text']) {
            this.text = new PIXI.Text(this.value, { fontFamily: 'Riffic Free', fontSize: 45, fill: 'white', align: 'center', fontWeight: '500', dropShadow: true, dropShadowColor: 'white' })
            this.text.x = x - 60
            this.text.y = y
            this.text.zIndex = 9
            container.addChild(this.text)
        }
    }

    unmount() {
        if (this.sprite) {
            this.sprite.destroy()
            if (this.filler)
                this.filler.unmount()
            if (this.text)
                this.text.destroy()
            this.sprite = NaN
        }
    }
}

class TrackerFiller {
    constructor(tracker, color) {
        this.tracker = tracker
        this.color = parseInt(color.replace(/^#/, ''), 16);
    }

    render(width = 0) {
        this.graphics = new PIXI.Graphics();
        this.graphics.zIndex = 10
        this.graphics.beginFill(this.color);
        this.graphics.lineStyle(5, this.color);
        this.graphics.drawRoundedRect(this.tracker.getX() + 52, this.tracker.getY() + 20.5, 75 * (width / 100), 21.5, 4 * (width / 100))

        container.addChild(this.graphics);
    }

    unmount() {
        if (this.graphics) {
            this.graphics.destroy()
            this.graphics = NaN
        }
    }

    setPercentage(p) {
        if (this.graphics) {
            this.graphics.destroy()
            this.render(p)
        }
    }
}