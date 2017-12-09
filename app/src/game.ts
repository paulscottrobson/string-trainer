/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Main Game class.
 * 
 * @class MainState
 * @extends {Phaser.State}
 */
class MainState extends Phaser.State {

    public static VERSION:string="0.01 06-Dec-17 Phaser-CE 2.8.7 (c) PSR 2017";
    private music:IMusic;
    private speedControl:SpeedArrow;
    private positionControl:PositionBar;    
    private lyricDisplay:LyricBar;
    private metronome:Metronome;
    private player:Player;
    private manager:IRenderManager;
    private pos:number = 0;
    private lastQBeat = -1;
    private lastBar = -1;

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
        this.speedControl = new SpeedArrow(this.game);
        this.positionControl = new PositionBar(this.game,this.music,32,Configuration.width-Configuration.lyricSize - Configuration.controlHeight-32,Configuration.height-Configuration.controlHeight/2);
        this.lyricDisplay = new LyricBar(this.game);
        this.metronome = new Metronome(this.game,this.music);
        this.player = new Player(this.game,this.music);

        // Add manager
        this.manager = new ScrollingTabRenderManager(this.game,this.music);
        this.manager.create();
        this.manager.moveTo(0);
        //this.manager.destroy();
    }
    
    destroy() : void {
    }

    update() : void {
        // Time in milliseconds
        var elapsedMS:number = this.game.time.elapsedMS;
        // Beats per millisecond
        var bpms:number = this.music.getTempo() / 60 / 1000;
        // Bars per millisecond
        bpms = bpms / this.music.getBeats() * this.speedControl.getScalar();
        // Work out new position.
        this.pos = Math.min(this.music.getBarCount(),this.pos + bpms * elapsedMS);
        this.pos = this.positionControl.updatePosition(this.pos);
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
