/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Bar implementation.
 * 
 * @class Bar
 * @implements {IBar}
 */
class Bar implements IBar {

    private music:IMusic;
    private strums:IStrum[];

    /**
     * Create a new bar
     * 
     * @param {string} def sequence of strum defs seperated by semicolon
     * @param {IMusic} music music that owns it.
     * @memberof Bar
     */
    constructor(def:string,music:IMusic) {
        this.music = music;
        this.strums = [];
        var defs:string[] = def.split(";")
        var qbTime:number = 0;
        for (var d of defs) {
            var s:IStrum = new Strum(d,this,qbTime);
            qbTime = s.getEndTime();
            this.strums.push(s);
        }
    }

    destroy(): void {
        for (var s of this.strums) { s.destroy(); }
        this.music = this.strums = null;
    }
    
    getStrumCount(): number {
        return this.strums.length;
    }
    getStrum(strum: number): IStrum {
        return this.strums[strum];
    }
    getMusic(): IMusic {
        return this.music;
    }
    
}