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
    private chordNumbers;any;
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
        //console.log(this.stringBaseNote);
        this.bar = [];
        for (var n = 0;n < this.json["bars"].length;n++) {
            this.bar.push(new Bar(this.json["bars"][n],this));
        }

        this.chordNumbers = {}
        var chordCount:number = 0;
        for (var bar of this.bar) {
            for (var n = 0;n < bar.getStrumCount();n++) {
                var strum:IStrum = bar.getStrum(n);
                if (strum.isChord()) {
                    var name:string = strum.getChordName().toLowerCase();
                    if (this.chordNumbers[name] == null) {
                        this.chordNumbers[name] = chordCount;
                        chordCount = chordCount + 1;
                    }
                }
            }
        }
    }

    analyse(): any {
        var analysis:any = {}
        // Work out base notes for string.
        var baseNumbers:number[] = [];
        for (var n1 = 0;n1 < this.getStringCount();n1++) {
            baseNumbers[n1] = MusicPlayer.toNoteID(this.stringBaseNote[n1]);
        }
        // Analyse whole song for used notes.
        for (var bar of this.bar) {
            for (var n = 0;n < bar.getStrumCount();n++) {
                var strum:IStrum = bar.getStrum(n);
                for (var str = 0;str < this.getStringCount();str++) {
                    var fretPos:number = strum.getStringFret(str);
                    if (fretPos != Strum.NOSTRUM) {
                        fretPos = fretPos+baseNumbers[str];
                        if (!(fretPos in analysis)) analysis[fretPos] = 0;
                        analysis[fretPos] = analysis[fretPos] + 1;
                    }
                }
            }
        }
        return analysis;
    }

    processMelody(): void{
        for (var bar of this.bar) {
            for (var n = 0;n < bar.getStrumCount();n++) {
                var strum:IStrum = bar.getStrum(n);
                strum.melodyOnly();
            }
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
    getTuning(): string[] {
        return this.stringBaseNote;
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
    getChordNumber(name:string):number {
        return this.chordNumbers[name.toLowerCase()];
    }    
}