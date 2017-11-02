/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Strum Button.
 * 
 * @class StrumButton
 * @extends {BaseButton}
 * @implements {IButton}
 */
class StrumButton extends BaseButton implements IButton {

    constructor(game:Phaser.Game,width:number,name:string,isDownStrum:boolean,colourBase:number) {
        super(game);        
        var reqHeight:number = Configurator.stringGap+Configurator.stringMargin;
        var bName:string = "chordbutton_"+(isDownStrum ? "down":"up");
        this.button = this.game.add.image(0,0,"sprites",bName,this);
        this.button.width = width;this.button.height = reqHeight;
        this.button.anchor.x = 0;this.button.anchor.y = 0.5;
        this.button.tint = FingerButton.getColour(colourBase);
        this.yPos = Configurator.yTop + Configurator.stringMargin + Configurator.stringGap/2;
        name = name.substr(0,1).toUpperCase()+name.substr(1).toLowerCase();
        this.label(name);
    }
}