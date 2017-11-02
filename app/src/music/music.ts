/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Concrete implementation of Music Class
 * 
 * @class Music
 * @implements {IMusic}
 */
class Music implements IMusic {

    private json:any;
    private stringCount:number;
    private stringBaseNote:string[];
    private bar:IBar[];

    /**
     * Create a new music object
     * 
     * @param {*} musicJson 
     * @memberof Music
     */
    constructor(musicJson:any) {
        this.json = musicJson;
        this.stringCount = parseInt(this.json["strings"],10);
        this.stringBaseNote = [];
        for (var n = 0;n < this.stringCount;n++) {
            this.stringBaseNote[n] = this.json["string"+n];
        }
        console.log(this.stringBaseNote);
        this.bar = [];
        for (var n = 0;n < this.json["bars"].length;n++) {
            this.bar.push(new Bar(this.json["bars"][n],this));
        }
    }

    destroy():void {
        for (var b of this.bar) { b.destroy(); }
        this.bar = this.stringBaseNote = this.json = null;
    }
    getBeats(): number {
        return parseInt(this.json["beats"],10);
    }
    getTempo(): number {
        return parseInt(this.json["tempo"],10);
    }
    getCapo(): number {
        return parseInt(this.json["capo"],10);
    }
    getStringCount(): number {
        return this.stringCount;
    }
    getStringBaseNote(str: number): string {
        return this.stringBaseNote[str];
    }
    getInformation(key: string): string {
        return this.json[key.toLowerCase()];
    }
    getBarCount(): number {
        return this.bar.length;
    }
    getBar(bar: number): IBar {
        return this.bar[bar];
    }
    
}