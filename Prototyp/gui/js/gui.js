define(function(require, exports, module) {

    function GUI(lib){

        var self = this;
        self.LIB = lib;
    }

    GUI.prototype.init = function(){

        var self = this;
        //LIB IS THE REFERENCE TO THE famousLib.js file which contains global vars
        var LIB = self.LIB;
        //CREATE MAIN CONTEXT
        self.mainContext = LIB.Engine.createContext();
        //CREATE HEADER
        self.header = new LIB.Header(LIB, self);
        self.header.init();
        //CREATE SHARE CONTENT
        self.shareContent = new LIB.Content(LIB.share, self);
        self.shareContent.init( LIB.Transform.translate(LIB.winSize.width, 0, 0) );
        //CREATE TROPHY CONTENT
        self.trophyContent = new LIB.Content(LIB.trophy, self);
        self.trophyContent.init( LIB.Transform.translate(LIB.winSize.width, 0, 0) );
        //CREATE SETTINGS CONTENT
        self.settingsContent = new LIB.Content(LIB.settings, self);
        self.settingsContent.init( LIB.Transform.translate(LIB.winSize.width, 0, 0) );
        //CREATE FOOTER
        self.footer = new LIB.Footer(LIB, self);
        self.footer.init();
    }

    GUI.prototype.dismissContentViews = function(){
        var self = this;
        var LIB = self.LIB;
        if(self.shareContent.isVisible == true){
            self.shareContent.setTransform( LIB.winSize.width, 0, 0 );
            self.shareContent.isVisible = false;
        }
        if(self.trophyContent.isVisible == true){
            self.trophyContent.setTransform( LIB.winSize.width, 0, 0 );
            self.trophyContent.isVisible = false;
        }
        if(self.settingsContent.isVisible == true){
            self.settingsContent.setTransform( LIB.winSize.width, 0, 0 );
            self.settingsContent.isVisible = false;
        }
    }

    return GUI;
});
