/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Renderer interface. A renderer is responsible for one bar only.
 * 
 * @interface IRenderer
 */
interface IRenderer {
    destroy() : void;
    moveTo(x:number):void;
}
