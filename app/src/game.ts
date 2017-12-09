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
    private manager:IRenderManager;
    private pos:number = 0;

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
        var i:Phaser.Image = this.game.add.image(0,Configuration.yBase,"sprites","rectangle");
        i.width = Configuration.width-Configuration.lyricSize - Configuration.controlHeight;
        i.height = Configuration.lyricSize;
        i.tint = 0xFFFF00;
        
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

        this.speedControl.updateRotate(elapsedMS);
        this.manager.moveTo(this.pos);


    }
}    
