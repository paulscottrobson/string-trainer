/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Strum interface
 * 
 * @interface IStrum
 */
interface IStrum {
    /**
     * Get the owning bar
     * 
     * @returns {IBar} 
     * @memberof IStrum
     */
    getBar():IBar;
    /**
     * Get strum information, first is lowest string.
     * 
     * @returns {number[]} 
     * @memberof IStrum
     */
    getStrum():number[];
    /**
     * Get Quarterbeat time of start of note
     * 
     * @returns {number} 
     * @memberof IStrum
     */
    getQBStart():number;
    /**
     * Get Quarterbeat time of end of note
     * 
     * @returns {number} 
     * @memberof IStrum
     */
    getQBEnd():number;
    /**
     * Get quarterbeat length
     * 
     * @returns {number} 
     * @memberof IStrum
     */
    getQBLength():number;
    /**
     * Get associated chord
     * 
     * @returns {string} chord or "" if no chord.
     * @memberof IStrum
     */
    getChord():string;
}