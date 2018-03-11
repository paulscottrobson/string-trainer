/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Music interface
 * 
 * @interface IMusic
 */
interface IMusic {
	/**
	 * Get number of bars
	 * 
	 * @returns {number} 
	 * @memberof IMusic
	 */
	getBarCount():number;
	/**
	 * Get a bar
	 * 
	 * @param {number} n 
	 * @returns {IBar} 
	 * @memberof IMusic
	 */
	getBar(n:number):IBar;
	/**
	 * Get tuning as string
	 * 
	 * @returns {string} 
	 * @memberof IMusic
	 */
	getTuning():string ;
	/**
	 * Get composition title.
	 * 
	 * @returns {string} 
	 * @memberof IMusic
	 */
	getTitle():string ;
	/**
	 * Get tempo in bpm
	 * 
	 * @returns {number} 
	 * @memberof IMusic
	 */
	getTempo():number ;
	/**
	 * Get instruments short name
	 * 
	 * @returns {string} 
	 * @memberof IMusic
	 */
	getInstrumentShortName():string ;
	/**
	 * Get beats in a bar
	 * 
	 * @returns {number} 
	 * @memberof IMusic
	 */
	getBeats():number ;
	/**
	 * Get capo position
	 * 
	 * @returns {number} 
	 * @memberof IMusic
	 */
	getCapo():number ;
	/**
	 * Get the composer name
	 * 
	 * @returns {string} 
	 * @memberof IMusic
	 */
	getComposer():string ;
	/**
	 * Get tuning as offset from C1.
	 * 
	 * @returns {number[]} 
	 * @memberof IMusic
	 */
	getTuningAsC1Offset():number[];        
}