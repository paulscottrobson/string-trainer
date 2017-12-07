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

    private buttons:Phaser.Image[];
    private text:Phaser.BitmapText[];

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        super(renderer,game,strum);
        this.buttons = [];
        this.text = [];

        var fretting:number[] = strum.getStrum();
        var height:number = Math.abs(ScrollingTabRenderManager.getStringY(1)-
                                     ScrollingTabRenderManager.getStringY(0));
        var width:number = this.getStrumWidth();                                    
        for (var s = 0;s < Configuration.strings;s++) {
            this.buttons[s] = null;
            this.text[s] = null;
            if (fretting[s] != Strum.NOSTRUM) {
                var btn:string = "notebutton_up_66";
                this.buttons[s] = game.add.image(10,
                                                 ScrollingTabRenderManager.getStringY(s),
                                                 "sprites",btn);
                this.buttons[s].width = width;
                this.buttons[s].height = height * 0.9;
                this.buttons[s].tint = BaseRenderManager.getColour(fretting[s]);
                this.buttons[s].anchor.x = this.buttons[s].anchor.y = 0.5;
                var txt:string = Configuration.instrument.getDisplayName(fretting[s]);
                this.text[s] = game.add.bitmapText(0,this.buttons[s].y,
                                                "dfont",txt,
                                                this.buttons[s].height*0.6);
                this.text[s].anchor.x = this.text[s].anchor.y = 0.5;                                                
            }
        }
    }
                                                    
    moveTo(pos: number) {
        var x:number = pos+this.getStrumCentre();
        for (var s = 0;s < Configuration.strings;s++) {
            if (this.buttons[s] != null) {
                this.buttons[s].x = x;
                this.text[s].x = x;
                this.buttons[s].bringToTop();
                this.game.world.bringToTop(this.text[s]);
            }            
        }
    }

    highlightStrumObjects(highlight: boolean, percent: number) {
        throw new Error("Method not implemented.");
    }
    
    destroy(): void {
        for (var b of this.buttons) {
            if (b != null) b.destroy();
        }
        for (var t of this.text) {
            if (t != null) t.destroy();
        }
        this.text = this.buttons = null;
        super.destroy();
    }
}

