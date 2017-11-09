/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Messages buttons can send
 * 
 * @enum {number}
 */
enum ButtonMessage {
    NormalSpeed,FastSpeed,SlowSpeed,        // Push button
    Restart,                                // Restart music
    RunMusic,                               // Play on/off
    MusicAudible,                           // Music audible on/off
    MetronomeAudible                        // Metronome audible on/off
}
