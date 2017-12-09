/// <reference path="../../lib/phaser.comments.d.ts"/>

class LyricBar {

    private textBox:Phaser.BitmapText;

    constructor(game:Phaser.Game) {
        var w:number = Configuration.width-Configuration.lyricSize - 
                                                Configuration.controlHeight;
        var t:Phaser.BitmapText = game.add.bitmapText(w/2,
                                        Configuration.yBase,"font","xxxx",
                                        Configuration.lyricSize*0.9);
        t.tint = 0xFFFF00;t.anchor.x = 0.5;
        this.textBox = t;
    }

    setLyric(txt:string):void {
        this.textBox.text = txt;
    }
    
    destroy(): void {
        this.textBox.destroy();
        this.textBox = null;
    }
}