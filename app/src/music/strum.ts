/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Concrete strum implementation.
 * 
 * @class Strum
 * @implements {IStrum}
 */
class Strum implements IStrum {

    public static NOSTRUM:number = -1;

    private bar:IBar;
    private fretPos:number[];
    private startTime:number;
    private length:number;
    private chordName:string;

    /**
     * Create a strum
     * 
     * @param {string} def definition in --ab(C7)08 format
     * @param {IBar} bar bar strum is in
     * @param {number} startTime twelfthbeat start time.
     * @memberof Strum
     */
    constructor(def:string,bar:IBar,startTime:number) {
        this.bar = bar;
        this.fretPos = [];
        this.startTime = startTime;
        this.chordName = "";
        for (var n:number = 0;n < this.bar.getMusic().getStringCount();n++) {
            var c:number = def.charCodeAt(n) - 97;
            if (def.charAt(n) == "-") { c = Strum.NOSTRUM; }            
            this.fretPos[n] = c;
        }
        this.length = parseInt(def.substr(def.length-2));
        var p1:number = def.indexOf("(");
        if (p1 >= 0) {
            this.chordName = def.substr(p1+1,def.lastIndexOf(")")-p1-1);
        }
        //console.log(def,this.fretPos,this.length,this.chordName);
    }

    melodyOnly(): void {
        var found:boolean = false;
        for (var n = this.fretPos.length-1;n >= 0;n--) {
            if (this.fretPos[n] != Strum.NOSTRUM) {
                if (found) {
                    this.fretPos[n] = Strum.NOSTRUM;
                } else {
                    found = true;
                }
            }
        }
    }
    destroy(): void {
        this.bar = this.fretPos = null;
    }

    getBar(): IBar {
        return this.bar;
    }
    getStringCount(): number {
        return this.fretPos.length;
    }
    getStartTime(): number {
        return this.startTime;
    }
    getEndTime(): number {
        return this.startTime+this.length;
    }
    getLength(): number {
        return this.length;
    }
    getStringFret(str: number): number {
        return this.fretPos[str];
    }
    isChord() : boolean {
        return this.chordName != "";
    }
    getChordName():string {
        return this.chordName;
    }
    isChordDownStrum():boolean {
        return (this.startTime % 12) < 6
    }    
}