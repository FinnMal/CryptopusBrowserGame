const FALLING_ELEMENT_IMAGE_PATH = './assets/images/szene/game_1/trash'
const FALLING_ELEMENT_MARKED_IMAGE_PATH = './assets/images/szene/game_1/trash_marked'
const FALLING_HEART_IMAGE_PATH = './assets/images/heart.png'

// added 'seeigel' multiple times to increase occur
const FALLING_ELEMENTS_IDS = [
    'becher',
    'becher2',
    'becher3',
    'buechse',
    'buechse2',
    'flasche',
    'flasche2',
    'kanister',
    'plastik',
    'teller',
    'tuete',
    'tuete2'
]
// removed 'strohhalm.png'

const FALLING_ELEMENTS_IDS_GREEN_TRASH = [
    'becher',
    'becher2',
    'plastik',
    'teller',
    'tuete',
    'tuete2'
]

const FALLING_ELEMENTS_IDS_YELLOW_TRASH = [
    'becher3',
    'buechse',
    'buechse2',
    'flasche',
    'flasche',
    'kanister'
]


class FallingElement {
    constructor(id, game, do_sea_urchin_vairation = false) {
        this.id = id;
        this.game = game
        this.octopus = game.getOctopus();
        this.visible = false
        this.catched = false

        this.is_fatal = this.id == 'seeigel'
        this.is_heart = this.id == 'heart'

        if (this.is_fatal && do_sea_urchin_vairation) {
            // change id to display trash in game 2
            let p = Math.random()
            if (p < 0.6)
                this.id = FALLING_ELEMENTS_IDS[Math.floor(Math.random() * FALLING_ELEMENTS_IDS.length)]
        }

        this.trash_color = FALLING_ELEMENTS_IDS_GREEN_TRASH.indexOf(this.id) > -1 ? 'green' : 'yellow'
    }

    getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    render() {
        if (!this.is_fatal && !this.is_heart)
            this.sprite = PIXI.Sprite.from(FALLING_ELEMENT_MARKED_IMAGE_PATH + '/' + this.id + '.png');
        else if (this.is_fatal)
            this.sprite = PIXI.Sprite.from(FALLING_ELEMENT_IMAGE_PATH + '/' + this.id + '.png');
        else
            this.sprite = PIXI.Sprite.from(FALLING_HEART_IMAGE_PATH);
        this.sprite.x = this.game.master.getItemSpawnXPos()
        this.sprite.zIndex = 8
        container.addChild(this.sprite);
        this.sprite.y = 300 * (-1)
        this.visible = true
    }

    isVisible() {
        return this.visible
    }

    isCatched() {
        return this.catched
    }

    unmount() {
        this.visible = false
        if (this.sprite)
            this.sprite.destroy()
        this.sprite = NaN
    }

    move(vx = -1, vy = -1) {
        this.sprite.x += vx
        this.sprite.y += vy
    }

    getBounds() {
        if (this.sprite)
            return this.sprite.getBounds()
        return {}
    }

    getTrashColor() {
        return this.trash_color
    }

    loop(delta) {
        if ((!this.catched || this.is_fatal) && this.sprite.texture.baseTexture.valid) {
            this.sprite.y += FALLING_ELEMENT_SPEED * delta
            if (this.sprite.y > VIEW_HEIGHT) {
                this.visible = false
                if (!this.is_fatal && !this.is_heart)
                    this.game.onEvent(EVENT_ITEM_OUT_OF_WORLD)
            }

            // check if octopus catched this element
            if (this.hasIntersectionWithOctopus()) {
                if (!this.is_fatal && !this.is_heart && !this.octopus.hasCatchedElement()) {
                    this.octopus.setCatchedElement(this)
                    this.catched = true
                }
                else if (!this.catched) {
                    if (this.is_fatal) {
                        this.catched = true
                        this.game.onEvent(EVENT_CATCHED_FATAL_ITEM)
                    }
                    else if (this.is_heart) {
                        this.catched = true
                        this.unmount()
                        this.game.onEvent(EVENT_CATCHED_HEART)
                    }
                }


            }
        }
    }

    hasIntersectionWithOctopus() {
        if (this.octopus.isMoveable() && this.sprite) {
            let catched_element = this.octopus.getCatchedElement()
            if (!this.is_fatal || !catched_element) {
                let octopusBox = this.octopus.getBounds(!this.is_fatal)
                let selfBox = this.sprite.getBounds()
                return octopusBox.x + octopusBox.width > selfBox.x &&
                    octopusBox.x < selfBox.x + selfBox.width &&
                    octopusBox.y + octopusBox.height > selfBox.y &&
                    octopusBox.y < selfBox.y + selfBox.height
            }
            else {
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