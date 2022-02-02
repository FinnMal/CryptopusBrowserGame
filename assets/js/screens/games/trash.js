TRASH_IMAGES = {
    'green': './assets/images/szene/game_1/garbage_green.png',
    'yellow': './assets/images/szene/game_1/garbage_yellow.png'
}


class Trash {
    constructor(game, octopus, color) {
        this.game = game
        this.octopus = octopus;
        this.color = color
        this.collected_ids = []
    }

    render(x = 35) {
        this.sprite = PIXI.Sprite.from(TRASH_IMAGES[this.color]);
        this.sprite.zIndex = 8
        this.sprite.x = x
        this.sprite.y = 525
        container.addChild(this.sprite);
    }

    unmount() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = NaN
        }
    }

    getBounds() {
        return this.sprite.getBounds()
    }

    loop(delta) {
        if (this.octopus.hasCatchedElement()) {
            var ele = this.octopus.getCatchedElement()
            if (this.hasIntersection(ele)) {
                ele.unmount()
                this.octopus.removeCatchedElement()
                if (this.color == ele.getTrashColor())
                    this.game.onEvent(EVENT_TRASH_PIECE_COLLECTED)
                else
                    this.game.onEvent(EVENT_TRASH_PIECE_COLLECTED_WRONG)
            }
        }
    }

    hasIntersection(ele) {
        let selfBox = this.getBounds()
        let eleBox = ele.getBounds()
        return selfBox.x + selfBox.width > eleBox.x &&
            selfBox.x < eleBox.x + eleBox.width &&
            selfBox.y + selfBox.height > eleBox.y &&
            selfBox.y < eleBox.y + eleBox.height
    }
}