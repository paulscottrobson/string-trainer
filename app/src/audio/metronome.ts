/// <reference path="../../lib/phaser.comments.d.ts"/>

class Metronome {

    private metronome:Phaser.Sound;

    constructor(game:Phaser.Game,music:IMusic) {       
        this.metronome = game.add.audio("metronome");        
    }
 
    destroy(): void {
    }

    public update(bar:number,qBeat:number): void {
        if (qBeat % 4 == 0) {
            this.metronome.volume = (qBeat == 0) ? 1 : 0.2;
            this.metronome.play();
            this.metronome.volume = (qBeat == 0) ? 1 : 0.2;
        }
    }
}