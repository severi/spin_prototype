define(function(require, exports, module) {

    function Footer(lib, app){
        var self = this;
        self.app = app;
        self.context = app.mainContext;
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
        var width = LIB.winSize.width*0.5;
        var iconSize = parseInt(LIB.buttonSize.height*0.8);
        var spaceBTWElemnets = 20;
        var offset = 0;
        
        self.addButton( 'New game', null, LIB.newGame, LIB.Transform.translate(offset, 0, 0) );
        offset = width - width*2*0.1;
        self.addButton( null, LIB.settingsIcon, LIB.settings, LIB.Transform.translate(offset, 0, 0) );
        offset -= (iconSize + spaceBTWElemnets);
        self.addButton( null, LIB.trophyIcon, LIB.trophy, LIB.Transform.translate(offset, 0, 0) );
        offset -= (iconSize + spaceBTWElemnets);
        self.addButton( null, LIB.shareIcon, LIB.share, LIB.Transform.translate(offset, 0, 0) );

        //ADD FOOTER TO CONTEXT
        self.context.add(LIB.bottomModifier).add(self.footerContainer);
    }

    Footer.prototype.addButton = function(text, filename, id, translate){
        var self = this;
        var LIB = self.LIB;
        var button = null;

        if( (LIB || self.footerContainer || self.buttonArray) == null){
            console.log("Error reference is null in addButton class Footer");
            return;
        }

        if(text != null){
            button = new LIB.Button(self.app, self.footerContainer);
            button.initButtonWithText(text, id, translate);

        }
        else if(filename != null){
            button = new LIB.Button(self.app, self.footerContainer);
            button.initButtonWithIcon(filename, id, translate);
        }

        if(button == null){
            console.log("Button is null in add Button class Footer");
            return;
        }
        //SET CONTENT REFERENCE
        if(id == LIB.settings){
            button.setContentRef( self.app.settingsContent );
        } 
        else if(id == LIB.trophy){
             button.setContentRef( self.app.trophyContent );
        } 
        else if(id == LIB.share){
            button.setContentRef( self.app.shareContent );
        }
        
        //ADD EVENTLISTENER
        button.addEventListener();
        self.buttonArray.push(button);
    }

    Footer.prototype.hideButtons = function(exceptId){
        var self = this;
        var LIB = self.LIB;

        if(self.buttonArray == null){
            console.log("buttonArray is null in hideNewGameButton class Footer");
            return;
        }
        //MOVE OTHER BUTTONS TO CENTER
        var i = 1;
        //FADE NEW GAME BUTTON OUT
        self.buttonArray[0].setTransform(-LIB.winSize.width, 0, 0);
        for(i=1; i<self.buttonArray.length; i++){
            var object = self.buttonArray[i];
            object.setTransform( 0, 0, 0);
            if(object.id != exceptId){
                object.modifier.setOpacity(0, {duration: 800});  
            }  
        }
    }

    Footer.prototype.showButtons = function(){
        var self = this;
        var LIB = self.LIB;

        if(self.buttonArray == null){
            console.log("buttonArray is null in showNewGameButton class Footer");
            return;
        }
        self.buttonArray[0].setTransform(0, 0, 0);
    }

    return Footer;
});
