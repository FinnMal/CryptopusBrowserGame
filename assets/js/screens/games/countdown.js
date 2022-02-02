class Countdown {
    constructor(game, reaming_seconds) {
        this.game = game
        this.reaming_seconds = reaming_seconds
        this.last_counted = Date.now()
        this.running = false
    }

    render() {
        let minutes = Math.floor(this.reaming_seconds / 60)
        let seconds = this.reaming_seconds - minutes * 60

        this.text = new PIXI.Text(minutes + ':' + this.pad(seconds, 2), { fontFamily: 'Riffic Free', fontSize: 60, fill: 'white', align: 'center', fontWeight: '700', dropShadow: true, dropShadowColor: 'white' })
        this.text.zIndex = 10
        this.text.x = 30
        this.text.y = 30
        container.addChild(this.text)
    }

    unmount() {
        if (this.text)
            this.text.destroy()
        this.running = false
        this.text = NaN
    }

    start() {
        this.running = true
    }

    stop() {
        this.running = false
    }

    add(s) {
        this.reaming_seconds += s
        this.updateText()
    }

    remove(s) {
        if (this.reaming_seconds - s < 0)
            this.reaming_seconds = 0
        else
            this.reaming_seconds -= s
        this.updateText()
    }

    updateText() {
        if (this.reaming_seconds > -1) {
            this.text.destroy()
            this.render()
        }
        else {
            this.game.onEvent(EVENT_COUNTDOWN_ENDED)
            this.running = false
        }
    }

    pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    loop(delta) {
        if (this.running) {
            let cur_timestamp = Date.now()
            if (cur_timestamp - this.last_counted >= 1000) {
                this.last_counted = cur_timestamp
                this.reaming_seconds -= 1
                this.updateText()
            }
        }

    }
}