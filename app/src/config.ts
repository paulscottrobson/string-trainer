/// <reference path="../lib/phaser.comments.d.ts"/>

class Configuration {
    /**
     * Display width
     * 
     * @memberof Configuration
     */
    public static width:number;
    /**
     * Display height
     * 
     * @type {number}
     * @memberof Configuration
     */
    public static height:number;
    /**
     * Currently selected instrument
     * 
     * @type {Instrument}
     * @memberof Configuration
     */
    public static instrument:Instrument;
    /**
     * Get number of strings
     * 
     * @static
     * @type {number}
     * @memberof Configuration
     */
    public static strings:number;
    
    public static initialise(game:Phaser.Game): void {
        Configuration.width = game.width;
        Configuration.height = game.height;
        Configuration.instrument = null;
    }
}