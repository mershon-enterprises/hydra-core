InFieldModule.DatasetRoute = Ember.Route.extend({
  model: function(params) {
    return this.get('store').find('dataset', params.dataset_id);
  }
});

