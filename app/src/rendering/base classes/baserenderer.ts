/// <reference path="../../../lib/phaser.comments.d.ts"/>

abstract class BaseRenderer implements IRenderer {

    protected manager:IRenderManager;
    protected game:Phaser.Game;
    protected bar:IBar;
    protected isDrawn:boolean;
    private   strumRenders:IStrumRenderer[];

    constructor(manager:IRenderManager,game:Phaser.Game,bar:IBar) {
        this.manager = manager;this.game = game;this.bar = bar;    
        this.isDrawn = false;
    }

    /**
     * Create the rendering objects
     * 
     * @returns {void} 
     * @memberof BaseRenderer
     */
    createRendering(): void {
        if (this.isDrawn) return;
        this.isDrawn = true;
        this.createNonStrumItems();
        this.strumRenders = [];
        for (var sn:number = 0;sn < this.bar.getStrumCount();sn++) {
            this.strumRenders.push(this.createStrumRenderer(this,this.game,this.bar.getStrum(sn)));
        }
    }

    /**
     * Destroy the rendering objects
     * 
     * @returns {void} 
     * @memberof BaseRenderer
     */
    destroyRendering(): void {
        if (!this.isDrawn) return;
        this.isDrawn = false;
        this.destroyNonStrumItems();
        for (var sr of this.strumRenders) {
            sr.destroy();
        }
        this.strumRenders = null;
    }

    moveTo(pos:number) : void {
        // If it will be seen here, create render if required and move it
        if (this.isVisible(pos)) {
            this.createRendering();
            this.moveNonStrumItemsTo(pos);
            for (var sr of this.strumRenders) {
                sr.moveTo(pos);
            }
    } else {
            // otherwise destroy it.
            this.destroyRendering();
        }
    }

    destroy(): void {
        this.destroyRendering();
        this.manager = this.game = this.bar = null;
    }

    getRenderManager(): IRenderManager {
        return this.manager;
    }
    
    abstract moveNonStrumItemsTo(barPosition: number): void;
    abstract createNonStrumItems(): void;
    abstract destroyNonStrumItems(): void;
    abstract createStrumRenderer(renderer:IRenderer,game:Phaser.Game,strum:IStrum): IStrumRenderer;
    abstract isVisible(pos:number): boolean;
   
}