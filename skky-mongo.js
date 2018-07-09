const mongo = require('mongodb');
const skky = require('./skky');

function CrudCounter() {
	this.CrudCounts = function() {
		this.selected = 0;
		this.selectedError = 0;
		this.selectedException = 0;
		this.added = 0;
		this.addedError = 0;
		this.addedException = 0;
		this.updated = 0;
		this.updatedError = 0;
		this.updatedException = 0;
		this.deleted = 0;
		this.deletedError = 0;
		this.deletedException = 0;
		this.exception = 0;
	};

	this.cruds = {};
	this.find = function(collectionName) {
		if(!skky.hasData(this.cruds[collectionName]))
			this.cruds[collectionName] = new this.CrudCounts();

		return this.cruds[collectionName];
	};
	this.select = function(collectionName, count) {
		this.find(collectionName).selected += (count || 1);
	};
	this.selectError = function(collectionName, count) {
		this.find(collectionName).selectedError += (count || 1);
	};
	this.selectException = function(collectionName, count) {
		this.find(collectionName).selectedException += (count || 1);
	};
	this.add = function(collectionName, count) {
		this.find(collectionName).added += (count || 1);
	};
	this.addError = function(collectionName, count) {
		this.find(collectionName).addedError += (count || 1);
	};
	this.addException = function(collectionName, count) {
		this.find(collectionName).addedException += (count || 1);
	};
	this.del = function(collectionName, count) {
		this.find(collectionName).deleted += (count || 1);
	};
	this.delError = function(collectionName, count) {
		this.find(collectionName).deletedError += (count || 1);
	};
	this.delException = function(collectionName, count) {
		this.find(collectionName).deletedException += (count || 1);
	};
	this.update = function(collectionName, count) {
		this.find(collectionName).updated += (count || 1);
	};
	this.updateError = function(collectionName, count) {
		this.find(collectionName).updatedError += (count || 1);
	};
	this.updateException = function(collectionName, count) {
		this.find(collectionName).updatedException += (count || 1);
	};

	this.exception = function(collectionName, count) {
		this.find(collectionName).exception += (count || 1);
	};
}

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
	this.crudCounter = new CrudCounter();
}

skkyMongo.prototype.close = function() {
	if(null !== this.database)
		this.database.close();
};
skkyMongo.prototype.connect = function(collectionName, findObj) {
	var self = this;
	var ret = null;

	if(null !== this.database) {
		ret = this.database;

		if(skky.hasData(collectionName)) {
			if(skky.isObject(findObj))
				ret = this.database.collection(collectionName).find(findObj);
			else
				ret = this.database.collection(collectionName);
		}

		return Promise.resolve(ret);
	}

	return mongo.MongoClient.connect(this.connectUrl())
		.then(function(db) {
			self.database = db.db(self.databaseName);

			ret = self.database;

			if(skky.hasData(collectionName)) {
				if(skky.isObject(findObj))
					ret = self.database.collection(collectionName).find(findObj);
				else
					ret = self.database.collection(collectionName);
			}

			return ret;
		});
};

skkyMongo.prototype.connectUrl = function() {
	var url = 'mongodb://' + this.databaseUrl;
	if(this.databasePort > 0)
		url += ':' + this.databasePort;

	// As of 3.x, you do not add the database name to the connection string.
	//url += '/' + this.databaseName;

	return url;
};

skkyMongo.prototype.createDatabase = function(collectionName) {
	const fname = 'skkyMongo.createDatabase:';

	var self = this;
	collectionName = skky.nonNull(collectionName, this.collectionName);

	return this.connect(collectionName).then(function(dbcoll) {
		console.log(fname, 'Collection:', collectionName, 'created!');
		return dbcoll.insert({"test":"value " + (new Date())});
	}).then(function(res) {
		console.log(fname, 'Collection:', collectionName, 'added element!', res);
	}).catch(function(err) {
		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

skkyMongo.prototype.getCollection = function(collectionName, cbEachItem, findObj) {
	const fname = 'skkyMongo.getCollection:';

	var self = this;
	collectionName = skky.nonNull(collectionName, this.collectionName);

	console.log(fname, collectionName, findObj);
	return this.connect(collectionName, findObj).then(function(dbfind) {
		if(skky.hasData(findObj))
			return dbfind.toArray(); //.limit(2).toArray();

		return dbfind.find().toArray();
	}).then(function(dbarr) {
		self.crudCounter.select(collectionName);
		//console.log(fname, collectionName, 'array:', dbarr);
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
			return dbarr;
		});

		return chain;
	}).catch(function(err) {
		self.crudCounter.selectException(collectionName);

		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

skkyMongo.prototype.getStats = function() {
	return skky.makeJsonLite(this.crudCounter.cruds);
};

skkyMongo.prototype.insert = function(collectionName, jobj, doNotAddCreated) {
	const fname = 'skkyMongo.insert:';

	var self = this;

	//console.log(fname, 'Connecting to', this.connectUrl(), this.databaseName, collectionName, jobj);
	return this.connect(collectionName).then(function(dbcoll) {
		if(!doNotAddCreated) {
			if(!skky.hasData(jobj.createdBy))
				jobj.createdBy = skky.getUsername();

			if(!skky.hasData(jobj.created))
				jobj.created = new Date();
		}

		return dbcoll.insert(jobj);
	}).then(function(res) {
		console.log(fname, 'Collection:', collectionName, ' added element!', res);

		var insertedId = 0;
		if(skky.isObject(res)) {
			if(skky.isObject(res.insertedIds)) {
				insertedId = res.insertedIds['0'];
				self.crudCounter.add(collectionName);
			}
			else if(skky.isArray(res.insertedIds, 1)) {
				insertedId = res.insertedIds[0];
				self.crudCounter.add(collectionName);
			}
		}

		//console.log('insertedIds:', res.insertedIds['0'], insertedId, skky.isObject(insertedId));

		console.log(fname, self.databaseName, ': Collection:', collectionName, skky.isObject(insertedId) ? 'INSERTed id: ' + insertedId : 'Nothing INSERTed.');

		if(skky.isObject(insertedId))
			return insertedId;

		self.crudCounter.addError(collectionName);
		return res;
	}).catch(function(err) {
		self.crudCounter.addException(collectionName);

		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

skkyMongo.prototype.update = function(collectionName, idToFind, setobj, doNotAddUpdated) {
	const fname = 'skkyMongo.update:';

	var self = this;
	collectionName = skky.nonNull(collectionName, this.collectionName);

	if(!doNotAddUpdated) {
		if(!skky.hasData(setobj.updatedBy))
			setobj.updatedBy = skky.getUsername();

		if(!skky.hasData(setobj.updated))
			setobj.updated = new Date();
	}

	return this.connect(collectionName).then(function(dbcoll) {
		var jfind = {
			_id: idToFind
		};

		return dbcoll.update(jfind, {
			$set: setobj
		});
	}).then(function(res) {
		//console.log(fname, 'Collection:', collectionName, 'updated element!');//, res);

		if(skky.isObject(res) && skky.isObject(res.result)) {
			self.crudCounter.update(collectionName);
			return res.result;
		}

		self.crudCounter.updateError(collectionName);
		return res;
	}).catch(function(err) {
		self.crudCounter.updateException(collectionName);

		console.log(fname, self.databaseName, collectionName, 'exception:', err);
	});
};

module.exports = skkyMongo;
