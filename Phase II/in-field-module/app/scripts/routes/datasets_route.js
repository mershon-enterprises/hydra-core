InFieldModule.DatasetsRoute = Ember.Route.extend({
  model: function() {
    return this.get('store').find('dataset');
  }
});

