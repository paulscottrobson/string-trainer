/// <reference path="../../lib/phaser.comments.d.ts"/>

class ControlPanel extends Phaser.Group implements IControlPanel,IButtonListener {

    private speedScalar:number;
    private isPaused:boolean;
    private musicOn:boolean;
    private metronomeOn:boolean;
    private buttonCount:number;
    private signal:Phaser.Signal;
    private size:number;

    constructor(game:Phaser.Game) {
        super(game);
        this.speedScalar = 1;
        this.isPaused = false;
        this.musicOn = true;
        this.metronomeOn = true;
        this.buttonCount = 0;
        this.signal = new Phaser.Signal();
        this.size = this.game.width / 12;

        this.addButton("i_slower",ButtonMessage.SlowSpeed,false);
        this.addButton("i_normal",ButtonMessage.NormalSpeed,false);
        this.addButton("i_faster",ButtonMessage.FastSpeed,false);
        this.addButton("i_restart",ButtonMessage.Restart,false);
        this.addButton("i_music",ButtonMessage.MusicAudible,true);
        this.addButton("i_metronome",ButtonMessage.MetronomeAudible,true);
        this.addButton("i_play",ButtonMessage.RunMusic,true);
    }

    private addButton(base:string,msg:ButtonMessage,isToggle:boolean) {
        var btn:PushButton;
        if (isToggle) {
            btn = new ToggleButton(this.game,base,msg,this,this.size);
        } else {
            btn = new PushButton(this.game,base,msg,this,this.size);
        }
        btn.x = this.game.width/2+(this.buttonCount-3)*1.1 * btn.width;
        btn.y = btn.height * 0.6;
        this.buttonCount++;
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
                this.speedScalar = this.speedScalar * 1.1;break;
            case ButtonMessage.SlowSpeed:
                this.speedScalar = this.speedScalar / 1.1;break;
            case ButtonMessage.NormalSpeed:
                this.speedScalar = 1;break;
            case ButtonMessage.MetronomeAudible:
                this.metronomeOn = !this.metronomeOn;break;
            case ButtonMessage.MusicAudible:
                this.musicOn = !this.musicOn;break;
        }
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