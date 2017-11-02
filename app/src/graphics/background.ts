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
        
        for (var n:number = 0;n < Configurator.getStringCount();n++) {
            var string:Phaser.Image = game.add.image(0,Configurator.getStringY(n),
                                                        "sprites","string",this);
            string.width = this.game.width;
            string.height = Math.round(this.game.height / 64 * (1-n/10));
            string.anchor.y = 0.5;
        }
    }
    
}