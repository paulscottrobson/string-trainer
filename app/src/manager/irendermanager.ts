/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * RenderManager interface. This is responsible for rendering the 
 * entire musical piece.
 * 
 * @interface IRenderManager
 */
interface IRenderManager {
    /**
     * Destroy the object
     * 
     * @memberof IRenderManager
     */
    destroy() : void;
    /**
     * Move so the x origin point is at the given position, also
     * manages the 'bouncy ball'.
     * 
     * @param {number} bar - bar position - fractional value.
     * @memberof IRenderManager
     */
    moveTo(bar:number):void;
    /**
     * Add an event handler which is called whenever a strum is due
     * (e.g. the move is forward, small, and encompasses a strum.).
     * 
     * @param {Function} method Method that accepts an IStrum parameter
     * @param {*} context Context in which it should be called.
     * @memberof IRenderManager
     */
    addStrumEvenHandler(method:Function,context:any):void;
}
