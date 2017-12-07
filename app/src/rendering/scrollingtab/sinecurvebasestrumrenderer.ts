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
    private beats:number;

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        this.renderer = renderer;this.game = game;this.strum = strum;    
        this.beats = strum.getBar().getMusic().getBeats();
        // TODO: Create sine curve
    }

    protected getStrumWidth(): number {
        return this.strum.getQBLength() / (this.beats * 4) * ScrollingTabRenderManager.xBarSize;
    }

    protected getStrumCentre(): number {
        return (this.strum.getQBStart()+this.strum.getQBLength()/2) / (this.beats * 4) * ScrollingTabRenderManager.xBarSize;
    }

    destroy(): void {
        // TODO: Destroy sine curve.
        this.renderer = this.game = this.strum = null;        

    }

    abstract moveTo(pos:number):void;
    abstract highlightStrumObjects(highlight: boolean, percent: number):void;
}

