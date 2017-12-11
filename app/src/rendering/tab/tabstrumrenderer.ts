/// <reference path="../../../lib/phaser.comments.d.ts"/>

class TabStrumRenderer  implements IStrumRenderer {

    private renderer:TabRenderer;
    private sGroup:Phaser.Group;
    private xOffset:number;

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        this.renderer = <TabRenderer>renderer;
        this.sGroup = new Phaser.Group(game);
        var x:number = TabRenderer.xNote(strum);
        this.xOffset = x;
        var fretting:number[] = strum.getStrum();
        for (var s:number = 0;s < Configuration.strings;s++) {
            if (fretting[s] != Strum.NOSTRUM) {
                var y:number = TabRenderer.yString(s);
                var stxt:string = Configuration.instrument.getDisplayName(fretting[s]);
                var txt:Phaser.BitmapText = game.add.bitmapText(x,y,"font",
                                                                stxt,
                                                                0.7*TabRenderManager.renderHeight/Configuration.strings,
                                                                this.sGroup);
                txt.anchor.x = 0.5;txt.anchor.y = 0.42;txt.tint = 0x000080;
            }
        }
    }   

    moveTo(pos: number) {
        this.sGroup.x = this.renderer.getXBox();
        this.sGroup.y = this.renderer.getYBox();
    }
    
    highlightStrumObjects(highlight: boolean, percent: number) {        
        var marker:Phaser.Image = TabRenderManager.marker;
        marker.bringToTop();
        if (highlight) {
            marker.x = this.xOffset + this.sGroup.x;
            marker.y = this.sGroup.y + TabRenderManager.renderHeight/2;
        }
    }

    destroy(): void {
        this.sGroup.destroy();this.sGroup = this.renderer = null;
    }
}