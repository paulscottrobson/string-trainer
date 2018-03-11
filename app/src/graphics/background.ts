/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Background object.
 * 
 * @class Background
 */
class Background {
    private bgr:Phaser.Image;
    constructor(game:Phaser.Game,state:MainState) {
        this.bgr = game.add.image(0,0,"sprites","background");
        this.bgr.width = Configuration.width;
        this.bgr.height = Configuration.height;
        this.bgr.inputEnabled = true;
        // Click on the background switches display.
        this.bgr.events.onInputDown.add(function() { state.nextManager(); },state);
    }

    destroy(): void {
        this.bgr.destroy();
        this.bgr = null;
    }
}