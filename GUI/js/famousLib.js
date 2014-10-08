define(function(require, exports, module) {

    function FamousLib(){
        //FAMO.US SPECIFIC
        this.Engine = require('famous/core/Engine');
        this.Modifier = require('famous/core/Modifier');
        this.Transform = require('famous/core/Transform');
        this.ImageSurface = require('famous/surfaces/ImageSurface');
        this.ContainerSurface = require('famous/surfaces/ContainerSurface');
        this.Surface = require('famous/core/Surface');
        this.StateModifier = require('famous/modifiers/StateModifier');
        this.Transform = require('famous/core/Transform');
        //APP MODULES
        this.Header = require('Header');
        this.Footer = require('Footer');
    }

    FamousLib.prototype.loadGlobalVars = function(){
        this.headerLogo = "./css/headerLogo.svg";
        this.settingsIcon = "./css/settings.png";
        this.trophyIcon = "./css/trophy.png";
        this.shareIcon = "./css/share.png";

        this.winSize = {width: window.innerWidth, height: window.innerHeight};
        this.headerSize = {width: this.winSize.width, height: parseInt(this.winSize.height* 0.107)};
        this.logoSize = {width: undefined, height: parseInt(this.headerSize.height *0.8)};
        this.logoPosition = {x: parseInt( (this.headerSize.width - this.logoSize.width)*0.5 ), y: 0 };
        this.buttonSize = {width: parseInt( this.headerSize.width*0.325) , height: parseInt( this.headerSize.height*0.5)};
        this.buttonFontSize = parseInt(this.buttonSize.height * 0.482);
        if(this.buttonFontSize >22){
           this.buttonFontSize = 22; 
        }
        this.buttonPadding = {top: (this.buttonSize.height - this.buttonFontSize) * 0.45, bottom: (this.buttonSize.height - this.buttonFontSize)*0.45, left: 30, right: 30};
    }

    FamousLib.prototype.loadGlobalModifiers = function(){
        this.centerXModifier = new this.StateModifier({
            align: [0.5, 0.5],
            origin: [0.5, 0.5]
        });
        this.centerYModifier = new this.StateModifier({
            align: [0, 0.5],
            origin: [0, 0.5]
        });
        this.bottomModifier = new this.StateModifier({
            align:[0, 1],
            origin: [0, 1]
        });
    }

    return FamousLib;
});
