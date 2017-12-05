/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    public static VERSION:string="0.01 26-Nov-17 Phaser-CE 2.8.7 (c) PSR 2017";

    init() {
        Configuration.initialise();
        var json:any = this.game.cache.getJSON("music");
        console.log(json);
    }

    create() {    
    }
    
    destroy() : void {
    }

    update() : void {
        // Time in milliseconds
        var elapsedMS:number = this.game.time.elapsedMS;
    }
}    
