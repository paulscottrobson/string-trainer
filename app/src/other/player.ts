/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Class responsible for playing the actual sounds.
 * 
 * @class MusicPlayer
 */
class MusicPlayer {

    private static noteCount:number;
    private static baseNote:string;

    private game:Phaser.Game;
    private sounds:Phaser.Sound[];
    private baseNoteID:number;
    private baseStringID:number[];
    private channelSoundID:Phaser.Sound[];

    /**
     * Creates the audio objects
     * @param {Phaser.Game} game 
     * @memberof MusicPlayer
     */
    constructor(game:Phaser.Game,channels:number,tuning:string[]) {
        this.game = game;
        this.sounds = [];
        for (var n = 1;n <= MusicPlayer.noteCount;n++) {
            this.sounds[n] = this.game.add.sound(n.toString());
            this.sounds[n].allowMultiple = true;
        }
        this.baseNoteID = MusicPlayer.toNoteID(MusicPlayer.baseNote);
        this.baseStringID = [];
        for (var n = 0;n < tuning.length;n++) {
            this.baseStringID[n] = MusicPlayer.toNoteID(tuning[n]) - 
                                                        this.baseNoteID + 1;
        }
        this.channelSoundID = [];
        for (var n = 0;n < channels;n++) {
            this.channelSoundID[n] = null;
        }
    }

    strum(isStart:boolean,strum:IStrum) {
        if (isStart) {
            for (var n = 0;n < strum.getStringCount();n++) {
                var fret:number = strum.getStringFret(n);
                if (fret != Strum.NOSTRUM) {
                    //console.log(n,fret);
                    this.soundOn(n,fret);
                }
            }
        }
    }

    soundOn(channel:number,fret:number): void {
        this.soundOff(channel);
        var note:number = this.baseStringID[channel] + fret;
        //console.log(note);  
        this.channelSoundID[channel] = this.sounds[note].play();
    }
    /**
     * All current sound off
     * 
     * @memberof MusicPlayer
     */
    silence() : void {
        for (var n = 0;n < this.channelSoundID.length;n++) {
            this.soundOff(n);
        }
    }

    /**
     * Turn individual channel off
     * 
     * @param {number} channel 
     * @memberof MusicPlayer
     */
    soundOff(channel:number): void {
        if (this.channelSoundID[channel] != null) {
            this.channelSoundID[channel].stop();
            this.channelSoundID[channel] = null;
        }
    }

    /**
     * Run the preloader code.
     * 
     * @static
     * @param {Phaser.Game} game 
     * @param {number} noteCount number of notes, 1..noteCount
     * @param {string} baseNote base note (e.g. D#4)
     * @memberof MusicPlayer
     */
    static preload(game:Phaser.Game,noteCount:number,baseNote:string) : void {
        MusicPlayer.noteCount = noteCount;
        MusicPlayer.baseNote = baseNote.toLowerCase();
        for (var n:number = 1;n <= MusicPlayer.noteCount;n++) {
            var ns:string = n.toString();
            game.load.audio(ns,["assets/sounds/"+ns+".mp3",
                                     "assets/sounds/"+ns+".ogg"]);        
        }
    }

    /**
     * Convert text note C4 to semitone offset from C1.
     * 
     * @static
     * @param {string} str 
     * @returns {number} 
     * @memberof MusicPlayer
     */
    public static toNoteID(str:string):number {
        var note:number = (parseInt(str.substr(str.length-1),10)-1) * 12;
        var st:number = MusicPlayer.noteConvert[str.substr(0,str.length-1)];
        //console.log(str,note,st);
        return note+st;
    }

    private static noteConvert:any = {
        "c":0,"c#":1,"d":2,"d#":3,"e":4,"f":5,"f#":6,"g":7,"g#":8,
        "a":9,"a#":10,"b":11,
        "db":1,"eb":3,"gb":6,"ab":8,"bb":10
    }
}