/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Draggable sphere class for the Positioning bar.
 * 
 * @class DraggableSphere
 */
class DraggableSphere {

    private sphere:Phaser.Image;
    
    constructor (game:Phaser.Game,owner:PositionBar,xStart:number,yStart:number,colour:string,reduce:number) {
        this.sphere = game.add.image(xStart,yStart,"sprites","sp"+colour,owner);
        this.sphere.anchor.x = this.sphere.anchor.y = 0.5;
        this.sphere.height = this.sphere.width = 70+reduce;
        this.sphere.inputEnabled = true;
        this.sphere.input.enableDrag();
        this.sphere.input.setDragLock(true,false);
        this.sphere.events.onDragStop.add(owner.updatePositionsOnDrop,owner);
    }

    setBounds(xStart:number,xEnd:number,y:number) : void {
        this.sphere.input.boundsRect = new Phaser.Rectangle(xStart-this.sphere.width/2,y-100,xEnd-xStart+this.sphere.width,y+100);
    }

    moveTo(x:number,y:number) : void {
        this.sphere.x = x;this.sphere.y = y;
    }

    destroy() : void {
        this.sphere.destroy();
        this.sphere = null;
    }

    getX():number {
        return this.sphere.x;
    }

    isDragging(): boolean {
        return this.sphere.input.isDragged;
    }
}

/**
 * Positioning bar.
 * 
 * @class PositionBar
 * @extends {Phaser.Group}
 * @implements {IGuiObject}
 */
class PositionBar extends Phaser.Group {

    private xLeft:number;
    private xRight:number;
    private yPos:number;
    private spheres:DraggableSphere[];
    private music:IMusic;

    constructor(game:Phaser.Game,music:IMusic,xLeft:number,xRight:number,y:number) {
        super(game);
        // Create bar
        var bar:Phaser.Image = this.game.add.image(xLeft,y,"sprites","rectangle",this);
        bar.width = xRight-xLeft;bar.height = 16;bar.tint = 0x0040FF;   
        bar.anchor.y = 0.5;
        this.xLeft = xLeft;this.xRight = xRight;this.yPos = y;this.music = music;
        // Create spheres
        this.spheres = [];
        this.spheres.push(new DraggableSphere(game,this,xLeft,y,"red",0));
        this.spheres.push(new DraggableSphere(game,this,xRight,y,"green",0));
        this.spheres.push(new DraggableSphere(game,this,(xLeft+xRight)/2,y,"yellow",-10));
        // Set sphere boundaries
        for (var sphere of this.spheres) {
            sphere.setBounds(xLeft,xRight,y);            
        }
    }

    /**
     * Update position - can update and send back.
     * 
     * @param {number} barFractionalPosition position in
     * @returns {number} position out
     * @memberof PositionBar
     */
    updatePosition(barFractionalPosition:number): number {
        // If not dragging update the position.
        if (!this.spheres[2].isDragging()) {
            var frac:number = barFractionalPosition / this.music.getBarCount();
            frac = Math.min(1,frac);
            this.spheres[2].moveTo(this.xLeft + (this.xRight-this.xLeft) * frac,this.yPos);
        }
        var xPos:number = this.spheres[2].getX();
        // Can't go off left
        xPos = Math.max(xPos,this.spheres[0].getX());
        // If go off right then loop
        if (xPos > this.spheres[1].getX()) xPos = this.spheres[0].getX();
        // Recalculate position and return.

            barFractionalPosition = this.music.getBarCount() * 
                                        (xPos-this.xLeft)/(this.xRight-this.xLeft); 
        return barFractionalPosition;
    }
    
    /**
     * Called when sphere is dropped.
     * 
     * @memberof PositionBar
     */
    updatePositionsOnDrop():void {
        if (this.spheres[0].getX()+50 >= this.spheres[1].getX()) {
            this.spheres[0].moveTo(Math.max(this.spheres[1].getX()-50,0),this.yPos);
        }
    }

    destroy() : void {
        for (var ds of this.spheres) { ds.destroy(); }
        super.destroy()
    }
}