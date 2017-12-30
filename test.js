var skky = require('./'),
    test = require('tap').test;

test("ensure hasData works properly", function(t) {
	var s = 'any data';
	t.ok(skky.hasData(s));
	t.end();
});

test("ensure iot object can be newed", function(t) {
	var s = new skky.iot();
	t.ok(skky.isObject(s));
	t.end();
});

test("Config filename", function(t) {
	var s = skky.constants.ConfigFilename;
	t.ok(skky.hasData(s));
	console.log('Config filename:', s);
	t.end();
});