/// <reference path="../../lib/phaser.comments.d.ts"/>

class Player {

    private static BASENOTE = 24;   
    private static loaded:number[];
    private notes:Phaser.Sound[];
    private music:IMusic;
    private tuning:number[];
    private current:Phaser.Sound[];

    constructor(game:Phaser.Game,music:IMusic) {
        this.notes = [];
        this.music = music;
        this.tuning = music.getTuningAsC1Offset();
        console.log(Player.loaded);
        for (var nn of Player.loaded) {
            this.notes[nn] = game.add.audio(nn.toString());
            //console.log(this.notes[nn]);
            //this.notes[nn].play();
        }
        this.current = [];
        for (var n = 0;n < Configuration.strings;n++) {
            this.current.push(null);
        }
    }

    public update(bar:number,qBeat:number): void {
        var cBar:IBar = this.music.getBar(bar);
        for (var s:number = 0;s < cBar.getStrumCount();s++) {
            var str:IStrum = cBar.getStrum(s);
            if (qBeat == str.getQBStart()) {
                this.playStrum(str.getStrum());
            }
        }
    }

    private playStrum(strum:number[]) : void {
        for (var s = 0;s < Configuration.strings;s++) {
            if (strum[s] != Strum.NOSTRUM) {
                var nc:number = this.tuning[s] + strum[s];
                nc = nc - Player.BASENOTE;
                this.notes[nc].play();
            }
        }
    }

    public static preload(game:Phaser.Game,music:IMusic): void {
        var preloads:any = {};
        var tuning:number[] = music.getTuningAsC1Offset();
        for (var n:number = 0;n < music.getBarCount();n++) {
            var b:IBar = music.getBar(n);
            for (var s:number = 0;s < b.getStrumCount();s++) {
                var fret:number[] = b.getStrum(s).getStrum();
                for (var fn:number = 0;fn < fret.length;fn++) {
                    if (fret[fn] != Strum.NOSTRUM) {
                        var nc:number = fret[fn]+tuning[fn];
                        preloads[nc] = nc;
                    }
                }
            }
        }
        Player.loaded = [];
        for (var nn in preloads) {
            var sn:number = preloads[nn] - Player.BASENOTE;
            Player.loaded.push(sn);
            var sns:string = sn.toString();
            game.load.audio(sns,["assets/sounds/"+sns+".mp3",
                                 "assets/sounds/"+sns+".ogg"]);        
            }
    }
}