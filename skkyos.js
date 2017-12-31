const fs = require('fs');
const os = require('os');
const util = require('util');

const skky = require('./skky');

module.exports = {
	osinfo: null,
	getHostname: function() {
		return this.getOsInfo().osHostname;
	},
	getConfig: function(filename) {
		if(skky.isNullOrUndefined(filename))
			filename = skky.getConstant('ConfigFilename');

		// Configuration file support.
		var configSafe = require(filename);

		return JSON.parse(JSON.stringify(configSafe));
	},
	// These 3 must be declared before verifyConfigSettings();
	fileExistsSync: function(filename, deleteIfExists) {
		try {
			fs.statSync(filename);
			
			if (deleteIfExists)
				fs.unlinkSync(filename);
		}
		catch(err) {
			if(err.code == 'ENOENT') {
				console.log(filename + ' does not exist. Skipping delete.');
				return false;
			}
		}

		return true;
	},

	saveJsonToFileSync: function(jo, filename) {
		var fname = 'saveJsonToFileSync:';
		var backupFilename = filename + '.bak';
		
		try {
			if(this.fileExistsSync(filename))
				fs.writeFileSync(backupFilename, fs.readFileSync(filename));
	
			fs.writeFileSync(filename, JSON.stringify(jo));
			
			var stats = fs.statSync(filename);
			var fileSizeInBytes = stats.size;
	
			console.log(filename + ' is ' + fileSizeInBytes + ' bytes.');
			return fileSizeInBytes;
		}
		catch(e) {
			console.error(fname, e);
		}
		
		return -1;
	},

	readTextFileSync: function(filename, replaceLineEnds) {
		var fname = 'readTextFileSync: ';
		
		var s = '';
		try {
			if (fs.existsSync(filename)) {
				s = fs.readFileSync(filename, 'utf8');
				if(replaceLineEnds)
					s = skky.nonNull(s).replace(/\n$/, '');
			}
			else {
				console.log(fname, filename, ' does not exist.');
			}
		}
		catch(err) {
			console.log(fname, 'Error reading', skky.nonNull(filename), 'file.');
			console.error(fname, err);
		}
		
		return skky.nonNull(s);
	},

	getOsInfo: function() {
		var fname = 'getOsInfo:';

		if(skky.isNullOrUndefined(this.osinfo)) {
			var osinfo = {};

			osinfo.cpuInfo = os.cpus();
			osinfo.osName = os.type();
			osinfo.cpuArchitecture = os.arch();
			osinfo.osNics = os.networkInterfaces();
			osinfo.osTempDir = os.tmpdir();
			osinfo.osTotalMemory = os.totalmem();
			osinfo.osFreeMemory = os.freemem();
			osinfo.osUptime = os.uptime();
			osinfo.osHostname = os.hostname();
			osinfo.osPlatform = os.platform();
			osinfo.osRelease = os.release();
			osinfo.isArduino = false;
			osinfo.isFedora = false;
			osinfo.isLinux = (os.platform() == 'linux');
			osinfo.isMac = (os.platform() == 'darwin');
			osinfo.isRaspberryPi = false;
			osinfo.isWindows = (os.platform() == 'win32');
		
			var distro = this.readTextFileSync('/etc/os-release');
			if (distro.length > 0) {
				osinfo.distro = distro;
				if(distro.toLowerCase().indexOf('raspbian') > -1)
					osinfo.isRaspberryPi = true;
				if(distro.toLowerCase().indexOf('fedora') > -1)
					osinfo.isFedora = true;
			}
			
			distro = this.readTextFileSync('/etc/release');
			if (distro.length > 0 && distro.toLowerCase().indexOf('edison') > -1) {
				osinfo.distro = distro;
				osinfo.isArduino = true;
			}
		
			try {
				//if (!skky.hasData(config.machineId))
					osinfo.machineId = this.readTextFileSync('/etc/machine-id', true);
			}
			catch(err) {
				console.log(fname, 'Error reading /etc/machine-id file on Linux.');
				console.error(fname, err);
			}

			this.osinfo = osinfo;
		}

		return this.osinfo;
	},
	verifyConfigSettings: function() {
		var fname = 'verifyConfigSettings:';
	
		var isok = true;
		var filesize = 0;
		var osinfo = {};

		console.log(fname, config);
	
		config.ipAddress = this.getIpAddressInfo();
		config.lastInitialization = skky.iot.getBase(isok ? 0 : -1);
		
		filesize = this.saveJsonToFileSync(config, skky.constants.ConfigFilenameSafeMode);
		if (filesize > 100)
			isok = true;
	
		osinfo.cpuInfo = os.cpus();
		osinfo.osName = os.type();
		osinfo.cpuArchitecture = os.arch();
		osinfo.osNics = os.networkInterfaces();
		osinfo.osTempDir = os.tmpdir();
		osinfo.osTotalMemory = os.totalmem();
		osinfo.osFreeMemory = os.freemem();
		osinfo.osUptime = os.uptime();
		osinfo.osHostname = os.hostname();
		osinfo.osPlatform = os.platform();
		osinfo.osRelease = os.release();
		osinfo.isArduino = false;
		osinfo.isFedora = false;
		osinfo.isLinux = (os.platform() == 'linux');
		osinfo.isMac = (os.platform() == 'darwin');
		osinfo.isRaspberryPi = false;
		osinfo.isWindows = (os.platform() == 'win32');
	
		var distro = this.readTextFileSync('/etc/os-release');
		if (distro.length > 0) {
			osinfo.distro = distro;
			if(distro.toLowerCase().indexOf('raspbian') > -1)
				osinfo.isRaspberryPi = true;
			if(distro.toLowerCase().indexOf('fedora') > -1)
				osinfo.isFedora = true;
		}
		
		distro = this.readTextFileSync('/etc/release');
		if (distro.length > 0 && distro.toLowerCase().indexOf('edison') > -1) {
			osinfo.distro = distro;
			osinfo.isArduino = true;
		}
	
		try {
			if (!skky.hasData(config.machineId))
				osinfo.machineId = this.readTextFileSync('/etc/machine-id', true);
		}
		catch(err) {
			console.log(fname, 'Error reading /etc/machine-id file on Linux.');
			console.error(fname, err);
		}
		
		config.osInfo = osinfo;
	
		isok = false;
		filesize = this.saveJsonToFileSync(config, skky.constants.ConfigFilename);
		if (filesize > 100)
			isok = true;
		
		return isok;
	},
	
	getIpAddressInfo: function() {
		var fname = 'getIpAddressInfo: ';
	
		var ifaces = os.networkInterfaces();
		var ipAddress = [];
	
		Object.keys(ifaces).forEach(function (ifname) {
			var alias = 0;
			
			ifaces[ifname].forEach(function (iface) {
				if ('IPv4' !== iface.family || iface.internal !== false) {
					// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
					return;
				}
				
				if (alias >= 1) {
					// this single interface has multiple ipv4 addresses
					console.log(fname, ifname + ':', alias, iface.address);
				} else {
					// this interface has only one ipv4 adress
					console.log(fname, ifname, iface.address);
				}
	
				++alias;
				ipAddress.push(iface.address);
			});
		});

		return ipAddress;
	}
};

function updateLocalConfig(jo, configObj, filename, checkGero) {
	const fname = 'updateLocalConfig: ';

	var dirty = false;
	try {
		if (!skky.isNullOrUndefined(jo) && skky.isObject(jo)) {
			dirty |= skky.compareField(jo, configObj, 'mainServerUrl');
			dirty |= skky.compareField(jo, configObj, 'gerokey');
			if (checkGero || 0) {
				dirty |= skky.compareField(jo, configObj, 'gero');
			}

			if (dirty && skky.hasData(jo.mainServerUrl)) {
				var filesize = saveJsonToFileSync(jo, filename);
				console.log(fname + 'Writing ' + filesize + ' bytes to ' + filename + '.');
				if (filesize > 100)
					return true;
			}

			console.log(fname + 'NOT Writing to ' + filename + '. No Changes.');
		}
	}
	catch(e) {
		console.log(fname);
		console.log(fname, e);
	}

	return false;
}

function resetConfiguration(jo) {
	var fname = 'resetConfiguration: ';

	var i = 0;

	try {
		updateLocalConfig(jo, config, skky.constants.ConfigFilename, true);
		updateLocalConfig(jo, configSafe, skky.constants.ConfigFilenameSafeMode, false);
	}
	catch(err) {
		console.log(fname + 'Error setting updated Gero configuration files. ' + err.message);
	}

	try {
		console.log(fname + 'New Gero ' + util.inspect((jo.gero || {})) + '.');
	}
	catch(err) {
		console.log(fname + 'Error resetting Gero before reinitialization. ' + err.message);
	}

	return i;
}
