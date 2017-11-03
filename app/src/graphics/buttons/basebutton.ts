/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Base button class from which the buttons shown on the tab derives
 * 
 * @class BaseButton
 * @extends {Phaser.Group}
 * @implements {IButton}
 */
class BaseButton extends Phaser.Group implements IButton {
    
    protected button:Phaser.Image;
    protected yPos:number;
    protected buttonText:Phaser.BitmapText;

    destroy(): void {
        super.destroy();
        this.buttonText = this.button = null;
    }
    
    moveTo(x: number): void {
        // Position it.
        this.button.x = x;this.button.y = this.yPos;    
        this.button.alpha = 1.0;
        // Fade out to the left
        if (x < Configurator.xOrigin) {
            this.button.alpha = Math.max(0.3,
                1-(Configurator.xOrigin-x)/Configurator.barWidth);
        }
        // Dip to the right
        if (x <= Configurator.xOrigin && x+this.button.width >= Configurator.xOrigin) {
            this.button.y += 4;            
        }
        // Update button logo.
        if (this.buttonText != null) {
            this.buttonText.x = x+this.button.width / 2;
            this.buttonText.y = this.button.y - this.button.height / 2 + this.buttonText.height / 3;
            this.buttonText.alpha = this.button.alpha;
        }
    }
    
    /**
     * Add a label to the button
     * 
     * @param {string} lbl 
     * @memberof BaseButton
     */
    label(lbl:string): void {
        var size:number = Configurator.stringGap / 
                    (Configurator.getStringCount()-1) * 0.6;
        // Makes the strums smaller text.
        if (this.button.width * 2 < this.button.height) {
            size = size * 0.7;
        }
        var txt:Phaser.BitmapText = this.game.add.bitmapText(0,0,"font",lbl,size,this);
        txt.anchor.x = 0.5;txt.anchor.y = 0;
        txt.tint = 0x000000;
        this.buttonText = txt;
    }

    /**
     * Colour list which is used to differentiate buttons
     * 
     * @private
     * @static
     * @type {number[]}
     * @memberof BaseButton
     */
    private static colours:number[] = [
        0xFF0000,0x00FF00,0x0000FF,0xFFFF00,0xFF8000,0xFFFF00,0xFF00FF,
        0x00FFFF,0xFF8000,0x0080FF,0x008000,0x808000,0x008080,0x8B3413
    ];

    /**
     * Get a colour for a given index, it reuses numbers that have
     * been used if insufficient in table.
     * 
     * @static
     * @param {number} n 
     * @returns {number} 
     * @memberof BaseButton
     */
    public static getColour(n:number) : number {
        return BaseButton.colours[n % BaseButton.colours.length];
    }
}