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
        Configuration.controlHeight = 80;
        Configuration.lyricSize = 50;
        Configuration.yBase = Configuration.height - Configuration.controlHeight - Configuration.lyricSize;
        Configuration.instrument = null;
    };
    return Configuration;
}());
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.manager = null;
        _this.pos = 0;
        _this.lastQBeat = -1;
        _this.lastBar = -1;
        _this.managerIndex = 0;
        return _this;
    }
    MainState.prototype.init = function () {
        Configuration.initialise(this.game);
        var json = this.game.cache.getJSON("music");
        this.music = new Music(json);
        Configuration.instrument = InstrumentDB.get()
            .find(this.music.getInstrumentShortName());
        Configuration.strings = Configuration.instrument.getStringCount();
    };
    MainState.prototype.create = function () {
        this.background = new Background(this.game, this);
        this.lyricDisplay = new LyricBar(this.game);
        this.speedControl = new SpeedArrow(this.game);
        this.positionControl = new PositionBar(this.game, this.music, 40, Configuration.width - Configuration.lyricSize - Configuration.controlHeight - 32, Configuration.height - Configuration.controlHeight / 2);
        this.metronome = new Metronome(this.game, this.music);
        this.player = new Player(this.game, this.music);
        this.title = this.game.add.bitmapText(0, 0, "font", MainState.VERSION, Configuration.controlHeight / 4);
        this.title.x = Configuration.width / 2;
        this.title.y = Configuration.height;
        this.title.anchor.x = 0.5;
        this.title.anchor.y = 1;
        this.title.tint = 0xFFC000;
        this.nextManager();
    };
    MainState.prototype.nextManager = function () {
        if (this.manager != null) {
            this.manager.destroy();
            this.manager = null;
        }
        if (this.managerIndex == 0)
            this.manager = new ScrollingTabRenderManager(this.game, this.music);
        if (this.managerIndex == 1)
            this.manager = new ProjectedRenderManager(this.game, this.music);
        if (this.managerIndex == 2)
            this.manager = new TabRenderManager(this.game, this.music);
        this.manager.create();
        this.manager.moveTo(0);
        this.pos = 0;
        this.lastBar = this.lastQBeat = -1;
        this.managerIndex++;
        if (this.managerIndex == 3)
            this.managerIndex = 0;
    };
    MainState.prototype.destroy = function () {
        this.background.destroy();
        this.speedControl.destroy();
        this.positionControl.destroy();
        this.lyricDisplay.destroy();
        this.metronome.destroy();
        this.player.destroy();
        this.background = this.speedControl = this.positionControl = null;
        this.lyricDisplay = this.metronome = this.player = null;
        this.background = null;
    };
    MainState.prototype.update = function () {
        var elapsedMS = this.game.time.elapsedMS;
        var bpms = this.music.getTempo() / 60 / 1000;
        bpms = bpms / this.music.getBeats() * this.speedControl.getScalar();
        this.pos = Math.min(this.music.getBarCount(), this.pos + bpms * elapsedMS);
        this.pos = this.positionControl.updatePosition(this.pos);
        this.pos = Math.min(this.music.getBarCount(), this.pos);
        this.pos = Math.max(0, this.pos);
        this.speedControl.updateRotate(elapsedMS);
        this.manager.moveTo(this.pos);
        var bar = Math.floor(this.pos);
        var qBeat = Math.floor((this.pos - bar) * 4 * this.music.getBeats());
        if (bar != this.lastBar || qBeat != this.lastQBeat) {
            if (bar < this.music.getBarCount()) {
                if (qBeat == 0) {
                    this.lyricDisplay.setLyric(this.music.getBar(bar).getLyric());
                }
                this.player.update(bar, qBeat);
                this.metronome.update(bar, qBeat);
                this.lastBar = bar;
                this.lastQBeat = qBeat;
            }
        }
    };
    MainState.VERSION = "0.93 11-Jun-18 Phaser-CE 2.8.7 (c) PSR 2017,8";
    return MainState;
}(Phaser.State));
var Metronome = (function () {
    function Metronome(game, music) {
        this.metronome = game.add.audio("metronome");
    }
    Metronome.prototype.destroy = function () {
    };
    Metronome.prototype.update = function (bar, qBeat) {
        if (qBeat % 4 == 0) {
            this.metronome.volume = (qBeat == 0) ? 1 : 0.2;
            this.metronome.play();
            this.metronome.volume = (qBeat == 0) ? 1 : 0.2;
        }
    };
    return Metronome;
}());
var Player = (function () {
    function Player(game, music) {
        this.notes = [];
        this.music = music;
        console.log(music.getTuning());
        this.tuning = music.getTuningAsC1Offset();
        for (var _i = 0, _a = Player.loaded; _i < _a.length; _i++) {
            var nn = _a[_i];
            this.notes[nn] = game.add.audio(nn.toString());
        }
        this.current = [];
        for (var n = 0; n < Configuration.strings; n++) {
            this.current.push(null);
        }
    }
    Player.prototype.destroy = function () {
    };
    Player.prototype.update = function (bar, qBeat) {
        var cBar = this.music.getBar(bar);
        for (var s = 0; s < cBar.getStrumCount(); s++) {
            var str = cBar.getStrum(s);
            if (qBeat == str.getQBStart()) {
                this.playStrum(str.getStrum());
            }
        }
    };
    Player.prototype.playStrum = function (strum) {
        for (var s = 0; s < Configuration.strings; s++) {
            if (strum[s] != Strum.NOSTRUM) {
                var nc = this.tuning[s] + strum[s];
                nc = nc - Player.BASENOTE + 1;
                this.notes[nc].play();
            }
        }
    };
    Player.preload = function (game, music) {
        var preloads = {};
        var tuning = music.getTuningAsC1Offset();
        for (var n = 0; n < music.getBarCount(); n++) {
            var b = music.getBar(n);
            for (var s = 0; s < b.getStrumCount(); s++) {
                var fret = b.getStrum(s).getStrum();
                for (var fn = 0; fn < fret.length; fn++) {
                    if (fret[fn] != Strum.NOSTRUM) {
                        var nc = fret[fn] + tuning[fn];
                        preloads[nc] = nc;
                    }
                }
            }
        }
        Player.loaded = [];
        for (var nn in preloads) {
            var sn = preloads[nn] - Player.BASENOTE + 1;
            Player.loaded.push(sn);
            var sns = sn.toString();
            game.load.audio(sns, ["assets/sounds/" + sns + ".mp3",
                "assets/sounds/" + sns + ".ogg"]);
        }
    };
    Player.BASENOTE = 24;
    return Player;
}());
var InstrumentInfo = (function () {
    function InstrumentInfo() {
    }
    InstrumentInfo.encodedInfo = "merlin.Seagull Merlin.d3,a3,d4.3.n.S.S.D.0=0.1=2.2=4.3=5.4=7.5=9.6=11.7=12:ukulele.Ukulele.g4,c4,e4,a4.4.n.S.S.S.S.0=0.1=1.2=2.3=3.4=4.5=5.6=6.7=7.8=8.9=9.10=10.11=11.12=12.13=13.14=14:strumstick.McNally Strumstick.d3,a3,d4.3.n.S.S.D.0=0.1=2.2=4.3=5.4=7.5=9.6=10.7=11.8=12.9=14.10=16.11=17.12=19.13=21.14=22:dulcimer.Mountain Dulcimer.d3,a3,d4.3.y.S.S.D.0=0.1=2.2=4.3=5.4=7.5=9.6=10.6+=11.7=12.8=14.9=16.10=17.11=19.12=21.13=22.13+=23.14=24:loog.Loog Guitar.g3,b3,e4.3.n.S.S.S.0=0.1=1.2=2.3=3.4=4.5=5.6=6.7=7.8=8.9=9.10=10.11=11.12=12.13=13.14=14.15=15.16=16.17=17.18=18:mandolin.Mandolin.g3,d4,a4,e5.4.n.D.D.D.D.0=0.1=1.2=2.3=3.4=4.5=5.6=6.7=7.8=8.9=9.10=10.11=11.12=12.13=13.14=14.15=15.16=16.17=17.18=18";
    return InstrumentInfo;
}());
var Background = (function () {
    function Background(game, state) {
        this.bgr = game.add.image(0, 0, "sprites", "background");
        this.bgr.width = Configuration.width;
        this.bgr.height = Configuration.height;
        this.bgr.inputEnabled = true;
        this.bgr.events.onInputDown.add(function () { state.nextManager(); }, state);
    }
    Background.prototype.destroy = function () {
        this.bgr.destroy();
        this.bgr = null;
    };
    return Background;
}());
var LyricBar = (function () {
    function LyricBar(game) {
        var w = Configuration.width - Configuration.lyricSize -
            Configuration.controlHeight;
        var t = game.add.bitmapText(Configuration.width / 2, Configuration.yBase, "dfont", "xxxx", Configuration.lyricSize * 0.9);
        t.tint = 0xFFFF00;
        t.anchor.x = 0.5;
        this.textBox = t;
    }
    LyricBar.prototype.setLyric = function (txt) {
        this.textBox.text = txt;
    };
    LyricBar.prototype.destroy = function () {
        this.textBox.destroy();
        this.textBox = null;
    };
    return LyricBar;
}());
var DraggableSphere = (function () {
    function DraggableSphere(game, owner, xStart, yStart, colour, reduce) {
        this.sphere = game.add.image(xStart, yStart, "sprites", "sp" + colour, owner);
        this.sphere.anchor.x = this.sphere.anchor.y = 0.5;
        this.sphere.height = this.sphere.width = 70 + reduce;
        this.sphere.inputEnabled = true;
        this.sphere.input.enableDrag();
        this.sphere.input.setDragLock(true, false);
        this.sphere.events.onDragStop.add(owner.updatePositionsOnDrop, owner);
    }
    DraggableSphere.prototype.setBounds = function (xStart, xEnd, y) {
        this.sphere.input.boundsRect = new Phaser.Rectangle(xStart - this.sphere.width / 2, y - 100, xEnd - xStart + this.sphere.width, y + 100);
    };
    DraggableSphere.prototype.moveTo = function (x, y) {
        this.sphere.x = x;
        this.sphere.y = y;
    };
    DraggableSphere.prototype.destroy = function () {
        this.sphere.destroy();
        this.sphere = null;
    };
    DraggableSphere.prototype.getX = function () {
        return this.sphere.x;
    };
    DraggableSphere.prototype.isDragging = function () {
        return this.sphere.input.isDragged;
    };
    return DraggableSphere;
}());
var PositionBar = (function (_super) {
    __extends(PositionBar, _super);
    function PositionBar(game, music, xLeft, xRight, y) {
        var _this = _super.call(this, game) || this;
        var bar = _this.game.add.image(xLeft, y, "sprites", "rectangle", _this);
        bar.width = xRight - xLeft;
        bar.height = 16;
        bar.tint = 0x0040FF;
        bar.anchor.y = 0.5;
        _this.xLeft = xLeft;
        _this.xRight = xRight;
        _this.yPos = y;
        _this.music = music;
        _this.spheres = [];
        _this.spheres.push(new DraggableSphere(game, _this, xLeft, y, "red", 0));
        _this.spheres.push(new DraggableSphere(game, _this, xRight, y, "green", 0));
        _this.spheres.push(new DraggableSphere(game, _this, (xLeft + xRight) / 2, y, "yellow", -10));
        for (var _i = 0, _a = _this.spheres; _i < _a.length; _i++) {
            var sphere = _a[_i];
            sphere.setBounds(xLeft, xRight, y);
        }
        return _this;
    }
    PositionBar.prototype.updatePosition = function (barFractionalPosition) {
        if (!this.spheres[2].isDragging()) {
            var frac = barFractionalPosition / this.music.getBarCount();
            frac = Math.min(1, frac);
            this.spheres[2].moveTo(this.xLeft + (this.xRight - this.xLeft) * frac, this.yPos);
        }
        var xPos = this.spheres[2].getX();
        xPos = Math.max(xPos, this.spheres[0].getX());
        if (xPos > this.spheres[1].getX())
            xPos = this.spheres[0].getX();
        barFractionalPosition = this.music.getBarCount() *
            (xPos - this.xLeft) / (this.xRight - this.xLeft);
        return barFractionalPosition;
    };
    PositionBar.prototype.updatePositionsOnDrop = function () {
        if (this.spheres[0].getX() + 50 >= this.spheres[1].getX()) {
            this.spheres[0].moveTo(Math.max(this.spheres[1].getX() - 50, 0), this.yPos);
        }
    };
    PositionBar.prototype.destroy = function () {
        for (var _i = 0, _a = this.spheres; _i < _a.length; _i++) {
            var ds = _a[_i];
            ds.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    return PositionBar;
}(Phaser.Group));
var SpeedArrow = (function (_super) {
    __extends(SpeedArrow, _super);
    function SpeedArrow(game) {
        var _this = _super.call(this, game) || this;
        _this.arrow = _this.game.add.image(0, 0, "sprites", "arrow", _this);
        _this.arrow.width = Configuration.height - Configuration.yBase;
        _this.arrow.height = _this.arrow.width;
        _this.arrow.anchor.x = _this.arrow.anchor.y = 0.5;
        _this.arrow.x = _this.game.width - _this.arrow.width / 2;
        _this.arrow.y = _this.game.height - _this.arrow.height / 2;
        _this.arrow.inputEnabled = true;
        _this.arrow.tint = 0xFF8000;
        return _this;
    }
    SpeedArrow.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.arrow = null;
    };
    SpeedArrow.prototype.updateRotate = function (elapsedMS) {
        var ptr = this.game.input.activePointer;
        if (ptr.leftButton.isDown &&
            Math.abs(ptr.x - this.arrow.x) < this.arrow.width / 2 &&
            Math.abs(ptr.y - this.arrow.y) < this.arrow.height / 2) {
            this.arrow.rotation = this.arrow.rotation + elapsedMS / 1000;
            if (this.arrow.rotation >= 2 * Math.PI)
                this.arrow.rotation -= 2 * Math.PI;
            this.arrow.tint = (this.getScalar() < 1 ? 0x0080F0 : 0x00FF00);
            if (this.getScalar() > 0.98 && this.getScalar() < 1.02)
                this.arrow.tint = 0xFF8000;
        }
    };
    SpeedArrow.prototype.getScalar = function () {
        var n = (this.arrow.rotation - Math.PI) / Math.PI;
        if (n < 0) {
            n = 2 + n;
        }
        else {
            n = n * 3 / 4 + 0.25;
        }
        return n;
    };
    return SpeedArrow;
}(Phaser.Group));
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
    Music.prototype.getTuningAsC1Offset = function () {
        var c1tuning = [];
        for (var _i = 0, _a = this.getTuning().split(","); _i < _a.length; _i++) {
            var s = _a[_i];
            c1tuning.push(Music.nameToNoteID(s));
        }
        return c1tuning;
    };
    Music.nameToNoteID = function (s) {
        var n = (s.charCodeAt(s.length - 1) - 49) * 12;
        n = n + Music.noteToID[s.substr(0, s.length - 1)];
        return n;
    };
    Music.noteToID = {
        "c": 0, "c#": 1, "d": 2, "d#": 3, "e": 4, "f": 5, "f#": 6, "g": 7, "g#": 8, "a": 9, "a#": 10, "b": 11
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
        Player.preload(this.game, new Music(this.game.cache.getJSON("music")));
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
        for (var sn = this.bar.getStrumCount() - 1; sn >= 0; sn--) {
            this.strumRenders[sn] = this.createStrumRenderer(this, this.game, this.bar.getStrum(sn));
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
    BaseRenderManager.prototype.moveTo = function (barPosition) {
        if (barPosition < this.music.getBarCount()) {
            var cBar = this.music.getBar(Math.floor(barPosition));
            var qbPos = (barPosition - Math.floor(barPosition)) * 4 * this.music.getBeats();
            for (var s = 0; s < cBar.getStrumCount(); s++) {
                var strum = cBar.getStrum(s);
                if (qbPos >= strum.getQBStart() && qbPos < strum.getQBEnd()) {
                    var prop = (qbPos - strum.getQBStart()) / strum.getQBLength();
                    this.highlight(cBar, s, prop, true);
                }
                else {
                    this.highlight(cBar, s, 0, false);
                }
            }
        }
    };
    BaseRenderManager.prototype.highlight = function (bar, strumNo, prop, isOn) {
        var br = this.renderers[bar.getBarNumber()];
        if (br.isDrawn) {
            br.strumRenders[strumNo].highlightStrumObjects(isOn, prop * 100);
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
var ProjectedRenderer = (function (_super) {
    __extends(ProjectedRenderer, _super);
    function ProjectedRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProjectedRenderer.prototype.moveNonStrumItemsTo = function (barPosition) {
        for (var b = 0; b < this.beatLines.length; b++) {
            var y = barPosition + ProjectedRenderManager.yPerBar * b / this.beatLines.length;
            this.beatLines[b].visible = (y >= 0);
            this.beatLines[b].y = ProjectedRenderManager.yPos(0, y);
            this.beatLines[b].width = ProjectedRenderManager.xPos(0, y) -
                ProjectedRenderManager.xPos(Configuration.strings - 1, y);
        }
    };
    ProjectedRenderer.prototype.createNonStrumItems = function () {
        this.beatLines = [];
        for (var b = 0; b < this.bar.getMusic().getBeats(); b++) {
            var bi = this.game.add.image(Configuration.width / 2, 32, "sprites", "rectangle");
            bi.anchor.x = bi.anchor.y = 0.5;
            bi.height = 2;
            bi.tint = (b == 0) ? 0xFFD700 : 0x000000;
            this.beatLines[b] = bi;
        }
    };
    ProjectedRenderer.prototype.destroyNonStrumItems = function () {
        for (var _i = 0, _a = this.beatLines; _i < _a.length; _i++) {
            var bi = _a[_i];
            bi.destroy();
        }
        this.beatLines = [];
    };
    ProjectedRenderer.prototype.createStrumRenderer = function (renderer, game, strum) {
        return new ProjectedStrumRenderer(this, this.game, strum);
    };
    ProjectedRenderer.prototype.isVisible = function (pos) {
        if (pos < -ProjectedRenderManager.yPerBar)
            return false;
        if (pos > 1000)
            return false;
        return true;
    };
    return ProjectedRenderer;
}(BaseRenderer));
var ProjectedRenderManager = (function (_super) {
    __extends(ProjectedRenderManager, _super);
    function ProjectedRenderManager(game, music) {
        var _this = _super.call(this, game, music) || this;
        ProjectedRenderManager.yFront = Configuration.yBase - 10;
        ProjectedRenderManager.yPerBar = 550;
        return _this;
    }
    ProjectedRenderManager.prototype.createRenderer = function (manager, game, bar) {
        return new ProjectedRenderer(this, this.game, bar);
    };
    ProjectedRenderManager.prototype.createFixed = function (game) {
        this.fixed = new Phaser.Group(game);
        for (var s = 0; s < Configuration.strings; s++) {
            var dbl = Configuration.instrument.isDoubleString(s);
            var dx = ProjectedRenderManager.xPos(s, 0) -
                ProjectedRenderManager.xPos(s, 1000);
            var dy = ProjectedRenderManager.yPos(s, 0) -
                ProjectedRenderManager.yPos(s, 1000);
            var adj = Math.atan2(dy, dx);
            var rail = game.add.image(0, 0, "sprites", dbl ? "dstring" : "string", this.fixed);
            rail.x = ProjectedRenderManager.xPos(s, 0);
            rail.y = ProjectedRenderManager.yPos(s, 0);
            rail.width = game.height * 3 / 2;
            rail.height = dbl ? 20 : 10;
            rail.anchor.x = 1;
            rail.anchor.y = 0.5;
            rail.rotation = adj;
        }
    };
    ProjectedRenderManager.prototype.destroyFixed = function () {
        this.fixed.destroy();
    };
    ProjectedRenderManager.prototype.moveTo = function (barPosition) {
        _super.prototype.moveTo.call(this, barPosition);
        for (var bn = 0; bn < this.music.getBarCount(); bn++) {
            this.renderers[bn].moveTo((bn - barPosition) * ProjectedRenderManager.yPerBar);
        }
    };
    ProjectedRenderManager.xPos = function (str, yl) {
        yl = ProjectedRenderManager.yPos(str, yl);
        var xs = 0.1 * (str - (Configuration.strings - 1) / 2) *
            Configuration.width / (Configuration.strings - 1);
        xs = xs * (1 + yl / 120);
        return xs + Configuration.width / 2;
    };
    ProjectedRenderManager.yPos = function (str, y) {
        var camera = 500;
        y = ProjectedRenderManager.yFront -
            (1 - camera / (y + camera)) * (ProjectedRenderManager.yFront - 200) * 2.1;
        return y;
    };
    return ProjectedRenderManager;
}(BaseRenderManager));
var ProjectedStrumRenderer = (function () {
    function ProjectedStrumRenderer(renderer, game, strum) {
        this.label = [];
        this.spheres = [];
        this.strum = strum;
        var fretting = strum.getStrum();
        for (var s = 0; s < Configuration.strings; s++) {
            this.label[s] = null;
            this.spheres[s] = null;
            if (fretting[s] != Strum.NOSTRUM) {
                var col = ProjectedStrumRenderer.COLOURS[fretting[s] % ProjectedStrumRenderer.COLOURS.length];
                this.spheres[s] = game.add.image(0, 0, "sprites", col);
                this.spheres[s].anchor.x = 0.5;
                this.spheres[s].anchor.y = 1;
                var t = Configuration.instrument.getDisplayName(fretting[s]);
                this.label[s] = game.add.bitmapText(0, 0, "dfont", t, 32);
                this.label[s].anchor.x = 0.5;
                this.label[s].anchor.y = 0.5;
            }
        }
    }
    ProjectedStrumRenderer.prototype.moveTo = function (pos) {
        var beats = this.strum.getBar().getMusic().getBeats();
        var y = pos + this.strum.getQBStart() / (beats * 4) * ProjectedRenderManager.yPerBar;
        var size = Math.abs(ProjectedRenderManager.xPos(0, y) - ProjectedRenderManager.xPos(1, y));
        for (var s = 0; s < Configuration.strings; s++) {
            if (this.label[s] != null) {
                this.spheres[s].x = ProjectedRenderManager.xPos(s, y);
                this.spheres[s].y = ProjectedRenderManager.yPos(s, y);
                this.spheres[s].width = this.spheres[s].height = (1000 - y) / 8 + 10;
                this.label[s].x = this.spheres[s].x;
                this.label[s].y = this.spheres[s].y - this.spheres[s].height / 2;
                this.spheres[s].visible = this.label[s].visible = (y > 0);
                this.label[s].fontSize = this.spheres[s].height * 0.6;
            }
        }
    };
    ProjectedStrumRenderer.prototype.highlightStrumObjects = function (highlight, percent) {
    };
    ProjectedStrumRenderer.prototype.destroy = function () {
        for (var _i = 0, _a = this.label; _i < _a.length; _i++) {
            var s = _a[_i];
            if (s != null)
                s.destroy();
        }
        for (var _b = 0, _c = this.spheres; _b < _c.length; _b++) {
            var s1 = _c[_b];
            if (s1 != null)
                s1.destroy();
        }
        this.spheres = this.strum = this.label = null;
    };
    ProjectedStrumRenderer.COLOURS = [
        "spcyan", "spgrey", "spred", "spblue", "spdarkgreen",
        "spmagenta", "spyellow", "spbrown", "spgreen", "sporange"
    ];
    return ProjectedStrumRenderer;
}());
var SineCurveBaseStrumRenderer = (function () {
    function SineCurveBaseStrumRenderer(renderer, game, strum) {
        this.renderer = renderer;
        this.game = game;
        this.strum = strum;
        this.beats = strum.getBar().getMusic().getBeats();
        var width = this.getStrumWidth();
        var height = Configuration.height / 8;
        var spr = this.getBestMatch2(width);
        this.sineCurve = game.add.image(0, Configuration.yBase - ScrollingTabRenderManager.fretBoardTotalSize, "sprites", spr);
        this.sineCurve.anchor.x = 0.5;
        this.sineCurve.anchor.y = 1.0;
        var scale = width / this.sineCurve.width;
        this.sineCurve.scale.x = scale;
    }
    SineCurveBaseStrumRenderer.prototype.getSineHeight = function () {
        return this.sineCurve.height;
    };
    SineCurveBaseStrumRenderer.prototype.getStrumWidth = function () {
        return this.strum.getQBLength() / (this.beats * 4) * ScrollingTabRenderManager.xBarSize;
    };
    SineCurveBaseStrumRenderer.prototype.getStrumCentre = function () {
        return (this.strum.getQBStart() + this.strum.getQBLength() / 2) / (this.beats * 4) * ScrollingTabRenderManager.xBarSize;
    };
    SineCurveBaseStrumRenderer.prototype.destroy = function () {
        this.sineCurve.destroy();
        this.sineCurve = null;
        this.renderer = this.game = this.strum = null;
    };
    SineCurveBaseStrumRenderer.prototype.moveTo = function (pos) {
        this.sineCurve.x = pos + this.getStrumCentre();
    };
    SineCurveBaseStrumRenderer.prototype.getBestMatch2 = function (width) {
        if (SineCurveBaseStrumRenderer.curveInfo == null) {
            SineCurveBaseStrumRenderer.curveInfo = {};
            var scache = this.game.cache.getJSON("sprite_info");
            for (var k in scache.frames) {
                if (k.substr(0, 10) == "sinecurve_") {
                    var spr = scache.frames[k];
                    var asp = spr.frame.w;
                    SineCurveBaseStrumRenderer.curveInfo[k] = asp;
                }
            }
        }
        var best;
        var bestDistance = 9999;
        for (var k in SineCurveBaseStrumRenderer.curveInfo) {
            var diff = Math.abs(width - SineCurveBaseStrumRenderer.curveInfo[k]);
            if (diff < bestDistance) {
                bestDistance = diff;
                best = k;
            }
        }
        return best;
    };
    SineCurveBaseStrumRenderer.curveInfo = null;
    return SineCurveBaseStrumRenderer;
}());
var ScrollingTabChordsRenderer = (function (_super) {
    __extends(ScrollingTabChordsRenderer, _super);
    function ScrollingTabChordsRenderer(renderer, game, strum) {
        var _this = _super.call(this, renderer, game, strum) || this;
        var tm = Math.floor(strum.getQBStart() / 2);
        _this.yOffset = 0;
        _this.button = game.add.image(0, 0, "sprites", tm % 2 == 0 ? "chordbutton_down" : "chordbutton_up");
        _this.button.anchor.x = 0;
        _this.button.anchor.y = 0.5;
        _this.button.width = ScrollingTabRenderManager.xBarSize / (_this.beats * 2) * 0.97;
        _this.button.height = ScrollingTabRenderManager.fretBoardStringSize * 0.95;
        _this.button.tint = _this.getChordColour(strum.getChord());
        var size = ScrollingTabRenderManager.xBarSize / _this.beats / 2 * 0.45;
        var cName = strum.getChord().toLowerCase();
        cName = cName.charAt(0).toUpperCase() + cName.substr(1);
        _this.label = game.add.bitmapText(0, 0, "dfont", cName, size);
        _this.label.anchor.x = 0.5;
        _this.label.anchor.y = 0.5;
        return _this;
    }
    ScrollingTabChordsRenderer.prototype.moveTo = function (pos) {
        _super.prototype.moveTo.call(this, pos);
        var x = pos + this.getStrumCentre();
        var alpha = 1;
        if (x < ScrollingTabRenderManager.xStartPoint) {
            alpha = 1 - 1.5 * (ScrollingTabRenderManager.xStartPoint - x) /
                ScrollingTabRenderManager.xBarSize;
            alpha = Math.max(0, alpha);
        }
        this.button.x = pos + this.getStrumCentre() - this.getStrumWidth() / 2;
        this.button.y = ScrollingTabRenderManager.centreFretboard + this.yOffset;
        this.button.alpha = alpha;
        this.label.x = this.button.x + this.button.width / 2;
        this.label.y = this.button.y + ScrollingTabRenderManager.fretBoardStringSize * 0.3;
        this.label.alpha = alpha;
    };
    ScrollingTabChordsRenderer.prototype.highlightStrumObjects = function (highlight, percent) {
        this.yOffset = highlight ? ScrollingTabNotesRenderer.getYDip(percent) : 0;
    };
    ScrollingTabChordsRenderer.prototype.destroy = function () {
        this.button.destroy();
        this.label.destroy();
        this.button = this.label = null;
        _super.prototype.destroy.call(this);
    };
    ScrollingTabChordsRenderer.prototype.getChordColour = function (name) {
        if (ScrollingTabChordsRenderer.chordsUsed == null) {
            ScrollingTabChordsRenderer.chordsUsed = { "": null };
            var cc = 0;
            var m = this.strum.getBar().getMusic();
            for (var bn = 0; bn < m.getBarCount(); bn++) {
                for (var sn = 0; sn < m.getBar(bn).getStrumCount(); sn++) {
                    var cName = m.getBar(bn).getStrum(sn).getChord();
                    if (ScrollingTabChordsRenderer.chordsUsed[cName] == undefined) {
                        ScrollingTabChordsRenderer.chordsUsed[cName] = cc;
                        cc++;
                    }
                }
            }
        }
        return BaseRenderManager.getColour(ScrollingTabChordsRenderer.chordsUsed[name]);
    };
    ScrollingTabChordsRenderer.chordsUsed = null;
    return ScrollingTabChordsRenderer;
}(SineCurveBaseStrumRenderer));
var ScrollingTabNotesRenderer = (function (_super) {
    __extends(ScrollingTabNotesRenderer, _super);
    function ScrollingTabNotesRenderer(renderer, game, strum) {
        var _this = _super.call(this, renderer, game, strum) || this;
        _this.yOffset = 0;
        _this.buttons = [];
        _this.text = [];
        _this.yOffset = 0;
        var fretting = strum.getStrum();
        var height = Math.abs(ScrollingTabRenderManager.getStringY(1) -
            ScrollingTabRenderManager.getStringY(0));
        var width = _this.getStrumWidth();
        var btn = _this.getBestMatch(width / height);
        for (var s = 0; s < Configuration.strings; s++) {
            _this.buttons[s] = null;
            _this.text[s] = null;
            if (fretting[s] != Strum.NOSTRUM) {
                _this.buttons[s] = game.add.image(0, 0, "sprites", btn);
                _this.buttons[s].width = width;
                _this.buttons[s].height = height * 0.9;
                _this.buttons[s].tint = BaseRenderManager.getColour(fretting[s]);
                _this.buttons[s].anchor.x = _this.buttons[s].anchor.y = 0.5;
                var txt = Configuration.instrument.getDisplayName(fretting[s]);
                _this.text[s] = game.add.bitmapText(0, _this.buttons[s].y, "dfont", txt, _this.buttons[s].height * 0.6);
                _this.text[s].anchor.x = 0.58;
                _this.text[s].anchor.y = 0.5;
            }
        }
        return _this;
    }
    ScrollingTabNotesRenderer.prototype.moveTo = function (pos) {
        _super.prototype.moveTo.call(this, pos);
        var x = pos + this.getStrumCentre();
        var alpha = 1;
        if (x < ScrollingTabRenderManager.xStartPoint) {
            alpha = 1 - 1.5 * (ScrollingTabRenderManager.xStartPoint - x) /
                ScrollingTabRenderManager.xBarSize;
            alpha = Math.max(0, alpha);
        }
        for (var s = 0; s < Configuration.strings; s++) {
            if (this.buttons[s] != null) {
                this.buttons[s].x = x;
                this.buttons[s].y = ScrollingTabRenderManager.getStringY(s) + this.yOffset;
                this.buttons[s].alpha = alpha;
                this.text[s].x = x;
                this.text[s].y = this.buttons[s].y;
                this.text[s].alpha = alpha;
                this.buttons[s].bringToTop();
                this.game.world.bringToTop(this.text[s]);
            }
        }
    };
    ScrollingTabNotesRenderer.prototype.highlightStrumObjects = function (highlight, percent) {
        this.yOffset = highlight ? ScrollingTabNotesRenderer.getYDip(percent) : 0;
    };
    ScrollingTabNotesRenderer.prototype.destroy = function () {
        for (var _i = 0, _a = this.buttons; _i < _a.length; _i++) {
            var b = _a[_i];
            if (b != null)
                b.destroy();
        }
        for (var _b = 0, _c = this.text; _b < _c.length; _b++) {
            var t = _c[_b];
            if (t != null)
                t.destroy();
        }
        this.text = this.buttons = null;
        _super.prototype.destroy.call(this);
    };
    ScrollingTabNotesRenderer.prototype.getBestMatch = function (aspect) {
        if (ScrollingTabNotesRenderer.buttonInfo == null) {
            ScrollingTabNotesRenderer.buttonInfo = {};
            var scache = this.game.cache.getJSON("sprite_info");
            for (var k in scache.frames) {
                if (k.substr(0, 14) == "notebutton_up_") {
                    var spr = scache.frames[k];
                    var asp = spr.frame.w / spr.frame.h;
                    ScrollingTabNotesRenderer.buttonInfo[k] = asp;
                }
            }
        }
        var best;
        var bestDistance = 9999;
        for (var k in ScrollingTabNotesRenderer.buttonInfo) {
            var diff = Math.abs(aspect - ScrollingTabNotesRenderer.buttonInfo[k]);
            if (diff < bestDistance) {
                bestDistance = diff;
                best = k;
            }
        }
        return best;
    };
    ScrollingTabNotesRenderer.getYDip = function (prop) {
        if (prop > 50)
            prop = 100 - prop;
        return (prop < 10) ? prop : 10;
    };
    ScrollingTabNotesRenderer.buttonInfo = null;
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
    ScrollingTabRenderer.prototype.getStrumSineHeight = function (strumNo) {
        if (!this.isDrawn)
            return 0;
        return this.strumRenders[strumNo].getSineHeight();
    };
    ScrollingTabRenderer.prototype.destroyNonStrumItems = function () {
        for (var _i = 0, _a = this.beatBars; _i < _a.length; _i++) {
            var bb = _a[_i];
            bb.destroy();
        }
        this.beatBars = null;
    };
    ScrollingTabRenderer.prototype.createStrumRenderer = function (renderer, game, strum) {
        if (strum.getChord() != "") {
            return new ScrollingTabChordsRenderer(renderer, game, strum);
        }
        else {
            return new ScrollingTabNotesRenderer(renderer, game, strum);
        }
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
        ScrollingTabRenderManager.fretBoardTotalSize = Configuration.yBase * 0.5;
        ScrollingTabRenderManager.fretBoardStringSize =
            ScrollingTabRenderManager.fretBoardTotalSize * 0.85;
        ScrollingTabRenderManager.centreFretboard =
            Configuration.yBase - ScrollingTabRenderManager.fretBoardTotalSize / 2;
        ScrollingTabRenderManager.sineCurveHeight =
            ScrollingTabRenderManager.fretBoardTotalSize / 3;
        ScrollingTabRenderManager.xStartPoint =
            Configuration.width * 0.2;
        ScrollingTabRenderManager.xBarSize =
            Configuration.width * 0.55;
        return _this;
    }
    ScrollingTabRenderManager.prototype.createRenderer = function (manager, game, bar) {
        return new ScrollingTabRenderer(manager, game, bar);
    };
    ScrollingTabRenderManager.prototype.moveTo = function (barPosition) {
        _super.prototype.moveTo.call(this, barPosition);
        for (var bn = 0; bn < this.music.getBarCount(); bn++) {
            this.renderers[bn].moveTo(ScrollingTabRenderManager.xStartPoint +
                (bn - barPosition) * ScrollingTabRenderManager.xBarSize);
        }
    };
    ScrollingTabRenderManager.prototype.highlight = function (bar, strumNo, prop, isOn) {
        _super.prototype.highlight.call(this, bar, strumNo, prop, isOn);
        if (isOn) {
            var sv = Math.sin(prop * Math.PI);
            var renderer = this.renderers[bar.getBarNumber()];
            var h = renderer.getStrumSineHeight(strumNo);
            this.ball.y = Configuration.yBase - ScrollingTabRenderManager.fretBoardTotalSize;
            this.ball.y = this.ball.y - sv * h;
            this.ball.bringToTop();
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
        this.ball = game.add.image(ScrollingTabRenderManager.xStartPoint, 100, "sprites", "spred");
        this.ball.width = this.ball.height = ScrollingTabRenderManager.xBarSize / 10;
        this.ball.anchor.x = 0.5;
        this.ball.anchor.y = 1.0;
    };
    ScrollingTabRenderManager.prototype.destroyFixed = function () {
        for (var _i = 0, _a = this.strings; _i < _a.length; _i++) {
            var x = _a[_i];
            x.destroy();
        }
        this.fretBoard.destroy();
        this.mainBoard.destroy();
        this.ball.destroy();
        this.ball = this.strings = this.mainBoard = this.fretBoard = null;
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
var TabRenderer = (function (_super) {
    __extends(TabRenderer, _super);
    function TabRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabRenderer.prototype.moveNonStrumItemsTo = function (barPosition) {
        var bn = this.bar.getBarNumber();
        this.fixed.x = (bn % TabRenderManager.renderPerLine) *
            TabRenderManager.renderWidth;
        this.fixed.y = Math.floor(bn / TabRenderManager.renderPerLine) *
            TabRenderManager.renderHeight;
    };
    TabRenderer.prototype.createNonStrumItems = function () {
        this.fixed = new Phaser.Group(this.game);
        for (var s = 0; s < Configuration.strings; s++) {
            var str = this.game.add.image(0, 0, "sprites", "rectangle", this.fixed);
            str.width = TabRenderManager.renderWidth;
            str.height = Math.max(1, TabRenderManager.renderHeight / 64);
            str.anchor.y = 0.5;
            str.tint = 0;
            str.alpha = 0.5;
            str.x = 0;
            str.y = TabRenderer.yString(s);
        }
        for (var be = 0; be < 2; be++) {
            var ben = this.game.add.image((be == 0) ? 0 : TabRenderManager.renderWidth, TabRenderManager.renderHeight / 2, "sprites", "rectangle", this.fixed);
            ben.width = Math.max(2, TabRenderManager.renderWidth / 32);
            ben.height = TabRenderer.yString(0) - TabRenderer.yString(Configuration.strings - 1);
            ben.anchor.x = ben.anchor.y = 0.5;
            ben.tint = 0;
        }
    };
    TabRenderer.prototype.destroyNonStrumItems = function () {
        this.fixed.destroy();
        this.fixed = null;
    };
    TabRenderer.prototype.createStrumRenderer = function (renderer, game, strum) {
        return new TabStrumRenderer(this, this.game, strum);
    };
    TabRenderer.prototype.isVisible = function (pos) {
        return true;
    };
    TabRenderer.xNote = function (strum) {
        var prop = strum.getQBStart() /
            (strum.getBar().getMusic().getBeats() * 4);
        prop = prop * 0.9 + 0.1;
        return Math.round(prop * TabRenderManager.renderWidth);
    };
    TabRenderer.yString = function (str) {
        if (!Configuration.instrument.isTabInverted()) {
            str = Configuration.strings - 1 - str;
        }
        return TabRenderManager.renderHeight / 2 +
            TabRenderManager.renderHeight *
                (str - (Configuration.strings - 1) / 2) / (Configuration.strings + 1);
    };
    TabRenderer.prototype.getXBox = function () { return this.fixed.x; };
    TabRenderer.prototype.getYBox = function () { return this.fixed.y; };
    return TabRenderer;
}(BaseRenderer));
var TabRenderManager = (function (_super) {
    __extends(TabRenderManager, _super);
    function TabRenderManager(game, music) {
        var _this = _super.call(this, game, music) || this;
        TabRenderManager.renderPerLine = 3 - 1;
        do {
            TabRenderManager.renderPerLine++;
            TabRenderManager.renderWidth = Configuration.width / TabRenderManager.renderPerLine;
            TabRenderManager.renderHeight = TabRenderManager.renderWidth / 2;
            var vertCount = Math.floor(Configuration.yBase / TabRenderManager.renderHeight);
        } while (TabRenderManager.renderPerLine * vertCount < music.getBarCount());
        return _this;
    }
    TabRenderManager.prototype.createRenderer = function (manager, game, bar) {
        return new TabRenderer(this, this.game, bar);
    };
    TabRenderManager.prototype.createFixed = function (game) {
        var marker = game.add.image(0, 0, "sprites", "rectangle");
        marker.anchor.x = marker.anchor.y = 0.5;
        marker.width = TabRenderManager.renderWidth / 7;
        marker.height = TabRenderManager.renderHeight * 0.9;
        marker.tint = 0x808080;
        marker.alpha = 0.5;
        TabRenderManager.marker = marker;
        this.background = game.add.image(0, 0, "sprites", "rectangle");
        this.background.width = Configuration.width;
        this.background.height = Configuration.yBase;
    };
    TabRenderManager.prototype.destroyFixed = function () {
        TabRenderManager.marker.destroy();
        TabRenderManager.marker = null;
        this.background.destroy();
        this.background = null;
    };
    TabRenderManager.prototype.moveTo = function (barPosition) {
        _super.prototype.moveTo.call(this, barPosition);
        if (barPosition == 0) {
            for (var bn = 0; bn < this.music.getBarCount(); bn++) {
                this.renderers[bn].moveTo(0);
            }
        }
    };
    return TabRenderManager;
}(BaseRenderManager));
var TabStrumRenderer = (function () {
    function TabStrumRenderer(renderer, game, strum) {
        this.renderer = renderer;
        this.sGroup = new Phaser.Group(game);
        var x = TabRenderer.xNote(strum);
        this.xOffset = x;
        var fretting = strum.getStrum();
        for (var s = 0; s < Configuration.strings; s++) {
            if (fretting[s] != Strum.NOSTRUM) {
                var y = TabRenderer.yString(s);
                var stxt = Configuration.instrument.getDisplayName(fretting[s]);
                var txt = game.add.bitmapText(x, y, "font", stxt, 0.7 * TabRenderManager.renderHeight / Configuration.strings, this.sGroup);
                txt.anchor.x = 0.5;
                txt.anchor.y = 0.42;
                txt.tint = 0x000080;
            }
        }
    }
    TabStrumRenderer.prototype.moveTo = function (pos) {
        this.sGroup.x = this.renderer.getXBox();
        this.sGroup.y = this.renderer.getYBox();
    };
    TabStrumRenderer.prototype.highlightStrumObjects = function (highlight, percent) {
        var marker = TabRenderManager.marker;
        marker.bringToTop();
        if (highlight) {
            marker.x = this.xOffset + this.sGroup.x;
            marker.y = this.sGroup.y + TabRenderManager.renderHeight / 2;
        }
    };
    TabStrumRenderer.prototype.destroy = function () {
        this.sGroup.destroy();
        this.sGroup = this.renderer = null;
    };
    return TabStrumRenderer;
}());
