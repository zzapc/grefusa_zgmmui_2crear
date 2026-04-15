/**
* @module es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra
* @name controller/Main
* @author Seidor - MTEN/JJM
* @desc Controller that includes the set of functions for the order picking service.
*/

sap.ui.define([
	"es/seidor/grefusa/pedidoscompraGrefusa-captacionpedidos2compra/controller/Base.controller",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"

], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.controller.Main", {

		/**
		 * @desc Initializes some variables that will contain the corresponding dialogs.
		 * 
		 */


		onInit: function () {
			this._oDialogPerfil = undefined;
			this._oDialogPosicion = undefined;
			this._oDialogPosicionAdd = undefined;
			this._oDialogMultiple = undefined;
			this._oDialogMaterial = undefined;
			this._oDialogCeCo = undefined;
			this._oVHProveedor = undefined;
			this._oVHCampanya = undefined;
			this._oDialogTipoImputacion = undefined;
			this._oDialogTextoAmpliado = undefined;
			this._PerfilActivo = undefined;
			this._PedidoVentas = false;

		},

		/**
		 * @desc Sets the default currency in the local model.
		 * 
		 */

		onAfterRendering: function () {
			this._currency = this.getView().byId("monedaSelect");
			this.getView().getModel("local").setProperty("/sMoneda", this._currency.getSelectedKey());
		},
		/**
		 * @desc If a session exists, loads the data in the local model from it. Otherwise initialize the session. After that, it calls <b> obtenerDatosPerfiles </b>.
		 * @see #~obtenerDatosPerfiles
		 * 
		 */

		onBeforeRendering: function () {
			if (!this._getSesionUsuario()) {
				var entidadSesion = [];
				entidadSesion.posiciones = [];
				this._sesionUsuario(entidadSesion);
			}
			var oData = this._getSesionUsuario();
			var oModel = new sap.ui.model.json.JSONModel(oData);
			this.getView().setModel(oModel, "posiciones");
			this.obtenerDatosPerfiles();


		},

		/**
		 * @desc Sets the new currency in the local model after selecting it in the corresponding select input.
		 * 
		 */

		onChangeCurrency: function () {
			this.getView().getModel("local").setProperty("/sMoneda", this._currency.getSelectedKey());
		},

		/**
		 * @desc Creates the dialog with the information of the selected profile and open it.
		 * 
		 */

		onPressPerfil: function (oEvent) {
			if (this._oDialogPerfil === undefined) {
				this._oDialogPerfil = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.Perfil", this);
				this.getView().addDependent(this._oDialogPerfil);
			}
			this._oDialogPerfil.open();
		},

		/**
		 * @desc Sets the data from the selected profile in the local model.
		 * 
		 */

		/*		onChangePerfil: function(oEvent){
					
					var sTexto = sap.ui.getCore().byId("textoAmpliado");
					this.getView().getModel("local").setProperty("/sTextoAmpliado", sTexto);
					
					
				},*/
		onChangePerfil: function (oEvent) {

			try {
				var sPath = oEvent.getSource().getSelectedItem().getBindingContext("modeloDatos").getPath();

				var oPerfil = this.getView().getModel("modeloDatos").getObject(sPath);
				if (oPerfil.CampOblig == "X") {
					this.getView().byId("seleccionCampanya").setVisible(true);
					this.getView().byId("campanyaLabel").setVisible(true);
					this.getView().byId("seleccionCampanya").setValue(oPerfil.CodCamp);
					this.getView().byId("seleccionCampanya").setValueState("None");
					(oPerfil.DescCamp !== "") ? this.getView().byId("seleccionCampanya").setDescription(oPerfil.DescCamp) : this.getView().byId("seleccionCampanya").setDescription("-");
				} else {
					this.getView().byId("seleccionCampanya").setVisible(false);
					this.getView().byId("campanyaLabel").setVisible(false);
					this.getView().byId("seleccionCampanya").setValueState("None");
				}

				if (oPerfil.TextoObligatorio === "X" || oPerfil.TextoObligatorio === true) {
					this.getView().byId("idTextoClasificacion").setRequired(true);
				} else {
					this.getView().byId("idTextoClasificacion").setRequired(false);
				}

				this.getView().getModel("local").setProperty("/sPerfil", oPerfil);
				this.getView().getModel("local").setProperty("/sCeCo", oPerfil.CentroCoste);
				//      MTEN A�adir texto Ampliado.			
				var sTexto = sap.ui.getCore().byId("textoAmpliado");
				this.getView().getModel("local").setProperty("/sTextoAmpliado", sTexto);

				this._PerfilActivo = oPerfil;
				this.ModificarPantalla();
			} catch (err) {
				console.log(err);
				sap.m.MessageBox.error(err);
			}

		},

		/**
		 * @desc Closes the profile dialog.
		 * 
		 */

		onPressCerrarPerfil: function () {
			this._oDialogPerfil.close();
		},
		/**
		 * @desc Creates the dialog for input Large Text on Header.
		 * 
		 */

		onPressTextoAmpliado: function (oEvent) {
			if (this._oDialogTextoAmpliado === undefined) {
				this._oDialogTextoAmpliado = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.TextoAmpliado", this);
				this.getView().addDependent(this._oDialogTextoAmpliado);

			}
			this._oDialogTextoAmpliado.open();
		},

		/**
		 * @desc Sets the data to Text Header.
		 * 
		 */

		onPressGuardarTextoAmpliado: function (oEvent) {
			var textoAmpliado = sap.ui.getCore().byId("textoAmpliado");

			this.getView().getModel("local").setProperty("/sTextoAmpliado", textoAmpliado.getValue());
			this._oDialogTextoAmpliado.close();
		},

		/**
		 * @desc Closes Large Text dialog.
		 * 
		 */

		onPressCerrarTextoAmpliado: function () {
			this._oDialogTextoAmpliado.close();
		},

		/**
		 * @desc Creates and shows the position edit dialog with the corresponding data. It also creates a pointer between the position of the model "posiciones" and "local/sPosicion".
		 * @param {Object} oEvent - Information about the event of clicking the button "Editar".
		 * 
		 */

		onPressEditar: function (oEvent) {

			var oDato = oEvent.getSource().getBindingContext("posiciones").getObject();
			if (this._oDialogPosicion === undefined) {
				try {
					this._oDialogPosicion = sap.ui.xmlfragment(
						"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.Posicion", this);
					this.getView().addDependent(this._oDialogPosicion);
				} catch (err) {
					console.log(err);
					sap.m.MessageBox.error(err);
				}
			}
			this.getView().getModel("local").setProperty("/sPosicion", oDato);

			if (this._PedidoVentas) {
				sap.ui.getCore().byId("precioMod").setVisible(false);
				sap.ui.getCore().byId("fechaMod").setVisible(false);
				sap.ui.getCore().byId("tipoImputacionPos").setVisible(false);
				sap.ui.getCore().byId("cantidadMod").setDescription("");
				sap.ui.getCore().byId("comboUnidad").setEnabled(true);
				sap.ui.getCore().byId("comboUnidad").setSelectedKey(oDato.Unidad);
			}

			this._oDialogPosicion.open();

		},

		/**
		 * @desc Closes the position edit dialog, empty form fields and delete the unwanted changes in the local model.
		 * 
		 */

		onPressCancelarPosicion: function () {
			this._oDialogPosicion.close();
			this._oDialogPosicion.destroy();   //APC  
			this._oDialogPosicion = undefined; //APC		
			this._limpiarPantalla();
			this._recargarModelos();
			//			this._guardarDatosSesion();

		},


		/**
		 * @desc Saves the position changes in the session and close the edit dialog.
		 * 
		 */

		onPressAddPosicion: function () {
			this._showToast(this._getText("MensajeModificada"));
			if (sap.ui.getCore().byId("cantidadMod") && this._oDialogPosicion.isOpen()) {
				this._cantidad = sap.ui.getCore().byId("cantidadMod");
			}
			if (sap.ui.getCore().byId("nombreMaterialEdit") && this._oDialogPosicion.isOpen()) {
				this._nombreMaterial = sap.ui.getCore().byId("nombreMaterialEdit");
			}

			if (this._PedidoVentas) {
				this._precio = 0;
			} else if (sap.ui.getCore().byId("precioMod") && this._oDialogPosicion.isOpen()) {
				this._precio = sap.ui.getCore().byId("precioMod");
			}
			if (sap.ui.getCore().byId("fechaMod") && this._oDialogPosicion.isOpen()) {
				this._fecha = sap.ui.getCore().byId("fechaMod");
			}
			if (sap.ui.getCore().byId("idMaterialEdit") && this._oDialogPosicion.isOpen()) {
				this._materialEdit = sap.ui.getCore().byId("idMaterialEdit");
			}
			var bMaterialReq = this.oView.getModel("local").getData().sPerfil.MatnrReq === "" ? false : true;

			if (this._PedidoVentas) {
				if ((bMaterialReq && (!this._materialEdit || this._materialEdit.getValue() == "")) || !this._nombreMaterial || this._nombreMaterial.getValue() == "" || !this._cantidad || parseFloat(this._cantidad.getValue()) == 0 || this._cantidad.getValue() == "" || this._fecha.getValue() == "" || this._fecha.getValue() == null) {
					this._showToast(this._getText("CamposVacios"));
					//mostramos los campos en caso de que los campos est�n vacios
					(sap.ui.getCore().byId("nombreMaterialEdit").getValue() == "") ? sap.ui.getCore().byId("nombreMaterialEdit").setValueState("Error") : sap.ui.getCore().byId("nombreMaterialEdit").setValueState("None");
					(sap.ui.getCore().byId("cantidadMod").getValue() == "") ? sap.ui.getCore().byId("cantidadMod").setValueState("Error") : sap.ui.getCore().byId("cantidadMod").setValueState("None");
					(sap.ui.getCore().byId("fechaMod").getValue() == "") ? sap.ui.getCore().byId("fechaMod").setValueState("Error") : sap.ui.getCore().byId("fechaMod").setValueState("None");
					if (bMaterialReq)
						(sap.ui.getCore().byId("idMaterialEdit").getValue() == "") ? sap.ui.getCore().byId("idMaterialEdit").setValueState("Error") : sap.ui.getCore().byId("idMaterialEdit").setValueState("None");
					return;
				}
			} else {
				if ((bMaterialReq && (!this._materialEdit || this._materialEdit.getValue() == "")) || !this._nombreMaterial || this._nombreMaterial.getValue() == "" || !this._precio || this._precio.getValue() == "" || !this._cantidad || parseFloat(this._cantidad.getValue()) == 0 || this._cantidad.getValue() == "" || this._fecha.getValue() == "" || this._fecha.getValue() == null) {
					this._showToast(this._getText("CamposVacios"));
					//mostramos los campos en caso de que los campos est�n vacios
					(sap.ui.getCore().byId("nombreMaterialEdit").getValue() == "") ? sap.ui.getCore().byId("nombreMaterialEdit").setValueState("Error") : sap.ui.getCore().byId("nombreMaterialEdit").setValueState("None");
					(sap.ui.getCore().byId("precioMod").getValue() == "") ? sap.ui.getCore().byId("precioMod").setValueState("Error") : sap.ui.getCore().byId("precioMod").setValueState("None");
					(sap.ui.getCore().byId("cantidadMod").getValue() == "") ? sap.ui.getCore().byId("cantidadMod").setValueState("Error") : sap.ui.getCore().byId("cantidadMod").setValueState("None");
					(sap.ui.getCore().byId("fechaMod").getValue() == "") ? sap.ui.getCore().byId("fechaMod").setValueState("Error") : sap.ui.getCore().byId("fechaMod").setValueState("None");
					if (bMaterialReq)
						(sap.ui.getCore().byId("idMaterialEdit").getValue() == "") ? sap.ui.getCore().byId("idMaterialEdit").setValueState("Error") : sap.ui.getCore().byId("idMaterialEdit").setValueState("None");
					return;
				}
			}
			var oDatosPosicion = this.getView().getModel("local").getData().sPosicion;
			//convertimos la fecha al d�a 1 del mes si no se informa el d�a			
			var oFecha = sap.ui.getCore().byId("fechaMod").getValue().split("/");
			if (oFecha.length == 2) {
				oDatosPosicion.Fecha = new Date(oFecha[0] + "/01/" + oFecha[1]);
			} else if (sap.ui.getCore().byId("fechaMod").getDateValue() && oFecha.length == 3) {
				oDatosPosicion.Fecha = sap.ui.getCore().byId("fechaMod").getDateValue();
			} else {
				this._showToast(this._getText("FechaIncorrecta"));
				oDatosPosicion.Fecha = new Date();
			}
			isNaN(oDatosPosicion.Fecha.getDate()) ? oDatosPosicion.Fecha = new Date() : "";
			var oModel = this.getView().getModel("posiciones");
			oModel.refresh();
			this._guardarDatosSesion();
			this._limpiarPantalla();
			this._oDialogPosicion.close();
			this._oDialogPosicion.destroy();   //APC  
			this._oDialogPosicion = undefined; //APC					
			this.getView().getModel("local").setProperty("/sPosicion", "");

		},

		/**
		 * @desc Makes sure that the form field that generated the event was filled out correctly. Otherwise the state is set to error.
		 * @param {Object} oEvent - Object that contains the information of the input to check.
		 */

		onComprobarCampoVacio: function (oEvent) {
			if (oEvent.getParameter("value") == "") {
				oEvent.getSource().setValueState("Error");
				switch (oEvent.getParameter("id")) {
					case "idMaterial":
						this._idMaterial = oEvent.getSource();
						break;
					case "nombreMaterial":
						this._nombreMaterial = oEvent.getSource();
						break;
					case "cantidad":
						this._cantidad = oEvent.getSource();
						break;
					case "precio":
						this._precio = oEvent.getSource();
						break;
					case "fecha":
						this._fecha = oEvent.getSource();
						break;
					case "idCeCo":
						this._ceCo = oEvent.getSource();
						break;
					case "idMaterialMod":
						this._idMaterial = oEvent.getSource();
						break;
					case "nombreMaterialMod":
						this._nombreMaterial = oEvent.getSource();
						break;
					case "cantidadMod":
						this._cantidad = oEvent.getSource();
						break;
					case "precioMod":
						this._precio = oEvent.getSource();
						break;
					case "fechaMod":
						this._fecha = oEvent.getSource();
						break;
				}
			} else {
				oEvent.getSource().setValueState("None");
				var oView = sap.ui.getCore();
				//pasamos al siguiente campo
				switch (oEvent.getParameter("id")) {
					case "idMaterialMult":
						var materiales = this.getView().getModel("productos").getData();
						var encontrado;
						for (var i in materiales) {
							if (oEvent.getParameter("value") == materiales[i].Codigo) {
								sap.ui.getCore().byId("nombreMaterialMult").setValue(materiales[i].Descripcion);
								sap.ui.getCore().byId("nombreMaterialMult").setValueState("None");
								sap.ui.getCore().byId("idMaterialMult").setValueState("None");
								sap.ui.getCore().byId("idGrupoArticuloMult").setValue(materiales[i].GrupoArticulos);
								sap.ui.getCore().byId("idGrupoArticuloMult").setDescription(materiales[i].GrArtDesc);
								sap.ui.getCore().byId("idGrupoArticuloMult").setEnabled(false);
								encontrado = true;
								break;
							}

						}
						if (!encontrado) {
							sap.ui.getCore().byId("idMaterialMult").setValue("");
							sap.ui.getCore().byId("idMaterialMult").setValueState("Error");
							sap.ui.getCore().byId("nombreMaterialMult").setValue("");
							sap.ui.getCore().byId("idGrupoArticuloMult").setValue("");
							sap.ui.getCore().byId("idGrupoArticuloMult").setDescription("");
							sap.ui.getCore().byId("idGrupoArticuloMult").setEnabled(true);
						}
						oView.byId("nombreMaterialMult").focus();
						break;
					case "nombreMaterial":
						oView.byId("cantidad").focus();
						break;
					case "cantidad":
						oView.byId("precio").focus();
						break;
					case "precio":
						oView.byId("fecha").focus();
						break;
					case "fecha":
						oView.byId("idCeCo").focus();
						break;
					case "idCeCo":
						oView.byId("guardarAdd").focus();
						break;
					case "idMaterialMod":
						oView.byId("nombreMaterialMod").focus();
						break;
					case "nombreMaterialMod":
						oView.byId("cantidadMod").focus();
						break;
					case "cantidadMod":
						oView.byId("precioMod").focus();
						break;
					case "precioMod":
						oView.byId("fechaMod").focus();
						break;
					case "fechaMod":
						oView.byId("guardarMod").focus();
						break;
				}
			}
		},

		/**
		 * @desc Edits dialog. Make sure that the new value of the input "Cantidad" and "Precio" are greater than 0. Otherwise the state is set to error.
		 * @param {Object} oEvent - Object that contains the information of the input to check.
		 */

		onItemLiveChangeMod: function (oEvent) {
			if (oEvent.getParameter("newValue") == "") return;
			if (oEvent.getParameter("id").indexOf("cantidad") >= 0) {

				if (parseFloat(oEvent.getParameter("newValue")) < 1) {
					oEvent.getSource().setValueState("Error");

				} else {
					oEvent.getSource().setValueState("None");
				}
				this._cantidad = oEvent.getSource();

			} else {
				if (parseFloat(oEvent.getParameter("newValue")) <= 0) {
					oEvent.getSource().setValueState("Error");
				} else {
					oEvent.getSource().setValueState("None");
				}
				this._precio = oEvent.getSource();
			}
		},

		/**
		 * @desc Creates the position dialog. Makes sure that the new value of the input "Cantidad" and "Precio" are greater than 0. Otherwise the state is set to error. Furthermore
		 * it stores the input control in a variable for later use.
		 * @param {Object} oEvent - Object that contains the information of the input to check.
		 */

		onItemLiveChange: function (oEvent) {

			switch (oEvent.getParameter("id")) {
				case "idMaterial":
					this._idMaterial = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._grupoArticulos.setEnabled(true);
						this._grupoArticulos.setValue(this.getView().getModel("local").getProperty("/sPerfil").GrupoArticulos);
						this._grupoArticulos.setDescription(this.getView().getModel("local").getProperty("/sPerfil").DescGrupoArt);
						this._nombreMaterial.setValue("");
						var cDato2 = sap.ui.getCore().byId("cantidad");
						cDato2.setDescription("UND");
					}
					break;
				case "idMaterialEdit":
					this._idMaterial = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._grupoArticulos.setEnabled(true);
						this._grupoArticulos.setValue(this.getView().getModel("local").getProperty("/sPerfil").GrupoArticulos);
						this._grupoArticulos.setDescription(this.getView().getModel("local").getProperty("/sPerfil").DescGrupoArt);
						this._nombreMaterial.setValue("");
						var cDato2 = sap.ui.getCore().byId("cantidadMod");
						cDato2.setDescription("UND");
					}
					break;
				case "idMaterialMult":
					this._idMaterial = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						var cDato2 = sap.ui.getCore().byId("nombreMaterialMult");
						cDato2.setValue("");
						var cDato3 = sap.ui.getCore().byId("idGrupoArticuloMult");
						cDato3.setValue(this.getView().getModel("local").getProperty("/sPerfil").GrupoArticulos);
						cDato3.setEnabled(true);
						cDato3.setDescription(this.getView().getModel("local").getProperty("/sPerfil").DescGrupoArt);
					}
					break;
				case "nombreMaterial":
					this._nombreMaterial = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._nombreMaterial.setValueState("Error");
					} else {
						this._nombreMaterial.setValueState("None");
					}
					break;
				case "nombreMaterialEdit":
					this._nombreMaterial = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._nombreMaterial.setValueState("Error");
					} else {
						this._nombreMaterial.setValueState("None");
					}
					break;
				case "nombreMaterialMult":
					this._nombreMaterial = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._nombreMaterial.setValueState("Error");
					} else {
						this._nombreMaterial.setValueState("None");
					}
					break;
				case "tipoImputacionPosAdd":
					if (oEvent.getParameter("newValue").toUpperCase() == "A") {
						sap.ui.getCore().byId("idActivo").setVisible(true);
					} else {
						sap.ui.getCore().byId("idActivo").setVisible(false);
					};
					break;
				case "tipoImputacionPos":
					break;
				case "cantidad":
					if (oEvent.getParameter("newValue") == "") return;
					if (parseFloat(oEvent.getParameter("newValue")) < 1) {
						oEvent.getSource().setValueState("Error");
						//						oEvent.getSource().setValue("1");
					} else {
						oEvent.getSource().setValueState("None");
					}
					this._cantidad = oEvent.getSource();
					break;
				case "precio":
					if (oEvent.getParameter("newValue") == "") return;
					if (parseFloat(oEvent.getParameter("newValue")) <= 0) {
						oEvent.getSource().setValueState("Error");
						//						oEvent.getSource().setValue("1");
					} else {
						oEvent.getSource().setValueState("None");
					}
					this._precio = oEvent.getSource();
					break;
				case "cantidadMult":
					if (oEvent.getParameter("newValue") == "") return;
					if (parseFloat(oEvent.getParameter("newValue")) < 1) {
						oEvent.getSource().setValueState("Error");
						//						oEvent.getSource().setValue("1");
					} else {
						oEvent.getSource().setValueState("None");
					}
					this._cantidad = oEvent.getSource();
					break;
				case "precioMult":
					if (oEvent.getParameter("newValue") == "") return;
					if (parseFloat(oEvent.getParameter("newValue")) <= 0) {
						oEvent.getSource().setValueState("Error");
						//						oEvent.getSource().setValue("1");
					} else {
						oEvent.getSource().setValueState("None");
					}
					this._precio = oEvent.getSource();
					break;
				case "fecha":
					this.onComprobarCampoVacio(oEvent); //lanzamos la comprobaci�n del campo y el lanzamiento del campo
					this._fecha = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._fecha.setValueState("Error");
					} else {
						this._fecha.setValueState("None");
					}
					//TODO asignamos la fecha al campo Fecha
					break;
				//TODO: A�adimos la modificaci�n de la fecha para que se almacene una fecha y no un texto.
				case "fechaMod":
					this.onComprobarCampoVacio(oEvent); //lanzamos la comprobaci�n del campo y el lanzamiento del campo
					this._fecha = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._fecha.setValueState("Error");
					} else {
						this._fecha.setValueState("None");
					}
					//TODO asignamos la fecha al campo Fecha
					this.getView().getModel("local").getData().sPosicion.Fecha = this._fecha.getDateValue();
					break;
				case "fechaMult":
					//				 //lanzamos la comprobaci�n del campo y el lanzamiento del campo
					this._fechaMultTemp = oEvent.getSource();
					if (oEvent.getParameter("newValue") == "") {
						this._fechaMultTemp.setValueState("Error");
					} else {
						this._fechaMultTemp.setValueState("None");
					}
					break;
				case "idCeCo":
					this.onComprobarCampoVacio(oEvent);
					this.getView().getModel("local").setProperty("/sCeCo", oEvent.getSource().getValue());
					break;
			}
		},

		/**
		 * @desc Creates and opens the create position dialog and also creates some variables to store the data of the new position.
		 *
		 */

		onPressPosicionAdd: function () {

			if (this._oDialogPosicionAdd === undefined) {
				this._oDialogPosicionAdd = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.PosicionAdd", this);
				try {
					this.getView().addDependent(this._oDialogPosicionAdd);
				} catch (err) {
					console.log(err);
					sap.m.MessageBox.error(err);
				}
			}
			//creamos variables para guardar datos posicion nueva
			this._idMaterial = "";
			this._nombreMaterial = "";
			this._cantidad = sap.ui.getCore().byId("cantidad");
			this._tipoSeleccionado = sap.ui.getCore().byId("tipoImputacionPosAdd");
			this._grupoArticulos = sap.ui.getCore().byId("idGrupoArticulo");
			this._precio = undefined;
			this._fecha = sap.ui.getCore().byId("fecha");
			this._activoFijo = sap.ui.getCore().byId("idActivo");


			//Usamos la variable por defecto de la imputacion
			var oModPerfil = this.getView().getModel("local").getData().sPerfil;
			sap.ui.getCore().byId("tipoImputacionPosAdd").setValue(oModPerfil.TipoImputacion);
			sap.ui.getCore().byId("tipoImputacionPosAdd").setDescription(oModPerfil.DescTipoImp);
			sap.ui.getCore().byId("idCeCo").setValue(oModPerfil.CentroCoste);
			sap.ui.getCore().byId("idCeCo").setDescription(oModPerfil.DescCeco);
			sap.ui.getCore().byId("idGrupoArticulo").setValue(oModPerfil.GrupoArticulos);
			sap.ui.getCore().byId("idGrupoArticulo").setDescription(oModPerfil.DescGrupoArt);
			sap.ui.getCore().byId("idActivo").setValue(oModPerfil.ActivoFijo);
			sap.ui.getCore().byId("idActivo").setDescription(oModPerfil.DescActivoFijo);
			if (oModPerfil.TipoImputacion == "A") sap.ui.getCore().byId("idActivo").setVisible(true);

			if (this._PerfilActivo.ClasePedidoVentas !== "") {
				sap.ui.getCore().byId("tipoImputacionPosAdd").setVisible(false);
			}


			this._oDialogPosicionAdd.open();
		},


		/**
		 * @desc Makes sure that no field of the form is empty, adds a new position to the order with the entered data and closes the dialog.
		 *
		 */
		onPressAddPosicionAdd: function () {

			var oView = this.getView();
			var oModel = this.getView().getModel("posiciones");
			if (!this._nombreMaterial || this._nombreMaterial.getValue() == "" || !this._precio || parseFloat(this._precio.getValue()) <= 0 || !this._cantidad || parseFloat(this._cantidad.getValue()) == 0 || this._cantidad.getValue() == "" || this._fecha.getValue() == "" || this._fecha.getValue() == null) {
				this._showToast(this._getText("CamposVacios"));
				//mostramos los campos en caso de que los campos est�n vacios
				(sap.ui.getCore().byId("nombreMaterial").getValue() == "") ? sap.ui.getCore().byId("nombreMaterial").setValueState("Error") : sap.ui.getCore().byId("nombreMaterial").setValueState("None");
				(sap.ui.getCore().byId("precio").getValue() == "") ? sap.ui.getCore().byId("precio").setValueState("Error") : sap.ui.getCore().byId("precio").setValueState("None");
				(sap.ui.getCore().byId("cantidad").getValue() == "") ? sap.ui.getCore().byId("cantidad").setValueState("Error") : sap.ui.getCore().byId("cantidad").setValueState("None");
				(sap.ui.getCore().byId("fecha").getValue() == "") ? sap.ui.getCore().byId("fecha").setValueState("Error") : sap.ui.getCore().byId("fecha").setValueState("None");
				return;
			}

			var oDatosPosicion = {};
			(this._idMaterial) ? oDatosPosicion.CodigoMaterial = this._idMaterial.getValue() : this._idMaterial = undefined;
			(this._cantidad) ? oDatosPosicion.Cantidad = this._cantidad.getValue() : oDatosPosicion.Cantidad = "1";
			(this._precio) ? oDatosPosicion.Precio = this._precio.getValue() : this._precio = undefined;
			(this._tipoSeleccionado) ? oDatosPosicion.TipoImputacion = this._tipoSeleccionado.getValue() : this.TipoImputacion = undefined;
			(this._tipoSeleccionado) ? oDatosPosicion.DescTipoImputacion = this._tipoSeleccionado.getDescription() : oDatosPosicion.DescTipoImputacion = "";
			this.getView().getModel("local").setProperty("/sDescTipoImp", this._tipoSeleccionado.getDescription());
			(this._fecha) ? oDatosPosicion.Fecha = this._fecha.getDateValue() : this._fecha = undefined;
			oDatosPosicion.CentroCoste = sap.ui.getCore().byId("idCeCo").getValue();
			oDatosPosicion.DescCentroCoste = sap.ui.getCore().byId("idCeCo").getDescription();
			oDatosPosicion.Descripcion = sap.ui.getCore().byId("nombreMaterial").getValue();
			//TODO: Utilizamos la unidad del material seleccionado
			oDatosPosicion.Unidad = sap.ui.getCore().byId("cantidad").getDescription();//"UND";
			oDatosPosicion.GrupoArticulos = (sap.ui.getCore().byId("idGrupoArticulo")) ? sap.ui.getCore().byId("idGrupoArticulo").getValue() : this.getView().getModel("local").getProperty("/sPerfil").GrupoArticulos;
			oDatosPosicion.DescGrupoArt = (sap.ui.getCore().byId("idGrupoArticulo")) ? sap.ui.getCore().byId("idGrupoArticulo").getDescription() : this.getView().getModel("local").getProperty("/sPerfil").GrupoArticulos;
			var activoF = sap.ui.getCore().byId("idActivo").getValue();
			if (activoF == "") {
				oDatosPosicion.ActivoFijo = this.getView().getModel("local").getProperty("/sPerfil").ActivoFijo;
				oDatosPosicion.ActivoFijo = this.getView().getModel("local").getProperty("/sPerfil").DescActivoFijo;
			} else {
				oDatosPosicion.ActivoFijo = activoF;
				oDatosPosicion.DescActivoFijo = sap.ui.getCore().byId("idActivo").getDescription();
			}
			oDatosPosicion.CuentaMayor = this.getView().getModel("local").getProperty("/sPerfil").CuentaMayor;
			switch (this.getView().getModel("local").getProperty("/sPerfil").Sociedad) {
				case "SNAC":
					oDatosPosicion.Centro = "GA01";
					break;
				case "GREF":
					oDatosPosicion.Centro = "GCEN";
					break;
				case "MASQ":
					oDatosPosicion.Centro = "GMQP";
					break;
			}
			switch (this.getView().getModel("local").getProperty("/sPerfil").Sociedad) {
				case "SNAC":
					oDatosPosicion.Almacen = "GA16";
					break;
				case "GREF":
					oDatosPosicion.Almacen = "GC99";
					break;
				case "MASQ":
					oDatosPosicion.Almacen = "MQ16";
					break;
			}
			if (!oModel.getData() || jQuery.isEmptyObject(oModel.getData())) {
				oModel.setData([]);
				oModel.getData().push(oDatosPosicion);
				oModel.refresh();
			} else {
				oModel.getData().push(oDatosPosicion);
			}
			oModel.refresh();
			this._limpiarPantalla();
			this._oDialogPosicionAdd.close();
			this._oDialogPosicionAdd.destroy();   //APC  
			this._oDialogPosicionAdd = undefined; //APC					
			this._guardarDatosSesion();
		},

		/**
		 * @desc Sets all the StatesValue from the dialog form to "None" and closes the dialog.
		 *
		 */

		onPressCancelarPosicionAdd: function () {
			this._limpiarPantalla();
			sap.ui.getCore().byId("idActivo").setVisible(false);
			this._oDialogPosicionAdd.close();
			this._oDialogPosicionAdd.destroy();   //APC  
			this._oDialogPosicionAdd = undefined; //APC					
		},

		/**
		 * @desc Deletes the corresponding position of the order. This change is made on the session and on the local models.
		 *@param {Object} oEvent - Object that contains the information of the position to delete.
		 */

		onPressBorrar: function (oEvent) {
			this._showToast(this._getText("PosicionBorrada"));
			var sPath = oEvent.getParameters().listItem.getBindingContextPath("posiciones");
			var index = sPath.substr(sPath.lastIndexOf("/") + 1);
			var oModel = this.getView().getModel("posiciones");
			var oData = oModel.getData();
			oData.splice(index, 1);
			oModel.refresh();
			this._guardarDatosSesion();
		},

		/**
		 * @desc Stores the data of the local model "positions" in the session. 
		 *
		 */

		_guardarDatosSesion: function () {
			//			this._showToast("Guardamos Pedido Sesion");
			var oModel = this.getView().getModel("posiciones");

			if (!this._getSesionUsuario()) {
				var entidadSesion = [];
			}
			var entidadSesion = this._getSesionUsuario();
			entidadSesion = oModel.getData();
			this._sesionUsuario(entidadSesion);

			this._recargarModelos();

		},


		/**
		 * @desc Refresh local models with the session data.
		 *
		 */

		_recargarModelos: function () {
			var oModel = this.getView().getModel("posiciones");
			//asignamos los valores guardados en la sesion al modelo local
			if (this._getSesionUsuario()) {
				oModel.setData(this._getSesionUsuario());

			}
			this.getView().getModel("local").setProperty("/sPosicion", "");
		},

		/**
		 * @desc Resets the contents of the variables used in the forms and empty the forms fields.
		 *
		 */

		_limpiarPantalla: function () {
			(this._idMaterial) ? this._idMaterial.setValue("") : this._idMaterial = undefined;
			if (sap.ui.getCore().byId("idMaterialMult")) {
				sap.ui.getCore().byId("idMaterialMult").setValueState("None");
				sap.ui.getCore().byId("idMaterialMult").setValue("");
			}
			if (sap.ui.getCore().byId("idMaterialEdit")) {
				sap.ui.getCore().byId("idMaterialEdit").setValueState("None");
				sap.ui.getCore().byId("idMaterialEdit").setValue("");
			}

			(this._nombreMaterial) ? this._nombreMaterial.setValue("") : this._nombreMaterial = undefined;
			if (sap.ui.getCore().byId("nombreMaterial")) {
				sap.ui.getCore().byId("nombreMaterial").setValueState("None");
				sap.ui.getCore().byId("nombreMaterial").setValue("");
			}
			if (sap.ui.getCore().byId("nombreMaterialEdit")) {
				sap.ui.getCore().byId("nombreMaterialEdit").setValueState("None");
				sap.ui.getCore().byId("nombreMaterialEdit").setValue("");
			}

			(this._cantidad) ? this._cantidad.setValue("1") : this._cantidad = undefined;
			if (sap.ui.getCore().byId("cantidad")) {
				sap.ui.getCore().byId("cantidad").setValueState("None");
				sap.ui.getCore().byId("cantidad").setValue("1");
			}
			if (sap.ui.getCore().byId("cantidadMod")) {
				sap.ui.getCore().byId("cantidadMod").setValueState("None");
				sap.ui.getCore().byId("cantidadMod").setValue("");
			}

			(this._precio) ? this._precio.setValue("") : this._precio = undefined;
			if (sap.ui.getCore().byId("precio")) {
				sap.ui.getCore().byId("precio").setValueState("None");
				sap.ui.getCore().byId("precio").setValue("");
			}
			if (sap.ui.getCore().byId("precioMod")) {
				sap.ui.getCore().byId("precioMod").setValueState("None");
				sap.ui.getCore().byId("precioMod").setValue("");
			}

			(this._fecha) ? this._fecha.setValue("") : this._fecha = undefined;
			if (sap.ui.getCore().byId("fecha")) {
				sap.ui.getCore().byId("fecha").setValueState("None");
				sap.ui.getCore().byId("fecha").setValue("");
			}
			if (sap.ui.getCore().byId("fechaMod")) {
				sap.ui.getCore().byId("fechaMod").setValueState("None");
				sap.ui.getCore().byId("fechaMod").setValue("");
			}
			if (sap.ui.getCore().byId("cantidad")) {
				sap.ui.getCore().byId("cantidad").setDescription("UND");
				sap.ui.getCore().byId("cantidad").setValueState("None");
			}
			if (sap.ui.getCore().byId("cantidadMod")) {
				sap.ui.getCore().byId("cantidadMod").setDescription("UND");
				sap.ui.getCore().byId("cantidadMod").setValueState("None");
			}
			(this._tipoSeleccionado) ? this._tipoSeleccionado.setValue("") : this._tipoSeleccionado = undefined;
			(this._grupoArticulos) ? this._grupoArticulos.setEnabled(true) : this._grupoArticulos = undefined;

		},

		// Funcionalidad Dialogo Materiales	y Centros de Coste

		/**
		 * @desc Creates the ValueHelper dialog for the materials field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */

		onVHMaterial: function (oEvent) {

			if (this._oDialogMaterial === undefined) {
				this._oDialogMaterial = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.Material", this);
				try {
					this.getView().addDependent(this._oDialogMaterial);
				} catch (err) {
					console.log(err);
					sap.m.MessageBox.error(err);
				}
			}
			//asignamos el codigo del material al imput material de posicion y 
			this._matSelecionado = oEvent.getSource();
			(oEvent.getSource().getId() == "idMaterialMult") ? this._desSelecionado = sap.ui.getCore().byId("nombreMaterial") : this._desSelecionado = sap.ui.getCore().byId("nombreMaterialEdit");
			this.obtenerDatosMateriales();
			this._oDialogMaterial.open();

		},

		/**
		 * @desc Creates the ValueHelper dialog for the "Grupo de Articulos" field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */

		onVHGrupoArticulos: function (oEvent) {
			var cInput = undefined;
			if (sap.ui.getCore().byId("idMaterialMult")) {
				cInput = sap.ui.getCore().byId("idMaterialMult");

			} else if (sap.ui.getCore().byId("idMaterialEdit")) {
				cInput = sap.ui.getCore().byId("idMaterialEdit");
			}
			if (cInput.getValue() == "") {
				if (this._oDialogGrupoArticulos === undefined) {
					this._oDialogGrupoArticulos = sap.ui.xmlfragment(
						"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.GrupoArticulos", this);
					this.getView().addDependent(this._oDialogGrupoArticulos);
				}
				this._grupoArticulos = oEvent.getSource();
				this.obtenerDatosGrupoArticulos();
				//				this._oDialogGrupoArticulos.open();
			} else {
				this._showToast(this._getText("CodigoMaterialInformado"));
			}


		},

		/**
		 * @desc Sets the data from the selected "Grupo de articulos" in the input fields of the dialog.
		 * 
		 */

		onChangeGrupoArticulos: function (oEvent) {
			var sPath = oEvent.getSource().getSelectedItem().getBindingContext("grupoArticulos").getPath();
			var oGrupoArticulos = this.getView().getModel("grupoArticulos").getObject(sPath);
			this._grupoArticulos.setValue(oGrupoArticulos.Codigo);
			this._grupoArticulos.setDescription(oGrupoArticulos.Descripcion);

			oEvent.getSource().removeSelections();
			this.onPressCerrarGrupoArticulos();

		},

		/**
		 * @desc Filters the list of available items based on the string entered in the search field. It filters by <i><b>"Codigo"</i></b> and <i><b>"Descripcion"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */

		onBuscarGrupoArticulos: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = [];
				var oFilter1 = new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var oFilter2 = new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var aFilters = new sap.ui.model.Filter([oFilter1, oFilter2], false);

			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaGrupoArticulos");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},

		/**
		 * @desc Closes the profile dialog.
		 * 
		 */

		onPressCerrarGrupoArticulos: function () {
			sap.ui.getCore().byId("buscarGrupoArticulos").setValue("");
			this._oDialogGrupoArticulos.close();
			//			this.eliminarDialogo(this._oDialogPerfil);
		},

		/**
		 * @desc Creates the ValueHelper dialog for the Type field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */

		onPressVHTipo: function (oEvent) {

			if (this._oDialogTipoImputacion === undefined) {
				this._oDialogTipoImputacion = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.TipoImputaciones", this);
				this.getView().addDependent(this._oDialogTipoImputacion);
			}
			//asignamos el codigo del material al imput material de posicion y 
			this._tipoSeleccionado = oEvent.getSource();
			(oEvent.getSource().getId() == "tipoImputacion") ? this._tipoSeleccionado = sap.ui.getCore().byId("tipoImputacion") : "";
			(oEvent.getSource().getId() == "tipoImputacionPosAdd") ? this._tipoSeleccionado = sap.ui.getCore().byId("tipoImputacionPosAdd") : "";
			(oEvent.getSource().getId() == "tipoImputacionPos") ? this._tipoSeleccionado = sap.ui.getCore().byId("tipoImputacionPos") : "";

			this.obtenerDatosTiposImposicion();

		},
		/**
		 * @desc Resets the content of the search field, deletes the search filtering and closes the dialog.
		 *
		 */
		onPressCerrarTipo: function () {
			//			sap.ui.getCore().byId("buscarTipo").setValue("");
			//			var aFilters= null;
			//			var listaMateriales = sap.ui.getCore().byId("listaTipo");
			//		    var binding = listaMateriales.getBinding("items");
			//			if (binding){
			//				binding.filter(aFilters);
			//			}			
			this._oDialogTipoImputacion.close();
		},
		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */

		onPressTipo: function (oEvent) {
			var codigoTipo = oEvent.getSource().getSelectedItem().getProperty("title");
			var descripcionTipo = oEvent.getSource().getSelectedItem().getProperty("description");
			this._tipoSeleccionado.setValue(codigoTipo);
			this._tipoSeleccionado.setDescription(descripcionTipo);
			if (codigoTipo != "A") {
				(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? sap.ui.getCore().byId("idActivo").setVisible(false) : "";
				(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? sap.ui.getCore().byId("idActivoMod").setVisible(false) : "";
				(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? sap.ui.getCore().byId("idActivoMult").setVisible(false) : "";
			} else {
				var sActivoFijo = this.getView().getModel("local").getProperty("/sPerfil").ActivoFijo;
				var sDesActivoFijo = this.getView().getModel("local").getProperty("/sPerfil").DescActivoFijo;
				if (this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) {
					sap.ui.getCore().byId("idActivo").setVisible(true);
					sap.ui.getCore().byId("idActivo").setValue(sActivoFijo);
					sap.ui.getCore().byId("idActivo").setDescription(sDesActivoFijo);
				} else if (this._oDialogPosicion && this._oDialogPosicion.isOpen()) {
					sap.ui.getCore().byId("idActivoMod").setVisible(true);
					sap.ui.getCore().byId("idActivoMod").setValue(sActivoFijo);
					sap.ui.getCore().byId("idActivoMod").setDescription(sDesActivoFijo);
				} else if (this._oDialogMultiple && this._oDialogMultiple.isOpen()) {
					sap.ui.getCore().byId("idActivoMult").setVisible(true);
					sap.ui.getCore().byId("idActivoMult").setValue(sActivoFijo);
					sap.ui.getCore().byId("idActivoMult").setDescription(sDesActivoFijo);
				}

			}
			oEvent.getSource().removeSelections();

			this.onPressCerrarTipo();
		},
		/**
		 * @desc Filters the list of available items based on the string entered in the search field. 
		 * It filters by <i><b>"Tipo"</i></b> and <i><b>"Descripcion"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */

		onBuscarTipo: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = [];
				var oFilter1 = new sap.ui.model.Filter("Tipo", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var oFilter2 = new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var aFilters = new sap.ui.model.Filter([oFilter1, oFilter2], false);
			} else {
				var aFilters = null;
			}

			var listaTipo = sap.ui.getCore().byId("listaTipo");
			var binding = listaTipo.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},

		/**
		 * @desc Creates the ValueHelper dialog for the CeCo field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */
		onVHCeCo: function (oEvent) {
			if (this._oDialogCeCo === undefined) {
				this._oDialogCeCo = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.CeCo", this);
				this.getView().addDependent(this._oDialogCeCo);
			}
			//asignamos el codigo del material al imput material de posicion y 
			this._ceCoSelecionado = oEvent.getSource();
			(oEvent.getSource().getId() == "idCeCoMult") ? this._desCeCoSelecionado = sap.ui.getCore().byId("idCeCoMult") : this._desCeCoSelecionado = sap.ui.getCore().byId("idCeCoMod");
			this.obtenerDatosCeCos();
		},


		/**
		 * @desc Creates the ValueHelper dialog for the CeCo field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */
		onVHActivo: function (oEvent) {

			var proveedor = this.oView.byId("idProveedor").getValue();
			if (proveedor == "" || proveedor == undefined) {
				this._showToast(this._getText("ProveedorNecesario"));
				return;
			}
			if (this._oDialogActivo === undefined) {
				this._oDialogActivo = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.Activos", this);
				this.getView().addDependent(this._oDialogActivo);
			}
			//asignamos el codigo del material al imput material de posicion y 
			this._ceCoSelecionado = oEvent.getSource();
			(oEvent.getSource().getId() == "idActivo") ? this._activoSelecionado = sap.ui.getCore().byId("idActivo") : "";
			(oEvent.getSource().getId() == "idActivoMod") ? this._activoSelecionado = sap.ui.getCore().byId("idActivoMod") : "";
			this.obtenerDatosActivos();
		},

		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */

		onPressActivos: function (oEvent) {
			var idActivo = oEvent.getSource().getSelectedItem().getProperty("title");
			var descActivo = oEvent.getSource().getSelectedItem().getProperty("description");
			if (this._oDialogMultiple && this._oDialogMultiple.isOpen()) {
				this._idActivoMult.setValue(idActivo);
				this._idActivoMult.setDescription(descActivo);
				this._idActivoMult.setValueState("None");
			} else if ((this._oDialogPosicion && this._oDialogPosicion.isOpen()) || (this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen())) {
				this._activoSelecionado.setValue(idActivo);
				this._activoSelecionado.setDescription(descActivo);
				this._activoSelecionado.setValueState("None");
			}
			//			(this._activoFijo =="" || this._activoFijo) ? this._activoFijo= sap.ui.getCore().byId("idActivo"):"";
			//			this._activoSelecionado.setValue(idActivo);
			//			this._activoSelecionado.setDescription(descActivo);
			//			(this._idActivo =="" || this._idActivo) ? this._idActivo = sap.ui.getCore().byId("idActivo"):"";

			oEvent.getSource().removeSelections();

			this.onPressCerrarActivo();
		},

		onPressCerrarActivo: function () {
			sap.ui.getCore().byId("buscarActivos").setValue("");
			var aFilters = null;
			var listaMateriales = sap.ui.getCore().byId("listaActivos");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}

			this._oDialogActivo.close();
		},

		/**
		 * @desc Creates the ValueHelper dialog for the ClDoc field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */
		onVHClDoc: function (oEvent) {
			if (this._oDialogClDoc === undefined) {
				this._oDialogClDoc = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.ClaseDocumento", this);
				this.getView().addDependent(this._oDialogClDoc);
			}
			//asignamos el codigo del material al imput material de posicion y 
			this._ClDocSelecionado = oEvent.getSource();
			(oEvent.getSource().getId() == "idClDoc") ? this._ClDocSelecionado = sap.ui.getCore().byId("idClDoc") : "";
			this.obtenerDatosClDoc();
		},


		/**
		 * @desc Filters the list of available items based on the string entered in the search field.
		 * It filters by <i><b>"Codigo"</i></b> and <i><b>"Descripcion"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */
		onBuscarClDoc: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, valorBuscar),
						new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar)],
					and: false
				});

			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaClDoc");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},

		onPressCerrarClDoc: function () {
			sap.ui.getCore().byId("buscarClDoc").setValue("");
			var aFilters = null;
			var listaMateriales = sap.ui.getCore().byId("listaClDoc");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}

			this._oDialogClDoc.close();
		},

		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */

		onPressClDoc: function (oEvent) {
			var codigoClDoc = oEvent.getSource().getSelectedItem().getProperty("title");
			var descripcionClDoc = oEvent.getSource().getSelectedItem().getProperty("description");
			this._ClDocSelecionado.setValue(codigoClDoc);
			this._ClDocSelecionado.setDescription(descripcionClDoc);
			oEvent.getSource().removeSelections();

			this.onPressCerrarClDoc();
		},


		/**
		 * @desc Creates the ValueHelper dialog for the "Grupo de compras" field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */
		onVHGrupoCompras: function (oEvent) {
			if (this._oDialogGrupoCompras === undefined) {
				this._oDialogGrupoCompras = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.GrupoCompras", this);
				this.getView().addDependent(this._oDialogGrupoCompras);
			}
			//asignamos el codigo del material al imput material de posicion y 
			this._GrupoComprasSelecionado = oEvent.getSource();
			(oEvent.getSource().getId() == "idClDoc") ? this._GrupoComprasSelecionado = sap.ui.getCore().byId("idGrupoCompras") : "";
			this.obtenerDatosGrupo();
		},

		/**
		 * @desc Resets the content of the search field, deletes the search filtering and closes the dialog.
		 *
		 */

		onPressCerrarGrupoCompras: function () {
			sap.ui.getCore().byId("buscarGrupoCompras").setValue("");
			var aFilters = null;
			var listaMateriales = sap.ui.getCore().byId("listaGrupoCompras");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}

			this._oDialogGrupoCompras.close();
		},


		/**
		 * @desc Filters the list of available items based on the string entered in the search field.
		 * It filters by <i><b>"Codigo"</i></b> and <i><b>"Descripcion"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */

		onBuscarGrupoCompras: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, valorBuscar),
						new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar)],
					and: false
				});

			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaGrupoCompras");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},

		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */

		onPressGrupoCompras: function (oEvent) {
			var codigoGrupoCompras = oEvent.getSource().getSelectedItem().getProperty("title");
			var descripcionGrupoCompras = oEvent.getSource().getSelectedItem().getProperty("description");
			this._GrupoComprasSelecionado.setValue(codigoGrupoCompras);
			this._GrupoComprasSelecionado.setDescription(descripcionGrupoCompras);
			oEvent.getSource().removeSelections();

			this.onPressCerrarGrupoCompras();
		},

		/**
		 * @desc Resets the content of the search field, deletes the search filtering and closes the dialog.
		 *
		 */
		onPressCerrarMaterial: function () {
			sap.ui.getCore().byId("buscarMaterial").setValue("");
			var aFilters = null;
			var listaMateriales = sap.ui.getCore().byId("listaMateriales");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}

			this._oDialogMaterial.close();
		},

		/**
		 * @desc Resets the content of the search field, deletes the search filtering and closes the dialog.
		 *
		 */
		onPressCerrarCeCo: function () {
			sap.ui.getCore().byId("buscarCeCo").setValue("");
			var aFilters = null;
			var listaMateriales = sap.ui.getCore().byId("listaCeCos");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}

			this._oDialogCeCo.close();
		},


		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */

		onPressMaterial: function (oEvent) {

			var matPath = oEvent.getParameters().listItem.getBindingContextPath("productos");
			var oMat = this.getView().getModel("productos").getObject(matPath);


			this._matSelecionado.setValue(oMat.Codigo);
			this._matSelecionado.setValueState("None");
			(this._idMaterial == "" || this._idMaterial) ? this._idMaterial = sap.ui.getCore().byId("idMaterialMult") : "";
			(this._nombreMaterial == "" || this._nombreMaterial) ? this._nombreMaterial = sap.ui.getCore().byId("nombreMaterial") : "";
			if (!this._oDialogMultiple || !this._oDialogMultiple.isOpen()) {
				if (this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) {
					sap.ui.getCore().byId("nombreMaterial").setValue(oMat.Descripcion);
					sap.ui.getCore().byId("nombreMaterial").setValueState("None");
					sap.ui.getCore().byId("idGrupoArticulo").setValue(oMat.GrupoArticulos);
					sap.ui.getCore().byId("idGrupoArticulo").setDescription(oMat.GrArtDesc);
					sap.ui.getCore().byId("idGrupoArticulo").setEnabled(false);
				} else if (this._oDialogPosicion && this._oDialogPosicion.isOpen()) {
					sap.ui.getCore().byId("nombreMaterialEdit").setValue(oMat.Descripcion);
					sap.ui.getCore().byId("nombreMaterialEdit").setValueState("None");
					sap.ui.getCore().byId("idGrupoArticuloMod").setValue(oMat.GrupoArticulos);
					sap.ui.getCore().byId("idGrupoArticuloMod").setDescription(oMat.GrArtDesc);
					sap.ui.getCore().byId("idGrupoArticuloMod").setEnabled(false);
				}

			} else {
				sap.ui.getCore().byId("nombreMaterialMult").setValue(oMat.Descripcion);
				sap.ui.getCore().byId("nombreMaterialMult").setValueState("None");
				sap.ui.getCore().byId("idGrupoArticuloMult").setValue(oMat.GrupoArticulos);
				sap.ui.getCore().byId("idGrupoArticuloMult").setDescription(oMat.GrArtDesc);
				sap.ui.getCore().byId("idGrupoArticuloMult").setEnabled(false);
				this._unidadMaterial = oMat.Unidad;

			}
			oEvent.getSource().removeSelections();

			this.onPressCerrarMaterial();
		},

		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */
		onPressCeCo: function (oEvent) {
			var idCeCo = oEvent.getSource().getSelectedItem().getProperty("title");
			var DescCeCo = oEvent.getSource().getSelectedItem().getProperty("description");
			this._ceCoSelecionado.setValue(idCeCo);
			this._ceCoSelecionado.setDescription(DescCeCo);
			this._ceCoSelecionado.setValueState("None");
			(this._ceCo == "" || this._ceCo) ? this._ceCo = sap.ui.getCore().byId("idCeCo") : "";
			this._desCeCoSelecionado.setValue(idCeCo);
			(this._idCeCo == "" || this._idCeCo) ? this._idCeCo = sap.ui.getCore().byId("idCeCo") : "";

			oEvent.getSource().removeSelections();

			this.onPressCerrarCeCo();
		},

		/**
		 * @desc Filters the list of available items based on the string entered in the search field.
		 * It filters by <i><b>"Codigo"</i></b> and <i><b>"Descripcion"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */

		onBuscarMaterial: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = [];
				var oFilter1 = new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var oFilter2 = new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var aFilters = new sap.ui.model.Filter([oFilter1, oFilter2], false);
			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaMateriales");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},

		/**
		 * @desc Filters the list of available items based on the string entered in the search field.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */
		onBuscarCeCo: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = [];
				var oFilter1 = new sap.ui.model.Filter("Kostl", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var oFilter2 = new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar);
				var aFilters = new sap.ui.model.Filter([oFilter1, oFilter2], false);

			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaCeCos");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},


		/**
		 * @desc Filters the list of available items based on the string entered in the search field.
		 * It filters by <i><b>"Codigo"</i></b> and <i><b>"Descripcion"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */
		onBuscarActivos: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, valorBuscar),
						new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar)],
					and: false
				});

			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaActivos");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},


		// Funcionalidad Dialogo Proveedores y Campa�as
		/**
		 * @desc Creates the ValueHelper dialog for the providers field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */
		onPressVHProveedor: function (oEvent) {

			if (this._oVHProveedor === undefined) {
				this._oVHProveedor = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.Proveedor", this);
				this.getView().addDependent(this._oVHProveedor);
			}
			this._provSelecionado = oEvent.getSource();
			sap.ui.getCore().byId("buscarProveedor").setValue("");
			this.obtenerDatosProveedores();

		},

		/**
		 * @desc Creates the ValueHelper dialog for the campaigns field and opens it.
		 * @param {Object} oEvent - Object that contains the event info.
		 */
		onPressVHCampanya: function (oEvent) {
			if (this._oVHCampanya === undefined) {
				this._oVHCampanya = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.Campanya", this);
				this.getView().addDependent(this._oVHCampanya);
			}
			this._campSelecionada = oEvent.getSource();
			this.obtenerDatosCampanya();
		},

		/**
		 * @desc Resets the content of the search field, deletes the search filtering and closes the dialog.
		 *
		 */
		onPressCerrarProveedor: function () {
			this._oVHProveedor.close();
		},

		/**
		 * @desc Resets the content of the search field, deletes the search filtering and closes the dialog.
		 *
		 */
		onPressCerrarCampanyas: function () {
			this._oVHCampanya.close();
		},

		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */
		onPressProveedor: function (oEvent) {
			var codigoProveedor = oEvent.getSource().getSelectedItem().getProperty("title");
			var desProveedor = oEvent.getSource().getSelectedItem().getProperty("description");
			this._provSelecionado.setValue(codigoProveedor);
			this._provSelecionado.setDescription(desProveedor);
			this._provSelecionado.setValueState("None");

			oEvent.getSource().removeSelections();

			this.onPressCerrarProveedor();
		},

		/**
		 * @desc Gets the data from the selected element in the VH and fills the input field of the position dialog with it.
		 * @param {Object} oEvent - Object that contains the selected item information.
		 */

		onPressCampanya: function (oEvent) {
			var codigoCampanya = oEvent.getSource().getSelectedItem().getProperty("title");
			var desCampanya = oEvent.getSource().getSelectedItem().getProperty("description");
			this._campSelecionada.setValue(codigoCampanya);
			this._campSelecionada.setDescription(desCampanya);
			this._campSelecionada.setValueState("None");

			sap.ui.getCore().byId("buscarCampanya").setValue("");
			oEvent.getSource().removeSelections();

			this.onPressCerrarCampanyas();
		},


		/**
		 * @desc Filters the list of available items based on the string entered in the search field.
		 * It filters by <i><b>"Codigo"</i></b> and <i><b>"Nombre"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */

		onBuscarProveedor: function (oEvent) {
			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, valorBuscar),
						new sap.ui.model.Filter("Nombre", sap.ui.model.FilterOperator.Contains, valorBuscar),
						new sap.ui.model.Filter("Stcd1", sap.ui.model.FilterOperator.Contains, valorBuscar)],
					and: false
				});

			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaProveedores");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}
		},

		/**
		 * @desc Filters the list of available items based on the string entered in the search field.
		 * It filters by <i><b>"Codigo"</i></b> and <i><b>"Descripcion"</i></b>.
		 * @param {Object} oEvent - Object that contains the entered value in the search field.
		 */

		onBuscarCampanya: function (oEvent) {

			var valorBuscar = oEvent.getSource().getValue();
			if (valorBuscar != "") {
				var aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("Descripcion", sap.ui.model.FilterOperator.Contains, valorBuscar),
						new sap.ui.model.Filter("Codigo", sap.ui.model.FilterOperator.Contains, valorBuscar)],
					and: false
				});

			} else {
				var aFilters = null;
			}

			var listaMateriales = sap.ui.getCore().byId("listaCampanyas");
			var binding = listaMateriales.getBinding("items");
			if (binding) {
				binding.filter(aFilters);
			}

		},

		/**
		 * @desc Checks if the text area is not empty.
		 * @param {Object} oEvent - Object that contains the entered value in the text area.
		 */
		onLiveChangeTexto: function (oEvent) {
			(oEvent.getParameter("value") !== "") ? oEvent.getSource().setValueState("None") : "";
		},

		/**
		 * @desc Checks if the text area is not empty.
		 * @param {Object} oEvent - Object that contains the entered value in the text area.
		 */
		onLiveChangeProveedor: function (oEvent) {
			(oEvent.getParameter("value") == "") ? oEvent.getSource().setDescription("") : "";
			(oEvent.getParameter("value") !== "") ? oEvent.getSource().setValueState("None") : "";
		},

		/**
		 * @desc Checks if the text area is not empty.
		 * @param {Object} oEvent - Object that contains the entered value in the text area.
		 */
		onLiveChangeCampanya: function (oEvent) {
			(oEvent.getParameter("value") !== "") ? oEvent.getSource().setValueState("None") : "";
			(oEvent.getParameter("value") == "") ? oEvent.getSource().setDescription("-") : "";
		},

		/**
		 * @desc Checks each of the fields that are required to generate the order header and creates an object with all the collected header data. 
		 * Finally it calls the <b> onSubmitPedido(oParametros) </b> function with the header data as a parameter.
		 * @see #~onSubmitPedido
		 */

		//Funcionalidad Realizar Pedido Compras
		onPressFinalizar: function () {
			this.getView().getModel("modeloDatos").setUseBatch(true);

			var oView = this.getView();
			var cabeceraData = oView.getModel("local").getData().sPerfil;
			var lifnr = oView.byId("idProveedor").getValue();
			var txtClas = oView.byId("idTextoClasificacion").getValue();
			var codCamp = oView.byId("seleccionCampanya").getValue();
			var currency = this._currency.getSelectedKey();
			var perfil = oView.byId("selectPerfil").getSelectedItem().getKey();
			var textoAmpliado = oView.getModel("local").getData().sTextoAmpliado;


			if (this._PedidoVentas) {
				lifnr = "";
				var solicitante = oView.byId("idSolicitante").getValue();
				if (solicitante === "") {
					sap.m.MessageBox.error("Debe informar el solicitante");
					return;
				}
				
			}

			/* if (cabeceraData.ContactoInterno === ""){
				sap.m.MessageBox.error("Debe informar el Contacto Interno");
				return;
			} */
			
			if (oView.byId("idProveedor").getValue() == "" || !this.comprobarCampanya()) {
				this._showToast(this._getText("CamposVacios"));
				oView.byId("idProveedor").getValue() == "" ? oView.byId("idProveedor").setValueState("Error") : oView.byId("idProveedor").setValueState("None");
				oView.byId("seleccionCampanya").getValue() == "" ? oView.byId("seleccionCampanya").setValueState("Error") : oView.byId("seleccionCampanya").setValueState("None");
				return;
			}

			if (oView.byId("idTextoClasificacion").getRequired() && oView.byId("idTextoClasificacion").getValue() === "") {
				this._showToast("Texto obligatorio para el perfil seleccionado");
				oView.byId("idTextoClasificacion").setValueState("Error");
				return;
			} else {
				oView.byId("idTextoClasificacion").setValueState("None");
			}
			//			if(oView.byId("idProveedor").getValue() =="" || oView.byId("idTextoClasificacion").getValue()=="" || !this.comprobarCampanya()){
			//				this._showToast(this._getText("CamposVacios"));
			//				oView.byId("idProveedor").getValue() =="" ? oView.byId("idProveedor").setValueState("Error") : oView.byId("idProveedor").setValueState("None");
			//				oView.byId("idTextoClasificacion").getValue()=="" ? oView.byId("idTextoClasificacion").setValueState("Error"):oView.byId("idTextoClasificacion").setValueState("None");
			//				oView.byId("seleccionCampanya").getValue() =="" ? oView.byId("seleccionCampanya").setValueState("Error") : oView.byId("seleccionCampanya").setValueState("None");
			//				return;
			//			}


			var oParametros = {

				Sociedad: cabeceraData.Sociedad,
				ClasePedido: cabeceraData.ClasePedido,
				CodigoProveedor: lifnr,
				GrupoCompras: cabeceraData.GrupoCompras,
				Vendedor: txtClas,
				CodigoCampanya: codCamp,
				Usuario: "",
				Moneda: currency,
				Perfil: perfil,
				TextoAmpliado: textoAmpliado,
				Solicitante: solicitante,
				ContactoInterno: cabeceraData.ContactoInterno
			};

			this.onSubmitPedido(oParametros);

		},

		/**
		 * @desc Creates an ABAP entry with the order header and one for each position of the order with the corresponding data. 
		 * Then, the creation of the order is launched through the submitChanges() function. 
		 * Finally, through the call to onOrderDialog, a message is displayed with the result of the creation of the order.
		 * @param {Object} oParametros - Object that contains the purchase order header data.
		 */

		onSubmitPedido: function (oParametros) {

			var oContext;
			var completo = true;
			for (var importVar in oParametros) {
				if (oParametros.hasOwnProperty(importVar)) {
					if (oParametros[importVar] == "" || oParametros[importVar] == null) {
						completo = false;
					}
				}
			}
			if (!completo) { //CAMBIAR CUANDO ESTE CLARO CAMPA�AS
				this.getView().setBusy(true);
				oContext = this.getView().getModel("modeloDatos").createEntry("/CabeceraPedidoSet", {

					properties: oParametros,
					success: jQuery.proxy(function (oData, oResponse) {
						//					this.getView().setBusy(false);
						//					this._showMensaje(this._getText("respuestaPedido") + oData.NumPedido);


					}, this),
					error: jQuery.proxy(function (oError) {
						//			    	this.getView().setBusy(false);											
						//			    	this._SAPError(oError);


					}, this)
				});

				//Comprobamos que exista alguna posici�n en el pedido.
				if (!this._getSesionUsuario() || this._getSesionUsuario().length == 0) {
					this.getView().setBusy(false);
					this._showToast(this._getText("PosicionesVacias"));
					return;
				}

				for (var oItem in this._getSesionUsuario()) {
					var item = this._getSesionUsuario()[oItem];
					//TODO modificaci�n para enviar la fecha correcta
					var fechaTemp = new Date(item.Fecha);
					var fechaPosicion = new Date(Date.UTC(fechaTemp.getFullYear(), fechaTemp.getMonth(), fechaTemp.getDate(), 1, 0, 0))

					var oParametro = {
						CuentaMayor: item.CuentaMayor,
						Fecha: fechaPosicion,
						ActivoFijo: item.ActivoFijo,
						TipoImputacion: item.TipoImputacion,
						CodigoMaterial: item.CodigoMaterial,
						Descripcion: item.Descripcion,
						Cantidad: item.Cantidad,
						Precio: item.Precio,
						Centro: item.Centro,
						Almacen: item.Almacen,
						GrupoArticulos: item.GrupoArticulos,
						Unidad: item.UnidadBase,
						CentroCoste: item.CentroCoste


					}

					console.log(oParametro);
					oContext = this.getView().getModel("modeloDatos").createEntry("/PosicionesPedidoSet", {

						properties: oParametro,
						success: jQuery.proxy(function (oData, oResponse) {
							//						this.getView().setBusy(false);
							//						this._showMensaje(this._getText("respuestaPedido") + oData.NumPedido);


						}, this),
						error: jQuery.proxy(function (oError) {
							//				    	this.getView().setBusy(false);											
							//				    	this._SAPError(oError);


						}, this)
					});

				}
				this.getView().getModel("modeloDatos").submitChanges({

					success: jQuery.proxy(function (oData, oResponse) {

						this.getView().setBusy(false);
						this.getView().getModel("modeloDatos").resetChanges();
						var oResponse = oData.__batchResponses[0].response;

						console.log("Resultados:");
						console.log(oResponse);

						if (oResponse && (oResponse.statusCode === "400" || oResponse.statusCode === "500")) {
							var aError = JSON.parse(oResponse.body).error.innererror.errordetails;
							console.log(aError);
							var respuesta = "";
							for (var oError in aError) {
								if (aError[oError].code == "06/017") {
									this.onDialogPedido(aError[oError].message)
									//								this._showMensaje(aError[oError].message);
									var correcto = true;
									var vSesion = this._getSesionUsuario();
									vSesion = [];
									this._sesionUsuario(vSesion);
									this.getView().getModel("posiciones").setData([]);
									this.getView().setBusy(false);
								} else if (aError[oError].code == "V1/311") {
									this.onDialogPedido(aError[oError].message)
									var correcto = true;
									var vSesion = this._getSesionUsuario();
									vSesion = [];
									this._sesionUsuario(vSesion);
									this.getView().getModel("posiciones").setData([]);
									this.getView().setBusy(false);
								} else if (aError[oError].severity == "error") {
									if (aError[oError].message != "" || aError[oError].message != undefined) { respuesta += aError[oError].message + ".\n" };
								}
								if (aError[oError].code == "ZGMM_401_MENSAJES/016" && aError[oError].severity == "warning") {
									this._showWarning(aError[oError].message);

								}
							}
							if (!correcto) {
								this._showMensaje(respuesta);
								this.getView().setBusy(false);
							} else {
								//eliminamos los valores de los campos en caso de crearse correctamente
								this.getView().byId("idProveedor").setValue("");
								this.getView().byId("idProveedor").setDescription("");
								this.getView().byId("idTextoClasificacion").setValue("");
								this.getView().byId("idProveedor").setValueState("None");
								this.getView().byId("idTextoClasificacion").setValueState("None");
								this.getView().byId("seleccionCampanya").setValue("");
								this.getView().byId("seleccionCampanya").setDescription("-");
								this.getView().byId("seleccionCampanya").setValueState("None");
								//Borramos el texto ampliado de la cabecera
								sap.ui.getCore().byId("textoAmpliado") ? sap.ui.getCore().byId("textoAmpliado").setValue("") : "";
								this.getView().getModel("local").setProperty("/sTextoAmpliado", "");
								//Borramos el Contacto Interno
								this.getView().getModel("local").setProperty("/sPerfil/ContactoInterno", "");
								this.ModificarPantalla();
							}

						} else {
							this._showMensaje(this._getText("respuestaPedidoMultiple"));
							//this.resetViewData();
						}
						this.getView().setBusy(false);


					}, this),
					error: jQuery.proxy(function (oError) {
						this.getView().setBusy(false);
						try {
							this._SAPError(oError);
						}
						catch (err) {
							sap.m.MessageBox.error("Error en submiChanges", {
								details: err
							});
						}
						this.getView().getModel("modeloDatos").resetChanges();


					}, this)
				});

			} else {
				this._showToast(this._getText("errorPedido"));

			}


		},

		/**
		 * @desc Generates an informative dialog with the message that receives as parameter and includes a button that allows to display the generated purchase order in a pdf.
		 * @param {String} textoMensaje - This parameter contains the message string to show in the dialog.
		 */

		onDialogPedido: function (textoMensaje) {

			var numPedido = textoMensaje.match(/(\d+)/g);
			var urlOData = this.getView().getModel("modeloDatos").sServiceUrl;
			var urlPdf = "";
			if (numPedido[0]) {
				urlPdf = urlOData + "/PedidoPDFSet('" + numPedido[0] + "')/$value";
			}

			var esCompra = !this._PedidoVentas;

			var dialog = new sap.m.Dialog({
				title: this._getText("TituloDialogoPedido"),
				type: 'Message',
				content: [
					new sap.m.Text({ text: textoMensaje }),
					//					new Label({ text: 'Are you sure you want to reject your shopping cart?', labelFor: 'rejectDialogTextarea'}),
					//					new TextArea('rejectDialogTextarea', {
					//						width: '100%',
					//						placeholder: 'Add note (optional)'
					//					})
				],
				beginButton: new sap.m.Button({
					text: this._getText("BotonAceptar"),
					press: function () {
						//						sap.m.MessageToast.show("Boton Aceptar");
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: this._getText("BotonPDF"),
					visible: esCompra,
					press: function () {
						//						sap.m.MessageToast.show("Boton PDF");
						(numPedido.length > 0) ? sap.m.URLHelper.redirect(urlPdf, true) : sap.m.MessageToast.show("PedidoDesconocido");;
						//						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},


		/**
		 * @desc Determines whether the CeCo input could be modified in the position dialogs.
		 * @param {String} ceCoFlag - If the string contains "X", the input will allow modifications.
		 * @return {boolean} Value that determines if the CeCo input will be modificable.
		 */

		ceCoFormatter: function (ceCoFlag) {
			switch (ceCoFlag) {
				case "":
					return false;
				case "X":
					return true;

			}
		},

		/**
		 * @desc Determines if the "Activo Fijo" input will be visible. This happens when the selected "Tipo de imputaci�n" value is 'A'.
		 * @param {String} tipoImp - If the string contains "A", the "Activo Fijo" input will be visible.
		 * @return {boolean} Value that determines if the "Activo Fijo" input will be visible.
		 */

		activoFormatter: function (tipoImp) {

			if (tipoImp == "A") {
				return true;
			} else {
				return false;
			}
		},

		/**
		 * @desc It controls that the "Campa�a" input has been filled when it is mandatory.
		 */

		comprobarCampanya: function () {
			var campObli = this.getView().getModel("local").getData().sPerfil.CampOblig;
			var campanya = this.getView().byId("seleccionCampanya").getValue();
			if (campObli == 'X' && campanya == "") {
				this._showToast(this._getText("ValidaCampanya"));
				return false;
			} else {
				return true;
			}


		},


		/// OBTENCI�N DE DATOS. ////

		/**
		 * @desc Gets the data from all available profiles and sets the default profile for the user.
		 */

		obtenerDatosPerfiles: function () {

			this.getView().getModel("modeloDatos").setUseBatch(false);
			var oView = this.getView();
			oView.setBusy(true);
			var oController = this;

			this.getView().getModel("modeloDatos").read("/PerfilesSet", {
				success: function (oData) {
					console.log(oData);
					oView.setBusy(false);
					oController.getView().setModel(new JSONModel(oData.results), "perfiles");
					for (var item in oData.results) {
						if (oData.results[item].ClavePerfil == 'X') {
							this.getView().byId("selectPerfil").setSelectedKey(oData.results[item].Codigo);
							this.getView().getModel("local").setProperty("/sPerfil", oData.results[item]);
							this.getView().getModel("local").setProperty("/sCeCo", oData.results[item].CentroCoste);
							if (oData.results[item].CampOblig !== "") {
								this.getView().byId("seleccionCampanya").setVisible(true);
								this.getView().byId("campanyaLabel").setVisible(true);
								this.getView().byId("seleccionCampanya").setValue(oData.results[item].CodCamp);
								if (oData.results[item].DescCamp == "") {
									this.getView().byId("seleccionCampanya").setDescription("-");
								} else {
									this.getView().byId("seleccionCampanya").setDescription(oData.results[item].DescCamp);
								}

							}

							if (oData.results[item].TextoObligatorio === "X" || oData.results[item].TextoObligatorio === true) {
								this.getView().byId("idTextoClasificacion").setRequired(true);
							} else {
								this.getView().byId("idTextoClasificacion").setRequired(false);
							}

							this._PerfilActivo = oData.results[item];
							this.ModificarPantalla();
						}


					}

				}.bind(this),
				error: jQuery.proxy(function (e) {
					oView.setBusy(false);
					oController._SAPError(e);
				}, this)
			});


		},


		/**
		 * @desc Gets the data from all available campaigns filtering by CeCo and fills the "campanyas" model with it.
		 *	
		 */

		obtenerDatosCampanya: function () {

			var oView = this.getView();
			var oController = this;
			var oPerfil = this.getView().getModel("local").getProperty("/sPerfil");
			oView.setBusy(true);

			this.getView().getModel("modeloDatos").read("/CampanyaSet", {
				filters: [
					new sap.ui.model.Filter({
						path: "Ceco",
						operator: "EQ",
						value1: oPerfil.CentroCoste
					}),

				],
				success: function (oData) {
					var oModel3 = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(oModel3, "campanyas");
					oView.setBusy(false);
					this._oVHCampanya.open();

					//panel.setBusy(false);
				}.bind(this),
				error: jQuery.proxy(function (e) {
					oView.setBusy(false);
					oController._SAPError(e);
				}, this)
			});


		},

		/**
		 * @desc Controls the filter change in the "proveedores" model, by clicking on one part of the SegmentedButton and calling the "obtenerDatosProveedor" function.
		 * @param {Object} oEvent - Object that contains the newValue for the "proveedores" filter.
		 */

		onSwitchProveedor: function (oEvent) {
			sap.ui.getCore().byId("listaProveedores").setBusy(true);
			if (oEvent.getParameter("key") == "ALL") {
				this.getView().getModel("local").setProperty("/switchProveedor", "ALL");
			} else {
				this.getView().getModel("local").setProperty("/switchProveedor", "BUSAB");
			}
			this.oView.getController().obtenerDatosProveedores();

		},

		/**
		 * @desc Gets the data from all available providers filtering by society and responsible and fills the "proveedores" model with it.
		 *	
		 */

		obtenerDatosProveedores: function () {
			var responsable;
			var oPerfil = this.getView().getModel("local").getProperty("/sPerfil");
			if (this.getView().getModel("local").getProperty("/switchProveedor") === "ALL") {
				responsable = ""
			} else {
				responsable = oPerfil.Responsable;
			}
			var oView = this.getView();
			oView.setBusy(true);
			var oController = this;


			//var panel = this.getView().byId("panelesGrid");
			//panel.setBusy(true);

			this.getView().getModel("modeloDatos").read("/ProveedoresSet", {
				filters: [
					new sap.ui.model.Filter({
						path: "Sociedad",
						operator: "EQ",
						value1: oPerfil.Sociedad
					}),
					new sap.ui.model.Filter({
						path: "Responsable",
						operator: "EQ",
						value1: responsable
					}),
					//MTEN 06.07.2017 - A�adimos filtro por clasePedido
					new sap.ui.model.Filter({
						path: "ClasePedido",
						operator: "EQ",
						value1: oPerfil.ClasePedido
					}),
				],
				success: function (oData) {
					oView.setBusy(false);
					var oModel2 = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(oModel2, "proveedores");
					sap.ui.getCore().byId("listaProveedores").setBusy(false);
					if (!this._oVHProveedor.isOpen()) this._oVHProveedor.open();


					//panel.setBusy(false);
				}.bind(this),
				error: jQuery.proxy(function (e) {
					//	panel.setBusy(false);
					oView.setBusy(false);
					sap.ui.getCore().byId("listaProveedores").setBusy(false);
					var oModel2 = new sap.ui.model.json.JSONModel();
					this.getView().setModel(oModel2, "proveedores");
					if (!this._oVHProveedor.isOpen()) this._oVHProveedor.open();
					oController._SAPError(e);
				}, this)
			});


		},

		/**
		 * @desc Gets the data from all available materials filtering by center and material type and fills the "productos" model with it.
		 *	
		 */

		obtenerDatosMateriales: function () {

			var oView = this.getView();
			(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(true) : "";
			(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(true) : "";
			(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(true) : "";
			var oController = this;
			var oPerfil = this.getView().getModel("local").getProperty("/sPerfil");
			var centro;


			switch (oPerfil.Sociedad) {
				case "SNAC":
					centro = "GA01";
					break;
				case "GREF":
					centro = "GCEN";
					break;
				case "MASQ":
					centro = "GMQP";
					break;
			};
			//var panel = this.getView().byId("panelesGrid");
			//panel.setBusy(true);

			this.getView().getModel("modeloDatos").read("/MaterialesSet", {
				filters: [
					new sap.ui.model.Filter({
						path: "TipoMaterial",
						operator: "EQ",
						value1: oPerfil.TipoMat
					}),
					new sap.ui.model.Filter({
						path: "Centro",
						operator: "EQ",
						value1: centro
					})
				],
				success: function (oData) {
					var oModel2 = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(oModel2, "productos");
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";

					//panel.setBusy(false);
				}.bind(this),
				error: jQuery.proxy(function (e) {
					//	panel.setBusy(false);
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					oController._SAPError(e);
				}, this)
			});


		},

		/**
		 * @desc Gets the data from all available costs centers and fills the "ceCos" model with it.
		 *	
		 */

		obtenerDatosCeCos: function () {

			var oView = this.getView();
			var oController = this;
			//var panel = this.getView().byId("panelesGrid");
			//panel.setBusy(true);
			(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(true) : "";
			(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(true) : "";
			(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(true) : "";

			this.getView().getModel("modeloDatos").read("/CecoSet", {
				success: function (oData) {
					var oModel5 = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(oModel5, "ceCos");
					this._oDialogCeCo.open();
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					//panel.setBusy(false);
				}.bind(this),
				error: jQuery.proxy(function (e) {
					//	panel.setBusy(false);
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					oController._SAPError(e);
				}, this)
			});


		},

		/**
		 * @desc Gets the data from all available fixed assets filtering by society and provider and fills the "activos" model with it.
		 *	
		 */

		obtenerDatosActivos: function () {

			var oView = this.getView();
			var oController = this;
			var proveedor = oView.byId("idProveedor").getValue();
			var oPerfil = this.getView().getModel("local").getProperty("/sPerfil");
			(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(true) : "";
			(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(true) : "";
			(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(true) : "";

			this.getView().getModel("modeloDatos").read("/ActivoFijoSet", {
				filters: [
					new sap.ui.model.Filter({
						path: "Sociedad",
						operator: "EQ",
						value1: oPerfil.Sociedad
					}),
					new sap.ui.model.Filter({
						path: "Proveedor",
						operator: "EQ",
						value1: proveedor
					})
				],
				success: function (oData) {
					var oModel5 = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(oModel5, "activos");
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					this._oDialogActivo.open();
					//panel.setBusy(false);
				}.bind(this),
				error: jQuery.proxy(function (e) {
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					//	panel.setBusy(false);
					oController._SAPError(e);
				}, this)
			});


		},

		/**
		 * @desc Gets the data from all available purchase order types and fills the "claseDocumento" model with it.
		 *	
		 */

		obtenerDatosClDoc: function () {

			var oView = this.getView();
			var oController = this;
			(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(true) : "";

			this.getView().getModel("modeloDatos").read("/ClaseDocumentoSet", {
				success: function (oData) {
					var oModel6 = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(oModel6, "claseDocumento");
					(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(false) : "";
					this._oDialogClDoc.open();

				}.bind(this),
				error: jQuery.proxy(function (e) {
					(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(false) : "";

					oController._SAPError(e);
				}, this)
			});


		},


		/**
		* @desc Gets the data from all available purchase groups and fills the "grupoCompras" model with it.
		*	
		*/

		obtenerDatosGrupo: function () {

			var oView = this.getView();
			var oController = this;
			(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(true) : "";
			(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(true) : "";
			(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(true) : "";
			(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(true) : "";

			this.getView().getModel("modeloDatos").read("/GrupoComprasSet", {
				success: function (oData) {
					var oModel7 = new sap.ui.model.json.JSONModel(oData.results);
					this.getView().setModel(oModel7, "grupoCompras");
					this._oDialogGrupoCompras.open();
					//panel.setBusy(false);
					(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(false) : "";
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
				}.bind(this),
				error: jQuery.proxy(function (e) {
					//	panel.setBusy(false);
					(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(false) : "";
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					oController._SAPError(e);
				}, this)
			});


		},

		/**
		* @desc Gets the data from all available material groups and fills the "grupoArticulos" model with it.
		*	
		*/

		obtenerDatosGrupoArticulos: function () {

			var oView = this.getView();
			var oController = this;
			(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(true) : "";
			(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(true) : "";
			(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(true) : "";
			this.getView().getModel("modeloDatos").read("/GrupoArticulosSet", {
				success: function (oData) {
					var oModel = new sap.ui.model.json.JSONModel(oData.results);
					oView.setModel(oModel, "grupoArticulos");
					this._oDialogGrupoArticulos.open();
					//panel.setBusy(false);
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
				}.bind(this),
				error: jQuery.proxy(function (e) {
					//	panel.setBusy(false);
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					oController._SAPError(e);
				}, this)
			});


		},

		/**
		* @desc Gets the data from all available account assignment categories.
		*	
		*/

		obtenerDatosTiposImposicion: function () {

			var oView = this.getView();
			var oController = this;
			(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(true) : "";
			(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(true) : "";
			(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(true) : "";
			(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(true) : "";

			this.getView().getModel("modeloDatos").read("/TipoImputacionesSet", {
				success: function (oData) {
					var oModel = new sap.ui.model.json.JSONModel(oData.results);
					oView.setModel(oModel, "tipos");
					this._oDialogTipoImputacion.open();
					(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(false) : "";
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					//panel.setBusy(false);
				}.bind(this),
				error: jQuery.proxy(function (e) {
					//	panel.setBusy(false);
					(this._oDialogPerfil && this._oDialogPerfil.isOpen()) ? this._oDialogPerfil.setBusy(false) : "";
					(this._oDialogPosicionAdd && this._oDialogPosicionAdd.isOpen()) ? this._oDialogPosicionAdd.setBusy(false) : "";
					(this._oDialogPosicion && this._oDialogPosicion.isOpen()) ? this._oDialogPosicion.setBusy(false) : "";
					(this._oDialogMultiple && this._oDialogMultiple.isOpen()) ? this._oDialogMultiple.setBusy(false) : "";
					oController._SAPError(e);
				}, this)
			});


		},


		/**
		* @desc Generates the dialog to add a new position to the order, loading the corresponding data from the selected profile.
		*  It also creates the new "multiple" model, which will contain each of the positions of a multiple order.	
		*/

		onPressMultiple: function () {

			var oView = this.getView();
			if (oView.byId("idProveedor").getValue() == "" || !this.comprobarCampanya()) {
				this._showToast(this._getText("CamposVacios"));
				oView.byId("idProveedor").getValue() == "" ? oView.byId("idProveedor").setValueState("Error") : oView.byId("idProveedor").setValueState("None");
				oView.byId("seleccionCampanya").getValue() == "" ? oView.byId("seleccionCampanya").setValueState("Error") : oView.byId("seleccionCampanya").setValueState("None");
				return;
			}

			oView.setBusy(true);
			this.obtenerDatosMateriales();

			if (this._oDialogMultiple === undefined) {
				this._oDialogMultiple = sap.ui.xmlfragment(
					"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.Multiple", this);
				try {
					this.getView().addDependent(this._oDialogMultiple);
				} catch (err) {
					console.log(err);
					sap.m.MessageBox.error(err);
				}
			}



			//creamos variables para guardar datos posicion nueva

			this._idMaterialMult = sap.ui.getCore().byId("idMaterialMult");
			this._nombreMaterialMult = sap.ui.getCore().byId("nombreMaterialMult");
			this._tipoSeleccionadoMult = sap.ui.getCore().byId("tipoImputacionPosMult");
			this._cecoSeleccionadoMult = sap.ui.getCore().byId("idCeCoMult");
			this._idActivoMult = sap.ui.getCore().byId("idActivoMult");
			this._unidadMaterial = undefined;


			//Usamos la variable por defecto de la imputacion
			var oMultiPerfil = this.getView().getModel("local").getData().sPerfil;
			sap.ui.getCore().byId("tipoImputacionPosMult").setValue(oMultiPerfil.TipoImputacion);
			sap.ui.getCore().byId("tipoImputacionPosMult").setDescription(oMultiPerfil.DescTipoImp);
			sap.ui.getCore().byId("idCeCoMult").setValue(oMultiPerfil.CentroCoste);
			sap.ui.getCore().byId("idCeCoMult").setDescription(oMultiPerfil.DescCeco);
			sap.ui.getCore().byId("idGrupoArticuloMult").setEnabled(true);
			sap.ui.getCore().byId("idGrupoArticuloMult").setValue(oMultiPerfil.GrupoArticulos);
			sap.ui.getCore().byId("idGrupoArticuloMult").setDescription(oMultiPerfil.DescGrupoArt);
			sap.ui.getCore().byId("idMaterialMult").setValue("");
			sap.ui.getCore().byId("nombreMaterialMult").setValue("");
			sap.ui.getCore().byId("nombreMaterialMult").setValueState("None");
			(oMultiPerfil.TipoImputacion == "A") ? sap.ui.getCore().byId("idActivoMult").setVisible(true) : sap.ui.getCore().byId("idActivoMult").setVisible(false);
			(oMultiPerfil.TipoImputacion == "A") ? sap.ui.getCore().byId("idActivoMult").setValue(oMultiPerfil.ActivoFijo) : sap.ui.getCore().byId("idActivoMult").setValue("");
			(oMultiPerfil.TipoImputacion == "A") ? sap.ui.getCore().byId("idActivoMult").setDescription(oMultiPerfil.DescActivoFijo) : sap.ui.getCore().byId("idActivoMult").setDescription("");


			if (this._PedidoVentas) {
				sap.ui.getCore().byId("tipoImputacionPosMult").setVisible(false);
			} else if (sap.ui.getCore().byId("tipoImputacionPosMult").getVisible()) {
				sap.ui.getCore().byId("tipoImputacionPosMult").setVisible(true);
			}

			var oMultiple = this.getView().getModel("multiple");
			if (!oMultiple || jQuery.isEmptyObject(oMultiple)) {
				var oModel = new sap.ui.model.json.JSONModel([]);
				this.getView().setModel(oModel, "multiple");
			}

			oView.setBusy(false);
			sap.ui.getCore().byId("idMaterialMult").setValueState("None");
			sap.ui.getCore().byId("nombreMaterialMult").setValueState("None");
			this._oDialogMultiple.open();

		},

		/**
		* @desc Resets the dialog input fields and closes the "oDialogMultple" dialog.
		*  
		*/

		onFinPosicionMultipleAdd: function () {

			(this._cantidadMult) ? this._cantidadMult.setValue("1") : this._cantidadMult = undefined;
			(this._precioMult) ? this._precioMult.setValue("") : this._precioMult = undefined;
			(this._fechaMult) ? this._fechaMult.setValue("") : this._fechaMult = undefined;

			this._oDialogPosAddMult.close();
			this._oDialogPosAddMult.destroy();   //APC  
			this._oDialogPosAddMult = undefined; //APC					
		},

		/**
		* @desc Generates and opens the dialog to add the details of a new position in a multiple order.
		*  
		*/

		onPressMultipleNewPos: function () {

			if (this._oDialogPosAddMult === undefined) {
				try {
					this._oDialogPosAddMult = sap.ui.xmlfragment(
						"es.seidor.grefusa.pedidoscompraGrefusa-captacionpedidos2compra.view.fragments.PosicionAddMult", this);

					this.getView().addDependent(this._oDialogPosAddMult);
				} catch (err) {
					console.log(err);
					sap.m.MessageBox.error(err);
				}
			}

			this._cantidadMult = sap.ui.getCore().byId("cantidadMult");
			this._precioMult = sap.ui.getCore().byId("precioMult");
			this._fechaMult = sap.ui.getCore().byId("fechaMult");
			this._cantidadMult.setValueState("None");
			(this._unidadMaterial) ? this._cantidadMult.setDescription(this._unidadMaterial) : this._cantidadMult.setDescription("UND")
			try {
				if (!this._unidadMaterial) {
					var idMat = this._idMaterial.getValue();

					this._unidadMaterial = this.getView().getModel("productos").oData.find(item => item.Codigo === idMat).Unidad;

				} }
			catch(err) { }

				this._precioMult.setValueState("None");
				this._fechaMult.setValueState("None");

				if (this._PedidoVentas) {
					this._precioMult.setVisible(false);
					this._fechaMult.setVisible(false);
					this._cantidadMult.setDescription("");
					sap.ui.getCore().byId("comboUnidad").setVisible(true);
					sap.ui.getCore().byId("comboUnidad").setSelectedKey(this._unidadMaterial);
				}

				this._oDialogPosAddMult.open();
			},


			/**
			* @desc Deletes the selected position in a multiple order.
			* @param {Object} oEvent - Object that contains the information of the position to delete.   
			*/

			onPressBorrarMult: function (oEvent) {

				var sPath = oEvent.getParameters().listItem.getBindingContextPath("multiple");
				var index = sPath.substr(sPath.lastIndexOf("/") + 1);
				var oModel = this.getView().getModel("multiple");
				var oData = oModel.getData();
				oData.splice(index, 1);
				oModel.refresh();

			},

			/**
			* @desc Collects the detailed data entered by the user and adds a new position to a multiple order using the "multiple" model.
			*/

			onPressPosicionMultipleAdd: function () {

				var cant = this._cantidadMult;
				var precio = this._precioMult;
				var fecha = this._fechaMult;

				if (this._PedidoVentas) {
					precio.setValue('0');
					if (cant.getValue() == "") {
						this._showToast(this._getText("CamposVacios"));
						(cant.getValue() == "") ? cant.setValueState("Error") : cant.setValueState("None");
						return;
					} else {
						(cant.getValue() == "") ? cant.setValueState("Error") : cant.setValueState("None");
					}
				} else {
					if (cant.getValue() == "" || precio.getValue() == "" || fecha.getValue() == "") {
						this._showToast(this._getText("CamposVacios"));
						(cant.getValue() == "") ? cant.setValueState("Error") : cant.setValueState("None");
						(precio.getValue() == "") ? precio.setValueState("Error") : precio.setValueState("None");
						(fecha.getValue() == "") ? fecha.setValueState("Error") : fecha.setValueState("None");
						return;
					} else {
						(cant.getValue() == "") ? cant.setValueState("Error") : cant.setValueState("None");
						(precio.getValue() == "") ? precio.setValueState("Error") : precio.setValueState("None");
						(fecha.getValue() == "") ? fecha.setValueState("Error") : fecha.setValueState("None");
					}
				}


				var oMultiple = this.getView().getModel("multiple").getData();
				var oDatosPos = {};

				oDatosPos.Cantidad = parseFloat(cant.getValue()).toString();
				if (this._PedidoVentas) {
					precio.setValue('0');
				} else {
					oDatosPos.Precio = parseFloat(precio.getValue()).toString();
				}


				//convertimos la fecha al d�a 1 del mes si no se informa el d�a y si la fecha es 
				//incorrecta seleccionamos la fecha actual
				if (this._PedidoVentas) {
					oDatosPos.Fecha = new Date();
				} else {
					var oFecha = fecha.getValue().split("/");
					if (oFecha.length == 2) {
						oDatosPos.Fecha = new Date(oFecha[0] + "/01/" + oFecha[1]);
					} else if (fecha.getDateValue() && oFecha.length == 3) {
						oDatosPos.Fecha = fecha.getDateValue();
					} else {
						this._showToast(this._getText("FechaIncorrecta"));
						oDatosPos.Fecha = new Date();
					}
					isNaN(oDatosPos.Fecha.getDate()) ? oDatosPos.Fecha = new Date() : "";
				}


				if (this._PedidoVentas) {
					oDatosPos.UnidadBase = sap.ui.getCore().byId("comboUnidad").getSelectedKey();
				} else {
					oDatosPos.UnidadBase = (this._unidadMaterial) ? this._unidadMaterial : "UND";
				}

				oMultiple.push(oDatosPos);
				this.oView.getModel("multiple").refresh();

				this.oView.getController().onFinPosicionMultipleAdd();

			},

			/**
			* @desc Adds to each of the positions of a multiple order the common information and stores the position data in the session storage.
			*  After that, closes the position add dialog.
			*/

			onPressAddMultiple: function () {

				//SE A�ADEN DATOS COMUNES.
				var oData = this.getView().getModel("posiciones").getData();
				var oMultiple = this.oView.getModel("multiple").getData();
				var bMaterialReq = this.oView.getModel("local").getData().sPerfil.MatnrReq === "" ? false : true;

				if (!this._nombreMaterialMult || this._nombreMaterialMult.getValue() == "" ||
					(bMaterialReq && (!this._idMaterialMult || this._idMaterialMult.getValue() == ""))) {
					this._showToast(this._getText("CamposVacios"));
					//mostramos los campos en caso de que los campos est�n vacios
					(sap.ui.getCore().byId("nombreMaterialMult").getValue() == "") ? sap.ui.getCore().byId("nombreMaterialMult").setValueState("Error") : sap.ui.getCore().byId("nombreMaterialMult").setValueState("None");
					if (bMaterialReq)
						(sap.ui.getCore().byId("idMaterialMult").getValue() == "") ? sap.ui.getCore().byId("idMaterialMult").setValueState("Error") : sap.ui.getCore().byId("idMaterialMult").setValueState("None");
					return;

				} else {
					(sap.ui.getCore().byId("nombreMaterialMult").getValue() == "") ? sap.ui.getCore().byId("nombreMaterialMult").setValueState("Error") : sap.ui.getCore().byId("nombreMaterialMult").setValueState("None");
					if (bMaterialReq)
						(sap.ui.getCore().byId("idMaterialMult").getValue() == "") ? sap.ui.getCore().byId("idMaterialMult").setValueState("Error") : sap.ui.getCore().byId("idMaterialMult").setValueState("None");
				}
				if (oMultiple.length == 0) {
					this._showToast(this._getText("PosicionesVacias"));
					//			sap.ui.getCore().byId("multipleList").setValueState("Error")
					return;
				} else {
					//			sap.ui.getCore().byId("multipleList").setValueState("None")

				}

				for (var iPos in oMultiple) {

					switch (this.getView().getModel("local").getProperty("/sPerfil").Sociedad) {
						case "SNAC":
							oMultiple[iPos].Almacen = "GA16";
							break;
						case "GREF":
							oMultiple[iPos].Almacen = "GC99";
							break;
						case "MASQ":
							oMultiple[iPos].Almacen = "MQ16";
							break;
					};

					switch (this.getView().getModel("local").getProperty("/sPerfil").Sociedad) {
						case "SNAC":
							oMultiple[iPos].Centro = "GA01";
							break;
						case "GREF":
							oMultiple[iPos].Centro = "GCEN";
							break;
						case "MASQ":
							oMultiple[iPos].Centro = "GMQP";
							break;
					};

					oMultiple[iPos].CentroCoste = sap.ui.getCore().byId("idCeCoMult").getValue();
					oMultiple[iPos].DescCentroCoste = sap.ui.getCore().byId("idCeCoMult").getDescription();
					oMultiple[iPos].CodigoMaterial = sap.ui.getCore().byId("idMaterialMult").getValue();
					oMultiple[iPos].Descripcion = sap.ui.getCore().byId("nombreMaterialMult").getValue();
					oMultiple[iPos].GrupoArticulos = (sap.ui.getCore().byId("idGrupoArticuloMult")) ? sap.ui.getCore().byId("idGrupoArticuloMult").getValue() : this.getView().getModel("local").getProperty("/sPerfil").GrupoArticulos;
					oMultiple[iPos].DescGrupoArt = (sap.ui.getCore().byId("idGrupoArticuloMult")) ? sap.ui.getCore().byId("idGrupoArticuloMult").getDescription() : this.getView().getModel("local").getProperty("/sPerfil").GrupoArticulos;
					oMultiple[iPos].TipoImputacion = sap.ui.getCore().byId("tipoImputacionPosMult").getValue();
					oMultiple[iPos].DescTipoImputacion = sap.ui.getCore().byId("tipoImputacionPosMult").getDescription();

					oMultiple[iPos].Unidad = (this._unidadMaterial) ? this._unidadMaterial : "UND";//(oMultiple[iPos].UnidadBase == "") ? oMultiple[iPos].UnidadBase: this._unidadMaterial;//"UND";
					oMultiple[iPos].ActivoFijo = (sap.ui.getCore().byId("idActivoMult").getValue() == "") ? this.getView().getModel("local").getProperty("/sPerfil").ActivoFijo : sap.ui.getCore().byId("idActivoMult").getValue();
					oMultiple[iPos].DescActivoFijo = (sap.ui.getCore().byId("idActivoMult").getDescription() == "") ? this.getView().getModel("local").getProperty("/sPerfil").DescActivoFijo : sap.ui.getCore().byId("idActivoMult").getDescription();
					oMultiple[iPos].CuentaMayor = this.getView().getModel("local").getProperty("/sPerfil").CuentaMayor;
					if (!oData) oData = [];
					oData.push(oMultiple[iPos]);
				}

				var vSesion = this._getSesionUsuario();
				vSesion = this.getView().getModel("posiciones").getData();

				this._sesionUsuario(vSesion);
				if (this._getSesionUsuario()) {
					this.getView().getModel("posiciones").setData(this._getSesionUsuario());

				}
				this.getView().getModel("posiciones").refresh();
				this.resetMultiple();
				this._oDialogMultiple.close()
				this._oDialogMultiple.destroy();   //APC  
				this._oDialogMultiple = undefined; //APC		
			},


			/**
			* @desc Resets all the input fields of the multiple order add dialog and empties the "multiple" model.
			*  
			*/

			resetMultiple: function () {

				this.getView().getModel("multiple").setData([]);
				this._tipoSeleccionadoMult.setValue("");
				this._idMaterialMult.setValue("");
				this._idMaterialMult.setDescription("-");
				this._nombreMaterialMult.setValue("");
				this._nombreMaterialMult.setDescription("");
				this._cecoSeleccionadoMult.setValue("");
			},


			/**
			* @desc Closes the position add dialog.
			*  
			*/

			onPressCancelarMultiple: function () {
				this.resetMultiple();
				this._oDialogMultiple.close();
				this._oDialogMultiple.destroy();   //APC  
				this._oDialogMultiple = undefined; //APC				

			},

			ModificarPantalla: function () {

				var pedPrev = this._PedidoVentas;
				this._PedidoVentas = false;
				var headers = this.getView().getModel("modeloDatos").mCustomHeaders;


				if (this._PerfilActivo) {
					headers.perfil = this._PerfilActivo.Codigo;
					if (this._PerfilActivo.ClasePedidoVentas !== "") {
						this._PedidoVentas = true;
						this.getView().byId("Page").setTitle("Captación pedidos de ventas")
						this.getView().byId("LabelProveedor").setText("Cliente");
						this.getView().byId("idProveedor").setValue(this._PerfilActivo.NombreCliente);
						this.getView().byId("idProveedor").setEnabled(false);
						this.getView().byId("idSolicitante").setVisible(true);

					}
					else if (this._PerfilActivo.ClasePedido !== "") {
						this.getView().byId("Page").setTitle("Captación pedidos de compra")
						this.getView().byId("idSolicitante").setVisible(false);
						if (!this.getView().byId("idProveedor").getEnabled()) {
							this.getView().byId("LabelProveedor").setText("Proveedor");
							this.getView().byId("idProveedor").setEnabled(true);
							this.getView().byId("idProveedor").setValue("");
						}
					}
				}

				headers.ventas = this._PedidoVentas;

				/*
				if (pedPrev != this._PedidoVentas ) {
					var vSesion = this._getSesionUsuario();
					vSesion = [];
					this._sesionUsuario(vSesion);
					this.getView().getModel("posiciones").setData([]);
				}
				*/

			}
		});
});