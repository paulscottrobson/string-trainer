/// <reference path="../../../lib/phaser.comments.d.ts"/>
/// <reference path="./sinecurvebasestrumrenderer.ts"/>

/**
 * Render note for given strum
 * 
 * @class ScrollingTabNotesRenderer
 * @extends {SineCurveBaseStrumRenderer}
 * @implements {IStrumRenderer}
 */
class ScrollingTabNotesRenderer extends SineCurveBaseStrumRenderer 
                                                    implements IStrumRenderer {

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        super(renderer,game,strum);
        // TODO: Create stuff
        throw "To be completed"    }
                                                    
    moveTo(pos: number) {
        // TODO: Move stuff.
    }

    highlightStrumObjects(highlight: boolean, percent: number) {
        throw new Error("Method not implemented.");
    }
    
    destroy(): void {
        // TODO: Delete stuff
        super.destroy();
    }
}

