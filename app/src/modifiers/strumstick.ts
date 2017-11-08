/// <reference path="../../lib/phaser.comments.d.ts"/>

class StrumstickModifier extends DefaultModifier implements IModifiers {
    
    convert(cOffset: number): string {
        return DefaultModifier.convertDiatonic(cOffset,StrumstickModifier.octave,8);
    }

    private static octave:number[] = [
        //  D   D#  E   F   F#  G   G#  A   A#  B   C   C#
            0,  0.1,1,  1.1,2,  3,  3.1,4,  4.1,5,  6,  7
    ];        
}