/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Create the display background.
 * 
 * @class Background
 * @extends {Phaser.Group}
 */
class Background extends Phaser.Group {

    constructor(game:Phaser.Game) {
        super(game);
        // Set up the background
        var bgr:Phaser.Image = this.game.add.image(0,0,
                            "sprites","background",this);
        bgr.width = this.game.width;bgr.height = this.game.height;
        // Create the fretboard area.
        var fretBoard:Phaser.Image = this.game.add.image(0,Configurator.yTop,
                                                         "sprites","rectangle",this); 
        fretBoard.width = game.width;
        fretBoard.height = Configurator.stringGap + Configurator.stringMargin * 2;
        fretBoard.tint = 0x404040;

        var ledge:Phaser.Image = this.game.add.image(0,fretBoard.bottom,
                                                        "sprites","rectangle",this);
        ledge.width = this.game.width;
        ledge.height = Configurator.ledgeHeight;
        ledge.tint = 0x282828;
        
        var info:Phaser.BitmapText = 
            game.add.bitmapText(this.game.width/2,this.game.height,
                                            "font",MainState.VERSION,24,this);
        info.anchor.x = 0.5;info.anchor.y = 1.0;                       
        info.tint = 0;                         

        for (var n:number = 0;n < Configurator.getStringCount();n++) {
            var isDouble:boolean = Configurator.modifier.isDoubleString(n);
            var gr:string = isDouble ? "dstring":"string";
            var string:Phaser.Image = game.add.image(0,Configurator.getStringY(n),
                                                        "sprites",gr,this);
            string.width = this.game.width;
            string.height = Math.round(this.game.height / 64 * (1-n/10));
            if (isDouble) { string.height *= 2; }
            string.anchor.y = 0.5;
        }
    }
    
}