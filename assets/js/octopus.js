const STATE_PRESSED = 'pressed'
const STATE_RELEASED = 'released'
const MOVEMENT_SPEED = 16

const DIRECTION_UP = 0
const DIRECTION_DOWN = 1
const DIRECTION_LEFT = 2
const DIRECTION_RIGHT = 3

const JUMP_SPEED = 10
const MAX_JUMP_TIME = 260

const JUMP_HEIGHT = 150
const MAX_JUMP_Y_POS = -20
const MIN_JUMP_Y_POS = 720

const CONTROLTYPE_NONE = 0
const CONTROLTYPE_ALL = 1
const CONTROLTYPE_JUMP = 2
const CONTROLTYPE_LEFT_RIGHT = 3

class Octopus {
    constructor(id, moveable = true) {
        this.id = id
        this.jumping = false
        this.jump_to = -1
        this.catched_element = false
        this.infos = OCTOPUS_INFOS[this.id]
        this.frames_folder = this.infos['images']

        this.jump_started_at = -1
        this.is_on_rock = false
        this.jump_distance_traveled = 0

        this.min_jump_end_pos = MIN_JUMP_Y_POS
        this.max_jump_end_pos = MAX_JUMP_Y_POS

        this.control_type = moveable ? CONTROLTYPE_ALL : CONTROLTYPE_NONE

        // arrow keys
        this.left = this.keyboard("ArrowLeft")
        this.up = this.keyboard("ArrowUp")
        this.right = this.keyboard("ArrowRight")
        this.down = this.keyboard("ArrowDown")

        // wasd keys
        this.w = this.keyboard("w")
        this.a = this.keyboard("a")
        this.s = this.keyboard("s")
        this.d = this.keyboard("d")

        // space
        this.space = this.keyboard(' ')
    }

    getSprite() {
        return this.sprite
    }

    setControlType(c_type) {
        this.control_type = c_type
    }

    getControlType() {
        return this.control_type
    }

    isMoveable() {
        return this.getControlType() != CONTROLTYPE_NONE
    }

    startKeyboardListeners() {
        this.direction_config = {
            'axis': ['y', 'y', 'x', 'x'],
            'multiplicator': [-1, 1, -1, 1],
            'keys': [
                [this.up, this.w],
                [this.down, this.s],
                [this.left, this.a],
                [this.right, this.d]
            ]
        }

        this.space.press = () => this.beginJump()
        /* this.space.release = () => this.endJump()*/

        for (let i = 0; i < this.direction_config['keys'].length; i++) {
            const keys = this.direction_config['keys'][i]
            keys.forEach(function (key) {
                // key.unsubscribe()
                key.press = () => this.move(i, STATE_PRESSED)
                key.release = () => this.move(i, STATE_RELEASED)
            }.bind(this))
        }
    }

    render(x = -1, y = NaN) {
        this.startKeyboardListeners()
        this.min_jump_end_pos = MIN_JUMP_Y_POS
        if (this.infos['spritesheet_file']) {
            let sheet = loader.resources[this.infos['spritesheet_file']].spritesheet
            this.sprite = new PIXI.AnimatedSprite(sheet.animations['octopus_' + this.infos['name']])
        }
        this.sprite.zIndex = 7
        this.sprite.animationSpeed = 0.25;
        this.sprite.play()

        this.sprite.y = 96;
        this.sprite.vx = 0;
        this.sprite.vy = 0;
        if (x > 0)
            this.sprite.x = x
        if (y != NaN)
            this.sprite.y = y
        this.sprite.scale.set(1.37, 1.37);
        container.addChild(this.sprite);
    }

    scale(s) {
        if (this.sprite)
            this.sprite.scale.set(s, s);
    }

    unmount() {
        if (this.sprite)
            this.sprite.destroy()
        this.sprite = NaN
        this.unmountCatchedElement()
        this.removeCatchedElement()
        this.resetMaxJumpYPos()
        this.resetMinJumpYPos()


        /*
        this.space.unsubscribe()
        for (let i = 0; i < this.direction_config['keys'].length; i++) {
            const keys = this.direction_config['keys'][i]
            keys.forEach(function (key) {
                key.unsubscribe()
            }.bind(this))
        }
        */
    }

    getFramesWithRandomBegin(frames) {
        let first_index = Math.random() * (this.infos['frames_count'] - 2) + 1

        return frames.slice(first_index, this.infos['frames_count']).concat(frames.slice(0, first_index - 1))
    }

    getName() {
        return this.infos['name']
    }

    getDisplayName() {
        return this.infos['display_name']
    }

    getLabelColor() {
        return this.infos['label_color']
    }

    getX() {
        if (this.sprite)
            return this.sprite.x
        return -1
    }

    getY() {
        if (this.sprite)
            return this.sprite.y
        return -1
    }

    getBounds(just_tentacle = true) {
        if (this.sprite) {
            let bounds = this.sprite.getBounds()
            if (just_tentacle) {
                bounds.y = bounds.y + bounds.height * 0.76
                bounds.height = bounds.height * 0.15
                bounds.x = bounds.x + bounds.width * 0.2
                bounds.width = bounds.width * 0.6
            }
            else {
                bounds.y = bounds.y + bounds.height * 0.15
                bounds.height = bounds.height * 0.7
                bounds.x = bounds.x + bounds.width * 0.23
                bounds.width = bounds.width * 0.53
            }
            return bounds
        }
        return { 'x': -1, 'y': -1, 'width': -1, 'height': -1 }
    }

    getWidth() {
        return this.sprite.width
    }

    getHeight() {
        return this.sprite.height
    }

    canMove(direction) {
        if (this.control_type == CONTROLTYPE_LEFT_RIGHT) {
            if (direction === DIRECTION_UP || direction == DIRECTION_DOWN) return false
        }

        if (direction === DIRECTION_UP) return this.getY() > -20
        if (direction === DIRECTION_DOWN) return this.getY() < VIEW_HEIGHT - this.getHeight()
        if (direction === DIRECTION_LEFT) return this.getX() > + (this.getWidth() - 190)
        if (direction === DIRECTION_RIGHT) return this.getX() < VIEW_WIDTH - this.getWidth() + 30

        return false
    }

    keyboard(value) {
        const key = {};
        key.value = value;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        key.downHandler = (event) => {
            if (event.key === key.value) {
                if (key.isUp && key.press) {
                    key.press();
                }
                key.isDown = true;
                key.isUp = false;
                event.preventDefault();
            }
        };

        key.upHandler = (event) => {
            if (event.key === key.value) {
                if (key.isDown && key.release) {
                    key.release();
                }
                key.isDown = false;
                key.isUp = true;
                event.preventDefault();
            }
        };

        const downListener = key.downHandler.bind(key);
        const upListener = key.upHandler.bind(key);

        window.addEventListener("keydown", downListener, false);
        window.addEventListener("keyup", upListener, false);

        key.unsubscribe = () => {
            window.removeEventListener("keydown", downListener);
            window.removeEventListener("keyup", upListener);
        };

        return key;
    }

    move(direction, state) {
        const axis = this.direction_config['axis'][direction]
        const multiplicator = this.direction_config['multiplicator'][direction]
        if ((this.control_type == CONTROLTYPE_ALL || this.control_type == CONTROLTYPE_LEFT_RIGHT) && this.sprite) {
            const can_move = this.canMove(direction)

            // start movement
            if (state == STATE_PRESSED && can_move) {
                if (axis == 'x')
                    this.sprite.vx = MOVEMENT_SPEED * multiplicator
                else
                    this.sprite.vy = MOVEMENT_SPEED * multiplicator
            }

            // stop movement
            if (state == STATE_RELEASED || !can_move) {
                let moving_in_opposite_direction = ((axis == 'x' && this.sprite.vx != MOVEMENT_SPEED * multiplicator) || (axis == 'y' && this.sprite.vy != MOVEMENT_SPEED * multiplicator))
                if (!moving_in_opposite_direction) {
                    if (axis == 'x')
                        this.sprite.vx = 0
                    else
                        this.sprite.vy = 0
                }
            }
        }
    }

    setMinJumpYPos(y_pos) {
        if (this.sprite) {
            this.min_jump_end_pos = y_pos

            if (!this.jumping) this.endJump()
        }

        if (this.first_line) this.first_line.destroy()
        this.first_line = new PIXI.Graphics();
        this.first_line.zIndex = 10
        this.first_line.lineStyle(1, '0xFFFF00');
        this.first_line.drawRect(0, y_pos, VIEW_WIDTH, 1)
        container.addChild(this.first_line)

    }

    setMaxJumpYPos(y_pos) {
        if (this.sprite) {
            this.max_jump_end_pos = y_pos

            if (!this.jumping) this.endJump()
        }

        if (this.second_line) this.second_line.destroy()
        this.second_line = new PIXI.Graphics();
        this.second_line.zIndex = 10
        this.second_line.lineStyle(2, '0x00FF00');
        this.second_line.drawRect(0, y_pos, VIEW_WIDTH, 1)
        container.addChild(this.second_line)
    }

    resetMinJumpYPos() {
        if (this.sprite) {
            this.setMinJumpYPos(MIN_JUMP_Y_POS)
        }
    }

    resetMaxJumpYPos() {
        if (this.sprite) {
            this.setMaxJumpYPos(MAX_JUMP_Y_POS)
        }
    }

    beginJump() {
        if (this.sprite) {
            if (this.control_type == CONTROLTYPE_JUMP) {
                this.jumping = true
                this.jump_started_at = this.sprite.y
                this.sprite.vy = JUMP_SPEED * (-1)
                this.jump_distance_traveled = 0
                /*
                this.jump_to = Math.round(this.getY() - JUMP_HEIGHT)
                if (this.jump_to < MAX_JUMP_Y_POS)
                    this.jump_to = MAX_JUMP_Y_POS
                */
            }
        }
    }

    endJump() {
        if (this.sprite) {
            if (this.control_type == CONTROLTYPE_JUMP || this.control_type == CONTROLTYPE_ALL) {
                this.jumping = true
                this.sprite.vy = 0.5
                this.jump_distance_traveled = 0
            }
        }
    }

    stopJump(source = 'octopus') {
        this.sprite.vy = 0
        this.jumping = false
        this.jump_distance_traveled = 0
    }

    getJumpDirection() {
        if (this.jumping) {
            if (this.sprite.vy < 0) return DIRECTION_UP
            else return DIRECTION_DOWN
        }
        return -1
    }

    setRockYPos(y_pos) {
        this.rock_y_pos = y_pos

        /*if (this.first_line) this.first_line.destroy()
        this.first_line = new PIXI.Graphics();
        this.first_line.zIndex = 10
        this.first_line.lineStyle(1, '0xFFFF00');
        this.first_line.drawRect(0, y_pos, VIEW_WIDTH, 1)
        container.addChild(this.first_line)
        */
    }

    resetRockYPos() {
        this.setRockYPos(-1)
        if (!this.jumping)
            this.endJump()
    }

    loop(delta) {
        if (this.hasCatchedElement()) {
            this.catched_element.move(this.sprite.vx * delta, this.sprite.vy * delta);
        }

        // corret unallowed movements
        if ((this.control_type != CONTROLTYPE_NONE) && this.sprite) {
            if (this.sprite.vx > 0 && !this.canMove(DIRECTION_RIGHT)) this.sprite.vx = 0
            if (this.sprite.vx < 0 && !this.canMove(DIRECTION_LEFT)) this.sprite.vx = 0

            if (this.sprite.vy < 0 && !this.canMove(DIRECTION_UP)) this.sprite.vy = 0
            if (this.sprite.vy > 0 && !this.canMove(DIRECTION_DOWN)) this.sprite.vy = 0

            // increase or decrease jump speed
            if (this.control_type == CONTROLTYPE_JUMP || this.control_type == CONTROLTYPE_ALL) {
                if (this.sprite.vy > 0) {
                    this.jump_distance_traveled = this.sprite.y - this.jump_started_at
                    this.sprite.vy += 0.3
                }
                else if (this.sprite.vy < 0) {
                    this.jump_distance_traveled = this.jump_started_at - this.sprite.y
                    this.sprite.vy += 0.15
                }
            }

            // fixes bug in game 1
            if (this.control_type == CONTROLTYPE_ALL && !this.canMove(DIRECTION_UP)) {
                console.log('ending jump')
                this.endJump()
            }

            // movements
            this.sprite.x += this.sprite.vx * delta;
            this.sprite.y += this.sprite.vy * delta;

            const rounded_y = Math.round(this.sprite.y)
            const full_y = Math.round(this.sprite.y + this.getHeight() - 40)
            if (this.control_type == CONTROLTYPE_JUMP && this.jumping) {
                // check if jump has to end
                if (rounded_y <= MAX_JUMP_Y_POS) {
                    this.endJump()
                }

                if (full_y >= MIN_JUMP_Y_POS) {
                    this.stopJump()
                }

                if (this.sprite.vy < 0) {
                    if (this.jump_started_at - this.sprite.y > JUMP_HEIGHT) {
                        this.endJump()
                    }
                }

                if (this.rock_y_pos > full_y || this.rock_y_pos < rounded_y) {
                    if (this.sprite.vy < 0) {
                        if (this.rock_y_pos > 0) {
                            if (rounded_y - 10 <= this.rock_y_pos && full_y > this.rock_y_pos) {
                                this.endJump()
                            }
                        }
                    }

                    if (this.sprite.vy > 0) {
                        if (this.rock_y_pos > 0) {
                            if (full_y >= this.rock_y_pos - 20 && rounded_y < this.rock_y_pos) {
                                this.stopJump()
                            }
                        }
                    }
                }
            }
        }
    }

    setCatchedElement(ele) {
        this.catched_element = ele
    }

    getCatchedElement(ele) {
        return this.catched_element
    }

    removeCatchedElement() {
        this.catched_element = false
    }

    unmountCatchedElement() {
        if (this.catched_element)
            this.catched_element.unmount()
    }

    hasCatchedElement() {
        return this.catched_element !== false
    }
}

const CATCHED_ELEMENTS_IMAGE_PATH = './assets/images/szene/game_2'
const CATCHED_NET = 'netz_scaled'

class CatchedElement {
    constructor(id, octopus) {
        this.id = id
        this.octopus = octopus
    }

    render() {
        this.sprite = PIXI.Sprite.from(CATCHED_ELEMENTS_IMAGE_PATH + '/' + this.id + '.png');
        this.sprite.x = this.octopus.getX()
        this.sprite.y = this.octopus.getY()
        if (this.id == CATCHED_NET) {
            this.sprite.x = this.octopus.getX() + 50
            this.sprite.y = this.octopus.getY() + 95
        }
        this.sprite.zIndex = 8
        container.addChild(this.sprite);
    }

    unmount() {
        if (this.sprite)
            this.sprite.destroy()
    }

    move(vx, vy) {
        if (this.sprite) {
            this.sprite.x += vx
            this.sprite.y += vy
        }
    }

    getBounds() {
        if (this.sprite)
            return this.sprite.getBounds()
        return {}
    }
}


