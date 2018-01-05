const mongo = require('mongodb');
const skky = require('./skky');

function skkyMongo(dburl, dbport, dbname) {
	this.databaseUrl = dburl || 'localhost';
	this.databasePort = dbport || 27017;
	this.databaseName = dbname || '';
	this.collectionName = '';

	this.numItemsAdded = 0;
	this.numItemsUpdated = 0;
	this.numResponsesAdded = 0;
	this.numResponsesExceptions = 0;
	
	this.database = null;
}

skkyMongo.prototype.connectUrl = function(adddb) {
	//var fname = 'connectUrl: ';
	adddb = adddb || false;

	var url = 'mongodb://' + this.databaseUrl;
	if(this.databasePort > 0)
		url += ':' + this.databasePort;

	if(adddb)
		url += '/' + this.databaseName;

	return url;
};

skkyMongo.prototype.createDatabase = function(collectionName) {
	var fname = 'skkyMongo.createDatabase:';
	var self = this;
	var database = null;
	collectionName = skky.nonNull(collectionName, this.collectionName);

	return mongo.MongoClient.connect(this.connectUrl()).then(function(db) {
		console.log(fname, 'Database:', self.databaseName, 'created!');

		database = db;
		//console.log(db);
		return db.db(self.databaseName).collection(collectionName);
	}).then(function(dbcoll) {
		//console.log(dbase.listCollections(collectionName));
		//console.log('dbcoll: ' + util.inspect(dbcoll, {showHidden: false, depth: null}));
		console.log('Collection: ' + collectionName + ' created!');
		return dbcoll.insert({"test":"value " + (new Date())});
	}).then(function(res) {
		console.log('Collection: ' + collectionName + ' added element!');
		console.log(res);
		database.close();
		console.log(self.databaseName + ': database closed!');
	}).catch(function(err) {
		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

skkyMongo.prototype.getCollection = function(collectionName, cbEachItem, findObj) {
	var fname = 'skkyMongo.getCollection:';
	var self = this;
	var database = null;
	collectionName = skky.nonNull(collectionName, this.collectionName);

	console.log(fname, collectionName, findObj);
	return mongo.MongoClient.connect(this.connectUrl()).then(function(db) {
		database = db;

		return db.db(self.databaseName).collection(collectionName).find(findObj).toArray(); //.limit(2).toArray();
	}).then(function(dbarr) {
		console.log(fname, collectionName, 'array:', dbarr);
		var chain = Promise.resolve();
		if(skky.isFunction(cbEachItem)) {
			dbarr.forEach((item, num) => {
				//assert.equal(err, null);
				chain = chain.then(function() {
					console.log(fname, 'num:', num, ', cbEachItem exists:', skky.isFunction(cbEachItem)); //, ', Item:', item);
					if(skky.isFunction(cbEachItem))
						cbEachItem(item, num);
				});
			});
		}

		chain = chain.then(function() {
			database.close();
			console.log(fname, self.databaseName, 'database closed for', collectionName, '.');

			return dbarr;
		});

		return chain;
	}).catch(function(err) {
		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

skkyMongo.prototype.insert = function(collectionName, jobj, doNotAddCreated) {
	var fname = 'skkyMongo.insert:';
	var self = this;
	var database = null;
	collectionName = skky.nonNull(collectionName, this.collectionName);
	
	doNotAddCreated = doNotAddCreated || false;
	jobj = jobj || {};

	if(!doNotAddCreated) {
		if(!skky.hasData(jobj.created))
			jobj.created = new Date();
	}

	console.log(fname, 'Connecting to', this.connectUrl(), this.databaseName, collectionName, jobj);
	return mongo.MongoClient.connect(this.connectUrl()).then(function(db) {
		//console.log(fname, 'Database:', self.databaseName, 'connected!');

		database = db;

		return db.db(self.databaseName).collection(collectionName).insert(jobj);
	}).then(function(res) {
		console.log(fname, 'Collection:', collectionName, ' added element!', res);
		database.close();
		var insertedId = 0;
		if(skky.isObject(res)) {
			if(skky.isObject(res.insertedIds)) {
				insertedId = res.insertedIds['0'];
				++self.numItemsAdded;
			}
			else if(skky.isArray(res.insertedIds, 1)) {
				insertedId = res.insertedIds[0];
				++self.numItemsAdded;
			}
		}
		
		//console.log('insertedIds:', res.insertedIds['0'], insertedId, skky.isObject(insertedId));

		console.log(fname, self.databaseName, ': database closed! Collection:', collectionName, skky.isObject(insertedId) ? 'INSERTed id: ' + insertedId : 'Nothing INSERTed.');

		return skky.isObject(insertedId) ? insertedId : res;
	}).catch(function(err) {
		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

skkyMongo.prototype.update = function(collectionName, idToFind, setobj) {
	var fname = 'skkyMongo.update:';

	var self = this;
	var database = null;
	collectionName = skky.nonNull(collectionName, this.collectionName);

	return mongo.MongoClient.connect(this.connectUrl()).then(function(db) {
		database = db;

		var jfind = {
			_id: idToFind
		};

		return db.db(self.databaseName).collection(collectionName).update(jfind, {
			$set: setobj
		});
	}).then(function(res) {
		//console.log(fname, 'Collection:', collectionName, 'updated element!');//, res);

		if(!skky.isNullOrUndefined(database)) {
			console.log(fname, self.databaseName, collectionName, ': database closed!');
			try {
				database.close();
			}
			catch(err) {
				console.log(fname, 'Error closing', self.databaseName, collectionName, err);
			}
		}
		else {
			console.log(fname, self.databaseName, collectionName, 'Database never opened.');
		}

		return skky.isObject(res) && skky.isObject(res.result) ? res.result : res;
	}).catch(function(err) {
		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

module.exports = skkyMongo;
