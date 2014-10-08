define(function(require, exports, module) {

    function Footer(lib, context){
        var self = this;
        self.context = context;
        self.LIB = lib;
    }

    Footer.prototype.init = function(){

        var self = this;
        var LIB = self.LIB;

        self.buttonArray = new Array();

        self.footerContainer = new LIB.ContainerSurface({
            size: [LIB.headerSize.width, LIB.headerSize.height],
            classes: ['appFooter']
        });

        //BUTTONS SETTUP
        var width = LIB.winSize.width*0.95;
        var iconSize = parseInt(LIB.buttonSize.height*0.8);
        var spaceBTWElemnets = 20;
        var offset = 0;
        
        self.addButton( 'New game', null, 'newGame', LIB.Transform.translate(offset, 0, 0) );
        offset = width;
        self.addButton( null, LIB.settingsIcon, 'settings', LIB.Transform.translate(offset, 0, 0) );
        offset -= (iconSize + spaceBTWElemnets);
        self.addButton( null, LIB.trophyIcon, 'trophy', LIB.Transform.translate(offset, 0, 0) );
        offset -= (iconSize + spaceBTWElemnets);
        self.addButton( null, LIB.shareIcon, 'share', LIB.Transform.translate(offset, 0, 0) );

        //ADD FOOTER TO CONTEXT
        self.context.add(LIB.bottomModifier).add(self.footerContainer);
    }

    Footer.prototype.addButton = function(text, filename, id, translate){
        var self = this;
        var LIB = self.LIB;
        var button = null;

        if(LIB || self.footerContainer || self.buttonArray == null){
            console.log("Error reference is null in addButton class Footer");
            return;
        }

        if(text != null){
            button = new LIB.Button(LIB, self.footerContainer);
            button.initButtonWithText(text, id, translate);

        }
        else if(filename != null){
            button = new LIB.Button(LIB, self.footerContainer);
            button.initButtonWithIcon(filename, id, translate);
        }

        if(button == null){
            console.log("Button is null in add Button class Footer");
            return;
        }
        self.buttonArray.push(button);
    }

    return Footer;
});
