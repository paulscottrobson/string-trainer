/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Concrete strum
 * 
 * @class Strum
 * @implements {IStrum}
 */
class Strum implements IStrum {

    private bar:IBar;
    private chord:string;
    private strum:number[];
    private qbStart:number;
    private qbLength:number;

    public static NOSTRUM:number = -1;

    constructor(def:string,start:number,bar:IBar) {
        this.bar = bar;
        this.qbStart = start;
        this.chord = "";
        this.strum = [];
        // console.log(def);
        // get length
        this.qbLength = parseInt(def.substr(def.length-2),10)
        // get CHROMATIC strums
        while ((def[0] >= 'a' && def[0] <= 'z') || def[0] == '-') {
            if (def[0] == '-') {
                this.strum.push(Strum.NOSTRUM);
            } else {
                this.strum.push(def.charCodeAt(0)-97);
            }
            def = def.substr(1);            
        }
        // get chord if present
        if (def[0] == '[') {
            this.chord = def.substr(1,def.indexOf("]")-1);
        }
        // console.log(def,this.strum,this.qbLength,this.chord);
    }

    getBar(): IBar {
        return this.bar;
    }
    getStrum(): number[] {
        return this.strum;
    }
    getQBStart(): number {
        return this.qbStart;
    }
    getQBEnd(): number {
        return this.qbStart + this.qbLength;
    }
    getQBLength(): number {
        return this.qbLength;
    }
    getChord(): string {
        return this.chord;
    }
        
}