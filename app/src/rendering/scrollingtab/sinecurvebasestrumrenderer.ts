/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Parent class for Strum/Chord rendering. Provides the sine curve.
 * 
 * @abstract
 * @class SineCurveBaseStrumRenderer
 * @implements {IStrumRenderer}
 */
abstract class SineCurveBaseStrumRenderer implements IStrumRenderer {

    protected renderer:IRenderer;
    protected game:Phaser.Game;
    protected strum:IStrum;

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        this.renderer = renderer;this.game = game;this.strum = strum;    
        // TODO: Create sine curve
    }

    destroy(): void {
        // TODO: Destroy sine curve.
        this.renderer = this.game = this.strum = null;        

    }

    abstract moveTo(pos:number):void;
    abstract highlightStrumObjects(highlight: boolean, percent: number):void;
}

