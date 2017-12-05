/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * A renderer contains all the rendered objects relating
 * to a single bar. These are created and destroyed by the manager, not the
 * renderer constructor.
 * 
 * @interface IRenderer
 * @extends {Phaser.Group}
 */
interface IRenderer {
    /**
     * Get the display size of the rendered bar
     * 
     * @returns {number} 
     * @memberof IRenderer
     */
    getExtent():number[];
    /**
     * Get the parent render manager
     * 
     * @returns {IRenderManager} 
     * @memberof IRenderer
     */
    getRenderManager():IRenderManager;
    /**
     * Move the non strum items to the given bar position.
     * 
     * @param {number} barPosition 
     * @memberof IRenderer
     */
    moveNonStrumItemsTo(barPosition:number):void;
    /**
     * Create the non strum items for a bar, e.g. a bar line, things that move
     * with the bar but that are not part of the music.
     * 
     * @memberof IRenderer
     */
    createNonStrumItems():void;
    /**
     * Destroy the non strum items.
     * 
     * @memberof IRenderer
     */
    destroyNonStrumItems():void;
    /**
     * Get the StrumRenderer for this particular class
     * 
     * @returns {IStrumRenderer} 
     * @memberof IRenderer
     */
    getStrumRenderer():IStrumRenderer;
}