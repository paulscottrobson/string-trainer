/// <reference path="../../lib/phaser.comments.d.ts"/>
/// <reference path="imodifier.ts"/>

class MandolinModifier extends DefaultModifier implements IModifiers {
    
    isDoubleString(str:number):boolean {
        return true;
    }
}