/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Singleton instrument database class 
 * 
 * @class InstrumentDB
 */
class InstrumentDB {
    
    private static instance:InstrumentDB = null;
    private instruments:any;
    /**
     * Get the singleton instance of the database
     * 
     * @static
     * @returns {InstrumentDB} 
     * @memberof InstrumentDB
     */
    public static get(): InstrumentDB {
        if (InstrumentDB.instance == null) {
            InstrumentDB.instance = new InstrumentDB();            
        }
        return InstrumentDB.instance;
    }

    constructor() {
        this.instruments = {};
        var src:string[] = InstrumentInfo.encodedInfo.split(":");
        for (var s of src) {
            var ins:Instrument = new Instrument(s);
            this.instruments[ins.getShortName()] = ins;
            //console.log(ins.getShortName());
        }
    }
    /**
     * Find an instrument by short name.
     * 
     * @param {string} name 
     * @returns 
     * @memberof InstrumentDB
     */
    public find(name:string) {
        if (this.instruments[name] == undefined) {
            throw "Unknown instrument "+name;
        }
        return this.instruments[name];
    }
}