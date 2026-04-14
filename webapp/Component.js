sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"es/seidor/grefusa/pedidoscompraGrefusa-captacionpedidos2compra/model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");			
			
			this.getModel("local").loadData("model/local.json", undefined, false);
		},
		getContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (sap.ui.Device.system.phone) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});