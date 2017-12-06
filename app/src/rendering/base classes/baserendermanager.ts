/// <reference path="../../../lib/phaser.comments.d.ts"/>

abstract class BaseRenderManager implements IRenderManager {

    protected game:Phaser.Game;
    protected music:IMusic;
    protected renderers:IRenderer[];

    constructor(game:Phaser.Game,music:IMusic) {
        this.game = game;this.music = music;
    }

    create(): void {
        this.createFixed(this.game);      
        this.renderers = [];
        for (var bar:number = 0;bar < this.music.getBarCount();bar++) {
            this.renderers[bar] = this.createRenderer(this,this.game,this.music.getBar(bar));
        }
    }

    abstract moveTo(barPosition: number): void;
    abstract createRenderer(manager:IRenderManager,game:Phaser.Game,bar: IBar): IRenderer;
    abstract createFixed(game: Phaser.Game): void;
    abstract destroyFixed(): void;

    destroy(): void {
        for (var rnd of this.renderers) {
            rnd.destroy();
        }
        this.destroyFixed();
        this.game = this.music = null;
    }    

    private static COLOUR_SET:number[] = [
        0xFF0000,0x00FF00,0x0000FF,0xFFFF00,0x00FFFF,
        0xFF00FF,0xC0C0C0,0x800000,0xFF8000,0x008080,
        0xDC143C,0xA52A2A,0xF0E68C,0x6B8E23,0x006400,
        0x6495ED,0x87CEEB,0xFFB6C1,0xFAEBD7,0x708090
    ];

    /**
     * Return a colour for things
     * 
     * @static
     * @param {number} n id ; will be put in range.
     * @returns {number} 
     * @memberof BaseRenderManager
     */
    public static getColour(n:number):number {
        n = n % BaseRenderManager.COLOUR_SET.length;
        return BaseRenderManager.COLOUR_SET[n];
    }
}