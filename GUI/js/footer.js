define(function(require, exports, module) {

    function Footer(lib, context){
        var self = this;
        self.context = context;
        self.LIB = lib;
    }

    Footer.prototype.init = function(){

        var self = this;
        var LIB = self.LIB;

        var footerContainer = new LIB.ContainerSurface({
            size: [LIB.headerSize.width, LIB.headerSize.height],
            classes: ['appFooter']
        });
 
        self.context.add(LIB.bottomModifier).add(footerContainer);

    }

    return Footer;
});
