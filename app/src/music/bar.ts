/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Bar concrete implementation.
 * 
 * @class Bar
 * @implements {IBar}
 */
class Bar implements IBar {

    private music:IMusic;
    private barNumber:number;
    private lyric:string;
    private strums:IStrum[];

    constructor(def:string,music:IMusic,barNumber:number) {
        this.music = music;
        this.barNumber = barNumber;
        this.lyric = ""
        this.strums = [];
        var qbPosition:number = 0;
        for (var part of def.split(";")) {
            if (part[0] == '<') {
                this.lyric = part.substring(1,part.length-1);                
            } else {
                var strum:IStrum = new Strum(part,qbPosition,this);
                this.strums.push(strum);
                qbPosition += strum.getQBLength();
            }
        }
        // Check Pad strum to end, so we always have a full bar.
        if (qbPosition != music.getBeats()*4) {
            throw "Padding bar not working ?"
        }
    }

    getMusic(): IMusic {
        return this.music;
    }
    getBarNumber(): number {
        return this.barNumber;
    }
    getStrumCount(): number {
        return this.strums.length;
    }
    getStrum(n: number): IStrum {
        return this.strums[n];
    }
    getLyric(): string {
        return this.lyric;
    }
}