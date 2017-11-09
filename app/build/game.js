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
        Configurator.stringGap = game.height / 3.5;
        Configurator.stringMargin = game.height / 16;
        Configurator.ledgeHeight = game.height / 20;
        Configurator.barWidth = Math.round(game.width / 2.5);
        Configurator.isFlipped = false;
        Configurator.xOrigin = Math.round(game.width * 0.22);
        Configurator.bounceHeightScale = 1;
        Configurator.scrollBarHeight = game.height / 10;
        Configurator.yTop = game.height - Configurator.stringGap -
            Configurator.stringMargin * 2 - Configurator.ledgeHeight -
            Configurator.scrollBarHeight;
        Configurator.stringCount = stringCount;
        Configurator.modifier = new DefaultModifier();
        var options = StringTrainerApplication.getURLName("options", "").toLowerCase();
        for (var _i = 0, _a = options.toLowerCase().split(";"); _i < _a.length; _i++) {
            var op = _a[_i];
            if (op == "flip") {
                Configurator.isFlipped = !Configurator.isFlipped;
            }
            if (op == "dulcimer") {
                Configurator.modifier = new DulcimerModifier();
                Configurator.isFlipped = !Configurator.isFlipped;
            }
            if (op == "merlin") {
                Configurator.modifier = new MerlinModifier();
            }
            if (op == "mandolin") {
                Configurator.modifier = new MandolinModifier();
            }
            if (op == "strumstick") {
                Configurator.modifier = new StrumstickModifier();
            }
        }
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
        this.player = new MusicPlayer(this.game, this.music.getStringCount(), this.music.getTuning());
        var bgr = new Background(this.game);
        this.metronome = new Metronome(this.game, this.music);
        this.position = 0;
        this.renderManager = new RenderManager(this.game, this.music);
        this.renderManager.addStrumEventHandler(this.player.strum, this.player);
        var btn = new PushButton(this.game, "i_faster", ButtonMessage.SlowSpeed, this);
        btn.x = btn.y = 70;
        var btn2 = new ToggleButton(this.game, "i_music", ButtonMessage.FastSpeed, this);
        btn2.x = btn2.y = 140;
    };
    MainState.prototype.click = function (msg, sender) {
        console.log(msg, sender);
    };
    MainState.prototype.destroy = function () {
        this.renderManager.destroy();
        this.music = this.renderManager = null;
    };
    MainState.prototype.update = function () {
        var elapsed = this.game.time.elapsedMS;
        elapsed = elapsed / 1000;
        var bpms = this.music.getTempo() / 60;
        this.position = this.position + bpms * elapsed
            / this.music.getBeats();
        this.renderManager.moveTo(this.position);
        this.metronome.moveTo(this.position);
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
            var isDouble = Configurator.modifier.isDoubleString(n);
            var gr = isDouble ? "dstring" : "string";
            var string = game.add.image(0, Configurator.getStringY(n), "sprites", gr, _this);
            string.width = _this.game.width;
            string.height = Math.round(_this.game.height / 64 * (1 - n / 10));
            if (isDouble) {
                string.height *= 2;
            }
            string.anchor.y = 0.5;
        }
        return _this;
    }
    return Background;
}(Phaser.Group));
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer(game, bar, index) {
        var _this = _super.call(this, game) || this;
        _this.bar = bar;
        _this.isRendered = false;
        _this.index = index;
        _this.beats = _this.bar.getMusic().getBeats();
        if (Renderer.sineCurveInfo == null) {
            Renderer.loadSineCurveInfo(game);
        }
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
            var w = Configurator.barWidth / this.beats * (strum.getLength() / 12);
            if (strum.isChord()) {
                var btn;
                var cn = this.bar.getMusic().getChordNumber(strum.getChordName());
                btn = new StrumButton(this.game, w - 2, strum.getChordName(), strum.isChordDownStrum(), cn);
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
        this.sineCurves = [];
        this.sineCurveHeight = [];
        for (var sn = 0; sn < this.bar.getStrumCount(); sn++) {
            var strum = this.bar.getStrum(sn);
            var w = Configurator.barWidth / this.beats * (strum.getLength() / 12);
            var name = this.getBestSineCurve(w);
            this.sineCurves[sn] = this.game.add.image(0, 0, "sprites", name, this);
            this.sineCurves[sn].width = w;
            this.sineCurves[sn].height = this.sineCurves[sn].height * Configurator.bounceHeightScale;
            this.sineCurves[sn].anchor.y = 1;
            this.sineCurveHeight[sn] = this.sineCurves[sn].height;
        }
    };
    Renderer.prototype.getSineCurveHeight = function (strumID) {
        return this.sineCurveHeight[strumID];
    };
    Renderer.prototype.moveTo = function (x) {
        if (x > this.game.width || x + Configurator.barWidth < 0) {
            if (this.isRendered) {
                this.deleteRender();
            }
            return;
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
            var x1 = x + strum.getStartTime() / 12 * Configurator.barWidth / this.beats;
            for (var _i = 0, _a = this.buttons[sn]; _i < _a.length; _i++) {
                var bt = _a[_i];
                bt.moveTo(x1);
            }
            this.sineCurves[sn].x = x1;
            this.sineCurves[sn].y = Configurator.yTop;
        }
    };
    Renderer.prototype.deleteRender = function () {
        if (!this.isRendered)
            return;
        this.isRendered = false;
        this.removeChildren();
        this.sineCurves = this.buttons = this.beatLines = null;
        this.sineCurveHeight = this.debugRect = null;
    };
    Renderer.prototype.getBestSineCurve = function (wReq) {
        var bestWidth = 99999;
        var result = "?????";
        for (var names in Renderer.sineCurveInfo) {
            var diff = Math.abs(Renderer.sineCurveInfo[names] - wReq);
            if (diff < bestWidth) {
                bestWidth = diff;
                result = names;
            }
        }
        return result;
    };
    Renderer.loadSineCurveInfo = function (game) {
        Renderer.sineCurveInfo = {};
        var json = game.cache.getJSON("sprites")["frames"];
        for (var spr in json) {
            if (spr.substr(0, 9) == "sinecurve") {
                var frame = json[spr]["frame"];
                var wReq = frame["w"];
                Renderer.sineCurveInfo[spr] = wReq;
            }
        }
    };
    Renderer.DEBUG = false;
    return Renderer;
}(Phaser.Group));
var BaseButton = (function (_super) {
    __extends(BaseButton, _super);
    function BaseButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseButton.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.buttonText = this.button = null;
    };
    BaseButton.prototype.moveTo = function (x) {
        this.button.x = x;
        this.button.y = this.yPos;
        this.button.alpha = 1.0;
        if (x < Configurator.xOrigin) {
            this.button.alpha = Math.max(0.3, 1 - (Configurator.xOrigin - x) / Configurator.barWidth);
        }
        if (x <= Configurator.xOrigin && x + this.button.width >= Configurator.xOrigin) {
            this.button.y += 8;
        }
        if (this.buttonText != null) {
            this.buttonText.x = x + this.button.width / 2;
            this.buttonText.y = this.button.y - this.button.height / 2 + this.buttonText.height * 0.5;
            this.buttonText.alpha = this.button.alpha;
        }
    };
    BaseButton.prototype.label = function (lbl) {
        var size = Configurator.stringGap /
            (Configurator.getStringCount() - 1) * 0.5;
        if (this.button.width * 2 < this.button.height) {
            size = size * 0.7;
        }
        var txt = this.game.add.bitmapText(0, 0, "font", lbl, size, this);
        txt.anchor.x = 0.5;
        txt.anchor.y = 0;
        txt.tint = 0x000000;
        this.buttonText = txt;
    };
    BaseButton.getColour = function (n) {
        return BaseButton.colours[n % BaseButton.colours.length];
    };
    BaseButton.colours = [
        0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF8000, 0xFFFF00, 0xFF00FF,
        0x00FFFF, 0xFF8000, 0x0080FF, 0x008000, 0x808000, 0x008080, 0x8B3413
    ];
    return BaseButton;
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
        _this.label(Configurator.modifier.convert(fretting));
        return _this;
    }
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
    return FingerButton;
}(BaseButton));
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
        _this.yPos = Configurator.yTop + Configurator.stringMargin + Configurator.stringGap / 2;
        name = name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase();
        _this.label(name);
        return _this;
    }
    return StrumButton;
}(BaseButton));
var ButtonMessage;
(function (ButtonMessage) {
    ButtonMessage[ButtonMessage["NormalSpeed"] = 0] = "NormalSpeed";
    ButtonMessage[ButtonMessage["FastSpeed"] = 1] = "FastSpeed";
    ButtonMessage[ButtonMessage["SlowSpeed"] = 2] = "SlowSpeed";
    ButtonMessage[ButtonMessage["Restart"] = 3] = "Restart";
    ButtonMessage[ButtonMessage["RunMusic"] = 4] = "RunMusic";
    ButtonMessage[ButtonMessage["MusicAudible"] = 5] = "MusicAudible";
    ButtonMessage[ButtonMessage["MetronomeAudible"] = 6] = "MetronomeAudible";
})(ButtonMessage || (ButtonMessage = {}));
var PushButton = (function (_super) {
    __extends(PushButton, _super);
    function PushButton(game, image, identifier, listener, size) {
        if (size === void 0) { size = 0; }
        var _this = _super.call(this, game) || this;
        if (size == 0) {
            size = _this.game.width / 12;
        }
        var img = _this.game.add.image(0, 0, "sprites", "roundbutton", _this);
        img.anchor.x = img.anchor.y = 0.5;
        img.width = img.height = size;
        img.inputEnabled = true;
        img.events.onInputDown.add(_this.clickHandler, _this);
        _this.buttonImage = _this.game.add.image(0, 0, "sprites", image, _this);
        _this.buttonImage.anchor.x = _this.buttonImage.anchor.y = 0.5;
        _this.buttonImage.width = _this.buttonImage.height = size * 0.7;
        _this.listener = listener;
        _this.message = identifier;
        return _this;
    }
    PushButton.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.listener = this.buttonImage = null;
    };
    PushButton.prototype.clickHandler = function () {
        this.listener.click(this.message, this);
    };
    return PushButton;
}(Phaser.Group));
var ToggleButton = (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton(game, image, identifier, listener, size) {
        if (size === void 0) { size = 0; }
        var _this = _super.call(this, game, image + "_off", identifier, listener, size) || this;
        _this.baseImage = image;
        _this.isOn = true;
        return _this;
    }
    ToggleButton.prototype.clickHandler = function () {
        _super.prototype.clickHandler.call(this);
        this.isOn = !this.isOn;
        var w = this.buttonImage.width;
        this.buttonImage.loadTexture("sprites", this.baseImage + ((this.isOn) ? "_off" : "_on"));
        this.buttonImage.width = this.buttonImage.height = w;
    };
    ToggleButton.prototype.isButtonOn = function () {
        return this.isOn;
    };
    return ToggleButton;
}(PushButton));
var RenderManager = (function () {
    function RenderManager(game, music) {
        this.music = music;
        this.renderers = [];
        this.lastBar = -1;
        this.lastQuarterBeat = -1;
        for (var n = 0; n < music.getBarCount(); n++) {
            this.renderers[n] = new Renderer(game, music.getBar(n), n);
        }
        this.noteEvent = new Phaser.Signal();
        this.ball = game.add.image(Configurator.xOrigin, Configurator.yTop, "sprites", "sphere_red");
        this.ball.anchor.x = 0.5;
        this.ball.anchor.y = 1.0;
        this.ball.width = this.ball.height = Configurator.barWidth / 12;
    }
    RenderManager.prototype.destroy = function () {
        for (var _i = 0, _a = this.renderers; _i < _a.length; _i++) {
            var renderer = _a[_i];
            renderer.destroy();
        }
        this.ball.destroy();
        this.ball = null;
        this.noteEvent = this.renderers = this.music = null;
    };
    RenderManager.prototype.moveTo = function (bar) {
        var x = Math.round(Configurator.xOrigin - bar * Configurator.barWidth);
        for (var _i = 0, _a = this.renderers; _i < _a.length; _i++) {
            var renderer = _a[_i];
            renderer.moveTo(x);
            x = x + Configurator.barWidth;
        }
        var newBar = Math.floor(bar);
        var newBeat = Math.floor((bar - newBar) * 12 * this.music.getBeats());
        if (newBar != this.lastBar || newBeat != this.lastQuarterBeat) {
            this.lastBar = newBar;
            this.lastQuarterBeat = newBeat;
            if (newBar >= 0 && newBar < this.music.getBarCount()) {
                var rbar = this.music.getBar(newBar);
                for (var strn = 0; strn < rbar.getStrumCount(); strn++) {
                    var strum = rbar.getStrum(strn);
                    if (newBeat == strum.getEndTime()) {
                        this.noteEvent.dispatch(false, strum);
                    }
                    if (newBeat == strum.getStartTime()) {
                        this.noteEvent.dispatch(true, strum);
                    }
                }
            }
        }
        if (newBar < this.music.getBarCount()) {
            var sbar = this.music.getBar(newBar);
            var fracBeat = (bar - newBar) * 12 * this.music.getBeats();
            for (var s = 0; s < sbar.getStrumCount(); s++) {
                var strum = sbar.getStrum(s);
                if (fracBeat >= strum.getStartTime() &&
                    fracBeat < strum.getEndTime()) {
                    var prop = (fracBeat - strum.getStartTime()) / strum.getLength();
                    prop = Math.sin(prop * Math.PI);
                    prop = prop * this.renderers[newBar].getSineCurveHeight(s);
                    this.ball.y = Configurator.yTop - prop;
                }
            }
        }
        else {
            this.ball.y = Configurator.yTop;
        }
    };
    RenderManager.prototype.addStrumEventHandler = function (method, context) {
        this.noteEvent.add(method, context);
    };
    return RenderManager;
}());
var DefaultModifier = (function () {
    function DefaultModifier() {
    }
    DefaultModifier.prototype.convert = function (cOffset) {
        return cOffset.toString();
    };
    DefaultModifier.prototype.isDoubleString = function (str) {
        return false;
    };
    DefaultModifier.convertDiatonic = function (cOffset, noteMap, scalar) {
        var octave = Math.floor(cOffset / 12);
        cOffset = cOffset % 12;
        var note = (octave * scalar + Math.floor(noteMap[cOffset])).toString();
        var frac = noteMap[cOffset] - Math.floor(noteMap[cOffset]);
        frac = Math.round(frac * 10);
        if (frac == 1)
            note = note + "^";
        if (frac == 5)
            note = note + "+";
        return note;
    };
    return DefaultModifier;
}());
var DulcimerModifier = (function (_super) {
    __extends(DulcimerModifier, _super);
    function DulcimerModifier() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DulcimerModifier.prototype.convert = function (cOffset) {
        return DefaultModifier.convertDiatonic(cOffset, DulcimerModifier.octave, 7);
    };
    DulcimerModifier.prototype.isDoubleString = function (str) {
        return (str == 2);
    };
    DulcimerModifier.octave = [
        0, 0.1, 1, 1.1, 2, 3, 3.1, 4, 4.1, 5, 6, 6.5
    ];
    return DulcimerModifier;
}(DefaultModifier));
var MandolinModifier = (function (_super) {
    __extends(MandolinModifier, _super);
    function MandolinModifier() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MandolinModifier.prototype.isDoubleString = function (str) {
        return true;
    };
    return MandolinModifier;
}(DefaultModifier));
var MerlinModifier = (function (_super) {
    __extends(MerlinModifier, _super);
    function MerlinModifier() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MerlinModifier.prototype.convert = function (cOffset) {
        return DefaultModifier.convertDiatonic(cOffset, MerlinModifier.octave, 7);
    };
    MerlinModifier.prototype.isDoubleString = function (str) {
        return (str == 2);
    };
    MerlinModifier.octave = [
        0, 0.1, 1, 1.1, 2, 3, 3.1, 4, 4.1, 5, 5.1, 6
    ];
    return MerlinModifier;
}(DefaultModifier));
var StrumstickModifier = (function (_super) {
    __extends(StrumstickModifier, _super);
    function StrumstickModifier() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StrumstickModifier.prototype.convert = function (cOffset) {
        return DefaultModifier.convertDiatonic(cOffset, StrumstickModifier.octave, 8);
    };
    StrumstickModifier.octave = [
        0, 0.1, 1, 1.1, 2, 3, 3.1, 4, 4.1, 5, 6, 7
    ];
    return StrumstickModifier;
}(DefaultModifier));
var Bar = (function () {
    function Bar(def, music) {
        this.music = music;
        this.strums = [];
        var defs = def.split(";");
        var twbTime = 0;
        for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
            var d = defs_1[_i];
            var s = new Strum(d, this, twbTime);
            twbTime = s.getEndTime();
            this.strums.push(s);
        }
        var remain = music.getBeats() * 12 - twbTime;
        if (remain > 0) {
            var rest = "--------".substring(0, music.getStringCount());
            var time = "00" + remain.toString();
            time = time.substring(time.length - 2);
            var s = new Strum(rest + time, this, twbTime);
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
        this.chordNumbers = {};
        var chordCount = 0;
        for (var _i = 0, _a = this.bar; _i < _a.length; _i++) {
            var bar = _a[_i];
            for (var n = 0; n < bar.getStrumCount(); n++) {
                var strum = bar.getStrum(n);
                if (strum.isChord()) {
                    var name = strum.getChordName().toLowerCase();
                    if (this.chordNumbers[name] == null) {
                        this.chordNumbers[name] = chordCount;
                        chordCount = chordCount + 1;
                    }
                }
            }
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
    Music.prototype.getTuning = function () {
        return this.stringBaseNote;
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
    Music.prototype.getChordNumber = function (name) {
        return this.chordNumbers[name.toLowerCase()];
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
        return (this.startTime % 12) < 6;
    };
    Strum.NOSTRUM = -1;
    return Strum;
}());
var Metronome = (function () {
    function Metronome(game, music) {
        this.tick = game.add.audio("metronome");
        this.lastBar = this.lastBeats = -1;
        this.barCount = music.getBarCount();
        this.beats = music.getBeats();
        this.isOn = true;
    }
    Metronome.prototype.moveTo = function (pos) {
        var bar = Math.floor(pos);
        var beats = Math.floor((pos - bar) * this.beats);
        if (bar != this.lastBar || beats != this.lastBeats) {
            if (bar < this.barCount) {
                this.lastBar = bar;
                this.lastBeats = beats;
                if (this.isOn)
                    this.tick.play();
            }
        }
    };
    return Metronome;
}());
var MusicPlayer = (function () {
    function MusicPlayer(game, channels, tuning) {
        this.game = game;
        this.isOn = true;
        this.sounds = [];
        for (var n = 1; n <= MusicPlayer.noteCount; n++) {
            this.sounds[n] = this.game.add.sound(n.toString());
            this.sounds[n].allowMultiple = true;
        }
        this.baseNoteID = MusicPlayer.toNoteID(MusicPlayer.baseNote);
        this.baseStringID = [];
        for (var n = 0; n < tuning.length; n++) {
            this.baseStringID[n] = MusicPlayer.toNoteID(tuning[n]) -
                this.baseNoteID + 1;
        }
        this.channelSoundID = [];
        for (var n = 0; n < channels; n++) {
            this.channelSoundID[n] = null;
        }
    }
    MusicPlayer.prototype.strum = function (isStart, strum) {
        if (isStart) {
            for (var n = 0; n < strum.getStringCount(); n++) {
                var fret = strum.getStringFret(n);
                if (fret != Strum.NOSTRUM) {
                    this.soundOn(n, fret);
                }
            }
        }
    };
    MusicPlayer.prototype.soundOn = function (channel, fret) {
        this.soundOff(channel);
        var note = this.baseStringID[channel] + fret;
        if (this.isOn)
            this.channelSoundID[channel] = this.sounds[note].play();
    };
    MusicPlayer.prototype.silence = function () {
        for (var n = 0; n < this.channelSoundID.length; n++) {
            this.soundOff(n);
        }
    };
    MusicPlayer.prototype.soundOff = function (channel) {
        if (this.channelSoundID[channel] != null) {
            this.channelSoundID[channel].stop();
            this.channelSoundID[channel] = null;
        }
    };
    MusicPlayer.preload = function (game, noteCount, baseNote) {
        MusicPlayer.noteCount = noteCount;
        MusicPlayer.baseNote = baseNote.toLowerCase();
        for (var n = 1; n <= MusicPlayer.noteCount; n++) {
            var ns = n.toString();
            game.load.audio(ns, ["assets/sounds/" + ns + ".mp3",
                "assets/sounds/" + ns + ".ogg"]);
        }
    };
    MusicPlayer.toNoteID = function (str) {
        var note = (parseInt(str.substr(str.length - 1), 10) - 1) * 12;
        var st = MusicPlayer.noteConvert[str.substr(0, str.length - 1)];
        return note + st;
    };
    MusicPlayer.noteConvert = {
        "c": 0, "c#": 1, "d": 2, "d#": 3, "e": 4, "f": 5, "f#": 6, "g": 7, "g#": 8,
        "a": 9, "a#": 10, "b": 11,
        "db": 1, "eb": 3, "gb": 6, "ab": 8, "bb": 10
    };
    return MusicPlayer;
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
        MusicPlayer.preload(this.game, 48, "C3");
        this.game.load.audio("metronome", ["assets/sounds/metronome.mp3",
            "assets/sounds/metronome.ogg"]);
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
