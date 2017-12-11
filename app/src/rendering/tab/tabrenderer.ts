/// <reference path="../../../lib/phaser.comments.d.ts"/>

class TabRenderer extends BaseRenderer implements IRenderer {

    private fixed:Phaser.Group;

    moveNonStrumItemsTo(barPosition: number): void {
        var bn:number = this.bar.getBarNumber();
        this.fixed.x = (bn % TabRenderManager.renderPerLine) * 
                                        TabRenderManager.renderWidth;
        this.fixed.y = Math.floor(bn / TabRenderManager.renderPerLine)*
                                        TabRenderManager.renderHeight;                                            
    }

    createNonStrumItems(): void {
        this.fixed = new Phaser.Group(this.game);
        //var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","rectangle",this.fixed);
        //bgr.width = TabRenderManager.renderWidth - 0;
        //bgr.height = TabRenderManager.renderHeight - 0;
        for (var s:number = 0;s < Configuration.strings;s++) {
            var str:Phaser.Image = this.game.add.image(0,0,"sprites","rectangle",this.fixed);
            str.width = TabRenderManager.renderWidth;
            str.height = Math.max(1,TabRenderManager.renderHeight/64);
            str.anchor.y = 0.5;str.tint = 0;str.alpha = 0.5;
            str.x = 0;str.y = TabRenderer.yString(s);
            //if (s == 0) str.tint = 0xFF8000;
        }
        for (var be:number = 0;be < 2;be++) {
            var ben:Phaser.Image = this.game.add.image((be == 0) ? 0 : TabRenderManager.renderWidth,TabRenderManager.renderHeight/2,"sprites","rectangle",this.fixed);            
            ben.width = Math.max(2,TabRenderManager.renderWidth/32);
            ben.height = TabRenderer.yString(0)-TabRenderer.yString(Configuration.strings-1);
            ben.anchor.x = ben.anchor.y = 0.5;ben.tint = 0;
        }
    }

    destroyNonStrumItems(): void {
        this.fixed.destroy();
        this.fixed = null;
    }

    createStrumRenderer(renderer: IRenderer, game: Phaser.Game, strum: IStrum): IStrumRenderer {
        return new TabStrumRenderer(this,this.game,strum);
    }

    isVisible(pos: number): boolean {
        return true;
    }

    public static xNote(strum:IStrum): number {
        var prop:number = strum.getQBStart() / 
                                    (strum.getBar().getMusic().getBeats()*4);
                            
        prop = prop * 0.9 + 0.1;
        return Math.round(prop * TabRenderManager.renderWidth);
    }

    public static yString(str:number): number {
        if (!Configuration.instrument.isTabInverted()) {
            str = Configuration.strings-1-str;
        }
        return TabRenderManager.renderHeight/2 + 
                TabRenderManager.renderHeight * 
                    (str - (Configuration.strings-1)/2) / (Configuration.strings+1);
    }

    public getXBox():number { return this.fixed.x; }
    public getYBox():number { return this.fixed.y; }
}