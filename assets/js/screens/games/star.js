const STAR_IMAGE_PATH = './assets/images/star.png'

class Star {
    constructor(game, octopus) {
        this.game = game
        this.octopus = octopus
    }

    render() {
        this.sprite = PIXI.Sprite.from(STAR_IMAGE_PATH);
        this.sprite.x = this.game.master.getItemSpawnXPos()
        container.addChild(this.sprite);
        this.sprite.y = 300 * (-1)
        this.visible = true
    }

    isVisible() {
        return this.visible
    }

    unmount() {
        this.visible = false
        if (this.sprite)
            this.sprite.destroy()
        this.sprite = NaN
    }

    getBounds() {
        return this.sprite.getBounds()
    }

    loop(delta) {
        if (this.visible) {
            this.sprite.y += FALLING_ELEMENT_SPEED * delta
            if (this.sprite.y > VIEW_HEIGHT) {
                this.visible = false
                this.game.onEvent(EVENT_ITEM_OUT_OF_WORLD)
            }


            // check if octopus catched this element
            if (this.hasIntersectionWithOctopus()) {
                this.game.onEvent(EVENT_STAR_COLLECTED)
                this.unmount()
            }
        }
    }

    hasIntersectionWithOctopus() {
        if (this.octopus.isMoveable()) {
            let catched_element = this.octopus.getCatchedElement()
            if (catched_element) {
                let octopusBox = catched_element.getBounds()
                let selfBox = this.sprite.getBounds()
                return octopusBox.x + octopusBox.width > selfBox.x &&
                    octopusBox.x < selfBox.x + selfBox.width &&
                    octopusBox.y + octopusBox.height > selfBox.y &&
                    octopusBox.y < selfBox.y + selfBox.height
            }
        }
        return false
    }
}