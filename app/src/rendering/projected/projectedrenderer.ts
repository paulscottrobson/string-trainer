/// <reference path="../../../lib/phaser.comments.d.ts"/>

class ProjectedRenderer extends BaseRenderer implements IRenderer {

    private beatLines:Phaser.Image[];

    moveNonStrumItemsTo(barPosition: number): void {
        for (var b = 0;b < this.beatLines.length;b++) {
            var y:number = barPosition + ProjectedRenderManager.yPerBar * b / this.beatLines.length;
            this.beatLines[b].visible = (y >= 0);
            this.beatLines[b].y = ProjectedRenderManager.yPos(0,y);
            this.beatLines[b].width = ProjectedRenderManager.xPos(0,y)-
                    ProjectedRenderManager.xPos(Configuration.strings-1,y);
        }
    }

    createNonStrumItems(): void {
        this.beatLines = [];
        for (var b = 0;b < this.bar.getMusic().getBeats();b++) {
            var bi:Phaser.Image = this.game.add.image(Configuration.width/2,32,"sprites","rectangle");
            bi.anchor.x = bi.anchor.y = 0.5; bi.height = 2;
            bi.tint = (b == 0) ? 0xFFD700:0x000000;
            this.beatLines[b] = bi;
        }
    }

    destroyNonStrumItems(): void {
        for (var bi of this.beatLines) bi.destroy();
        this.beatLines = [];
    }

    createStrumRenderer(renderer: IRenderer, game: Phaser.Game, strum: IStrum): IStrumRenderer {
        return new ProjectedStrumRenderer(this,this.game,strum);
    }

    isVisible(pos: number): boolean {
        if (pos < -ProjectedRenderManager.yPerBar) return false;
        if (pos > 1000) return false;
        return true;
    }
    
}