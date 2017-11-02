/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    private static VERSION:string="0.01 02Nov17 Phaser-CE 2.8.7";

    public music:IMusic;

    create() {
        // Create music object
        var musicJson:any = this.game.cache.getJSON("music");
        this.music = new Music(musicJson);
        // Set up the display
        Configurator.setup(this.game,this.music.getStringCount());
        var bgr:Background = new Background(this.game);

        var r:Renderer = new Renderer(this.game,this.music.getBar(0));
        r.moveTo(100);
        var r2:Renderer = new Renderer(this.game,this.music.getBar(1));
        r2.moveTo(100+Configurator.barWidth);

        //r.destroy();
    }

    destroy() : void {
    }

    update() : void {
    }
}    
