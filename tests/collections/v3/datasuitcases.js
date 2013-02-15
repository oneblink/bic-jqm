define(
    ['backbone', 'models/v3/datasuitcase'],
    function(Backbone, DataSuitcase){
        var DataSuitcaseCollection = Backbone.Collection.extend({

            model: DataSuitcase

        });

        return DataSuitcaseCollection;
    
    });
