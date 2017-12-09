/// <reference path="../../../lib/phaser.comments.d.ts"/>

class ProjectedRenderer extends BaseRenderer implements IRenderer {

    moveNonStrumItemsTo(barPosition: number): void {
        // TODO:
    }
    createNonStrumItems(): void {
        // TODO:
    }
    destroyNonStrumItems(): void {
        // TODO:
    }
    createStrumRenderer(renderer: IRenderer, game: Phaser.Game, strum: IStrum): IStrumRenderer {
        return new ProjectedStrumRenderer(this,this.game,strum);
    }
    isVisible(pos: number): boolean {
        return true;
    }
    
}