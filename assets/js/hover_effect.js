const HOVER_SCALING = 0.08
const DEFAULT_HOVER_ANIMATION_DURATION = 150

class HoverEffect {
    constructor(sprite, s_scale = 1, animation_duration_ms = DEFAULT_HOVER_ANIMATION_DURATION) {
        this.sprite = sprite
        this.mouseover = false
        this.hover_active = false
        this.sprite_loaded = false
        this.sprite.s_scale = s_scale

        this.animation_duration_ms = animation_duration_ms
        this.main_hover_element = new HoverElement(this.sprite, this.animation_duration_ms)

        this.childs = []
    }

    addChild(sprite, s_scale = 1) {
        sprite.s_scale = s_scale
        const ele = new HoverElement(sprite, this.animation_duration_ms)
        this.childs.push(ele)
    }

    applyListeners() {
        if (this.sprite) {
            this.sprite.mouseover = function (mouseData) {
                this.mouseover = true
                this.hover_active = true
            }.bind(this)
            this.sprite.mouseout = function (mouseData) {
                this.mouseover = false
                this.hover_active = true
            }.bind(this)
        }
    }

    loop(delta) {
        if (this.main_hover_element) {
            this.main_hover_element.loop(delta, this.hover_active, this.mouseover)
            this.childs.forEach(function (child) {
                child.loop(delta, this.hover_active, this.mouseover)
            }.bind(this))

            this.hover_active = this.main_hover_element.isAnimationDone(this.mouseover)
        }
    }

    unmount() {
        this.sprite = NaN
        if (this.main_hover_element)
            this.main_hover_element.unmount()
        this.main_hover_element = NaN
        this.childs.forEach(function (child) {
            child.unmount()
        }.bind(this))
    }
}

class HoverElement {
    constructor(sprite, animation_duration_ms) {
        this.sprite = sprite
        this.sprite_loaded = false
        this.animation_duration_ms = animation_duration_ms

        if (!this.sprite.texture.baseTexture.valid) {
            this.sprite.texture.baseTexture.on('loaded', this.onSpriteLoaded.bind(this));
        } else {
            this.onSpriteLoaded();
        }
    }

    unmount() {
        if (this.sprite && this.sprite.texture)
            this.sprite.destroy()
        this.sprite = NaN
    }

    onSpriteLoaded() {
        this.sprite_loaded = true

        this.min_scale = this.sprite.s_scale
        this.max_scale = this.sprite.s_scale + HOVER_SCALING

        this.min_x_pos = this.sprite.x
        this.max_x_pos = this.sprite.x - (this.sprite.getBounds()['width'] * 0.5) * HOVER_SCALING

        this.min_y_pos = this.sprite.y
        this.max_y_pos = this.sprite.y - (this.sprite.getBounds()['height'] * 0.5) * HOVER_SCALING


        if (this.sprite.getBounds()['height'] < 50 && this.sprite.getBounds()['width'] > 50) {
            this.max_y_pos = this.sprite.y + this.sprite.getBounds()['height'] * (HOVER_SCALING + 0.105)
        }

        this.scale_tick_size = (this.max_scale - this.min_scale) / (this.animation_duration_ms * (60 / 1000))
        this.x_pos_tick_size = (this.max_x_pos - this.min_x_pos) / (this.animation_duration_ms * (60 / 1000))
        this.y_pos_tick_size = (this.max_y_pos - this.min_y_pos) / (this.animation_duration_ms * (60 / 1000))
    }

    isAnimationDone(mouseover) {
        if (this.sprite && this.sprite.texture)
            return (mouseover && this.sprite.scale.x <= this.max_scale) || (!mouseover && this.sprite.scale.x >= this.min_scale)
        return true
    }

    loop(delta, hover_active, mouseover) {
        if (this.sprite && this.sprite.texture && this.sprite_loaded && hover_active) {
            if (mouseover) {
                this.sprite.x += this.x_pos_tick_size * delta
                this.sprite.y += this.y_pos_tick_size * delta
                this.sprite.scale.x += this.scale_tick_size * delta
                this.sprite.scale.y += this.scale_tick_size * delta
            }
            else {
                this.sprite.x -= this.x_pos_tick_size * delta
                this.sprite.y -= this.y_pos_tick_size * delta
                this.sprite.scale.x -= this.scale_tick_size * delta
                this.sprite.scale.y -= this.scale_tick_size * delta
            }
        }
    }
}