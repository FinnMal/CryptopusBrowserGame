const BUTTON_OVERVIEW = 0
const BUTTON_NEXT = 1
const BUTTON_RETRY = 2
const BUTTON_CLOSE = 3

const BUTTON_INFOS = [
    {
        "name": "overview",
        "image": "./assets/images/buttons/overview.png"
    },
    {
        "name": "next",
        "image": "./assets/images/buttons/next.png"
    },
    {
        "name": "retry",
        "image": "./assets/images/buttons/retry.png"
    },
    {
        "name": "close",
        "image": "./assets/images/szene/manual/close.png"
    }
]


class Button {
    constructor(id, onClick) {
        this.id = id
        this.onClick = onClick
        this.infos = BUTTON_INFOS[this.id]
    }

    getID() {
        return this.id
    }

    getWidth() {
        return this.sprite.width
    }

    setScale(x, y) {
        this.sprite.scale.set(x, y)
        this.addHoverEffect()
    }

    render(x = NaN, y = NaN) {
        this.sprite = PIXI.Sprite.from(this.infos['image']);
        this.sprite.zIndex = 10
        if (x != NaN)
            this.sprite.x = x
        if (y != NaN)
            this.sprite.y = y
        this.sprite.interactive = true
        this.sprite.buttonMode = true
        this.sprite.on('pointertap', this.onPress.bind(this));
        container.addChild(this.sprite);
    }

    addHoverEffect() {
        if (this.hover_effect)
            this.hover_effect.unmount()

        this.hover_effect = new HoverEffect(this.sprite)
        this.hover_effect.applyListeners()
    }

    onPress() {
        sound.play(SOUND_MENU_PLOP)
        if (this.onClick)
            this.onClick()
    }

    unmount() {
        if (this.sprite) {
            this.sprite.destroy()
            this.sprite = NaN
        }

        if (this.hover_effect)
            this.hover_effect.unmount()
        this.hover_effect = NaN
    }

    loop(delta) {
        if (this.hover_effect)
            this.hover_effect.loop(delta)
    }
}