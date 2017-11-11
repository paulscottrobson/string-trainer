/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Strum interface
 * 
 * @interface IStrum
 */
interface IStrum {
    /**
     * Access the owning bar
     * 
     * @returns {IBar} 
     * @memberof IStrum
     */
    getBar():IBar;
    /**
     * Get the number of strings in the strum
     * 
     * @returns {number} 
     * @memberof IStrum
     */
    getStringCount():number;
    /**
     * Get the start time in twelfthbeats
     * 
     * @returns {number} 
     * @memberof IStrum
     */
    getStartTime():number;
    /**
     * Get the end time in twelfthbeats
     * 
     * @returns {number} 
     * @memberof IStrum
     */
    getEndTime():number;
    /**
     * Get the length in twelfthbeats
     * 
     * @returns {number} 
     * @memberof IStrum
     */
    getLength():number;
    /**
     * Get the string fret position : 0 = unfretted.
     * 
     * @param {number} str 
     * @returns {number} 
     * @memberof IStrum
     */
    getStringFret(str:number):number;
    /**
     * Is this a chord rather than fingerpick
     * 
     * @returns {boolean} 
     * @memberof IStrum
     */
    isChord() : boolean;
    /**
     * Get name of chord
     * 
     * @returns {string} 
     * @memberof IStrum
     */
    getChordName():string;
    /**
     * Destroy object
     * 
     * @memberof IStrum
     */
    destroy():void;
    /**
     * True if a down strum
     * 
     * @returns {boolean} 
     * @memberof IStrum
     */
    isChordDownStrum():boolean;
    /**
     * Convert strum to melody only.
     * 
     * @memberof IStrum
     */
    melodyOnly():void;
}