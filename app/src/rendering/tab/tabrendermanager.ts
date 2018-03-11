/// <reference path="../../../lib/phaser.comments.d.ts"/>

class TabRenderManager extends BaseRenderManager implements IRenderManager {

    public static renderWidth;
    public static renderHeight;
    public static renderPerLine;
    public static marker:Phaser.Image;
    private background:Phaser.Image;

    constructor(game:Phaser.Game,music:IMusic) {
        super(game,music);
        TabRenderManager.renderPerLine = 3;
        TabRenderManager.renderWidth = Configuration.width/TabRenderManager.renderPerLine;
        TabRenderManager.renderHeight = TabRenderManager.renderWidth / 2;
    }

    createRenderer(manager: IRenderManager, game: Phaser.Game, bar: IBar): IRenderer {
        return new TabRenderer(this,this.game,bar);
    }    

    createFixed(game: Phaser.Game): void {
        var marker:Phaser.Image = game.add.image(0,0,"sprites","rectangle");
        marker.anchor.x = marker.anchor.y = 0.5;
        marker.width = TabRenderManager.renderWidth / 7;
        marker.height = TabRenderManager.renderHeight * 0.9;
        marker.tint = 0x808080;marker.alpha = 0.5;
        TabRenderManager.marker = marker;
        this.background = game.add.image(0,0,"sprites","rectangle");
        this.background.width = Configuration.width;
        this.background.height = Configuration.yBase;
    }

    destroyFixed(): void {
        TabRenderManager.marker.destroy();TabRenderManager.marker = null;
        this.background.destroy();this.background = null;
    }

    moveTo(barPosition: number): void {
        super.moveTo(barPosition);
        if (barPosition == 0) {
            for (var bn:number = 0;bn < this.music.getBarCount();bn++) {
                this.renderers[bn].moveTo(0);
            }                
        }
    }    
}