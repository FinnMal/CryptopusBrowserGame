const BACKGROUND_FRAMES_FOLDER = './assets/animations/menu_background_frames'
const BACKGROUND_FRAMES_COUNT = 539
const BACKGROUND_VIDEO = './assets/mov/menu/menu_background.mov'

const WELCOME_BACKGROUND_IMAGE = './assets/images/szene/menu/background.png'

const OCTOPUS_SELECT_BOX = './assets/images/szene/menu/menu_octopus_select_box.png'
const LEVEL_SELECT_BOX = './assets/images/szene/menu/menu_level_select_box.png'

const BUTTON_PLAY_IMAGE = './assets/images/play_button.png'
const LOGO_IMAGE = './assets/images/logo.png'


const SCREEN_WELCOME = 0
const SCREEN_OCTOPUS_SELECT = 1
const SCREEN_LEVEL_SELECT = 2
const SCREEN_MANUAL = 3

class HomeScreen {
    constructor(screen_handler) {
        this.visible = false
        this.screen_handler = screen_handler
        this.current_nav_point = SCREEN_WELCOME

        this.blur_filter = new PIXI.filters.BlurFilter();
        this.selected_level_id = -1

        this.first_starts = [true, true, true]
    }

    render(infos) {
        if (infos['screen'])
            this.current_nav_point = infos['screen']
        else
            this.current_nav_point = SCREEN_WELCOME

        if (infos['octopus'])
            this.selected_octopus = infos['octopus']
        this.renderNavPoint(this.current_nav_point)
        this.visible = true
    }

    renderNavPoint(id) {
        if (id == SCREEN_WELCOME) {
            // background image
            this.background_img = PIXI.Sprite.from(WELCOME_BACKGROUND_IMAGE);
            this.background_img.filters = [this.blur_filter]
            this.background_img.scale.set(8, 8)
            container.addChild(this.background_img);

            // logo
            this.logo = new PIXI.Sprite(new PIXI.Texture.from(LOGO_IMAGE))
            this.logo.y = 100;
            this.logo.x = 230;
            container.addChild(this.logo);

            // game start button
            this.start_button = new PIXI.Sprite(new PIXI.Texture.from(BUTTON_PLAY_IMAGE))
            this.start_button.x = 540
            this.start_button.y = 400

            this.start_button.interactive = true
            this.start_button.buttonMode = true

            this.start_button.scale.set(1.2, 1.2);
            container.addChild(this.start_button);

            this.start_button_hover = new HoverEffect(this.start_button, 1.2)
            this.start_button_hover.applyListeners()



            this.start_button.on('pointertap', this.onStartButtonClicked.bind(this));
        }

        if (id == SCREEN_OCTOPUS_SELECT) {
            this.renderAnimatedBackgroundSprite()

            setTimeout(function () {
                this.background_img.destroy();
            }.bind(this), 200)

            this.select_headline = new PIXI.Text('Choose your Cryptopus', { fontFamily: 'Riffic Free', fontSize: 60, fill: 'white', align: 'center', fontWeight: '700', dropShadow: true, dropShadowColor: 'white' })
            this.select_headline.x = VIEW_WIDTH * 0.5 - this.select_headline.getBounds()['width'] * 0.5
            this.select_headline.y = 100
            container.addChild(this.select_headline)

            this.purple_octopus_select = new OctopusSelect(OCTOPUS_PURPLE, this.onOctopusSelected.bind(this))
            this.yellow_octopus_select = new OctopusSelect(OCTOPUS_YELLOW, this.onOctopusSelected.bind(this))
            this.green_octopus_select = new OctopusSelect(OCTOPUS_GREEN, this.onOctopusSelected.bind(this))
            this.purple_octopus_select.render(100, 230)
            this.yellow_octopus_select.render(430, 230)
            this.green_octopus_select.render(760, 230)
        }

        if (id == SCREEN_LEVEL_SELECT) {
            if (!this.background_sprite) {
                this.renderAnimatedBackgroundSprite()
            }


            this.select_headline = new PIXI.Text('Choose a Level', { fontFamily: 'Riffic Free', fontSize: 60, fill: 'white', align: 'center', fontWeight: '700', dropShadow: true, dropShadowColor: 'white' })
            this.select_headline.x = 425
            this.select_headline.y = 100
            container.addChild(this.select_headline)

            this.level_1_select = new LevelSelect(LEVEL_COLLECT_TRASH, this.onLevelSelected.bind(this))
            this.level_2_select = new LevelSelect(LEVEL_COLLECT_STARS, this.onLevelSelected.bind(this))
            this.level_3_select = new LevelSelect(LEVEL_JUMP_AND_RUN, this.onLevelSelected.bind(this))
            this.level_1_select.render(-10, 200)
            this.level_2_select.render(410, 200)
            this.level_3_select.render(835, 200)
        }

        if (id == SCREEN_MANUAL) {
            this.manual = new Manual(this.selected_level_id, this.onManualClosed.bind(this))
            this.manual.render()
        }
    }

    renderAnimatedBackgroundSprite() {
        let sheet = loader.resources[MENU_BACKGROUND_ANIMATION_FILE].spritesheet
        this.background_sprite = new PIXI.AnimatedSprite(sheet.animations['menu_background'])
        this.background_sprite.filters = [this.blur_filter]
        this.background_sprite.animationSpeed = 0.2;
        this.background_sprite.scale.set(8, 8)
        this.background_sprite.play()
        container.addChild(this.background_sprite);
    }

    onOctopusSelected(octopus) {
        this.selected_octopus = octopus;
        this.purple_octopus_select.unmount()
        this.yellow_octopus_select.unmount()
        this.green_octopus_select.unmount()
        this.select_headline.destroy()
        this.renderNavPoint(SCREEN_LEVEL_SELECT)
    }

    onLevelSelected(level_id = -1) {
        this.selected_level_id = level_id;
        this.select_headline.destroy()
        this.level_1_select.unmount()
        this.level_2_select.unmount()
        this.level_3_select.unmount()

        if (!this.first_starts[level_id]) this.onManualClosed()
        else this.renderNavPoint(SCREEN_MANUAL)
    }

    onManualClosed() {
        if (this.manual)
            this.manual.unmount()
        this.manual = NaN

        this.first_starts[this.selected_level_id] = false
        this.background_sprite.destroy()
        this.background_sprite = NaN
        this.screen_handler.loadScreen(SCREEN_GAME, {
            level_id: this.selected_level_id,
            octopus: this.selected_octopus
        })
    }

    onStartButtonClicked() {
        sound.play(SOUND_MENU_PLOP)
        this.start_button.destroy();
        this.logo.destroy();
        this.current_nav_point = SCREEN_OCTOPUS_SELECT
        this.renderNavPoint(this.current_nav_point)
    }

    unmount() {
        this.visible = false
        if (this.start_button_hover)
            this.start_button_hover.unmount()
        this.start_button_hover = NaN

        if (this.manual)
            this.manual.unmount()
    }

    isVisible() {
        return this.visible
    }

    loop(delta) {
        if (this.start_button_hover)
            this.start_button_hover.loop(delta)

        // hover loops
        if (this.purple_octopus_select) {
            this.purple_octopus_select.loop(delta)
            this.yellow_octopus_select.loop(delta)
            this.green_octopus_select.loop(delta)
        }

        if (this.level_1_select) {
            this.level_1_select.loop(delta)
            this.level_2_select.loop(delta)
            this.level_3_select.loop(delta)
        }

        // manual loop
        if (this.manual)
            this.manual.loop(delta)
    }
}

class OctopusSelect {
    constructor(id, onOctopusSelected) {
        this.id = id
        this.onOctopusSelected = onOctopusSelected
        this.octopus = new Octopus(this.id, false)

        this.mouseover = false
    }

    render(x = -1, y = -1) {
        this.select_box = PIXI.Sprite.from(OCTOPUS_SELECT_BOX);
        this.select_box.x = x
        this.select_box.y = y
        this.select_box.interactive = true
        this.select_box.buttonMode = true
        this.select_box.on('pointertap', this.onClick.bind(this))
        container.addChild(this.select_box);

        // show text
        this.text = new PIXI.Text(this.octopus.getDisplayName(), { fontFamily: 'Riffic Free', fontSize: 30, fill: this.octopus.getLabelColor(), align: 'left' })
        this.text.y = y + 220
        container.addChild(this.text)

        if (this.select_box.texture.baseTexture.valid) {
            this.text.x = (x + this.select_box.getBounds()['width'] * 0.5) - this.text.getBounds()['width'] * 0.5
        }
        else {
            this.select_box.texture.baseTexture.on('loaded', function () {
                this.text.x = (x + this.select_box.getBounds()['width'] * 0.5) - this.text.getBounds()['width'] * 0.5
            }.bind(this));
        }


        this.octopus.render(x + 43, y - 40);

        // box hover
        this.box_hover = new HoverEffect(this.select_box)
        this.box_hover.addChild(this.text)
        this.box_hover.addChild(this.octopus.getSprite())
        this.box_hover.applyListeners()
    }

    onClick() {
        sound.play(SOUND_MENU_PLOP)
        this.onOctopusSelected(this.octopus)
    }

    unmount() {
        this.text.destroy()
        this.select_box.destroy()
        this.octopus.unmount()
        this.box_hover.unmount()
        this.box_hover = NaN
    }

    loop(delta) {
        if (this.box_hover)
            this.box_hover.loop(delta)
    }
}

class LevelSelect {
    constructor(id, onLevelSelected) {
        this.id = id
        this.onLevelSelected = onLevelSelected
        this.info = LEVEL_INFOS[this.id]
    }

    render(x = -1, y = -1) {
        this.select_box = PIXI.Sprite.from(LEVEL_SELECT_BOX);
        this.select_box.x = x
        this.select_box.y = y
        this.select_box.interactive = true
        this.select_box.buttonMode = true
        this.select_box.on('pointertap', this.onClick.bind(this));
        container.addChild(this.select_box);

        this.level_screenshot = PIXI.Sprite.from(this.info['screenshot']);
        this.level_screenshot.x = x + 79
        this.level_screenshot.y = y + 76
        container.addChild(this.level_screenshot);

        this.text = new PIXI.Text(this.info['name'], { fontFamily: 'Riffic Free', fontSize: 30, fill: '#D479AB', align: 'center' })
        this.text.x = x + 130
        this.text.y = y + 255
        container.addChild(this.text)

        this.box_hover = new HoverEffect(this.select_box)
        this.box_hover.addChild(this.level_screenshot)
        this.box_hover.addChild(this.text)
        this.box_hover.applyListeners()
    }

    onClick() {
        sound.play(SOUND_MENU_PLOP)
        this.onLevelSelected(this.id)
    }

    unmount() {
        this.text.destroy()
        this.select_box.destroy()
        this.level_screenshot.destroy()
        this.box_hover.unmount()
        this.box_hover = NaN
    }

    loop(delta) {
        if (this.box_hover)
            this.box_hover.loop(delta)
    }
}

class Manual {
    constructor(level_id, onClose) {
        this.id = level_id
        this.onClose = onClose
    }

    render() {
        this.sprite = new PIXI.Sprite(new PIXI.Texture.from(LEVEL_INFOS[this.id]['manual']))
        this.sprite.y = 70;
        this.sprite.x = 140;
        this.sprite.zIndex = 10
        container.addChild(this.sprite);

        this.button = new Button(BUTTON_CLOSE, this.onClose)
        this.button.render(1050, 100)
        this.button.addHoverEffect()
    }

    unmount() {
        if (this.sprite)
            this.sprite.destroy()
        this.sprite = NaN

        if (this.button)
            this.button.unmount()
    }

    loop(delta) {
        if (this.button)
            this.button.loop(delta)
    }
}