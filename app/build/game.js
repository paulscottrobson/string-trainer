var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Configuration = (function () {
    function Configuration() {
    }
    Configuration.initialise = function (game) {
        Configuration.width = game.width;
        Configuration.height = game.height;
        Configuration.instrument = null;
    };
    return Configuration;
}());
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainState.prototype.init = function () {
        Configuration.initialise(this.game);
        var json = this.game.cache.getJSON("music");
        this.music = new Music(json);
        Configuration.instrument = InstrumentDB.get()
            .find(this.music.getInstrumentShortName());
        console.log(Configuration.instrument.getLongName());
        Configuration.strings = Configuration.instrument.getStringCount();
        console.log(Configuration.strings);
    };
    MainState.prototype.create = function () {
    };
    MainState.prototype.destroy = function () {
    };
    MainState.prototype.update = function () {
        var elapsedMS = this.game.time.elapsedMS;
    };
    MainState.VERSION = "0.01 26-Nov-17 Phaser-CE 2.8.7 (c) PSR 2017";
    return MainState;
}(Phaser.State));
var InstrumentInfo = (function () {
    function InstrumentInfo() {
    }
    InstrumentInfo.encodedInfo = "merlin.Seagull Merlin.d3,a3,d4.3.n.S.S.D.0=0.1=2.2=4.3=5.4=7.5=9.6=11.7=12:ukulele.Ukulele.g4,c4,a4,e4.4.n.S.S.S.S.0=0.1=1.2=2.3=3.4=4.5=5.6=6.7=7.8=8.9=9.10=10.11=11.12=12.13=13.14=14:strumstick.McNally Strumstick.d3,a3,d4.3.n.S.S.D.0=0.1=2.2=4.3=5.4=7.5=9.6=10.7=11.8=12.9=14.10=16.11=17.12=19.13=21.14=22:dulcimer.Mountain Dulcimer.d3,a3,d4.3.y.S.S.D.0=0.1=2.2=4.3=5.4=7.5=9.6=10.6+=11.7=12.8=14.9=16.10=17.11=19.12=21.13=22.13+=23.14=24:loog.Loog Guitar.g3,b3,e4.3.n.S.S.S.0=0.1=1.2=2.3=3.4=4.5=5.6=6.7=7.8=8.9=9.10=10.11=11.12=12.13=13.14=14.15=15.16=16.17=17.18=18";
    return InstrumentInfo;
}());
var Instrument = (function () {
    function Instrument(info) {
        this.rawInfo = info.split(".");
        this.chromToName = {};
        var lastFret = 0;
        for (var n = this.getStringCount() + 5; n < this.rawInfo.length; n++) {
            var parts = this.rawInfo[n].split("=");
            this.chromToName[parseInt(parts[1], 10)] = parts[0];
            lastFret = Math.max(parseInt(parts[1], 10), lastFret);
        }
        for (var n = 0; n < lastFret; n++) {
            if (this.chromToName[n] == undefined) {
                this.chromToName[n] = this.chromToName[n - 1] + "^";
            }
        }
    }
    Instrument.prototype.getDisplayName = function (chromaticOffset) {
        if (chromaticOffset >= this.chromToName.length) {
            throw "asked for chrom offset " + chromaticOffset;
        }
        return this.chromToName[chromaticOffset];
    };
    Instrument.prototype.getShortName = function () {
        return this.rawInfo[0];
    };
    Instrument.prototype.getLongName = function () {
        return this.rawInfo[1];
    };
    Instrument.prototype.getStandardTuning = function () {
        return this.rawInfo[2];
    };
    Instrument.prototype.getStringCount = function () {
        return parseInt(this.rawInfo[3], 10);
    };
    Instrument.prototype.isTabInverted = function () {
        return this.rawInfo[4] == 'y';
    };
    Instrument.prototype.isDoubleString = function (n) {
        return this.rawInfo[n + 5] == 'd';
    };
    return Instrument;
}());
var InstrumentDB = (function () {
    function InstrumentDB() {
        this.instruments = {};
        var src = InstrumentInfo.encodedInfo.split(":");
        for (var _i = 0, src_1 = src; _i < src_1.length; _i++) {
            var s = src_1[_i];
            var ins = new Instrument(s);
            this.instruments[ins.getShortName()] = ins;
        }
    }
    InstrumentDB.get = function () {
        if (InstrumentDB.instance == null) {
            InstrumentDB.instance = new InstrumentDB();
        }
        return InstrumentDB.instance;
    };
    InstrumentDB.prototype.find = function (name) {
        if (this.instruments[name] == undefined) {
            throw "Unknown instrument " + name;
        }
        return this.instruments[name];
    };
    InstrumentDB.instance = null;
    return InstrumentDB;
}());
var Bar = (function () {
    function Bar(def, music, barNumber) {
        this.music = music;
        this.barNumber = barNumber;
        this.lyric = "";
        this.strums = [];
        var qbPosition = 0;
        for (var _i = 0, _a = def.split(";"); _i < _a.length; _i++) {
            var part = _a[_i];
            if (part[0] == '<') {
                this.lyric = part.substring(1, part.length - 1);
            }
            else {
                var strum = new Strum(part, qbPosition, this);
                this.strums.push(strum);
                qbPosition += strum.getQBLength();
            }
        }
    }
    Bar.prototype.getMusic = function () {
        return this.music;
    };
    Bar.prototype.getBarNumber = function () {
        return this.barNumber;
    };
    Bar.prototype.getStrumCount = function () {
        return this.strums.length;
    };
    Bar.prototype.getStrum = function (n) {
        return this.strums[n];
    };
    Bar.prototype.getLyric = function () {
        return this.lyric;
    };
    return Bar;
}());
var Music = (function () {
    function Music(json) {
        this.json = json;
        this.bars = [];
        for (var n = 0; n < json["bars"].length; n++) {
            this.bars.push(new Bar(this.json["bars"][n], this, n));
        }
    }
    Music.prototype.getBarCount = function () {
        return this.bars.length;
    };
    Music.prototype.getBar = function (n) {
        return this.bars[n];
    };
    Music.prototype.getTuning = function () {
        return this.json["tuning"];
    };
    Music.prototype.getTitle = function () {
        return this.json["title"];
    };
    Music.prototype.getTempo = function () {
        return parseInt(this.json["tempo"], 10);
    };
    Music.prototype.getInstrumentShortName = function () {
        return this.json["instrument"];
    };
    Music.prototype.getBeats = function () {
        return parseInt(this.json["beats"], 10);
    };
    Music.prototype.getCapo = function () {
        return parseInt(this.json["capo"], 10);
    };
    Music.prototype.getComposer = function () {
        return this.json[""];
    };
    return Music;
}());
var Strum = (function () {
    function Strum(def, start, bar) {
        this.bar = bar;
        this.qbStart = start;
        this.chord = "";
        this.strum = [];
        this.qbLength = parseInt(def.substr(def.length - 2), 10);
        while ((def[0] >= 'a' && def[0] <= 'z') || def[0] == '-') {
            if (def[0] == '-') {
                this.strum.push(Strum.NOSTRUM);
            }
            else {
                this.strum.push(def.charCodeAt(0) - 97);
            }
            def = def.substr(1);
        }
        if (def[0] == '[') {
            this.chord = def.substr(1, def.indexOf("]") - 1);
        }
    }
    Strum.prototype.getBar = function () {
        return this.bar;
    };
    Strum.prototype.getStrum = function () {
        return this.strum;
    };
    Strum.prototype.getQBStart = function () {
        return this.qbStart;
    };
    Strum.prototype.getQBEnd = function () {
        return this.qbStart + this.qbLength;
    };
    Strum.prototype.getQBLength = function () {
        return this.qbLength;
    };
    Strum.prototype.getChord = function () {
        return this.chord;
    };
    Strum.NOSTRUM = -1;
    return Strum;
}());
window.onload = function () {
    var game = new StringTrainerApplication();
};
var StringTrainerApplication = (function (_super) {
    __extends(StringTrainerApplication, _super);
    function StringTrainerApplication() {
        var _this = _super.call(this, {
            enableDebug: false,
            width: 600,
            height: 800,
            renderer: Phaser.AUTO,
            parent: null,
            transparent: false, antialias: true
        }) || this;
        _this.state.add("Boot", new BootState());
        _this.state.add("Preload", new PreloadState());
        _this.state.add("Main", new MainState());
        _this.state.start("Boot");
        return _this;
    }
    StringTrainerApplication.getURLName = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = ""; }
        var name = decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key.toLowerCase()).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        return (name == "") ? defaultValue : name;
    };
    return StringTrainerApplication;
}(Phaser.Game));
var BootState = (function (_super) {
    __extends(BootState, _super);
    function BootState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BootState.prototype.preload = function () {
        var _this = this;
        this.game.load.image("loader", "assets/sprites/loader.png");
        var musicKey = StringTrainerApplication.getURLName("music", "music.json");
        this.game.load.json("music", musicKey);
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Preload", true, false, 1); }, this);
    };
    BootState.prototype.create = function () {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    };
    return BootState;
}(Phaser.State));
var PreloadState = (function (_super) {
    __extends(PreloadState, _super);
    function PreloadState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PreloadState.prototype.preload = function () {
        var _this = this;
        this.game.stage.backgroundColor = "#000040";
        var loader = this.add.sprite(this.game.width / 2, this.game.height / 2, "loader");
        loader.width = this.game.width * 9 / 10;
        loader.height = this.game.height / 8;
        loader.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(loader);
        this.game.load.json("sprite_info", "assets/sprites/sprites.json");
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        for (var _i = 0, _a = ["dfont", "font"]; _i < _a.length; _i++) {
            var fontName = _a[_i];
            this.game.load.bitmapFont(fontName, "assets/fonts/" + fontName + ".png", "assets/fonts/" + fontName + ".fnt");
        }
        this.game.load.audio("metronome", ["assets/sounds/metronome.mp3",
            "assets/sounds/metronome.ogg"]);
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false); }, this);
    };
    return PreloadState;
}(Phaser.State));
