// for more details see: http://emberjs.com/guides/application/
// production values
//DataGatherer = Ember.Application.create();
// development values
DataGatherer = Ember.Application.create({
	LOG_TRANSITIONS: true,
    LOG_ACTIVE_GENERATION: true
});
Ember.RSVP.configure('onerror', function(e) {
    console.log(e.message);
    console.log(e.stack);
});
{{ Ember.typeOf(this) }}
Ember.ENV.RAISE_ON_DEPRECATION = true
Ember.LOG_STACKTRACE_ON_DEPRECATION = true

