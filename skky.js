const rp = require('request-promise');

module.exports = {
	app: {},
	config: {},
	os: {},
	db: {},

	allGood: function(iot, hasObject) {
		if (this.isNullOrUndefined(iot))
			return false;

		var good = (this.isNullOrUndefined(iot.code) || (iot.code >= 0));
		if (good && (iot.err || []).length > 0)
			good = false;
		if(good && (hasObject || false))
			good = this.isObject(iot.o) || this.isArray(iot.o);

		return good;
	},
	addObjectToList: function(objarr, obj) {
		if (this.isNullOrUndefined(obj))
			return;

		objarr = (objarr || []);

		var i = 0;
		while(true) {
			var geto = this.getObject(obj, i);
			if (this.isNullOrUndefined(geto))
				break;

			objarr.push(geto);
			++i;
		}

		return objarr;
	},
	getObject: function(o, nameOrNumber) {
		if (!this.isNullOrUndefined(o)) {
			if(this.isArray(o)) {
				nameOrNumber = this.nonNull(nameOrNumber || 0);

				if (!isNumber(nameOrNumber) || o.length > nameOrNumber)
					return o[nameOrNumber];
			}
			else if(this.isObject(o) && this.isString(nameOrNumber)) {

				return o[nameOrNumber];
			}
			else if(this.nonNull(nameOrNumber, 0) === 0) {
				return o;
			}
		}

		return null;
	},

	hasData: function(o, minlength) {
		//console.log('minlength: ' + minlength + ', o: ' + o);
		if (this.isNullOrUndefined(o))
			return false;

		if(this.isNullOrUndefined(minlength))
			minlength = 1;

		if (this.isString(o))
			return (o.length >= minlength);

		if (this.isArray(o))
			return this.isArray(o, minlength);

		// Objects and primitives will not have any length.
		if (!this.isObject(o))
			return minlength <= 1;

		if (this.isObject(o)) {
			for (var prop in o) {
				if (o.hasOwnProperty(prop))
					return true;
			}

			return !(true && JSON.stringify(o) === JSON.stringify({}));
		}

		return true;	// Must be a number or boolean or something.
	},

	isArray: function(o, minLength) {
		var isok = (this.isObject(o) && (Object.prototype.toString.call(o) == '[object Array]'));
		//('number' === typeof (o.length)) && (o.propertyIsEnumerable && !o.propertyIsEnumerable('length')));
		if (isok)
			isok = (o.length >= (minLength || 0));

		return isok;
	},
	isBoolean: function(b) {
		return 'boolean' === typeof b;
	},
	isEmptyObject: function(o) {
		// typeof null === 'object'; JS standard.
		return (('undefined' === typeof (o)) || (null === o));
	},
	isEmptyString: function(s) {
		return !this.hasData(s);
	},	
	isFunction: function(o) {
		return ('function' === typeof o);
	},
	isNullOrUndefined: function(o) {
		// typeof null returns 'object'
		return (('undefined' === typeof (o)) || (null === o));
	},
	isNumber: function(n) {
		return 'number' === typeof n;
	},
	isObject: function(obj) {
		return null !== obj && 'object' === typeof (obj);
	},
	isString: function(o) {
		return (('string' === typeof o) || (o instanceof String));
	},
	
	nonNull: function(s, obj) {
		if(this.hasData(s))
			return s;

		if(this.isNullOrUndefined(s) && !this.isNullOrUndefined(obj))
			return obj;

		return '';
	},

	// Trim methods	
	ltrim: function(str) {
		return this.nonNull(str).replace(/^\s+/, '');
	},
	rtrim: function(str) {
		return this.nonNull(str).replace(/\s+$/, '');
	},
	trim: function(str) {
		return this.nonNull(str).replace(/^\s+|\s+$/g, '');
	},

	postForm: function(url, formData, returnsHtml) {
		var options = {
			method: 'POST',
			uri: url,
			form: formData
		};

		if(!returnsHtml)
			options.json = true;

		return rp(options);
	},
	getJson: function(url, jSendData) {
		var options = {
			method: 'GET',
			uri: url,
			body: jSendData,
			json: true
		};

		return rp(options);
	},
	postJson: function(url, jPostData) {
		var options = {
			method: 'POST',
			uri: url,
			body: jPostData,
			json: true
		};

		return rp(options);
	},

	// Constant definition helper.
	addConstantToObject: function(toObject, name, value, isEnumerable) {
		if(this.isNullOrUndefined(isEnumerable))
			isEnumerable = true;

		Object.defineProperty(toObject, name, {
			value:      value,
			enumerable: isEnumerable
		});

		return toObject;
	},
	addConstant: function(name, value, isEnumerable) {
		return this.addConstantToObject(this.getConstants(), name, value, isEnumerable);
	},
	addAppConstant: function(name, value, isEnumerable) {
		return this.addConstantToObject(this.getAppConstants(), name, value, isEnumerable);
	},
	getApp: function(name) {
		if(this.isNullOrUndefined(this.app))
			this.app = {};

		return this.getObject(this.app, name);
	},
	getAppConfig: function(name) {
		var app = this.getApp();
		if(this.isNullOrUndefined(app.config))
			app.config = {};

		return this.getObject(app.config, name);
	},
	getAppConstants: function(name) {
		var app = this.getApp();
		if(this.isNullOrUndefined(app.constants))
			app.constants = {};

		return this.getObject(app.constants, name);
	},
	getConstant: function(name) {
		return this.getObject(this.getConstants(), name);
	},
	getConstants: function() {
		if(this.isNullOrUndefined(this.constants))
			this.constants = {};

		return this.constants;
	},
	
	// Compare fields from src to dest object.
	compareField: function(srcObj, destObj, fieldName) {
		try {
			if (skky.isNullOrUndefined(srcObj[fieldName]))
				return false;
			
			if (destObj[fieldName] !== srcObj[fieldName]) {
				destObj[fieldName] = srcObj[fieldName];
				return true;
			}
		}
		catch(err) { }
		
		return false;
	}
};
