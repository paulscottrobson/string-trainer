/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    private static VERSION:string="0.01 02Nov17 Phaser-CE 2.8.7";

    public music:IMusic;
    public player:MusicPlayer;
    public position:number;
    public renderManager:IRenderManager;

    create() {
        // Create music object
        var musicJson:any = this.game.cache.getJSON("music");
        this.music = new Music(musicJson);
        // Create configuration
        Configurator.setup(this.game,this.music.getStringCount());
        // Create player
        this.player = new MusicPlayer(this.game,
                        this.music.getStringCount(),this.music.getTuning())
        // Set up the display
        var bgr:Background = new Background(this.game);

        this.position = 0;
        this.renderManager = new RenderManager(this.game,this.music);
        this.renderManager.addStrumEventHandler(this.player.strum,this.player);
        //this.renderManager.addStrumEventHandler(this.play,this);
    }
    
    destroy() : void {
        this.renderManager.destroy();
        this.music = this.renderManager = null;
    }

    update() : void {
        // Time in milliseconds
        var elapsed:number = this.game.time.elapsedMS;
        // Time in seconds
        elapsed = elapsed / 1000;
        // Beats per millisecond
        var bpms:number = this.music.getTempo() / 60;
        this.position = this.position + bpms * elapsed 
                                        / this.music.getBeats();
        this.renderManager.moveTo(this.position);
    }
}    
