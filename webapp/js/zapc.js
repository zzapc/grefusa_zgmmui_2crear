/*eslint-disable no-console, no-alert,no-unused-expressions,sap-no-global-define, sap-cross-application-navigation, sap-no-dom-insertion, sap-no-proprietary-browser-api, no-undef, linebreak-style, sap-no-navigator, complexity, max-len, consistent-return, max-statements */
// Versión 20201215
sap.ui.define([], function () {
	"use strict";
	return {

		// Parte personalizable por proyecto
		logActivo: true, // Mostramos el log
		logMostrar: jQuery.sap.log.Level.ERROR, //Nivel de log
		useBatch: false, //Peticiones en batch
		oModel: null,
		oView: null,
		XMLHTTPRequest: true,
		inicializado: false,
		HTTPRequestFixed: true,
		urlMenuBack: null,
		errorMetadata: false,
		Usuario: null,
		horaUltimoLogueo: null,
		ultimoError: null,
	 	vistaTransporte: null,
		vistaGarita: null,
		garita: null,
		peso: 0,
		cambioPeso: false,

		// Fin Parte personalizable por proyecto

		init: function (oBase) {
			if (!this.inicializado) {
				jQuery.sap.log.setLevel(this.logMostrar);
			}

			if (!oBase) {
				sap.m.MessageBox.error("No se ha llamado correctamente a zapc.init");
			}

			oBase.oView = oBase.getView();
			this.oView = oBase.oView;
			oBase.oRouter = oBase.getRouter();
			this.ultimoError = null;

			try {
				oBase.oModel = oBase.oView.getModel();
				if (oBase.oModel !== undefined) {

					if (this.useBatch !== null) {
						oBase.oModel.setUseBatch(this.useBatch);
						oBase.oModel.setSizeLimit(10000);
						//						this.oModel.setDefaultBindingMode("TwoWay");
						//			this.oModel.setSizeLimit(10000);					
					}

					this.oModel = oBase.oModel;

					// Z5TRADE
					if (oBase.KeyCifrada !== undefined) {
						oBase.oModel.mCustomHeaders.keycifrada = oBase.KeyCifrada;
					}

					if (!this.HTTPRequestFixed) {
						this.fixHTTPRequest(oBase.oModel, false);
						this.HTTPRequestFixed = true;
					}
				}
			} catch (err) {
				this.log("Model erróneo", "E");
			}
		},

		log: function (sMsg, sType, oObject) {

			if (!this.logActivo) {
				return;
			}

			var logLevel = "";

			function convertLevel(sType2) {
				if (sType2 === "F") {
					logLevel = jQuery.sap.log.Level.FATAL;
				} //0
				else if (sType2 === "E") {
					logLevel = jQuery.sap.log.Level.ERROR;
				} //1
				else if (sType2 === "W") {
					logLevel = jQuery.sap.log.Level.WARNING;
				} //2
				else if (sType2 === "I") {
					logLevel = jQuery.sap.log.Level.INFO;
				} //3
				else if (sType2 === "D") {
					logLevel = jQuery.sap.log.Level.DEBUG;
				} //4
				else if (sType2 === "T") {
					logLevel = jQuery.sap.log.Level.TRACE;
				} //5
				else if (sType2 === "A") {
					logLevel = jQuery.sap.log.Level.ALL;
				} //6
				return (sType2);
			}

			logLevel = convertLevel(sType);

			if (logLevel > this.logMostrar) {
				return;
			}

			var logLevelActual = jQuery.sap.log.getLevel();
			if (logLevelActual < this.logMostrar) {
				jQuery.sap.log.setLevel((this.logMostrar));
			}

			if (sType === "W") {
				jQuery.sap.log.warning(sMsg);
				if (oObject !== undefined) {
					jQuery.sap.log.warning(oObject);
				}
			} else if (sType === "I") {
				jQuery.sap.log.info(sMsg);
			} else if (sType === "E") {
				jQuery.sap.log.error(sMsg);

			} else if (sType === "D" || sType === undefined) {
				jQuery.sap.log.debug(sMsg);
			}

			if (oObject !== undefined) {
				if (sType === "E") {
					console.log(oObject);
				} else {
					var sObject = JSON.stringify(oObject);
					switch (sType) {
					case "W":
						jQuery.sap.log.warning(sObject);
						break;
					case "I":
						jQuery.sap.log.info(sObject);
						break;
					case "D":
						jQuery.sap.log.debug(sObject);
						break;
					}
				}
			}
		},

		readModel: function (sEntity, mParameters) {
			var oModel = this.oModel;
			var oKey = null;
			var callBackOk = null;
			var callBackError = null;
			var oFilters = [];

			if (mParameters) {
				if (mParameters.oModel !== undefined) {
					oModel = mParameters.oModel;
				}
				oKey = mParameters.oKey;
				oFilters = mParameters.oFilters;
				callBackOk = mParameters.callBackOk;
				callBackError = mParameters.callBackError;
			}

			if (!oModel) {
				sap.m.MessageBox.error("Modelo no inicializado leyendo " + sEntity);
				if (callBackError !== undefined && callBackError !== null) {
					callBackError("Modelo no inicializado");
				}
				return;
			}

			var Entity = sEntity;
			if (Entity.substring(0, 1) !== "/") {
				Entity = "/" + Entity;
			}
			if (oKey) {
				var Key = oKey.replace(/\s/g, "");
				if (Key.includes("(")) {
					Entity = Entity + Key;
				} else {
					Entity = Entity + "('" + Key + "')";
				}
			}

			var that = this;
			try {
				oModel.read(Entity, {
					success: function (oData, oResponse) {
						that.log("Recuperamos " + Entity, "D", oData);
						that.oDataM = oData;

						if (callBackOk !== undefined && callBackOk !== null) {
							callBackOk(oData, oResponse);
						}
					},
					error: function (oError) {
						that.log("Error accediendo a" + Entity, "E", oError);
						if (callBackError !== undefined && callBackError !== null) {
							callBackError(oError);
						}
					},
					filters: oFilters
				});
			} catch (ex) {
				that.log("Excepción accediendo a" + Entity, "E", ex);
			}

			return that.oDataM;
		},

		readModelPath: function (oModel, sPath, oKey, oFilters) {
			var oModelLocal = new sap.ui.model.odata.v2.ODataModel(oModel.sServiceUrl, {
				useBatch: false,
				defaultBindingMode: "OneWay"
			});
			var that = this;

			var Entity = sPath;
			if (Entity.substring(0, 1) !== "/") {
				Entity = "/" + Entity;
			}
			if (oKey) {
				var Key = oKey.replace(/\s/g, "");
				Entity = Entity + "('" + Key + "')";
			}

			that.oDataM = null;
			try {
				oModelLocal.read(Entity, {
					filters: oFilters,
					success: function (oData, oResponse) {
						that.log("Recuperamos " + sPath, "D", oData);
						that.oDataM = oData;
					},
					error: function (oError) {
						that.log("Error accediendo a" + sPath, "E", oError);
					}
				});
			} catch (ex) {
				that.log("Excepción accediendo a" + sPath, "E", ex);
			}

			return that.oDataM;

		},

		getDatosTablaPath: function (oTabla, sCampo, iCol) {

			//store all the context/contextPath of the table in an array
			var aContexts = oTabla.getItems().map(function (oItem) {
				var array = [];
				array.path = oItem.getBindingContext().getPath(); // binding path
				array.valor = oItem.getAggregation("cells")[iCol].getProperty("value");
				return [array];
			});

			this.log("DatosLeidosTablaPath", "D", aContexts);

			return aContexts;
		},

		updateModelTabla: function (oTabla, sCampo, iCol) {
			var oModel = oTabla.getModel();

			oModel.setUseBatch(true); //if this is not already done			

			var aContexts = this.getDatosTablaPath(oTabla, sCampo, iCol);

			//iterate over the context array and change values in the model
			aContexts.forEach(function (array) {
				oModel.setProperty(array.path + "/" + sCampo, array.valor);
			});

			//submit all the changes to the backend.
			oModel.submitChanges();
		},

		getDatosTabla: function (oTabla, sCampo, iCol) {
			//store all the context/contextPath of the table in an array
			var array = [];
			oTabla.getItems().map(function (oItem) {
				var datos = oItem.getBindingContext().getProperty();
				var valor = oItem.getAggregation("cells")[iCol].getProperty("value");
				datos[sCampo] = valor;
				array.push(datos);
			});

			this.log("DatosLeidosTabla", "I", array);
			return array;
		},

		getSession: function (sTipo) {
			jQuery.sap.require("jquery.sap.storage");
			if (sTipo === "" || sTipo === undefined || sTipo === "session") {
				var oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			} else if (sTipo === "local") {
				oLocal = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			}
			return oLocal;
		},

		setDatosSesion: function (clave, oData, sTipo) {
			var oLocal = this.getSession(sTipo);
			if (oLocal.isSupported()) { //comprobamos si lo soporta el navegador
				oLocal.put(clave, oData);
			}
		},

		getDatosSesion: function (clave, sTipo) {
			var oLocal = this.getSession(sTipo);

			if (oLocal.isSupported()) { //comprobamos si lo soporta el navegador
				return oLocal.get(clave);
			} else {
				return undefined;
			}
		},

		deleteDatosSesion: function (clave, sTipo) {
			var oLocal = this.getSession(sTipo);

			if (oLocal.isSupported()) { //comprobamos si lo soporta el navegador
				oLocal.remove(clave);
			}
		},

		sleep: function (milliseconds) {
			var start = new Date().getTime();
			for (var i = 0; i < 1e7; i++) {
				if ((new Date().getTime() - start) > milliseconds) {
					break;
				}
			}
		},

		fixHTTPRequest: function (oModel, getTocken) {
			var that = this;

			if (oModel === undefined) {
				that.log("Error setHeaders: Model undefined", "E");
			}
			try {

				if (getTocken) {
					oModel.refreshSecurityToken();
					var oHeaders = oModel.oHeaders;
					var token = oHeaders["x-csrf-token"];
					if (token === undefined) {
						that.log("Token UNDEFINED", "W");
					} else {
						oModel.mCustomHeaders["x-csrf-token"] = token;
						that.log("Se devuelve tocken:", "I");
					}
					return (token);
				}

				try {
					oModel.mCustomHeaders["X-REQUESTED-WITH"] = "XMLHTTPRequest";
				} catch (err3) {
					//
				}
			} catch (err) {
				that.log("Error setHeaders", "E", err);
			}
			return null;
		},

		callFunction: function (sCallFunction, mParameters) {
			var oModelp = this.oModel;
			var oParametros = "";
			var callBackOk = null;
			var callBackError = null;
			var soloLog = false;

			if (mParameters) {
				if (mParameters.oModel !== undefined) {
					oModelp = mParameters.oModel;
				}
				oParametros = mParameters.oParametros;
				callBackOk = mParameters.callBackOk;
				callBackError = mParameters.callBackError;
				soloLog = mParameters.soloLog;
			}

			if (oModelp === undefined) {
				this.log("Error en CallFunction:" + sCallFunction + " Model undefined", "E");
			}

			var that = this;
			//Como hemos fijado el usuario en SICF tenemos que fijar esto, sino da error si no venimos de página de login
			if (this.XMLHTTPRequest) {
				this.fixHTTPRequest(oModelp);
			}

			if (this.oView !== undefined && this.oView !== null) {
				this.oView.setBusy(true);
			}

			var oRespuesta = {
				datos: null,
				oResponse: null,
				Message: "",
				Type: "",
				oError: null,
				Error: false
			};

			try {
				oModelp.callFunction("/" + sCallFunction, {
					method: "GET",
					urlParameters: oParametros,
					success: function (oData, oResponse) {
						oRespuesta.datos = oData;
						oRespuesta.oResponse = oResponse;

						if (that.oView !== undefined && that.oView !== null) {
							that.oView.setBusy(false);
						}

						that.log("oRespuesta" + sCallFunction, "D", oRespuesta);

						if (callBackOk === undefined || callBackOk === null) {
							if (oRespuesta.datos.setDatos !== undefined) {
								that.oRespuestaPopupError(oRespuesta.datos.setDatos, soloLog);
							} else {
								that.oRespuestaPopupError(oRespuesta, soloLog);
							}

							that.log("No ha definido CallBack para CallFunction:" + sCallFunction, "W");
						} else {
							callBackOk(oRespuesta);
						}
						return oRespuesta;

					},
					error: function (error) {
						if (that.oView !== undefined && that.oView !== null) {
							that.oView.setBusy(false);
						}

						try {
							oRespuesta.oError = error;
							oRespuesta.Type = "E";
							oRespuesta.Message = "Se ha producido un error: " + error.message;
							if (error.responseText !== undefined) {
								oRespuesta.Message = oRespuesta.Message + "-" + error.responseText;
							}
							oRespuesta.Error = true;
							that.log("CallFunction Error " + sCallFunction, "E", oRespuesta);

							if (callBackError === undefined || callBackError === null) {
								that.oRespuestaPopupError(oRespuesta);
							} else {
								callBackError(oRespuesta);
							}
						} catch (err) {
							callBackError(oRespuesta);
						}
						return oRespuesta;

					},
					async: false
				});
			} catch (error) {
				if (that.oView !== undefined && that.oView !== null) {
					that.oView.setBusy(false);
				}

				try {
					oRespuesta.oError = error;
					oRespuesta.Type = "E";
					oRespuesta.Message = "Se ha producido un error: " + error.message;
					if (error.responseText !== undefined) {
						oRespuesta.Message = oRespuesta.Message + "-" + error.responseText;
					}
					oRespuesta.Error = true;
					that.log("CallFunction Excepcion " + sCallFunction, "E", oRespuesta);

					if (callBackError) {
						callBackError(oRespuesta);
					}
				} catch (err) {
					if (callBackError) {
						callBackError(oRespuesta);
					} else {
						that.log("CallFunction error " + sCallFunction, "E", err);
					}
				}
				return oRespuesta;
			}

			return null;

		},

		funcionSetDatos: function (sAccion, mParameters) {
			var oModel = this.oModel;
			var sDatos = "";
			var sClave = "";
			var sOtros = "";
			var callBackOk = null;
			var callBackError = null;
			var soloLog = false;

			if (this.oView !== undefined && this.oView !== null) {
				this.oView.setBusy(true);
			}

			if (mParameters) {
				if (mParameters.oModel !== undefined) {
					oModel = mParameters.oModel;
				}
				sDatos = mParameters.sDatos;
				sClave = mParameters.sClave;
				sOtros = mParameters.sOtros;
				callBackOk = mParameters.callBackOk;
				callBackError = mParameters.callBackError;
				soloLog = mParameters.soloLog;
			}

			// JSON.parse(JSON.stringify(items)),
			var lClave = "";
			if (sClave !== "" && sClave !== undefined) {
				lClave = sClave;
			} else {
				this.log("funcionSetDatos:No ha informado clave", "W");
			}

			var lDatos = "";
			if (sDatos !== "" && sDatos !== undefined) {
				lDatos = sDatos;
			} else {
				this.log("funcionSetDatos:No ha informado datos", "W");
			}

			var lOtros = "";
			if (sOtros !== "" && sOtros !== undefined) {
				lOtros = sOtros;
			} else {
				this.log("funcionSetDatos:No ha informado otros", "D");
			}

			var oParametros = {
				accion: sAccion,
				clave: lClave,
				datos: lDatos,
				otros: lOtros
			};

			this.log("sAccion " + sAccion + "DATOS:", "D", sDatos);
			if (!sAccion) {
				this.log("funcionSetDatos:No ha informado acción", "E");
			}

			try {
				this.callFunction("setDatos", {
					oModel: oModel,
					oParametros: oParametros,
					callBackOk: callBackOk,
					callBackError: callBackError,
					soloLog: soloLog
				});
			} catch (err) {
				if (this.oView !== undefined && this.oView !== null) {
					this.oView.setBusy(false);
				}

				this.log("funcionSetDatos: Error:", "E", err);
			}

		},

		oRespuestaPopupError: function (oRespuesta, soloLog) {
			var sInfo = "";
			jQuery.sap.require("sap.m.MessageBox");
			try {
				//			if (oRespuesta.oError.responseText !== undefined) {sInfo = oRespuesta.oError.responseText; }
				if (oRespuesta === undefined) {
					if (soloLog) {
						this.log("Se ha producido un error, intentelo de nuevo", "E");
					} else {
						sap.m.MessageBox.error("Se ha producido un error, intentelo de nuevo");
					}
				} else if (oRespuesta.Message === undefined) {
					this.log("No se identifica respuesta", "E", oRespuesta.Message + sInfo);
				} else if (oRespuesta.Type === "E" || oRespuesta.Type === undefined) {
					if (soloLog) {
						this.log(oRespuesta.Message + sInfo, "E");
					} else {
						sap.m.MessageBox.error(oRespuesta.Message + sInfo);
					}
				} else if (oRespuesta.Type === "W") {
					if (soloLog) {
						this.log(oRespuesta.Message + sInfo, "W");
					} else {
						sap.m.MessageBox.warning(oRespuesta.Message + sInfo);
					}
				} else if (oRespuesta.Type === "I") {
					if (soloLog) {
						this.log(oRespuesta.Message + sInfo, "I");
					} else {
						sap.m.MessageBox.information(oRespuesta.Message + sInfo);
					}
				} else if (oRespuesta.Type === "S") {
					if (soloLog) {
						this.log(oRespuesta.Message + sInfo, "S");
					} else {
						sap.m.MessageBox.success(oRespuesta.Message + sInfo);
					}
				} else if (oRespuesta.datos === null) {
					if (soloLog) {
						this.log(oRespuesta.Message + sInfo, "E");
					} else {
						sap.m.MessageBox.error("Se ha producido un error, intentelo de nuevo");
					}
				}
			} catch (err) {
				if (soloLog) {
					this.log("Error!", "E");
				} else {
					sap.m.MessageBox.error("Error!");
				}
			}
		},

		s2ab: function (s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for (var i = 0; i !== s.length; ++i) {
				view[i] = s.charCodeAt(i) & 0xFF;
			}
			return buf;
		},

		descargaBinario: function (Binario, Message, sType, sNombreFichero, sExtension) {

			if (Message !== "") {
				sap.m.MessageBox.error(Message);
				return;
			}
			if (Binario.length === 0) {
				sap.m.MessageBox.error("Fichero vacío");
				return;
			}

			var that = this;
			try {
				var a = window.document.createElement("a");

				var blob = new Blob([this.s2ab(atob(Binario))], {
					type: sType
				});
				a.href = window.URL.createObjectURL(blob);
				a.download = sNombreFichero + "." + sExtension;

				// Append anchor to body.
				document.body.appendChild(a);
				a.click();

				// Remove anchor from body
				document.body.removeChild(a);
			} catch (err) {
				that.log("Error descargando " + sNombreFichero, "E", err);
				if (err.message === undefined) {
					sap.m.MessageBox.error("Error descargando fichero " + sNombreFichero);
				} else {
					sap.m.MessageBox.error("Error descargando fichero " + sNombreFichero + " " + err.message);
				}
				return;
			}
		},

		showServiceError: function (sDetails, oComponent) {

			try {
				if (this._bMessageOpen) {
					return;
				}
				this._bMessageOpen = true;

				var msg = "";
				try {
					var oJSONMessage = JSON.parse(sDetails.responseText);
					msg = oJSONMessage.error.message.value;
					msg = msg.replace(/Resource not found for segment/, "No se han recuperado valores para entidad");
				} catch (oException) {
					if (sDetails.responseText !== undefined) {
						if (sDetails.responseText.includes("</code><message>")) {
							var dat = url.split("</code><message>");
							var dat1 = dat[0].split("</message>");
							msg = dat1[0];
						}
					}
					if (msg === "") {
						if (sDetails.message !== undefined) {
							msg = sDetails.message;
						} else if (sDetails.statusText !== undefined) {
							msg = sDetails.statusText;
						} else if (sDetails.responseText !== undefined) {
							msg = sDetails.responseText;
						} else {
							msg = "";
						}
					}
				}

				try {
					this.errorMetadata = false;
					try {
						if (sDetails.requestUri.includes("$metadata")) {
							this.errorMetadata = true;
						}
					} catch (err) {
						this.log(err);
					}

					if (!navigator.onLine) {
						if (this.errorMetadata) {
							msg = "No hay conexión. No se puede iniciar la aplicación";
						} else {
							msg = "SIN CONEXION " + msg;
						}
					}

					if (!navigator.onLine) {
						if (this.errorMetadata) {
							msg = "No hay conexión. No se puede iniciar la aplicación";
						} else {
							msg = "SIN CONEXION " + msg;
						}
					} else {
						if (this.errorMetadata) {
							if (sDetails.body.includes("Error when opening an RFC connection")) {
								msg = "Error conectando con servidor SAP";
							} else {
								msg = "Error recuperando metadatos";
							}
						}
					}

					if (oComponent !== undefined) {
						try {
							var styleClass = oComponent.getContentDensityClass();
						} catch (err) {
							this.log("Error recuperando estilo", "E");
						}
					}
				} catch (err) {
					this.log("Error intentando recuperar mensaje", "E");
				}

				if (msg === "HTTP request failed") {
					if (sDetails.responseText === "CSRF token validation failed") {
						msg = "Error autentificación CSRF token";
					}
				}
				if (msg !== "") {
					this.ultimoError = msg;
					sap.m.MessageBox.error(
						msg, {
							id: "serviceErrorMessageBox",
							details: sDetails,
							styleClass: styleClass,
							actions: [sap.m.MessageBox.Action.CLOSE],
							onClose: function () {
								this._bMessageOpen = false;
							}.bind(this)
						}
					);
				} else {
					this.ultimoError = msg;
					sap.m.MessageBox.error(
						this._sErrorText, {
							id: "serviceErrorMessageBox",
							details: sDetails,
							styleClass: styleClass,
							actions: [sap.m.MessageBox.Action.CLOSE],
							onClose: function () {
								this._bMessageOpen = false;
							}.bind(this)
						}
					);
				}

				if (this.oView !== undefined && this.oView !== null) {
					this.oView.setBusy(false);
				}

			} catch (err) {
				this._bMessageOpen = false;
				this.log("Error intentando mostrar mensaje de error", "E");
			}
		},

		setFocusOnControl: function (oControl, iWaitMs) {
			var _iWaitMs = iWaitMs ? iWaitMs : 300;
			jQuery.sap.delayedCall(_iWaitMs, this, function () {
				oControl.focus();
			});

		},

		reproduceSonido: function (sonido) {
			var that = this;
			try {
				//ejecutamos un sonido correcto o incorrecto dependiendo de los mensajes que recibamos en el oData
				var audio = new Audio(sonido);
				audio.oncanplaythrough = function () {
					that.log("Reproduciendo sonido " + sonido, "I");
					audio.play();
				};
			} catch (err) {
				that.log("Error reproduciendo sonido", "E");
			}
		},

		buscarArray: function (arr, campoclave, campovalor, valor) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i][campoclave] === valor) {
					return arr[i][campovalor];
				}
			}
		},

		setUrlMenuBack: function (codMenu) {
			try {
				if (!this.urlMenuBack) {
					if (!codMenu) {
						this.urlMenuBack = document.referrer;
					} else if (document.referrer.includes(codMenu)) {
						this.urlMenuBack = document.referrer;
					}

					if (this.urlMenuBack !== null && this.urlMenuBack !== "") {
						this.log("Guardarmos url de referencia", "I");
					} else {
						this.urlMenuBack = "?";
					}
				}
			} catch (err) {
				this.log("Error en setUrlMenuBack", "E", err);
			}
		},

		create: function (entidad, mParameters) {
			var oModelp = this.oModel;
			var Datos = "";
			var callBackOk = null;
			var callBackError = null;
			var soloLog = false;

			if (mParameters) {
				if (mParameters.oModel !== undefined) {
					oModelp = mParameters.oModel;
				}
				Datos = mParameters.Datos;
				callBackOk = mParameters.callBackOk;
				callBackError = mParameters.callBackError;
				soloLog = mParameters.soloLog;
			}

			if (oModelp === undefined) {
				this.log("Error en Create:" + set + " Model undefined", "E");
			}

			var that = this;

			if (this.oView !== undefined && this.oView !== null) {
				this.oView.setBusy(true);
			}

			var oRespuesta = {
				datos: null,
				oResponse: null,
				Message: "",
				Type: "",
				oError: null,
				Error: false
			};

			var oHeaders = {
				"X-Requested-With": "XMLHttpRequest"
			};

			try {
				//create(path,odata,mparameters,context,success,error,urlparameters,headers)
				oModelp.create("/" + entidad,
					Datos, {
						sync: false,
						headers: oHeaders,
						success: function (oData, oResponse) {
							oRespuesta.datos = oData;
							oRespuesta.oResponse = oResponse;

							if (that.oView !== undefined && that.oView !== null) {
								that.oView.setBusy(false);
							}

							that.log("oRespuesta" + entidad, "D", oRespuesta);

							if (callBackOk === undefined || callBackOk === null) {
								if (oRespuesta.datos.setDatos !== undefined) {
									that.oRespuestaPopupError(oRespuesta.datos.setDatos, soloLog);
								} else {
									that.oRespuestaPopupError(oRespuesta, soloLog);
								}

								that.log("No ha definido CallBack para Create:" + entidad, "W");
							} else {
								callBackOk(oRespuesta);
							}
							return oRespuesta;

						},
						error: function (error) {
							if (that.oView !== undefined && that.oView !== null) {
								that.oView.setBusy(false);
							}

							try {
								oRespuesta.oError = error;
								oRespuesta.Type = "E";
								oRespuesta.Message = "Se ha producido un error: " + error.message;
								if (error.responseText !== undefined) {
									oRespuesta.Message = oRespuesta.Message + "-" + error.responseText;
								}
								oRespuesta.Error = true;
								that.log("create Error " + entidad, "E", oRespuesta);

								if (callBackError === undefined || callBackError === null) {
									that.oRespuestaPopupError(oRespuesta);
								} else {
									callBackError(oRespuesta);
								}
							} catch (err) {
								callBackError(oRespuesta);
							}
							return oRespuesta;
						}
					}
				);
			} catch (error) {
				that.log("create Error " + entidad, "E", error);

				if (that.oView !== undefined && that.oView !== null) {
					that.oView.setBusy(false);
				}

				try {
					oRespuesta.oError = error;
					oRespuesta.Type = "E";
					oRespuesta.Message = "Se ha producido un error: " + error.message;
					if (error.responseText !== undefined) {
						oRespuesta.Message = oRespuesta.Message + "-" + error.responseText;
					}
					oRespuesta.Error = true;
					that.log("Create Excepcion " + entidad, "E", oRespuesta);

					if (callBackError !== null) {
						callBackError(oRespuesta);
					}
				} catch (err) {
					if (callBackError !== null) {
						callBackError(oRespuesta);
					} else {
						that.log("Create error " + entidad, "E", err);
					}
				}
				return oRespuesta;
			}

			return null;

		},

		update: function (entidad, mParameters) {
			var oModelp = this.oModel;
			var Datos = "";
			var callBackOk = null;
			var callBackError = null;
			var soloLog = false;

			if (mParameters) {
				if (mParameters.oModel !== undefined) {
					oModelp = mParameters.oModel;
				}
				Datos = mParameters.Datos;
				callBackOk = mParameters.callBackOk;
				callBackError = mParameters.callBackError;
				soloLog = mParameters.soloLog;
			}

			if (oModelp === undefined) {
				this.log("Error en Create:" + set + " Model undefined", "E");
			}

			var that = this;

			if (this.oView !== undefined && this.oView !== null) {
				this.oView.setBusy(true);
			}

			var oRespuesta = {
				datos: null,
				oResponse: null,
				Message: "",
				Type: "",
				oError: null,
				Error: false
			};

			var oHeaders = {
				"X-Requested-With": "XMLHttpRequest"
			};

			try {
				//create(path,odata,mparameters,context,success,error,urlparameters,headers)
				oModelp.update("/" + entidad,
					Datos, {
						sync: false,
						headers: oHeaders,
						success: function (oData, oResponse) {
							oRespuesta.datos = oData;
							oRespuesta.oResponse = oResponse;

							if (that.oView !== undefined && that.oView !== null) {
								that.oView.setBusy(false);
							}

							that.log("oRespuesta" + entidad, "D", oRespuesta);

							if (callBackOk === undefined || callBackOk === null) {
								if (oRespuesta.datos.setDatos !== undefined) {
									that.oRespuestaPopupError(oRespuesta.datos.setDatos, soloLog);
								} else {
									that.oRespuestaPopupError(oRespuesta, soloLog);
								}

								that.log("No ha definido CallBack para Create:" + entidad, "W");
							} else {
								callBackOk(oRespuesta);
							}
							return oRespuesta;

						},
						error: function (error) {
							if (that.oView !== undefined && that.oView !== null) {
								that.oView.setBusy(false);
							}

							try {
								oRespuesta.oError = error;
								oRespuesta.Type = "E";
								oRespuesta.Message = "Se ha producido un error: " + error.message;
								if (error.responseText !== undefined) {
									oRespuesta.Message = oRespuesta.Message + "-" + error.responseText;
								}
								oRespuesta.Error = true;
								that.log("create Error " + entidad, "E", oRespuesta);

								if (callBackError === undefined || callBackError === null) {
									that.oRespuestaPopupError(oRespuesta);
								} else {
									callBackError(oRespuesta);
								}
							} catch (err) {
								callBackError(oRespuesta);
							}
							return oRespuesta;
						}
					}
				);
			} catch (error) {
				that.log("create Error " + entidad, "E", error);

				if (that.oView !== undefined && that.oView !== null) {
					that.oView.setBusy(false);
				}

				try {
					oRespuesta.oError = error;
					oRespuesta.Type = "E";
					oRespuesta.Message = "Se ha producido un error: " + error.message;
					if (error.responseText !== undefined) {
						oRespuesta.Message = oRespuesta.Message + "-" + error.responseText;
					}
					oRespuesta.Error = true;
					that.log("Create Excepcion " + entidad, "E", oRespuesta);

					if (callBackError !== null) {
						callBackError(oRespuesta);
					}
				} catch (err) {
					if (callBackError !== null) {
						callBackError(oRespuesta);
					} else {
						that.log("Create error " + entidad, "E", err);
					}
				}
				return oRespuesta;
			}

			return null;

		}

	};

});