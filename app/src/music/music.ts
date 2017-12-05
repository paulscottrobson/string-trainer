/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Concrete music implementation.
 * 
 * @class Music
 * @implements {IMusic}
 */
class Music implements IMusic {

    private json:any;
    private bars:IBar[];

    constructor (json:any) {
        this.json = json;
        this.bars = [];
        for (var n = 0;n < json["bars"].length;n++) {
            this.bars.push(new Bar(this.json["bars"][n],this,n));
        }
    }
    getBarCount(): number {
        return this.bars.length;
    }
    getBar(n: number): IBar {
        return this.bars[n];
    }
    getTuning(): string {
        return this.json["tuning"];
    }
    getTitle(): string {
        return this.json["title"];
    }
    getTempo(): number {
        return parseInt(this.json["tempo"],10);
    }
    getInstrumentShortName(): string {
        return this.json["instrument"];
    }
    getBeats(): number {
        return parseInt(this.json["beats"],10);
    }
    getCapo(): number {
        return parseInt(this.json["capo"],10);
    }
    getComposer(): string {
        return this.json[""];
    }

}