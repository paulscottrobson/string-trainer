/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Main Game class.
 * 
 * @class MainState
 * @extends {Phaser.State}
 */
class MainState extends Phaser.State {

    public static VERSION:string="0.02 08-Jun-18 Phaser-CE 2.8.7 (c) PSR 2017,8";
    private music:IMusic;
    private speedControl:SpeedArrow;
    private positionControl:PositionBar;    
    private lyricDisplay:LyricBar;
    private metronome:Metronome;
    private player:Player;
    private manager:IRenderManager = null;
    private pos:number = 0;
    private lastQBeat = -1;
    private lastBar = -1;
    private managerIndex:number = 0;
    private background:Background;
    private title:Phaser.BitmapText;
    init() {
        // Initialise config
        Configuration.initialise(this.game);
        // Load in music
        var json:any = this.game.cache.getJSON("music");
        this.music = new Music(json);
        // Set current instrument
        Configuration.instrument = InstrumentDB.get()
                                    .find(this.music.getInstrumentShortName());
        Configuration.strings = Configuration.instrument.getStringCount();
    }

    create() {    
        // Add fixed entities
        this.background = new Background(this.game,this);
        this.lyricDisplay = new LyricBar(this.game);
        this.speedControl = new SpeedArrow(this.game);
        this.positionControl = new PositionBar(this.game,this.music,40,Configuration.width-Configuration.lyricSize - Configuration.controlHeight-32,Configuration.height-Configuration.controlHeight/2);
        this.metronome = new Metronome(this.game,this.music);
        this.player = new Player(this.game,this.music);
        this.title = this.game.add.bitmapText(0,0,"font",MainState.VERSION,Configuration.controlHeight/4);
        this.title.x = Configuration.width/2;this.title.y = Configuration.height;
        this.title.anchor.x = 0.5;this.title.anchor.y = 1;
        this.title.tint = 0xFFC000;
        // Go to first render manager.
        this.nextManager();
        //this.nextManager();
        //this.nextManager();
    }
    
    nextManager() : void {
        // Delete old one.
        if (this.manager != null) {
            this.manager.destroy();
            this.manager = null;
        }
        // Create new one.
        if (this.managerIndex == 0) 
            this.manager = new ScrollingTabRenderManager(this.game,this.music);
        if (this.managerIndex == 1) 
            this.manager = new ProjectedRenderManager(this.game,this.music);
        if (this.managerIndex == 2) 
            this.manager = new TabRenderManager(this.game,this.music);

        // Restart position
        this.manager.create();
        this.manager.moveTo(0);
        this.pos = 0;this.lastBar = this.lastQBeat = -1;
        // Advance counter
        this.managerIndex++;
        if (this.managerIndex == 3) 
            this.managerIndex = 0;
                    
    }

    destroy() : void {
        this.background.destroy();
        this.speedControl.destroy();
        this.positionControl.destroy();
        this.lyricDisplay.destroy();
        this.metronome.destroy();
        this.player.destroy();
        this.background = this.speedControl = this.positionControl = null;
        this.lyricDisplay = this.metronome = this.player = null;
        this.background = null;
    }

    update() : void {
        // Time in milliseconds
        var elapsedMS:number = this.game.time.elapsedMS;
        // Beats per millisecond
        var bpms:number = this.music.getTempo() / 60 / 1000;
        // Bars per millisecond
        bpms = bpms / this.music.getBeats() * this.speedControl.getScalar();
        //bpms = 0;
        // Work out new position.
        this.pos = Math.min(this.music.getBarCount(),this.pos + bpms * elapsedMS);
        this.pos = this.positionControl.updatePosition(this.pos);
        this.pos = Math.min(this.music.getBarCount(),this.pos);
        this.pos = Math.max(0,this.pos);
        this.speedControl.updateRotate(elapsedMS);
        this.manager.moveTo(this.pos);
        // Work out new bar / quarterbeat
        var bar:number = Math.floor(this.pos);
        var qBeat:number = Math.floor((this.pos-bar) * 4 * this.music.getBeats());
        // Have we changed to a new bar or a new quarterbeat position.
        if (bar != this.lastBar || qBeat != this.lastQBeat) {
            if (bar < this.music.getBarCount()) {
                // Start of bar, set lyric.
                if (qBeat == 0) {
                    this.lyricDisplay.setLyric(this.music.getBar(bar).getLyric());
                }
                this.player.update(bar,qBeat);
                this.metronome.update(bar,qBeat);
                this.lastBar = bar;
                this.lastQBeat = qBeat;
            }
        }

    }
}    
