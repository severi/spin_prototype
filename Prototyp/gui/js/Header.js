define(function(require, exports, module) {

    function Header(lib, app){
        var self = this;
        self.app = app;
        self.context = app.mainContext;
        self.LIB = lib;
    }

    Header.prototype.init = function(){

        var self = this;
        var LIB = self.LIB;
        
        self.headerContainer = new LIB.ContainerSurface({
            size: [LIB.headerSize.width, LIB.headerSize.height],
            classes: ['appHeader']
        });

        //ADD LOGO TO SCREEN
        self.logo = new LIB.ImageSurface({
            size: [LIB.logoSize.width, LIB.logoSize.height],
            content: LIB.headerLogo
        });

        self.headerContainer.add(LIB.centerXModifier).add(self.logo);
        self.context.add(self.headerContainer);
    }

    return Header;
});
