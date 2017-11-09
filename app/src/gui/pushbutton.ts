/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Single action pushbutton.
 * 
 * @class PushButton
 * @extends {Phaser.Group}
 */
class PushButton extends Phaser.Group {

    protected buttonImage:Phaser.Image;
    private listener:IButtonListener;
    private message:ButtonMessage;

    constructor(game:Phaser.Game,image:string,identifier:ButtonMessage,listener:IButtonListener,size:number = 0) {
        super(game);
        if (size == 0) { size = this.game.width / 12; }
        var img:Phaser.Image = this.game.add.image(0,0,"sprites","roundbutton",this);
        img.anchor.x = img.anchor.y = 0.5;
        img.width = img.height = size;
        img.inputEnabled = true;
        img.events.onInputDown.add(this.clickHandler,this);
        this.buttonImage = this.game.add.image(0,0,"sprites",image,this);
        this.buttonImage.anchor.x = this.buttonImage.anchor.y = 0.5;
        this.buttonImage.width = this.buttonImage.height = size * 0.7;
        this.listener = listener;
        this.message = identifier;
    }

    destroy(): void {
        super.destroy();
        this.listener = this.buttonImage = null;
    }
    
    protected clickHandler(): void {
        this.listener.click(this.message,this);
    }
}