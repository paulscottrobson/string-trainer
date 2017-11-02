/// <reference path="../../lib/phaser.comments.d.ts"/>

class FingerButton extends Phaser.Group implements IButton {

    private yPos:number;
    private button:Phaser.Image;
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
    }
    
    destroy(): void {
        super.destroy();
        this.button = null;
    }
    
    moveTo(x: number): void {
        this.button.x = x;this.button.y = this.yPos;    
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

    private static colours:number[] = [
        0xFF0000,0x00FF00,0x0000FF,0xFFFF00,0xFF8000,0xFFFF00,0xFF00FF,
        0x00FFFF,0xFF8000,0x0080FF,0x008000,0x808000,0x008080,0x8B3413
    ];

    public static getColour(n:number) : number {
        return FingerButton.colours[n % FingerButton.colours.length];
    }
}