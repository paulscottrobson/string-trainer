/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Music object interface
 * 
 * @interface IMusic
 */
interface IMusic {
    /**
     * Return the number of beats in a bar
     * 
     * @returns {number} 
     * @memberof IMusic
     */
    getBeats(): number;
    /**
     * Return the tempo in beats per minute
     * 
     * @returns {number} 
     * @memberof IMusic
     */
    getTempo(): number;
    /**
     * Return capo position (0 = none)
     * 
     * @returns {number} 
     * @memberof IMusic
     */
    getCapo():number;
    /**
     * Return number of strings in the instrument
     * 
     * @returns {number} 
     * @memberof IMusic
     */
    getStringCount():number;
    /**
     * Get the base (e.g. unfretted) note of the given string
     * 
     * @param {number} str 
     * @returns {string} 
     * @memberof IMusic
     */
    getStringBaseNote(str:number):string;
    /**
     * Access information key.
     * 
     * @param {string} key 
     * @returns {string} value
     * @memberof IMusic
     */
    getInformation(key:string):string;
    /**
     * Return the number of bars in a tune.
     * 
     * @returns {number} 
     * @memberof IMusic
     */
    getBarCount():number;
    /**
     * Return a given bar.
     * 
     * @param {number} bar 
     * @returns {IBar} 
     * @memberof IMusic
     */
    getBar(bar:number):IBar;
    /**
     * Destroy object
     * 
     * @memberof IMusic
     */
    destroy():void;
}