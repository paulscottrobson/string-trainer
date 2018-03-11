/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * A strum renderer is responsible for rendering a single strum, so this 
 * could be note markers, sine loops, or the spheres, or notes on a stave
 * 
 * It is a simple object that is created and destroyed, like any other
 * composite graphic object.
 * 
 * @interface IStrumRenderer
 */
interface IStrumRenderer {
    /**
     * Move objects associate with this strum to the correct position.
     * 
     * @param {number} pos base position of the strum, not the strum position.
     * @memberof IStrumRenderer
     */
    moveTo(pos:number);
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
    /**
     * Destroy the rendered strum.
     * 
     * @memberof IStrumRenderer
     */
    destroy(): void;
}