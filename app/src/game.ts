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
        console.log(Configuration.instrument.getLongName());                                    
        Configuration.strings = Configuration.instrument.getStringCount();
        console.log(Configuration.strings);                                    
    }

    create() {    
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
        this.pos = Math.min(this.music.getBarCount(),this.pos + 0.02);
        this.manager.moveTo(this.pos);


    }
}    
