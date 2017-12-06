/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Renderer for Scrolling TAB
 * 
 * @class ScrollingTabRenderer
 * @extends {BaseRenderer}
 * @implements {IRenderer}
 */
class ScrollingTabRenderer extends BaseRenderer implements IRenderer {

    private beatBars:Phaser.Image[];

    moveNonStrumItemsTo(pos: number): void {
        for (var b = 0;b < this.beatBars.length;b++) {
            this.beatBars[b].x = pos + ScrollingTabRenderManager.xBarSize * b / this.beatBars.length;
        }
    }

    createNonStrumItems(): void {
        this.beatBars = [];
        for (var b = 0;b < this.bar.getMusic().getBeats();b++) {
            this.beatBars[b] = this.game.add.image(0,
                        ScrollingTabRenderManager.centreFretboard,"sprites","rectangle");
            this.beatBars[b].width = 2;this.beatBars[b].tint = 0x000000;
            this.beatBars[b].height = ScrollingTabRenderManager.fretBoardStringSize;
            this.beatBars[b].anchor.x = this.beatBars[b].anchor.y = 0.5;                        
            if (b == 0) {
                this.beatBars[b].width *= 4;
                this.beatBars[b].tint = 0xFFD700;
            }
        }
    }

    destroyNonStrumItems(): void {        
        for (var bb of this.beatBars) bb.destroy();
        this.beatBars = null;
    }

    createStrumRenderer(renderer:IRenderer,game:Phaser.Game,strum:IStrum): IStrumRenderer {
        if (strum.getChord() != "") {
            return new ScrollingTabChordsRenderer(renderer,game,strum);          
        } else {
            return new ScrollingTabNotesRenderer(renderer,game,strum);
        }
    }

    isVisible(pos:number): boolean {
        if (pos > Configuration.width) return false;
        if (pos < -ScrollingTabRenderManager.xBarSize) return false;
        return true;
    }

}
