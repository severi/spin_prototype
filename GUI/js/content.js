define(function(require, exports, module) {

    function Content(id, app){
        var self = this;
        self.app = app;
        self.context = app.mainContext;
        self.LIB = app.LIB;
        self.id = id;
        isVisible = false;
    }

    Content.prototype.init = function(translate){

        var self = this;
        var LIB = self.LIB;
        
        if(translate == null){
            console.log("translate is null in init class Content");
            return;
        }

        self.content = new LIB.Surface({
            size:[ LIB.winSize.width , parseInt(LIB.winSize.height - 2*LIB.headerSize.height)-2 ],
            classes: [self.id]
        });
        self.modifier = new LIB.StateModifier({
            origin: [0, 0.5],
            align: [0, 0.5],
            transform: translate
        });
        self.context.add(self.modifier).add(self.content);
    }

    Content.prototype.setTransform = function(x, y, z){
        var self = this;
        var LIB = self.LIB;

        if(self.modifier == null){
            console.log("Modifier is null in translate class content");
            return;
        }
        self.modifier.setTransform(
            LIB.Transform.translate(x, y, z),
            { duration: 1000, curve: LIB.Easing.inOutBack});
    }

    return Content;
});
