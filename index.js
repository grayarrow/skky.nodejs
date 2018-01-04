var skky = require('./skky');

skky.addConstant('ConfigFilename', './config.json');
//skky.addConstant('DEFAULT_', '');

// Command Codes
skky.addConstant('CMDCODE_GeroConfiguration', 1);
skky.addConstant('CMDCODE_GpioSetState', 2);
skky.addConstant('CMDCODE_NodeResponse', 3);
skky.addConstant('CMDCODE_GeroConfigurationRequest', 4);
skky.addConstant('CMDCODE_DataResults', 5);
skky.addConstant('CMDCODE_Refresh', 6);
skky.addConstant('CMDCODE_GeroRefresh', 7);
skky.addConstant('CMDCODE_GpioRefresh', 8);
skky.addConstant('CMDCODE_GeroGetState', 9);
skky.addConstant('CMDCODE_GpioGetState', 10);
skky.addConstant('CMDCODE_GetState', 11);
skky.addConstant('CMDCODE_ChartRequest', 12);
skky.addConstant('CMDCODE_ApplicationRun', 13);
skky.addConstant('CMDCODE_SaveApplication', 14);
skky.addConstant('CMDCODE_ApplicationRefresh', 15);
skky.addConstant('CMDCODE_GetOsInfo', 16);
skky.addConstant('CMDCODE_KeepAlive', 19);
skky.addConstant('CMDCODE_BluetoothInit', 22);
skky.addConstant('CMDCODE_BluetoothInitGero', 23);
skky.addConstant('CMDCODE_BluetoothInitGpio', 24);
skky.addConstant('CMDCODE_GeneralMessage', 25);
skky.addConstant('CMDCODE_ApplicationState', 26);
skky.addConstant('CMDCODE_FileSystem', 27);

// Application Ids
skky.addConstant('APPID_Shift8_595', 1);
skky.addConstant('APPID_VolumeControl', 2);
skky.addConstant('APPID_LightMeter', 3);
skky.addConstant('APPID_Buzzer', 4);
skky.addConstant('APPID_Thermometer', 5);
skky.addConstant('APPID_RaspberryPiCamera', 6);
skky.addConstant('APPID_MoistureSensor', 7);
skky.addConstant('APPID_Chart', 8);
skky.addConstant('APPID_ColorPickerRgb', 9);
skky.addConstant('APPID_SimpleLed', 10);
skky.addConstant('APPID_OnOff', 11);
skky.addConstant('APPID_CoffeeMaker', 12);
skky.addConstant('APPID_PushButton', 13);
skky.addConstant('APPID_EegDetector', 14);
skky.addConstant('APPID_GeneralMessage', 15);
skky.addConstant('APPID_SystemCommand', 16);
skky.addConstant('APPID_Accelerometer', 17);
skky.addConstant('APPID_HallEffectSensor', 18);
skky.addConstant('APPID_Beacon', 19);

skky.constants.getApplicationAsText = function(apptype) {
	switch (skky.nonNull(apptype)) {
		case this.APPID_Shift8_595:
			return 'Shift8_595';
        case this.APPID_VolumeControl:
            return 'VolumeControl';
        case this.APPID_LightMeter:
            return 'LightMeter';
        case this.APPID_Buzzer:
            return 'Buzzer';
        case this.APPID_Thermometer:
            return 'Thermometer';
        case this.APPID_RaspberryPiCamera:
            return 'RaspberryPiCamera';
        case this.APPID_MoistureSensor:
            return 'MoistureSensor';
        case this.APPID_Chart:
            return 'Chart';
        case this.APPID_ColorPickerRgb:
            return 'ColorPickerRgb';
        case this.APPID_SimpleLed:
            return 'SimpleLed';
        case this.APPID_OnOff:
            return 'OnOff';
        case this.APPID_CoffeeMaker:
            return 'CoffeeMaker';
        case this.APPID_PushButton:
            return 'PushButton';
        case this.APPID_EegDetector:
            return 'EegDetector';
        case this.APPID_GeneralMessage:
            return 'GeneralMessage';
        case this.APPID_SystemCommand:
            return 'SystemCommand';
        case this.APPID_Accelerometer:
            return 'Accelerometer';
        case this.APPID_HallEffectSensor:
            return 'HallEffectSensor';
        case this.APPID_Beacon:
            return 'Beacon';
	}
	
	return '';
};

skky.constants.getCommandAsText = function(cmd) {
	switch (skky.nonNull(cmd)) {
		case this.CMDCODE_GeroConfiguration:
			return 'GeroConfiguration';
		case this.CMDCODE_GpioSetState:
			return 'GpioSetState';
		case this.CMDCODE_NodeResponse:
			return 'NodeResponse';
		case this.CMDCODE_GeroConfigurationRequest:
			return 'GeroConfigurationRequest';
		case this.CMDCODE_DataResults:
			return 'DataResults';
		case this.CMDCODE_Refresh:
			return 'Refresh';
		case this.CMDCODE_GeroRefresh:
			return 'GeroRefresh';
		case this.CMDCODE_GpioRefresh:
			return 'GpioRefresh';
		case this.CMDCODE_GeroGetState:
			return 'GeroGetState';
		case this.CMDCODE_GpioGetState:
			return 'GpioGetState';
		case this.CMDCODE_GetState:
			return 'GetState';
		case this.CMDCODE_ChartRequest:
			return 'ChartRequest';
		case this.CMDCODE_ApplicationRun:
			return 'ApplicationRun';
		case this.CMDCODE_ApplicationRefresh:
			return 'ApplicationRefresh';
		case this.CMDCODE_GetOsInfo:
			return 'GetOsInfo';
		case this.CMDCODE_KeepAlive:
			return 'KeepAlive';
		case this.CMDCODE_BluetoothInit:
			return 'BluetoothInit';
		case this.CMDCODE_BluetoothInitGero:
			return 'BluetoothInitGero';
		case this.CMDCODE_BluetoothInitGpio:
			return 'BluetoothInitGpio';
		case this.CMDCODE_GeneralMessage:
			return 'GeneralMessage';
        case this.CMDCODE_ApplicationState:
            return 'ApplicationState';
        case this.CMDCODE_FileSystem:
            return 'FileSystem';
	}
	
	return '';
};

skky.iot = require('./skky-iot');
skky.os = require('./skkyos');
skky.db.Mongo = require('./skky-mongo');

module.exports = skky;
