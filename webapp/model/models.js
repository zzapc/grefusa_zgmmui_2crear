sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel({
				isTouch : sap.ui.Device.support.touch,
				isNoTouch : !sap.ui.Device.support.touch,
				isPhone : sap.ui.Device.system.phone,
				isNoPhone : !sap.ui.Device.system.phone,
				listMode : sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
				listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"
			});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});