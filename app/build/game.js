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
var Configurator = (function () {
    function Configurator() {
    }
    Configurator.setup = function (game, stringCount) {
        Configurator.stringGap = game.height / 4;
        Configurator.stringMargin = game.height / 16;
        Configurator.ledgeHeight = game.height / 20;
        Configurator.barWidth = game.width / 3;
        Configurator.isFlipped = false;
        Configurator.xOrigin = game.width * 0.15;
        Configurator.yTop = game.height - Configurator.stringGap -
            Configurator.stringMargin * 2 - Configurator.ledgeHeight;
        Configurator.stringCount = stringCount;
    };
    Configurator.getStringCount = function () {
        return Configurator.stringCount;
    };
    Configurator.getStringY = function (str) {
        if (Configurator.isFlipped) {
            str = (Configurator.getStringCount() - 1) - str;
        }
        var y = Configurator.yTop +
            Configurator.stringMargin + Configurator.stringGap;
        y = y - str * Configurator.stringGap / (Configurator.stringCount - 1);
        return y;
    };
    return Configurator;
}());
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainState.prototype.create = function () {
        var musicJson = this.game.cache.getJSON("music");
        this.music = new Music(musicJson);
        Configurator.setup(this.game, this.music.getStringCount());
        var bgr = new Background(this.game);
        var r = new Renderer(this.game, this.music.getBar(0));
        r.moveTo(100);
        var r2 = new Renderer(this.game, this.music.getBar(1));
        r2.moveTo(100 + Configurator.barWidth);
    };
    MainState.prototype.destroy = function () {
    };
    MainState.prototype.update = function () {
    };
    MainState.VERSION = "0.01 02Nov17 Phaser-CE 2.8.7";
    return MainState;
}(Phaser.State));
var Background = (function (_super) {
    __extends(Background, _super);
    function Background(game) {
        var _this = _super.call(this, game) || this;
        var bgr = _this.game.add.image(0, 0, "sprites", "background", _this);
        bgr.width = _this.game.width;
        bgr.height = _this.game.height;
        var fretBoard = _this.game.add.image(0, Configurator.yTop, "sprites", "rectangle", _this);
        fretBoard.width = game.width;
        fretBoard.height = Configurator.stringGap + Configurator.stringMargin * 2;
        fretBoard.tint = 0x404040;
        var ledge = _this.game.add.image(0, fretBoard.bottom, "sprites", "rectangle", _this);
        ledge.width = _this.game.width;
        ledge.height = Configurator.ledgeHeight;
        ledge.tint = 0x282828;
        for (var n = 0; n < Configurator.getStringCount(); n++) {
            var string = game.add.image(0, Configurator.getStringY(n), "sprites", "string", _this);
            string.width = _this.game.width;
            string.height = Math.round(_this.game.height / 64 * (1 - n / 10));
            string.anchor.y = 0.5;
        }
        return _this;
    }
    return Background;
}(Phaser.Group));
var FingerButton = (function (_super) {
    __extends(FingerButton, _super);
    function FingerButton(game, stringID, fretting, pixWidth) {
        var _this = _super.call(this, game) || this;
        if (FingerButton.buttonInfo == null) {
            _this.loadButtonInfo();
        }
        var reqHeight = Configurator.stringGap / (Configurator.getStringCount() - 1) * 0.98;
        var gName = _this.identifyGraphics(pixWidth);
        _this.button = _this.game.add.image(0, 0, "sprites", gName, _this);
        _this.button.width = pixWidth;
        _this.button.height = reqHeight;
        _this.button.anchor.x = 0;
        _this.button.anchor.y = 0.5;
        _this.button.tint = FingerButton.getColour(fretting);
        _this.yPos = Configurator.getStringY(stringID);
        return _this;
    }
    FingerButton.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.button = null;
    };
    FingerButton.prototype.moveTo = function (x) {
        this.button.x = x;
        this.button.y = this.yPos;
    };
    FingerButton.prototype.loadButtonInfo = function () {
        FingerButton.buttonInfo = {};
        var json = this.game.cache.getJSON("sprites")["frames"];
        for (var spr in json) {
            if (spr.substr(0, 13) == "notebutton_up") {
                var frame = json[spr]["frame"];
                var wReq = frame["w"];
                FingerButton.buttonInfo[spr] = wReq;
            }
        }
    };
    FingerButton.prototype.identifyGraphics = function (width) {
        var best = "";
        var rDiff = 9999;
        for (var spr in FingerButton.buttonInfo) {
            var newv = Math.abs(width - FingerButton.buttonInfo[spr]);
            if (newv < rDiff) {
                best = spr;
                rDiff = newv;
            }
        }
        return best;
    };
    FingerButton.getColour = function (n) {
        return FingerButton.colours[n % FingerButton.colours.length];
    };
    FingerButton.colours = [
        0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF8000, 0xFFFF00, 0xFF00FF,
        0x00FFFF, 0xFF8000, 0x0080FF, 0x008000, 0x808000, 0x008080, 0x8B3413
    ];
    return FingerButton;
}(Phaser.Group));
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer(game, bar) {
        var _this = _super.call(this, game) || this;
        _this.bar = bar;
        _this.isRendered = false;
        _this.beats = _this.bar.getMusic().getBeats();
        return _this;
    }
    Renderer.prototype.destroy = function () {
        if (this.isRendered) {
            this.deleteRender();
        }
        _super.prototype.destroy.call(this);
        this.bar = null;
    };
    Renderer.prototype.createRender = function () {
        if (this.isRendered)
            return;
        this.isRendered = true;
        if (Renderer.DEBUG) {
            this.debugRect = this.game.add.image(0, 0, "sprites", "rectangle", this);
            this.debugRect.width = Configurator.barWidth;
            this.debugRect.height = Configurator.stringGap + Configurator.stringMargin * 2;
            this.debugRect.tint = 0xFF8000;
            this.debugRect.alpha = 0.2;
        }
        this.beatLines = [];
        var n = this.beats;
        var lastBar = this.bar.getMusic().getBarCount() - 1;
        if (this.bar == this.bar.getMusic().getBar(lastBar)) {
            n = n + 1;
        }
        for (var b = 0; b < n; b++) {
            this.beatLines[b] = this.game.add.image(0, 0, "sprites", "rectangle", this);
            this.beatLines[b].width = Math.max(this.game.width / 512, 1);
            if (b == 0 || b >= this.beats) {
                this.beatLines[b].height = this.game.height;
                this.beatLines[b].tint = 0x0080FF;
                this.beatLines[b].width = Math.max(this.game.width / 512, 1);
            }
            else {
                this.beatLines[b].height = Configurator.stringGap + Configurator.stringMargin * 2;
                this.beatLines[b].tint = 0x000000;
                this.beatLines[b].width = 1;
            }
            this.beatLines[b].anchor.x = 0.5;
            this.beatLines[b].anchor.y = 1.0;
        }
        this.buttons = [];
        for (var sn = 0; sn < this.bar.getStrumCount(); sn++) {
            this.buttons[sn] = [];
            var strum = this.bar.getStrum(sn);
            var w = Configurator.barWidth / this.beats * (strum.getLength() / 4);
            if (strum.isChord()) {
                var btn;
                btn = new StrumButton(this.game, w - 2, strum.getChordName(), strum.isChordDownStrum(), 0);
                this.buttons[sn].push(btn);
            }
            else {
                var sCount = this.bar.getMusic().getStringCount();
                for (var strn = 0; strn < sCount; strn++) {
                    var fretPos = strum.getStringFret(strn);
                    if (fretPos != Strum.NOSTRUM) {
                        var btn;
                        btn = new FingerButton(this.game, strn, fretPos, w);
                        this.buttons[sn].push(btn);
                    }
                }
            }
        }
    };
    Renderer.prototype.moveTo = function (x) {
        if (x > this.game.width || x + Configurator.barWidth < 0) {
            if (this.isRendered) {
                this.deleteRender();
                return;
            }
        }
        if (!this.isRendered) {
            this.createRender();
        }
        if (this.debugRect != null) {
            this.debugRect.x = x;
            this.debugRect.y = Configurator.yTop;
        }
        for (var b = 0; b < this.beatLines.length; b++) {
            this.beatLines[b].x = x + b * Configurator.barWidth / this.beats;
            this.beatLines[b].y = Configurator.yTop + Configurator.stringMargin * 2 + Configurator.stringGap;
        }
        for (var sn = 0; sn < this.bar.getStrumCount(); sn++) {
            var strum = this.bar.getStrum(sn);
            var x1 = x + strum.getStartTime() / 4 * Configurator.barWidth / this.beats;
            for (var _i = 0, _a = this.buttons[sn]; _i < _a.length; _i++) {
                var bt = _a[_i];
                bt.moveTo(x1);
            }
        }
    };
    Renderer.prototype.deleteRender = function () {
        if (!this.isRendered)
            return;
        this.isRendered = false;
        this.buttons = this.beatLines = this.debugRect = null;
    };
    Renderer.DEBUG = false;
    return Renderer;
}(Phaser.Group));
var StrumButton = (function (_super) {
    __extends(StrumButton, _super);
    function StrumButton(game, width, name, isDownStrum, colourBase) {
        var _this = _super.call(this, game) || this;
        var reqHeight = Configurator.stringGap + Configurator.stringMargin;
        var bName = "chordbutton_" + (isDownStrum ? "down" : "up");
        _this.button = _this.game.add.image(0, 0, "sprites", bName, _this);
        _this.button.width = width;
        _this.button.height = reqHeight;
        _this.button.anchor.x = 0;
        _this.button.anchor.y = 0.5;
        _this.button.tint = FingerButton.getColour(colourBase);
        return _this;
    }
    StrumButton.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.button = null;
    };
    StrumButton.prototype.moveTo = function (x) {
        this.button.x = x;
        this.button.y = Configurator.yTop + Configurator.stringMargin + Configurator.stringGap / 2;
    };
    return StrumButton;
}(Phaser.Group));
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
    Strum.prototype.isChordDownStrum = function () {
        return (this.startTime % 4) < 2;
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
        this.game.load.json("sprites", "assets/sprites/sprites.json");
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        for (var _i = 0, _a = ["font"]; _i < _a.length; _i++) {
            var fontName = _a[_i];
            this.game.load.bitmapFont(fontName, "assets/fonts/" + fontName + ".png", "assets/fonts/" + fontName + ".fnt");
        }
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
