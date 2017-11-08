/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Configuration class - a static class with configuration data.
 * 
 * @class Configurator
 */
class Configurator {
    /**
     * Pixel distance between top and bottom string centres
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static stringGap:number;        
    /**
     * Space between the top and bottom of the fretboard area and the
     * top and bottom strings.
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static stringMargin:number;
    /**
     * Width of a bar in pixels.
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static barWidth:number;
    /**
     * Set to true if the string display is flipped, e.g. string 0 is
     * the top most displayed, not the bottom.
     * 
     * @static
     * @type {boolean}
     * @memberof Configurator
     */
    public static isFlipped:boolean;
    /**
     * Horizontal position on the screen of 'current note'.
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static xOrigin:number;
    /**
     * Vertical position of the top of the fretboard.
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static yTop:number;
    /**
     * Height of the step ledge at the bottm in pixels.
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static ledgeHeight:number;
    /**
     * Set up configuration depending on screen size.
     * 
     * @static
     * @param {Phaser.Game} game 
     * @memberof Configurator
     */

    private static stringCount:number;
    /**
     * Space allocated at the bottom for the positioning bar.
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static scrollBarHeight:number;

    /**
     * Scalar for height of bounce on sine curve
     * 
     * @static
     * @type {number}
     * @memberof Configurator
     */
    public static bounceHeightScale:number;

    /**
     * Translates chromatic offset to display value.
     * 
     * @static
     * @type {IModifiers}
     * @memberof Configurator
     */
    public static modifier:IModifiers

    public static setup(game:Phaser.Game,stringCount:number) : void {
        Configurator.stringGap = game.height / 3.5;
        Configurator.stringMargin = game.height / 16;
        Configurator.ledgeHeight = game.height / 20;
        Configurator.barWidth = Math.round(game.width / 2.5);
        Configurator.isFlipped = false;
        Configurator.xOrigin = Math.round(game.width * 0.22);
        Configurator.bounceHeightScale = 1;
        Configurator.scrollBarHeight = game.height / 10;
        Configurator.yTop = game.height - Configurator.stringGap - 
                Configurator.stringMargin * 2 - Configurator.ledgeHeight -
                Configurator.scrollBarHeight;
        Configurator.stringCount = stringCount;   
        Configurator.modifier = new DefaultModifier();        
        var options = StringTrainerApplication.getURLName("options","").toLowerCase().split(";")
        for (var op of options) {
            if (op == "flip") { 
                Configurator.isFlipped = !Configurator.isFlipped; 
            }
            if (op == "dulcimer") {
                Configurator.modifier = new DulcimerModifier();
                Configurator.isFlipped = !Configurator.isFlipped; 
            }
            if (op == "merlin") {
                Configurator.modifier = new MerlinModifier();
            }
            if (op == "strumstick") {
                Configurator.modifier = new StrumstickModifier();
            }
        }        
    }

    public static getStringCount(): number {
        return Configurator.stringCount;
    }
    
    public static getStringY(str:number) {
        if (Configurator.isFlipped) {
            str = (Configurator.getStringCount()-1) - str;
        }
        var y:number = Configurator.yTop + 
                Configurator.stringMargin + Configurator.stringGap;
        y = y - str * Configurator.stringGap / (Configurator.stringCount-1)
        return y;
    }
}