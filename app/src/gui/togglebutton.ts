/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Toggle between two states
 * 
 * @class ToggleButton
 * @extends {PushButton}
 */
class ToggleButton extends PushButton {

    private baseImage:string;
    private isOn:boolean;

    constructor(game:Phaser.Game,image:string,identifier:ButtonMessage,listener:IButtonListener,size:number = 0) { 
        super(game,image+"_off",identifier,listener,size);
        this.baseImage = image;
        this.isOn = true;
    }

    protected clickHandler(): void {
        super.clickHandler();
        this.isOn = !this.isOn;
        var w:number = this.buttonImage.width;
        this.buttonImage.loadTexture("sprites",
                        this.baseImage + ((this.isOn) ? "_off":"_on"));
        this.buttonImage.width = this.buttonImage.height = w;                        
    }
    
    isButtonOn(): boolean {
        return this.isOn;
    }
}