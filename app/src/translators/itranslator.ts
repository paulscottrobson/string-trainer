/// <reference path="../../lib/phaser.comments.d.ts"/>

interface ITranslator {
    /**
     * Translate a chromatic offset to display format
     * 
     * @param {number} cOffset 
     * @returns {string} 
     * @memberof ITranslator
     */
    convert(cOffset:number): string;
}

class DefaultTranslator implements ITranslator {
    convert(cOffset: number): string {
        return cOffset.toString();
    }    

    static convertDiatonic(cOffset:number,noteMap:number[],scalar:number):string {
        var octave:number = Math.floor(cOffset / 12);
        cOffset = cOffset % 12;
        var note:string = (octave * scalar + Math.floor(noteMap[cOffset])).toString();
        var frac:number = noteMap[cOffset] - Math.floor(noteMap[cOffset]);
        frac = Math.round(frac * 10);
        if (frac == 1) note = note + "^";
        if (frac == 5) note = note + "+"
        return note
    }
}