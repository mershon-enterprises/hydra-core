InFieldModule.DatasetEditController = Ember.ObjectController.extend({
  needs: 'dataset',
  actions: {
    save: function(){
      self = this
      this.get('buffer').forEach(function(attr){
        self.get('controllers.dataset.model').set(attr.key, attr.value);
      });
      this.transitionToRoute('dataset',this.get('model'));
    }
  }
});

