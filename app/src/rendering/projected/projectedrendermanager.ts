/// <reference path="../../../lib/phaser.comments.d.ts"/>

class ProjectedRenderManager extends BaseRenderManager implements IRenderManager {
 
    public static yFront:number;
    public static yPerBar:number;

    public fixed:Phaser.Group;

    constructor(game:Phaser.Game,music:IMusic) {
        super(game,music);
        ProjectedRenderManager.yFront = Configuration.yBase - 10;        
        ProjectedRenderManager.yPerBar = 550;
    }

    createRenderer(manager: IRenderManager, game: Phaser.Game, bar: IBar): IRenderer {
        return new ProjectedRenderer(this,this.game,bar);
    }    

    createFixed(game: Phaser.Game): void {
        this.fixed = new Phaser.Group(game);
        for (var s:number = 0;s < Configuration.strings;s++) {
            var dbl:boolean = Configuration.instrument.isDoubleString(s);
            var dx:number = ProjectedRenderManager.xPos(s,0)-
                                    ProjectedRenderManager.xPos(s,1000);
            var dy:number = ProjectedRenderManager.yPos(s,0)-
                                    ProjectedRenderManager.yPos(s,1000);
            var adj:number = Math.atan2(dy,dx);                                    
            var rail:Phaser.Image = game.add.image(0,0,"sprites",dbl ? "dstring":"string",this.fixed);
            rail.x = ProjectedRenderManager.xPos(s,0);
            rail.y = ProjectedRenderManager.yPos(s,0);
            rail.width = game.height * 3 / 2;            
            rail.height = dbl ? 20:10;
            rail.anchor.x = 1;rail.anchor.y = 0.5;
            rail.rotation = adj;
            /*
            for (var y:number = 0;y <= 1000;y += 100) {
                var i:Phaser.Image = game.add.image(0,0,"sprites","rectangle",this.fixed);
                i.width = i.height = 9;i.anchor.x = i.anchor.y = 0.5;
                i.x = ProjectedRenderManager.xPos(s,y);
                i.y = ProjectedRenderManager.yPos(s,y);
                if (y > 0) i.tint = 0x00FF00;
                if (y == 1000) i.tint = 0xFF0000;
            }
            */
        }
    }
    destroyFixed(): void {
        this.fixed.destroy();
    }

    moveTo(barPosition: number): void {
        super.moveTo(barPosition);
        for (var bn:number = 0;bn < this.music.getBarCount();bn++) {
            this.renderers[bn].moveTo((bn-barPosition) * ProjectedRenderManager.yPerBar);
        }
    }    

    public static xPos(str:number,yl:number): number {
        yl = ProjectedRenderManager.yPos(str,yl);
        var xs:number =  0.1*(str-(Configuration.strings-1)/2) * 
                         Configuration.width / (Configuration.strings-1);
        xs = xs * (1+yl/120);
        return xs + Configuration.width / 2;
    }

    public static yPos(str:number,y:number): number {
        var camera:number = 500;
        y = ProjectedRenderManager.yFront - 
            (1-camera/(y+camera))*(ProjectedRenderManager.yFront-200)*2.1;        
        return y;
    }
    
}