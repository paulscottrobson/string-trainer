/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Metronome (audio only) class
 * 
 * @class Metronome
 */
class Metronome {

    private tick:Phaser.Sound;
    private lastBeats:number;
    private lastBar:number;
    private beats:number;
    private barCount:number;
    private isOn:boolean;

    constructor(game:Phaser.Game,music:IMusic) {
        this.tick = game.add.audio("metronome");
        this.lastBar = this.lastBeats = -1;
        this.barCount = music.getBarCount();
        this.beats = music.getBeats();
        this.isOn = true;
    }

    moveTo(pos:number): void {
        var bar:number = Math.floor(pos);
        var beats:number = Math.floor((pos - bar) * this.beats);
        if (bar != this.lastBar || beats != this.lastBeats) {
            if (bar < this.barCount) {
                this.lastBar = bar;
                this.lastBeats = beats;
                if (this.isOn) this.tick.play();
            }
        }
    }    

    setAudible(isOn:boolean):void {
        this.isOn = isOn;
    }
}