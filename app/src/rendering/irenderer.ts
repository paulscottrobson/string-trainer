/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * A renderer contains all the rendered objects relating
 * to a single bar. These are created and destroyed by the manager, not the
 * renderer constructor.
 * 
 * @interface IRenderer
 */
interface IRenderer {
    /**
     * Move the renderer
     * 
     * @param {number} pos depends but usually and x or y coordinate.
     * @memberof IRenderer
     */
    moveTo(pos:number):void;
    /**
     * Get the parent render manager
     * 
     * @returns {IRenderManager} 
     * @memberof IRenderer
     */
    getRenderManager():IRenderManager;
    /**
     * Move the non strum items to the given position.
     * 
     * @param {number} pos , normally x or y coordinate
     * @memberof IRenderer
     */
    moveNonStrumItemsTo(pos:number):void;
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
     * Create a strum renderer
     * 
     * @param {IRenderer} renderer 
     * @param {Phaser.Game} game 
     * @param {IStrum} strum 
     * @returns {IStrumRenderer} 
     * @memberof IRenderer
     */
    createStrumRenderer(renderer:IRenderer,game:Phaser.Game,strum:IStrum):IStrumRenderer;
    /**
     * True if the current render is visible in the given position
     * 
     * @param {number} pos
     * @returns {boolean} 
     * @memberof IRenderer
     */
    isVisible(pos:number):boolean;
    /**
     * Destroy the renderer.
     * 
     * @memberof IRenderer
     */
    destroy():void;
}