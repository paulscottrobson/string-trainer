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
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainState.prototype.create = function () {
        var bgr = this.game.add.image(0, 0, "sprites", "background");
        bgr.width = this.game.width;
        bgr.height = this.game.height;
        var musicJson = this.game.cache.getJSON("music");
        this.music = new Music(musicJson);
    };
    MainState.prototype.destroy = function () {
    };
    MainState.prototype.update = function () {
    };
    MainState.VERSION = "0.01 02Nov17 Phaser-CE 2.8.7";
    return MainState;
}(Phaser.State));
var Bar = (function () {
    function Bar(def, music) {
        this.music = music;
        this.strums = [];
        var defs = def.split(";");
        var qbTime = 0;
        for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
            var d = defs_1[_i];
            var s = new Strum(d, this, qbTime);
            qbTime = s.getEndTime();
            this.strums.push(s);
        }
    }
    Bar.prototype.destroy = function () {
        for (var _i = 0, _a = this.strums; _i < _a.length; _i++) {
            var s = _a[_i];
            s.destroy();
        }
        this.music = this.strums = null;
    };
    Bar.prototype.getStrumCount = function () {
        return this.strums.length;
    };
    Bar.prototype.getStrum = function (strum) {
        return this.strums[strum];
    };
    Bar.prototype.getMusic = function () {
        return this.music;
    };
    return Bar;
}());
var Music = (function () {
    function Music(musicJson) {
        this.json = musicJson;
        this.stringCount = parseInt(this.json["strings"], 10);
        this.stringBaseNote = [];
        for (var n = 0; n < this.stringCount; n++) {
            this.stringBaseNote[n] = this.json["string" + n];
        }
        console.log(this.stringBaseNote);
        this.bar = [];
        for (var n = 0; n < this.json["bars"].length; n++) {
            this.bar.push(new Bar(this.json["bars"][n], this));
        }
    }
    Music.prototype.destroy = function () {
        for (var _i = 0, _a = this.bar; _i < _a.length; _i++) {
            var b = _a[_i];
            b.destroy();
        }
        this.bar = this.stringBaseNote = this.json = null;
    };
    Music.prototype.getBeats = function () {
        return parseInt(this.json["beats"], 10);
    };
    Music.prototype.getTempo = function () {
        return parseInt(this.json["tempo"], 10);
    };
    Music.prototype.getCapo = function () {
        return parseInt(this.json["capo"], 10);
    };
    Music.prototype.getStringCount = function () {
        return this.stringCount;
    };
    Music.prototype.getStringBaseNote = function (str) {
        return this.stringBaseNote[str];
    };
    Music.prototype.getInformation = function (key) {
        return this.json[key.toLowerCase()];
    };
    Music.prototype.getBarCount = function () {
        return this.bar.length;
    };
    Music.prototype.getBar = function (bar) {
        return this.bar[bar];
    };
    return Music;
}());
var Strum = (function () {
    function Strum(def, bar, startTime) {
        this.bar = bar;
        this.fretPos = [];
        this.startTime = startTime;
        this.chordName = "";
        for (var n = 0; n < this.bar.getMusic().getStringCount(); n++) {
            var c = def.charCodeAt(n) - 97;
            if (def.charAt(n) == "-") {
                c = Strum.NOSTRUM;
            }
            this.fretPos[n] = c;
        }
        this.length = parseInt(def.substr(def.length - 2));
        var p1 = def.indexOf("(");
        if (p1 >= 0) {
            this.chordName = def.substr(p1 + 1, def.lastIndexOf(")") - p1 - 1);
        }
    }
    Strum.prototype.destroy = function () {
        this.bar = this.fretPos = null;
    };
    Strum.prototype.getBar = function () {
        return this.bar;
    };
    Strum.prototype.getStringCount = function () {
        return this.fretPos.length;
    };
    Strum.prototype.getStartTime = function () {
        return this.startTime;
    };
    Strum.prototype.getEndTime = function () {
        return this.startTime + this.length;
    };
    Strum.prototype.getLength = function () {
        return this.length;
    };
    Strum.prototype.getStringFret = function (str) {
        return this.fretPos[str];
    };
    Strum.prototype.isChord = function () {
        return this.chordName != "";
    };
    Strum.prototype.getChordName = function () {
        return this.chordName;
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
            width: 1280,
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
        this.game.load.json("music", "music.json");
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        for (var _i = 0, _a = ["font"]; _i < _a.length; _i++) {
            var fontName = _a[_i];
            this.game.load.bitmapFont(fontName, "assets/fonts/" + fontName + ".png", "assets/fonts/" + fontName + ".fnt");
        }
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
