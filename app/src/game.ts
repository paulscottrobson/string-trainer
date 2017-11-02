/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State {

    private static VERSION:string="0.01 02Nov17 Phaser-CE 2.8.7";

    create() {
        // Set up the background
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","background");
        bgr.width = this.game.width;bgr.height = this.game.height;
    }

    destroy() : void {
    }

    update() : void {
    }

}    
