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
    private ball:Phaser.Image;

    constructor(game:Phaser.Game,music:IMusic) {
        this.music = music;
        this.renderers = [];
        this.lastBar = -1;
        this.lastQuarterBeat = -1;
        for (var n:number = 0;n < music.getBarCount();n++) {
            this.renderers[n] = new Renderer(game,music.getBar(n),n);
        }
        this.noteEvent = new Phaser.Signal();
        this.ball = game.add.image(Configurator.xOrigin,Configurator.yTop,
                                            "sprites","sphere_red");
        this.ball.anchor.x = 0.5;this.ball.anchor.y = 1.0;
        this.ball.width = this.ball.height = Configurator.barWidth/10;                                            
    }

    destroy(): void {
        for (var renderer of this.renderers) {
            renderer.destroy();
        }
        this.ball.destroy();this.ball = null;
        this.noteEvent = this.renderers = this.music = null;
    }

    moveTo(bar: number): void {
        var x = Math.round(Configurator.xOrigin - bar * Configurator.barWidth);
        for (var renderer of this.renderers) {
            renderer.moveTo(x);
            x = x + Configurator.barWidth;
        }
        // Work out if music event.
        var newBar:number = Math.floor(bar);
        var newBeat:number = Math.floor((bar - newBar) * 12 * this.music.getBeats());
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
        if (newBar < this.music.getBarCount()) {
            var sbar:IBar = this.music.getBar(newBar);
            var fracBeat = (bar-newBar) * 12 * this.music.getBeats();
            for (var s:number = 0;s < sbar.getStrumCount();s++) {
                var strum:IStrum = sbar.getStrum(s);
                if (fracBeat >= strum.getStartTime() &&
                    fracBeat < strum.getEndTime()) {
                        var prop:number = (fracBeat - strum.getStartTime()) / strum.getLength();
                        prop = Math.sin(prop * Math.PI);
                        prop = prop * this.renderers[newBar].getSineCurveHeight(s);
                        this.ball.y = Configurator.yTop - prop - 4;
                    }
            }
        } else {
            this.ball.y = Configurator.yTop;
        }
    }

    addStrumEventHandler(method: Function, context: any): void {
        this.noteEvent.add(method,context);
    }
    
}