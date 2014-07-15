InFieldModule.Router.map(function () {
  
  this.resource('datasets', function(){
    this.resource('dataset', { path: '/:dataset_id' }, function(){
      this.route('edit');
    });
    this.route('create');
  });
  
});
