/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Bar interface
 * 
 * @interface IBar
 */
interface IBar {
    /**
     * Get the music object owning this
     * 
     * @returns {IMusic} 
     * @memberof IBar
     */
    getMusic():IMusic;
    /**
     * Get the bar number
     * 
     * @returns {number} 
     * @memberof IBar
     */
    getBarNumber():number;
    /**
     * Get the number of strums in the bar
     * 
     * @returns {number} 
     * @memberof IBar
     */
    getStrumCount():number;
    /**
     * Get a strum from the bar
     * 
     * @param {number} n 
     * @returns {IStrum} 
     * @memberof IBar
     */
    getStrum(n:number):IStrum;
    /**
     * Get the lyric, if any
     * 
     * @returns {string} lyric or "" if none.
     * @memberof IBar
     */
    getLyric():string;
}