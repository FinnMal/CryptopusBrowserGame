RESULT_CARD_IMAGE = './assets/images/result_card/card.png'

STAR_IMAGES = ['./assets/images/result_card/star_1.png', './assets/images/result_card/star_2.png', './assets/images/result_card/star_3.png']

POINTS_COUNT_UP_SPEED = 1

RESULT_BOARD_BUTTON_SCALE = 1.55

class ResultBoard {
    constructor(game, won, stars, points, result_text = false) {
        this.game = game
        this.won = won
        this.stars = stars
        this.points = points
        this.rendered_points = 0
        this.result_text = result_text
        this.points_last_rendered_at = Date.now()
    }

    render() {
        if (this.won) sound.play(SOUND_WON)
        else sound.play(SOUND_LOSE)

        this.sprite = PIXI.Sprite.from(RESULT_CARD_IMAGE);
        this.sprite.x = VIEW_WIDTH * 0.36
        this.sprite.y = VIEW_HEIGHT * 0.23
        container.addChild(this.sprite);

        this.text = new PIXI.Text(this.result_text ? this.result_text : (this.won ? 'COMPLETE' : 'LOSED'), { fontFamily: 'Riffic Free', fontSize: 40, fill: 'white', align: 'left', width: 500, fontWeight: '200', dropShadow: false })
        container.addChild(this.text)

        // center text
        this.text.y = VIEW_HEIGHT * 0.39
        this.text.x = VIEW_WIDTH * 0.5 - this.text.getBounds()['width'] * 0.5

        this.rendered_points = 0
        this.points_text = new PIXI.Text(0, { fontFamily: 'Riffic Free', fontSize: 50, fill: 'white', align: 'center', fontWeight: '700', dropShadow: true, dropShadowColor: 'black' })
        container.addChild(this.points_text)

        // center points
        this.points_text.x = VIEW_WIDTH * 0.5 - this.points_text.getBounds()['width'] * 0.5
        this.points_text.y = VIEW_HEIGHT * 0.515

        if (this.stars >= 1) {
            // show first star
            this.star_1 = PIXI.Sprite.from(STAR_IMAGES[0]);
            this.star_1.x = VIEW_WIDTH * 0.4145
            this.star_1.y = VIEW_HEIGHT * 0.279
            container.addChild(this.star_1);
        }

        if (this.stars >= 2) {
            // show first star
            this.star_2 = PIXI.Sprite.from(STAR_IMAGES[1]);
            this.star_2.x = VIEW_WIDTH * 0.4795
            this.star_2.y = VIEW_HEIGHT * 0.264
            container.addChild(this.star_2);
        }

        if (this.stars == 3) {
            // show first star
            this.star_3 = PIXI.Sprite.from(STAR_IMAGES[2]);
            this.star_3.x = VIEW_WIDTH * 0.5465
            this.star_3.y = VIEW_HEIGHT * 0.28
            container.addChild(this.star_3);
        }

        // render buttons
        let btn_x = VIEW_WIDTH * 0.429
        let btn_y = VIEW_HEIGHT * 0.68
        this.retry_btn = new Button(BUTTON_RETRY, () => this.game.restart(false))
        this.retry_btn.render(btn_x, btn_y)
        this.retry_btn.setScale(RESULT_BOARD_BUTTON_SCALE, RESULT_BOARD_BUTTON_SCALE)

        this.overview_btn = new Button(BUTTON_OVERVIEW, () => this.game.showOverview(false))
        this.overview_btn.render(btn_x + 105, btn_y)
        this.overview_btn.setScale(RESULT_BOARD_BUTTON_SCALE, RESULT_BOARD_BUTTON_SCALE)

        /*
        this.next_btn = new Button(BUTTON_NEXT, () => this.game.startNextGame())
        this.next_btn.render(btn_x + 208, btn_y)
        this.next_btn.setScale(RESULT_BOARD_BUTTON_SCALE, RESULT_BOARD_BUTTON_SCALE)
        */
    }

    unmount() {
        this.rendered_points = this.points
        if (this.sprite) {
            this.sprite.destroy()
            this.sprite = NaN
        }
        this.text.destroy()
        this.points_text.destroy()
        if (this.star_1)
            this.star_1.destroy()
        if (this.star_2)
            this.star_2.destroy()
        if (this.star_3)
            this.star_3.destroy()

        this.retry_btn.unmount()
        this.overview_btn.unmount()

    }

    loop(delta) {
        // count up points
        if (this.rendered_points < this.points) {
            var current_time = Date.now()
            if (current_time - this.points_last_rendered_at > POINTS_COUNT_UP_SPEED) {
                this.points_last_rendered_at = current_time
                this.rendered_points += POINTS_COUNT_UP_SPEED
                this.points_text.destroy()
                this.points_text = new PIXI.Text(this.rendered_points, { fontFamily: 'Riffic Free', fontSize: 50, fill: 'white', align: 'center', fontWeight: '700', dropShadow: true, dropShadowColor: 'white' })
                container.addChild(this.points_text)

                // center points
                this.points_text.x = VIEW_WIDTH * 0.5 - this.points_text.getBounds()['width'] * 0.5
                this.points_text.y = VIEW_HEIGHT * 0.515
            }
        }
    }
}