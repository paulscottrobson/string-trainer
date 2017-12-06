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
        Configuration.yBase = Configuration.height - 100;
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
        this.manager = new ScrollingTabRenderManager(this.game, this.music);
        this.manager.create();
        this.manager.moveTo(0);
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
        return this.rawInfo[n + 5].toLowerCase() == 'd';
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
        if (qbPosition != music.getBeats() * 4) {
            throw "Padding bar not working ?";
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
            width: 1200,
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
        this.game.stage.backgroundColor = "#000000";
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
var BaseRenderer = (function () {
    function BaseRenderer(manager, game, bar) {
        this.manager = manager;
        this.game = game;
        this.bar = bar;
        this.isDrawn = false;
    }
    BaseRenderer.prototype.createRendering = function () {
        if (this.isDrawn)
            return;
        this.isDrawn = true;
        this.createNonStrumItems();
        this.strumRenders = [];
        for (var sn = 0; sn < this.bar.getStrumCount(); sn++) {
            this.strumRenders.push(this.createStrumRenderer(this, this.game, this.bar.getStrum(sn)));
        }
    };
    BaseRenderer.prototype.destroyRendering = function () {
        if (!this.isDrawn)
            return;
        this.isDrawn = false;
        this.destroyNonStrumItems();
        for (var _i = 0, _a = this.strumRenders; _i < _a.length; _i++) {
            var sr = _a[_i];
            sr.destroy();
        }
        this.strumRenders = null;
    };
    BaseRenderer.prototype.moveTo = function (pos) {
        if (this.isVisible(pos)) {
            this.createRendering();
            this.moveNonStrumItemsTo(pos);
            for (var _i = 0, _a = this.strumRenders; _i < _a.length; _i++) {
                var sr = _a[_i];
                sr.moveTo(pos);
            }
        }
        else {
            this.destroyRendering();
        }
    };
    BaseRenderer.prototype.destroy = function () {
        this.destroyRendering();
        this.manager = this.game = this.bar = null;
    };
    BaseRenderer.prototype.getRenderManager = function () {
        return this.manager;
    };
    return BaseRenderer;
}());
var BaseRenderManager = (function () {
    function BaseRenderManager(game, music) {
        this.game = game;
        this.music = music;
    }
    BaseRenderManager.prototype.create = function () {
        this.createFixed(this.game);
        this.renderers = [];
        for (var bar = 0; bar < this.music.getBarCount(); bar++) {
            this.renderers[bar] = this.createRenderer(this, this.game, this.music.getBar(bar));
        }
    };
    BaseRenderManager.prototype.destroy = function () {
        for (var _i = 0, _a = this.renderers; _i < _a.length; _i++) {
            var rnd = _a[_i];
            rnd.destroy();
        }
        this.destroyFixed();
        this.game = this.music = null;
    };
    BaseRenderManager.getColour = function (n) {
        n = n % BaseRenderManager.COLOUR_SET.length;
        return BaseRenderManager.COLOUR_SET[n];
    };
    BaseRenderManager.COLOUR_SET = [
        0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF,
        0xFF00FF, 0xC0C0C0, 0x800000, 0xFF8000, 0x008080,
        0xDC143C, 0xA52A2A, 0xF0E68C, 0x6B8E23, 0x006400,
        0x6495ED, 0x87CEEB, 0xFFB6C1, 0xFAEBD7, 0x708090
    ];
    return BaseRenderManager;
}());
var SineCurveBaseStrumRenderer = (function () {
    function SineCurveBaseStrumRenderer(renderer, game, strum) {
        this.renderer = renderer;
        this.game = game;
        this.strum = strum;
    }
    SineCurveBaseStrumRenderer.prototype.destroy = function () {
        this.renderer = this.game = this.strum = null;
    };
    return SineCurveBaseStrumRenderer;
}());
var ScrollingTabChordsRenderer = (function (_super) {
    __extends(ScrollingTabChordsRenderer, _super);
    function ScrollingTabChordsRenderer(renderer, game, strum) {
        return _super.call(this, renderer, game, strum) || this;
    }
    ScrollingTabChordsRenderer.prototype.moveTo = function (pos) {
    };
    ScrollingTabChordsRenderer.prototype.highlightStrumObjects = function (highlight, percent) {
        throw new Error("Method not implemented.");
    };
    ScrollingTabChordsRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return ScrollingTabChordsRenderer;
}(SineCurveBaseStrumRenderer));
var ScrollingTabNotesRenderer = (function (_super) {
    __extends(ScrollingTabNotesRenderer, _super);
    function ScrollingTabNotesRenderer(renderer, game, strum) {
        return _super.call(this, renderer, game, strum) || this;
    }
    ScrollingTabNotesRenderer.prototype.moveTo = function (pos) {
    };
    ScrollingTabNotesRenderer.prototype.highlightStrumObjects = function (highlight, percent) {
        throw new Error("Method not implemented.");
    };
    ScrollingTabNotesRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return ScrollingTabNotesRenderer;
}(SineCurveBaseStrumRenderer));
var ScrollingTabRenderer = (function (_super) {
    __extends(ScrollingTabRenderer, _super);
    function ScrollingTabRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScrollingTabRenderer.prototype.moveNonStrumItemsTo = function (pos) {
        for (var b = 0; b < this.beatBars.length; b++) {
            this.beatBars[b].x = pos + ScrollingTabRenderManager.xBarSize * b / this.beatBars.length;
        }
    };
    ScrollingTabRenderer.prototype.createNonStrumItems = function () {
        this.beatBars = [];
        for (var b = 0; b < this.bar.getMusic().getBeats(); b++) {
            this.beatBars[b] = this.game.add.image(0, ScrollingTabRenderManager.centreFretboard, "sprites", "rectangle");
            this.beatBars[b].width = 2;
            this.beatBars[b].tint = 0x000000;
            this.beatBars[b].height = ScrollingTabRenderManager.fretBoardStringSize;
            this.beatBars[b].anchor.x = this.beatBars[b].anchor.y = 0.5;
            if (b == 0) {
                this.beatBars[b].width *= 4;
                this.beatBars[b].tint = 0xFFD700;
            }
        }
    };
    ScrollingTabRenderer.prototype.destroyNonStrumItems = function () {
        for (var _i = 0, _a = this.beatBars; _i < _a.length; _i++) {
            var bb = _a[_i];
            bb.destroy();
        }
        this.beatBars = null;
    };
    ScrollingTabRenderer.prototype.createStrumRenderer = function (renderer, game, strum) {
        return new ScrollingTabNotesRenderer(renderer, game, strum);
    };
    ScrollingTabRenderer.prototype.isVisible = function (pos) {
        if (pos > Configuration.width)
            return false;
        if (pos < -ScrollingTabRenderManager.xBarSize)
            return false;
        return true;
    };
    return ScrollingTabRenderer;
}(BaseRenderer));
var ScrollingTabRenderManager = (function (_super) {
    __extends(ScrollingTabRenderManager, _super);
    function ScrollingTabRenderManager(game, music) {
        var _this = _super.call(this, game, music) || this;
        ScrollingTabRenderManager.fretBoardTotalSize = Configuration.yBase * 0.6;
        ScrollingTabRenderManager.fretBoardStringSize =
            ScrollingTabRenderManager.fretBoardTotalSize * 0.85;
        ScrollingTabRenderManager.centreFretboard =
            Configuration.yBase - ScrollingTabRenderManager.fretBoardTotalSize / 2;
        ScrollingTabRenderManager.sineCurveHeight =
            ScrollingTabRenderManager.fretBoardTotalSize / 3;
        ScrollingTabRenderManager.xStartPoint =
            Configuration.width * 0.15;
        ScrollingTabRenderManager.xBarSize =
            Configuration.width * 0.33;
        return _this;
    }
    ScrollingTabRenderManager.prototype.createRenderer = function (manager, game, bar) {
        return new ScrollingTabRenderer(manager, game, bar);
    };
    ScrollingTabRenderManager.prototype.moveTo = function (barPosition) {
        for (var bn = 0; bn < this.music.getBarCount(); bn++) {
            this.renderers[bn].moveTo(ScrollingTabRenderManager.xStartPoint +
                bn * ScrollingTabRenderManager.xBarSize);
        }
    };
    ScrollingTabRenderManager.prototype.createFixed = function (game) {
        this.fretBoard = game.add.image(0, ScrollingTabRenderManager.centreFretboard, "sprites", "rectangle");
        this.fretBoard.width = Configuration.width;
        this.fretBoard.height = ScrollingTabRenderManager.fretBoardTotalSize;
        this.fretBoard.anchor.y = 0.5;
        this.fretBoard.tint = 0x404040;
        this.mainBoard = game.add.image(0, ScrollingTabRenderManager.centreFretboard, "sprites", "rectangle");
        this.mainBoard.width = Configuration.width;
        this.mainBoard.height = ScrollingTabRenderManager.fretBoardStringSize;
        this.mainBoard.anchor.y = 0.5;
        this.mainBoard.tint = 0x381904;
        this.strings = [];
        for (var s = 0; s < Configuration.strings; s++) {
            var dbl = Configuration.instrument.isDoubleString(s);
            var str = this.game.add.image(0, ScrollingTabRenderManager.getStringY(s), "sprites", dbl ? "dstring" : "string");
            str.width = Configuration.width;
            var ssc = (1 + (Configuration.strings - 1 - s) / 3);
            str.height = Math.max(Configuration.height / 100 * ssc * (dbl ? 2 : 1), 1);
            str.anchor.y = 0.5;
            this.strings.push(str);
        }
    };
    ScrollingTabRenderManager.prototype.destroyFixed = function () {
        for (var _i = 0, _a = this.strings; _i < _a.length; _i++) {
            var x = _a[_i];
            x.destroy();
        }
        this.fretBoard.destroy();
        this.mainBoard.destroy();
        this.strings = this.mainBoard = this.fretBoard = null;
    };
    ScrollingTabRenderManager.getStringY = function (n) {
        if (!Configuration.instrument.isTabInverted()) {
            n = Configuration.strings - 1 - n;
        }
        return ScrollingTabRenderManager.centreFretboard +
            (n - (Configuration.strings - 1) / 2) * ScrollingTabRenderManager.fretBoardStringSize /
                Configuration.strings;
    };
    return ScrollingTabRenderManager;
}(BaseRenderManager));
