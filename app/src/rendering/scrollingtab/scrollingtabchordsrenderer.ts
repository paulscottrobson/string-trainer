/// <reference path="../../../lib/phaser.comments.d.ts"/>
/// <reference path="./sinecurvebasestrumrenderer.ts"/>

/**
 * Renders chord for given strum.
 * 
 * @class ScrollingTabChordsRenderer
 * @extends {SineCurveBaseStrumRenderer}
 * @implements {IStrumRenderer}
 */
class ScrollingTabChordsRenderer extends SineCurveBaseStrumRenderer 
                                                    implements IStrumRenderer {

    private button:Phaser.Image;
    private label:Phaser.BitmapText;

    constructor(renderer:IRenderer,game:Phaser.Game,strum:IStrum) {
        super(renderer,game,strum);
        var tm:number = Math.floor(strum.getQBStart()/2);
        this.button = game.add.image(0,ScrollingTabRenderManager.centreFretboard,
                                     "sprites",
                                     tm % 2 == 0 ? "chordbutton_down":"chordbutton_up");
        this.button.anchor.x = 0;this.button.anchor.y = 0.5;
        //this.button.width = this.getStrumWidth()*0.97;
        this.button.width = ScrollingTabRenderManager.xBarSize / (this.beats*2) * 0.97;
        this.button.height = ScrollingTabRenderManager.fretBoardStringSize*0.95;
        this.button.tint = this.getChordColour(strum.getChord());
        var size:number = ScrollingTabRenderManager.xBarSize / this.beats / 2 * 0.45;
        var cName:string = strum.getChord().toLowerCase();
        cName = cName.charAt(0).toUpperCase()+cName.substr(1);
        this.label = game.add.bitmapText(0,this.button.y + ScrollingTabRenderManager.fretBoardStringSize * 0.3,
                                        "dfont",cName,size);
        this.label.anchor.x = 0.5;this.label.anchor.y = 0.5 ;                                            
    }
                                                    
    moveTo(pos: number) {
        super.moveTo(pos);
        this.button.x = pos+this.getStrumCentre()-this.getStrumWidth()/2;
        this.label.x = this.button.x + this.button.width / 2;
    }

    highlightStrumObjects(highlight: boolean, percent: number) {
        throw new Error("Method not implemented.");
    }
    
    destroy(): void {
        this.button.destroy();this.label.destroy();
        this.button = this.label = null;
        super.destroy();
    }

    private static chordsUsed:any = null;

    /**
     * Check the whole piece for which chords are used so we can 
     * assign individual colours to them.
     * 
     * @param {any} name 
     * @returns {number} 
     * @memberof ScrollingTabChordsRenderer
     */
    getChordColour(name): number {
        if (ScrollingTabChordsRenderer.chordsUsed == null) {
            ScrollingTabChordsRenderer.chordsUsed = { "":null };
            var cc:number = 0;
            var m:IMusic = this.strum.getBar().getMusic();
            for (var bn:number = 0;bn < m.getBarCount();bn++) {
                for (var sn:number = 0;sn < m.getBar(bn).getStrumCount();sn++) {
                    var cName:string = m.getBar(bn).getStrum(sn).getChord();
                    if (ScrollingTabChordsRenderer.chordsUsed[cName] == undefined) {
                        ScrollingTabChordsRenderer.chordsUsed[cName] = cc;
                        cc++;
                    }
                }
            }
        }
        return BaseRenderManager.getColour(ScrollingTabChordsRenderer.chordsUsed[name]);
    }
}

