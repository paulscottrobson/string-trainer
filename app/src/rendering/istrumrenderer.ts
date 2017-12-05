/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * A strum renderer is responsible for rendering a single strum, so this 
 * could be note markers, sine loops, or the spheres, or notes on a stave
 * 
 * @interface IStrumRenderer
 */
interface IStrumRenderer {
    /**
     * Get the owning renderer.
     * 
     * @returns {IRenderer} 
     * @memberof IStrumRenderer
     */
    getRenderer():IRenderer;
    /**
     * Create objects associated with this strum.
     * 
     * @memberof IStrumRenderer
     */
    createStrumObjects():void;
    /**
     * Delete objects
     * 
     * @memberof IStrumRenderer
     */
    deleteStrumObjects():void;
    /**
     * Move objects associate with this strum to the correct position.
     * 
     * @param {number} barPosition 
     * @memberof IStrumRenderer
     */
    moveStrumObjects(barPosition:number);
    /**
     * Called to highlight, or unhighlight a particular strum when it is being
     * used. Can be used to mark current note on the stave, or to make the
     * bump effect as notes play.
     * 
     * @param {boolean} highlight 
     * @param {number} percent 
     * @memberof IStrumRenderer
     */
    highlightStrumObjects(highlight:boolean,percent:number);
}