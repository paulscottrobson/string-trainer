/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Class responsible for rendering a bar.
 * 
 * @class Renderer
 * @extends {Phaser.Group}
 */
class Renderer extends Phaser.Group implements IRenderer {

    private static DEBUG:boolean = false;

    private static sineCurveInfo:any;

    private isRendered:boolean;
    private debugRect:Phaser.Image;
    private bar:IBar;
    private beats:number;
    private beatLines:Phaser.Image[];
    private buttons:IButton[][];
    private sineCurves:Phaser.Image[];
    private sineCurveHeight:number[];
    private index:number;

    constructor(game:Phaser.Game,bar:IBar,index:number) {
        super(game);
        this.bar = bar;
        this.isRendered = false;
        this.index = index;
        this.beats = this.bar.getMusic().getBeats();
        if (Renderer.sineCurveInfo == null) {
            Renderer.loadSineCurveInfo(game);
        }
    }

    destroy() : void {
        if (this.isRendered) { this.deleteRender(); }
        super.destroy();
        this.bar = null;
    }

    /**
     * Create graphic objects for this renderer.
     * 
     * @private
     * @returns {void} 
     * @memberof Renderer
     */
    private createRender(): void {
        if (this.isRendered) return;
        this.isRendered = true;
        // Debug rectangle
        if (Renderer.DEBUG) {
            this.debugRect = this.game.add.image(0,0,"sprites","rectangle",this);
            this.debugRect.width = Configurator.barWidth;
            this.debugRect.height = Configurator.stringGap + Configurator.stringMargin * 2;
            this.debugRect.tint = 0xFF8000;
            this.debugRect.alpha = 0.2;
        }
        // Beat lines.
        this.beatLines = [];
        var n:number = this.beats;
        var lastBar:number = this.bar.getMusic().getBarCount()-1;
        if (this.bar == this.bar.getMusic().getBar(lastBar)) { n = n + 1;}
        for (var b:number = 0;b < n;b++) {
            this.beatLines[b] = this.game.add.image(0,0,"sprites","rectangle",this);
            this.beatLines[b].width = Math.max(this.game.width/512,1);
            if (b == 0 || b >= this.beats) {
                this.beatLines[b].height = this.game.height;
                this.beatLines[b].tint = 0x0080FF;
                this.beatLines[b].width = Math.max(this.game.width/512,1);
            } else {
                this.beatLines[b].height = Configurator.stringGap + Configurator.stringMargin * 2;                
                this.beatLines[b].tint = 0x000000;
                this.beatLines[b].width = 1;
            }
            this.beatLines[b].anchor.x = 0.5;
            this.beatLines[b].anchor.y = 1.0;
        }
        // Buttons
        this.buttons = [];
        for (var sn:number = 0;sn < this.bar.getStrumCount();sn++) {
            this.buttons[sn] = [];
            var strum:IStrum = this.bar.getStrum(sn);
            var w:number = Configurator.barWidth / this.beats * (strum.getLength() / 12);
            if (strum.isChord()) {
                var btn:IButton;
                var cn:number = this.bar.getMusic().getChordNumber(strum.getChordName());
                btn = new StrumButton(this.game,w-2,strum.getChordName(),strum.isChordDownStrum(),cn);                
                this.buttons[sn].push(btn);
            } else {
                var sCount:number = this.bar.getMusic().getStringCount();
                for (var strn:number = 0;strn < sCount;strn++) {
                    var fretPos:number = strum.getStringFret(strn);
                    if (fretPos != Strum.NOSTRUM) {
                        var btn:IButton;
                        btn = new FingerButton(this.game,strn,fretPos,w);
                        this.buttons[sn].push(btn);
                    }
                }
            }
        }
        // Sine curves
        this.sineCurves = [];
        this.sineCurveHeight = [];
        for (var sn:number = 0;sn < this.bar.getStrumCount();sn++) {
            var strum:IStrum = this.bar.getStrum(sn);
            var w:number = Configurator.barWidth / this.beats * (strum.getLength() / 12);
            var name:string = this.getBestSineCurve(w);
            this.sineCurves[sn] = this.game.add.image(0,0,"sprites",name,this);
            this.sineCurves[sn].width = w;
            this.sineCurves[sn].height = this.sineCurves[sn].height * Configurator.bounceHeightScale;
            this.sineCurves[sn].anchor.y = 1;
            this.sineCurveHeight[sn] = this.sineCurves[sn].height;
        }
    }

    getSineCurveHeight(strumID:number) : number {
        return this.sineCurveHeight[strumID];
    }

    /**
     * Move the rendered bar horizontally. Creates if not created and
     * on screen, deletes if off screen.
     * 
     * @param {number} x 
     * @returns 
     * @memberof Renderer
     */
    public moveTo(x:number):void {
        // Handle off screen.
        if (x > this.game.width || x + Configurator.barWidth < 0) {
            if (this.isRendered) { 
                this.deleteRender();
            }
            return;
        }
        if (!this.isRendered) {
            this.createRender();
        }
        // Debug rectangle
        if (this.debugRect != null) {
            this.debugRect.x = x;
            this.debugRect.y = Configurator.yTop;
        }
        // Beat lines.
        for (var b:number = 0;b < this.beatLines.length;b++) {
            this.beatLines[b].x = x + b * Configurator.barWidth / this.beats;
            this.beatLines[b].y = Configurator.yTop + Configurator.stringMargin * 2 + Configurator.stringGap;
        }
        // Buttons & curves
        for (var sn:number = 0;sn < this.bar.getStrumCount();sn++) {
            var strum:IStrum = this.bar.getStrum(sn);
            var x1:number = x + strum.getStartTime()/12 * Configurator.barWidth / this.beats;
            for (var bt of this.buttons[sn]) {
                bt.moveTo(x1);
            }            
            this.sineCurves[sn].x = x1;
            this.sineCurves[sn].y = Configurator.yTop;
        }
    }

    /**
     * Delete all rendered objects.
     * 
     * @private
     * @returns {void} 
     * @memberof Renderer
     */
    private deleteRender(): void {
        if (!this.isRendered) return;
        this.isRendered = false;
        this.removeChildren();
        this.sineCurves = this.buttons = this.beatLines = null;
        this.sineCurveHeight = this.debugRect = null;
    }

    /**
     * Get the name of the sine curve to use to best show a given
     * width.
     * 
     * @private
     * @param {number} wReq required width
     * @returns sprite name
     * @memberof Renderer
     */
    private getBestSineCurve(wReq:number) {
        var bestWidth:number = 99999;
        var result:string = "?????";
        for (var names in Renderer.sineCurveInfo) {
            var diff:number = Math.abs(Renderer.sineCurveInfo[names] - wReq);
            if (diff < bestWidth) {
                bestWidth = diff;
                result = names;
            }
        }
        return result;
    }
    /**
     * Load in information about sine curves.
     * 
     * @private
     * @static
     * @memberof Renderer
     */
    private static loadSineCurveInfo(game:Phaser.Game):void {
        Renderer.sineCurveInfo = {};
        var json:any = game.cache.getJSON("sprites")["frames"];
        for (var spr in json) {
            if (spr.substr(0,9) == "sinecurve") {
                var frame:any = json[spr]["frame"]
                var wReq = frame["w"];
                Renderer.sineCurveInfo[spr] = wReq;
            }
        }
    }
}
