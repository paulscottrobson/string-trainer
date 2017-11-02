/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Bar interface
 * 
 * @interface IBar
 */
interface IBar {
    /**
     * Get the number of strums in a bar
     * 
     * @returns {number} 
     * @memberof IBar
     */
    getStrumCount():number;
    /**
     * Get a given strum
     * 
     * @param {number} strum 
     * @returns {IStrum} 
     * @memberof IBar
     */
    getStrum(strum:number):IStrum;
    /**
     * Access the music information.
     * 
     * @returns {IMusic} 
     * @memberof IBar
     */
    getMusic():IMusic;
    /**
     * Destroy object
     * 
     * @memberof IBar
     */
    destroy():void;
}