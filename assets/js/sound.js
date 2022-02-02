const SOUNDS_FOLDER = './assets/sounds'

const SOUNDFILES = [
    'coin.mp3',
    'laugh.mp3',
    'lose.mp3',
    'menu_plop.mp3',
    'one_point.mp3',
    'pick_up.mp3',
    'plop.mp3',
    'soundtrack_new.mp3',
    'water_bubbles.mp3',
    'won.mp3',
    'heart_broken.mp3',
    'heart_collected.mp3',
    'ouch_heart_broken.mp3',
    'wrong_trash.mp3'
]

const SOUND_COIN = 0
const SOUND_LAUGH = 1
const SOUND_LOSE = 2
const SOUND_MENU_PLOP = 3
const SOUND_ONE_POINT = 4
const SOUND_PICK_UP = 5
const SOUND_PLOP = 6
const SOUND_SOUNDTRACK = 7
const SOUND_WATER_BUBBLES = 8
const SOUND_WON = 9
const SOUND_HEART_REMOVED = 10
const SOUND_HEART_ADDED = 11
const SOUND_HEART_REMOVED_OUCH = 12
const SOUND_WRONG_TRASH = 13

class Sound {
    constructor() {
        this.sounds = NaN
    }

    addResourcesToLoader(loader) {
        var i = 0
        SOUNDFILES.forEach(function (path) {
            loader.add(i.toString(), SOUNDS_FOLDER + '/' + path)
            i = i + 1
        }.bind(this))
    }

    setResources(sounds) {
        this.sounds = sounds
    }

    play(sound_id) {
        PIXI.sound.play(sound_id, {
            volume: 0.3
        });
    }

    loop(sound_id) {
        PIXI.sound.play(sound_id, {
            loop: true,
            singleInstance: true,
            volume: 0.1
        });
    }

    stopLoop(sound_id) { }
}