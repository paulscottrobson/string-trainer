/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Parent class for Strum/Chord rendering. Provides the sine curve.
 * 
 * @abstract
 * @class SineCurveBaseStrumRenderer
 * @implements {IStrumRenderer}
 */

 abstract class SineCurveBaseStrumRenderer implements IStrumRenderer {

    protected renderer:IRenderer;
    protected game:Phaser.Game;
    protected strum:IStrum;
    protected beats:number;

    protected sineCurve:Phaser.Image;

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        this.renderer = renderer;this.game = game;this.strum = strum;    
        this.beats = strum.getBar().getMusic().getBeats();
        // Create sine curve
        var width:number = this.getStrumWidth();
        var height:number = Configuration.height / 8;
        var spr:string = this.getBestMatch2(width);
        this.sineCurve = game.add.image(0,
                                        Configuration.yBase - ScrollingTabRenderManager.fretBoardTotalSize,
                                        "sprites",spr);
        this.sineCurve.anchor.x = 0.5;this.sineCurve.anchor.y = 1.0;
        var scale = width / this.sineCurve.width;
        this.sineCurve.scale.x = scale;
//        this.sineCurve.height = height;                                        
                
    }

    public getSineHeight(): number {
        return this.sineCurve.height;
    }

    protected getStrumWidth(): number {
        return this.strum.getQBLength() / (this.beats * 4) * ScrollingTabRenderManager.xBarSize;
    }

    protected getStrumCentre(): number {
        return (this.strum.getQBStart()+this.strum.getQBLength()/2) / (this.beats * 4) * ScrollingTabRenderManager.xBarSize;
    }

    destroy(): void {
        this.sineCurve.destroy();this.sineCurve = null;
        this.renderer = this.game = this.strum = null;        

    }

    moveTo(pos:number):void {
        this.sineCurve.x = pos+this.getStrumCentre();
    }

    abstract highlightStrumObjects(highlight: boolean, percent: number):void;

    private static curveInfo:any = null;
   /**
     * Find the best sinecurve_x graphic to use.
     * (Analyses sprite json)
     * 
     * @param {number} width width required
     * @returns {string} graphic name.
     * @memberof ScrollingTabNotesRenderer
     */
    getBestMatch2(width:number):string {
        // If not loaded, build the aspect ratio table
        if (SineCurveBaseStrumRenderer.curveInfo == null) {
            SineCurveBaseStrumRenderer.curveInfo = {};
            var scache:any = this.game.cache.getJSON("sprite_info");
            for (var k in scache.frames) {
                if (k.substr(0,10) == "sinecurve_") {
                    var spr:any = scache.frames[k];
                    var asp:number = spr.frame.w;                    
                    SineCurveBaseStrumRenderer.curveInfo[k] = asp;
                }
            }
        }
        var best:string;
        var bestDistance:number = 9999;
        for (var k in SineCurveBaseStrumRenderer.curveInfo) {
            var diff:number = Math.abs(width - SineCurveBaseStrumRenderer.curveInfo[k]);
            if (diff < bestDistance) {
                bestDistance = diff;
                best = k;
            }
        }
//        console.log(best,aspect);
        return best;
    }    
}

