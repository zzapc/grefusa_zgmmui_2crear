/**
* @module es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra
* @name controller/Base
* @author Seidor - MTEN
* @desc Controller for the base Controller on this Controller is defined commons functions
*/

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"es/seidor/grefusa/pedidoscompraGrefusa-captacionpedidos2compra/js/zapc",
], function(Controller, MessageBox, MessageToast, History, zapc) {
	"use strict";

	return Controller.extend("es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.controller.Base", {

		zapc: zapc,
		
		/**
		 * @desc Returns an object with the manifest router,
		 * that is used to navigate for the differents view into the application
		 * @return      the router object defined on the manifest.json
		 * 
		 */
		_getRouter: function() { 
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
        /**
        * @desc Subscription to <tt>RouteMatched</tt> event
              * Makes the <tt>Header</tt> visible or not
              * @param {Object} oEvent - Event info for RouteMatched
              * @public
              */
		_registrarOnRouteMatched: function(){
			var oRouter;
			
			oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.attachRouteMatched(jQuery.proxy(this.onRouteMatched, this));
		},
		/**
		 * @desc Show a MessageBox with the title and description		 
		 * @param {String} sTitle - Title of the MessageBox
		 * @param {String} sMessage - Description of the MessageBox
		 *  
		 */
		_showError: function(sTitle, sMessage){
			MessageBox.show(sMessage, {title: sTitle});
		},
		/**
		 * @desc Show a MessageBox with a description
		 * @param {String} sMessage - Description of the MessageBox
		 * 
		 */
		_showMensaje: function(sMessage){
			MessageBox.show(sMessage);
		},
		
		/**
		 * @desc Show a MessageBox with a description
		 * @param {String} sMessage - Description of the MessageBox
		 * 
		 */
		_showWarning: function(sMessage){
			MessageBox.warning(sMessage);
		},
		/**
		 * @desc Show a MessageToast with a description
		 * @param {String} sMessage - Description of the MessageBox
		 * 
		 */
		_showToast: function(sMessage){
			MessageToast.show(sMessage);
		},
		/**
		 * @desc Return text from resourceBoundle file defined on manifest.json,
		 * this file is defined as the local model <tt>i18n</tt>.
		 * @param {String} sText - Constant defined on the resourdeBoundle File
		 * @param {} aArguments - Arguments for the function of object resourceBundle
		 * @return {String} - Returns a locale-specific string value for the given key sText.
		 * 
		 */
		_getText: function(sText, aArguments){
			var oBundle;
			
			oBundle = this.getView().getModel("i18n").getResourceBundle();
			
			return oBundle.getText(sText, [aArguments]);			
		},
		
		/**
		 * @desc Show a MessageBox when a callback function which is called when the request failed. 
		 * The handler can have the parameter oError which contains additional error information.
		 * @param {Object} oError - Response from gateway when fail method.
		 * 
		 */
		_SAPErrorCreate: function(oError){
			var mError;			
			var mCadena= oError.split("/SAP")[0];
			mError = mCadena.substr(mCadena.lastIndexOf("/")+1);			
			this._showError(this._getText("MensajeError"), mError)
		},
		/**
		 * @desc Show a MessageBox when a callback function which is called when the request failed. 
		 * The handler can have the parameter oError which contains additional error information.
		 * @param {Object} oError - Request from gateway when fail method.
		 * 
		 */
		_SAPError: function(oError){
			try {
			var mError;
			(oError.responseText) ? mError = JSON.parse(oError.responseText): mError = JSON.parse(oError.response.body);
			
			this._showError(mError.error.code, mError.error.message.value);
			} catch(err) {
				this._showError("Error inesperado", oError);
			}
		},
		/**
		 * @desc Show one or more MessageBox when a callback function which is called when the request failed. 
		 * The handler can have the parameter oError which contains additional error information.
		 * @param {Object} aError - Request from gateway when fail method.
		 * 
		 */
		_SAPErrorMulti: function(aErrors){
			var sMensaje, sTitle, mError, i, bOk;
			
			sMensaje = undefined;
			sTitle = undefined;
			bOk = false;
			try{
				for(i = 0; i < aErrors.length; i++){
					mError = JSON.parse(aErrors[i].response.body);
					sMensaje = sMensaje === undefined ? "" : (sMensaje + "/n");
					sTitle = sTitle === undefined ? "" : (sTitle + "/n");
					
					sTitle += mError.error.code;
					sMensaje += mError.error.message.value;
				}
				
				this._showError(sTitle, sMensaje);
			}catch(e){
				bOk = true;
			}
			
			return bOk;
		},
		/**
		 * @desc Navigates to a specific route defining a set of parameters. 
		 * The Parameters will be URI encoded - the characters ; , / ? : @ & = + $ 
		 * are reserved and will not be encoded. If you want to use special characters 
		 * in your oParameters, you have to encode them (encodeURIComponent).
		 * If the given route name can't be found, an error message is logged to the 
		 * console and the hash will be changed to empty string.
		 * @param {string}	sName -	Name of the route.
		 * @param {object}	oParameters - Parameters for the route
		 * @param {boolean}	bReplace - Defines if the hash should be replaced 
		 * (no browser history entry) or set (browser history entry)	
		 */	
				
		navTo: function(sName, oParameters, bReplace) {
			var oRouter = this._getRouter(),
				self = this;
				
			sName = sName || "",
			oParameters = oParameters || {},
			bReplace = bReplace || false;
			
			setTimeout(function(){
				oRouter.navTo(sName, oParameters, bReplace);
			}, "500");
		},
		
		/**
		 * @desc Navigates to a specific route
		 * @param {string}	sName -	Name of the route.
		 *	
		 */	
		_navTo: function(sName){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo(sName);
		},
		/**
		 * @desc Navigates to a specific route or to a previous hash visited.
		 * @param {string}	sName -	Name of the route.
		 *	
		 */	
		_navBack: function(sName){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo(sName);
			}
		},
		
		
		//-----------------------------------
		// 			SESION USUARIO
		//-----------------------------------
		/**
		 * @desc Create a local Session on the navigator.
		 * @param {Object} modLocal - Object with variable's content.
		 * 
		 */
		//funcion para crear sesion de usuario
		_sesionUsuario: function(modLocal) {
			jQuery.sap.require("jquery.sap.storage");
			var oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			if (oLocal.isSupported()) { //comporbamos si lo soporta el navegador
				oLocal.put("sesionGrefusa", modLocal);

			}
		},
		
		/**
		 * @desc Return a local Session on the navigator.
		 * @return {Object} modLocal - Object with variable's content.
		 * 
		 */
		//funcion para mostrar datos sesion de usuario
		_getSesionUsuario: function() {
			jQuery.sap.require("jquery.sap.storage");
			var oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			if (oLocal.isSupported()) { //comporbamos si lo soporta el navegador
				return oLocal.get("sesionGrefusa");

			} else {
				return "";
			}

		},
		/**
		 * @desc Delete a local Session on the navigator.
		 *  
		 */	
		
		//funcion para borrar sesion de usuario
		_borrarSesionUsuario: function() {
			
			//borramos los datos de la sesion
			var oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			if (oLocal.isSupported()) {
				oLocal.removeAll();
				
			}	
		},
			
		//--------------------------------------
		//-------------------------------------
		//				FORMATTERS
		//-------------------------------------
		//--------------------------------------
		
		fechaPosicionFormato:function(sFecha){
			
			var fecha = new Date(sFecha);
			var dia = (fecha.getDate()<10) ? "0"+fecha.getDate(): fecha.getDate();
			var mes = ((fecha.getMonth() + 1)<10) ? "0"+(fecha.getMonth() + 1) : fecha.getMonth() + 1;
			var cadena = dia+"/"+mes+"/"+fecha.getFullYear();
			return cadena;
		},
		
		
	});

});