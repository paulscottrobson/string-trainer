/// <reference path="../../lib/phaser.comments.d.ts"/>

class StrumButton extends Phaser.Group implements IButton {

    private button:Phaser.Image;

    constructor(game:Phaser.Game,width:number,name:string,isDownStrum:boolean,colourBase:number) {
        super(game);        
        var reqHeight:number = Configurator.stringGap+Configurator.stringMargin;
        var bName:string = "chordbutton_"+(isDownStrum ? "down":"up");
        this.button = this.game.add.image(0,0,"sprites",bName,this);
        this.button.width = width;this.button.height = reqHeight;
        this.button.anchor.x = 0;this.button.anchor.y = 0.5;
        this.button.tint = FingerButton.getColour(colourBase);
    }
    
    destroy(): void {
        super.destroy();
        this.button = null;
    }

    moveTo(x: number): void {
        this.button.x = x;
        this.button.y = Configurator.yTop + Configurator.stringMargin + Configurator.stringGap/2;
    }
}