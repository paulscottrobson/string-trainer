/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * A render manager is responsible for the rendering of the whole variant
 * part of the display, e.g. everything except the controls.
 * 
 * @interface IRenderManager
 */
interface IRenderManager {
    /**
     * Move the display position to the given value. This involves moving
     * each bar individually. Can als be used to update the bouncing ball
     * or any other 'fixed' objects.
     * 
     * @param {number} barPosition 
     * @memberof IRenderManager
     */
    moveTo(barPosition:number): void;
    /**
     * Renderer factory for this RenderManager class.
     * 
     * @param {IBar} bar 
     * @returns {IRenderer} 
     * @memberof IRenderManager
     */
    createRenderer(bar:IBar):IRenderer;
    /**
     * Create all fixed objects. It is recommended that a group is used for this
     * or two if there are foreground and background objects. These are things like
     * the guitar strings and freboard, or the ball rails. It also includes objects
     * not part of the strum graphic that might move, such as the bouncy ball.
     * 
     * @memberof IRenderManager
     */
    createFixed(game:Phaser.Game):void;
    /**
     * Destroy all fixed objects.
     * 
     * @memberof IRenderManager
     */
    destroyFixed():void;
    /**
     * Destroy the entire renderer.
     * 
     * @memberof IRenderManager
     */
    destroy():void;
}