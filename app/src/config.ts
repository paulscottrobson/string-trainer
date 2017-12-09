/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Configuration information.
 * 
 * @class Configuration
 */
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
    /**
     * Bottom area of display screen / top line of control area.
     * 
     * @static
     * @type {number}
     * @memberof Configuration
     */
    public static yBase:number;
    /**
     * Size of lyric area (height)
     * 
     * @static
     * @type {number}
     * @memberof Configuration
     */
    public static lyricSize:number;
    /**
     * Height of control bar.
     * 
     * @static
     * @type {number}
     * @memberof Configuration
     */
    public static controlHeight:number;

    public static initialise(game:Phaser.Game): void {
        Configuration.width = game.width;
        Configuration.height = game.height;
        Configuration.controlHeight = 80;
        Configuration.lyricSize = 50;
        Configuration.yBase = Configuration.height - Configuration.controlHeight - Configuration.lyricSize;
        Configuration.instrument = null;
    }
}