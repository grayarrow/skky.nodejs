const fs = require('fs');
const os = require('os');

const skky = require('./skky');

module.exports = {
	osinfo: null,

	getHostname: function() {
		return this.getOsInfo().osHostname;
	},
	getHostnameClean: function() {
		return skky.nonNull(this.getHostname().replace(/[^\x20-\x7E]+/g, ''));
	},
	getUsername: function() {
		return this.getOsInfo().userinfo.username;
	},
	getConfig: function(filename) {
		if(skky.isNullOrUndefined(filename))
			filename = skky.getConstant('ConfigFilename');

		return JSON.parse(this.readTextFileSync(filename));
	},

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
		const fname = 'saveJsonToFileSync:';
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
		const fname = 'readTextFileSync: ';

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
		if(skky.isNullOrUndefined(this.osinfo))
			this.osinfo = this.getOsInfoRaw();

		return this.osinfo;
	},
	getOsInfoRaw: function() {
		const fname = 'getOsInfoRaw:';

		var osinfo = {};

		osinfo.cpus = os.cpus();
		osinfo.type = os.type();
		osinfo.architecture = os.arch();
		osinfo.nics = os.networkInterfaces();
		osinfo.tempDir = os.tmpdir();
		osinfo.totalMemory = os.totalmem();
		osinfo.freeMemory = os.freemem();
		osinfo.uptime = os.uptime();
		osinfo.hostname = os.hostname();
		osinfo.platform = os.platform();
		osinfo.release = os.release();
		osinfo.isArduino = false;
		osinfo.isFedora = false;
		osinfo.isLinux = (os.platform() == 'linux');
		osinfo.isMac = (os.platform() == 'darwin');
		osinfo.isRaspberryPi = false;
		osinfo.isWindows = (os.platform() == 'win32');

		osinfo.userinfo = os.userInfo();
		osinfo.ips = this.getIpAddressInfo();

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
			osinfo.machineId = this.readTextFileSync('/etc/machine-id', true);
		}
		catch(err) {
			console.log(fname, 'Error reading /etc/machine-id file on Linux.');
			console.error(fname, err);
		}

		return osinfo;
	},

	updateConfigSettings: function() {
		var isok = true;
		var filesize = 0;

		config.lastInitialization = skky.iot.getBase(isok ? 0 : -1);

		filesize = this.saveJsonToFileSync(config, skky.constants.ConfigFilenameSafeMode);
		if (filesize > 100)
			isok = true;

		config.osInfo = this.getOsInfo();

		isok = false;
		filesize = this.saveJsonToFileSync(config, skky.constants.ConfigFilename);
		if (filesize > 100)
			isok = true;

		return isok;
	},

	getIpAddressInfo: function() {
		const fname = 'getIpAddressInfo: ';

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

