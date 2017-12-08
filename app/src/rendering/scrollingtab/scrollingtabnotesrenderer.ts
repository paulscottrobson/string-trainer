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
    private yOffset:number = 0;
    
    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        super(renderer,game,strum);
        this.buttons = [];
        this.text = [];
        this.yOffset = 0;
        // Get fretting
        var fretting:number[] = strum.getStrum();
        // Get button size
        var height:number = Math.abs(ScrollingTabRenderManager.getStringY(1)-
                                     ScrollingTabRenderManager.getStringY(0));
        var width:number = this.getStrumWidth();                                    
        // Get button graphic
        var btn:string = this.getBestMatch(width/height);
        // For each string
        for (var s = 0;s < Configuration.strings;s++) {
            this.buttons[s] = null;
            this.text[s] = null;
            // Create button & text if needed.
            if (fretting[s] != Strum.NOSTRUM) {
                this.buttons[s] = game.add.image(0,0,
                                                 "sprites",btn);
                this.buttons[s].width = width;
                this.buttons[s].height = height * 0.9;
                this.buttons[s].tint = BaseRenderManager.getColour(fretting[s]);
                this.buttons[s].anchor.x = this.buttons[s].anchor.y = 0.5;
                var txt:string = Configuration.instrument.getDisplayName(fretting[s]);
                this.text[s] = game.add.bitmapText(0,this.buttons[s].y,
                                                "dfont",txt,
                                                this.buttons[s].height*0.6);
                this.text[s].anchor.x = 0.58;this.text[s].anchor.y = 0.5;                                                
            }
        }
    }
                                                    
    moveTo(pos: number) {
        super.moveTo(pos);
        var x:number = pos+this.getStrumCentre();
        for (var s = 0;s < Configuration.strings;s++) {
            if (this.buttons[s] != null) {
                this.buttons[s].x = x;
                this.buttons[s].y = ScrollingTabRenderManager.getStringY(s)+this.yOffset;
                
                this.text[s].x = x;
                this.text[s].y = this.buttons[s].y;
                this.buttons[s].bringToTop();
                this.game.world.bringToTop(this.text[s]);
            }            
        }
    }

    highlightStrumObjects(highlight: boolean, percent: number) {
        this.yOffset = highlight ? ScrollingTabNotesRenderer.getYDip(percent) : 0;
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

    static buttonInfo:any = null;

    /**
     * Find the best notebutton_up_x graphic to use.
     * (Analyses sprite json)
     * 
     * @param {number} aspect aspect ratio required
     * @returns {string} graphic name.
     * @memberof ScrollingTabNotesRenderer
     */
    getBestMatch(aspect:number):string {
        // If not loaded, build the aspect ratio table
        if (ScrollingTabNotesRenderer.buttonInfo == null) {
            ScrollingTabNotesRenderer.buttonInfo = {};
            var scache:any = this.game.cache.getJSON("sprite_info");
            for (var k in scache.frames) {
                if (k.substr(0,14) == "notebutton_up_") {
                    var spr:any = scache.frames[k];
                    var asp:number = spr.frame.w / spr.frame.h;                    
                    ScrollingTabNotesRenderer.buttonInfo[k] = asp;
                }
            }
        }
        var best:string;
        var bestDistance:number = 9999;
        for (var k in ScrollingTabNotesRenderer.buttonInfo) {
            var diff:number = Math.abs(aspect - ScrollingTabNotesRenderer.buttonInfo[k]);
            if (diff < bestDistance) {
                bestDistance = diff;
                best = k;
            }
        }
        return best;
    }

    public static getYDip(prop:number) :number {
        if (prop > 50) prop = 100-prop;
        return (prop < 16) ? prop : 16;
    }
}

