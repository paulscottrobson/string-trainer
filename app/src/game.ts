/// <reference path="../lib/phaser.comments.d.ts"/>

class MainState extends Phaser.State implements IButtonListener {

    private static VERSION:string="0.01 02Nov17 Phaser-CE 2.8.7";

    public music:IMusic;
    public player:MusicPlayer;
    public metronome:Metronome;
    public position:number;
    public renderManager:IRenderManager;

    create() {
        // Create music object
        var musicJson:any = this.game.cache.getJSON("music");
        this.music = new Music(musicJson);
        // Create configuration
        Configurator.setup(this.game,this.music.getStringCount(),
                this.music.getInformation("options"));
        // Create player
        this.player = new MusicPlayer(this.game,
                        this.music.getStringCount(),this.music.getTuning())
        // Set up the display
        var bgr:Background = new Background(this.game);
        // Set up metronome.
        this.metronome = new Metronome(this.game,this.music);
        // Set up Render Manager
        this.position = 0;
        this.renderManager = new RenderManager(this.game,this.music);
        this.renderManager.addStrumEventHandler(this.player.strum,this.player);

        var btn:PushButton = new PushButton(this.game,"i_faster",
                ButtonMessage.SlowSpeed,this);
        btn.x = btn.y = 70;        
        var btn2:ToggleButton = new ToggleButton(this.game,"i_music",
        ButtonMessage.FastSpeed,this);
        btn2.x = btn2.y = 140;                
    }
    
    click(msg:ButtonMessage,sender:any):void {
        console.log(msg,sender);
    }
    destroy() : void {
        this.renderManager.destroy();
        this.music = this.renderManager = null;
    }

    update() : void {
        // Time in milliseconds
        var elapsed:number = this.game.time.elapsedMS;
        // Time in seconds
        elapsed = elapsed / 1000;
        // Beats per millisecond
        var bpms:number = this.music.getTempo() / 60;
        this.position = this.position + bpms * elapsed 
                                        / this.music.getBeats();
        // Update positions etc.                                        
        this.renderManager.moveTo(this.position);
        this.metronome.moveTo(this.position);
    }
}    
