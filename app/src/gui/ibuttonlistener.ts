/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Interface for something that can hear button clicks.
 * 
 * @interface IButtonListener
 */

interface IButtonListener {
    clickButton(msg:ButtonMessage,sender:any):void;
}
