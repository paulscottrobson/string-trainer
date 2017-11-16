/// <reference path="../../lib/phaser.comments.d.ts"/>

class ControlPanel extends Phaser.Group implements IControlPanel,IButtonListener {

    private speedScalar:number;
    private isPaused:boolean;
    private musicOn:boolean;
    private metronomeOn:boolean;
    private buttonCount:number;
    private signal:Phaser.Signal;
    private size:number;
    private speedPC:Phaser.BitmapText;

    constructor(game:Phaser.Game) {
        super(game);
        this.speedScalar = 1;
        this.isPaused = false;
        this.musicOn = true;
        this.metronomeOn = true;
        this.buttonCount = 0;
        this.signal = new Phaser.Signal();
        this.size = this.game.width / 12;

        var img:Phaser.Image = this.game.add.image(0,0,"sprites","roundframe",this);
        img.scale.x = img.scale.y = 1.4;
        img.anchor.x = img.anchor.y = 0.5;
        img.x = this.game.width-this.size;img.y = this.size * 0.6;
        this.speedPC = this.game.add.bitmapText(img.x,img.y,"font","100%",this.size*0.6,this);
        this.speedPC.anchor.y = 0.4;this.speedPC.anchor.x = 0.5;
        this.addButton(Phaser.Keyboard.S,"i_slower",ButtonMessage.SlowSpeed,false);
        this.addButton(Phaser.Keyboard.N,"i_normal",ButtonMessage.NormalSpeed,false);
        this.addButton(Phaser.Keyboard.F,"i_faster",ButtonMessage.FastSpeed,false);
        this.addButton(Phaser.Keyboard.SPACEBAR,"i_restart",ButtonMessage.Restart,false);
        this.addButton(Phaser.Keyboard.A,"i_music",ButtonMessage.MusicAudible,true);
        this.addButton(Phaser.Keyboard.M,"i_metronome",ButtonMessage.MetronomeAudible,true);
        this.addButton(Phaser.Keyboard.ENTER,"i_play",ButtonMessage.RunMusic,true);
    }

    private addButton(keyID:number,base:string,msg:ButtonMessage,isToggle:boolean) {
        var btn:PushButton;
        if (isToggle) {
            btn = new ToggleButton(this.game,base,msg,this,this.size);
        } else {
            btn = new PushButton(this.game,base,msg,this,this.size);
        }
        btn.x = this.game.width/2+(this.buttonCount-4)*1.1 * btn.width;
        btn.y = btn.height * 0.6;
        this.buttonCount++;

        var key:Phaser.Key = this.game.input.keyboard.addKey(keyID);
        key.onDown.add(btn.clickHandler,btn);
    }

    public addSignalListener(func:Function,target:any): void {
        this.signal.add(func,target);
    }

    clickButton(msg:ButtonMessage,sender:any):void {
        this.signal.dispatch(msg);
        switch(msg) {
            case ButtonMessage.RunMusic:
                this.isPaused = !this.isPaused;break;
            case ButtonMessage.FastSpeed:
                this.speedScalar = Math.min(this.speedScalar + 0.05,1.8);break;
            case ButtonMessage.SlowSpeed:
                this.speedScalar = Math.max(this.speedScalar - 0.05,0.25);break;
            case ButtonMessage.NormalSpeed:
                this.speedScalar = 1;break;
            case ButtonMessage.MetronomeAudible:
                this.metronomeOn = !this.metronomeOn;break;
            case ButtonMessage.MusicAudible:
                this.musicOn = !this.musicOn;break;
        }
        this.speedPC.text = Math.round(this.speedScalar * 100).toString()+"%";
    }

    getSpeedScalar(): number {
        return this.isPaused ? 0 : this.speedScalar;
    }
    isMetronomeOn(): boolean {
        return this.metronomeOn;
    }
    isMusicOn(): boolean {
        return this.musicOn;
    }    
}