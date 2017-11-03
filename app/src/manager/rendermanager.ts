/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Class that manages all renderers.
 * 
 * @class RenderManager
 * @implements {IRenderManager}
 */
class RenderManager implements IRenderManager {

    private music:IMusic;
    private renderers:IRenderer[];
    private lastBar:number;
    private lastQuarterBeat:number;
    private noteEvent:Phaser.Signal;

    constructor(game:Phaser.Game,music:IMusic) {
        this.music = music;
        this.renderers = [];
        this.lastBar = -1;
        this.lastQuarterBeat = -1;
        for (var n:number = 0;n < music.getBarCount();n++) {
            this.renderers[n] = new Renderer(game,music.getBar(n),n);
        }
        this.noteEvent = new Phaser.Signal();
        this.moveTo(0);
    }

    destroy(): void {
        for (var renderer of this.renderers) {
            renderer.destroy();
        }
        this.noteEvent = this.renderers = this.music = null;
    }

    moveTo(bar: number): void {
        var x = Math.round(Configurator.xOrigin - bar * Configurator.barWidth);
        for (var renderer of this.renderers) {
            renderer.moveTo(x);
            x = x + Configurator.barWidth;
        }
        var newBar:number = Math.floor(bar);
        var newBeat:number = Math.floor((bar - newBar) * 4 * this.music.getBeats());
        if (newBar != this.lastBar || newBeat != this.lastQuarterBeat) {
            this.lastBar = newBar;
            this.lastQuarterBeat = newBeat;
            if (newBar >= 0 && newBar < this.music.getBarCount()) {
                var rbar:IBar = this.music.getBar(newBar);
                for (var strn:number = 0;strn < rbar.getStrumCount();strn++) {
                    var strum:IStrum = rbar.getStrum(strn);
                    if (newBeat == strum.getEndTime()) {
                        this.noteEvent.dispatch(false,strum);
                    }
                    if (newBeat == strum.getStartTime()) {
                        this.noteEvent.dispatch(true,strum);
                    }
                }
            }
        }        
    }

    addStrumEventHandler(method: Function, context: any): void {
        this.noteEvent.add(method,context);
    }
    
}