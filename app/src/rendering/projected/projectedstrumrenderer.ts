/// <reference path="../../../lib/phaser.comments.d.ts"/>

class ProjectedStrumRenderer  implements IStrumRenderer {

    private label:Phaser.BitmapText[];
    private spheres:Phaser.Image[];
    private strum:IStrum;

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        this.label = [];
        this.spheres = [];
        this.strum = strum;
        var fretting:number[] = strum.getStrum();
        for (var s = 0;s < Configuration.strings;s++) {
            this.label[s] = null;this.spheres[s] = null;
            if (fretting[s] != Strum.NOSTRUM) {
                var col:string = ProjectedStrumRenderer.COLOURS[fretting[s] % ProjectedStrumRenderer.COLOURS.length];
                this.spheres[s] = game.add.image(0,0,"sprites",col);
                this.spheres[s].anchor.x = 0.5;this.spheres[s].anchor.y = 1;
                var t:string = Configuration.instrument.getDisplayName(fretting[s]);
                this.label[s] = game.add.bitmapText(0,0,"dfont",t,32);
                this.label[s].anchor.x = 0.5;this.label[s].anchor.y = 0.5;
            }
        }    
    }   

    moveTo(pos: number) {
        var beats:number = this.strum.getBar().getMusic().getBeats();
        var y:number = pos + this.strum.getQBStart()/(beats*4)*ProjectedRenderManager.yPerBar;
        var size:number = Math.abs(ProjectedRenderManager.xPos(0,y)-ProjectedRenderManager.xPos(1,y));
        for (var s = 0;s < Configuration.strings;s++) {
            if (this.label[s] != null) {
                this.spheres[s].x = ProjectedRenderManager.xPos(s,y);
                this.spheres[s].y = ProjectedRenderManager.yPos(s,y);
                this.spheres[s].width = this.spheres[s].height = (1000-y)/8+10;
                this.label[s].x = this.spheres[s].x;
                this.label[s].y = this.spheres[s].y - this.spheres[s].height/2;
                this.spheres[s].visible = this.label[s].visible = (y > 0);
                this.label[s].fontSize = this.spheres[s].height * 0.6;
            }
        }
    }
    
    highlightStrumObjects(highlight: boolean, percent: number) {        
    }

    destroy(): void {
        for (var s of this.label) {
            if (s != null) s.destroy();
        }
        for (var s1 of this.spheres) {
            if (s1 != null) s1.destroy();
        }
        this.spheres = this.strum = this.label = null;
    }
    
    private static COLOURS:string[] = [
        "spcyan","spgrey","spred", "spblue","spdarkgreen",
        "spmagenta","spyellow", "spbrown","spgreen","sporange"
    ];
}