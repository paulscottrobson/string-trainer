/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    public static VERSION:string="0.01 26-Nov-17 Phaser-CE 2.8.7 (c) PSR 2017";
    private music:IMusic;
    private manager:IRenderManager;

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
    }
}    
