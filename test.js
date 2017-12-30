var skky = require('./'),
    test = require('tap').test;

test("ensure hasData works properly", function(t) {
	var s = 'any data';
	t.ok(skky.hasData(s));
	t.end();
});
