/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Fingerpick button.
 * 
 * @class FingerButton
 * @extends {BaseButton}
 * @implements {IButton}
 */
class FingerButton extends BaseButton implements IButton {

    private static buttonInfo:any;

    constructor(game:Phaser.Game,stringID:number,fretting:number,pixWidth:number) {
        super(game);        
        if (FingerButton.buttonInfo == null) {
            this.loadButtonInfo();
        }
        var reqHeight:number = Configurator.stringGap/(Configurator.getStringCount()-1) * 0.98;
        var gName:string = this.identifyGraphics(pixWidth);
        this.button = this.game.add.image(0,0,"sprites",gName,this);
        this.button.width = pixWidth;this.button.height = reqHeight;
        this.button.anchor.x = 0;this.button.anchor.y = 0.5;
        this.button.tint = FingerButton.getColour(fretting);
        this.yPos = Configurator.getStringY(stringID);
        this.label(Configurator.modifier.convert(fretting));
    }
    
    loadButtonInfo(): void {
        FingerButton.buttonInfo = {};
        var json:any = this.game.cache.getJSON("sprites")["frames"];
        for (var spr in json) {
            if (spr.substr(0,13) == "notebutton_up") {
                var frame:any = json[spr]["frame"]
                var wReq = frame["w"];
                FingerButton.buttonInfo[spr] = wReq;
            }
        }
        //console.log(FingerButton.buttonInfo);
    }
    identifyGraphics(width:number): string {
        var best:string = "";
        var rDiff:number = 9999;
        for (var spr in FingerButton.buttonInfo) {
            var newv:number = Math.abs(width - FingerButton.buttonInfo[spr]);
            if (newv < rDiff) {
                best = spr;
                rDiff = newv;
            }
        }
        return best;        
    }


}