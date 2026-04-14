// Versión 20190726
sap.ui.define([
	"z5garita_new/js/zapc"
], function (zapc) {
	"use strict";

	return {

		zapc: zapc,

		funcionGetDatos: function (oModel, sAccion, sDatos, sClave, sOtros, callBackOk, callBackError) {

			var lClave = "";
			if (sClave !== "" && sClave !== undefined) {
				lClave = sClave;
			} else {
				zapc.log("funcionGetDatos:No ha informado clave", "W");
			}

			var lDatos = "";
			if (sDatos !== "" && sDatos !== undefined) {
				lDatos = sDatos;
			} else {
				zapc.log("funcionGetDatos:No ha informado datos", "W");
			}

			var lOtros = "";
			if (sOtros !== "" && sOtros !== undefined) {
				lOtros = sOtros;
			} else {
				zapc.log("funcionGetDatos:No ha informado otros", "D");
			}

			var oParametros = {
				accion: sAccion,
				clave: lClave,
				datos: lDatos,
				otros: lOtros
			};

			zapc.log("sAccion " + sAccion + "DATOS:", "D", sDatos);
			if (!sAccion) {
				zapc.log("funcionGetDatos:No ha informado acción", "E");
			}

			zapc.callFunction(oModel, "getDatos", oParametros, callBackOk, callBackError);
		},

		/* EJEMPLO USO 
					var that = this;
					this.zapc.init(this);
					this.zapcSrv.funcionGetTabla(this.getView().getModel(), "T001", "BUKRS,BUTXT", "BUKRS LIKE |A!!|",
						function (oRespuesta) //OK
						{
							that.zapcSrv.oRespuestaGetTabla(oRespuesta, that.getView(), "sociedades");
						}
					);
					
									<ComboBox xmlns:sap.ui.core="sap.ui.core" id="ComboTipo2" items="{sociedades>/datos}">
										<core:Item key="{sociedades>bukrs}" text="{sociedades>butxt}"/>
									</ComboBox>			
		*/
		funcionGetTabla: function (oModel, sTabla, sCampos, sWhere, callBackOk, callBackError) {
			this.funcionGetDatos(oModel, "getTabla", sTabla, sCampos, sWhere, callBackOk, callBackError);
		},

		oRespuestaGetTabla: function (oRespuesta, oView, sModelo) {
			jQuery.sap.require("sap.ui.model.json.JSONModel");

			var data = {
				datos: undefined
			};
			data.datos = JSON.parse(oRespuesta.datos.getDatos.Respuesta);
			var oModelLocal = new sap.ui.model.json.JSONModel(data); // Only set data here.

			oView.setModel(oModelLocal, sModelo);
			zapc.log("oRespuestaGetTabla:Modelo:" + sModelo, "I", data);
		}
	};

});