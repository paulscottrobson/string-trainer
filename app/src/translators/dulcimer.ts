/// <reference path="../../lib/phaser.comments.d.ts"/>

class DulcimerTranslator implements ITranslator {
    
    convert(cOffset: number): string {
        return DefaultTranslator.convertDiatonic(cOffset,DulcimerTranslator.octave,7);
    }

    private static octave:number[] = [
        //  D   D#  E   F   F#  G   G#  A   A#  B   C   C#
            0,  0.1,1,  1.1,2,  3,  3.1,4,  4.1,5,  6,  6.5
    ];
}