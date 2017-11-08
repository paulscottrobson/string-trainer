/// <reference path="../../lib/phaser.comments.d.ts"/>
/// <reference path="imodifier.ts"/>

class DulcimerModifier extends DefaultModifier implements IModifiers {
    
    convert(cOffset: number): string {
        return DefaultModifier.convertDiatonic(cOffset,DulcimerModifier.octave,7);
    }


    isDoubleString(str:number):boolean {
        return (str == 2);
    }

    private static octave:number[] = [
        //  D   D#  E   F   F#  G   G#  A   A#  B   C   C#
            0,  0.1,1,  1.1,2,  3,  3.1,4,  4.1,5,  6,  6.5
    ];
}