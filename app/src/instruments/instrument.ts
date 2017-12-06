/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Instrument information class
 * 
 * This is exported from the python scripting.
 * 
 * @class Instrument
 */
class Instrument {
    private rawInfo:string[];
    private chromToName:any;

    constructor(info:string) {
        this.rawInfo = info.split(".");
        this.chromToName = {};
        //console.log(this.rawInfo);
        var lastFret:number = 0;
        // Now look at the fretname -> chromatic entries
        for (var n:number = this.getStringCount()+5;n < this.rawInfo.length;n++) {
            var parts:string[] = this.rawInfo[n].split("=");
            this.chromToName[parseInt(parts[1],10)] = parts[0];
            lastFret = Math.max(parseInt(parts[1],10),lastFret);
        }
        // Fill in the gaps with bends.
        for (var n:number = 0;n < lastFret;n++) {
            if (this.chromToName[n] == undefined) {
                this.chromToName[n] = this.chromToName[n-1]+"^";
            }
        }
        //console.log(this.chromToName,lastFret);
    }    
    /**
     * Get the name of the chromatic offset - so for example offset 11 
     * on a dulcimer would return 6+
     * 
     * @param {number} chromaticOffset 
     * @returns {string} 
     * @memberof Instrument
     */
    getDisplayName(chromaticOffset:number): string {
        if (chromaticOffset >= this.chromToName.length) {
            throw "asked for chrom offset "+chromaticOffset;
        }
        return this.chromToName[chromaticOffset];
    }
    //
    // These accessor functions mimic the order of the data in rawInfo.
    //
    getShortName():string { 
        return this.rawInfo[0]; }
    getLongName():string { 
        return this.rawInfo[1]; }
    getStandardTuning():string { 
        return this.rawInfo[2]; }
    getStringCount():number { 
        return parseInt(this.rawInfo[3],10); }
    isTabInverted():boolean { 
        return this.rawInfo[4] == 'y'; }
    isDoubleString(n:number):boolean { 
        return this.rawInfo[n+5].toLowerCase() == 'd'; }
}
