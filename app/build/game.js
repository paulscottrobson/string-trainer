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
    Configuration.initialise = function () {
    };
    return Configuration;
}());
var MainState = (function (_super) {
    __extends(MainState, _super);
    function MainState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MainState.prototype.init = function () {
        Configuration.initialise();
        var json = this.game.cache.getJSON("music");
        console.log(json);
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
