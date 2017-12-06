/// <reference path="../../../lib/phaser.comments.d.ts"/>
/// <reference path="./sinecurvebasestrumrenderer.ts"/>

class ScrollingTabNotesRenderer extends SineCurveBaseStrumRenderer 
                                                    implements IStrumRenderer {

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        super(renderer,game,strum);
        // TODO: Create stuff
    }
                                                    
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

