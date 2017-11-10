/// <reference path="../../lib/phaser.comments.d.ts"/>

interface IControlPanel {
    /**
     * Get the speed scalar, which multiplies the movement.
     * Can also return 0 in pause mode.
     * 
     * @returns {number} 
     * @memberof IControlPanel
     */
    getSpeedScalar():number;
    /**
     * Returns true if the metronome is audible
     * 
     * @returns {boolean} 
     * @memberof IControlPanel
     */
    isMetronomeOn():boolean;
    /**
     * Returns true if the music is audible
     * 
     * @returns {boolean} 
     * @memberof IControlPanel
     */
    isMusicOn():boolean;
    /**
     * Add listener for clicks
     * 
     * @param {Function} func 
     * @param {*} target 
     * @memberof IControlPanel
     */
    addSignalListener(func:Function,target:any): void
}