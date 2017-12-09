/// <reference path="../../lib/phaser.comments.d.ts"/>

class Background {
    private bgr:Phaser.Image;
    constructor(game:Phaser.Game,state:MainState) {
        this.bgr = game.add.image(0,0,"sprites","background");
        this.bgr.width = Configuration.width;
        this.bgr.height = Configuration.height;
        this.bgr.inputEnabled = true;
        this.bgr.events.onInputDown.add(function() { state.nextManager(); },state);
    }
}