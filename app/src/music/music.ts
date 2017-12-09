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

    getTuningAsC1Offset():number[] {
        var c1tuning:number[] = [];
        for (var s of this.getTuning().split(",")) {
            c1tuning.push(Music.nameToNoteID(s));
        }
        //console.log(this.getTuning(),c1tuning);
        return c1tuning;
    }

    public static nameToNoteID(s:string):number {
        var n:number = (s.charCodeAt(s.length-1)-49)*12;
        n = n + Music.noteToID[s.substr(0,s.length-1)];
        return n;
    }

    private static noteToID:any = {
        "c":0,"c#":1,"d":2,"d#":3,"e":4,"f":5,"f#":6,"g":7,"g#":8,"a":9,"a#":10,"b":11
    }
}