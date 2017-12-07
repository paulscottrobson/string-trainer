/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Render manager for horizontally scrolling tab
 * 
 * @class ScrollingTabRenderManager
 * @extends {BaseRenderManager}
 * @implements {IRenderManager}
 */
class ScrollingTabRenderManager extends BaseRenderManager implements IRenderManager {

    public static centreFretboard;
    public static fretBoardStringSize;
    public static fretBoardTotalSize;
    public static sineCurveHeight;
    public static xStartPoint;
    public static xBarSize;

    private mainBoard:Phaser.Image;
    private fretBoard:Phaser.Image;
    private strings:Phaser.Image[];

    constructor(game:Phaser.Game,music:IMusic) {
        super(game,music);
        // Calculate positions and sizes of things.
        ScrollingTabRenderManager.fretBoardTotalSize = Configuration.yBase * 0.5;
        ScrollingTabRenderManager.fretBoardStringSize = 
                ScrollingTabRenderManager.fretBoardTotalSize * 0.85;
        ScrollingTabRenderManager.centreFretboard = 
                Configuration.yBase - ScrollingTabRenderManager.fretBoardTotalSize / 2;                        
        ScrollingTabRenderManager.sineCurveHeight = 
                ScrollingTabRenderManager.fretBoardTotalSize / 3;                
        ScrollingTabRenderManager.xStartPoint = 
                Configuration.width * 0.15;
        ScrollingTabRenderManager.xBarSize = 
                Configuration.width * 0.35;
    }

    createRenderer(manager:IRenderManager,game:Phaser.Game,bar: IBar): IRenderer {
        return new ScrollingTabRenderer(manager,game,bar);
    }

    moveTo(barPosition: number): void {
        for (var bn:number = 0;bn < this.music.getBarCount();bn++) {
            this.renderers[bn].moveTo(ScrollingTabRenderManager.xStartPoint + 
                                                (bn-barPosition) * ScrollingTabRenderManager.xBarSize);
        }
    }
    createFixed(game: Phaser.Game): void {
        // Fretboard Background                                    
        this.fretBoard = game.add.image(0,
                                        ScrollingTabRenderManager.centreFretboard,
                                        "sprites","rectangle");
        this.fretBoard.width = Configuration.width;
        this.fretBoard.height = ScrollingTabRenderManager.fretBoardTotalSize;
        this.fretBoard.anchor.y = 0.5;                 
        this.fretBoard.tint = 0x404040
        // Fretboard Foreground                           
        this.mainBoard = game.add.image(0,
                                        ScrollingTabRenderManager.centreFretboard,
                                        "sprites","rectangle");
        this.mainBoard.width = Configuration.width;
        this.mainBoard.height = ScrollingTabRenderManager.fretBoardStringSize;
        this.mainBoard.anchor.y = 0.5;                 
        this.mainBoard.tint = 0x381904;
        // Strings
        this.strings = [];
        for (var s = 0;s < Configuration.strings;s++) {
            var dbl:boolean = Configuration.instrument.isDoubleString(s);
            var str:Phaser.Image = this.game.add.image(0,
                                                       ScrollingTabRenderManager.getStringY(s),
                                                       "sprites",dbl ? "dstring":"string");
            str.width = Configuration.width;
            var ssc:number = (1 + (Configuration.strings-1-s)/3);
            str.height = Math.max(Configuration.height/100 * ssc * (dbl ? 2:1),1);
            str.anchor.y = 0.5;
            this.strings.push(str);                                                       
        }
    }

    destroyFixed(): void {
        for (var x of this.strings) x.destroy();
        this.fretBoard.destroy();
        this.mainBoard.destroy();
        this.strings = this.mainBoard = this.fretBoard = null;
    }

    /**
     * Get the vertical position of the central string.
     * 
     * @static
     * @param {number} n 
     * @returns {number} 
     * @memberof ScrollingTabRenderManager
     */
    public static getStringY(n:number):number {
        // Flip if not inverted (otherwise n is at the top)
        if (!Configuration.instrument.isTabInverted()) {
            n = Configuration.strings - 1 - n;
        }
        return ScrollingTabRenderManager.centreFretboard + 
            (n - (Configuration.strings-1)/2) * ScrollingTabRenderManager.fretBoardStringSize / 
            Configuration.strings;
    }
}
