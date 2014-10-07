define(function(require, exports, module) {

    function Footer(lib, context){
        var self = this;
        self.context = context;
        self.LIB = lib;
    }

    Footer.prototype.init = function(){

        var self = this;
        var LIB = self.LIB;

        self.footerContainer = new LIB.ContainerSurface({
            size: [LIB.headerSize.width, LIB.headerSize.height],
            classes: ['appFooter']
        });
        //ADD NEW GAME BUTTON
        self.newGameButton = new LIB.Surface({
            size: [ 180 , LIB.buttonSize.height],
            content: "New game",
            classes: ['button', 'newGame'],
            properties: {
                fontSize: LIB.buttonFontSize
            }
        });
        self.newGameModifier = new LIB.StateModifier({
            origin: [0, 0.5],
            align: [0.05, 0.5]
        });
        self.footerContainer.add(self.newGameModifier).add(self.newGameButton);

        //BUTTONS SETTUP
        var width = LIB.winSize.width*0.95;
        var iconSize = parseInt(LIB.buttonSize.height);
        var spaceBTWElemnets = 20;
        var offset = 0;
        
        offset = width;
        self.settingsButton = new LIB.ImageSurface({
            size: [iconSize, iconSize],
            content: LIB.settingsIcon,
            classes: ['iconButton']
        });
        self.settingsModifier = new LIB.StateModifier({
            origin: [1, 0.5],
            align: [0, 0.5],
            transform: LIB.Transform.translate(offset, 0, 0)
        });
        self.footerContainer.add(self.settingsModifier).add(self.settingsButton);

        offset -= (iconSize + spaceBTWElemnets);
        self.trophyButton = new LIB.ImageSurface({
            size: [iconSize, iconSize],
            content: LIB.trophyIcon,
            classes: ['iconButton']
        });
        self.trophyModifier = new LIB.StateModifier({
            origin: [1, 0.5],
            align: [0, 0.5],
            transform: LIB.Transform.translate(offset , 0, 0)
        });
        self.footerContainer.add(self.trophyModifier).add(self.trophyButton);

        offset -= (iconSize + spaceBTWElemnets);
        self.shareButton = new LIB.ImageSurface({
            size: [iconSize, iconSize],
            content: LIB.shareIcon,
            classes: ['iconButton']
        });
        self.shareModifier = new LIB.StateModifier({
            origin: [1, 0.5],
            align: [0, 0.5],
            transform: LIB.Transform.translate(offset, 0, 0)
        });
        self.footerContainer.add(self.shareModifier).add(self.shareButton);
        //ADD FOOTER TO CONTEXT
        self.context.add(LIB.bottomModifier).add(self.footerContainer);
    
    }

    return Footer;
});
