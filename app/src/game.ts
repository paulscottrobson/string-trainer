/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    private static VERSION:string="0.01 02Nov17 Phaser-CE 2.8.7";

    public music:IMusic;
    public position:number;
    public renderManager:IRenderManager;

    create() {
        // Create music object
        var musicJson:any = this.game.cache.getJSON("music");
        this.music = new Music(musicJson);
        // Set up the display
        Configurator.setup(this.game,this.music.getStringCount());
        var bgr:Background = new Background(this.game);

        this.position = 0;
        this.renderManager = new RenderManager(this.game,this.music);
        //this.renderManager.addStrumEventHandler(this.play,this);
    }
    
    destroy() : void {
        this.renderManager.destroy();
        this.music = this.renderManager = null;
    }

    update() : void {
        this.position += 0.005;
        this.renderManager.moveTo(this.position);
    }
}    
