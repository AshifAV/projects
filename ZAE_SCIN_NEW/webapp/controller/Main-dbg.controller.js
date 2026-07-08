sap.ui.define([
	"com/globalintelli/ZAE_SCIN_NEW/controller/BaseController",
	"sap/ui/core/Fragment",
	"com/globalintelli/zae_flib/controller/aeUI5Utility",
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"com/globalintelli/zae_flib/controller/aeUtility/"
], function (BaseController, Fragment, aeUI5Utility, SearchField, Token, Filter, FilterOperator, typeString,
	ColumnListItem, Label, JSONModel, MessageBox, aeUtility) {
	"use strict";

	return BaseController.extend("com.globalintelli.ZAE_SCIN_NEW.controller.Main", {

		i18nPath: "i18n",

		aeUI5Util: new aeUI5Utility(),
		aeUtil: new aeUtility(),

		_valueHelpDialogs: [],

		onInit: function () {
			var that = this;
			var oView = that.getView();
			this._valueHelpDialogs = [];
			this.aeUtil.resetLibrary();
			this.aeUI5Util.setupMessageManager(this);
			this.aeUI5Util.resetLibrary();
			this.fnSetInitModel();
			this._fnButtonsIntial();
			this.oResourceModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			if (oHashChanger.getAppHash()) {
				var vTempArr = oHashChanger.getAppHash().split("/");
				var object;
				switch (vTempArr.length) {
				case 1:
					object = vTempArr[vTempArr.length - 1];
					if (object.split("=")[0] === "?sap-iapp-state") {
						BaseController.MainAppState = object.split("=")[object.split("=").length - 1];
					}

					break;

				case 2:
					object = JSON.parse(decodeURIComponent(vTempArr[vTempArr.length - 1]));
					if (object["sap-iapp-state"]) {
						BaseController.MainAppState = object["sap-iapp-state"];
					}

					break;

				}

			}

			if (BaseController.MainAppState) {
				var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
				var oSapUiComponet = sap.ui.component(sComponentId);
				sap.ushell.Container
					.getService("CrossApplicationNavigation")
					.getAppState(oSapUiComponet, BaseController.MainAppState)
					.done(function (oSavedAppState) {

						if (!oSavedAppState.getData()) {
							return;
						}

						var smartFilter = that.getView().byId("SCIN_smartFilterBar");
						var oPlantInput = that.getView().byId("SCIN_I01");
						// var oCategoryInput = that.getView().byId("SCIN_I02");
						var oInsurerInput = that.getView().byId("SCIN_I03");
						var oEquipmentInput = that.byId("EquipmentVH");
						if (oPlantInput && oSavedAppState.getData().Plant) {
							oPlantInput.setSelectedKey(oSavedAppState.getData().Plant);
						}
						if (oPlantInput && oSavedAppState.getData().Equipment) {
							var oEquiToken = new sap.m.Token({
								key: oSavedAppState.getData().Equipment,
								text: oSavedAppState.getData().EquipmentWithDesc,
							});
							oEquipmentInput.addToken(oEquiToken);
						}
						// if (oCategoryInput && oSavedAppState.getData().Category) {
						// 	oCategoryInput.setSelectedKey(oSavedAppState.getData().Category);
						// 	oCategoryInput.setValue(oSavedAppState.getData().Categoryval);
						// 	that.getView().getModel("mCustIdentification").setProperty("/CategoryFromHash", oSavedAppState.getData().Categoryval);
						// }
						if (oInsurerInput && oSavedAppState.getData().Insurer) {
							oInsurerInput.setSelectedKey(oSavedAppState.getData().Insurer);
						}

						if (smartFilter && oSavedAppState.getData()) {
							smartFilter.addEventDelegate({
								onAfterRendering: function (oEvent) {
									smartFilter.fireSearch();
								}
							}, this);
						}
					});
			}

			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribeOnce("MainView", "fnAfterNavigate", this.fnAfterNavigate, this);
			var oCreateCustomerData = {
				MainResults: [],
				CreateCustomerSalesOrg: [],
				CreateCustomerDivision: [],
				CreateCompanyData: [],
				CreateCompanySalesOrg: [],
				CreateCompanyDC: [],
				CreateCompanyDivison: []
			};
			var oJsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJsonModel, "mCreateCustomer");
			this.getView().getModel("mCreateCustomer").setProperty("/oCreateCustomerData", oCreateCustomerData);
		},

		_fnButtonsIntial: function () {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			this.getOwnerComponent().getModel().read("/ZAE_I_CustomerIdentification", {
				success: function (oData, response) {
					oModelData.customerInfo = oData.results[0];
				},
				error: function (oError) {
					var buttons;
				}

			});
		},

		onAfterRendering: function () {
			this.onInitChangeDocs();
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var oComponentData = this.getOwnerComponent().getComponentData()["startupParameters"];
			if (oModelData.DefaultData.length == 0) {
				// this.fnLoadDefaultData();
				sap.ushell.Container.getServiceAsync("UserDefaultParameterPersistence")
					.then(function (oUserDefaultParameterPersistenceService) {
						oUserDefaultParameterPersistenceService.loadParameterValue("Plant").done(function (obj) {
							if (!(oComponentData["Plant"] && oComponentData["Plant"].length > 0)) {
								this.Plant = obj.value;
								this.setDefaultValues();
							}
						}.bind(this));
						oUserDefaultParameterPersistenceService.loadParameterValue("SalesGroup").done(function (obj) {
							this.SalesGroup = obj.value;
							this.setDefaultValues();
						}.bind(this));
					}.bind(this));
			}

		},
		onEquipmentInputInitialized: function (oEvent) {
			var that = this;
			var oComponentData = this.getOwnerComponent().getComponentData()["startupParameters"];
			if (oComponentData["Plant"] && oComponentData["Plant"].length > 0) {
				that.Plant = oComponentData["Plant"][0]
			}
			if (oComponentData["Equipment"] && oComponentData["Equipment"].length > 0) {
				that.Equipment = oComponentData["Equipment"][0]
			}
			if (oComponentData["CampaignID"] && oComponentData["CampaignID"].length > 0) {
				that.CampaignID = oComponentData["CampaignID"][0]
			}
			if (oComponentData["cmpgn_extid"] && oComponentData["cmpgn_extid"].length > 0) {
				that.cmpgn_extid = oComponentData["cmpgn_extid"][0]
			}
			if (oComponentData["Opportunity"] && oComponentData["Opportunity"].length > 0) {
				that.Opportunity = oComponentData["Opportunity"][0]
			}
			if (oComponentData["Lead"] && oComponentData["Lead"].length > 0) {
				that.Lead = oComponentData["Lead"][0]
			}

			// var vHashURL = window.location.hash;
			// vHashURL = vHashURL.split("?")[1];
			// var vURLData;
			// if (vHashURL) {
			// 	vURLData = vHashURL.split("&");
			// 	for (var i = 0; i < vURLData.length; i++) {
			// 		if (vURLData[i].split("=")[0] === "Equipment") {
			// 			that.Equipment = vURLData[i].split("=")[1];
			// 		}
			// 		if (vURLData[i].split("=")[0] === "Plant") {
			// 			that.Plant = vURLData[i].split("=")[1];
			// 		}
			// 	}
			// }
			var oSmartFilterBar = oEvent.getSource();
			var oFilterGroupItems = oSmartFilterBar.getFilterGroupItems();
			if (oFilterGroupItems.length === 0) {
				// var title = that.geti18n("ERROR");
				// var message = that.geti18n("UNABLE_LOAD_OPPO_INPUT");
				// that.showMessage(title, message, "Error");
			} else {
				if (that.Equipment !== undefined && that.Equipment !== null) {
					var oToken = new sap.m.Token({
						key: that.Equipment,
						text: that.Equipment
					});
					var smartfilterBar = this.getView().byId("SCIN_smartFilterBar");
					var oppField = smartfilterBar.getControlByKey("Equipment");
					var Plant = smartfilterBar.getControlByKey("Plant");
					Plant.data("Plant", that.Plant);
					// Plant.setValue(that.Plant);
					Plant.setSelectedKey(that.Plant);
					oppField.setTokens([oToken]);
					smartfilterBar.fireSearch();
				}
			}
		},
		onMessagePopoverPress: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}

			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash1 = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash1);
			var custFunction = function (data, obj) {
				var hash;
				var SemanticObject = obj.getDescription() !== "" ? obj.getDescription() : "Appointment";
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				if (data.length <= 5) {
					var params = {
						"object_type": "BUS2000126"
					};
					params[SemanticObject] = data;
					hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: SemanticObject,
							action: "aeDisplay"
						},
						params: params

					})) || "";
				} else {
					hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "ServiceRequest",
							action: "aesDisplay"
						},
						params: {
							"object_type": "BUS2000223",
							"ServiceRequest": data

						}
					})) || "";
				}
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});
			};
			this.aeUI5Util.handleMessagePopoverPress(this, oEvent, custFunction);
		},

		fnSetInitModel: function () {
			var oModelData = {
				customerInfo: {
					isShowSCIN_B01: false,
					isShowSCIN_B02: false,
					isShowSCIN_B07: false,
					isShowSCIN_B08: false,
					isShowSCIN_B09: false,
					isShowSCIN_B13: false,
					isShowSCIN_B14: false,
					isShowSCIN_B16: false,
					isShowSCIN_B17: false,
					isShowSCIN_B22: false,
					isShowSCIN_B23: false,
					isShowSCIN_B18: false,
					isShowSCIN_B15: false,
					isShowSCIN_B27: false,
					isShowSCIN_B25: false,
					isShowSCIN_B28: false,
					isShowSCIN_B24: false,
					isShowSCIN_B04: false,
					isShowSCIN_B10: false,
					isShowSCIN_B12: false,
					isShowSCIN_B26: false,
					isShowSCIN_B05: false
				},
				vehicleHistory: {},
				uiOnly: {
					visible: {
						MessagePage: true,
						vBoxSearchResults: false,
						BTNSelctBP: false,
						BTNCreateContractPersonBP: false,
						NPSSandPDSSScore: false
					},
					enable: {
						EquipmentCreateButton: false,
						CustomerCreateButton: false,
						ContactPersonCreateButton: false,
						ExtendCustomerCreateButton: false
					}
				},
				TBLSalesAreaLength: 0,
				TBLOpenAppointment: 0,
				TBLContactPersonLength: 0,
				BPContactPersonList: [],
				ServiceRequestList: [],
				SchemaTransactionType: {
					RelForWarRecSC: false
				},
				PlantCompCode: {},
				ConcatinatedCategorizationSchemaTreeTableData: [],
				WorkShop: "",
				Category: [],
				CategoryLength: "",
				contactPersonselected: false,
				Insurer: "",
				Plant: "",
				CategoryFromHash: "",
				Equipment: "",
				MeasuringReading: null,
				DefaultData: [],
				SalesGroup: "",
				CreateAppointmentDirect: false,
				CreateServiceRequestDirect: false,
				VerifyDataCheck: false,
				//	VisibleFields: false,
				OpenAppointments: [],
				CreateComplaint: []
			};

			var oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.setData(oModelData);
			this.getView().setModel(oJsonModel, "mCustIdentification");

		},

		fnRestPageData: function () {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var oComponentData = this.getOwnerComponent().getComponentData()["startupParameters"];
			oModelData.uiOnly.visible.MessagePage = true;
			oModelData.uiOnly.visible.vBoxSearchResults = false;
			oModelData.uiOnly.visible.NPSSandPDSSScore = false;
			if (!oComponentData["Equipment"]) {
				this.byId("EquipmentVH").removeAllTokens();
			}
			this.getView().byId("SCIN_I02").setValue("");
			this.getView().byId("SCIN_I02").setSelectedKey("");
			this.getView().byId("SCIN_I03").setValue("");
			this.getView().byId("SCIN_I03").setSelectedKey("");
		},

		// fnLoadDefaultData: function () {
		// 	var that = this;
		// 	var oModel = this.getView().getModel("mCustIdentification");
		// 	var oModelData = oModel.getData();
		// 	var aFilters = [];
		// 	aFilters.push(new Filter({
		// 		filters: [
		// 			new Filter({
		// 				path: "ParameterID",
		// 				operator: sap.ui.model.FilterOperator.EQ,
		// 				value1: 'VKG'
		// 			}),
		// 			new Filter({
		// 				path: "ParameterID",
		// 				operator: sap.ui.model.FilterOperator.EQ,
		// 				value1: 'WRK'
		// 			})
		// 		],
		// 		and: false
		// 	}));
		// 	if (this.getView().getModel()) {
		// 		var oPlantInput = that.getView().byId("SCIN_I01");
		// 		oPlantInput.setBusy(true);
		// 		this.getView().getModel().read("/ZAE_I_UserMasterParameter", {
		// 			filters: aFilters,
		// 			urlParameters: {},
		// 			success: function (oData, response) {
		// 				oPlantInput.setBusy(false);
		// 				if (oData.results.length > 0) {
		// 					oModelData.DefaultData = oData.results;
		// 					that.setDefaultValues();
		// 				} else {
		// 					oModelData.DefaultData = [];
		// 				}
		// 			},
		// 			error: function (oError) {}

		// 		});
		// 	}

		// },

		setDefaultValues: function () {
			var that = this;
			var oPlantInput = that.getView().byId("SCIN_I01");
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			// for (var i = 0; i < oModelData.DefaultData.length; i++) {
			// 	if (oModelData.DefaultData[i].ParameterID === "WRK") {
			// 		if (!oPlantInput.getSelectedKey()) {
			// 			oPlantInput.setSelectedKey(oModelData.DefaultData[i].ParameterValue);
			// 		}
			// 	}
			// 	if (oModelData.DefaultData[i].ParameterID === "VKG") {
			// 		oModelData.SalesGroup = oModelData.DefaultData[i].ParameterValue;
			// 	}

			// }
			if (!oPlantInput.getSelectedKey()) {
				oModelData.WorkShop = this.Plant ? this.Plant : "";
				oPlantInput.setSelectedKey(this.Plant);
				oModel.setProperty("/EquipmentEnable", true);
			}
			oModelData.SalesGroup = this.SalesGroup ? this.SalesGroup : "";
			oModel.updateBindings(true);
		},

		onSearch: function (oEvent) {
			this.ServiceComplaintTab = false;
			this.ServiceHistoryTab = false;
			this.LegacyHistoryTab = false;
			this.ServiceContract = false;
			var LinkEquipment = this.getView().byId("SmartEqupiment");
			var vehiclehistoryTable = this.getView().byId("vehiclehistory").getTable();
			if (!this.getView().byId("SCIN_I01").getSelectedKey()) {
				return;
			}
			if (vehiclehistoryTable.getBinding("items")) {
				vehiclehistoryTable.destroyItems();
				this.getView().byId("vehiclehistory").getToolbar().getContent()[0].setText("Line Items(0)")
				vehiclehistoryTable.setNoDataText("To Start, Click on Load History");
			}
			var filter = [];
			filter.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, this.getView().byId("SCIN_I01").getSelectedKey()));
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			oModelData.CategoryLength = "";
			oModelData.Insurer = ""
			var that = this;
			if (this.byId("EquipmentVH").getTokens()[0].getProperty("key")) {
				filter.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, this.byId("EquipmentVH").getTokens()[0].getProperty(
					"key")));
			} else {
				return;
			}
			if (oModelData.Equipment !== filter[1].oValue1) {
				this.getView().byId("SCIN_I02").setValue("");
				this.getView().byId("SCIN_I02").setSelectedKey("");
				oModelData.CategoryFromHash = "";
			}
			oModel.setProperty("/Equipment", filter[1].oValue1);
			this.getView().setBusy(true);
			this.getView().getModel().read("/ZAE_I_Equipment_04", { //ZAE_C_LicenseNum_01
				filters: filter,
				urlParameters: {

					$expand: ["to_EquipmentRecall", "to_ServiceHistory", "to_MeasuringDocument", "to_EquipmentContStsB5",
						// "to_EquipmentWarrantyStatus", "to_EquipmentWarrantyStatusOEM", "to_EQUIPMENTCURRCONTSTS, "to_SmartServiceContract",",
						"to_ServiceContract01", "to_ServiceContractNew/to_Item_01", "to_EquipmentVBAPSOTagData", "to_InsuranceDetails"
					]
				},
				success: function (oData, response) {
					that.Equipment = "";
					that.getView().setBusy(false);
					that.fnBuildAppState();
					if (oData.results.length > 0) {
						//	that.getView().byId("RecallLabel").addStyleClass("RecallInfo");
						oModelData.customerInfo = oData.results[0];
						oModelData.uiOnly.visible.MessagePage = false;
						oModelData.uiOnly.visible.vBoxSearchResults = true;
						var InsuranceDetails = oData.results[0].to_InsuranceDetails.results.length > 0 ? oData.results[0].to_InsuranceDetails.results : [];
						var latestInsuranceDetails = {};
						if (InsuranceDetails.length > 0) {
							InsuranceDetails = InsuranceDetails.sort(function (a, b) {
								return (b.EndDate.getTime() / 1000) - (a.EndDate.getTime() / 1000)
							});
							latestInsuranceDetails = InsuranceDetails[0];
						}
						oModelData.InsuranceDetails = latestInsuranceDetails;
						oModelData.uiOnly.visible.NPSSandPDSSScore = oData.results[0].to_EquipmentVBAPSOTagData !== null;
						that.getCurrentOwner();
						that.getView().byId("SCIN_BoxSearchResults").bindElement("/ZAE_I_Equipment_04('" + oData.results[0].Equipment + "')");
						that.getView().byId("ServicePlan").bindElement("/ZAE_I_Equipment_04('" + oData.results[0].Equipment +
							"')/to_MaterialCharacteristics");
						var ObjectStatusRecall = that.getView().byId("ObjectStatusRecall");
						var boolNoRecall = false,
							boolRecallPending = false,
							boolRecallComplete = false,
							vRecallPendingCount = 0,
							vRecallCompleteCount = 0;
						var recallCrit = "Indication01";
						var recallText = "";
						var boolStatusLargeClass = false;
						if (oData.results[0].to_EquipmentRecall.results.length > 0) {
							for (var i = 0; i < oData.results[0].to_EquipmentRecall.results.length; i++) {
								var oEquipmentRecall = oData.results[0].to_EquipmentRecall.results[i];
								if (oEquipmentRecall.WarrantyClaim !== '' && oEquipmentRecall.ServiceOrder !== '' && oEquipmentRecall.SystemStatus ===
									"I0045") {
									vRecallCompleteCount = vRecallCompleteCount + 1;
								} else if (oEquipmentRecall.WarrantyClaim !== '') {
									vRecallPendingCount = vRecallPendingCount + 1

								}
							}
							boolRecallComplete = vRecallCompleteCount === oData.results[0].to_EquipmentRecall.results.length ? true : false;
							boolRecallPending = vRecallPendingCount > 0 ? true : false;

						} else {
							boolNoRecall = true;
						}
						if (boolNoRecall) {
							recallCrit = "Indication02";
							recallText = "No Recall";
							boolStatusLargeClass = false;
						} else if (boolRecallPending) {
							recallCrit = "Indication02";
							recallText = "Recall Pending";
							boolStatusLargeClass = true;
						} else if (boolRecallComplete) {
							recallCrit = "Indication04";
							recallText = "Recall Completed";
							boolStatusLargeClass = false;
						}
						ObjectStatusRecall.setText(recallText);
						ObjectStatusRecall.setState(recallCrit);
						ObjectStatusRecall.setInverted(boolStatusLargeClass);
						if (boolStatusLargeClass) {
							ObjectStatusRecall.addStyleClass("sapMObjectStatusLarge");
						} else {
							ObjectStatusRecall.removeStyleClass("sapMObjectStatusLarge");
						}
						if (oModelData.customerInfo.to_MeasuringDocument && oModelData.customerInfo.to_MeasuringDocument.results.length > 0) {
							var oMeasuringDocumentList = oModelData.customerInfo.to_MeasuringDocument.results;
							var maxMeasuringReading = Number(oMeasuringDocumentList[0].MeasuringReading);
							for (var p = 0; p < oMeasuringDocumentList.length; p++) {
								if (Number(oMeasuringDocumentList[p].MeasuringReading) > maxMeasuringReading) {
									maxMeasuringReading = Number(oMeasuringDocumentList[p].MeasuringReading);
								}
							}
							oModelData.MeasuringReading = maxMeasuringReading;
						} else {
							oModelData.MeasuringReading = null;
						}
						// if (oModelData.customerInfo.to_EquipmentContStsB5 && oModelData.customerInfo.to_EquipmentContStsB5.SumOfCTIN > 1 &&
						// 	oModelData.customerInfo.to_ServiceContract01.results.length > 1) {
						// 	var msg =
						// 		'{i18n>Msg1} / Equipment..\n {i18n>Msg2} \n Contract numbers -\n';
						// 	for (var i = 0; i < oModelData.customerInfo.to_ServiceContract01.results.length; i++) {
						// 		if (oModelData.customerInfo.to_ServiceContract01.results[i].ContractStatus === 'CTIN') {
						// 			msg = msg + oModelData.customerInfo.to_ServiceContract01.results[i].SalesContract + "\n";
						// 		}

						// 	}
						// 	var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
						// 	sap.m.MessageBox.error(
						// 		msg, {
						// 			styleClass: bCompact ? "sapUiSizeCompact" : ""
						// 		}
						// 	);

						// }
						var ServiceContractList = oModelData.customerInfo.to_ServiceContractNew.results;
						var contract = {};
						var oInContractData = ServiceContractList.filter(function (obj) {
							return obj.ContractStatus_new === 'CTIN';
						});
						if (oInContractData.length > 1) {
							oInContractData.sort(function (a, b) {
								return a.SalesContractValidityEndDate - b.SalesContractValidityEndDate
							});
							contract = oInContractData[oInContractData.length - 1];
							that.fnProcessContractErrorMsg(oInContractData);
						} else {
							contract = oInContractData.length > 0 ? oInContractData[oInContractData.length - 1] : {};
						}
						if (oInContractData.length === 0 && ServiceContractList.length > 0) {
							ServiceContractList.sort(function (a, b) {
								return a.SalesContractValidityEndDate - b.SalesContractValidityEndDate
							});
							contract = ServiceContractList[ServiceContractList.length - 1];
						}
						oModel.setProperty("/customerInfo/ServiceContract", {});
						oModel.setProperty("/customerInfo/ServiceContract/MoreInfo", contract);

					} else {
						oModelData.customerInfo = [];
						var oMessageManager = sap.ui.getCore().getMessageManager();
						var oMessages = [];
						var oMessage1 = that.getView().getModel("i18n").getResourceBundle().getText("NoDataFound");
						var oMessage = new sap.ui.core.message.Message({
							message: oMessage1,
							persistent: true, // make message transient
							type: sap.ui.core.MessageType.Warning
						});
						oMessages.push(oMessage);

						oMessageManager.addMessages(oMessages);
						oModelData.uiOnly.visible.MessagePage = true;
						oModelData.uiOnly.visible.vBoxSearchResults = false;
					}
					oModel.updateBindings(true);

					// var Equipment = "",
					// 	EquipmentWithDesc = "";
					// var oTokens = that.byId("EquipmentVH").getTokens();
					// if (oTokens.length > 0) {
					// 	Equipment = oTokens[0].getProperty("key");
					// 	EquipmentWithDesc = oTokens[0].getProperty("text");
					// }
					// var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					// var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
					// var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
					// var appState = {
					// 	Plant: that.byId("SCIN_I01").getSelectedKey(),
					// 	Equipment: Equipment,
					// 	EquipmentWithDesc: EquipmentWithDesc
					// };

					// oAppState.setData(appState);
					// oAppState.save();

					// oEvent.getParameters().setAppStateKey(oAppState.getKey());
					// LinkEquipment.fireInnerNavigate();

				},
				error: function (oError) {
					that.getView().setBusy(false);
					oModelData.uiOnly.visible.MessagePage = true;
					oModelData.uiOnly.visible.vBoxSearchResults = false;
				}

			});
		},

		fnProcessContractErrorMsg: function (oInContractData) {
			var that = this;
			var Msg1 = that.getView().getModel("i18n").getResourceBundle().getText("Msg1");
			var Msg2 = that.getView().getModel("i18n").getResourceBundle().getText("Msg2");
			var Msg3 = that.getView().getModel("i18n").getResourceBundle().getText("Contract");
			var msg =
				// '{i18n>Msg1} / Equipment..\n {i18n>Msg2} \n Contract numbers -\n';
				Msg1 + "\n" + Msg2 + "\n" + Msg3 + "\n";
			for (var i = 0; i < oInContractData.length; i++) {
				// if (oModelData.customerInfo.to_ServiceContractNew.results[i].ContractStatus === 'CTIN') {
				msg = msg + oInContractData[i].SalesContract + "\n";
				// }

			}
			var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.error(
				msg, {
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},

		getCurrentOwner: function () {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var that = this;
			var SchemaTransaction = oModelData.SchemaTransactionType;
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			var PartnerFunction1 = this.getView().getModel().getProperty("/ZAE_I_Plant_03('" + Plant + "')")["PartnerFunction1"];
			if (SchemaTransaction) {
				var aFilters = [];
				aFilters.push(new Filter("Plant", "EQ", Plant));
				aFilters.push(new Filter("PartnerFunction", "EQ", PartnerFunction1));
				aFilters.push(new Filter("Equipment", "EQ", oModelData.customerInfo.Equipment));
				that.byId("FormCustomerInfo").setBusy(true);
				this.getView().getModel().read("/ZAE_I_EquipmentPartner_01", {
					filters: aFilters,
					success: function (oData, response) {
						that.byId("FormCustomerInfo").setBusy(false);
						if (oData.results.length > 0) {
							if (oData.results[0].CustomerStatus === "X" || oData.results[0].CustomerStatus === true) {
								that.getView().byId("SCIN_B09").setVisible(false);
								that.getView().byId("SCIN_B08").setVisible(false);
							} else {
								that.getView().byId("SCIN_B09").setVisible(oModelData.customerInfo.isShowSCIN_B09);
								that.getView().byId("SCIN_B08").setVisible(oModelData.customerInfo.isShowSCIN_B08);
							}
							oModelData.customerInfo.to_CurrentOwner = oData.results[0];
							that.getView().byId("IdCustomer").bindElement("/ZAE_I_Customer_01('" + oData.results[0].Partner + "')");
							// var SCIN_B09 =
							// 	var SCIN_B08 =
							if (!oModelData.customerInfo.to_CurrentOwner) {
								oModelData.uiOnly.visible.BTNSelctBP = true;
								oModelData.uiOnly.visible.BTNCreateContractPersonBP = false;
							} else
							if (oModelData.customerInfo.to_CurrentOwner
								.PartnerFunction !== "Z1") {
								oModelData.uiOnly.visible.BTNSelctBP = true;
								oModelData.uiOnly.visible.BTNCreateContractPersonBP = true;
							} else {
								oModelData.uiOnly.visible.BTNSelctBP = false;
								oModelData.uiOnly.visible.BTNCreateContractPersonBP = true;
							}
							if (oModelData.customerInfo.to_CurrentOwner.CreditBlock === true) {
								oModelData.customerInfo.to_CurrentOwner.CreditBlock = "Yes";
							} else {
								oModelData.customerInfo.to_CurrentOwner.CreditBlock = "No";
							}
						} else {
							oModelData.customerInfo.to_CurrentOwner = [];
							oModelData.uiOnly.visible.BTNCreateContractPersonBP = false;
						}
						that.byId("SmartTableContactPersonList").rebindTable();
						that.byId("SmartTableComplainList").rebindTable();
						//	that.byId("vehiclehistory").rebindTable();
						that.byId("SmartTableSalesArea").rebindTable();
						that.byId("SmartTableExtendedWarranty").rebindTable();
						that.byId("openEVHC").rebindTable();
						that.byId("EquipmentRecall").rebindTable();
						that.byId("OpenServiceRequests").rebindTable();
					},
					error: function (oError) {
						that.byId("FormCustomerInfo").setBusy(false);
						oModelData.customerInfo.to_CurrentOwner = [];
					}

				});
			} else {
				oModelData.customerInfo.to_CurrentOwner = [];
			}
		},

		onPressWorkShop: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash1 = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash1);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "NavTest",
					action: "display"
				}

			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		onPressSelectPB: function (oEvent) {
			if (!this._oSelectBPDialog) {
				Fragment.load({
						id: "fragSelectBP",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.SelectBP",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateSelectPBDialog(oDialogContent);
						this._setIntialStateSelectPBDialog();
					}.bind(this));
			} else {
				this._setIntialStateSelectPBDialog();
			}

		},
		_setIntialStateSelectPBDialog: function () {
			var pageData = this.getView().byId("SCIN_BoxSearchResults").getBindingContext().getObject();
			var oCustomer = Fragment.byId("fragSelectBP", "Customer");
			if (oCustomer.getContent() !== null) {
				if (pageData.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
					oCustomer.getContent().setValue(pageData.DefaultBP);
					oCustomer.getContent().setEnabled(false);
				} else {
					oCustomer.getContent().setValue("");
					oCustomer.getContent().setEnabled(true);
				}
				this._oSelectBPDialog.open();
			}
		},
		onCustomerInitialised: function (oEvent) {
			this._setIntialStateSelectPBDialog();
		},
		_CreateSelectPBDialog: function (oDialogContent) {
			var that = this;
			this._oSelectBPDialog = new sap.m.Dialog({
				title: "{i18n>SelectCustomer}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "{i18n>Submit}",

					press: function () {
						var Partner = Fragment.byId("fragSelectBP", "Customer").getValue();
						var oModel = this.getView().getModel("mCustIdentification");
						var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
						var oModelData = oModel.getData();
						if (Partner) {
							var aFilters = [];
							aFilters.push(new Filter("LTRMPartner", "EQ", Partner));
							// aFilters.push(new Filter("Plant", "EQ", Plant));
							that.getView().byId("IdCustomer").unbindElement();
							that.getView().getModel().read("/ZAE_I_Partner_02", {
								filters: aFilters,
								success: function (oData, response) {
									that.getView().byId("SCIN_I02").fireTokenUpdate();
									if (oData.results.length > 0) {
										oModelData.customerInfo.to_CurrentOwner = oData.results[0];
										that.getView().byId("IdCustomer").bindElement("/ZAE_I_Customer_01('" + oData.results[0].Partner + "')");
										if (!oModelData.customerInfo.to_CurrentOwner) {
											oModelData.uiOnly.visible.BTNSelctBP = true;
											oModelData.uiOnly.visible.BTNCreateContractPersonBP = false;
										} else if (oModelData.customerInfo.to_CurrentOwner
											.PartnerFunction !== "Z1") {
											oModelData.uiOnly.visible.BTNSelctBP = true;
											oModelData.uiOnly.visible.BTNCreateContractPersonBP = true;
										} else {
											oModelData.uiOnly.visible.BTNSelctBP = false;
											oModelData.uiOnly.visible.BTNCreateContractPersonBP = true;
										}
										if (oModelData.customerInfo.to_CurrentOwner.CreditBlock === true) {
											oModelData.customerInfo.to_CurrentOwner.CreditBlock = "Yes";
										} else {
											oModelData.customerInfo.to_CurrentOwner.CreditBlock = "No";
										}
										that.byId("SmartTableContactPersonList").rebindTable();
										that.byId("SmartTableSalesArea").rebindTable();

										oModel.updateBindings(true);
									}

								},
								error: function (oError) {
									that.getView().byId("SCIN_I02").fireTokenUpdate();
								}

							});
						}
						this._oSelectBPDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oSelectBPDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oSelectBPDialog);
			this._oSelectBPDialog.open();

		},

		fnCreatePress: function (oEvent) {
			var that = this;
			var vButtonID = oEvent.getSource().getId();
			var oModel = this.getView().getModel("mCustIdentification");
			oModel.setProperty("/CreateAppointmentDirect", false);
			this.vButtonID = vButtonID.split("_")[vButtonID.split("_").length - 1];
			var ContactPersonRow = this.byId('SmartTableContactPersonList').getTable().getSelectedItem();
			var message1 = this.getView().getModel("i18n").getResourceBundle().getText("Kindlymaintainemail", [ContactPersonRow.getBindingContext()
				.getObject().ContactPerson
			]);
			sap.m.MessageBox.information(message1, {
				icon: sap.m.MessageBox.Icon.INFORMATION,
				actions: [sap.m.MessageBox.Action.OK],
				emphasizedAction: sap.m.MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						this.onPressUpdatepersonaldata();
					}
				}.bind(this),
			});
		},

		fnCreateAptSrq: function () {
			var that = this;
			if (!this._oSelectSOSGDialog) {
				Fragment.load({
						id: "fragSelectSOSG",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.SelectSOSG",
						controller: {
							onCancelPressed: function (oEvent) {
								that._oSelectSOSGDialog.close();
								that.getView().byId("SCIN_I02").removeAllTokens();
							},

							onCampaignValueHelpRequested: function (oEvent1) {
								var input = oEvent1.getSource();
								var SalesOrganization = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject().SalesOrganization;
								input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_CampaignData",
									initiallyVisibleFields: "CampaignID,CampaignExternalID,SalesOrganization,CampaignType,CampaignTypeDescription,StartDate,EndDate ",

									selectionMode: "Single",
									tokenObject: {
										key: "CampaignID",
										Description: "CampaignExternalID"
									},
									controlConfiguration: [{
										index: 0,
										key: "SalesOrganization",
										filterType: "auto",
										label: "{/#ZAE_VH_CampaignData/SalesOrganization/@sap:label}",
										mandatory: "auto",
										visible: false
									}, {
										index: 1,
										key: "CampaignID",
										filterType: "auto",
										label: "{/#ZAE_VH_CampaignData/CampaignID/@sap:label}",
										mandatory: "auto",
										visible: true
									}, {
										index: 2,
										key: "CampaignExternalID",
										filterType: "auto",
										label: "{/#ZAE_VH_CampaignData/CampaignExternalID/@sap:label}",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "CampaignType",
										filterType: "auto",
										label: "{/#ZAE_VH_CampaignData/CampaignType/@sap:label}",
										mandatory: "auto",
										visible: false,

									}],
									defaultFilter: {
										CampaignType: {
											"items": [{
												"key": "SERVICE"
											}]
										},
										SalesOrganization: {
											"items": [{
												"key": SalesOrganization
											}]
										}
									},
									onBeforeRebindSmartTable: function (oEvent) {
										var aFilterArray = oEvent.getParameter("bindingParams").filters;
										aFilterArray.push(new sap.ui.model.Filter({
											path: "SalesOrganization",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: SalesOrganization
										}));
										aFilterArray.push(new sap.ui.model.Filter({
											path: "CampaignType",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: "SERVICE"
										}));
										oEvent.getParameter("bindingParams").filters = aFilterArray;
									}

								};

								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},
							onCampaignIDTokenUpdate: function (oEvent) {
								var aTokens = oEvent.getSource().getTokens();
								// if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
								// 	Fragment.byId("fragChangeEmpResp", "BTNSubmit").setEnabled(false);
								// } else {
								// 	Fragment.byId("fragChangeEmpResp", "BTNSubmit").setEnabled(true);
								// }

							},
							onSelectCampaignID: function (oEvent) {
								if (oEvent.getParameter("selectedRow") !== null) {
									var oSource = oEvent.getSource();
									oSource.setTokens([]);
									var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
									var oText = this.formatNameAndValuePair(oSelectedData.CampaignID, oSelectedData.CampaignExternalID);
									var oToken = new sap.m.Token({
										key: oSelectedData.CampaignID,
										text: oText
									});
									oSource.setTokens([oToken]);
									oSource.fireTokenUpdate();
								}
							},
							formatNameAndValuePair: function (sName, sValue) {
								if (!sName && !sValue) {
									return "";
								} else if (sValue && !sName) {
									return sValue.replace(/^0+/, "");
								} else if (!sValue && sName) {
									return sName;
								} else {
									return sName + " (" + sValue.replace(/^0+/, "") + ")";
								}
							},
							handleCampaignSuggest: function (oEvent) {
								var SalesOrganization = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject().SalesOrganization
								var sTerm = oEvent.getParameter("suggestValue");
								var aFilters = [];
								if (sTerm) {
									aFilters.push(new Filter({
										filters: [
											new Filter({
												path: "CampaignID",
												operator: sap.ui.model.FilterOperator.StartsWith,
												value1: sTerm
											}),
											new Filter({
												path: "CampaignExternalID",
												operator: sap.ui.model.FilterOperator.StartsWith,
												value1: sTerm
											})

										],
										and: false
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "SalesOrganization",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: SalesOrganization
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "CampaignType",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "SERVICE"
									}));
								}
								oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
								oEvent.getSource().getBinding("suggestionRows").resume();
							},

							onSubmitPressed: function (oEvent) {
								var oSelectedItemData = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
								//	if (oSelectedItemData.ValidationCheck === true && !(oSelectedItemData.CreateAppDirect)) {
								if (oSelectedItemData.AppointmentRule === "1" || oSelectedItemData.AppointmentRule === "") {
									if (that.vButtonID === "B08") {
										that.fnPressCreateAppointment();
										//	that.fnCheckAppointments();
									} else if (that.vButtonID === "B09") {
										that.onCreateRequestPress();
									}
								} else {
									if (that.vButtonID === "B08" && ((oSelectedItemData.AppointmentRule === "2") || (oSelectedItemData.AppointmentRule === "3"))) {
										that.fnCheckAppointments();
									} else if (that.vButtonID === "B09") {
										that.onCreateRequestPress();
									}
								}
								that._oSelectSOSGDialog.close();
							},
							// fnSalesofficeChange: function (oEvent) {
							// 	var Plant = that.getView().byId("SCIN_I01").getSelectedKey();
							// 	var Salesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
							// 	var aFilters = [];
							// 	aFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
							// 	aFilters.push(new sap.ui.model.Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, Salesoffice));
							// 	Fragment.byId("fragSelectSOSG", "IdSalesgroup").getBinding("items").filter(aFilters);
							// 	this.updateButtonEnabledState();
							// },
							fnSalesofficeChange: function (oEvent) {
								var VerifyBPDataCheck = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
								var oModel = that.getView().getModel("mCustIdentification");
								var oModelData = oModel.getData();
								var Customer;
								var ContactPerson;
								var oCPLContext;
								var oCPLSelectedItem;
								if (that.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
									oCPLContext = that.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
									oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
								} else if (that.oContactList) {
									oCPLContext = that.oContactList.getBindingContext();
									oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
								}
								if (VerifyBPDataCheck && VerifyBPDataCheck.VerifyBPData) {
									oModel.setProperty("/VerifyDataCheck", true);
									Customer = that.formatNameAndValuePair(oModelData.customerInfo.to_CurrentOwner
										.CustomerName, oModelData.customerInfo.to_CurrentOwner.Partner);
									ContactPerson = that.formatNameAndValuePair(oCPLSelectedItem.ContactPersonName, oCPLSelectedItem.ContactPerson);
									Fragment.byId("fragSelectSOSG", "idCustomerVerify").setText(Customer);
									// Fragment.byId("fragSelectSOSG", "idCustomerName").setText(oModel.getData().customerInfo.to_CurrentOwner.CustomerName);
									Fragment.byId("fragSelectSOSG", "idCPerson").setText(ContactPerson);
									// Fragment.byId("fragSelectSOSG", "idCPersonName").setText(oCPLSelectedItem.ContactPersonName);
									Fragment.byId("fragSelectSOSG", "idCPersonNum").setText(oCPLSelectedItem.MobileNumber);
									Fragment.byId("fragSelectSOSG", "idCPersonNameFax").setText(oCPLSelectedItem.FaxNumber);
									Fragment.byId("fragSelectSOSG", "idCPersonEmail").setText(oCPLSelectedItem.EmailAddress);

								} else {
									oModel.setProperty("/VerifyDataCheck", false);
								}
								that._fnCreateAppointmentInitalState();
							},

							onDetailsConfirmationCheck: function (oEvent) {
								that._fnCreateAppointmentInitalState();
							},
							handleStartDateChange: function () {
								var oSelectedItemData = "";
								var TimeSlot = 0;
								var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup");
								if (SalesGroup.getSelectedItem()) {
									oSelectedItemData = SalesGroup.getSelectedItem().getBindingContext().getObject();
								} else {
									var SalesOffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
									var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
									var path = "/ZAE_I_SalesOfficeGroup_01(Plant='" + Plant + "',SalesOffice='" + SalesOffice + "',SalesGroup='" +
										SalesGroup +
										"')";
									oSelectedItemData = this.getView().getModel().getProperty(path);
								}
								if (oSelectedItemData.TimeSlot) {
									TimeSlot = parseInt(oSelectedItemData.TimeSlot);
								}
								var oDateTimePickerStart = Fragment.byId("fragSelectSOSG", "startDate").getDateValue();
								var currentDate = new Date(oDateTimePickerStart);
								currentDate.setMinutes(currentDate.getMinutes() + TimeSlot);
								Fragment.byId("fragSelectSOSG", "endDate").setDateValue(currentDate);
								Fragment.byId("fragSelectSOSG", "endDate").setMinDate(new Date());
								var oDateTimePickerEnd = Fragment.byId("fragSelectSOSG", "endDate").getDateValue();
								var oCurrentData = new Date();
								if ((oDateTimePickerStart < oCurrentData) || (oDateTimePickerStart >= oDateTimePickerEnd)) {
									Fragment.byId("fragSelectSOSG", "startDate").setValueState("Error");
								} else {
									Fragment.byId("fragSelectSOSG", "startDate").setValueState("None");
									Fragment.byId("fragSelectSOSG", "endDate").setValueState("None");
								}
								if (oDateTimePickerStart === null) {
									Fragment.byId("fragSelectSOSG", "endDate").setDateValue(new Date());
									Fragment.byId("fragSelectSOSG", "endDate").setMinDate(new Date());
								}
								this.updateButtonEnabledState();
							},

							handleEndDateChange: function () {
								var oDateTimePickerStart = Fragment.byId("fragSelectSOSG", "startDate").getDateValue();
								var oDateTimePickerEnd = Fragment.byId("fragSelectSOSG", "endDate").getDateValue();
								var oCurrentData = new Date();
								if ((oDateTimePickerEnd < oCurrentData) || (oDateTimePickerStart >= oDateTimePickerEnd)) {
									Fragment.byId("fragSelectSOSG", "endDate").setValueState("Error");
								} else {
									Fragment.byId("fragSelectSOSG", "endDate").setValueState("None");
									Fragment.byId("fragSelectSOSG", "startDate").setValueState("None");
								}
								this.updateButtonEnabledState();
							},
							updateButtonEnabledState: function () {
								that.fnCheckSubmitButtonEnableState();
								// var Salesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
								// var Salesgroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
								// var boolSubmitButton = Salesoffice !== "" && Salesgroup !== "";
								// Fragment.byId("fragSelectSOSG", "BUTTONSubmit").setEnabled(boolSubmitButton);
							}
						}

					})
					.then(function (oDialogContent) {
						this._oSelectSOSGDialog = oDialogContent
						this.getView().addDependent(this._oSelectSOSGDialog);
						Fragment.byId("fragSelectSOSG", "IdSalesoffice").getBinding("items").attachDataReceived(function (oEvent) {
							if (oEvent.getParameter("data").results.length === 1) {
								Fragment.byId("fragSelectSOSG", "IdSalesoffice").setSelectedKey(oEvent.getParameter("data").results[0].SalesOffice);
								var Plant = that.getView().byId("SCIN_I01").getSelectedKey();
								var aFilters = [];
								aFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
								aFilters.push(new sap.ui.model.Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oEvent.getParameter("data").results[
										0]
									.SalesOffice));
								Fragment.byId("fragSelectSOSG", "IdSalesgroup").getBinding("items").filter(aFilters);
								if (Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey()) {
									this._fnCreateAppointmentInitalState();
								}
							}
						}.bind(this));
						this._setSOSGDialogInitialState();
					}.bind(this));
			} else {
				this._setSOSGDialogInitialState();
			}
		},

		// fnCreatePress: function (oEvent) {
		// 	var that = this;
		// 	var vButtonID = oEvent.getSource().getId();
		// 	var oModel = this.getView().getModel("mCustIdentification");
		// 	oModel.setProperty("/CreateAppointmentDirect", false);
		// 	this.vButtonID = vButtonID.split("_")[vButtonID.split("_").length - 1];
		// 	// if (!this._oSelectSOSGDialog) {
		// 	// 	Fragment.load({
		// 	// 			id: "fragSelectSOSG",
		// 	// 			name: "com.globalintelli.ZAE_SCIN_NEW.fragment.SelectSOSG",
		// 	// 			controller: {
		// 	// 				onCancelPressed: function (oEvent) {
		// 	// 					that._oSelectSOSGDialog.close();
		// 	// 				},

		// 	// 				onCampaignValueHelpRequested: function (oEvent1) {
		// 	// 					var input = oEvent1.getSource();
		// 	// 					var SalesOrganization = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject().SalesOrganization;
		// 	// 					input.setTokens([]);
		// 	// 					var configObject = {
		// 	// 						entitySet: "ZAE_VH_CampaignData",
		// 	// 						initiallyVisibleFields: "CampaignID,CampaignExternalID,SalesOrganization,CampaignType,CampaignTypeDescription,StartDate,EndDate ",

		// 	// 						selectionMode: "Single",
		// 	// 						tokenObject: {
		// 	// 							key: "CampaignID",
		// 	// 							Description: "CampaignExternalID"
		// 	// 						},
		// 	// 						controlConfiguration: [{
		// 	// 							index: 0,
		// 	// 							key: "SalesOrganization",
		// 	// 							filterType: "auto",
		// 	// 							label: "{/#ZAE_VH_CampaignData/SalesOrganization/@sap:label}",
		// 	// 							mandatory: "auto",
		// 	// 							visible: false
		// 	// 						}, {
		// 	// 							index: 1,
		// 	// 							key: "CampaignID",
		// 	// 							filterType: "auto",
		// 	// 							label: "{/#ZAE_VH_CampaignData/CampaignID/@sap:label}",
		// 	// 							mandatory: "auto",
		// 	// 							visible: true
		// 	// 						}, {
		// 	// 							index: 2,
		// 	// 							key: "CampaignExternalID",
		// 	// 							filterType: "auto",
		// 	// 							label: "{/#ZAE_VH_CampaignData/CampaignExternalID/@sap:label}",
		// 	// 							mandatory: "auto",
		// 	// 							visible: true
		// 	// 						}, {
		// 	// 							index: 3,
		// 	// 							key: "CampaignType",
		// 	// 							filterType: "auto",
		// 	// 							label: "{/#ZAE_VH_CampaignData/CampaignType/@sap:label}",
		// 	// 							mandatory: "auto",
		// 	// 							visible: false,

		// 	// 						}],
		// 	// 						defaultFilter: {
		// 	// 							CampaignType: {
		// 	// 								"items": [{
		// 	// 									"key": "SERVICE"
		// 	// 								}]
		// 	// 							},
		// 	// 							SalesOrganization: {
		// 	// 								"items": [{
		// 	// 									"key": SalesOrganization
		// 	// 								}]
		// 	// 							}
		// 	// 						},
		// 	// 						onBeforeRebindSmartTable: function (oEvent) {
		// 	// 							var aFilterArray = oEvent.getParameter("bindingParams").filters;
		// 	// 							aFilterArray.push(new sap.ui.model.Filter({
		// 	// 								path: "SalesOrganization",
		// 	// 								operator: sap.ui.model.FilterOperator.EQ,
		// 	// 								value1: SalesOrganization
		// 	// 							}));
		// 	// 							aFilterArray.push(new sap.ui.model.Filter({
		// 	// 								path: "CampaignType",
		// 	// 								operator: sap.ui.model.FilterOperator.EQ,
		// 	// 								value1: "SERVICE"
		// 	// 							}));
		// 	// 							oEvent.getParameter("bindingParams").filters = aFilterArray;
		// 	// 						}

		// 	// 					};

		// 	// 					that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
		// 	// 				},
		// 	// 				onCampaignIDTokenUpdate: function (oEvent) {
		// 	// 					var aTokens = oEvent.getSource().getTokens();
		// 	// 					// if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
		// 	// 					// 	Fragment.byId("fragChangeEmpResp", "BTNSubmit").setEnabled(false);
		// 	// 					// } else {
		// 	// 					// 	Fragment.byId("fragChangeEmpResp", "BTNSubmit").setEnabled(true);
		// 	// 					// }

		// 	// 				},
		// 	// 				onSelectCampaignID: function (oEvent) {
		// 	// 					if (oEvent.getParameter("selectedRow") !== null) {
		// 	// 						var oSource = oEvent.getSource();
		// 	// 						oSource.setTokens([]);
		// 	// 						var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
		// 	// 						var oText = this.formatNameAndValuePair(oSelectedData.CampaignID, oSelectedData.CampaignExternalID);
		// 	// 						var oToken = new sap.m.Token({
		// 	// 							key: oSelectedData.CampaignID,
		// 	// 							text: oText
		// 	// 						});
		// 	// 						oSource.setTokens([oToken]);
		// 	// 						oSource.fireTokenUpdate();
		// 	// 					}
		// 	// 				},
		// 	// 				formatNameAndValuePair: function (sName, sValue) {
		// 	// 					if (!sName && !sValue) {
		// 	// 						return "";
		// 	// 					} else if (sValue && !sName) {
		// 	// 						return sValue.replace(/^0+/, "");
		// 	// 					} else if (!sValue && sName) {
		// 	// 						return sName;
		// 	// 					} else {
		// 	// 						return sName + " (" + sValue.replace(/^0+/, "") + ")";
		// 	// 					}
		// 	// 				},
		// 	// 				handleCampaignSuggest: function (oEvent) {
		// 	// 					var SalesOrganization = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject().SalesOrganization
		// 	// 					var sTerm = oEvent.getParameter("suggestValue");
		// 	// 					var aFilters = [];
		// 	// 					if (sTerm) {
		// 	// 						aFilters.push(new Filter({
		// 	// 							filters: [
		// 	// 								new Filter({
		// 	// 									path: "CampaignID",
		// 	// 									operator: sap.ui.model.FilterOperator.StartsWith,
		// 	// 									value1: sTerm
		// 	// 								}),
		// 	// 								new Filter({
		// 	// 									path: "CampaignExternalID",
		// 	// 									operator: sap.ui.model.FilterOperator.StartsWith,
		// 	// 									value1: sTerm
		// 	// 								})

		// 	// 							],
		// 	// 							and: false
		// 	// 						}));
		// 	// 						aFilters.push(new sap.ui.model.Filter({
		// 	// 							path: "SalesOrganization",
		// 	// 							operator: sap.ui.model.FilterOperator.EQ,
		// 	// 							value1: SalesOrganization
		// 	// 						}));
		// 	// 						aFilters.push(new sap.ui.model.Filter({
		// 	// 							path: "CampaignType",
		// 	// 							operator: sap.ui.model.FilterOperator.EQ,
		// 	// 							value1: "SERVICE"
		// 	// 						}));
		// 	// 					}
		// 	// 					oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
		// 	// 					oEvent.getSource().getBinding("suggestionRows").resume();
		// 	// 				},

		// 	// 				onSubmitPressed: function (oEvent) {
		// 	// 					var oSelectedItemData = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
		// 	// 					//	if (oSelectedItemData.ValidationCheck === true && !(oSelectedItemData.CreateAppDirect)) {
		// 	// 					if (oSelectedItemData.AppointmentRule === "1" || oSelectedItemData.AppointmentRule === "") {
		// 	// 						if (that.vButtonID === "B08") {
		// 	// 							that.fnPressCreateAppointment();
		// 	// 							//	that.fnCheckAppointments();
		// 	// 						} else if (that.vButtonID === "B09") {
		// 	// 							that.onCreateRequestPress();
		// 	// 						}
		// 	// 					} else {
		// 	// 						if (that.vButtonID === "B08" && ((oSelectedItemData.AppointmentRule === "2") || (oSelectedItemData.AppointmentRule === "3"))) {
		// 	// 							that.fnCheckAppointments();
		// 	// 						} else if (that.vButtonID === "B09") {
		// 	// 							that.onCreateRequestPress();
		// 	// 						}
		// 	// 					}
		// 	// 					that._oSelectSOSGDialog.close();
		// 	// 				},
		// 	// 				// fnSalesofficeChange: function (oEvent) {
		// 	// 				// 	var Plant = that.getView().byId("SCIN_I01").getSelectedKey();
		// 	// 				// 	var Salesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
		// 	// 				// 	var aFilters = [];
		// 	// 				// 	aFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
		// 	// 				// 	aFilters.push(new sap.ui.model.Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, Salesoffice));
		// 	// 				// 	Fragment.byId("fragSelectSOSG", "IdSalesgroup").getBinding("items").filter(aFilters);
		// 	// 				// 	this.updateButtonEnabledState();
		// 	// 				// },
		// 	// 				fnSalesofficeChange: function (oEvent) {
		// 	// 					var VerifyBPDataCheck = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
		// 	// 					var oModel = that.getView().getModel("mCustIdentification");
		// 	// 					var oModelData = oModel.getData();
		// 	// 					var Customer;
		// 	// 					var ContactPerson;
		// 	// 					if (that.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
		// 	// 						var oCPLContext = that.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
		// 	// 						var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
		// 	// 					}
		// 	// 					if (VerifyBPDataCheck && VerifyBPDataCheck.VerifyBPData) {
		// 	// 						oModel.setProperty("/VerifyDataCheck", true);
		// 	// 						Customer = that.formatNameAndValuePair(oModelData.customerInfo.to_CurrentOwner
		// 	// 							.CustomerName, oModelData.customerInfo.to_CurrentOwner.Partner);
		// 	// 						ContactPerson = that.formatNameAndValuePair(oCPLSelectedItem.ContactPersonName, oCPLSelectedItem.ContactPerson);
		// 	// 						Fragment.byId("fragSelectSOSG", "idCustomerVerify").setText(Customer);
		// 	// 						// Fragment.byId("fragSelectSOSG", "idCustomerName").setText(oModel.getData().customerInfo.to_CurrentOwner.CustomerName);
		// 	// 						Fragment.byId("fragSelectSOSG", "idCPerson").setText(ContactPerson);
		// 	// 						// Fragment.byId("fragSelectSOSG", "idCPersonName").setText(oCPLSelectedItem.ContactPersonName);
		// 	// 						Fragment.byId("fragSelectSOSG", "idCPersonNum").setText(oCPLSelectedItem.MobileNumber);
		// 	// 						Fragment.byId("fragSelectSOSG", "idCPersonNameFax").setText(oCPLSelectedItem.FaxNumber);
		// 	// 						Fragment.byId("fragSelectSOSG", "idCPersonEmail").setText(oCPLSelectedItem.EmailAddress);

		// 	// 					} else {
		// 	// 						oModel.setProperty("/VerifyDataCheck", false);
		// 	// 					}
		// 	// 					that._fnCreateAppointmentInitalState();
		// 	// 				},

		// 	// 				onDetailsConfirmationCheck: function (oEvent) {
		// 	// 					that._fnCreateAppointmentInitalState();
		// 	// 				},
		// 	// 				handleStartDateChange: function () {
		// 	// 					var oSelectedItemData = "";
		// 	// 					var TimeSlot = 0;
		// 	// 					var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup");
		// 	// 					if (SalesGroup.getSelectedItem()) {
		// 	// 						oSelectedItemData = SalesGroup.getSelectedItem().getBindingContext().getObject();
		// 	// 					} else {
		// 	// 						var SalesOffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
		// 	// 						var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
		// 	// 						var path = "/ZAE_I_SalesOfficeGroup_01(Plant='" + Plant + "',SalesOffice='" + SalesOffice + "',SalesGroup='" +
		// 	// 							SalesGroup +
		// 	// 							"')";
		// 	// 						oSelectedItemData = this.getView().getModel().getProperty(path);
		// 	// 					}
		// 	// 					if (oSelectedItemData.TimeSlot) {
		// 	// 						TimeSlot = parseInt(oSelectedItemData.TimeSlot);
		// 	// 					}
		// 	// 					var oDateTimePickerStart = Fragment.byId("fragSelectSOSG", "startDate").getDateValue();
		// 	// 					var currentDate = new Date(oDateTimePickerStart);
		// 	// 					currentDate.setMinutes(currentDate.getMinutes() + TimeSlot);
		// 	// 					Fragment.byId("fragSelectSOSG", "endDate").setDateValue(currentDate);
		// 	// 					Fragment.byId("fragSelectSOSG", "endDate").setMinDate(new Date());
		// 	// 					var oDateTimePickerEnd = Fragment.byId("fragSelectSOSG", "endDate").getDateValue();
		// 	// 					var oCurrentData = new Date();
		// 	// 					if ((oDateTimePickerStart < oCurrentData) || (oDateTimePickerStart >= oDateTimePickerEnd)) {
		// 	// 						Fragment.byId("fragSelectSOSG", "startDate").setValueState("Error");
		// 	// 					} else {
		// 	// 						Fragment.byId("fragSelectSOSG", "startDate").setValueState("None");
		// 	// 						Fragment.byId("fragSelectSOSG", "endDate").setValueState("None");
		// 	// 					}
		// 	// 					if (oDateTimePickerStart === null) {
		// 	// 						Fragment.byId("fragSelectSOSG", "endDate").setDateValue(new Date());
		// 	// 						Fragment.byId("fragSelectSOSG", "endDate").setMinDate(new Date());
		// 	// 					}
		// 	// 					this.updateButtonEnabledState();
		// 	// 				},

		// 	// 				handleEndDateChange: function () {
		// 	// 					var oDateTimePickerStart = Fragment.byId("fragSelectSOSG", "startDate").getDateValue();
		// 	// 					var oDateTimePickerEnd = Fragment.byId("fragSelectSOSG", "endDate").getDateValue();
		// 	// 					var oCurrentData = new Date();
		// 	// 					if ((oDateTimePickerEnd < oCurrentData) || (oDateTimePickerStart >= oDateTimePickerEnd)) {
		// 	// 						Fragment.byId("fragSelectSOSG", "endDate").setValueState("Error");
		// 	// 					} else {
		// 	// 						Fragment.byId("fragSelectSOSG", "endDate").setValueState("None");
		// 	// 						Fragment.byId("fragSelectSOSG", "startDate").setValueState("None");
		// 	// 					}
		// 	// 					this.updateButtonEnabledState();
		// 	// 				},
		// 	// 				updateButtonEnabledState: function () {
		// 	// 					that.fnCheckSubmitButtonEnableState();
		// 	// 					// var Salesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
		// 	// 					// var Salesgroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
		// 	// 					// var boolSubmitButton = Salesoffice !== "" && Salesgroup !== "";
		// 	// 					// Fragment.byId("fragSelectSOSG", "BUTTONSubmit").setEnabled(boolSubmitButton);
		// 	// 				}
		// 	// 			}

		// 	// 		})
		// 	// 		.then(function (oDialogContent) {
		// 	// 			this._oSelectSOSGDialog = oDialogContent
		// 	// 			this.getView().addDependent(this._oSelectSOSGDialog);
		// 	// 			Fragment.byId("fragSelectSOSG", "IdSalesoffice").getBinding("items").attachDataReceived(function (oEvent) {
		// 	// 				if (oEvent.getParameter("data").results.length === 1) {
		// 	// 					Fragment.byId("fragSelectSOSG", "IdSalesoffice").setSelectedKey(oEvent.getParameter("data").results[0].SalesOffice);
		// 	// 					var Plant = that.getView().byId("SCIN_I01").getSelectedKey();
		// 	// 					var aFilters = [];
		// 	// 					aFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
		// 	// 					aFilters.push(new sap.ui.model.Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oEvent.getParameter("data").results[
		// 	// 							0]
		// 	// 						.SalesOffice));
		// 	// 					Fragment.byId("fragSelectSOSG", "IdSalesgroup").getBinding("items").filter(aFilters);
		// 	// 					if (Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey()) {
		// 	// 						this._fnCreateAppointmentInitalState();
		// 	// 					}
		// 	// 				}
		// 	// 			}.bind(this));
		// 	// 			this._setSOSGDialogInitialState();
		// 	// 		}.bind(this));
		// 	// } else {
		// 	// 	this._setSOSGDialogInitialState();
		// 	// }
		// },

		_setSOSGDialogInitialState: function () {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			oModel.setProperty("/VerifyDataCheck", false);
			Fragment.byId("fragSelectSOSG", "idVerifyBpData").setSelected(false);
			//	oModel.setProperty("/VisibleFields", false);
			Fragment.byId("fragSelectSOSG", "IdSalesoffice").setSelectedKey("");
			Fragment.byId("fragSelectSOSG", "IdSalesgroup").setSelectedKey("");
			Fragment.byId("fragSelectSOSG", "IdSalesgroup").setSelectedKey(oModelData.SalesGroup);
			Fragment.byId("fragSelectSOSG", "BUTTONSubmit").setEnabled(false);
			Fragment.byId("fragSelectSOSG", "startDate").setMinDate(new Date());
			if (this.CampaignID && this.CampaignID.length > 0) {
				var oText = this.formatNameAndValuePair(decodeURI(this.cmpgn_extid), this.CampaignID);
				var oToken = new sap.m.Token({
					key: this.CampaignID,
					text: oText
				});
				Fragment.byId("fragSelectSOSG", "CampaignID").setTokens([oToken]);
			} else {
				Fragment.byId("fragSelectSOSG", "CampaignID").setTokens([]);
			}
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			var aFilters = [];
			var ContactPersonCheck = false;
			var ContactPersonRow = this.byId('SmartTableContactPersonList').getTable().getSelectedItem();
			if (ContactPersonRow && ContactPersonRow.getBindingContext().getObject()) {
				ContactPersonCheck = ContactPersonRow.getBindingContext().getObject().UpdatedBPCheck;
			}
			if (Plant) {
				aFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
				Fragment.byId("fragSelectSOSG", "IdSalesoffice").getBinding("items").filter(aFilters);
				Fragment.byId("fragSelectSOSG", "IdSalesgroup").getBinding("items").filter(aFilters);
			}
			if (this.vButtonID === "B08") {
				// Commmented for SP-8202
				// if ((oModelData.customerInfo.BPDetailsMandatory && ContactPersonRow && (!ContactPersonCheck))) {
				// 	var message1 = this.getView().getModel("i18n").getResourceBundle().getText("Kindlymaintainemail", [ContactPersonRow.getBindingContext()
				// 		.getObject().ContactPerson
				// 	]);
				// 	sap.m.MessageBox.error(message1);
				// 	return;
				// }
				this._oSelectSOSGDialog.setTitle(oResourceBundle.getText("CreateAppointment"))
			} else {
				// Commmented for SP-8202
				// if ((oModelData.customerInfo.BPDetailsMandatory && ContactPersonRow && (!ContactPersonCheck))) {
				// 	var message1 = this.getView().getModel("i18n").getResourceBundle().getText("Kindlymaintainemail", [ContactPersonRow.getBindingContext()
				// 		.getObject().ContactPerson
				// 	]);
				// 	sap.m.MessageBox.error(message1);
				// 	return;
				// }
				this._oSelectSOSGDialog.setTitle(oResourceBundle.getText("CreateServiceRequest"))
			}
			this._oSelectSOSGDialog.open();
		},

		fnPressCreateAppointment: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var Customer;
			var CustomerName;
			var CPerson;
			var CPersonName;
			var Plant;
			var Category = [];
			var Insurer;
			var SalesOrganization;
			var DistrChannel;
			var Division;
			var Make;
			var oCPLContext;
			var oCPLSelectedItem;
			var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			// Category = this.byId("SCIN_I02").getSelectedKey();
			// CategoryValue = this.byId("SCIN_I02").getValue().split("(")[0];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			if (CategoryTokens === 0) {
				CategoryTokens = this.oCategory;
			}
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			Insurer = this.byId("SCIN_I03").getSelectedKey();
			if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
				var oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
				var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CPerson = oCPLSelectedItem.ContactPerson;
				CPersonName = oCPLSelectedItem.ContactPersonName;
			} else if (this.oContactList) {
				oCPLContext = this.oContactList.getBindingContext();
				oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CPerson = oCPLSelectedItem.ContactPerson;
				CPersonName = oCPLSelectedItem.ContactPersonName;
			} else {
				CPerson = "";
				CPersonName = "";
			}
			if (oModelData.customerInfo.to_CurrentOwner && oModelData.customerInfo.to_CurrentOwner.Partner) {
				Customer = oModelData.customerInfo.to_CurrentOwner.Partner;
				CustomerName = oModelData.customerInfo.to_CurrentOwner.CustomerName;
			} else if (oModelData.customerInfo.CurrentOwner) {
				Customer = oModelData.customerInfo.CurrentOwner;
				CustomerName = oModelData.customerInfo.CustomerName;
			} else {
				Customer = "";
				CustomerName = "";
			}
			SalesOrganization = oSelectedItem.SalesOrganization;
			DistrChannel = oSelectedItem.DistrChannel;
			Division = oSelectedItem.Division;
			Make = oModelData.customerInfo.Make;
			/*if (oModelData.BPContactPersonList.length > 0) {
				var oSelectedItem = this.byId("TBLBPContactPersonList").getSelectedItem();
				if (oSelectedItem) {
					var selectedSpoth = this.byId("TBLBPContactPersonList").getSelectedItem().oBindingContexts.mCustIdentification.sPath;
					var oSelected = this.getView().getModel("mCustIdentification").getProperty(selectedSpoth);
					Customer = oSelected.ContactPerson;
				} else {
					sap.m.MessageToast.show("Please select Contact Person");
					return;
				}

			} else if (oModelData.customerInfo.CurrentOwner) {
				Customer = oModelData.customerInfo.CurrentOwner;
			} else {
				Customer = "";
			}*/
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var Salesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
			var Salesgroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
			var CampaignID = (this.CampaignID) ? this.CampaignID : "";
			var cmpgn_extid = (this.cmpgn_extid) ? this.cmpgn_extid : "";
			var Lead = (this.Lead) ? this.Lead : "";
			var oSelectedItemData = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
			//var oSalesOfficeGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
			var CatlogTokens = this.getView().byId("SCIN_I02").getTokens();
			if (CatlogTokens.length === 0) {
				CatlogTokens = this.oCategory
			}
			var Description = CatlogTokens.length > 0 ? CatlogTokens[0].getText() : "";
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: Plant,
				Category: Category,
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: Insurer
			};
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sNewHash = "";
			oHashChanger.replaceHash(sNewHash);
			var oData = {
				Equipment: oModelData.customerInfo.Equipment ? oModelData.customerInfo.Equipment : "",
				Customer: Customer,
				CustomerName: CustomerName,
				CPerson: CPerson,
				CPersonName: CPersonName,
				Plant: Plant,
				Category: Category,
				// CategoryValue: CategoryValue,
				Insurer: Insurer,
				SalesOrganization: SalesOrganization,
				DistrChannel: DistrChannel,
				Division: Division,
				SalesOffice: Salesoffice,
				SalesGroup: Salesgroup,
				Description: Description,
				"sap-iapp-state": oAppState.getKey(),
				TransactionType: oModelData.SchemaTransactionType.TransactionType,
				CampaignID: CampaignID,
				Cmpgn_extid: decodeURI(cmpgn_extid),
				LeadId: Lead,
				Make: Make,
				AppointmentRule: oSelectedItemData.AppointmentRule
					// SalesGroup: oModelData.SalesGroup

			};
			var EncodedData = encodeURIComponent(JSON.stringify(oData));
			this.getRouter().navTo("AppointmentView", {
				param1: EncodedData
			});
			this.getView().byId("SCIN_I02").removeAllTokens();

		},

		fnAfterNavigate: function (View, Event, object) {
			this.getView().setBusy(false);
		},

		onPressCreateContactPerson: function (oEvent) {
			if (!this._oNewContactPersonDialog) {
				Fragment.load({
						id: "fragCreateContactPerson",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ContactPerson",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateContactPersonDialog(oDialogContent);
						this._setContactPersonDialogInitialState();
					}.bind(this));
			} else {
				this._setContactPersonDialogInitialState();
			}
		},
		_CreateContactPersonDialog: function (oDialogContent) {

			var SALUTATION;
			var FIRSTNAME;
			var FAMILYNAME;
			var TELNO;
			var MOBILENO;
			var EMAIL;
			var CPRNO;
			var that = this;
			var CITY;
			var STREET;
			var COUNTRY;
			var REGION;
			var FAXNUMBER;
			var Location;
			var COUNTRYTOKEN;
			var REGIONTOKEN;
			//var PostlCode;

			this._oNewContactPersonDialog = new sap.m.Dialog({
				title: "{i18n>CreateContactPerson}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "{i18n>Create}",
					enabled: "{mCustIdentification>/uiOnly/enable/ContactPersonCreateButton}",
					press: function () {
						that._oNewContactPersonDialog.setBusy(true);
						var oContext = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
						var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
						SALUTATION = Fragment.byId("fragCreateContactPerson", "SALUTATION").getSelectedKey();
						Location = Fragment.byId("fragCreateContactPerson", "REGIOGROUP").getSelectedKey();
						FIRSTNAME = Fragment.byId("fragCreateContactPerson", "FIRSTNAME").getValue();
						FAMILYNAME = Fragment.byId("fragCreateContactPerson", "FAMILYNAME").getValue();
						TELNO = Fragment.byId("fragCreateContactPerson", "TELNO").getValue().split(" ")[1];
						MOBILENO = Fragment.byId("fragCreateContactPerson", "MOBILENO").getValue().split(" ")[1];
						FAXNUMBER = Fragment.byId("fragCreateContactPerson", "FAXNUMBER").getValue().split(" ")[1];
						EMAIL = Fragment.byId("fragCreateContactPerson", "EMAIL").getValue();
						CPRNO = Fragment.byId("fragCreateContactPerson", "CPRNO").getValue();
						CITY = Fragment.byId("fragCreateContactPerson", "CITY").getValue();
						STREET = Fragment.byId("fragCreateContactPerson", "STREET").getValue();
						COUNTRYTOKEN = Fragment.byId("fragCreateContactPerson", "COUNTRY").getTokens()[0];
						if (COUNTRYTOKEN) {
							COUNTRY = COUNTRYTOKEN.getKey();
						}
						REGIONTOKEN = Fragment.byId("fragCreateContactPerson", "REGION").getTokens()[0];
						if (REGIONTOKEN) {
							REGION = REGIONTOKEN.getKey();
						}

						//	REGION = REGION.split("(")[0].trimEnd();
						//PostlCode = Fragment.byId("fragCreateContactPerson", "PostlCode").getValue();
						var oEntity = "ZAE_FM_SC_CONTACT_CREATESet";
						var oModel = that.getView().getModel();
						var oModelData = that.getView().getModel("mCustIdentification").getData();
						var MainContact = oModelData.customerInfo.to_CurrentOwner.Partner;
						var data = [{
								callProperty: "Salutation",
								value: SALUTATION
							}, {
								callProperty: "FirstName",
								value: FIRSTNAME
							}, {
								callProperty: "LastName",
								value: FAMILYNAME
							}, {
								callProperty: "TelNo",
								value: TELNO
							}, {
								callProperty: "MobileNo",
								value: MOBILENO
							}, {
								callProperty: "Email",
								value: EMAIL
							}, {
								callProperty: "Identificationnumber",
								value: CPRNO
							}, {
								callProperty: "Identificationcategory",
								value: "YCPR01"
							}, {
								callProperty: "MainContact",
								value: MainContact
							}, {
								callProperty: "City",
								value: CITY
							}, {
								callProperty: "Street",
								value: STREET
							}, {
								callProperty: "Country",
								value: COUNTRY
							}, {
								callProperty: "Region",
								value: REGION
							}, {
								callProperty: "FaxNumber",
								value: FAXNUMBER
							}, {
								callProperty: "Location",
								value: Location
							}
							/*{
							callProperty: "PostlCod1",
							value: PostlCode
						}*/
						];
						if (oSelectedItem.SalesOrganization) {
							data.push({
								callProperty: "SalesOrg",
								value: oSelectedItem.SalesOrganization
							});
						}

						var succFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.onSearch();
							that._oNewContactPersonDialog.setBusy(false);
							that._oNewContactPersonDialog.close();
						};

						var errFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.onSearch();
							that._oNewContactPersonDialog.setBusy(false);
							that._oNewContactPersonDialog.close();
						};
						that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewContactPersonDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oNewContactPersonDialog);
		},

		_setContactPersonDialogInitialState: function () {
			this._setDefaultValues("fragCreateContactPerson");
			Fragment.byId("fragCreateContactPerson", "SALUTATION").setSelectedKey(null);
			Fragment.byId("fragCreateContactPerson", "FIRSTNAME").setValue("");
			Fragment.byId("fragCreateContactPerson", "FAMILYNAME").setValue("");
			Fragment.byId("fragCreateContactPerson", "TELNO").setValue("");
			Fragment.byId("fragCreateContactPerson", "TELNO").setMask("");
			Fragment.byId("fragCreateContactPerson", "REGIOGROUP").setSelectedKey(null);
			//	Fragment.byId("fragCreateContactPerson", "TELNO").setEnabled(false);
			Fragment.byId("fragCreateContactPerson", "TELNO").setValueState("None");
			Fragment.byId("fragCreateContactPerson", "FAXNUMBER").setValue("");
			Fragment.byId("fragCreateContactPerson", "FAXNUMBER").setMask("");
			Fragment.byId("fragCreateContactPerson", "FAXNUMBER").setValueState("None");
			Fragment.byId("fragCreateContactPerson", "EMAIL").setValue("");
			Fragment.byId("fragCreateContactPerson", "CPRNO").setValue("");
			Fragment.byId("fragCreateContactPerson", "STREET").setValue("");
			Fragment.byId("fragCreateContactPerson", "CITY").setValue("");
			Fragment.byId("fragCreateContactPerson", "COUNTRY").setValue("");
			Fragment.byId("fragCreateContactPerson", "COUNTRY").setValueState("None");
			Fragment.byId("fragCreateContactPerson", "REGION").setValue("");
			Fragment.byId("fragCreateContactPerson", "REGION").setValueState("None");
			Fragment.byId("fragCreateContactPerson", "REGION").setTokens([]);
			Fragment.byId("fragCreateContactPerson", "MOBILENO").setValue("");
			Fragment.byId("fragCreateContactPerson", "MOBILENO").setMask("");
			Fragment.byId("fragCreateContactPerson", "MOBILENO").setValueState("None");
			this._fnContractButtonCreateButtonEnabledState();

			this.fnLoadCreateContactBPIDType();
		},
		_CreateContactPersonValidation: function () {

			var that = this;
			var oContext = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			var oModel = that.getView().getModel();
			// var SalesOrg = Fragment.byId("fragCreateContactPerson", "SALESORGANIZATION").getSelectedKey();
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, oSelectedItem.SalesOrganization));
			aFilters.push(new sap.ui.model.Filter("CustomerType", sap.ui.model.FilterOperator.EQ, '1'));
			aFilters.push(new sap.ui.model.Filter("BPType", sap.ui.model.FilterOperator.EQ, '1'));
			oModel.read("/ZAE_I_TC_SCIN_08", {
				filters: aFilters,
				success: function (oData1, response) {
					if (oData1.results.length > 0) {
						for (var i = 0; i < oData1.results.length; i++) {
							var Id = Fragment.byId("fragCreateContactPerson", oData1.results[i].Field);
							if (Id !== undefined && oData1.results[i].Mandatory === true) {
								Fragment.byId("fragCreateContactPerson", oData1.results[i].Field).setRequired(true);
							}
						}
					}
					that._fnContractButtonCreateButtonEnabledState();
				}
			});
		},
		_fnContractButtonCreateButtonEnabledState: function () {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var SALUTATION = Fragment.byId("fragCreateContactPerson", "SALUTATION");
			var FIRSTNAME = Fragment.byId("fragCreateContactPerson", "FIRSTNAME");
			var FAMILYNAME = Fragment.byId("fragCreateContactPerson", "FAMILYNAME");
			var CPRNO = Fragment.byId("fragCreateContactPerson", "CPRNO");
			var COUNTRY = Fragment.byId("fragCreateContactPerson", "COUNTRY");
			var REGION = Fragment.byId("fragCreateContactPerson", "REGION");
			var TELNO = Fragment.byId("fragCreateContactPerson", "TELNO");
			var EMAIL = Fragment.byId("fragCreateContactPerson", "EMAIL");
			var FaxNumber = Fragment.byId("fragCreateContactPerson", "FAXNUMBER");
			var STREET = Fragment.byId("fragCreateContactPerson", "STREET");
			var CITY = Fragment.byId("fragCreateContactPerson", "CITY");
			var MOBILENO = Fragment.byId("fragCreateContactPerson", "MOBILENO");

			var Location = Fragment.byId("fragCreateContactPerson", "REGIOGROUP");
			var bEnabled = (SALUTATION.getRequired() ? SALUTATION.getSelectedKey() !== "" : true) &&
				(FIRSTNAME.getRequired() ? FIRSTNAME.getValue() !== "" : true) &&
				(FAMILYNAME.getRequired() ? FAMILYNAME.getValue() !== "" : true) &&
				(CPRNO.getRequired() ? CPRNO.getTokens([]).length !== "" : true) &&
				(COUNTRY.getRequired() ? COUNTRY.getTokens([]).length !== 0 : true) &&
				(REGION.getRequired() ? REGION.getTokens([]).length !== 0 : true) &&
				(TELNO.getRequired() ? (TELNO.getValue() !== "" && !(TELNO.getValue().includes("_"))) : true) &&
				(TELNO.getValueState() !== "Error" ? true : false) &&
				(FaxNumber.getRequired() ? (FaxNumber.getValue() !== "" && !(FaxNumber.getValue().includes("_"))) : true) &&
				(FaxNumber.getValueState() !== "Error" ? true : false) &&
				(EMAIL.getRequired() ? EMAIL.getValue() !== "" : true) &&
				(EMAIL.getValueState() === "None" ? true : false) &&
				// (NATIONALID.getRequired() ? NATIONALID.getValue() !== "" : true) &&
				(STREET.getRequired() ? STREET.getValue() !== "" : true) &&
				(CITY.getRequired() ? CITY.getValue() !== "" : true) &&
				(MOBILENO.getRequired() ? (MOBILENO.getValue() !== "" && !(MOBILENO.getValue().includes("_"))) : true) &&
				(MOBILENO.getValueState() !== "Error" ? true : false) &&
				(Location.getRequired() ? Location.getSelectedKey() !== "" : true);

			// var bEnabled = CITY !== "" && COUNTRY !== 0 && REGION !== 0 && FIRSTNAME !== "" && (oEmail.getValue() !== "" && oEmail.getValueState() ===
			// 		"None") &&
			// 	(MOBILENO.getValueState() !== "Error" && MOBILENO.getValue() !== "" && !(MOBILENO.getValue().includes("_"))) && ((FaxNumber.getValueState() !=
			// 		"Error" && !(FaxNumber.getValue().includes("_")))) &&
			// 	TELNO !==
			// 	"Error";
			// //(TELNO !== "" && !(TELNO.includes("_"))) &&
			oModelData.uiOnly.enable.ContactPersonCreateButton = bEnabled;
			oModel.updateBindings(true);

		},
		fnLoadCreateContactBPIDType: function () {
			var that = this;
			var CPRLabel = Fragment.byId("fragCreateContactPerson", "CPRNO").getLabels()[0];
			var oFilter1 = [];
			var Country = Fragment.byId("fragCreateContactPerson", "COUNTRY").getTokens()[0].getKey();
			oFilter1.push(new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.EQ, Country));
			this.getView().getModel().read("/ZAE_I_BPIDTypes_02", {
				filters: oFilter1,
				success: function (oData, response) {
					if (oData.results.length > 0) {
						CPRLabel.setText(oData.results[0].IDText);
					} else {
						CPRLabel.setText("Emirates ID");
					}
					that._oNewContactPersonDialog.open();
					that._oNewContactPersonDialog.getBeginButton().setEnabled(false);
				},
				error: function (Error) {
					if (FragmentID === "fragCreateContactPerson") {
						that._oNewContactPersonDialog.open();
						that._oNewContactPersonDialog.getBeginButton().setEnabled(false);
					}
				}
			});
		},

		handleValueHelpLanguage: function (oEvent) {
			var that = this;
			if (!this._valueHelpDialog2) {
				Fragment.load({
						id: "valueHelpDialogFragment",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.LanguageVH",
						controller: this
					})
					.then(function (oValueHelpDialogContent) {
						that._valueHelpDialog2 = oValueHelpDialogContent;
						that._valueHelpDialog2.setModel(that.getView().getModel());
						that.getView().addDependent(that._valueHelpDialog2);
						that._valueHelpDialog2.open();
					});
			} else {
				that._valueHelpDialog2.open();
			}
		},
		onSearchValueHelp: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilters = [];
			if (sValue) {
				aFilters.push(new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("LanguageISOCode", sap.ui.model.FilterOperator.Contains, sValue),
						new sap.ui.model.Filter("LanguageName", sap.ui.model.FilterOperator.Contains, sValue)
					],
					and: false
				}));
			}
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter(aFilters);
		},
		onLanguageValueHelpDialogClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var SelectedItemData = oEvent.getParameter("selectedItem").getBindingContext().getObject();
			var Language = Fragment.byId("fragCreateCustomer", "LANGUAGE");
			var oText = this.formatNameAndValuePair(SelectedItemData.LanguageName, SelectedItemData.LanguageISOCode);
			Language.data("key", SelectedItemData.LanguageISOCode);
			Language.setValue(oText);
		},
		handleLanguageSuggest: function (oEvent) {
			var that = this;
			var sTerm = oEvent.getParameter("suggestValue");
			var arrayFilter = [];
			var filter = new sap.ui.model.Filter(arrayFilter, bAnd);
			var bAnd = true;
			if (sTerm) {
				arrayFilter.push(new Filter({
					filters: [
						new Filter({
							path: "LanguageISOCode",
							operator: sap.ui.model.FilterOperator.StartsWith,
							value1: sTerm
						}),
						new Filter({
							path: "LanguageName",
							operator: sap.ui.model.FilterOperator.StartsWith,
							value1: sTerm
						})

					],
					and: false
				}));
			}

			var filter = new sap.ui.model.Filter(arrayFilter, bAnd);
			oEvent.getSource().getBinding("suggestionRows").filter(filter);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		onSelectLanguage: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setValue("");
				var oSelectedItem = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedItem.LanguageName, oSelectedItem.LanguageISOCode);
				oSource.setValue(oText);
				Fragment.byId("fragCreateCustomer", "LANGUAGE").data("key", oSelectedItem.LanguageISOCode);
			}

		},
		onCancelComplaint: function (oEvent) {
			this._valueHelpDialog2.close();
		},

		onCreateCustomer: function (oEvent) {

			if (!this._oNewCreateCustomerDialog) {
				Fragment.load({
						id: "fragCreateCustomer",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateCustomer",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateCustomerDialog(oDialogContent);
						// Fragment.byId("fragCreateCustomer", "IdSalesOrg").getBinding("items").attachDataReceived(function (oEvent) {
						// 	if (oEvent.getParameter("data").results.length > 1) {
						// 		var unique = [...new Map(oEvent.getParameter("data").results.map((m) => [m.SalesOrganization, m])).values()];
						// 		unique.sort(function (a, b) {
						// 			return a.SalesOrganization.localeCompare(b.SalesOrganization);
						// 		});
						// 		oEvent.getParameter("data").results = unique;
						// 	}
						// //	this.getView().getModel("mCustIdentification").setProperty("/vSalesOrganisation", unique);
						// });
						this._setCreateCustomerDialogInitialState();
					}.bind(this));
			} else {
				this._setCreateCustomerDialogInitialState();
			}
		},

		_CreateCustomerDialog: function (oDialogContent) {
			var Plant;
			var SALUTATION;
			var FIRSTNAME;
			var FAMILYNAME;
			var TELNO;
			var MOBILENO;
			var EMAIL;
			var CPRNO;
			var STREET;
			var HOUSENO;
			var POBOX;
			var CITY;
			var COUNTRY;
			var REGION;
			var PostlCode;
			var Make;
			var SalesOrganisation;
			var DistributionChannel;
			var Division;
			var CompanyCodePath;
			var mCreateCustomer;
			var CompanyCode;
			var MIDDLENAME;
			var Language;
			var NATIONALITY;
			var POSTALCODE;
			var FAXNUMBER;
			var COUNTRYTOKEN;
			var REGIONTOKEN;
			var that = this;

			this._oNewCreateCustomerDialog = new sap.m.Dialog({
				title: "{i18n>CreateCustomer}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "{i18n>Create}",
					enabled: "{mCustIdentification>/uiOnly/enable/CustomerCreateButton}",
					press: function () {
						that._oNewCreateCustomerDialog.setBusy(true);
						mCreateCustomer = that.getView().getModel("mCreateCustomer");
						//Make = Fragment.byId("fragCreateCustomer", "Make").getSelectedKey();
						Plant = that.byId("SCIN_I01").getSelectedKey();
						SALUTATION = Fragment.byId("fragCreateCustomer", "SALUTATION").getSelectedKey();
						FIRSTNAME = Fragment.byId("fragCreateCustomer", "FIRSTNAME").getValue();
						FAMILYNAME = Fragment.byId("fragCreateCustomer", "FAMILYNAME").getValue();
						TELNO = Fragment.byId("fragCreateCustomer", "TELNO").getValue().split(" ")[1];
						MOBILENO = Fragment.byId("fragCreateCustomer", "MOBILENO").getValue().split(" ")[1];
						FAXNUMBER = Fragment.byId("fragCreateCustomer", "FAXNUMBER").getValue().split(" ")[1];
						EMAIL = Fragment.byId("fragCreateCustomer", "EMAIL").getValue();
						CPRNO = Fragment.byId("fragCreateCustomer", "CPRNO").getValue();
						STREET = Fragment.byId("fragCreateCustomer", "STREET").getValue();
						HOUSENO = Fragment.byId("fragCreateCustomer", "HOUSENO").getValue();
						POBOX = Fragment.byId("fragCreateCustomer", "POBOX").getValue();
						POSTALCODE = Fragment.byId("fragCreateCustomer", "POSTALCODE").getValue();
						CITY = Fragment.byId("fragCreateCustomer", "CITY").getValue();

						CompanyCodePath = Fragment.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedItem().oBindingContexts.mCreateCustomer
							.sPath;
						CompanyCode = mCreateCustomer.getProperty(CompanyCodePath).Ccode;

						COUNTRYTOKEN = Fragment.byId("fragCreateCustomer", "COUNTRY").getTokens()[0];
						if (COUNTRYTOKEN) {
							COUNTRY = COUNTRYTOKEN.getKey();
						}
						REGIONTOKEN = Fragment.byId("fragCreateCustomer", "REGION").getTokens()[0];
						if (REGIONTOKEN) {
							REGION = REGIONTOKEN.getKey();
						}
						SalesOrganisation = Fragment.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
						DistributionChannel = Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").getSelectedKey();
						Division = Fragment.byId("fragCreateCustomer", "DIVISION").getSelectedKey();
						Language = Fragment.byId("fragCreateCustomer", "LANGUAGE").data().key.substring(0, 2);
						if (Fragment.byId("fragCreateCustomer", "LANGUAGE").getValue() === "") {
							LANGUAGE = "";
						}
						//	REGION = REGION.split("(")[0].trimEnd();
						//	PostlCode = Fragment.byId("fragCreateCustomer", "PostlCode").getValue();
						MIDDLENAME = Fragment.byId("fragCreateCustomer", "NAMEMIDDLE").getValue();
						NATIONALITY = Fragment.byId("fragCreateCustomer", "NATIONALITY").getTokens()[0]; //.getKey();
						Location = Fragment.byId("fragCreateCustomer", "REGIOGROUP").getSelectedKey();
						if (NATIONALITY !== undefined) {
							NATIONALITY = NATIONALITY.getProperty("key");
						}

						var oEntity = "ZAE_FM_SC_CUST_CREATE_FRM_CISet"; // "ZAE_FM_SC_CUST_CREATESet";
						var oModel = that.getView().getModel();
						var data = [{
								callProperty: "Plant",
								value: Plant
							}, {
								callProperty: "Ccode",
								value: CompanyCode
							}, {
								callProperty: "Salutation",
								value: SALUTATION
							}, {
								callProperty: "FirstName",
								value: FIRSTNAME
							}, {
								callProperty: "LastName",
								value: FAMILYNAME
							}, {
								callProperty: "TelNo",
								value: TELNO
							}, {
								callProperty: "MobNo",
								value: MOBILENO
							}, {
								callProperty: "Email",
								value: EMAIL
							}, {
								callProperty: "Identificationnumber",
								value: CPRNO
							}, {
								callProperty: "Street",
								value: STREET
							}, {
								callProperty: "HouseNo",
								value: HOUSENO
							}, {
								callProperty: "PoBox",
								value: POBOX
							}, {
								callProperty: "City",
								value: CITY
							}, {
								callProperty: "Country",
								value: COUNTRY
							}, {
								callProperty: "Region",
								value: REGION
							}, {
								callProperty: "Vkorg",
								value: SalesOrganisation
							}, {
								callProperty: "Vtweg",
								value: DistributionChannel
							}, {
								callProperty: "Spart",
								value: Division
							}, {
								callProperty: "Language",
								value: Language
							},
							/*{
							callProperty: "PostlCode",
							value: PostlCode
						}*/
							{
								callProperty: "MiddleName",
								value: MIDDLENAME
							}, {
								callProperty: "Nationality",
								value: NATIONALITY
							}, {
								callProperty: "PostlCode",
								value: POSTALCODE
							}, {
								callProperty: "FaxNumber",
								value: FAXNUMBER
							}, {
								callProperty: "Location",
								value: Location
							}
						];

						var succFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().getModel().refresh();
							that._oNewCreateCustomerDialog.setBusy(false);
							that._oNewCreateCustomerDialog.close();
						};

						var errFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().getModel().refresh();
							that._oNewCreateCustomerDialog.setBusy(false);
							that._oNewCreateCustomerDialog.close();
						};
						that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewCreateCustomerDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oNewCreateCustomerDialog);

		},

		_setCreateCustomerDialogInitialState: function () {
			var Language = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
			this._setDefaultValues("fragCreateCustomer");
			Fragment.byId("fragCreateCustomer", "SALESORGANIZATION").setSelectedKey(null);
			Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setSelectedKey(null);
			Fragment.byId("fragCreateCustomer", "DIVISION").setSelectedKey(null);
			Fragment.byId("fragCreateCustomer", "REGIOGROUP").setSelectedKey(null);
			Fragment.byId("fragCreateCustomer", "SALUTATION").setSelectedKey(null);
			Fragment.byId("fragCreateCustomer", "FIRSTNAME").setValue("");
			Fragment.byId("fragCreateCustomer", "FAMILYNAME").setValue("");
			Fragment.byId("fragCreateCustomer", "MOBILENO").setValue("");
			Fragment.byId("fragCreateCustomer", "MOBILENO").setMask("");
			Fragment.byId("fragCreateCustomer", "MOBILENO").setValueState("None");
			Fragment.byId("fragCreateCustomer", "FAXNUMBER").setValue("");
			Fragment.byId("fragCreateCustomer", "FAXNUMBER").setMask("");
			Fragment.byId("fragCreateCustomer", "FAXNUMBER").setValueState("None");
			//	Fragment.byId("fragCreateCustomer", "MOBILENO").setEnabled(false);
			Fragment.byId("fragCreateCustomer", "TELNO").setValue("");
			Fragment.byId("fragCreateCustomer", "TELNO").setMask("");
			//	Fragment.byId("fragCreateCustomer", "TELNO").setEnabled(false);
			Fragment.byId("fragCreateCustomer", "TELNO").setValueState("None");
			Fragment.byId("fragCreateCustomer", "EMAIL").setValue("");
			Fragment.byId("fragCreateCustomer", "CPRNO").setValue("");
			Fragment.byId("fragCreateCustomer", "STREET").setValue("");
			Fragment.byId("fragCreateCustomer", "HOUSENO").setValue("");
			Fragment.byId("fragCreateCustomer", "POBOX").setValue("");
			Fragment.byId("fragCreateCustomer", "POSTALCODE").setValue("");
			Fragment.byId("fragCreateCustomer", "CITY").setValue("");
			Fragment.byId("fragCreateCustomer", "COUNTRY").setValue("");
			//	Fragment.byId("fragCreateCustomer", "COUNTRY").setTokens([]);
			Fragment.byId("fragCreateCustomer", "COUNTRY").setValueState("None");
			Fragment.byId("fragCreateCustomer", "REGION").setValue("");
			Fragment.byId("fragCreateCustomer", "REGION").setTokens([]);
			Fragment.byId("fragCreateCustomer", "REGION").setValueState("None");
			Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setEnabled(false);
			Fragment.byId("fragCreateCustomer", "DIVISION").setEnabled(false);
			Fragment.byId("fragCreateCustomer", "LANGUAGE").setValue(Language);
			Fragment.byId("fragCreateCustomer", "LANGUAGE").data("key", Language);
			Fragment.byId("fragCreateCustomer", "NATIONALITY").setValue("");
			Fragment.byId("fragCreateCustomer", "NATIONALITY").setValueState("None");
			Fragment.byId("fragCreateCustomer", "NATIONALITY").setTokens([]);
			//Fragment.byId("fragCreateCustomer", "PostlCode").setValue("");
			Fragment.byId("fragCreateCustomer", "NAMEMIDDLE").setValue("");
			this._fnCustomerCreateButtonEnabledState();

			this.fnLoadBPIDType();
			this._oNewCreateCustomerDialog.open();
		},

		fnLoadBPIDType: function () {
			var that = this;
			var oFilter1 = [];
			var Country = Fragment.byId("fragCreateCustomer", "COUNTRY").getTokens()[0].getKey();
			oFilter1.push(new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.EQ, Country));
			// var CPRLabel = Fragment.byId("fragCreateCustomer", "CPRNO").getLabels()[0];
			var aFilter = [];
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			aFilter.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
			var oModel = this.getView().getModel();
			oModel.setUseBatch(true);
			oModel.read("/ZAE_I_BPIDTypes_02", {
				filters: oFilter1,
				groupId: "CreateCompany"
			});
			oModel.read("/ZAE_I_TC_CUST_SERV", {
				filters: aFilter,
				groupId: "CreateCompany"
			});
			oModel.setDeferredGroups(["CreateCompany"]);
			oModel.submitChanges({
				groupId: "CreateCompany",
				success: function (data1) {
					oModel.setUseBatch(false);
					that._fnCreateCustomerData(data1.__batchResponses);
				},
				error: function (error) {
					oModel.setUseBatch(false);

				}
			});
		},

		_fnCreateCustomerData: function (results) {
			var i18nModel = this.getView().getModel("i18n");
			var CPRNO = Fragment.byId("fragCreateCustomer", "CPRNO").getLabels()[0];
			if (results[0] && results[0].data.results.length > 0) {
				CPRNO.setText(results[0].data.results[0].IDText);
			} else {
				CPRNO.setText("Emirates ID");
			}
			var mCreateCustomer = this.getView().getModel("mCreateCustomer");
			mCreateCustomer.getData().oCreateCustomerData.MainResults = results[1].data.results;
			var mCreateCustomer = this.getView().getModel("mCreateCustomer");
			var SalesOrgUnique = [...new Map(results[1].data.results.map((m) => [m.SalesOrganization, m])).values()];
			SalesOrgUnique.sort(function (a, b) {
				return a.SalesOrganization.localeCompare(b.SalesOrganization);
			});
			mCreateCustomer.getData().oCreateCustomerData.CreateCustomerSalesOrg = SalesOrgUnique;
			mCreateCustomer.updateBindings(true);
			if (SalesOrgUnique.length === 1) {
				Fragment.byId("fragCreateCustomer", "SALESORGANIZATION").setSelectedKey(SalesOrgUnique[0].SalesOrganization);
				Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setEnabled(true);
				Fragment.byId("fragCreateCustomer", "DIVISION").setEnabled(true);
				this._fnCreateCustomerValidation();
				this.fnSalesOrgChange();
			}
		},

		_fnCreateCustomerValidation: function () {
			var that = this;
			var oModel = that.getView().getModel();
			var SalesOrg = Fragment.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, SalesOrg));
			aFilters.push(new sap.ui.model.Filter("CustomerType", sap.ui.model.FilterOperator.EQ, '2'));
			aFilters.push(new sap.ui.model.Filter("BPType", sap.ui.model.FilterOperator.EQ, '1'));
			oModel.read("/ZAE_I_TC_SCIN_08", {
				filters: aFilters,
				success: function (oData1, response) {
					if (oData1.results.length > 0) {
						for (var i = 0; i < oData1.results.length; i++) {
							var Id = Fragment.byId("fragCreateCustomer", oData1.results[i].Field);
							if (Id !== undefined && oData1.results[i].Mandatory === true) {
								Fragment.byId("fragCreateCustomer", oData1.results[i].Field).setRequired(true);
							}
						}
					}
					that._fnCustomerCreateButtonEnabledState();
				}
			});
		},

		// onExtendCustomer: function (oEvent) {
		// 	var that = this;
		// 	var oModelData = that.getView().getModel("mCustIdentification").getData();
		// 	var Customer = oModelData.customerInfo.to_CurrentOwner.Partner
		// 	var Plant = that.byId("SCIN_I01").getSelectedKey();

		// 	MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("ExtendingCustomer") + Customer + that.getView().getModel(
		// 		"i18n").getResourceBundle().getText("PleaseConfirm"), {
		// 		actions: [that.getView().getModel("i18n").getResourceBundle().getText("Confirm"), MessageBox.Action.CANCEL],
		// 		emphasizedAction: "{i18n>Confirm}",
		// 		onClose: function (sAction) {

		// 			if (sAction === "Confirm") {

		// 				var oEntity = "ZAE_FM_SC_CUST_EXT_FRM_CISet";
		// 				var oModel = that.getView().getModel();
		// 				var data = [{
		// 					callProperty: "Plant",
		// 					value: Plant
		// 				}, {
		// 					callProperty: "Businesspartner",
		// 					value: Customer
		// 				}];

		// 				var succFunc = function (oData) {
		// 					that.getView().getModel().refresh();
		// 				};

		// 				var errFunc = function (oData) {
		// 					that.getView().getModel().refresh();
		// 				};
		// 				that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);

		// 			}
		// 		}
		// 	});
		// },

		onExtendCustomer: function (oSource) {
			var that = this;
			var oButton = oSource;
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			if (!that._ExtendCustomerDialog) {
				Fragment.load({
					id: "fragExtendCustomer",
					name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ExtendCustomer",
					controller: {
						formatNameAndValuePair: function (sName, sValue) {
							if (!sName && !sValue) {
								return "";
							} else if (sValue && !sName) {
								return sValue.replace(/^0+/, "");
							} else if (!sValue && sName) {
								return sName;
							} else {
								return sName + " (" + sValue.replace(/^0+/, "") + ")";
							}
						},

						onSelectionChange: function (oEvent) {
							var boolIpPending = false;
							var oTableItems = Fragment.byId("fragExtendCustomer", "idExtendCustomer").getSelectedItems();
							if (oTableItems.length > 0) {
								boolIpPending = true;
							}
							Fragment.byId("fragExtendCustomer", "idSubmit").setEnabled(boolIpPending);
						},
						onSubmit: function () {
							var oModel = that.getView().getModel("ExtendCustomer");
							var oModelData = that.getView().getModel("mCustIdentification").getData();
							var Customer = oModelData.customerInfo.to_CurrentOwner.Partner
							var Regex = /\(([^)]+)\)/;
							var oEntity = "ZAE_FM_SC_CUST_EXT_FRM_CI_01Set";
							var oTableItems = Fragment.byId("fragExtendCustomer", "idExtendCustomer").getSelectedItems();
							var NavPartner = [{
								"Businesspartner": Customer
							}];
							var NavSalesAreas = [];
							oTableItems.forEach(function (oItem) {
								NavSalesAreas.push({
									"Ccode": oItem.getBindingContext().getObject().CompanyCode,
									"Vkorg": oItem.getBindingContext().getObject().SalesOrganization,
									"Vtweg": oItem.getBindingContext().getObject().DistributionChannel,
									"Spart": oItem.getBindingContext().getObject().Division,
									"RefCustomer": oItem.getBindingContext().getObject().Customer,
								});
							});
							var data = [{
								callProperty: "NavPartner",
								value: NavPartner
							}, {
								callProperty: "NavSalesAreas",
								value: NavSalesAreas
							}];
							var succFunc = function (oData) {
								that.getView().byId("SCIN_I02").fireTokenUpdate();
								that.byId("SmartTableSalesArea").rebindTable();
							};

							var errFunc = function (oData) {
								that.getView().byId("SCIN_I02").fireTokenUpdate();
								that.byId("SmartTableSalesArea").rebindTable();
							}

							that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
							that._ExtendCustomerDialog.close();
						},
						onCancel: function () {
							that._ExtendCustomerDialog.close();

						},
					}
				}).then(function (DialogContent) {
					that._ExtendCustomerDialog = DialogContent;
					that.getView().addDependent(that._ExtendCustomerDialog);
					that._initExtendCustomerDialog();

				});
			} else {
				that._initExtendCustomerDialog();
			}
		},

		_initExtendCustomerDialog: function () {
			var that = this;
			var aFilters = [];
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var Plant = that.byId("SCIN_I01").getSelectedKey();
			var BUGroup = oModelData.customerInfo.to_CurrentOwner.CustomerAccountGroup;
			Fragment.byId("fragExtendCustomer", "idExtendCustomer").removeSelections();
			Fragment.byId("fragExtendCustomer", "idSubmit").setEnabled(false);

			var oTableBinding = Fragment.byId("fragExtendCustomer", "idExtendCustomer");
			aFilters.push(new sap.ui.model.Filter({
				path: "Plant",
				operator: sap.ui.model.FilterOperator.EQ,
				// value1: "3011"
				value1: Plant
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "BuGroup",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: BUGroup
			}));

			oTableBinding.getBinding("items").filter(aFilters);
			this._ExtendCustomerDialog.open();
		},

		onCreateEquipment: function (oEvent) {

			if (!this._oNewCreateEquipmentDialog) {
				Fragment.load({
						id: "fragCreateEquipment",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateEquipment",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateEquipmentDialog(oDialogContent);
						this._setCreateEquipmentDialogInitialState();
					}.bind(this));
			} else {
				this._setCreateEquipmentDialogInitialState();
			}

		},

		fnCheckCreateEquiRequiredValidation: function () {
			this._fnEquipmentCreateButtonEnabledState();
		},

		fnCheckCreateCustomerRequiredValidation: function () {
			this._fnCustomerCreateButtonEnabledState();
		},

		_setCreateEquipmentDialogInitialState: function () {
			Fragment.byId("fragCreateEquipment", "FleetObjectType").setSelectedKey(null);
			Fragment.byId("fragCreateEquipment", "Description").setValue("");
			// Fragment.byId("fragCreateEquipment", "CompnyCode").getContent().setValue("");
			/*Fragment.byId("fragCreateEquipment", "Material").getContent().setValue("");*/
			Fragment.byId("fragCreateEquipment", "LicenseNumber").setValue("");
			Fragment.byId("fragCreateEquipment", "Customer").setValue("");
			Fragment.byId("fragCreateEquipment", "Customer").setTokens([]);
			Fragment.byId("fragCreateEquipment", "Customer").setValueState("None");
			// Fragment.byId("fragCreateEquipment", "Manufacturer").setValue("");
			// Fragment.byId("fragCreateEquipment", "ManufacturerModelNumber").setValue("");
			Fragment.byId("fragCreateEquipment", "Vinno").setValue("");
			Fragment.byId("fragCreateEquipment", "NoCyl").setValue("");
			Fragment.byId("fragCreateEquipment", "EngCC").setValue("");
			Fragment.byId("fragCreateEquipment", "Vinno").setValueState("None")
				// Fragment.byId("fragCreateEquipment", "ModelMat").setValue("");
			Fragment.byId("fragCreateEquipment", "Make").setSelectedKey(null);
			Fragment.byId("fragCreateEquipment", "Model").setSelectedKey(null);
			var aFilter = [];
			// //	aFilter.push(new sap.ui.model.Filter("InternalCharNo", sap.ui.model.FilterOperator.EQ, '0000000075'));
			aFilter.push(new sap.ui.model.Filter("Characteristic", sap.ui.model.FilterOperator.EQ, 'YEAR'));
			// //	aFilter.push(new sap.ui.model.Filter("CharacteristicValue", sap.ui.model.FilterOperator.EQ, ' '));
			Fragment.byId("fragCreateEquipment", "ModelYear").getBinding("items").filter(aFilter);
			Fragment.byId("fragCreateEquipment", "ModelYear").setSelectedKey(null);
			Fragment.byId("fragCreateEquipment", "idDeliveryDate").setDateValue(null);
			Fragment.byId("fragCreateEquipment", "idMaterial").setValue("");
			Fragment.byId("fragCreateEquipment", "idMaterial").setTokens([]);
			Fragment.byId("fragCreateEquipment", "idMaterial").setValueState("None");
			this._fnEquipmentCreateButtonEnabledState();
			this._oNewCreateEquipmentDialog.open();
		},

		_fnEquipmentCreateButtonEnabledState: function () {
			var FleetObjectType = Fragment.byId("fragCreateEquipment", "FleetObjectType").getSelectedKey();
			// var EquipmentCategory = Fragment.byId("fragCreateEquipment", "EquipmentCategory").getValue();
			var VinNo = Fragment.byId("fragCreateEquipment", "Vinno");
			var Description = Fragment.byId("fragCreateEquipment", "Description").getValue();
			var LicenseNumber = Fragment.byId("fragCreateEquipment", "LicenseNumber").getValue();
			/*			var Material = Fragment.byId("fragCreateEquipment", "Material").getValue();*/
			var Customer = Fragment.byId("fragCreateEquipment", "Customer").getTokens();
			var Make = Fragment.byId("fragCreateEquipment", "Make").getSelectedKey();
			var Model = Fragment.byId("fragCreateEquipment", "Model").getSelectedKey();
			var NoOfCyl = Fragment.byId("fragCreateEquipment", "NoCyl").getValue();
			var EngineCC = Fragment.byId("fragCreateEquipment", "EngCC").getValue();
			var ModelYear = Fragment.byId("fragCreateEquipment", "ModelYear").getSelectedKey();
			// var ModelMat = Fragment.byId("fragCreateEquipment", "ModelMat").getValue();
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var bEnabled = FleetObjectType !== "" && LicenseNumber !== "" && Customer.length > 0 &&
				Make !== null && Model !== null && Description !== "" && VinNo.getValue() !== "" && VinNo.getValueState() === "None" &&
				ModelYear !== ""; //Material !== "" && 
			oModelData.uiOnly.enable.EquipmentCreateButton = bEnabled;
			oModel.updateBindings(true);
		},

		fnCheckVinNumber: function () {
			var VinNo = Fragment.byId("fragCreateEquipment", "Vinno");
			if (VinNo.getValue().length < 17 && VinNo.getValue().length !== 0) {
				VinNo.setValueState("Error");
				VinNo.setValueStateText("Vin Number should be 17 digits ")
			} else {
				VinNo.setValueState("None");
			}
			this._fnEquipmentCreateButtonEnabledState();
		},

		onChangeEquipmentMake: function (oEvent) {
			var SelectedMake = oEvent.getParameter('selectedItem').getProperty("key");
			if (SelectedMake) {
				var aFilter = [];
				aFilter.push(new Filter('Make', 'EQ', SelectedMake));
				Fragment.byId("fragCreateEquipment", "Model").getBinding('items').filter(aFilter);
			}
		},
		onMaterialValueHelpRequested: function (oEvent1) {
			var that = this;
			var input = oEvent1.getSource();
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_VH_Material_11",
				initiallyVisibleFields: "Material,MaterialName,MaterialType",
				selectionMode: "Single",
				tokenObject: {
					key: "Material",
					Description: "MaterialName"
				},
				controlConfiguration: [{
					index: 0,
					key: "Material",
					filterType: "auto",
					label: "{/#ZAE_VH_Material_11/Material/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 1,
					key: "MaterialName",
					filterType: "auto",
					label: "{/#ZAE_VH_Material_11/MaterialName/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 2,
					key: "MaterialType",
					filterType: "auto",
					label: "{/#ZAE_VH_Material_11/MaterialType/@sap:label}",
					mandatory: "auto",
					visible: true
				}],
				defaultFilter: {},
				onBeforeRebindSmartTable: function (oEvent) {
					var vModel = Fragment.byId("fragCreateEquipment", "Model").getSelectedKey();
					var vMake = Fragment.byId("fragCreateEquipment", "Make").getSelectedKey();
					var aFilterArray = oEvent.getParameter("bindingParams").filters;
					aFilterArray.push(new sap.ui.model.Filter({
						path: "Model",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: vModel
					}));
					if (vMake === "ZNF") {
						aFilterArray.push(new sap.ui.model.Filter({
							path: "Labor",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "ZN"
						}));
					}
					oEvent.getParameter("bindingParams").filters = aFilterArray;
				}

			};
			that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
		},
		onMaterialTokenUpdate: function (oEvent) {
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
				oEvent.getSource().setTokens([])
			}
			this.fnCheckCreateEquiRequiredValidation();

		},
		onSelectMaterial: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedData.MaterialName, oSelectedData.Material);
				var oToken = new sap.m.Token({
					key: oSelectedData.Material,
					text: oText
				});
				oSource.setTokens([oToken]);
				oSource.fireTokenUpdate();
			}
		},
		handleMaterialSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			var vModel = Fragment.byId("fragCreateEquipment", "Model").getSelectedKey();
			var vMake = Fragment.byId("fragCreateEquipment", "Make").getSelectedKey();
			aFilters.push(new sap.ui.model.Filter({
				path: "Model",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: vModel
			}));
			if (vMake === "ZNF") {
				aFilters.push(new sap.ui.model.Filter({
					path: "Labor",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "ZN"
				}));
			}
			if (sTerm) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "Material",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						}),
						new Filter({
							path: "MaterialName",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						})

					],
					and: false
				}));
			}
			oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},

		_fnCustomerCreateButtonEnabledState: function () {
			//	var Make = Fragment.byId("fragCreateCustomer", "Make").getSelectedKey();
			var SALUTATION = Fragment.byId("fragCreateCustomer", "SALUTATION");
			var FIRSTNAME = Fragment.byId("fragCreateCustomer", "FIRSTNAME");
			var FAMILYNAME = Fragment.byId("fragCreateCustomer", "FAMILYNAME");
			var TELNO = Fragment.byId("fragCreateCustomer", "TELNO");
			var MOBILENO = Fragment.byId("fragCreateCustomer", "MOBILENO");
			var FaxNumber = Fragment.byId("fragCreateCustomer", "FAXNUMBER");
			var CITY = Fragment.byId("fragCreateCustomer", "CITY");
			var COUNTRY = Fragment.byId("fragCreateCustomer", "COUNTRY");
			var REGION = Fragment.byId("fragCreateCustomer", "REGION");
			var SALESORGANIZATION = Fragment.byId("fragCreateCustomer", "SALESORGANIZATION");
			var DISTRIBUTIONCHANNEL = Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL");
			var DIVISION = Fragment.byId("fragCreateCustomer", "DIVISION");
			var EMAIL = Fragment.byId("fragCreateCustomer", "EMAIL");
			var MIDDLENAME = Fragment.byId("fragCreateCustomer", "NAMEMIDDLE");
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var LOCATION = Fragment.byId("fragCreateCustomer", "REGIOGROUP");
			var CPRNO = Fragment.byId("fragCreateCustomer", "CPRNO");
			var STREET = Fragment.byId("fragCreateCustomer", "STREET");
			var HOUSENO = Fragment.byId("fragCreateCustomer", "HOUSENO");
			var POBOX = Fragment.byId("fragCreateCustomer", "POBOX");
			var POSTALCODE = Fragment.byId("fragCreateCustomer", "POSTALCODE");
			var NATIONALITY = Fragment.byId("fragCreateCustomer", "NATIONALITY");
			var LANGUAGE = Fragment.byId("fragCreateCustomer", "LANGUAGE");

			var bEnabled = (SALUTATION.getRequired() ? SALUTATION.getSelectedKey() !== "" : true) &&
				(SALESORGANIZATION.getRequired() ? SALESORGANIZATION.getSelectedKey() !== "" : true) &&
				(DISTRIBUTIONCHANNEL.getRequired() ? DISTRIBUTIONCHANNEL.getSelectedKey() !== "" : true) &&
				(DIVISION.getRequired() ? DIVISION.getSelectedKey() !== "" : true) &&
				(LOCATION.getRequired() ? LOCATION.getSelectedKey() !== "" : true) &&
				(FIRSTNAME.getRequired() ? FIRSTNAME.getValue() !== "" : true) &&
				(LANGUAGE.getRequired() ? LANGUAGE.getValue() !== "" : true) &&
				(CPRNO.getRequired() ? CPRNO.getValue() !== "" : true) &&
				(FAMILYNAME.getRequired() ? FAMILYNAME.getValue() !== "" : true) &&
				(COUNTRY.getRequired() ? COUNTRY.getTokens([]).length !== 0 : true) &&
				(COUNTRY.getValueState() !== "Error" ? true : false) &&
				(REGION.getRequired() ? REGION.getTokens([]).length !== 0 : true) &&
				(REGION.getValueState() !== "Error" ? true : false) &&
				(MOBILENO.getRequired() ? (MOBILENO.getValue() !== "" && !(MOBILENO.getValue().includes("_"))) : true) &&
				(MOBILENO.getValueState() !== "Error" ? true : false) &&
				(EMAIL.getRequired() ? EMAIL.getValue() !== "" : true) &&
				(EMAIL.getValueState() === "None" ? true : false) &&
				// (NATIONALID.getRequired() ? NATIONALID.getValue() !== "" : true) &&
				(STREET.getRequired() ? STREET.getValue() !== "" : true) &&
				(HOUSENO.getRequired() ? HOUSENO.getValue() !== "" : true) &&
				(POBOX.getRequired() ? POBOX.getValue() !== "" : true) &&
				(CITY.getRequired() ? CITY.getValue() !== "" : true) &&
				(TELNO.getRequired() ? (TELNO.getValue() !== "" && !(TELNO.getValue().includes("_"))) : true) &&
				(TELNO.getValueState() !== "Error" ? true : false) &&
				(FaxNumber.getRequired() ? (FaxNumber.getValue() !== "" && !(FaxNumber.getValue().includes("_"))) : true) &&
				(FaxNumber.getValueState() !== "Error" ? true : false) &&
				(NATIONALITY.getRequired() ? NATIONALITY.getTokens([]).length !== 0 : true) &&
				(MIDDLENAME.getRequired() ? MIDDLENAME.getValue() !== "" : true) &&
				(POSTALCODE.getRequired() ? POSTALCODE.getValue() !== "" : true);

			// var bEnabled = COUNTRY !== 0 && REGION !== 0 && SALUTATION !== "" && DistributionChannel !== "" && City !== "" && Division !==
			// 	"" && FIRSTNAME !== "" && FAMILYNAME !== "" && SalesOrganisation !== "" && TELNO !==
			// 	"Error" && (MOBILENO.getValueState() != "Error" && MOBILENO.getValue() !== "" && !(MOBILENO.getValue().includes("_"))) && ((FaxNumber.getValueState() !=
			// 		"Error" && !(FaxNumber.getValue().includes("_")))) && oEmail.getValueState() ===
			// 	"None" && MIDDLENAME !== "";
			oModelData.uiOnly.enable.CustomerCreateButton = bEnabled;
			oModel.updateBindings(true);
		},

		fnSalesOrgChange: function () {
			var mCreateCustomer = this.getView().getModel("mCreateCustomer");
			var DistributionChannel = mCreateCustomer.getData().oCreateCustomerData.MainResults;
			var DCSalesOrganisation = Fragment.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
			var DCData = DistributionChannel.filter(function (ele) {
				return ele.SalesOrganization === DCSalesOrganisation;
			});
			var DCUnique = [...new Map(DCData.map((m) => [m.DistributionChannel, m])).values()];
			DCUnique.sort(function (a, b) {
				return a.DistributionChannel.localeCompare(b.DistributionChannel);
			});
			mCreateCustomer.getData().oCreateCustomerData.CreateCustomerDC = DCUnique;
			mCreateCustomer.updateBindings(true);
			if (DCUnique.length === 1) {
				Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setSelectedKey(DCUnique[0].DistributionChannel);
				this.fnDistributionChange();
			}
			Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setEnabled(true);
			this._fnCustomerCreateButtonEnabledState();
		},
		fnDistributionChange: function (oEvent) {
			var mCreateCustomer = this.getView().getModel("mCreateCustomer");
			var Division = mCreateCustomer.getData().oCreateCustomerData.MainResults;
			var DCSalesOrganisation = Fragment.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
			var DistrbChannel = Fragment.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").getSelectedKey();
			var DivisionData = Division.filter(function (ele) {
				return ele.SalesOrganization === DCSalesOrganisation && ele.DistributionChannel === DistrbChannel;
			});
			mCreateCustomer.getData().oCreateCustomerData.CreateCustomerDivision = DivisionData;
			mCreateCustomer.updateBindings(true);
			if (DivisionData.length === 1) {
				Fragment.byId("fragCreateCustomer", "DIVISION").setSelectedKey(DivisionData[0].Division);
			}
			Fragment.byId("fragCreateCustomer", "DIVISION").setEnabled(true);
			this._fnCustomerCreateButtonEnabledState();
		},

		_CreateEquipmentDialog: function (oDialogContent) {
			var FleetObjectType;
			var Description;
			// var CompnyCode;
			// var PlanPlant;
			var LicenseNumber;
			var Customer;
			var Manufacturer;
			var ManufacturerModelNumber;
			var Vinno;
			var Material;
			var Make;
			var Model;
			var NoOfCyl;
			var EngineCC;
			var ModelYear;
			var DeliveryDateInput;
			var Plant;
			// var ModelMat
			var that = this;

			this._oNewCreateEquipmentDialog = new sap.m.Dialog({
				title: "{i18n>CreateEquipment}",
				content: [
					oDialogContent
				],
				contentWidth: "400px",
				beginButton: new sap.m.Button({
					text: "{i18n>Create}",
					enabled: "{mCustIdentification>/uiOnly/enable/EquipmentCreateButton}",
					press: function () {
						Plant = that.byId("SCIN_I01").getSelectedKey();
						FleetObjectType = Fragment.byId("fragCreateEquipment", "FleetObjectType").getSelectedKey();
						Description = Fragment.byId("fragCreateEquipment", "Description").getValue();
						// CompnyCode = Fragment.byId("fragCreateEquipment", "CompnyCode").getValue();
						// PlanPlant = Fragment.byId("fragCreateEquipment", "PlanPlant").getValue();
						LicenseNumber = Fragment.byId("fragCreateEquipment", "LicenseNumber").getValue();
						Customer = Fragment.byId("fragCreateEquipment", "Customer").getTokens()[0].getKey();
						// Manufacturer = Fragment.byId("fragCreateEquipment", "Manufacturer").getValue();
						// ManufacturerModelNumber = Fragment.byId("fragCreateEquipment", "ManufacturerModelNumber").getValue();
						Vinno = Fragment.byId("fragCreateEquipment", "Vinno").getValue();
						/*						Material = Fragment.byId("fragCreateEquipment", "Material").getValue();*/
						Make = Fragment.byId("fragCreateEquipment", "Make").getSelectedKey();
						Model = Fragment.byId("fragCreateEquipment", "Model").getSelectedKey();
						NoOfCyl = Fragment.byId("fragCreateEquipment", "NoCyl").getValue();
						EngineCC = Fragment.byId("fragCreateEquipment", "EngCC").getValue();
						ModelYear = Fragment.byId("fragCreateEquipment", "ModelYear").getSelectedKey();
						// ModelMat = Fragment.byId("fragCreateEquipment", "ModelMat").getValue();
						var vDeliveryDate = Fragment.byId("fragCreateEquipment", "idDeliveryDate").getDateValue();
						if (vDeliveryDate === null) {
							DeliveryDateInput = null;
						} else {
							var epoch = new Date(vDeliveryDate);
							epoch.setHours(6);
							DeliveryDateInput = "\/Date(" + epoch.getTime() + ")\/";
						}
						var MaterialData = Fragment.byId("fragCreateEquipment", "idMaterial").getTokens([]);
						if (MaterialData.length > 0) {
							Material = Fragment.byId("fragCreateEquipment", "idMaterial").getTokens()[0].getKey();
						} else {
							Material = "";
						}
						var oEntity = "ZAE_FM_EQU_CREATE_V1Set";
						var oModel = that.getView().getModel();
						var data = [{
								callProperty: "Objecttype",
								value: FleetObjectType
							}, {
								callProperty: "LicenseNum",
								value: LicenseNumber
							}, {
								callProperty: "Parvw",
								value: "Z1"
							}, {
								callProperty: "Parnr",
								value: Customer
							},
							/*{
								callProperty: "Manfacture",
								value: Manufacturer
							}, {
								callProperty: "Manmodel",
								value: ManufacturerModelNumber
							},*/
							{
								callProperty: "FleetVin",
								value: Vinno
							},
							/*{
								callProperty: "FleetUse",
								value: "A"
							},*/
							/*{
								callProperty: "Material",
								value: Material
							},*/
							{
								callProperty: "Planplant",
								value: Plant
							}, {
								callProperty: "Make",
								value: Make
							}, {
								callProperty: "Model",
								value: Model
							}, {
								callProperty: "Descript",
								value: Description
							}, {
								callProperty: "EngineCyl",
								value: NoOfCyl
							}, {
								callProperty: "UnitCap",
								value: "L"
							}, {
								callProperty: "Modelyear",
								value: ModelYear
							}, {
								callProperty: "DeliveryDate",
								value: DeliveryDateInput
							}, {
								callProperty: "Matnr",
								value: Material
							}
						];

						if (EngineCC !== "") {
							data.push({
								callProperty: "EngineCap",
								value: EngineCC
							});
						}

						var succFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().getModel().refresh();
						};

						var errFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().getModel().refresh();
						};

						that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
						that._oNewCreateEquipmentDialog.close();

					}
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewCreateEquipmentDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oNewCreateEquipmentDialog);
		},

		onCreateRequestPress: function () {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var Customer;
			var CustomerName;
			var CPerson;
			var CPersonName;
			var Plant;

			var CategoryValue;
			var Insurer;
			var SalesOrganization;
			var DistrChannel;
			var Division;
			var Make;
			var oCPLContext;
			var oCPLSelectedItem;
			var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			// Plant = oSelectedItem.Plant;
			Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			if (CategoryTokens === 0) {
				CategoryTokens = this.oCategory;
			}
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			// Category = this.byId("SCIN_I02").getSelectedKey();
			// CategoryValue = this.byId("SCIN_I02").getValue().split("(")[0];
			Insurer = this.byId("SCIN_I03").getSelectedKey();
			// if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
			if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
				oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
				oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CPerson = oCPLSelectedItem.ContactPerson;
				CPersonName = oCPLSelectedItem.ContactPersonName;
			} else if (this.oContactList) {
				oCPLContext = this.oContactList.getBindingContext();
				oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CPerson = oCPLSelectedItem.ContactPerson;
				CPersonName = oCPLSelectedItem.ContactPersonName;
			} else {
				CPerson = "";
				CPersonName = "";
			}
			if (oModelData.customerInfo.to_CurrentOwner && oModelData.customerInfo.to_CurrentOwner.Partner) {
				Customer = oModelData.customerInfo.to_CurrentOwner.Partner;
				CustomerName = oModelData.customerInfo.to_CurrentOwner.CustomerName;
			} else if (oModelData.customerInfo.CurrentOwner) {
				Customer = oModelData.customerInfo.CurrentOwner;
				CustomerName = oModelData.customerInfo.CustomerName;
			} else {
				Customer = "";
				CustomerName = "";
			}
			SalesOrganization = oSelectedItem.SalesOrganization;
			DistrChannel = oSelectedItem.DistrChannel;
			Division = oSelectedItem.Division;
			Make = oModelData.customerInfo.Make;
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var Salesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
			var Salesgroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
			//	var oSalesOfficeGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
			var CatlogTokens = this.getView().byId("SCIN_I02").getTokens();
			if (CatlogTokens.length === 0) {
				CatlogTokens = this.oCategory
			}
			var CampaignID = (this.CampaignID) ? this.CampaignID : "";
			var cmpgn_extid = (this.cmpgn_extid) ? this.cmpgn_extid : "";
			var Description = CatlogTokens.length > 0 ? CatlogTokens[0].getText() : "";

			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: Plant,
				Category: Category,
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: Insurer
			};
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sNewHash = "";
			oHashChanger.replaceHash(sNewHash);
			var oData = {
				Equipment: oModelData.customerInfo.Equipment ? oModelData.customerInfo.Equipment : "",
				Customer: Customer,
				CustomerName: CustomerName,
				CPerson: CPerson,
				CPersonName: CPersonName,
				Plant: Plant,
				Category: Category,
				// CategoryValue: CategoryValue,
				Insurer: Insurer,
				SalesOrganization: SalesOrganization,
				DistrChannel: DistrChannel,
				Division: Division,
				SalesOffice: Salesoffice,
				SalesGroup: Salesgroup,
				Description: Description,
				TransactionType: oModelData.SchemaTransactionType.TransactionType,
				// SalesGroup: oModelData.SalesGroup,
				"sap-iapp-state": oAppState.getKey(),
				CampaignID: CampaignID,
				Cmpgn_extid: decodeURI(cmpgn_extid),
				Make: Make
			};
			this.getRouter().navTo("ServiceRequestView", {
				param1: encodeURIComponent(JSON.stringify(oData))
			});
			this.getView().byId("SCIN_I02").removeAllTokens();

		},

		onPressServiceRequest: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			if (CategoryTokens === 0) {
				CategoryTokens = this.oCategory;
			}
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash3 = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash3);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "aeCMServiceRequest",
					action: "display"
				},
				params: {
					"aeCMServiceRequest": [oEvent.getSource().getTitle()]
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		// fnCategorizationSchemaValidationWithServiceHistry_old: function (CatSchema) {
		// 	var oModelData = this.getView().getModel("mCustIdentification").getData();
		// 	var oServiceHistory = oModelData.customerInfo.to_ServiceHistory.results;

		// 	for (var i = 0; i < CatSchema.length; i++) {
		// 		for (var j = 0; j < oServiceHistory.length; j++) {
		// 			//if (CatSchema[i].msitem === oServiceHistory[j].MSItem && CatSchema[i].Material === oServiceHistory[j].Material) {
		// 			if (CatSchema[i].msitem === oServiceHistory[j].MSItem) {
		// 				if (oServiceHistory[j].isServiced) {
		// 					CatSchema[i]["isServiced"] = true;
		// 					CatSchema[i]["ServiceStatus"] = "Completed";

		// 				}
		// 			}
		// 		}
		// 	}
		// 	return CatSchema;
		// },

		fnCategorizationSchemaValidationWithServiceHistry: function (aTreeData) {
			var oModelData = this.getView().getModel("mCustIdentification").getData();
			var oServiceHistory = oModelData.customerInfo.to_ServiceHistory.results;

			function recursive(Array, boolCTINCTOT) {
				var i = 0;
				while (i < Array.length) {
					if (Array[i].children && Array[i].children.length > 0) {
						if (Array[i].cat_desc === "CTIN" || Array[i].children && Array[i].cat_desc === "CTOT" || boolCTINCTOT || Array[i]["cat_id"].includes(
								"_RC")) {
							recursive(Array[i].children, true);
						} else {
							recursive(Array[i].children);
						}

					} else if (boolCTINCTOT) {
						for (var j = 0; j < Array.length; j++) {
							for (var k = 0; k < oServiceHistory.length; k++) {
								if (Array[j].cat_id === oServiceHistory[k].CatID) {
									if (oServiceHistory[k].isServiced) {
										Array[j]["isServiced"] = true;
										Array[j]["ServiceStatus"] = "Completed ( " + oServiceHistory[k].ServiceDocument + ", " + oServiceHistory[k].ServiceDate.toDateString() +
											" )";
										for (var l = j; l >= 0; l--) {
											Array[l]["isServiced"] = true;
										}

									}
								}
							}
						}
					}
					i++;
				}
				return Array;
			}
			var validatedArray = recursive(aTreeData);
			return validatedArray;
		},

		// handleCategoryValueHelp_old: function (oEvent) {
		// 	var cachedScriptPromises = {};
		// 	var that = this;
		// 	var input = oEvent.getSource();
		// 	var oModelData = this.getView().getModel("mCustIdentification").getData();

		// 	var ServiceContractList = oModelData.customerInfo.to_ServiceContract01.results;
		// 	var oSource = oEvent.getSource();
		// 	var oServiceContract;
		// 	for (var i = 0; ServiceContractList && i < ServiceContractList.length; i++) {
		// 		if (ServiceContractList[i].ContractStatus === "CTIN") {
		// 			oServiceContract = ServiceContractList[i];
		// 		}
		// 	}

		// 	oModelData.ConcatinatedCategorizationSchemaTreeTableData = [];
		// 	var oSet = "/GET_SCHEMA_HEADER_DATASet";
		// 	var plant = this.byId("SCIN_I01").getSelectedKey();
		// 	var Equipment = oModelData.customerInfo.Equipment;
		// 	var oPostDataObj = {
		// 		GET_SCHEMA_INPUT: [{
		// 			Equipment: Equipment,
		// 			Plant: plant,
		// 		}],
		// 		GET_SCHEMA_OUTPUT: []
		// 	};
		// 	var oCategory = that.getView().byId("SCIN_I02");
		// 	oCategory.setBusy(true);
		// 	this.getView().getModel("ZAE_FM_EQUI_GET_SCHEMA_SRV").create(oSet, oPostDataObj, {
		// 		success: function (oData, response) {

		// 			if (oData.GET_SCHEMA_OUTPUT.results.length > 0) {
		// 				for (var i = 0; i < oData.GET_SCHEMA_OUTPUT.results.length; i++) {
		// 					var SchemaID = oData.GET_SCHEMA_OUTPUT.results[i].Schemaid;
		// 					var vCatSchemaReasolveCount = 0;
		// 					cachedScriptPromises[SchemaID] = $.Deferred(function (defer) {
		// 						that.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
		// 							urlParameters: {
		// 								"$filter": "asp_id  eq \'" + SchemaID + "\'",
		// 								"$orderby": "cat_id"
		// 							},
		// 							success: function (oData, response) {
		// 								if (oData.results.length > 0) {
		// 									var oSchemaID = oData.results[0].asp_id
		// 									var aCatSchema = oData.results;
		// 									var flatData = that.aeUI5Util.genParentIdWithDiv(aCatSchema, "cat_id", "parentId", "_", 1);
		// 									var tableData = that.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
		// 									var FilteredTreeTableData;
		// 									var inContractNodes = flatData.filter((iC) => iC.CatIDType !== "").map((iM) => iM.cat_id);
		// 									var openInContractNodes = [];
		// 									inContractNodes.forEach((cn) => {
		// 										const nodeIds = cn.split('_');
		// 										for (let i = 1; i <= nodeIds.length + 1; i++) {
		// 											const tempId = nodeIds.slice(0, i).join('_');
		// 											if (!openInContractNodes.includes(tempId)) {
		// 												openInContractNodes.push(tempId);
		// 											}
		// 										}
		// 									})

		// 									var aHideNodes = [];
		// 									if (oModelData.customerInfo.ContractStatus_new === "CTIN" && oServiceContract &&
		// 										oServiceContract.to_Item.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
		// 										oServiceContract.to_Item.results[0].Material) {
		// 										var Material = oServiceContract.to_Item.results[0].Material;
		// 										aHideNodes.push({
		// 											SrviceSchemaQualifier: "CTOT",
		// 											CatIDCategory: ""
		// 										});
		// 										if (oServiceContract.CatIDCategory) {
		// 											aHideNodes.push({
		// 												SrviceSchemaQualifier: "CTIN",
		// 												CatIDCategory: Number(oServiceContract.CatIDCategory) === 1 ? "2" : "1"
		// 											});
		// 										}
		// 										FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
		// 											openInContractNodes,
		// 											flatData);
		// 									} else {
		// 										aHideNodes.push({
		// 											SrviceSchemaQualifier: "CTIN",
		// 											CatIDCategory: ""
		// 										});
		// 										FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
		// 											openInContractNodes,
		// 											flatData);
		// 									}

		// 									//***recal filter *//
		// 									// if (oModelData.customerInfo.to_EquipmentRecall.results.length > 0) {
		// 									var oRecalList = oModelData.customerInfo.to_EquipmentRecall.results;
		// 									FilteredTreeTableData = that.filterTreeRecallData(FilteredTreeTableData, oRecalList);
		// 									// }

		// 									/*	if (oModelData.MeasuringReading) {
		// 											FilteredTreeTableData = that.TreeRecurseKMReadingValidation(FilteredTreeTableData, oModelData.MeasuringReading);
		// 										}*/

		// 									/*	if (oModelData.customerInfo.to_ServiceContract02.results.length > 0) {
		// 											var oServiceContract = oModelData.customerInfo.to_ServiceContract02.results[0];
		// 											if (oServiceContract.MaterialFrom && oServiceContract.MaterialTo) {
		// 												FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
		// 											}

		// 										}*/
		// 									if (oServiceContract) {
		// 										if (oServiceContract.to_Item.results[0].MaterialFrom && oServiceContract.to_Item.results[0].MaterialTo) {
		// 											FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
		// 										}
		// 									}

		// 									FilteredTreeTableData = that.fnCategorizationSchemaValidationWithServiceHistry(FilteredTreeTableData);

		// 									oModelData.ConcatinatedCategorizationSchemaTreeTableData = oModelData.ConcatinatedCategorizationSchemaTreeTableData
		// 										.concat(
		// 											FilteredTreeTableData);
		// 								}
		// 								defer.resolve();
		// 							},
		// 							error: function () {
		// 								defer.resolve();
		// 							}
		// 						});

		// 						//	$.getScript(oData).then(defer.resolve, defer.reject);
		// 					}).promise();

		// 					cachedScriptPromises[SchemaID].done(function () {
		// 						vCatSchemaReasolveCount++;
		// 						if (Object.keys(cachedScriptPromises).length === vCatSchemaReasolveCount) {
		// 							that.fnProcessCatSchema(input);
		// 						}
		// 					});

		// 				}

		// 			} else {
		// 				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable"));
		// 				oCategory.setBusy(false);
		// 			}

		// 		},
		// 		error: function (oError) {
		// 			oCategory.setBusy(false);
		// 		}
		// 	});

		// 	/*if (!cachedScriptPromises[url]) {
		// 		cachedScriptPromises[url] = $.Deferred(function (defer) {
		// 			$.getScript(url).then(defer.resolve, defer.reject);
		// 		}).promise();
		// 	}
		// 	return cachedScriptPromises[url].done(callback);*/

		// },
		handleCategoryValueHelp: function (oEvent) {
			var that = this;
			var input = oEvent.getSource();
			var oModelData = this.getView().getModel("mCustIdentification").getData();
			var ServiceContractList = oModelData.customerInfo.to_ServiceContractNew.results;
			var oSource = oEvent.getSource();
			var oServiceContract;
			var oCategory = that.getView().byId("SCIN_I02");
			for (var i = 0; ServiceContractList && i < ServiceContractList.length; i++) {
				if (ServiceContractList[i].ContractStatus_new === "CTIN") {
					oServiceContract = ServiceContractList[i];
				}
			}
			oModelData.ConcatinatedCategorizationSchemaTreeTableData = [];
			var plant = this.byId("SCIN_I01").getSelectedKey();
			var Equipment = oModelData.customerInfo.Equipment;
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
			aFilters.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, Equipment));
			oCategory.setBusy(true);
			that.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
				// urlParameters: {
				// 	"$filter": "asp_id  eq \'" + SchemaID + "\'",
				// 	"$orderby": "cat_id"
				// },
				filters: aFilters,
				success: function (oData, response) {

					oCategory.setBusy(false);
					if (oData.results.length > 0) {
						var UniqueSchemas = [...new Set(oData.results.map(({
							asp_id
						}) => asp_id))];
						UniqueSchemas.forEach(function (oSchema) {
							var oSchemaID = oSchema;
							var oSchemaData = oData.results.filter(function (obj) {
								return obj.asp_id === oSchemaID
							});
							var aCatSchema = oSchemaData;
							var oRecalList = oModelData.customerInfo.to_EquipmentRecall.results;
							var flatData = that.aeUI5Util.genParentIdWithDiv(aCatSchema, "cat_id", "parentId", "_", 1);
							var tableData = that.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
							var FilteredTreeTableData;
							var inContractNodes = flatData.filter((iC) => iC.CatIDType !== "").map((iM) => iM.cat_id);
							var openInContractNodes = [];
							var oRecallNodes = [];
							var ESTOnodes = flatData.filter((iC) => ((iC.CatIDType === "REPR") && (iC.CatIDCategory === '18' || iC.CatIDCategory ===
								'11' || iC.CatIDCategory === '12' || iC.CatIDCategory === '26'))).map((iM) => iM.cat_id);
							inContractNodes.forEach((cn) => {
								const nodeIds = cn.split('_');
								for (let i = 1; i <= nodeIds.length + 1; i++) {
									const tempId = nodeIds.slice(0, i).join('_');
									if (!openInContractNodes.includes(tempId)) {
										openInContractNodes.push(tempId);
									}
								}
							});
							oRecalList.forEach((cn) => {
								const nodeIds = cn.ExtRecallNo.split('_');
								for (let i = 1; i <= nodeIds.length + 1; i++) {
									const tempId = nodeIds.slice(0, i).join('_');
									if (!oRecallNodes.includes(tempId)) {
										oRecallNodes.push(tempId);
									}
								}
							});
							if (oModelData.customerInfo.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
								var aShowNodes = [{
									SrviceSchemaQualifier: "REPR",
									CatIDCategory: "18"
								}, {
									SrviceSchemaQualifier: "REPR",
									CatIDCategory: "11"
								}, {
									SrviceSchemaQualifier: "REPR",
									CatIDCategory: "12"
								}, {
									SrviceSchemaQualifier: "REPR",
									CatIDCategory: "26"
								}];
								FilteredTreeTableData = that.filterTreeESTOData(tableData, aShowNodes, ESTOnodes, oRecallNodes, flatData);
								tableData = FilteredTreeTableData;
							}
							var aHideNodes = [];
							if (oModelData.customerInfo.ConcatenatedActiveSystStsName.search("ECUS") !== -1) {
								aHideNodes.push({
									SrviceSchemaQualifier: "REPR",
									CatIDCategory: "18"
								});
							}
							if (oModelData.customerInfo.ContractStatus_new === "CTIN" && oServiceContract &&
								oServiceContract.to_Item_01.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
								oServiceContract.to_Item_01.results[0].Material) {

								var Material = oServiceContract.SalesContractType === 'ZUMC' ?
									oServiceContract.to_Item_01.results[0].ReferenceMaterial :
									oServiceContract.to_Item_01.results[0].Material;
								aHideNodes.push({
									SrviceSchemaQualifier: "CTOT",
									CatIDCategory: ""
								});
								if (oServiceContract.CatIDCategory) {
									aHideNodes.push({
										SrviceSchemaQualifier: "CTIN",
										CatIDCategory: Number(oServiceContract.CatIDCategory) === 1 ? "2" : "1"
									});
								}
								FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
									openInContractNodes,
									flatData);
							} else {
								aHideNodes.push({
									SrviceSchemaQualifier: "CTIN",
									CatIDCategory: ""
								});
								FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
									openInContractNodes,
									flatData);
							}

							//***recal filter *//
							// if (oModelData.customerInfo.to_EquipmentRecall.results.length > 0) {
							FilteredTreeTableData = that.filterTreeRecallData(FilteredTreeTableData, oRecalList);
							// }

							/*	if (oModelData.MeasuringReading) {
									FilteredTreeTableData = that.TreeRecurseKMReadingValidation(FilteredTreeTableData, oModelData.MeasuringReading);
								}*/

							/*	if (oModelData.customerInfo.to_ServiceContract02.results.length > 0) {
									var oServiceContract = oModelData.customerInfo.to_ServiceContract02.results[0];
									if (oServiceContract.MaterialFrom && oServiceContract.MaterialTo) {
										FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
									}

								}*/
							if (oServiceContract) {
								if (oServiceContract.to_Item_01.results[0].MaterialFrom && oServiceContract.to_Item_01.results[0].MaterialTo) {
									FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
								}
							}

							FilteredTreeTableData = that.fnCategorizationSchemaValidationWithServiceHistry(FilteredTreeTableData);

							if (FilteredTreeTableData.length > 0 && FilteredTreeTableData[0].children.length > 0) {
								oModelData.ConcatinatedCategorizationSchemaTreeTableData = oModelData.ConcatinatedCategorizationSchemaTreeTableData
									.concat(
										FilteredTreeTableData);
							}
						});
						that.fnProcessCatSchema(input);
					}
				},
				error: function () {
					oCategory.setBusy(false);
					sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable"));

				}
			});
			// var oPostDataObj = {
			// 	GET_SCHEMA_INPUT: [{
			// 		Equipment: Equipment,
			// 		Plant: plant,
			// 	}],
			// 	GET_SCHEMA_OUTPUT: []
			// };
			// var oCategory = that.getView().byId("SCIN_I02");
			// oCategory.setBusy(true);
			// this.getView().getModel("ZAE_FM_EQUI_GET_SCHEMA_SRV").create(oSet, oPostDataObj, {
			// 	success: function (oData, response) {

			// 		if (oData.GET_SCHEMA_OUTPUT.results.length > 0) {
			// 			for (var i = 0; i < oData.GET_SCHEMA_OUTPUT.results.length; i++) {
			// 				var SchemaID = oData.GET_SCHEMA_OUTPUT.results[i].Schemaid;
			// 				var vCatSchemaReasolveCount = 0;
			// 				cachedScriptPromises[SchemaID] = $.Deferred(function (defer) {
			// 					that.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
			// 						urlParameters: {
			// 							"$filter": "asp_id  eq \'" + SchemaID + "\'",
			// 							"$orderby": "cat_id"
			// 						},
			// 						success: function (oData, response) {
			// 							if (oData.results.length > 0) {
			// 								var oSchemaID = oData.results[0].asp_id
			// 								var aCatSchema = oData.results;
			// 								var flatData = that.aeUI5Util.genParentIdWithDiv(aCatSchema, "cat_id", "parentId", "_", 1);
			// 								var tableData = that.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
			// 								var FilteredTreeTableData;
			// 								var inContractNodes = flatData.filter((iC) => iC.CatIDType !== "").map((iM) => iM.cat_id);
			// 								var openInContractNodes = [];
			// 								inContractNodes.forEach((cn) => {
			// 									const nodeIds = cn.split('_');
			// 									for (let i = 1; i <= nodeIds.length + 1; i++) {
			// 										const tempId = nodeIds.slice(0, i).join('_');
			// 										if (!openInContractNodes.includes(tempId)) {
			// 											openInContractNodes.push(tempId);
			// 										}
			// 									}
			// 								})

			// 								var aHideNodes = [];
			// 								if (oModelData.customerInfo.ContractStatus_new === "CTIN" && oServiceContract &&
			// 									oServiceContract.to_Item.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
			// 									oServiceContract.to_Item.results[0].Material) {
			// 									var Material = oServiceContract.to_Item.results[0].Material;
			// 									aHideNodes.push({
			// 										SrviceSchemaQualifier: "CTOT",
			// 										CatIDCategory: ""
			// 									});
			// 									if (oServiceContract.CatIDCategory) {
			// 										aHideNodes.push({
			// 											SrviceSchemaQualifier: "CTIN",
			// 											CatIDCategory: Number(oServiceContract.CatIDCategory) === 1 ? "2" : "1"
			// 										});
			// 									}
			// 									FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
			// 										openInContractNodes,
			// 										flatData);
			// 								} else {
			// 									aHideNodes.push({
			// 										SrviceSchemaQualifier: "CTIN",
			// 										CatIDCategory: ""
			// 									});
			// 									FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
			// 										openInContractNodes,
			// 										flatData);
			// 								}

			// 								//***recal filter *//
			// 								// if (oModelData.customerInfo.to_EquipmentRecall.results.length > 0) {
			// 								var oRecalList = oModelData.customerInfo.to_EquipmentRecall.results;
			// 								FilteredTreeTableData = that.filterTreeRecallData(FilteredTreeTableData, oRecalList);
			// 								// }

			// 								/*	if (oModelData.MeasuringReading) {
			// 										FilteredTreeTableData = that.TreeRecurseKMReadingValidation(FilteredTreeTableData, oModelData.MeasuringReading);
			// 									}*/

			// 								/*	if (oModelData.customerInfo.to_ServiceContract02.results.length > 0) {
			// 										var oServiceContract = oModelData.customerInfo.to_ServiceContract02.results[0];
			// 										if (oServiceContract.MaterialFrom && oServiceContract.MaterialTo) {
			// 											FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
			// 										}

			// 									}*/
			// 								if (oServiceContract) {
			// 									if (oServiceContract.to_Item.results[0].MaterialFrom && oServiceContract.to_Item.results[0].MaterialTo) {
			// 										FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
			// 									}
			// 								}

			// 								FilteredTreeTableData = that.fnCategorizationSchemaValidationWithServiceHistry(FilteredTreeTableData);

			// 								oModelData.ConcatinatedCategorizationSchemaTreeTableData = oModelData.ConcatinatedCategorizationSchemaTreeTableData
			// 									.concat(
			// 										FilteredTreeTableData);
			// 							}
			// 							defer.resolve();
			// 						},
			// 						error: function () {
			// 							defer.resolve();
			// 						}
			// 					});

			// 					//	$.getScript(oData).then(defer.resolve, defer.reject);
			// 				}).promise();

			// 				cachedScriptPromises[SchemaID].done(function () {
			// 					vCatSchemaReasolveCount++;
			// 					if (Object.keys(cachedScriptPromises).length === vCatSchemaReasolveCount) {
			// 						that.fnProcessCatSchema(input);
			// 					}
			// 				});

			// 			}

			// 		} else {
			// 			sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable"));
			// 			oCategory.setBusy(false);
			// 		}

			// 	},
			// 	error: function (oError) {
			// 		oCategory.setBusy(false);
			// 	}
			// });

			// /*if (!cachedScriptPromises[url]) {
			// 	cachedScriptPromises[url] = $.Deferred(function (defer) {
			// 		$.getScript(url).then(defer.resolve, defer.reject);
			// 	}).promise();
			// }
			// return cachedScriptPromises[url].done(callback);*/

		},

		onCategorySelected: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 1) {
				oModelData.CategoryLength = "";
				oModel.updateBindings(true);
			}
		},
		fnProcessCatSchema: function (input) {
			var that = this;
			that.getView().byId("SCIN_I02").setBusy(false);

			var oModelData = this.getView().getModel("mCustIdentification").getData();

			var keyCol = "cat_id";
			var valueCol = "cat_label";
			var fragName = "com.globalintelli.ZAE_SCIN_NEW.fragment.CategoryTreeDialogValueHelp";
			var checkFucc = function (oRow) {
				if (!oRow["children"]) {
					// if (oRow.heir_level === 3 || oRow.heir_level === 4) {

					if (oRow.isServiced) {
						return {
							pass: false,
							msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION_CMP"),
							type: "Success"
						};
					}
					if (oRow.KMReadingValidationRequired && !oRow.KMReadingValidationPass) {
						return {
							pass: false,
							msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION_KMR"),
							type: "Warning"
						};
					} else {
						return {
							pass: true
						};
					}

				} else {
					return {
						pass: false,
						msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION"),
						type: "Error"
					};
				}
			}.bind(this);
			that.handleTreeValueHelp(that, input, fragName, keyCol, valueCol, oModelData.ConcatinatedCategorizationSchemaTreeTableData,
				checkFucc);
		},

		convertFlatToTree: function (flat, id, parentId, SchemaID) {
			var MainRoot = [];
			var root = [];
			var map = {};
			flat.forEach(function (node) {
				if (!node[parentId]) {
					root.push(node);
					return;
				}
				var parentIndex = map[node[parentId]];
				if (typeof parentIndex !== "string") {
					parentIndex = flat.findIndex(function (el) {
						return el[id] === node[parentId];
					});
					map[node[parentId]] = parentIndex;
				}
				if (flat[parentIndex] && !flat[parentIndex].children) {
					flat[parentIndex].children = [node];
					return;
				}
				if (parentIndex < 0) {
					root.push(node);
					return;
				}
				flat[parentIndex].children.push(node);
			});
			// return root;
			MainRoot.push({
				cat_id: SchemaID,
				cat_label: SchemaID,
				children: root
			});
			return MainRoot;
		},

		handleTreeValueHelp: function (that, input, fragName, keyCol, valueCol, tableData, checkFucc) {
			var self = this;
			var inputId = input.getId();
			if (!self._valueHelpDialogs[inputId]) {
				Fragment.load({
					id: inputId + "TreeVHFragment",
					name: fragName,
					controller: {
						onTreeRowSelect: function (oEvent) {
							var oSelRow = oEvent.getParameter("rowContext").getModel().getProperty(oEvent.getParameter("rowContext").sPath);
							var checkObj = checkFucc(oSelRow);
							if (checkObj.pass) {
								input.setSelectedKey(oSelRow[keyCol]);
								input.setValue(oSelRow[valueCol] + " (" + oSelRow[keyCol] + ")");
								self._valueHelpDialogs[inputId].close();
							} else {
								var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
								oMessageStrip.setVisible(true);
								oMessageStrip.setText(checkObj.msg);
								oMessageStrip.setType(checkObj.type);
							}
						},
						onTreeMultiRowSelect: function (oEvent) {
							if (!oEvent.getParameter("rowContext")) {
								return;
							}
							var oServiceContract = that.getView().getModel("mCustIdentification").getData().customerInfo.ContractStatus_new;
							var oSelectedObjCheck = oEvent.getSource().isIndexSelected(oEvent.getParameter('rowIndex'));
							var selectedObj = oEvent.getParameter("rowContext").getObject();
							var oMultiInput = Fragment.byId(inputId + "TreeVHFragment", "CategoryMultiInput");
							var existingTokens = oMultiInput.getTokens();
							var BollAddToken = true;
							var Token;
							if (oSelectedObjCheck) {
								if (existingTokens.length > 0) {
									for (var i = 0; i < existingTokens.length; i++) {
										if (existingTokens[i].getProperty('key') === selectedObj.cat_id) {
											Token = existingTokens[i];
											BollAddToken = false;
										} else if ((existingTokens[i].getProperty('key').includes("_S_OC")) ||
											(existingTokens[i].getProperty('key').includes("_S_IC"))) {
											BollAddToken = false;
											var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
											oMessageStrip.setVisible(true);
											oMessageStrip.setText("Multiple Selection Not Allowed");
											oMessageStrip.setType("Error");
										}
									}
								}

								if (BollAddToken) {
									var checkObj = checkFucc(selectedObj);
									if (checkObj.pass) {
										Token = new sap.m.Token({
											key: selectedObj.cat_id,
											text: selectedObj.cat_label,
											customData: [new sap.ui.core.CustomData({
												value: selectedObj
											})]
										});
										oMultiInput.addToken(Token);
									} else {
										var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
										oMessageStrip.setVisible(true);
										oMessageStrip.setText(checkObj.msg);
										oMessageStrip.setType(checkObj.type);
									}
								} else {
									if (!oSelectedObjCheck) {
										oMultiInput.removeToken(Token);
									}
								}
							} else {
								var oTokens = oMultiInput.getTokens();
								var index = existingTokens.findIndex(function (obj) {
									return obj.getProperty('key') === selectedObj.cat_id;
								});
								if (index !== -1) {
									oMultiInput.removeToken(index);
									var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
									oMessageStrip.setVisible(false);
								}

							}

						},
						aditionalColumVisible: function (oEvent) {
							var boolReturn = false,
								boolRecallComplete = false,
								boolRecallPending = false,
								boolNoRecall = false;
							var vRecallCompleteCount = 0,
								vRecallPendingCount = 0;
							if (oEvent.to_EquipmentRecall.results.length > 0) {
								for (var i = 0; i < oEvent.to_EquipmentRecall.results.length; i++) {
									var oEquipmentRecall = oEvent.to_EquipmentRecall.results[i];
									if (oEquipmentRecall.WarrantyClaim !== '' && oEquipmentRecall.ServiceOrder !== '') {
										vRecallCompleteCount = vRecallCompleteCount + 1;
									} else if (oEquipmentRecall.WarrantyClaim !== '') {
										vRecallPendingCount = vRecallPendingCount + 1;
									}
								}
								boolRecallComplete = vRecallCompleteCount === oEvent.to_EquipmentRecall.results.length ? true : false;
								boolRecallPending = vRecallPendingCount > 0 ? true : false;
							} else {
								boolNoRecall = true; //	 "No Recall";
							}

							if (boolNoRecall) {
								boolReturn = false;
							} else if (boolRecallPending) {
								boolReturn = true;
							} else if (boolRecallComplete) {
								boolReturn = false;
							}
							return boolReturn;
						},

						onPressOk: function (oEvent) {
							var oModel = that.getView().getModel("mCustIdentification");
							var oModelData = oModel.getData();
							var oMultiInput = Fragment.byId(inputId + "TreeVHFragment", "CategoryMultiInput");
							oModelData.CategoryLength = oMultiInput.getTokens().length;
							oModel.updateBindings(true);
							input.setTokens(oMultiInput.getTokens());
							self._valueHelpDialogs[inputId].close();
						},

						afterClose: function () {
							Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip").setVisible(false);
						},
						onCancelPressed: function () {
							self._valueHelpDialogs[inputId].close();
						},
						onSearchTreeTable: function (oEvent) {
							var oTable = oEvent.getSource().getParent().getParent();
							if (oEvent.getParameters().refreshButtonPressed) {
								this.onRefresh(oTable);
								oTable.collapseAll();
								return;
							}
							var sQuery = oEvent.getParameter("query");
							var aFilters = [];
							if (sQuery) {
								aFilters.push(new Filter({
									filters: [
										new Filter({
											path: "cat_id",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sQuery
										}),
										new Filter({
											path: "cat_label",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sQuery
										})

									],
									and: false
								}));
							}
							oTable.getBinding("rows").filter(aFilters);
							if (aFilters.length > 0) {
								oTable.expandToLevel(3);
							} else {
								oTable.collapseAll()
							}
						},
						onRefresh: function (oTable) {
							oTable.getBinding("rows").refresh();
						}
					}
				}).then(function (oValueHelpDialogContent) {
					self._valueHelpDialogs[inputId] = oValueHelpDialogContent;
					that.getView().addDependent(self._valueHelpDialogs[inputId]);
					var TreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
					TreeTable.addEventDelegate({
						onAfterRendering: function (oEvent) {
							this.getRows().forEach(function (r) {
								if (r.getBindingContext()) {
									var obj = r.getBindingContext("undefined").getObject();
									var oStatus = obj.children && obj.children.length > 0;
									var sRow = r.sId.split("-")[r.sId.split("-").length - 1];
									var rowInd = sRow.substring(3, sRow.length);
									var columId = TreeTable.getId() + "-rowsel" + rowInd; //"#" + 
									if (oStatus) {
										$(document.getElementById(columId)).addClass("disabledbutton");
									} else {
										$(document.getElementById(columId)).removeClass("disabledbutton");
									}
								}
							});

						}
					}, TreeTable);
					var funTableRerender = function () {
						TreeTable.rerender();
					};
					TreeTable.attachModelContextChange(funTableRerender);
					TreeTable.attachToggleOpenState(funTableRerender);
					TreeTable.attachBusyStateChanged(funTableRerender);
					TreeTable.attachFirstVisibleRowChanged(funTableRerender);
					self._initTreeValueHelpDialog(inputId, tableData);
				});
			} else {

				self._initTreeValueHelpDialog(inputId, tableData);
			}
		},

		_initTreeValueHelpDialog: function (inputId, tableData) {
			var TreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.setData(tableData);
			TreeTable.setModel(oJsonModel);
			TreeTable.bindRows({
				path: '/',
				parameters: {
					arrayNames: ['children']
				}
			});
			var CategoryMultiInput = Fragment.byId(inputId + "TreeVHFragment", "CategoryMultiInput");
			CategoryMultiInput.removeAllTokens();
			Fragment.byId(inputId + "TreeVHFragment", "searchField").setValue("");

			this._valueHelpDialogs[inputId].open();
		},

		handlePlantValueHelp: function (oEvent) {
			var that = this;
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var input = oEvent.getSource();
			var inputLabel = that.aeUI5Util.geti18nText(that, "PLANT");
			var vhEntitySet = "ZAE_I_Plant_03";
			var vhSearchKey = "ValuationArea";
			var vhSearchText = "PlantName";
			/*	var vhEntitySetFilter = {};
				if (oModelData.customerInfo.SalesOrganization) {
					vhEntitySetFilter = {
						path: "SalesOrganization",
						operator: "EQ",
						value1: oModelData.customerInfo.SalesOrganization
					};
				}*/
			this.aeUI5Util.handleDialogValueHelp(that, input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText);
		},

		onPlantSelected: function (oEvent) {

			var that = this;
			if (!BaseController.MainAppState && !that.Equipment) {
				this.fnRestPageData();
			}

			var input = oEvent.getSource();
			var oModelData = this.getView().getModel("mCustIdentification").getData();
			/*	var Category,
					Categoryval; 
				if (oModelData.CategoryFromHash !== "" && oModelData.Category === "") {
					Category = oModelData.CategoryFromHash;
					Categoryval = oModelData.CategoryFromHash.split("(")[1].replace(")", "");
					this.getView().getModel("mCustIdentification").updateBindings(true);
				} else {
					Category = "";
					Categoryval = "";
				}*/
			that.getView().byId("EquipmentVH").setBusy(true);
			this.getView().getModel().read("/ZAE_I_TC_SCIN_03", {
				urlParameters: {
					"$filter": "Plant  eq \'" + input.getSelectedKey() + "\'"
				},
				success: function (oData, response) {
					that.getView().byId("EquipmentVH").setBusy(false);
					if (oData.results.length > 0) {
						oModelData.SchemaTransactionType = oData.results[0];
						// that.getView().byId("SCIN_I02").setSelectedKey(Categoryval);
						// that.getView().byId("SCIN_I02").setValue(Category);
						if (!that.Equipment) {
							that.getView().byId("SCIN_I02").removeAllTokens();
						}
					} else {
						oModelData.SchemaTransactionType.RelForWarRecSC = false;
					}
				},
				error: function (Error) {
					that.getView().byId("EquipmentVH").setBusy(false);
				}
			});

			this.getView().getModel().read("/ZAE_I_AssignPlantCompanyCode", {
				urlParameters: {
					"$filter": "Plant  eq \'" + input.getSelectedKey() + "\'"
				},
				success: function (oData, response) {
					if (oData.results.length > 0) {
						oModelData.PlantCompCode = oData.results[0];
					}
				},
				error: function (Error) {

				}
			});

			this.getView().getModel().read("/ZAE_I_TVKWZ_ASSIGN", {
				urlParameters: {
					"$filter": "Plant  eq \'" + input.getSelectedKey() + "\'"
				},
				success: function (oData, response) {
					if (oData.results.length > 0) {
						oModelData.SalesOrg = oData.results[0].SalesOrganization;
						//	that.byId("vehiclehistory").rebindTable();
					}
				},
				error: function (Error) {

				}
			});

			that.byId("SmartTableSalesArea").rebindTable();

		},

		handleInsurerValueHelp: function (oEvent) {
			var that = this;
			var input = oEvent.getSource();
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var inputLabel = that.getView().getModel("i18n").getResourceBundle().getText("Insurer");
			var vhEntitySet = "ZAE_C_EquipmentInsurance_01";
			var vhSearchKey = "InsurancePartner";
			var vhSearchText = "PartnerName";
			var vhInfo = "InsuranceType";
			var vhEntitySetFilter = {
				path: 'Equipment',
				operator: 'EQ',
				value1: oModelData.customerInfo.Equipment
			};
			this.handleInsuranceDialogValueHelp(that, input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter, vhInfo);
		},

		fnCheckCreateAppointmentButtonEnable: function (WorkShop, Category, SalesAreaLength, customer, Partner, BlockedStatus, userStatus,
			ContractStatus, contactPersonselected) {
			// if (WorkShop && Category && SalesAreaLength > 0 && (customer || Partner) && BlockedStatus === "") {
			if (WorkShop && Category > 0 && SalesAreaLength > 0 && (customer || Partner) && userStatus !== "E0025" && ContractStatus !==
				"CTER" && contactPersonselected) {
				return true;
			}
			return false;
		},
		fnCheckExtendCustomerButtonEnable: function (WorkShop, Partner) {
			if (WorkShop && Partner) {
				return true;
			}
			return false;
		},

		filterTreeData: function (data, SchemaID, aHideContractStatusCode, Material, inContractNodes, flatData) {
			var tData = data;
			if (tData && tData.length > 0) {

				// var inContractChildFilter = function (cat_id) {
				// 	var parentNode = flatData.find((f) => f.cat_id == cat_id);
				// 	if (parentNode && parentNode.parentId) {
				// 		var sParentNode = flatData.find((f) => f.cat_id == parentNode.parentId);
				// 		if (sParentNode && sParentNode.cat_desc == "CTIN") {
				// 			return true;
				// 		}
				// 	}
				// 	return false;
				// }

				var inContractFilter = function (cat_id) {
					var count = 0;
					inContractNodes.forEach((iC) => {
						if (iC === cat_id) {
							count = count + 1;
						}
					});
					return count > 0;
				}

				var matFilter = function (d) {
					return d.filter(function (o) {
						var tO = o;
						// return (tO.Material === Material || inContractChildFilter(tO.parentId) || inContractChildFilter(tO.cat_id));
						return tO.Material === Material;
					});
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;

						var temp = tO.cat_id;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (Material && tO.cat_desc === "CTIN" && tO.children) { //material filter
							tO.children = matFilter(tO.children);
						}

						var showNode = true;
						for (var i = 0; i < aHideContractStatusCode.length; i++) {
							if (aHideContractStatusCode[i].CatIDCategory === "" && aHideContractStatusCode[i].SrviceSchemaQualifier === tO.cat_desc) {
								showNode = false;
							} else if (aHideContractStatusCode[i].CatIDCategory === tO.CatIDCategory && aHideContractStatusCode[i].SrviceSchemaQualifier ===
								tO.cat_desc) {
								showNode = false;
							} else if (aHideContractStatusCode[i].CatIDCategory === tO.CatIDCategory && aHideContractStatusCode[i].SrviceSchemaQualifier ===
								tO.CatIDType) {
								showNode = false;
							}
						}

						if (showNode !== false && inContractFilter(tO.cat_id)) {
							return true;
						}

						return (
							tO.parentId !== SchemaID || tO.SrviceSchemaQualifier === '' || showNode
						);
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},
		filterTreeESTOData: function (data, ShowNodes, inContractNodes, oRecallNodes, flatData) {
			var tData = data;
			if (tData && tData.length > 0) {
				var inContractFilter = function (cat_id) {
					var count = 0;
					inContractNodes.forEach((iC) => {
						if (iC === cat_id) {
							count = count + 1;
						}
					});
					return count > 0;
				}
				var RecallFilter = function (cat_id) {
					var count = 0;
					oRecallNodes.forEach((iC) => {
						if (iC === cat_id) {
							count = count + 1;
						}
					});
					return count > 0;
				}
				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						var temp = tO.cat_id;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						var showNode = false;
						for (var i = 0; i < ShowNodes.length; i++) {
							if (ShowNodes[i].CatIDCategory === tO.CatIDCategory && ShowNodes[i].SrviceSchemaQualifier === tO.CatIDType) {
								showNode = true;
							} else if (!tO.CatIDCategory) {
								showNode = true;
							}
						}
						if (showNode === false && (inContractFilter(tO.cat_id) || RecallFilter(tO.cat_id))) {
							return true;
						}
						return showNode
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},

		filterTreeData_old: function (data, SchemaID, aContractStatusCode, Material) {
			var tData = data;
			if (tData && tData.length > 0) {

				var matFilter = function (d) {
					return d.filter(function (o) {
						var tO = o;
						return tO.Material === Material;
					});
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (Material && tO.cat_desc === "CTIN" && tO.children) {
							tO.children = matFilter(tO.children);
						}

						return (
							tO.parentId !== SchemaID || tO.cat_desc === '' || aContractStatusCode.includes(tO.cat_desc)
						);
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},

		filterTreeRecallData: function (data, oRecallList) {
			var tData = data;
			if (tData && tData.length > 0) {
				var RecallFilter = function (d) {
					return d.filter(function (o) {
						var boolRecallFound = 0;
						var tO = o;
						for (var i = 0; i < oRecallList.length; i++) {
							// if (tO.cat_id == oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder ==="") {
							if (tO.cat_id === oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder !== "" && oRecallList[i].MaintenanceOrder !==
								"" &&
								oRecallList[i].SystemStatus.includes("TECO")) {
								tO["Status"] = "TECO";
							} else if (tO.cat_id === oRecallList[i].ExtRecallNo && tO["Status"] !== "TECO") {
								boolRecallFound = boolRecallFound + 1;
								tO["ValidFrom"] = oRecallList[i].ValidFrom;
								tO["ValidTo"] = oRecallList[i].ValidTo;
								tO["Info"] = oRecallList[i].Info;
							}
						}
						return boolRecallFound > 0;
					});
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (tO.cat_id.slice(-4) === "S_RC") {
							var rChildren = RecallFilter(tO.children);
							tO.children = rChildren;
							return rChildren.length > 0;
						}
						return d;
					});

				};

				tData = filterFunc(tData);
			}
			return tData;
		},
		// filterTreeRecallData: function (data, oRecallList) {
		// 	var tData = data;
		// 	if (tData && tData.length > 0) {
		// 		var RecallFilter = function (d) {
		// 			var boolRecallFound = 0;
		// 			d.forEach(function (o) {
		// 				var tO = o;
		// 				for (var i = 0; i < oRecallList.length; i++) {
		// 					// if (tO.cat_id == oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder ==="") {
		// 					if (tO.cat_id === oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder !== "" && oRecallList[i].MaintenanceOrder !==
		// 						"" &&
		// 						oRecallList[i].SystemStatus.includes("TECO")) {
		// 						tO["Status"] = "TECO";
		// 					} else if (tO.cat_id === oRecallList[i].ExtRecallNo && tO["Status"] !== "TECO") {
		// 						boolRecallFound = boolRecallFound + 1;
		// 						tO["ValidFrom"] = oRecallList[i].ValidFrom;
		// 						tO["ValidTo"] = oRecallList[i].ValidTo;
		// 						tO["Info"] = oRecallList[i].Info;
		// 					}
		// 				}
		// 			});
		// 			return boolRecallFound > 0;
		// 		};

		// 		var filterFunc = function (d) {
		// 			return d.filter(function (o) {
		// 				var tO = o;
		// 				if (tO.children) {
		// 					tO.children = filterFunc(tO.children);
		// 				}
		// 				if (tO.cat_id.slice(-4) === "S_RC") {
		// 					return RecallFilter(tO.children);
		// 				}
		// 				return d;
		// 			});

		// 		};

		// 		tData = filterFunc(tData);
		// 	}
		// 	return tData;
		// },

		// filterTreeMaterialKM: function (aTreeData, oServiceCOntract) {
		// 	function recursive(Array, boolCTINCTOT) {
		// 		var i = 0;
		// 		var filtArray = [];
		// 		var BoolFilterArray = false;
		// 		while (i < Array.length) {
		// 			if (Array[i].children && Array[i].children.length > 0) {
		// 				if (Array[i].cat_desc === "CTIN" || Array[i].children && Array[i].cat_desc === "CTOT" || boolCTINCTOT) {
		// 					Array[i].children = recursive(Array[i].children, true);
		// 				} else {
		// 					Array[i].children = recursive(Array[i].children);
		// 				}
		// 			} else if (boolCTINCTOT) {
		// 				BoolFilterArray = true;
		// 				var BoolStartingKMS = false;
		// 				var BoolEndingKMS = false;
		// 				Array.sort((a, b) => {
		// 					return Number(a.cat_sequence) - Number(b.cat_sequence);
		// 				});
		// 				filtArray = Array.filter(function (o) {
		// 					var tO = o;
		// 					if (oServiceCOntract.to_Item_01.results && oServiceCOntract.to_Item_01.results.length > 0 && tO.Material === oServiceCOntract
		// 						.to_Item_01
		// 						.results[0].MaterialFrom) {
		// 						BoolStartingKMS = true;
		// 						return true;
		// 					} else if (oServiceCOntract.to_Item_01.results && oServiceCOntract.to_Item_01.results.length > 0 && tO.Material ===
		// 						oServiceCOntract.to_Item_01.results[0].MaterialTo) {
		// 						BoolEndingKMS = true;
		// 						return true;
		// 					} else if (BoolStartingKMS && BoolEndingKMS === false) {
		// 						return true;
		// 					} else {
		// 						return false;
		// 					}
		// 				});
		// 			}
		// 			i++;
		// 		}
		// 		if (BoolFilterArray) {
		// 			Array = filtArray;
		// 		}
		// 		return Array;
		// 	}

		// 	return recursive(aTreeData);
		// },
		filterTreeMaterialKM: function (aTreeData, oServiceCOntract) {
			function recursive(Array, boolCTINCTOT) {
				var i = 0;
				var filtArray = [];
				var BoolFilterArray = false;
				while (i < Array.length) {
					if (Array[i].children && Array[i].children.length > 0) {
						if (Array[i].cat_desc === "CTIN" || Array[i].children && Array[i].cat_desc === "CTOT" || boolCTINCTOT) {
							Array[i].children = recursive(Array[i].children, true);
						} else {
							Array[i].children = recursive(Array[i].children);
						}
					} else if (boolCTINCTOT) {
						BoolFilterArray = true;
						filtArray = Array.filter(function (o) {
							var tO = o;
							if (tO.msitem && oServiceCOntract.to_Item_01.results && oServiceCOntract.to_Item_01.results.length > 0) {
								var msitem = tO.msitem.replace(/[^0-9.]+/g, "");
								msitem = parseFloat(msitem);
								if (isNaN(msitem)) {
									msitem = 0;
								}
								var FromMsItem = oServiceCOntract.to_Item_01.results[0].FromMsItem.replace(/[^0-9.]+/g, "");
								var ToMsItem = oServiceCOntract.to_Item_01.results[0].ToMsItem.replace(/[^0-9.]+/g, "");
								if (FromMsItem && ToMsItem && msitem >= parseFloat(FromMsItem) && msitem <= parseFloat(ToMsItem)) {
									return true;
								} else {
									return false;
								}
							} else {
								return false;
							}
						});
					}
					i++;
				}
				if (BoolFilterArray) {
					Array = filtArray;
				}
				return Array;
			}

			return recursive(aTreeData);
		},

		TreeRecurseKMReadingValidation: function (aTreeData, LatestMeasuringReading) {

			function recursive(Array, LatestReadingValue, boolCTINCTOT) {
				var i = 0;
				while (i < Array.length) {
					if (Array[i].children && Array[i].children.length > 0) {
						if (Array[i].cat_desc === "CTIN" || Array[i].children && Array[i].cat_desc === "CTOT" || boolCTINCTOT) {
							recursive(Array[i].children, LatestReadingValue, true);
						} else {
							recursive(Array[i].children, LatestReadingValue);
						}

					} else if (boolCTINCTOT) {
						var boolValidationPassed = false;
						for (var j = 0; j < Array.length; j++) {
							// if (Number(Array[j].odm_reading) > 0) {
							Array[j]["KMReadingValidationRequired"] = true;
							if (!boolValidationPassed) {
								Array[j]["KMReadingValidationPass"] = false;
							}
							if (j === Array.length - 1) {
								if (Number(Array[j].odm_reading) == LatestReadingValue) {
									Array[j]["KMReadingValidationPass"] = true;
									boolValidationPassed = true;
								}
							} else if (LatestReadingValue < Number(Array[j].odm_reading) && !boolValidationPassed) {
								Array[j]["KMReadingValidationPass"] = true;
								boolValidationPassed = true;

							} else if (Number(Array[j].odm_reading) <= LatestReadingValue && LatestReadingValue < Number(Array[j + 1].odm_reading)) {
								Array[j]["KMReadingValidationPass"] = true;
								Array[j + 1]["KMReadingValidationPass"] = true;
								boolValidationPassed = true;

							}
							// }

						}
					}
					i++;
				}
				return Array;
			}

			return recursive(aTreeData, LatestMeasuringReading);
		},

		fnResourceLoad: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var vPlant = this.byId("SCIN_I01").getSelectedKey();
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};

			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ResourceLoad",
					action: "aesDisplay"
				},
				params: {
					"Plant": vPlant
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		fnMoreEquipmentInfo: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var oMdelData = this.getView().getModel("mCustIdentification").getData();
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};

			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Equipment",
					action: "aeuDisplay"
				},
				params: {
					"Equipment": oMdelData.customerInfo.Equipment
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
		},

		fnMoreCustomerInfo: function (oEvent) {

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var oMdelData = this.getView().getModel("mCustIdentification").getData();
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};

			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Customer",
					action: "aeDisplay"
				},
				params: {
					"Customer": oMdelData.customerInfo.CurrentOwner
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		fnShowCountryValueHelp: function (oEvent) {

			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			//	Fragment.byId("fragCreateCustomer", "REGION").setValue("");
			if (!this._CountryValueHelpDialog) {
				Fragment.load({
						id: "CountrValueHelpDialogFragment",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CountryVH",
						controller: {
							fnCreateMask: function (CountryCode, Maxlength) {
								var Mask = "";
								CountryCode.split('').forEach(function (obj) {
									if (obj === "9") {
										Mask += "^" + obj;
									} else {
										Mask += obj;
									}
								});
								Mask += " ";
								var PadEndCount = Mask.length + (Maxlength - CountryCode.length) + 1;
								Mask = Mask.padEnd(PadEndCount, "9");
								return Mask;
							},
							_handleValueHelpClose: function (oEvt1) {
								var oSelectedItem = oEvt1.getParameter("selectedItem");
								// if (oSelectedItem) {
								// 	var input = Fragment.byId("fragCreateCustomer", "COUNTRY");
								// 	input.setValue("");
								// 	input.setValueState("None");
								// }
								var EMIRATESID;
								// if (oSelectedItem) {
								// 	var oSelectedItemData = oSelectedItem.getBindingContext().getObject();
								// 	var CRNO = oSelectedItem.getBindingContext().getObject("IDText");
								// 	var CRNOLabel = Fragment.byId(CallerId, "CPRNO");
								// 	if (CRNOLabel) {
								// 		EMIRATESID = CRNOLabel.getLabels()[0];
								// 		EMIRATESID.setText(CRNO);
								// 	}
								// }
								if (oSelectedItem) {

									var oSelectedItemData = oSelectedItem.getBindingContext().getObject();
									var CRNO = oSelectedItem.getBindingContext().getObject("IDText");
									var CRNOLabel = Fragment.byId(CallerId, "CPRNO");
									if (CRNOLabel && CRNO !== "") {
										EMIRATESID = CRNOLabel.getLabels()[0];
										EMIRATESID.setText(CRNO);
									} else {
										if (CRNOLabel) {
											EMIRATESID = CRNOLabel.getLabels()[0];
											EMIRATESID.setText("Emirates ID");
										}
									}
									var input = Fragment.byId(CallerId, "COUNTRY");
									input.setValue("");
									input.setValueState("None");
									input.setTokens([]);
									var oText = oSelectedItem.getTitle() + " ( " + oSelectedItem.getDescription() + " )";
									input.addToken(new Token({
										key: oSelectedItem.getTitle(),
										text: oText
									}));
									Fragment.byId(CallerId, "REGION").setTokens([]);
									Fragment.byId(CallerId, "REGION").setValue("");
									Fragment.byId(CallerId, "REGION").setValueState("None");
									var CountryCode = "+" + oSelectedItemData.CountryCode;
									var MobileNo = Fragment.byId(CallerId, "MOBILENO");
									var TELNO = Fragment.byId(CallerId, "TELNO");
									var FAXNUMBER = Fragment.byId(CallerId, "FAXNUMBER");
									if (oSelectedItemData.Country === "AE") {
										var MaxLengthMobile = oSelectedItemData.CountryCode.length + 9;
										var MaxLengthTELNO = oSelectedItemData.CountryCode.length + 8;
										var MaxLengthFAXNUMBER = oSelectedItemData.CountryCode.length + 9;
										var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
										var TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
										var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
									} else if (oSelectedItemData.Country === "OM") {
										var MaxLengthMobile = oSelectedItemData.CountryCode.length + 8;
										var MaxLengthTELNO = oSelectedItemData.CountryCode.length + 8;
										var MaxLengthFAXNUMBER = oSelectedItemData.CountryCode.length + 8;
										var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
										var TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
										var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
									} else {
										MaxLengthMobile = oSelectedItemData.CountryCode.length + 10;
										MaxLengthTELNO = oSelectedItemData.CountryCode.length + 10;
										MaxLengthFAXNUMBER = oSelectedItemData.CountryCode.length + 10;
										MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
										TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
										FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
									}
									if (MobileNo) {
										if (MobileNo.getValue()) {
											MobileNo.setValue(CountryCode + " " + MobileNo.getValue().split(" ")[1]);
										}
										MobileNo.setMask(MobileMask);
										MobileNo.setEnabled(true);
										MobileNo.fireChange();
									}
									if (FAXNUMBER.getValue()) {
										FAXNUMBER.setValue(CountryCode + " " + FAXNUMBER.getValue().split(" ")[1]);
									}

									FAXNUMBER.setMask(FAXNUMBERMask);
									FAXNUMBER.setEnabled(true);
									FAXNUMBER.fireChange();
									if (TELNO.getValue()) {
										TELNO.setValue(CountryCode + " " + TELNO.getValue().split(" ")[1]);
									}

									TELNO.setMask(TELNOMask);
									TELNO.setEnabled(true);
									TELNO.fireChange();
								} else {
									TELNO.setEnabled(false);
									TELNO.setMask("");
									TELNO.setValue("");
									if (MobileNo) {
										MobileNo.setEnabled(false);
										MobileNo.setMask("");
										MobileNo.setValue("");
									}
								}
								oEvt1.getSource().getBinding("items").filter([]);
								switch (CallerId) {
								case "fragCreateCustomer":
									that.fnCheckCreateCustomerRequiredValidation();
									break;
								case "fragCreateCompany":
									that.fnCheckCreateCompanyRequiredValidation();
									break;
								}

								//		that.fnCheckCreateCustomerRequiredValidation();
							},
							_handleValueHelpSearch: function (oEvt2) {
								var sValue = oEvt2.getParameter("value");
								var inputFilter = new sap.ui.model.Filter({
									filters: that.genFilterArr([{
										path: "Country",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}, {
										path: "CountryName",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}])
								});
								var oFilter = inputFilter;
								that._CountryValueHelpDialog.getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
							}
						}
					})
					.then(function (oValueHelpDialogContent) {
						that._CountryValueHelpDialog = oValueHelpDialogContent;
						oValueHelpDialogContent.open();
						oValueHelpDialogContent.setModel(that.getView().getModel());
					}, this);
			} else {
				that._CountryValueHelpDialog.getBinding("items").filter([], sap.ui.model.FilterType.Application);
				this._CountryValueHelpDialog.open();
			}

		},

		fnShowCreateContactPersonCountryValueHelp: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			if (!this._ContactPersonCountryValueHelpDialog) {
				Fragment.load({
						id: "ContactPersonCountryValueHelpDialogFragment",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CountryVH",
						controller: {
							fnCreateMask: function (CountryCode, Maxlength) {
								var Mask = "";
								CountryCode.split('').forEach(function (obj) {
									if (obj === "9") {
										Mask += "^" + obj;
									} else {
										Mask += obj;
									}
								});
								Mask += " ";
								var PadEndCount = Mask.length + (Maxlength - CountryCode.length) + 1;
								Mask = Mask.padEnd(PadEndCount, "9");
								return Mask;
							},
							_handleValueHelpClose: function (oEvt1) {
								var oSelectedItem = oEvt1.getParameter("selectedItem");
								var EMIRATESID;
								// if (oSelectedItem) {
								// 	var input = Fragment.byId("fragCreateContactPerson", "COUNTRY");
								// 	input.setValue(oSelectedItem.getProperty("title"));
								// }
								if (oSelectedItem) {
									var oSelectedItemData = oSelectedItem.getBindingContext().getObject();
									var CRNO = oSelectedItem.getBindingContext().getObject("IDText");
									var CRNOLabel = Fragment.byId(CallerId, "CPRNO");
									if (CRNOLabel && CRNO !== "") {
										EMIRATESID = CRNOLabel.getLabels()[0];
										EMIRATESID.setText(CRNO);
									} else {
										if (CRNOLabel) {
											EMIRATESID = CRNOLabel.getLabels()[0];
											EMIRATESID.setText("Emirates ID");
										}
									}
									var input = Fragment.byId(CallerId, "COUNTRY");
									input.setValue("");
									input.setValueState("None");
									input.setTokens([]);
									var oText = oSelectedItem.getTitle() + " ( " + oSelectedItem.getDescription() + " )";
									input.addToken(new Token({
										key: oSelectedItem.getTitle(),
										text: oText
									}));
									Fragment.byId(CallerId, "REGION").setTokens([]);
									Fragment.byId(CallerId, "REGION").setValue("");
									Fragment.byId(CallerId, "REGION").setValueState("None");
									var CountryCode = "+" + oSelectedItemData.CountryCode;
									var MobileNo = Fragment.byId(CallerId, "MOBILENO");
									var TELNO = Fragment.byId(CallerId, "TELNO");
									var FAXNUMBER = Fragment.byId(CallerId, "FAXNUMBER");
									if (oSelectedItemData.Country === "AE") {
										var MaxLengthMobile = oSelectedItemData.CountryCode.length + 9;
										var MaxLengthTELNO = oSelectedItemData.CountryCode.length + 8;
										var MaxLengthFAXNUMBER = oSelectedItemData.CountryCode.length + 9;
										var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
										var TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
										var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
									} else if (oSelectedItemData.Country === "OM") {
										var MaxLengthMobile = oSelectedItemData.CountryCode.length + 8;
										var MaxLengthTELNO = oSelectedItemData.CountryCode.length + 8;
										var MaxLengthFAXNUMBER = oSelectedItemData.CountryCode.length + 8;
										var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
										var TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
										var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
									} else {
										MaxLengthMobile = oSelectedItemData.CountryCode.length + 10;
										MaxLengthTELNO = oSelectedItemData.CountryCode.length + 10;
										MaxLengthFAXNUMBER = oSelectedItemData.CountryCode.length + 10;
										MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
										TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
										FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
									}
									if (MobileNo) {
										if (MobileNo.getValue()) {
											MobileNo.setValue(CountryCode + " " + MobileNo.getValue().split(" ")[1]);
										}
										MobileNo.setMask(MobileMask);
										MobileNo.setEnabled(true);
										MobileNo.fireChange();
									}
									if (FAXNUMBER.getValue()) {
										FAXNUMBER.setValue(CountryCode + " " + FAXNUMBER.getValue().split(" ")[1]);
									}

									FAXNUMBER.setMask(FAXNUMBERMask);
									FAXNUMBER.setEnabled(true);
									FAXNUMBER.fireChange();
									if (TELNO.getValue()) {
										TELNO.setValue(CountryCode + " " + TELNO.getValue().split(" ")[1]);
									}
									TELNO.setMask(TELNOMask);
									TELNO.setEnabled(true);
									TELNO.fireChange();
								} else {
									var TELNO = Fragment.byId(CallerId, "TELNO");
									TELNO.setEnabled(false);
									TELNO.setMask("");
									TELNO.setValue("");
								}

								oEvt1.getSource().getBinding("items").filter([]);
								//		that._fnContractButtonCreateButtonEnabledState();
							},
							_handleValueHelpSearch: function (oEvt2) {
								var sValue = oEvt2.getParameter("value");
								var inputFilter = new sap.ui.model.Filter({
									filters: that.genFilterArr([{
										path: "Country",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}, {
										path: "CountryName",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}])
								});
								var oFilter = inputFilter;
								that._ContactPersonCountryValueHelpDialog.getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);
							}
						}
					})
					.then(function (oValueHelpDialogContent) {
						that._ContactPersonCountryValueHelpDialog = oValueHelpDialogContent;
						oValueHelpDialogContent.open();
						oValueHelpDialogContent.setModel(that.getView().getModel());
					}, this);
			} else {
				that._ContactPersonCountryValueHelpDialog.getBinding("items").filter([], sap.ui.model.FilterType.Application);
				this._ContactPersonCountryValueHelpDialog.open();
			}

		},
		handleCountrySuggest: function (oEvent) {
			var that = this;
			var sValue = oEvent.getParameter("suggestValue");
			if (sValue) {
				var inputFilter = new sap.ui.model.Filter({
					filters: that.genFilterArr([{
						path: "Country",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "CountryName",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}])
				});
			}
			var bAnd = true;
			var filter = new sap.ui.model.Filter(inputFilter, bAnd);
			oEvent.getSource().getBinding("suggestionRows").filter(filter);
			var CountrySuggestions = oEvent.getSource().getBinding("suggestionRows");
			if (!CountrySuggestions.sFilterParams.includes("%27")) {
				for (var i = 0; i <= filter.aFilters.length - 1; i++) {
					filter.aFilters[i].oValue1 = "'" + filter.aFilters[i].oValue1 + "'";
				}
				CountrySuggestions.filter(filter);
			} else {
				CountrySuggestions.filter(filter);
			}
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		// onSelectCountry: function (oEvent) {
		// 	if (oEvent.getParameter("selectedRow") !== null) {
		// 		var oSelectedItem = oEvent.getParameter("selectedRow").getBindingContext().getObject();
		// 		oEvent.getSource().setValue(oSelectedItem.Country + " ( " + oSelectedItem.CountryName + " )");
		// 	}
		// },
		onCountryTokenUpdate: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			Fragment.byId(CallerId, "COUNTRY").setValueState("None");
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 0 || oEvent.getParameter("type") === "removed") {
				oEvent.getSource().setSelectedKey("");
				oEvent.getSource().setTokens([]);
				Fragment.byId(CallerId, "TELNO").setEnabled(false);
				Fragment.byId(CallerId, "TELNO").setValue("");
				Fragment.byId(CallerId, "FAXNUMBER").setValue("");
				Fragment.byId(CallerId, "FAXNUMBER").setEnabled(false);
				if (CallerId !== "fragCreateCompany") {
					Fragment.byId(CallerId, "CPRNO").setValue("");
				}
				if (CallerId === "fragCreateCustomer" || CallerId === "fragCreateCompany") {
					Fragment.byId(CallerId, "MOBILENO").setEnabled(false);
					Fragment.byId(CallerId, "MOBILENO").setValue("");
				}
			}
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateContactPerson":
				that._fnContractButtonCreateButtonEnabledState();
				break;
			case "fragCreateCompany":
				that.fnCheckCreateCompanyRequiredValidation();
				break;
			}
		},
		fnCreateMask: function (CountryCode, Maxlength) {
			var Mask = "";
			CountryCode.split('').forEach(function (obj) {
				if (obj === "9") {
					Mask += "^" + obj;
				} else {
					Mask += obj;
				}
			});
			Mask += " ";
			var PadEndCount = Mask.length + (Maxlength - CountryCode.length) + 1;
			Mask = Mask.padEnd(PadEndCount, "9");
			return Mask;
		},
		onSelectCountry: function (oEvent) {
			var that = this;
			var EMIRATESID;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			Fragment.byId(CallerId, "COUNTRY").setValueState("None");
			var TELNO = Fragment.byId(CallerId, "TELNO");
			var FAXNUMBER = Fragment.byId(CallerId, "FAXNUMBER");
			Fragment.byId(CallerId, "REGION").setTokens([]);
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedItem = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var CRNO = oSelectedItem.IDText;
				var CRNOLabel = Fragment.byId(CallerId, "CPRNO");
				if (CRNOLabel && CRNO !== "") {
					EMIRATESID = CRNOLabel.getLabels()[0];
					EMIRATESID.setText(CRNO);
				} else {
					if (CRNOLabel) {
						EMIRATESID = CRNOLabel.getLabels()[0];
						EMIRATESID.setText("Emirates ID");
					}
				}
				var oText = this.formatNameAndValuePair(oSelectedItem.Country, oSelectedItem.CountryName);
				var oToken = new sap.m.Token({
					key: oSelectedItem.Country,
					text: oText
				});
				oSource.setTokens([oToken]);
				var CountryCode = "+" + oSelectedItem.CountryCode;

				// if (CallerId === "fragCreateCustomer" || CallerId === "fragCreateCompany" ) {
				var MobileNo = Fragment.byId(CallerId, "MOBILENO");
				// }
				if (oSelectedItem.Country === "AE") {
					var MaxLengthMobile = oSelectedItem.CountryCode.length + 9;
					var MaxLengthTELNO = oSelectedItem.CountryCode.length + 8;
					var MaxLengthFAXNUMBER = oSelectedItem.CountryCode.length + 9;
					var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
					var TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
					var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
				} else if (oSelectedItem.Country === "OM") {
					var MaxLengthMobile = oSelectedItem.CountryCode.length + 8;
					var MaxLengthTELNO = oSelectedItem.CountryCode.length + 8;
					var MaxLengthFAXNUMBER = oSelectedItem.CountryCode.length + 8;
					var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
					var TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
					var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
				} else {
					MaxLengthMobile = oSelectedItem.CountryCode.length + 10;
					MaxLengthTELNO = oSelectedItem.CountryCode.length + 10;
					MaxLengthFAXNUMBER = oSelectedItem.CountryCode.length + 10;
					MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
					TELNOMask = this.fnCreateMask(CountryCode, MaxLengthTELNO);
					FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
				}
				if (MobileNo) {
					if (MobileNo.getValue()) {
						MobileNo.setValue(CountryCode + " " + MobileNo.getValue().split(" ")[1]);
					}
					MobileNo.setMask(MobileMask);
					MobileNo.setEnabled(true);
					MobileNo.fireChange();
				}
				if (FAXNUMBER.getValue()) {
					FAXNUMBER.setValue(CountryCode + " " + FAXNUMBER.getValue().split(" ")[1]);
				}

				FAXNUMBER.setMask(FAXNUMBERMask);
				FAXNUMBER.setEnabled(true);
				FAXNUMBER.fireChange();
				if (TELNO.getValue()) {
					TELNO.setValue(CountryCode + " " + TELNO.getValue().split(" ")[1]);
				}

				TELNO.setMask(TELNOMask);
				TELNO.setEnabled(true);
				TELNO.fireChange();
			} else {
				TELNO.setEnabled(false);
				TELNO.setMask("");
				TELNO.setValue("");
				if (MobileNo) {
					MobileNo.setEnabled(false);
					MobileNo.setMask("");
					MobileNo.setValue("");
				}
			}
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateContactPerson":
				that._fnContractButtonCreateButtonEnabledState();
				break;
			case "fragCreateCompany":
				that.fnCheckCreateCompanyRequiredValidation();
				break;
			}
		},
		formatNameAndValuePair: function (sName, sValue) {
			if (!sName && !sValue) {
				return "";
			} else if (sValue && !sName) {
				return sValue.replace(/^0+/, "");
			} else if (!sValue && sName) {
				return sName;
			} else {
				return sName + " (" + sValue.replace(/^0+/, "") + ")";
			}
		},
		fnShowCreateContactPersonRegionValueHelp: function (oEvnt) {
			//	var that = this;
			// var Country = Fragment.byId("fragCreateContactPerson", "COUNTRY").getValue();
			// var oFilter1 = [];
			// if (Country) {
			// 	oFilter1.push(new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.EQ, Country));
			// }
			var that = this;
			var CallerId = oEvnt.getSource().getId().split("--")[0];
			var Country = Fragment.byId("CallerId", "COUNTRY");
			if (Country.getTokens([]).length !== 0) {
				Country = Fragment.byId("CallerId", "COUNTRY").getTokens()[0].getKey();
				var oFilter1 = [];
				if (Country) {
					oFilter1.push(new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.EQ, Country));
				}
			}
			if (!this._CreateContactPersonRegionValueHelpDialog) {
				Fragment.load({
						id: "RegionValueHelpDialogFragment",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.RegionVH",
						controller: {
							_handleValueHelpClose: function (oEvt1) {
								var oSelectedItem = oEvt1.getParameter("selectedItem");
								// if (oSelectedItem) {
								// 	var input = Fragment.byId("fragCreateContactPerson", "REGION");
								// 	input.setValue(oSelectedItem.getProperty("title"));
								// }
								// oEvt1.getSource().getBinding("items").filter([]);
								//	that._fnContractButtonCreateButtonEnabledState();
								if (oSelectedItem) {
									var input = Fragment.byId(CallerId, "REGION");
									input.setTokens([]);
									var oText = oSelectedItem.getTitle() + " ( " + oSelectedItem.getDescription() + " )";
									input.addToken(new Token({
										key: oSelectedItem.getTitle(),
										text: oText
									}));
								}
								oEvt1.getSource().getBinding("items").filter([]);
							},

							_handleValueHelpSearch: function (oEvt2) {
								var sValue = oEvt2.getParameter("value");
								var inputFilter = new sap.ui.model.Filter({
									filters: that.genFilterArr([{
										path: "Country",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}, {
										path: "CountryName",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}, {
										path: "Region",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}, {
										path: "RegionName",
										operator: sap.ui.model.FilterOperator.Contains,
										value1: sValue
									}])
								});
								var oFilter = inputFilter;
								Country = Fragment.byId(CallerId, "COUNTRY");
								if (Country.getTokens([]).length !== 0) {
									var oCountry = Fragment.byId(CallerId, "COUNTRY").getTokens()[0].getKey();
									if (oCountry) {
										oFilter = new sap.ui.model.Filter({
											filters: [
												inputFilter,
												that.genFilterArr([{
													path: "Country",
													operator: 'EQ',
													value1: oCountry
												}])[0]
											],
											and: true
										});
									}
								}
								that._CreateContactPersonRegionValueHelpDialog.getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);

							}
						}
					})
					.then(function (oValueHelpDialogContent) {
						that._CreateContactPersonRegionValueHelpDialog = oValueHelpDialogContent;
						oValueHelpDialogContent.open();
						oValueHelpDialogContent.setModel(that.getView().getModel());
						that._CreateContactPersonRegionValueHelpDialog.getBinding("items").filter(oFilter1);

					}, this);
			} else {
				this._CreateContactPersonRegionValueHelpDialog.open();
				that._CreateContactPersonRegionValueHelpDialog.getBinding("items").filter(oFilter1, sap.ui.model.FilterType.Application);
			}

		},

		fnShowRegionValueHelp: function (oEvnt) {
			var that = this;
			var CallerId = oEvnt.getSource().getId().split("--")[0];
			var Country = Fragment.byId(CallerId, "COUNTRY");
			if (Country.getTokens([]).length !== 0) {
				Country = Fragment.byId(CallerId, "COUNTRY").getTokens()[0].getKey();
				var oFilter1 = [];
				if (Country) {
					oFilter1.push(new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.EQ, Country));
				}
			}
			if (that._RegionValueHelpDialog) {
				that._RegionValueHelpDialog.destroy();
			}
			Fragment.load({
					id: "RegionValueHelpDialogFragment",
					name: "com.globalintelli.ZAE_SCIN_NEW.fragment.RegionVH",
					controller: {
						_handleValueHelpClose: function (oEvt1) {
							var oSelectedItem = oEvt1.getParameter("selectedItem");
							if (oSelectedItem) {
								var input = Fragment.byId(CallerId, "REGION");
								input.setTokens([]);
								input.setValueState("None");
								input.setValue("");
								var oText = oSelectedItem.getTitle() + " ( " + oSelectedItem.getDescription() + " )";
								var oToken = new sap.m.Token({
									key: oSelectedItem.getTitle(),
									text: oText
								});
								input.setTokens([oToken]);
								// input.addToken(new Token({
								// 	key: oSelectedItem.getTitle(),
								// 	text: oText
								// }));
							}
							oEvt1.getSource().getBinding("items").filter([]);
							switch (CallerId) {
							case "fragCreateCustomer":
								that.fnCheckCreateCustomerRequiredValidation();
								break;
							case "fragCreateContactPerson":
								that._fnContractButtonCreateButtonEnabledState();
								break;
							case "fragCreateCompany":
								that.fnCheckCreateCompanyRequiredValidation();
								break;
							}
						},
						_handleValueHelpSearch: function (oEvt2) {
							var sValue = oEvt2.getParameter("value");
							var inputFilter = new sap.ui.model.Filter({
								filters: that.genFilterArr([{
									path: "Country",
									operator: sap.ui.model.FilterOperator.Contains,
									value1: sValue
								}, {
									path: "CountryName",
									operator: sap.ui.model.FilterOperator.Contains,
									value1: sValue
								}, {
									path: "Region",
									operator: sap.ui.model.FilterOperator.Contains,
									value1: sValue
								}, {
									path: "RegionName",
									operator: sap.ui.model.FilterOperator.Contains,
									value1: sValue
								}])
							});
							var oFilter = inputFilter;
							Country = Fragment.byId(CallerId, "COUNTRY");
							if (Country.getTokens([]).length !== 0) {
								var oCountry = Fragment.byId(CallerId, "COUNTRY").getTokens()[0].getKey();
								if (oCountry) {
									oFilter = new sap.ui.model.Filter({
										filters: [
											inputFilter,
											that.genFilterArr([{
												path: "Country",
												operator: 'EQ',
												value1: oCountry
											}])[0]
										],
										and: true
									});
								}
							}
							that._RegionValueHelpDialog.getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);

						}
					}
				})
				.then(function (oValueHelpDialogContent) {
					that._RegionValueHelpDialog = oValueHelpDialogContent;
					oValueHelpDialogContent.open();
					oValueHelpDialogContent.setModel(that.getView().getModel());
					that._RegionValueHelpDialog.getBinding("items").filter(oFilter1);

				}, this);
			// } else {
			// 	//	that._RegionValueHelpDialog.getBinding("items").filter(oFilter1, sap.ui.model.FilterType.Application);
			// 	this._RegionValueHelpDialog.open();
			// 	that._RegionValueHelpDialog.getBinding("items").filter(oFilter1, sap.ui.model.FilterType.Application);
			// }

		},
		handleRegionSuggest: function (oEvent) {
			var that = this;
			var sValue = oEvent.getParameter("suggestValue");
			if (sValue) {
				var inputFilter = new sap.ui.model.Filter({
					filters: that.genFilterArr([{
						path: "Country",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "CountryName",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "Region",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "RegionName",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}])
				});
			}
			var bAnd = true;
			var filter = new sap.ui.model.Filter(inputFilter, bAnd);
			var CallerId = oEvent.getSource().getId().split("--")[0];
			var oCountry = Fragment.byId(CallerId, "COUNTRY").getValue();
			if (oCountry) {
				filter = new sap.ui.model.Filter({
					filters: [
						inputFilter,
						that.genFilterArr([{
							path: "Country",
							operator: FilterOperator.EQ,
							value1: oCountry
						}])[0]
					],
					and: true
				});
			}
			oEvent.getSource().getBinding("suggestionRows").filter(filter);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},

		handleRegionSuggest: function (oEvent) {
			var that = this;
			var sValue = oEvent.getParameter("suggestValue");
			if (sValue) {
				var inputFilter = new sap.ui.model.Filter({
					filters: that.genFilterArr([{
						path: "Country",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "CountryName",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "Region",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "RegionName",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}])
				});
			}
			var bAnd = true;
			var filter = new sap.ui.model.Filter(inputFilter, bAnd);
			var CallerId = oEvent.getSource().getId().split("--")[0];
			var Country = Fragment.byId(CallerId, "COUNTRY");
			if (Country.getTokens([]).length !== 0) {
				var oCountry = Fragment.byId(CallerId, "COUNTRY").getTokens()[0].getKey();
				if (oCountry) {
					filter = new sap.ui.model.Filter({
						filters: [
							inputFilter,
							that.genFilterArr([{
								path: "Country",
								operator: FilterOperator.EQ,
								value1: oCountry
							}])[0]
						],
						and: true
					});
				}
			}
			oEvent.getSource().getBinding("suggestionRows").filter(filter);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},

		onRegionTokenUpdate: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			Fragment.byId(CallerId, "REGION").setValueState("None");
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 0 || oEvent.getParameter("type") === "removed") {
				oEvent.getSource().setSelectedKey("");
				oEvent.getSource().setTokens([]);
			}
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateContactPerson":
				that._fnContractButtonCreateButtonEnabledState();
				break;
			case "fragCreateCompany":
				that.fnCheckCreateCompanyRequiredValidation();
				break;
			}
		},
		onSelectRegion: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			Fragment.byId(CallerId, "REGION").setValueState("None");
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedItem = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedItem.Region, oSelectedItem.RegionName);
				var oToken = new sap.m.Token({
					key: oSelectedItem.Region,
					text: oText
				});
				oSource.setTokens([oToken]);
			}
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateContactPerson":
				that._fnContractButtonCreateButtonEnabledState();
				break;
			case "fragCreateCompany":
				that.fnCheckCreateCompanyRequiredValidation();
				break;
			}
		},

		genFilterArr: function (fArr) {
			var oFArr = [];
			fArr.forEach(function (f) {
				if (f.value2) {
					oFArr.push(new sap.ui.model.Filter(f.path,
						f.operator, f.value1, f.value2));
				} else {
					oFArr.push(new sap.ui.model.Filter(f.path,
						f.operator, f.value1));
				}
			});
			return oFArr;
		},

		onExit: function () {
			BaseController.MainAppState = "";
		},

		onBeforeRebindSmartTableExtendedWarranty: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			if (oModelData.Equipment) {
				binding.preventTableBind = false;
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					oModelData.customerInfo.Equipment);
				aFilters.push(newFilter);
				binding.filters = aFilters;
			} else {
				binding.preventTableBind = true;
			}
		},

		onBeforeRebindHistoryTable: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var mBindingParams = oEvent.getParameter("bindingParams");
			if (this.ServiceHistoryTab) {
				mBindingParams.preventTableBind = false;
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					oModelData.customerInfo.Equipment);
				aFilters.push(newFilter);
				if (oModelData.SchemaTransactionType.FilterHistoryBySalesOrg && oModelData.SalesOrg) {
					newFilter = new sap.ui.model.Filter("SalesOrganization",
						sap.ui.model.FilterOperator.EQ,
						oModelData.SalesOrg);
					aFilters.push(newFilter);
				}
				mBindingParams.filters = aFilters;
				mBindingParams.parameters.select = mBindingParams.parameters.select + ',HistoryItems';
				var sorter = [];
				sorter.push(new sap.ui.model.Sorter({
					path: 'PostingDate',
					descending: true
				}));
				mBindingParams.sorter = sorter;
			} else {
				mBindingParams.preventTableBind = true;
			}
		},

		onBeforeRebindLegacyHistoryTable: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var mBindingParams = oEvent.getParameter("bindingParams");
			if (this.LegacyHistoryTab) {
				mBindingParams.preventTableBind = false;
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					oModelData.customerInfo.Equipment);
				aFilters.push(newFilter);
				// if (oModelData.SchemaTransactionType.FilterHistoryBySalesOrg && oModelData.SalesOrg) {
				// 	newFilter = new sap.ui.model.Filter("SalesOrganization",
				// 		sap.ui.model.FilterOperator.EQ,
				// 		oModelData.SalesOrg);
				// 	aFilters.push(newFilter);
				// }
				mBindingParams.filters = aFilters;
				mBindingParams.parameters.select = mBindingParams.parameters.select + ',Invoice';
				var sorter = [];
				sorter.push(new sap.ui.model.Sorter({
					path: 'PostingDate',
					descending: true
				}));
				mBindingParams.sorter = sorter;
			} else {
				mBindingParams.preventTableBind = true;
			}
		},

		onPressLoadComplaint: function () {
			this.ServiceComplaintTab = true;
			this.getView().byId("openEVHC").rebindTable();
		},

		onPressLoadHistory: function () {
			this.ServiceHistoryTab = true;
			this.getView().byId("vehiclehistory").rebindTable();
		},
		onPressLoadLegacyHistory: function () {
			this.LegacyHistoryTab = true;
			this.getView().byId("vehicleLegacyhistory").rebindTable();
		},

		onPressDisplaySrvHistory: function () {
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ZSRV_HISTORYEQ", //"ZSRV_HISTORY",
					action: "aeDisplay"
				},
				params: {
					"SO_EQUNR-LOW": oModelData.customerInfo.Equipment
				}
			})) || "";
			// var oModel = this.getView().getModel("mCustIdentification");
			// var oModelData = oModel.getData();
			// var that = this;
			// var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZSRV_HISTORY%20SO_EQUNR-LOW=" +
			// 	oModelData.customerInfo.Equipment + ";DYNP_OKCODE=#";
			// window.open(link, '_blank');

			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);
		},

		onBeforeRebindSmartTableSalesArea: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			if (oModelData.customerInfo.Equipment) {
				binding.preventTableBind = false;
				if (oModelData.WorkShop) {
					newFilter = new sap.ui.model.Filter("Plant",
						sap.ui.model.FilterOperator.EQ,
						this.byId("SCIN_I01").getSelectedKey());
					aFilters.push(newFilter);
				}

				if (oModelData.customerInfo.to_CurrentOwner && oModelData.customerInfo.to_CurrentOwner.Partner) {
					newFilter = new sap.ui.model.Filter("Customer",
						sap.ui.model.FilterOperator.EQ,
						oModelData.customerInfo.to_CurrentOwner.Partner);
					aFilters.push(newFilter);
				} else {
					newFilter = new sap.ui.model.Filter("Customer",
						sap.ui.model.FilterOperator.EQ,
						"");
					aFilters.push(newFilter);
				}
				// binding.filters.push(newFilter);
				binding.filters = aFilters;
				binding.parameters.select = binding.parameters.select + ",IsDefaultDC";
			} else {
				binding.preventTableBind = true;
			}

		},

		onBeforeRebindOpenAppointment: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			if (oModelData.Equipment) {
				binding.preventTableBind = false;
				if (oModelData.Equipment) {
					newFilter = new sap.ui.model.Filter("Equipment_disp",
						sap.ui.model.FilterOperator.EQ,
						oModelData.Equipment);
					aFilters.push(newFilter);
				} else {
					newFilter = new sap.ui.model.Filter("Equipment_disp",
						sap.ui.model.FilterOperator.EQ,
						"");
					aFilters.push(newFilter);
				}
				// binding.filters.push(newFilter);
				binding.filters = aFilters;
				binding.parameters.select = binding.parameters.select + ",Appointment,object_type"
			} else {
				binding.preventTableBind = true;
			}
		},

		onBeforeRebindSmartTableContactPersonList: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			if (oModelData.Equipment) {
				binding.preventTableBind = false;
				if (oModelData.customerInfo.to_CurrentOwner && oModelData.customerInfo.to_CurrentOwner.Partner) {
					newFilter = new sap.ui.model.Filter("BusinessPartner",
						sap.ui.model.FilterOperator.EQ,
						oModelData.customerInfo.to_CurrentOwner.Partner);
					aFilters.push(newFilter);
				} else {
					newFilter = new sap.ui.model.Filter("BusinessPartner",
						sap.ui.model.FilterOperator.EQ,
						"");
					aFilters.push(newFilter);
				}
				var binding = oEvent.getParameter("bindingParams");
				binding.filters = aFilters;
				binding.parameters.select = binding.parameters.select + ",ContactPerson,Country,UpdatedBPCheck,FaxNumber";
			} else {
				binding.preventTableBind = true;
			}
		},

		onAfterRebindSmartTableSalesArea: function (oEvent) {
			// this.getView().byId("SCIN_B08").setVisible(true);
			// this.getView().byId("SCIN_B09").setVisible(true);
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oSelectedItem = null;
			oEvent.getSource().getBinding("items").getContexts().forEach(function (Item, i) {
				if (Item.getObject() && Item.getObject().IsDefaultDC) {
					oSelectedItem = oEvent.getSource().getItems()[i];
					return;
				}
			});
			if (!oSelectedItem) {
				oSelectedItem = oEvent.getSource().getItems()[0];
			}
			var oModelData = oModel.getData();
			if (oEvent.getSource().getItems().length > 0) {
				oEvent.getSource().setSelectedItem(oSelectedItem);
				// for (var i = 0; i < oEvent.getSource().getItems().length; i++) {
				// 	var CustomerStatus = oEvent.getSource().getItems();
				// 	CustomerStatus[i].getBindingContext().getObject().CustomerStatus;
				// if (CustomerStatus[i].getBindingContext().getObject().CustomerStatus === "X" || CustomerStatus[i].getBindingContext().getObject()
				// 	.CustomerStatus === true || oModel.oData.customerInfo.to_CurrentOwner.CustomerStatus === "X") {
				if (oModel.oData.customerInfo.to_CurrentOwner.CustomerStatus === "X") {
					this.getView().byId("SCIN_B08").setVisible(false);
					this.getView().byId("SCIN_B09").setVisible(false);
				} else {
					this.getView().byId("SCIN_B08").setVisible(oModelData.customerInfo.isShowSCIN_B08);
					this.getView().byId("SCIN_B09").setVisible(oModelData.customerInfo.isShowSCIN_B09);
					oEvent.getSource().fireSelectionChange();
				}
				// }
			}

			oModelData.TBLSalesAreaLength = oEvent.getSource().getItems().length;
			oModel.updateBindings(true);
		},

		fnCheckCustomerServiceBlock: function (oEvent) {
			var rowSelected;
			var oModel = this.getView().getModel("mCustIdentification");
			if (oEvent.getParameter("listItem")) {
				rowSelected = oEvent.getParameter("listItem").getBindingContext().getObject().CustomerStatus;
			} else {
				rowSelected = oEvent.getSource().getItems()[0].getBindingContext().getObject().CustomerStatus;
			}

			if (rowSelected !== "Yes" && oModel.oData.customerInfo.to_CurrentOwner.CustomerStatus !== "X") {
				this.getView().byId("SCIN_B08").setVisible(oModel.oData.customerInfo.isShowSCIN_B08);
				this.getView().byId("SCIN_B09").setVisible(oModel.oData.customerInfo.isShowSCIN_B09);

			} else {
				this.getView().byId("SCIN_B08").setVisible(false);
				this.getView().byId("SCIN_B09").setVisible(false);
			}
		},

		onAfterRebindSmartTableContactPersonList: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			if (oEvent.getSource().getItems().length > 0 && !(oModelData.customerInfo.DoNotDefaultCP)) {
				oModel.setProperty("/contactPersonselected", true);
				oEvent.getSource().setSelectedItem(oEvent.getSource().getItems()[0]);
			} else {
				oModel.setProperty("/contactPersonselected", false);
				oEvent.getSource().removeSelections();
			}
			oModelData.TBLContactPersonLength = oEvent.getSource().getItems().length;
			oModel.updateBindings(true);
			if (this.oCategory) {
				var oCategoryKey = this.oCategory[0].getKey();
				var oCategoryText = this.oCategory[0].getText();
				this.getView().byId("SCIN_I02").addToken(new Token({
					key: oCategoryKey,
					text: oCategoryText
				}));
			}
		},

		onEQUIValueHelpRequested: function () {
			var that = this;
			var oCols = {
				"cols": [{
						"label": this.getView().getModel("i18n").getResourceBundle().getText("Equipment1"),
						"template": "Equipment",
						"width": "10rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("EquipmentName"),
						"template": "EquipmentName",
						"width": "15rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("ManufacturerVIN"),
						"template": "FleetVin",
						"width": "15rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("RegistrationNumber"),
						"template": "LicenseNum",
						"width": "15rem"
					},
					// {
					// 	"label": this.getView().getModel("i18n").getResourceBundle().getText("FleetNum"),
					// 	"template": "FleetNum",
					// 	"width": "15rem"
					// }, 
					{
						"label": this.getView().getModel("i18n").getResourceBundle().getText("CustomerNumber"),
						"template": "Partner",
						"width": "15rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("NameofCustomer"),
						"template": "CustomerName",
						"width": "15rem"
					}, {
						"label": this.getView().getModel().getProperty("/#ZAE_C_BPContactPersonType/CPRNumber/@sap:label"),
						"template": "idnumber",
						"width": "5rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("Telephone1"),
						"template": "TelephoneNumber1",
						"width": "15rem"
					}, {
						"label": this.getView().getModel().getProperty("/#ZAE_FM_SC_CONTACT_CREATE/FaxNumber/@sap:label"),
						"template": "FaxNumber",
						"width": "15rem"
					},

					/*{
					"label": "{i18n>LesseeCPRNo}",
					"template": "Lidnumber",
					"width": "5rem"
				}, {
					"label": "{i18n>LesseeCustomerName}",
					"template": "LPartner",
					"width": "15rem"
				}, {
					"label": "{i18n>NameofLesseeCustomer}",
					"template": "LCustomerName",
					"width": "15rem"
				}, {
					"label": "{i18n>LesseeCustomerTelephone1}",
					"template": "LTelephoneNumber1",
					"width": "15rem"
				}*/
					{
						"label": this.getView().getModel("i18n").getResourceBundle().getText("Make"),
						"template": "Make",
						"width": "5rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("MakeText"),
						"template": "MakeText",
						"width": "5rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("Model"),
						"template": "Model",
						"width": "5rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("ModelText"),
						"template": "ModelText",
						"width": "5rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("Plantt"),
						"template": "MaintenancePlanningPlant",
						"width": "5rem"
					}, {
						"label": this.getView().getModel("i18n").getResourceBundle().getText("EquipmentCategory"),
						"template": "EquipmentCategory",
						"width": "5rem"
					}
				]
			};
			this.oColModel = new JSONModel(oCols);
			var aCols = this.oColModel.getData().cols;
			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment(
				"com.globalintelli.ZAE_SCIN_NEW.fragment.EquipmentVH",
				this);
			this._oValueHelpDialog.setModel(this.getView().getModel());
			this.getView().addDependent(this._oValueHelpDialog);
			this._oValueHelpDialog.getFilterBar().getFilterGroupItems().forEach(function (obj) {
				obj.getControl().attachBrowserEvent("keyup", function (e) {
					if (e.which == 13 || e.keyCode == 13) {
						this._oValueHelpDialog.getFilterBar().fireSearch();
					}
				}.bind(this));
			}.bind(this));
			// this._oValueHelpDialog.getFilterBar().getFilterGroupItems()[0]
			this._oValueHelpDialog.setRangeKeyFields([{
				label: this.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
				key: "Equipment",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 7
				})
			}]);

			this._oValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				// oTable.setModel(this.oProductsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					//	oTable.bindAggregation("rows", "/ZAE_VH_EQUIPMENT_09");
					oTable.attachRowsUpdated(function (oEvent) {
						oEvent.getSource().setBusy(false);
					});
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/ZAE_VH_Equipment_15(P_Plant='" + Plant + "')/Set", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}
				this._oValueHelpDialog.update();
			}.bind(this));
			this._oValueHelpDialog.setTokens(this.byId("EquipmentVH").getTokens());
			var aFilters = [];
			var oModelData = this.getView().getModel("mCustIdentification").getData();
			var EquipmentCategory = [];
			var MaintenancePlant = [];
			var UsageIndicator = [];
			// if (oModelData.SchemaTransactionType.EquipmentCategory1) {
			// 	EquipmentCategory.push(new Filter({
			// 		path: "EquipmentCategory",
			// 		operator: sap.ui.model.FilterOperator.EQ,
			// 		value1: oModelData.SchemaTransactionType.EquipmentCategory1
			// 	}));
			// }
			// if (oModelData.SchemaTransactionType.EquipmentCategory2) {
			// 	EquipmentCategory.push(new Filter({
			// 		path: "EquipmentCategory",
			// 		operator: sap.ui.model.FilterOperator.EQ,
			// 		value1: oModelData.SchemaTransactionType.EquipmentCategory2
			// 	}));
			// }
			// if (oModelData.SchemaTransactionType.EquipmentCategory3) {
			// 	EquipmentCategory.push(new Filter({
			// 		path: "EquipmentCategory",
			// 		operator: sap.ui.model.FilterOperator.EQ,
			// 		value1: oModelData.SchemaTransactionType.EquipmentCategory3
			// 	}));
			// }
			// if (oModelData.SchemaTransactionType.FilterByMaintenancePlant === true) {
			// 	if (oModelData.SchemaTransactionType.Plant1) {
			// 		MaintenancePlant.push(new Filter({
			// 			path: "MaintenancePlant",
			// 			operator: sap.ui.model.FilterOperator.EQ,
			// 			value1: oModelData.SchemaTransactionType.Plant1
			// 		}));
			// 	}
			// 	if (oModelData.SchemaTransactionType.Plant2) {
			// 		MaintenancePlant.push(new Filter({
			// 			path: "MaintenancePlant",
			// 			operator: sap.ui.model.FilterOperator.EQ,
			// 			value1: oModelData.SchemaTransactionType.Plant2
			// 		}));
			// 	}
			// 	if (oModelData.SchemaTransactionType.Plant3) {
			// 		MaintenancePlant.push(new Filter({
			// 			path: "MaintenancePlant",
			// 			operator: sap.ui.model.FilterOperator.EQ,
			// 			value1: oModelData.SchemaTransactionType.Plant3
			// 		}));
			// 	}
			// }
			// if (oModelData.SchemaTransactionType.Plant) {
			// 	MaintenancePlant.push(new Filter({
			// 		path: "SCIN03Plant",
			// 		operator: sap.ui.model.FilterOperator.EQ,
			// 		value1: oModelData.SchemaTransactionType.Plant
			// 	}));
			// }
			// if (oModelData.SchemaTransactionType.UsageIndicator) {
			// 	UsageIndicator.push(new Filter({
			// 		path: "FleetUse",
			// 		operator: sap.ui.model.FilterOperator.EQ,
			// 		value1: oModelData.SchemaTransactionType.UsageIndicator
			// 	}));
			// }

			// if (EquipmentCategory.length > 0) {
			// 	aFilters.push(new Filter({
			// 		filters: EquipmentCategory,
			// 		and: false
			// 	}));
			// }

			// if (MaintenancePlant.length > 0) {
			// 	aFilters.push(new Filter({
			// 		filters: MaintenancePlant,
			// 		and: false
			// 	}));
			// }

			// if (UsageIndicator.length > 0) {
			// 	aFilters.push(new Filter({
			// 		filters: UsageIndicator,
			// 		and: false
			// 	}));
			// }

			// this._filterTable(new Filter({
			// 	filters: aFilters,
			// 	and: true
			// }));

			this._oValueHelpDialog.open();
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this.byId("EquipmentVH").setTokens(aTokens);
			this.byId("SCIN_smartFilterBar").fireSearch();
			this.byId("SmartTableOpenAppointment").rebindTable();
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},

		_filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oFilter.aFilters.length >= 2) {
					if (oTable.bindRows) {
						oTable.bindAggregation("rows", "/ZAE_VH_Equipment_15(P_Plant='" + Plant + "')/Set");
					}
					if (oTable.bindRows && oTable.getBinding("rows")) {
						oTable.getBinding("rows").filter(oFilter);
					}
					oTable.setBusy(true);
				}

				if (oTable.bindItems && oTable.getBinding("items")) {
					oTable.getBinding("items").filter(oFilter);
				}
				oValueHelpDialog.update();
			});
		},

		onFilterBarSearch: function (oEvent) {
			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet"),
				aFilters;
			if (aSelectionSet) {
				aFilters = aSelectionSet.reduce(function (aResult, oControl) {
					if (oControl.getValue()) {
						aResult.push(new Filter({
							path: oControl.getName(),
							operator: FilterOperator.Contains,
							value1: oControl.getValue()
						}));
					}

					return aResult;
				}, []);
			} else {
				aFilters = oEvent.getSource().getFilterGroupItems().reduce(function (aResult, oItem) {
					if (oItem.getControl().getValue()) {
						aResult.push(new Filter({
							path: oItem.getControl().getName(),
							operator: FilterOperator.Contains,
							value1: oItem.getControl().getValue()
						}));
					}

					return aResult;
				}, []);
			}

			if (sSearchQuery) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "Equipment",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "EquipmentName",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "FleetVin",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "LicenseNum",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "FleetNum",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "idnumber",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "Partner",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "CustomerName",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "TelephoneNumber1",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "Make",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "MakeText",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "Model",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						}),
						new Filter({
							path: "ModelText",
							operator: FilterOperator.Contains,
							value1: sSearchQuery
						})

					],
					and: false
				}));
			}

			var oModelData = this.getView().getModel("mCustIdentification").getData();
			var EquipmentCategory = [];
			var MaintenancePlant = [];
			var UsageIndicator = [];
			var oSelectedItem = this.getView().byId("SCIN_I01").getSelectedItem();
			var oPlantData;
			if (oSelectedItem) {
				oPlantData = sap.ui.getCore().byId(oSelectedItem).getBindingContext().getObject();
			}
			if (oPlantData.EquipmentCategory1) {
				EquipmentCategory.push(new Filter({
					path: "EquipmentCategory",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oPlantData.EquipmentCategory1
				}));
			}
			if (oPlantData.EquipmentCategory2) {
				EquipmentCategory.push(new Filter({
					path: "EquipmentCategory",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oPlantData.EquipmentCategory2
				}));
			}
			if (oPlantData.EquipmentCategory3) {
				EquipmentCategory.push(new Filter({
					path: "EquipmentCategory",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oPlantData.EquipmentCategory3
				}));
			}
			// if (oModelData.SchemaTransactionType.FilterByMaintenancePlant === true) {
			// 	if (oModelData.SchemaTransactionType.Plant1) {
			// 		MaintenancePlant.push(new Filter({
			// 			path: "MaintenancePlant",
			// 			operator: sap.ui.model.FilterOperator.EQ,
			// 			value1: oModelData.SchemaTransactionType.Plant1
			// 		}));
			// 	}
			// 	if (oModelData.SchemaTransactionType.Plant2) {
			// 		MaintenancePlant.push(new Filter({
			// 			path: "MaintenancePlant",
			// 			operator: sap.ui.model.FilterOperator.EQ,
			// 			value1: oModelData.SchemaTransactionType.Plant2
			// 		}));
			// 	}
			// 	if (oModelData.SchemaTransactionType.Plant3) {
			// 		MaintenancePlant.push(new Filter({
			// 			path: "MaintenancePlant",
			// 			operator: sap.ui.model.FilterOperator.EQ,
			// 			value1: oModelData.SchemaTransactionType.Plant3
			// 		}));
			// 	}
			// }
			// if (oModelData.SchemaTransactionType.Plant) {
			// 	MaintenancePlant.push(new Filter({
			// 		path: "SCIN03Plant",
			// 		operator: sap.ui.model.FilterOperator.EQ,
			// 		value1: oModelData.SchemaTransactionType.Plant
			// 	}));
			// }
			if (oPlantData.UsageIndicator) {
				UsageIndicator.push(new Filter({
					path: "FleetUse",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oPlantData.UsageIndicator
				}));
			}
			if (EquipmentCategory.length > 0) {
				aFilters.push(new Filter({
					filters: EquipmentCategory,
					and: false
				}));
			}
			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		fnHandelServiceOrderLinkPress: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash3 = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash3);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ServiceOrder",
					// action: "aesDisplay"
					action: "aesDisplay&//ZAE_C_ServiceOrder_01(ServiceObjectType='BUS2000116',ServiceOrder='" + oEvent.getSource().getText() +
						"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
				}
				/*,
				                params: {
				                    "ServiceOrder": oEvent.getSource().getText()
				                }*/
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},
		onServiceListPress: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var sPath = oSource.getBindingContext().getPath();
			var EntitySet;
			if (sPath.split("(")[0] === "/ZAE_C_ServiceOrderHistory_04") {
				EntitySet = sPath.split("(")[0];
			} else {
				EntitySet = "/ZAE_C_ServiceOrderHistory_03";
			}
			var oModel = oEvent.getSource().getBindingContext().getModel();
			that.objServiceOrderHistory = oModel.getProperty(sPath);
			var aFilters = [];
			if (EntitySet === "/ZAE_C_ServiceOrderHistory_03") {
				aFilters.push(new Filter("ServiceOrder", sap.ui.model.FilterOperator.EQ, that.objServiceOrderHistory.ServiceOrder)); //Contains
			}
			if (EntitySet === "/ZAE_C_ServiceOrderHistory_04") {
				aFilters.push(new Filter("Invoice", sap.ui.model.FilterOperator.EQ, that.objServiceOrderHistory.Invoice));
			}
			aFilters.push(new Filter("Equipment", sap.ui.model.FilterOperator.EQ, that.objServiceOrderHistory.Equipment));
			oSource.setBusy(true);
			that.getView().getModel().read(EntitySet, { //ZAE_C_LicenseNum_01
				filters: aFilters,

				success: function (oData) {
					oSource.setBusy(false);
					if (oData.results.length > 0) {
						that.objServiceOrderHistory = oData.results[0];
						that._openServiceOrderHistoryItems();
						// if (that.objServiceOrderHistory.HistoryItems === "OLD") {
						// 
						// } else {
						// 	sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("oldServiceHistory"));
						// }
					}

				},
				error: function (oError) {
					oSource.setBusy(false);
				}

			});
		},

		_openServiceOrderHistoryItems: function () {
			var that = this;
			if (!that._ServiceOrderHistoryItems) {
				Fragment.load({
						id: "fragServiceOrderHistoryItems",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ServiceOrderHistoryItems",
						controller: {
							onBeforeRebindServiceOrderHistoryItems: function (oEventRenind) {
								var aFilters = [],
									newFilter;
								var mBindingParams = oEventRenind.getParameter("bindingParams");
								// newFilter = new sap.ui.model.Filter("ServiceOrder",
								// 	sap.ui.model.FilterOperator.EQ, //Contains, 
								// 	that.objServiceOrderHistory.ServiceOrderWithoutZeros);
								// aFilters.push(newFilter);

								newFilter = new sap.ui.model.Filter("Invoice",
									sap.ui.model.FilterOperator.EQ,
									that.objServiceOrderHistory.Invoice);
								aFilters.push(newFilter);

								mBindingParams.filters = aFilters;

							},
							onCancelPressed: function () {
								that._ServiceOrderHistoryItems.close();
							}
						}
					}, this)
					.then(function (oPopoverContent) {
						that._ServiceOrderHistoryItems = oPopoverContent;
						that.getView().addDependent(that._ServiceOrderHistoryItems);
						that._ServiceOrderHistoryItems.open();

					}.bind(this));

			} else {
				Fragment.byId("fragServiceOrderHistoryItems", "SmartTableServiceOrderHistoryItems").rebindTable();
				that._ServiceOrderHistoryItems.open();
			}

		},
		onContractLinkPress: function (oEvent) {
			var that = this;
			var MoreInfo = [];
			var localModel = that.getView().getModel("mCustIdentification");
			var localModelData = localModel.getData();
			var ServiceCOntractList = localModelData.customerInfo.to_ServiceContractNew.results;

			var oSource = oEvent.getSource();
			var contract;
			for (var i = 0; ServiceCOntractList && i < ServiceCOntractList.length; i++) {
				if (ServiceCOntractList[i].ContractStatus === "CTIN") {
					contract = ServiceCOntractList[i];
				}
			}
			localModel.setProperty("/customerInfo/ServiceContract", {});
			localModel.setProperty("/customerInfo/ServiceContract/MoreInfo", contract);
			that._openContractPopup(oSource, that);

			/*	var aFilters = [];
				aFilters.push(new Filter("SalesContract", "EQ", ServiceContract));
				oSource.setBusy(true);
				that.getView().getModel().read("/ZAE_C_ServiceContract_01", {
					filters: aFilters,
					urlParameters: {
						$expand: ["to_Salescontractitemfs"]
					},
					success: function (oData) {
						oSource.setBusy(false);
						if (oData.results.length > 0) {
							MoreInfo.StartDate = oData.results[0].SalesContractValidityStartDate;
							MoreInfo.EndDate = oData.results[0].SalesContractValidityEndDate;
							MoreInfo.UserStatus = oData.results[0].UserStatus;
							MoreInfo.UserStatusTxt = oData.results[0].UserStatusTxt;
							MoreInfo.ContractDesc = oData.results[0].to_Salescontractitemfs.results[0].SalesContractItemText;
							localModel.setProperty("/customerInfo/to_EQUIPMENTCURRCONTSTS/MoreInfo", MoreInfo);

							that._openContractPopup(oSource, that);

						} else {
							sap.m.MessageToast.show("Not found Contract No..!");
						}

					},
					error: function (oError) {
						oSource.setBusy(false);
					}

				});*/
		},

		onSmartContractLinkPress: function (oEvent) {
			var that = this;
			var MoreInfo = [];
			var localModel = that.getView().getModel("mCustIdentification");
			var localModelData = localModel.getData();
			var ServiceCOntractList = localModelData.customerInfo.to_ServiceContractNew.results;

			var oSource = oEvent.getSource();
			var contract;
			for (var i = 0; ServiceCOntractList && i < ServiceCOntractList.length; i++) {
				if (ServiceCOntractList[i].ContractStatus === "CTIN") {
					contract = ServiceCOntractList[i];
				}
			}
			localModel.setProperty("/customerInfo/ServiceContract/MoreInfo", contract);
			that._openContractPopup(oSource, that);

		},

		_openContractPopup: function (oSource, that) {
			var oButton = oSource,
				oView = this.getView();
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.globalintelli.ZAE_SCIN_NEW.fragment.ContractInfo", that);
				that.getView()
					.addDependent(this._oPopover);
			}

			this._oPopover.openBy(oButton)
		},
		formatStatus: function (sValue) {
			if (sValue) {
				switch (sValue) {
				case 0:
					return "Information";
				case 1:
					return "Error";
				case 2:
					return "Warning";
				case 3:
					return "Success";
				default:
					return "Information";
				}
			}
		},
		handleContractLinkPress: function (oEvent) {
			var SalesContract = oEvent.getSource().getText();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var vPlant = this.byId("SCIN_I01").getSelectedKey();
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: vPlant,
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};

			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "SalesContract",
					action: "aesDisplay"
				},
				params: {
					"SalesContract": SalesContract
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},
		fnCustomerBlockedStatus: function (Partner) {
			var that = this;
			var oLocalModel = this.getView().getModel("mCustIdentification");
			var oEntity = "ZAE_FM_CUSTOMER_VALIDATIONSet";
			var data = [{
				callProperty: "BusinessPartner",
				value: Partner
			}];
			var oModel = this.getView().getModel();
			var succFunc = function (oData) {
				if (oData.Status !== "") {
					oLocalModel.setProperty("/customerInfo/to_CurrentOwner/BlockedStatus", oData.Status);
				} else {
					oLocalModel.setProperty("/customerInfo/to_CurrentOwner/BlockedStatus", "");
				}
				// oModelData.customerInfo.to_CurrentOwner.BlockedStatus = oData.Status;
				that.getView().getModel().refresh();
			};

			var errFunc = function (oData) {
				that.getView().getModel().refresh();
			};
			this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
		},

		onPressCreateServiceContractQuotation: function () {

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oModelData = this.getView().getModel("mCustIdentification").getData();
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};

			var Params = {
				"SalesOrganization": oSelectedItem.SalesOrganization,
				"DistributionChannel": oSelectedItem.DistrChannel,
				"Division": oSelectedItem.Division,
				"SalesOffice": oModelData.SchemaTransactionType.SalesOffice,
				"Customer": oModelData.customerInfo.to_CurrentOwner.Partner,
				"Equipment": this.byId("EquipmentVH").getTokens()[0].getProperty("key")
			}
			if (this.Opportunity) {
				Params["Opportunity"] = this.Opportunity;
			}
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "SalesQuotation",
					action: "aeContractCreate"
				},
				params: Params
					// params: {
					// 	"SalesOrganization": oSelectedItem.SalesOrganization,
					// 	"DistributionChannel": oSelectedItem.DistrChannel,
					// 	"Division": oSelectedItem.Division,
					// 	"SalesOffice": oModelData.SchemaTransactionType.SalesOffice,
					// 	"Customer": oModelData.customerInfo.to_CurrentOwner.Partner,
					// 	"Equipment": this.byId("EquipmentVH").getTokens()[0].getProperty("key")
					// }
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		fnEnableCreateServiceContractQuotation: function (Plant, Customer) {
			var Equipment = this.byId("EquipmentVH").getTokens().length > 0 ? this.byId("EquipmentVH").getTokens()[0].getProperty("key") :
				"";
			var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem() ? this.byId("SmartTableSalesArea").getTable().getSelectedItem()
				.getBindingContext() : "";
			return Plant !== "" && Equipment !== "" && Customer !== "" && oContext !== "";
		},
		fnWorkshopLoad: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};

			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "WorkshopRoaster",
					action: "aeAnalyze"
				},
				params: {}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		onCreateComplain: function (oEvent) {
			var that = this;
			that.getView().byId("SCIN_B15").setBusy(true);
			if (!this._oCreateComplainDialog) {
				Fragment.load({
						id: "fragCreateComplain",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateComplain",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateComplainDialog(oDialogContent);
						Fragment.byId("fragCreateComplain", "CCSalesoffice").getBinding("items").attachDataReceived(function (oEvent) {
							if (oEvent.getParameter("data").results.length === 1) {
								Fragment.byId("fragCreateComplain", "CCSalesoffice").setSelectedKey(oEvent.getParameter("data").results[0].SalesOffice);
								this.fnSalesOfficeChange();
							}
						}.bind(this));
						// Fragment.byId("fragCreateComplain", "ComplianReasonCode").getBinding("items").attachDataReceived(function (oEvent) {
						// 	if (oEvent.getParameter("data").results.length === 1) {
						// 		Fragment.byId("fragCreateComplain", "ComplianReasonCode").setBusy(false);
						// 		// Fragment.byId("fragCreateComplain", "CCSalesoffice").setSelectedKey(oEvent.getParameter("data").results[0].SalesOffice);
						// 		// this.fnSalesOfficeChange();
						// 	}
						// }.bind(this));
						// 	Fragment.byId("fragCreateComplain", "ComplianReason").getBinding("items").attachDataReceived(function (oEvent) {
						// 	if (oEvent.getParameter("data").results.length === 1) {
						// 			Fragment.byId("fragCreateComplain", "ComplianReason").setBusy(false);
						// 		// Fragment.byId("fragCreateComplain", "CCSalesoffice").setSelectedKey(oEvent.getParameter("data").results[0].SalesOffice);
						// 		// this.fnSalesOfficeChange();
						// 	}
						// }.bind(this));
						this._setCreateComplainDialogInitialState();
					}.bind(this));
			} else {

				this._setCreateComplainDialogInitialState();
			}
		},
		fnBeginButtonValidation: function () {
			this._fnEnableCreateComplainDilaogBTN();
		},
		_setCreateComplainDialogInitialState: function () {

			var that = this;
			var CCustomer;
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			// Fragment.byId("fragCreateComplain", "EmployeeResp").setSelectedKey();
			Fragment.byId("fragCreateComplain", "EmployeeResp").setValue("");
			Fragment.byId("fragCreateComplain", "EmployeeResp").setTokens([]);
			Fragment.byId("fragCreateComplain", "EmployeeResp").setValueState("None");
			// Fragment.byId("fragCreateComplain", "ServiceManager").setValue("").setVisible(true);
			// Fragment.byId("fragCreateComplain", "ServiceManager").setTokens([]);
			// Fragment.byId("fragCreateComplain", "ServiceManager").setValueState("None");
			Fragment.byId("fragCreateComplain", "Description").setValue("");
			Fragment.byId("fragCreateComplain", "ComplainText").setValue("");
			Fragment.byId("fragCreateComplain", "CCSalesgroup").setSelectedKey(null);
			Fragment.byId("fragCreateComplain", "Activitytype").setSelectedKey(null);
			Fragment.byId("fragCreateComplain", "ComplianReason").setSelectedKey(null);
			Fragment.byId("fragCreateComplain", "ComplianReasonCode").setSelectedKey(null);
			Fragment.byId("fragCreateComplain", "Contactperson").setSelectedKey(null);
			// Fragment.byId("fragCreateComplain", "ServiceManager").setSelectedKey(null);
			Fragment.byId("fragCreateComplain", "ReferenceNo").setValue("");
			Fragment.byId("fragCreateComplain", "RefernceDocType").setSelectedKey(null);
			var Plant = this.byId("SCIN_I01").getSelectedKey();
			var aFilters = [];
			aFilters.push(new Filter("Plant", "EQ", Plant));
			Fragment.byId("fragCreateComplain", "CCSalesoffice").getBinding("items").filter(aFilters);

			var Filters = [];
			var newFilter;
			if (oModelData.customerInfo.to_CurrentOwner && oModelData.customerInfo.to_CurrentOwner.Partner) {
				newFilter = new sap.ui.model.Filter("BusinessPartner",
					sap.ui.model.FilterOperator.EQ,
					oModelData.customerInfo.to_CurrentOwner.Partner);
				Filters.push(newFilter);
			} else {
				newFilter = new sap.ui.model.Filter("BusinessPartner",
					sap.ui.model.FilterOperator.EQ,
					"");
				Filters.push(newFilter);
			}
			Fragment.byId("fragCreateComplain", "Contactperson").getBinding("items").filter(Filters);

			if (this.byId("SmartTableSalesArea").getTable().getSelectedItem()) {
				var oCPLContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
				var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CCustomer = this.formatNameAndValuePair(oCPLSelectedItem.CustomerName, oCPLSelectedItem.Customer);
			} else {
				CCustomer = "";
			}
			Fragment.byId("fragCreateComplain", "ActivityID").setValue(CCustomer);
			that._fnInitLoadRua();
			that._fnEnableCreateComplainDilaogBTN();

		},

		_fnInitLoadRua: function () {
			var Plant = this.byId("SCIN_I01").getSelectedKey();
			var mCreateComplain = this.getView().getModel("mCustIdentification");
			var aFilters = [];
			aFilters.push(new Filter("Plant", "EQ", Plant));
			this.getView().getModel().read("/ZAE_I_TC_RUA", {
				filters: aFilters,
				success: function (oData, response) {
					mCreateComplain.getData().CreateComplaint = oData.results;
					var FilterData = oData.results.filter(function (ele) {
						return ele.EmployeeResponsible !== "";
					});
					var ServiceManagerData = oData.results.filter(function (ele) {
						return ele.ServiceManager !== "";
					});
					if (FilterData.length > 0) {
						var oToken = new sap.m.Token({
							key: FilterData[0].EmployeeResponsible,
							text: FilterData[0].EmployeeResponsible
						});
						Fragment.byId("fragCreateComplain", "EmployeeResp").setRequired(true);
						Fragment.byId("fragCreateComplain", "EmployeeResp").setTokens([oToken]);
					}
					// if (ServiceManagerData.length > 0) {
					// 	Fragment.byId("fragCreateComplain", "ServiceManager").setRequired(true);
					// 	// Fragment.byId("fragCreateComplain", "ServiceManager").setSelectedKey(FilterData[0].ServiceManager);
					// }
					// if (ServiceManagerData.length > 0) {
					// 	var oToken = new sap.m.Token({
					// 		key: ServiceManagerData[0].ServiceManager,
					// 		text: ServiceManagerData[0].ServiceManager
					// 	});
					// 	Fragment.byId("fragCreateComplain", "ServiceManager").setRequired(true);
					// 	Fragment.byId("fragCreateComplain", "ServiceManager").setTokens([oToken]);
					// }

					if (ServiceManagerData.length > 0) {
						Fragment.byId("fragCreateComplain", "EmployeeResp").data("ServiceManager", ServiceManagerData[0].ServiceManager);
					} else {
						Fragment.byId("fragCreateComplain", "EmployeeResp").data("ServiceManager", "");
					}

					var ComplaintManager = oData.results.filter(function (ele) {
						return ele.ComplaintManager !== "";
					});
					if (ComplaintManager.length > 0) {
						Fragment.byId("fragCreateComplain", "EmployeeResp").data("ComplaintManager", ComplaintManager[0].ComplaintManager);
					} else {
						Fragment.byId("fragCreateComplain", "EmployeeResp").data("ComplaintManager", "");
					}

				},
				error: function (Error) {

				}
			});
		},

		fnSalesOfficeChange: function (results) {
			var that = this;
			var SalesGroup = results;
			var mCreateComplaint = that.getView().getModel("mCustIdentification");
			var Plant = this.byId("SCIN_I01").getSelectedKey();
			var SalesOffice = Fragment.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
			var aFilters = [];
			aFilters.push(new Filter("Plant", "EQ", Plant));
			aFilters.push(new Filter("SalesOffice", "EQ", SalesOffice));
			Fragment.byId("fragCreateComplain", "CCSalesgroup").getBinding("items").filter(aFilters);
			that._fnEnableCreateComplainDilaogBTN();
			that.getView().byId("SCIN_B15").setBusy(false);
			that._oCreateComplainDialog.open();
		},

		fnSalesGroupChange: function () {
			var mCreateComplaint = this.getView().getModel("mCustIdentification").getData().CreateComplaint;
			var Plant = this.byId("SCIN_I01").getSelectedKey();
			var SalesOffice = Fragment.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
			var SalesGroup = Fragment.byId("fragCreateComplain", "CCSalesgroup").getSelectedKey();
			var ActivityData = mCreateComplaint.filter(function (ele) {
				return ele.Plant === Plant && ele.SalesOffice === SalesOffice && ele.SalesGroup === SalesGroup;
			});

			if (ActivityData.length > 0) {
				Fragment.byId("fragCreateComplain", "Activitytype").setValue(ActivityData[0].ActivityType);
				Fragment.byId("fragCreateComplain", "Activitytype").setEnabled(false);
				// if (ActivityData[0].ActivityType === "ZCOM") {
				// 	Fragment.byId("fragCreateComplain", "ServiceManager").setVisible(false);
				// }
			} else {
				Fragment.byId("fragCreateComplain", "Activitytype").setValue("");
			}

			var Filter = [];
			var newFilter;
			newFilter = new sap.ui.model.Filter("TransactionType",
				sap.ui.model.FilterOperator.EQ,
				ActivityData[0].ActivityType);
			Filter.push(newFilter);
			//	Filter.push(new Filter("TransactionType", "EQ", ActivityData[0].ActivityType));
			//	Fragment.byId("fragCreateComplain", "ComplianReason").setBusy(true);
			Fragment.byId("fragCreateComplain", "ComplianReason").getBinding("items").filter(Filter);
			this._fnEnableCreateComplainDilaogBTN();
		},

		fnComplainReasonCodeGroup: function (oEvent) {
			var ActivityType = Fragment.byId("fragCreateComplain", "Activitytype").getValue();
			var ComplainCodeReason = Fragment.byId("fragCreateComplain", "ComplianReason").getSelectedKey();
			var aFilters = [];
			aFilters.push(new Filter("TransactionType", "EQ", ActivityType));
			aFilters.push(new Filter("CodeGroup", "EQ", ComplainCodeReason));
			//	Fragment.byId("fragCreateComplain", "ComplianReasonCode").setBusy(true);
			Fragment.byId("fragCreateComplain", "ComplianReasonCode").getBinding("items").filter(aFilters);
			this._fnEnableCreateComplainDilaogBTN();
		},

		_fnEnableCreateComplainDilaogBTN: function () {
			var EmployeeResp = Fragment.byId("fragCreateComplain", "EmployeeResp").getTokens();
			// var ServiceManager = Fragment.byId("fragCreateComplain", "ServiceManager").getTokens();
			var Description = Fragment.byId("fragCreateComplain", "Description").getValue();
			var ComplainText = Fragment.byId("fragCreateComplain", "ComplainText").getValue();
			var SalesOffice = Fragment.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
			var SalesGroup = Fragment.byId("fragCreateComplain", "CCSalesgroup").getSelectedKey();
			var CodeGroup = Fragment.byId("fragCreateComplain", "ComplianReasonCode").getSelectedKey();
			var Code = Fragment.byId("fragCreateComplain", "ComplianReason").getSelectedKey();

			// var bool = (EmployeeResp.getRequired() ? EmployeeResp.getSelectedItem() != null : true) && (ServiceManager.getRequired() ?
			// 		ServiceManager.getSelectedItem() != null : true) && Description !== "" && ComplainText !==
			// 	"" && SalesOffice !== "" && SalesGroup !== "" && CodeGroup !== "" && Code !== "";

			var bool = EmployeeResp !== "" && Description !== "" && ComplainText !== "" && SalesOffice !== "" && SalesGroup !== "" &&
				CodeGroup !==
				"" && Code !== ""
				//   &&(ServiceManager.getRequired() ? ServiceManager.getSelectedItem() != null : true) ;
			this._oCreateComplainDialog.getBeginButton().setEnabled(bool);
		},

		_CreateComplainDialog: function (oDialogContent) {
			var that = this;
			this._oCreateComplainDialog = new sap.m.Dialog({
				title: "{i18n>CreateComplain}",
				content: [
					oDialogContent
				],
				contentWidth: "500px",
				beginButton: new sap.m.Button({
					text: "{i18n>Create}",
					press: function () {
						var Plant = this.byId("SCIN_I01").getSelectedKey();
						// var Id = this.getView().byId("SCIN_I01").getSelectedItem();
						// var ServiceOrg = sap.ui.getCore().byId(Id).getBindingContext().getObject().ServiceOrg;
						var EmployeeResp = Fragment.byId("fragCreateComplain", "EmployeeResp").getTokens()[0].getKey();
						var Reference = Fragment.byId("fragCreateComplain", "ReferenceNo").getValue();
						var ReferenceDocType = Fragment.byId("fragCreateComplain", "RefernceDocType").getSelectedKey();
						var Description = Fragment.byId("fragCreateComplain", "Description").getValue();
						var ComplainText = Fragment.byId("fragCreateComplain", "ComplainText").getValue();
						var SalesOffice = Fragment.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
						var SalesGroup = Fragment.byId("fragCreateComplain", "CCSalesgroup").getSelectedKey();
						var CodeGroup = Fragment.byId("fragCreateComplain", "ComplianReason").getSelectedKey();
						var Code = Fragment.byId("fragCreateComplain", "ComplianReasonCode").getSelectedKey();
						var ContactPerson = Fragment.byId("fragCreateComplain", "Contactperson").getSelectedKey();
						// var ServiceManager = Fragment.byId("fragCreateComplain", "ServiceManager").getTokens()[0].getKey();
						var Activitytype = Fragment.byId("fragCreateComplain", "Activitytype").getValue();
						var oSalesAreaContext = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
						var oSalesAreaSelectedItem = oSalesAreaContext.getModel().getProperty(oSalesAreaContext.getPath());
						//	var oCPLContext = that.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
						//	var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
						var ComplaintManager = Fragment.byId("fragCreateComplain", "EmployeeResp").data()["ComplaintManager"];
						var ServiceManager = Fragment.byId("fragCreateComplain", "EmployeeResp").data()["ServiceManager"]
						var Equipment = that.byId("EquipmentVH").getTokens()[0].getProperty("key");
						var oEntity = "ZAE_FM_SCIN_CRE_ACT_COMPLAINSet";
						var oModel = that.getView().getModel();
						var data = [{
							callProperty: "ServiceOrg",
							value: Plant
						}, {
							callProperty: "ActivityPartner",
							value: oSalesAreaSelectedItem.Customer
						}, {
							callProperty: "SalesOrg",
							value: oSalesAreaSelectedItem.SalesOrganization
						}, {
							callProperty: "DisChannel",
							value: oSalesAreaSelectedItem.DistrChannel
						}, {
							callProperty: "Division",
							value: oSalesAreaSelectedItem.Division
						}, {
							callProperty: "ContactPerson",
							value: ContactPerson
						}, {
							callProperty: "Description",
							value: Description
						}, {
							callProperty: "ComplainText",
							value: ComplainText
						}, {
							callProperty: "Equipment",
							value: Equipment
						}, {
							callProperty: "ServiceManager",
							value: ServiceManager
						}, {
							callProperty: "EmployeeResp",
							value: EmployeeResp
						}, {
							callProperty: "SalesGroup",
							value: SalesGroup
						}, {
							callProperty: "SalesOffice",
							value: SalesOffice
						}, {
							callProperty: "Reference",
							value: EmployeeResp
						}, {
							callProperty: "CodeGroup",
							value: CodeGroup
						}, {
							callProperty: "Code",
							value: Code
						}, {
							callProperty: "ReferenceDocType",
							value: ReferenceDocType
						}, {
							callProperty: "ActivityType",
							value: Activitytype
						}, {
							callProperty: "ComplaintManager",
							value: ComplaintManager
						}];
						var succFunc = function (oData) {
							// that.getView().getModel().refresh();
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							var message1 = that.getView().getModel("i18n").getResourceBundle().getText("CreatedSuccess", [oData.EActivityNo]);
							// var message2 = that.getView().getModel("i18n").getResourceBundle().getText("Successfully");
							that.onSearch();
							that.byId("SmartTableContactPersonList").rebindTable();
							var msg = new sap.ui.core.message.Message({
								persistent: true,
								code: oData.EActivityNo,
								type: sap.ui.core.MessageType.Success,
								message: message1,
								additionalText: "",
								description: "Activity"
							});
							sap.ui.getCore().getMessageManager().addMessages(msg);
						};
						var errFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							// that.getView().getModel().refresh();
							that.onSearch();
						};
						that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
						that._oCreateComplainDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oCreateComplainDialog.close();
					}.bind(this)
				})
			});
			this.getView().addDependent(this._oCreateComplainDialog);
		},
		fnServiceContractVisible: function (ContractStatusCode, RelForWarRecSC) {
			if (ContractStatusCode === "CTIN") {
				return RelForWarRecSC;
			}
			return false;
		},

		fnCustomerStatus: function (CustomerStatus) {
			switch (CustomerStatus) {
			case "":
				return "No";
				break;
			case "X":
				return "Yes";
				break;
			case true:
				return "Error";
				break;
			default:
				return "None"; //"Information";
				break;
			}
		},

		fnCustomerStatusState: function (CustomerStatusState) {
			switch (CustomerStatusState) {
			case "":
				return "Success";
				break;
			case "X":
				return "Error";
				break;
			case true:
				return "Error";
				break;
			default:
				return "None"; //"Information";
				break;
			}
		},
		fnServiceContractStatusCriti: function (ContractStatusCriti, ) {

			switch (ContractStatusCriti) {
			case 1:
				return "Error";
				break;
			case 3:
				return "Success";
				break;
			default:
				return "None"; //"Information";
				break;
			}

			return "Error";
		},
		fnServiceContractStatusIcon: function (ContractStatusCriti) {

			switch (ContractStatusCriti) {
			case 1:
				return "sap-icon://status-negative";
				break;
			case 3:
				return "sap-icon://status-positive";
				break;
			default:
				return "sap-icon://hint";
				break;
			}

			return "sap-icon://status-negative";
		},

		fnfindServiceContractNumber: function (ServiceCOntractList) {
			var contract = "";
			for (var i = 0; ServiceCOntractList && i < ServiceCOntractList.length; i++) {
				if (ServiceCOntractList[i].ContractStatus === "CTIN") {
					contract = ServiceCOntractList[i].SalesContract;
				}
			}
			return contract;
		},

		/*	fnfindSmartServiceContractNumber: function (ServiceCOntractList) {
				var contract = "";
				for (var i = 0; ServiceCOntractList && i < ServiceCOntractList.length; i++) {
					contract = ServiceCOntractList[i].SalesContract;
				}
				return contract;
			},*/

		fnFormatDeferredRevenue: function (ServiceCOntractList) {
			var DeferredRevenue1 = "";
			for (var i = 0; ServiceCOntractList && i < ServiceCOntractList.length; i++) {
				if (ServiceCOntractList[i].ContractStatus === "CTIN") {
					DeferredRevenue1 = ServiceCOntractList[i].DeferredRevenue1;
				}
			}
			return DeferredRevenue1;
		},
		fnFormatCurrency: function (ServiceCOntractList) {
			var TransactionCurrency = "";
			for (var i = 0; ServiceCOntractList && i < ServiceCOntractList.length; i++) {
				if (ServiceCOntractList[i].ContractStatus === "CTIN") {
					TransactionCurrency = ServiceCOntractList[i].TransactionCurrency;
				}
			}
			return TransactionCurrency;
		},
		onBeforeRebindSmartTableComplainList: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			if (oModelData.customerInfo.Equipment && binding) {
				binding.preventTableBind = false;
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					oModelData.customerInfo.Equipment);
				aFilters.push(newFilter);
				if (binding) {
					binding.filters = aFilters;
				}
			} else if (binding) {
				binding.preventTableBind = true;
			}
		},
		onBeforeRebindopenEVHCTable: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			if (this.ServiceComplaintTab) {
				binding.preventTableBind = false;
				var Equipment = oModelData.customerInfo.Equipment.padStart(18, 0);
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					Equipment);
				aFilters.push(newFilter);
				binding.filters = aFilters;
			} else {
				binding.preventTableBind = true;
			}
		},

		onBeforeRebindRecallTable: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			// aFilters.push(new sap.ui.model.Filter("SystemStatus", sap.ui.model.FilterOperator.NotContains, "TECO"));
			if (oModelData.customerInfo.Equipment) {
				binding.preventTableBind = false;
				var Equipment = oModelData.customerInfo.Equipment.padStart(18, 0);
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					Equipment);
				aFilters.push(newFilter);
				if (binding) {
					binding.filters = aFilters;
				}
			} else {
				binding.preventTableBind = true;
			}

		},

		fnHandelComplainLinkPress: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash3 = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash3);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Activity",
					// action: "aesDisplay"
					action: "aeDisplay&/ZAE_C_Activity_01(object_type='BUS2000126',Activity='" + oEvent.getSource().getText() +
						"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
				}
				/*,
				                params: {
				                    "ServiceOrder": oEvent.getSource().getText()
				                }*/
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},
		fnNPSScoreFormat: function (obj) {
			if (obj && obj.NPSScore) {
				return Number(obj.NPSScore) * 10;
			}
			return 0;
		},

		fnPDSSScoreFormat: function (obj) {
			if (obj && obj.PDSSScore) {
				return Number(obj.PDSSScore) * 10;
			}
			return 0;
		},

		fnNPSRMChartColourFormat: function (obj) {
			if (obj && obj.NPSScore) {
				if (obj.NPSScore <= 6) {
					return sap.m.ValueColor.Error; //red
				} else if (obj.NPSScore <= 8) {
					return sap.m.ValueColor.Critical; //Yellow   
				} else if (obj.NPSScore <= 10) {
					return sap.m.ValueColor.Good; //Green
				} else {
					return sap.m.ValueColor.Neutral; //Grayish 
				}
			}
			return sap.m.ValueColor.Error;
		},
		fnPDSSRMChartColourFormat: function (obj) {
			if (obj && obj.PDSSScore) {
				if (obj.PDSSScore <= 6) {
					return sap.m.ValueColor.Error; //red
				} else if (obj.PDSSScore <= 8) {
					return sap.m.ValueColor.Critical; //Yellow   
				} else if (obj.PDSSScore <= 10) {
					return sap.m.ValueColor.Good; //Green 
				} else {
					return sap.m.ValueColor.Neutral; //Grayish 
				}
			}
			return sap.m.ValueColor.Error;
		},
		handleCreateCustomerInputValidation: function () {
			//	var MobileNo = Fragment.byId("fragCreateCustomer", "MOBILENO");
			//	MobileNo.setValue(MobileNo.getValue().replace(/[^0-9+()]+/g, "").slice(0, 15));

			var CPRNO = Fragment.byId("fragCreateCustomer", "CPRNO");
			// var CPR = CPRNO.getLabels()[0];
			// var CPRLabel = CPR.getText();
			// if (CPRLabel === "National ID") {
			// 	CPRNO.setValue(CPRNO.getValue().replace(/[^0-9()!@#%^&*_+~]+/g, "").slice(0, 8));
			// } else {
			// 	CPRNO.setValue(CPRNO.getValue().replace(/[^0-9()!@#%^&*_+~]+/g, "").slice(0, 20));
			// }

			var Nationality = Fragment.byId("fragCreateCustomer", "NATIONALITY");
			Nationality.setValue(Nationality.getValue().replace(/[^a-zA-Z]+/, ""));
			if (Nationality.getValue() !== "") {
				Nationality.setValueState("Error");
			} else {
				Nationality.setValueState("None");
			}
			//	var TELNO = Fragment.byId("fragCreateCustomer", "TELNO");
			//	TELNO.setValue(TELNO.getValue().replace(/[^0-9]+/g, "").slice(0, 20));
			var REGION = Fragment.byId("fragCreateCustomer", "REGION");
			if (REGION.getValue() !== "") {
				REGION.setValueState("Error");
			} else {
				REGION.setValueState("None");
			}
			var COUNTRY = Fragment.byId("fragCreateCustomer", "COUNTRY");
			COUNTRY.setValue(COUNTRY.getValue().replace(/[^a-zA-Z]+/, ""));
			if (COUNTRY.getValue() !== "") {
				COUNTRY.setValueState("Error");
			} else {
				COUNTRY.setValueState("None");
			}
			this.fnCheckCreateCustomerRequiredValidation();
		},

		handleCreateContactPersonInputValidation: function () {

			var CPRNO = Fragment.byId("fragCreateContactPerson", "CPRNO");
			// var CPR = CPRNO.getLabels()[0];
			// var CPRLabel = CPR.getText();
			// if (CPRLabel === "National ID") {
			// 	CPRNO.setValue(CPRNO.getValue().replace(/[^0-9()!@#%^&*_+~]+/g, "").slice(0, 8));
			// } else {
			// 	CPRNO.setValue(CPRNO.getValue().replace(/[^0-9()!@#%^&*_+~]+/g, "").slice(0, 20));
			// }

			CPRNO.setValue(CPRNO.getValue().replace(/[^0-9()!@#%^&*_+~]+/g, "").slice(0, 25));
			//	var TELNO = Fragment.byId("fragCreateContactPerson", "TELNO");
			//	TELNO.setValue(TELNO.getValue().replace(/[^0-9]+/g, "").slice(0, 20));
			var CC_FIRSTNAME = Fragment.byId("fragCreateContactPerson", "FIRSTNAME");
			CC_FIRSTNAME.setValue(CC_FIRSTNAME.getValue().replace(/[^a-zA-Z. -]+/, ""));
			var CC_FAMILYNAME = Fragment.byId("fragCreateContactPerson", "FAMILYNAME");
			CC_FAMILYNAME.setValue(CC_FAMILYNAME.getValue().replace(/[^a-zA-Z. -]+/, ""));
			var COUNTRY = Fragment.byId("fragCreateContactPerson", "COUNTRY");
			COUNTRY.setValue(COUNTRY.getValue().replace(/[^a-zA-Z]+/, ""));
			if (COUNTRY.getValue() !== "") {
				COUNTRY.setValueState("Error");
			} else {
				COUNTRY.setValueState("None");
			}
			var REGION = Fragment.byId("fragCreateContactPerson", "REGION");
			if (REGION.getValue() !== "") {
				REGION.setValueState("Error");
			} else {
				REGION.setValueState("None");
			}
			this._fnContractButtonCreateButtonEnabledState();
		},

		handleTeliphoneNoValidation: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			var oValue = oEvent.getSource().getValue();
			var Mask = oEvent.getSource().getMask().split(" ")[1];
			var isMobile = false;
			// if (oValue) {
			// 	var input = oValue.split(" ")[1].replace("_", "");
			// 	if (input.length !== Mask.length) {
			// 		oEvent.getSource().setValueState("Error");
			// 	} else {
			// 		oEvent.getSource().setValueState("None");
			// 	}
			// } else {
			// 	oEvent.getSource().setValueState("None");
			// }
			if (oValue) {
				var input = oValue.split(" ")[1].replace("_", "");

				var isLengthValid = input.length === Mask.length;

				var isPatternValid = that.validateNumber(input, isMobile);

				if (isLengthValid && isPatternValid) {
					oEvent.getSource().setValueState("None");
				} else {
					oEvent.getSource().setValueState("Error");
				}
			} else {
				oEvent.getSource().setValueState("None");
			}
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateContactPerson":
				that._fnContractButtonCreateButtonEnabledState();
				break;
			case "fragCreateCompany":
				that._fnCompanyCreateButtonEnabledState();
				break;
			}
			//	this.handleCreateContactPersonInputValidation();
		},
		validateNumber: function (number, isMobile) {
			var sequenceRegex;
			if (isMobile) {
				sequenceRegex =
					/^(?![012345])(?!(\d)\1*$|23456|65432|987654|000000|111111|222222|333333|444444|555555|666666|777777|888888|999999)\d+$/;
			} else {
				sequenceRegex =
					/^(?![01])(?!(\d)\1*$|23456|65432|987654|000000|111111|222222|333333|444444|555555|666666|777777|888888|999999)\d+$/;
			}
			if (sequenceRegex.test(number)) {
				return true;
			}
			return false;
		},
		handleMobileNoValidation: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			var oValue = oEvent.getSource().getValue();
			var Mask = oEvent.getSource().getMask().split(" ")[1];
			// if (oValue) {
			// 	var input = oValue.split(" ")[1].replace("_", "");
			// 	if (input.length !== Mask.length) {
			// 		oEvent.getSource().setValueState("Error");
			// 	} else {
			// 		oEvent.getSource().setValueState("None");
			// 	}
			// } else {
			// 	oEvent.getSource().setValueState("None");
			// }
			var isMobile = true;
			var input;
			var isLengthValid;
			var isPatternValid;
			if (oValue) {
				input = oValue.split(" ")[1].replace("_", "");
				isLengthValid = input.length === Mask.length;
				isPatternValid = that.validateNumber(input, isMobile);
				if (isLengthValid && isPatternValid) {
					oEvent.getSource().setValueState("None");
				} else {
					oEvent.getSource().setValueState("Error");
				}
			} else {
				oEvent.getSource().setValueState("None");
			}
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateContactPerson":
				that._fnContractButtonCreateButtonEnabledState();
				break;
			case "fragCreateCompany":
				that._fnCompanyCreateButtonEnabledState();
				break;
			case "fnUpdatePersonalData":
				that.fnUpdatePersonalData();
				break;
			}
		},
		onPressCreateExtendedWarrantyQuotation: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oModelData = this.getView().getModel("mCustIdentification").getData();
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			var oTokens = this.byId("EquipmentVH").getTokens();
			var Equipment = "",
				EquipmentWithDesc = "";
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var Category = [];
			var CategoryTokens = this.byId("SCIN_I02").getTokens();
			for (var i = 0; i < CategoryTokens.length; i++) {
				Category.push({
					key: CategoryTokens[i].getProperty("key"),
					text: CategoryTokens[i].getProperty("text")
				});
			}
			var appState = {
				LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Category: Category,
				// Category: this.byId("SCIN_I02").getSelectedKey(),
				// Categoryval: this.byId("SCIN_I02").getValue(),
				Insurer: this.byId("SCIN_I03").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};
			var Params = {
				"SalesOrganization": oSelectedItem.SalesOrganization,
				"DistributionChannel": oSelectedItem.DistrChannel,
				"Division": oSelectedItem.Division,
				"SalesOffice": oModelData.SchemaTransactionType.SalesOffice,
				"Customer": oModelData.customerInfo.to_CurrentOwner.Partner,
				"Equipment": this.byId("EquipmentVH").getTokens()[0].getProperty("key")
			}

			if (this.Opportunity) {
				Params["Opportunity"] = this.Opportunity;
			}
			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();
			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ExtendedWarranty",
					action: "aeCreateQuotation"
				},
				params: Params
					// params: {
					// 	"SalesOrganization": oSelectedItem.SalesOrganization,
					// 	"DistributionChannel": oSelectedItem.DistrChannel,
					// 	"Division": oSelectedItem.Division,
					// 	"SalesOffice": oModelData.SchemaTransactionType.SalesOffice,
					// 	"Customer": oModelData.customerInfo.to_CurrentOwner.Partner,
					// 	"Equipment": this.byId("EquipmentVH").getTokens()[0].getProperty("key")
					// }
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},
		onCreateCompany: function (oEvent) {
			if (!this._oNewCreateCompanyDialog) {
				Fragment.load({
						id: "fragCreateCompany",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateCompany",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateCompanyDialog(oDialogContent);
						this._setCreateCompanyDialogInitialState();
					}.bind(this));
			} else {
				this._setCreateCompanyDialogInitialState();
			}
		},
		_CreateCompanyDialog: function (oDialogContent) {
			var Plant;
			var SalesOrg;
			var DistributionChannel;
			var Division;
			var SALUTATION;
			var BPGrouping;
			var MobileNo;
			var TELNO;
			var EMAIL;
			var CPRNO;
			var STREET;
			var STREET1;
			var OFFICENO;
			var POBOX;
			var CITY;
			var COUNTRY;
			var REGION;
			var mCreateCustomer;
			var CompanyCode;
			var CompanyCodePath;
			var CompanyName;
			var CompanyName2;
			var VatRegNo;
			var POSTALCODE;
			var FAXNUMBER;
			var Location;
			var COUNTRYTOKEN;
			var REGIONTOKEN;
			var that = this;

			this._oNewCreateCompanyDialog = new sap.m.Dialog({
				title: "{i18n>CreateCompany}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "{i18n>Create}",

					press: function () {
						that._oNewCreateCompanyDialog.setBusy(true);
						mCreateCustomer = that.getView().getModel("mCreateCustomer");
						Plant = that.getView().byId("SCIN_I01").getSelectedKey();
						SALUTATION = Fragment.byId("fragCreateCompany", "SALUTATION").getValue();
						SalesOrg = Fragment.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
						DistributionChannel = Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").getSelectedKey();
						Division = Fragment.byId("fragCreateCompany", "DIVISION").getSelectedKey();
						CompanyCodePath = Fragment.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedItem().oBindingContexts.mCreateCustomer
							.sPath;
						CompanyCode = mCreateCustomer.getProperty(CompanyCodePath).Ccode;
						//	BPGrouping = Fragment.byId("fragCreateCompany", "BPGROUPING").getSelectedKey();
						MobileNo = Fragment.byId("fragCreateCompany", "MOBILENO").getValue().split(" ")[1];
						TELNO = Fragment.byId("fragCreateCompany", "TELNO").getValue().split(" ")[1];
						EMAIL = Fragment.byId("fragCreateCompany", "EMAIL").getValue();
						CPRNO = Fragment.byId("fragCreateCompany", "CRNO").getValue();
						STREET = Fragment.byId("fragCreateCompany", "STREET").getValue();
						STREET1 = Fragment.byId("fragCreateCompany", "STREET1").getValue();
						OFFICENO = Fragment.byId("fragCreateCompany", "OFFICENO").getValue();
						POBOX = Fragment.byId("fragCreateCompany", "POBOX").getValue();
						POSTALCODE = Fragment.byId("fragCreateCompany", "POSTALCODE").getValue();
						Location = Fragment.byId("fragCreateCompany", "REGIOGROUP").getSelectedKey();
						CITY = Fragment.byId("fragCreateCompany", "CITY").getValue();
						CompanyName = Fragment.byId("fragCreateCompany", "NAME1").getValue();
						CompanyName2 = Fragment.byId("fragCreateCompany", "NAME2").getValue();
						COUNTRYTOKEN = Fragment.byId("fragCreateCompany", "COUNTRY").getTokens()[0];
						if (COUNTRYTOKEN) {
							COUNTRY = COUNTRYTOKEN.getKey();
						}
						REGIONTOKEN = Fragment.byId("fragCreateCompany", "REGION").getTokens()[0];
						if (REGIONTOKEN) {
							REGION = REGIONTOKEN.getKey();
						}
						VatRegNo = Fragment.byId("fragCreateCompany", "TAXNUMXL").getValue();
						FAXNUMBER = Fragment.byId("fragCreateCompany", "FAXNUMBER").getValue().split(" ")[1];
						var oEntity = "ZAE_FM_SC_COMP_CREATE_FRM_CISet";
						var oModel = that.getView().getModel();
						var data = [{
							callProperty: "SalesOrg",
							value: SalesOrg
						}, {
							callProperty: "Plant",
							value: Plant
						}, {
							callProperty: "Salutation",
							value: SALUTATION
						}, {
							callProperty: "Ccode",
							value: CompanyCode
						}, {
							callProperty: "CompanyName",
							value: CompanyName
						}, {
							callProperty: "CompanyName2",
							value: CompanyName2
						}, {
							callProperty: "MobileNo",
							value: MobileNo
						}, {
							callProperty: "TelNo",
							value: TELNO
						}, {
							callProperty: "Email",
							value: EMAIL
						}, {
							callProperty: "Identificationnumber",
							value: CPRNO
						}, {
							callProperty: "Identificationcategory",
							value: "BUP002"
						}, {
							callProperty: "Street",
							value: STREET
						}, {
							callProperty: "Street1",
							value: STREET1
						}, {
							callProperty: "HouseNo",
							value: OFFICENO
						}, {
							callProperty: "PoBox",
							value: POBOX
						}, {
							callProperty: "City",
							value: CITY
						}, {
							callProperty: "Country",
							value: COUNTRY
						}, {
							callProperty: "Vtweg",
							value: DistributionChannel
						}, {
							callProperty: "Spart",
							value: Division
						}, {
							callProperty: "Region",
							value: REGION
						}, {
							callProperty: "Vatregistrationnumber",
							value: VatRegNo
						}, {
							callProperty: "PostlCode",
							value: POSTALCODE
						}, {
							callProperty: "FaxNumber",
							value: FAXNUMBER
						}, {
							callProperty: "Location",
							value: Location
						}];
						var succFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().getModel().refresh();
							that._oNewCreateCompanyDialog.setBusy(false);
							that._oNewCreateCompanyDialog.close();
						};
						var errFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().getModel().refresh();
							that._oNewCreateCompanyDialog.setBusy(false);
							that._oNewCreateCompanyDialog.close();
						};

						that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewCreateCompanyDialog.close();
					}.bind(this)
				})
			});
			this.getView().addDependent(this._oNewCreateCompanyDialog);
		},
		_setCreateCompanyDialogInitialState: function () {
			this._setDefaultValues("fragCreateCompany");
			var aFilter = [];
			//	var aSalesOrg = [];
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			aFilter.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
			var SalesOrg = Fragment.byId("fragCreateCompany", "SALESORGANIZATION");
			SalesOrg.getBinding("items").filter(aFilter);
			Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setSelectedKey(null);
			Fragment.byId("fragCreateCompany", "DIVISION").setSelectedKey(null);
			SalesOrg.setSelectedKey(null);
			//	var BPGrouping = Fragment.byId("fragCreateCompany", "BPGROUPING");
			//	BPGrouping.setSelectedKey(null);
			Fragment.byId("fragCreateCompany", "REGIOGROUP").setSelectedKey(null);
			Fragment.byId("fragCreateCompany", "SALUTATION").setValue("");
			Fragment.byId("fragCreateCompany", "MOBILENO").setValue("");
			Fragment.byId("fragCreateCompany", "MOBILENO").setMask("");
			Fragment.byId("fragCreateCompany", "MOBILENO").setValueState("None");
			//	Fragment.byId("fragCreateCompany", "MOBILENO").setEnabled(false);
			Fragment.byId("fragCreateCompany", "TELNO").setMask("");
			//	Fragment.byId("fragCreateCompany", "TELNO").setEnabled(false);
			Fragment.byId("fragCreateCompany", "TELNO").setValueState("None");
			Fragment.byId("fragCreateCompany", "TELNO").setValue("");
			Fragment.byId("fragCreateCompany", "FAXNUMBER").setValue("");
			Fragment.byId("fragCreateCompany", "FAXNUMBER").setMask("");
			Fragment.byId("fragCreateCompany", "FAXNUMBER").setValueState("None");
			Fragment.byId("fragCreateCompany", "EMAIL").setValue("");
			Fragment.byId("fragCreateCompany", "CRNO").setValue("");
			Fragment.byId("fragCreateCompany", "STREET").setValue("");
			Fragment.byId("fragCreateCompany", "STREET1").setValue("");
			Fragment.byId("fragCreateCompany", "OFFICENO").setValue("");
			Fragment.byId("fragCreateCompany", "POBOX").setValue("");
			Fragment.byId("fragCreateCompany", "POSTALCODE").setValue("");
			Fragment.byId("fragCreateCompany", "CITY").setValue("");
			Fragment.byId("fragCreateCompany", "COUNTRY").setValue("");
			Fragment.byId("fragCreateCompany", "REGION").setValue("");
			Fragment.byId("fragCreateCompany", "NAME1").setValue("");
			Fragment.byId("fragCreateCompany", "NAME2").setValue("");
			Fragment.byId("fragCreateCompany", "COUNTRY").setValueState("None");
			Fragment.byId("fragCreateCompany", "COUNTRY").setValue("");
			//	Fragment.byId("fragCreateCompany", "COUNTRY").setTokens([]);
			Fragment.byId("fragCreateCompany", "REGION").setTokens([]);
			Fragment.byId("fragCreateCompany", "REGION").setValueState("None");
			Fragment.byId("fragCreateCompany", "REGION").setValue("");
			Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setEnabled(false);
			Fragment.byId("fragCreateCompany", "DIVISION").setEnabled(false);
			Fragment.byId("fragCreateCompany", "TAXNUMXL").setValue("");
			this._fnCompanyCreateButtonEnabledState();
			this.fnLoadCreateCompany();
			// var FragmentID = "fragCreateCompany";
			// this.fnLoadCreateContactBPIDType(FragmentID);
			this._oNewCreateCompanyDialog.open();
		},
		fnLoadCreateCompany: function () {
			var that = this;
			var aFilter = [];
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			aFilter.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, Plant));
			that._oNewCreateCompanyDialog.setBusy(true);
			this.getView().getModel().read("/ZAE_I_TC_COMP_SERV", {
				filters: aFilter,
				success: function (oData, response) {
					that._oNewCreateCompanyDialog.setBusy(false);
					var mCreateCompany = that.getView().getModel("mCreateCustomer");
					mCreateCompany.getData().oCreateCustomerData.CreateCompanyData = oData.results[0];
					var SalesOrgUnique = [...new Map(oData.results.map((m) => [m.SalesOrganization, m])).values()];
					SalesOrgUnique.sort(function (a, b) {
						return a.SalesOrganization.localeCompare(b.SalesOrganization);
					});
					mCreateCompany.getData().oCreateCustomerData.CreateCompanySalesOrg = SalesOrgUnique;
					if (SalesOrgUnique.length === 1) {
						Fragment.byId("fragCreateCompany", "SALESORGANIZATION").setSelectedKey(SalesOrgUnique[0].SalesOrganization);
						Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setEnabled(true);
						that._fnCreateCompanyValidation();
						that.fnCreateCompanySalesOrgChange();
					}
					mCreateCompany.updateBindings(true);
				},
				error: function (Error) {
					that._oNewCreateCompanyDialog.setBusy(false);
				}
			});
		},
		_fnCreateCompanyValidation: function () {
			var that = this;
			var oModel = that.getView().getModel();
			var SalesOrg = Fragment.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, SalesOrg));
			aFilters.push(new sap.ui.model.Filter("CustomerType", sap.ui.model.FilterOperator.EQ, '2'));
			aFilters.push(new sap.ui.model.Filter("BPType", sap.ui.model.FilterOperator.EQ, '2'));
			oModel.read("/ZAE_I_TC_SCIN_08", {
				filters: aFilters,
				success: function (oData1, response) {
					if (oData1.results.length > 0) {
						for (var i = 0; i < oData1.results.length; i++) {
							var Id = Fragment.byId("fragCreateCompany", oData1.results[i].Field);
							if (Id !== undefined && oData1.results[i].Mandatory === true) {
								Fragment.byId("fragCreateCompany", oData1.results[i].Field).setRequired(true);
							}
						}
					}
					that._fnCompanyCreateButtonEnabledState();
				}
			});
		},

		_fnCompanyCreateButtonEnabledState: function () {

			var SALESORGANIZATION = Fragment.byId("fragCreateCompany", "SALESORGANIZATION");
			var DISTRIBUTIONCHANNEL = Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL");
			var DIVISION = Fragment.byId("fragCreateCompany", "DIVISION");
			var SALUTATION = Fragment.byId("fragCreateCompany", "SALUTATION");
			var TELNO = Fragment.byId("fragCreateCompany", "TELNO");
			var CompanyName = Fragment.byId("fragCreateCompany", "NAME1");
			var CompanyName2 = Fragment.byId("fragCreateCompany", "NAME2");
			var POBOX = Fragment.byId("fragCreateCompany", "POBOX");
			var POSTALCODE = Fragment.byId("fragCreateCompany", "POSTALCODE");
			var COUNTRY = Fragment.byId("fragCreateCompany", "COUNTRY");
			var REGION = Fragment.byId("fragCreateCompany", "REGION");
			var MobileNo = Fragment.byId("fragCreateCompany", "MOBILENO");
			var Email = Fragment.byId("fragCreateCompany", "EMAIL");
			var CPRNO = Fragment.byId("fragCreateCompany", "CRNO");
			var FaxNumber = Fragment.byId("fragCreateCompany", "FAXNUMBER");
			var Street = Fragment.byId("fragCreateCompany", "STREET");
			var Street1 = Fragment.byId("fragCreateCompany", "STREET1");
			var HouseNo = Fragment.byId("fragCreateCompany", "OFFICENO");
			var City = Fragment.byId("fragCreateCompany", "CITY");
			var VatRegNo = Fragment.byId("fragCreateCompany", "TAXNUMXL");
			var LOCATION = Fragment.byId("fragCreateCompany", "REGIOGROUP");

			var bEnabled = (SALUTATION.getRequired() ? SALUTATION.getSelectedKey() !== "" : true) &&
				(LOCATION.getRequired() ? LOCATION.getSelectedKey() !== "" : true) &&
				(CompanyName.getRequired() ? CompanyName.getValue() !== "" : true) &&
				(CompanyName2.getRequired() ? CompanyName2.getValue() !== "" : true) &&
				(COUNTRY.getRequired() ? COUNTRY.getTokens([]).length !== 0 : true) &&
				(COUNTRY.getValueState() !== "Error" ? true : false) &&
				(REGION.getRequired() ? REGION.getTokens([]).length !== 0 : true) &&
				(REGION.getValueState() !== "Error" ? true : false) &&
				(MobileNo.getRequired() ? (MobileNo.getValue() !== "" && !(MobileNo.getValue().includes("_"))) : true) &&
				(MobileNo.getValueState() !== "Error" ? true : false) &&
				(FaxNumber.getRequired() ? (FaxNumber.getValue() !== "" && !(FaxNumber.getValue().includes("_"))) : true) &&
				(FaxNumber.getValueState() !== "Error" ? true : false) &&
				(TELNO.getRequired() ? (TELNO.getValue() !== "" && !(TELNO.getValue().includes("_"))) : true) &&
				(TELNO.getValueState() !== "Error" ? true : false) &&
				(Email.getRequired() ? Email.getValue() !== "" : true) &&
				(Email.getValueState() === "None" ? true : false) &&
				(CPRNO.getRequired() ? CPRNO.getValue() !== "" : true) &&
				(Street.getRequired() ? Street.getValue() !== "" : true) &&
				(Street1.getRequired() ? Street1.getValue() !== "" : true) &&
				(HouseNo.getRequired() ? HouseNo.getValue() !== "" : true) &&
				(POBOX.getRequired() ? POBOX.getValue() !== "" : true) &&
				(City.getRequired() ? City.getValue() !== "" : true) &&
				(VatRegNo.getRequired() ? VatRegNo.getValue() !== "" : true) &&
				(POSTALCODE.getRequired() ? POSTALCODE.getValue() !== "" : true);

			//var VatRegNo = Fragment.byId("fragCreateCompany", "TAXNUMXL");
			// var bEnabled = PoBoxNo !== "" && COUNTRY !== 0 && REGION !== 0 && SALUTATION !== "" && SalesOrg !== "" &&
			// 	City !== "" &&
			// 	CompanyName !== "" &&
			// 	DistributionChannel !== "" && Division !== "" &&
			// 	SalesOrg !== "" && MobileNo !== "Error" && FaxNumber !== "Error" && (TELNO.getValueState() !== "Error" && TELNO.getValue() !== "" &&
			// 		!(TELNO.getValue().includes(
			// 			"_"))) && oEmail.getValueState() === "None" &&
			// 	POSTALCODE !== "";
			//	VatRegNo.getRequired() ? VatRegNo.getValue() !== "" : true);
			this._oNewCreateCompanyDialog.getBeginButton().setEnabled(bEnabled);
		},

		handleCreateCompanyInputValidation: function () {
			var REGION = Fragment.byId("fragCreateCompany", "REGION");
			if (REGION.getValue() !== "") {
				REGION.setValueState("Error");
			} else {
				REGION.setValueState("None");
			}
			var TelNo = Fragment.byId("fragCreateCompany", "TELNO");
			TelNo.setValue(TelNo.getValue().replace(/[^0-9]+/g, "").slice(0, 20));
			var CPRNO = Fragment.byId("fragCreateCompany", "CRNO");
			CPRNO.setValue(CPRNO.getValue().replace(/[^0-9-]+/g, "").slice(0, 20));
			var COUNTRY = Fragment.byId("fragCreateCompany", "COUNTRY");
			COUNTRY.setValue(COUNTRY.getValue().replace(/[^a-zA-Z. -]+/, ""));
			var Name1 = Fragment.byId("fragCreateCompany", "NAME1");
			Name1.setValue(Name1.getValue().replace(/[^a-zA-Z. -]+/, ""));
			var Name2 = Fragment.byId("fragCreateCompany", "NAME2");
			Name2.setValue(Name2.getValue().replace(/[^a-zA-Z. -]+/, ""));
			if (COUNTRY.getValue() !== "") {
				COUNTRY.setValueState("Error");
			} else {
				COUNTRY.setValueState("None");
			}
			this.fnCheckCreateCompanyRequiredValidation();
		},

		fnCheckCreateCompanyRequiredValidation: function () {
			this._fnCompanyCreateButtonEnabledState();
		},

		fnCreateCompanySalesOrgChange: function (oEvent) {
			var DCData = [];
			var mCreateCustomer = this.getView().getModel("mCreateCustomer");
			var DistributionChannelData = mCreateCustomer.getData().oCreateCustomerData.CreateCompanyData;
			var DCSalesOrganisation = Fragment.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
			if (DistributionChannelData instanceof Array) {
				var DCFilterData = DistributionChannel.filter(function (ele) {
					return ele.SalesOrganization === DCSalesOrganisation;
				});
				var DCUnique = [...new Map(DCFilterData.map((m) => [m.DistributionChannel, m])).values()];
				DCUnique.sort(function (a, b) {
					return a.DistributionChannel.localeCompare(b.DistributionChannel);
				});
				mCreateCustomer.getData().oCreateCustomerData.CreateCompanyDC = DCUnique;
			} else {
				DCData.push(DistributionChannelData)
				mCreateCustomer.getData().oCreateCustomerData.CreateCompanyDC = DCData;
				Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setSelectedKey(DCData[0].DistributionChannel);
				this.fnCreateCompanyDistributionChange();
			}
			Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setEnabled(true);
			mCreateCustomer.updateBindings(true);
			this._fnCompanyCreateButtonEnabledState();
		},

		fnCreateCompanyDistributionChange: function () {
			var oDivisonData = [];
			var mCreateCustomer = this.getView().getModel("mCreateCustomer");
			var DivisionData = mCreateCustomer.getData().oCreateCustomerData.CreateCompanyData;
			var DCSalesOrganisation = Fragment.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
			var DistrbChannel = Fragment.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").getSelectedKey();
			if (DivisionData instanceof Array) {
				var DivisionFilterData = DivisionData.filter(function (ele) {
					return ele.SalesOrganization === DCSalesOrganisation && ele.DistributionChannel === DistrbChannel;
				});
				mCreateCustomer.getData().oCreateCustomerData.CreateCompanyDivison = DivisionFilterData;
			} else {
				oDivisonData.push(DivisionData);
				mCreateCustomer.getData().oCreateCustomerData.CreateCompanyDivison = oDivisonData;
				Fragment.byId("fragCreateCompany", "DIVISION").setSelectedKey(oDivisonData[0].Division);
			}
			Fragment.byId("fragCreateCompany", "DIVISION").setEnabled(true);
			mCreateCustomer.updateBindings(true);
			this._fnCompanyCreateButtonEnabledState();
		},
		handleEmailInputChange: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			let oEmail = oEvent.getParameter('value');
			let regex = /^\w+([.-]\w+)*@\w+([.-]\w+)*(\.\w{2,3})+$/;
			if (oEmail) {
				if (regex.test(oEmail)) {
					oEvent.getSource().setValueState("None");
				} else {
					oEvent.getSource().setValueState("Error");
				}
			} else {
				oEvent.getSource().setValueState("None");
			}
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateContactPerson":
				that._fnContractButtonCreateButtonEnabledState();
				break;
			case "fragCreateCompany":
				that._fnCompanyCreateButtonEnabledState();
				break;
			case "fnUpdatePersonalData":
				that.fnUpdatePersonalData();
				break;
			}
			// this._fnContractButtonCreateButtonEnabledState();
		},
		_setDefaultValues: function (CallerId) {
			var oText, CountryToken, CountryCode;
			var MobileNo = Fragment.byId(CallerId, "MOBILENO");
			var TelNo = Fragment.byId(CallerId, "TELNO");
			var input = Fragment.byId(CallerId, "COUNTRY");
			var FAXNUMBER = Fragment.byId(CallerId, "FAXNUMBER");
			var oRegion = Intl.DateTimeFormat().resolvedOptions().timeZone;
			var oCountry = this.getView().getModel("RegionToCountry").getData()[oRegion];
			var oCountryData = this.getView().getModel("CountryCodes").getData().find(function (obj) {
				return obj.name === oCountry;
			});
			if (oCountryData) {
				oText = this.formatNameAndValuePair(oCountryData.code, oCountryData.name);
				CountryToken = new Token({
					key: oCountryData.code,
					text: oText
				});
				input.setTokens([CountryToken]);
				CountryCode = oCountryData.dial_code;
			} else {
				oText = "AE" + "( " + "United Arab Emirates" + " )";
				CountryToken = new Token({
					key: "AE",
					text: oText
				});
				input.setTokens([CountryToken]);
				CountryCode = "+" + "971";
			}
			if (oCountryData.code === "OM") {
				var MaxLengthMobile = CountryCode.length + 7;
				var MaxLengthTelNo = CountryCode.length + 7;
				var MaxLengthFAXNUMBER = CountryCode.length + 7;
				var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
				var TelNoMask = this.fnCreateMask(CountryCode, MaxLengthTelNo);
				var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
			} else {
				var MaxLengthMobile = CountryCode.length + 8;
				var MaxLengthTelNo = CountryCode.length + 7;
				var MaxLengthFAXNUMBER = CountryCode.length + 8;
				var MobileMask = this.fnCreateMask(CountryCode, MaxLengthMobile);
				var TelNoMask = this.fnCreateMask(CountryCode, MaxLengthTelNo);
				var FAXNUMBERMask = this.fnCreateMask(CountryCode, MaxLengthFAXNUMBER);
			}

			if (MobileNo) {
				if (MobileNo.getValue()) {
					MobileNo.setValue(CountryCode + " " + MobileNo.getValue().split(" ")[1]);
				}
				MobileNo.setMask(MobileMask);
				MobileNo.setEnabled(true);
				MobileNo.fireChange();
			}
			if (TelNo.getValue()) {
				TelNo.setValue(CountryCode + " " + TelNo.getValue().split(" ")[1]);
			}

			TelNo.setMask(TelNoMask);
			TelNo.setEnabled(true);
			TelNo.fireChange();
			if (FAXNUMBER.getValue()) {
				FAXNUMBER.setValue(CountryCode + " " + FAXNUMBER.getValue().split(" ")[1]);
			}

			FAXNUMBER.setMask(FAXNUMBERMask);
			FAXNUMBER.setEnabled(true);
			FAXNUMBER.fireChange();
		},

		onCustomerValueHelpRequested: function (oEvent1) {
			var that = this;
			var input = oEvent1.getSource();
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_I_Customer_02",
				initiallyVisibleFields: "Customer,CustomerName,PostalCode,CityName,Country,CountryName",
				selectionMode: "Single",
				tokenObject: {
					key: "Customer",
					Description: "CustomerName"
				},
				controlConfiguration: [{
					index: 0,
					key: "Customer",
					filterType: "auto",
					label: "{/#ZAE_I_Customer_02/Customer/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 1,
					key: "CustomerName",
					filterType: "auto",
					label: "{/#ZAE_I_Customer_02/CustomerName/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 2,
					key: "PostalCode",
					filterType: "auto",
					label: "{/#ZAE_I_Customer_02/PostalCode/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 3,
					key: "CityName",
					filterType: "auto",
					label: "{/#ZAE_I_Customer_02/CityName/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 4,
					key: "Country",
					filterType: "auto",
					label: "{/#ZAE_I_Customer_02/Country/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 5,
					key: "CountryName",
					filterType: "auto",
					label: "{/#ZAE_I_Customer_02/CountryName/@sap:label}",
					mandatory: "auto",
					visible: true
				}],
				defaultFilter: {},
				onBeforeRebindSmartTable: function (oEvent) {
					var aFilterArray = oEvent.getParameter("bindingParams").filters;
					oEvent.getParameter("bindingParams").filters = aFilterArray;
				}

			};
			that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
		},
		onCustomerTokenUpdate: function (oEvent) {
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
				oEvent.getSource().setTokens([])
			}
			this.fnCheckCreateEquiRequiredValidation();

		},
		onSelectCustomer: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedData.CustomerName, oSelectedData.Customer);
				var oToken = new sap.m.Token({
					key: oSelectedData.Customer,
					text: oText
				});
				oSource.setTokens([oToken]);
				oSource.fireTokenUpdate();
			}
		},
		handleCustomerSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "Customer",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						}),
						new Filter({
							path: "CustomerName",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						})

					],
					and: false
				}));
			}
			oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		onPressTestButton: function (oEvent) {
			var that = this;
			var fnLoadCallback = function (oEv1) {
				sap.m.MessageBox.information("https://ecvc-srv1.ccr.group/gc/mbed-fw-clients/ccr-sap-s4hana/load.js" +
					" Loaded successfullty");
			};
			var fnErrorCallback = function (oEv2) {
				sap.m.MessageBox.Error("https://ecvc-srv1.ccr.group/gc/mbed-fw-clients/ccr-sap-s4hana/load.js" + " Loaded successfullty");
			};
			jQuery.sap.includeScript({
				url: "https://ecvc-srv1.ccr.group/gc/mbed-fw-clients/ccr-sap-s4hana/load.js",
				id: "IncludeGoogleMapsScript",
				/*fnLoadCallback: fnLoadCallback,
                \ fnErrorCallback: fnErrorCallback*/
			}).then(function (oEv) {
				$.run();
				that.getView().byId("SCIN_B30").setEnabled(false);
				/*sap.m.MessageBox.information(
				 "https://ecvc-srv1.ccr.group/gc/mbed-fw-clients/ccr-sap-s4hana/load.js" + " Loaded successfullty");*/
			})
		},
		fnCheckAppointments: function () {
			var that = this;
			var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
			var oTableCount = this.getView().byId("OpenServiceRequests")._getRowCount();
			this.fnCheckOpenAppointmentExistForEqui().done(function (bool) {
				if (bool) {
					//if (true) {
					that.fnExistingAppointments();
				} else {
					// if (oTableCount > 0) {
					// 	sap.m.MessageBox.error(oResourceBundle.getText("CreateAppointmentError"));
					// } else {
					that.fnPressCreateAppointment();
					// }
				}
			});
		},
		fnCheckServiceRequests: function () {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oTableCount = this.getView().byId("OpenServiceRequests")._getRowCount();
			if (oTableCount > 0) {
				sap.m.MessageBox.error(oResourceBundle.getText("CreateServiceRequestError"));
			} else {
				this.onCreateRequestPress();
			}

		},
		fnCheckOpenAppointmentExistForEqui: function () {
			var oDeffred = new jQuery.Deferred();
			var that = this;
			var existOpenAppt = false;
			var ExistingAppointments = [];
			var PageData = that.getView().byId("SCIN_BoxSearchResults").getBindingContext().getObject();
			var oSelectedItemData = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
			var SalesOffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
			// var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
			var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			var CurrentDate = new Date();
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("UserStatus", sap.ui.model.FilterOperator.EQ, "E0001"));
			aFilters.push(new sap.ui.model.Filter("fromdate", sap.ui.model.FilterOperator.EQ, CurrentDate));
			if (oSelectedItemData.AppointmentRule === "3") {
				aFilters.push(new sap.ui.model.Filter("SalesOrgSd", sap.ui.model.FilterOperator.EQ, oSelectedItem.SalesOrganization));
			} else {
				// aFilters.push(new sap.ui.model.Filter("s4_sales_grp", sap.ui.model.FilterOperator.EQ, SalesGroup));
				aFilters.push(new sap.ui.model.Filter("SalesOfficeSd", sap.ui.model.FilterOperator.EQ, SalesOffice));
			}
			aFilters.push(new sap.ui.model.Filter("Equipment_disp", sap.ui.model.FilterOperator.EQ, PageData.Equipment));
			this.getView().setBusy(true);
			this.getView().getModel().read("/ZAE_I_Appointment_22", {
				filters: aFilters,
				success: function (oData, response) {
					that.getView().setBusy(false);
					if (oData.results.length > 0) {
						existOpenAppt = true;
						for (var i = 0; i < oData.results.length; i++) {
							ExistingAppointments.push(oData.results[i]);
						}
						that.getView().getModel("mCustIdentification").setProperty("/OpenAppointments", ExistingAppointments);
					}
					oDeffred.resolve(existOpenAppt);
				},
				error: function (oError) {
					that.getView().setBusy(false);
					oDeffred.resolve(true);
				}
			});
			return oDeffred;
		},
		fnExistingAppointments: function (oEvent) {
			if (!this._oExistingAppointmentDialog) {
				Fragment.load({
						id: "fragExistingAppointments",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ExistingAppointments",
						controller: this

					})
					.then(function (oDialogContent) {
						this._createExistingAppointmentDialog(oDialogContent);
						this._oExistingAppointmentDialog.open();
					}.bind(this));
			} else {
				this._oExistingAppointmentDialog.open();
			}

		},
		_createExistingAppointmentDialog: function (oDialogContent) {
			var that = this;
			this._oExistingAppointmentDialog = new sap.m.Dialog({
				title: "{i18n>ExistingAppointments}",
				content: [
					oDialogContent
				],
				buttons: [
					new sap.m.Button({
						text: "{i18n>Close}",
						press: function () {
							this._oExistingAppointmentDialog.close();
						}.bind(this)
					})
				]

			});
			this.getView().addDependent(this._oExistingAppointmentDialog);
		},
		AppointmentSelected: function (oEvent) {
			var oItem = oEvent.getSource();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sPath = oItem.getBindingContextPath();
			var AppointmentData = this.getView().getModel("mCustIdentification").getProperty(sPath);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Appointment",
					action: "aeDisplay&//ZAE_C_Appointment_01(object_type='" + "BUS2000126" + "',Appointment='" +
						AppointmentData
						.Appointment +
						"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
				}
			})) || "";
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);
		},
		onBeforeRebindOpenServiceRequests: function (oEvent) {
			var BindingContext = this.getView().byId("SCIN_BoxSearchResults").getBindingContext();
			var aFilters = [];
			var newFilter;
			var binding = oEvent.getParameter("bindingParams");
			if (BindingContext && binding) {
				binding.preventTableBind = false;
				if (BindingContext) {
					var PageData = BindingContext.getObject();
					if (!PageData) {
						return;
					}
					var Equipment = PageData.Equipment;
					newFilter = new sap.ui.model.Filter("Equipment",
						sap.ui.model.FilterOperator.EQ,
						Equipment);
					aFilters.push(newFilter);
				} else {
					newFilter = new sap.ui.model.Filter("Equipment",
						sap.ui.model.FilterOperator.EQ,
						"");
					aFilters.push(newFilter);
				}
				if (binding) {
					binding.filters = aFilters;
					var oSorter = new sap.ui.model.Sorter("ServiceDocCreationDateTime", "Descending");
					binding.sorter.push(oSorter);
					binding.parameters.select = binding.parameters.select + ",ServiceRequest,ServiceObjectType"
				}
			} else {
				binding.preventTableBind = true;
			}
		},
		onNavBack: function (oEvent) {
			this.byId("OpenServiceRequests").rebindTable();
		},
		fnCreateAppointmentDirect: function () {
			var that = this;
			var CPerson = "";
			var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
			var SalesOffice = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
			var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem()
			var oDateTimePickerStart = Fragment.byId("fragSelectSOSG", "startDate").getDateValue();
			var oDateTimePickerEnd = Fragment.byId("fragSelectSOSG", "endDate").getDateValue();
			var Insurer = this.byId("SCIN_I03").getSelectedKey();
			var oInputTitle = Fragment.byId("fragSelectSOSG", "appTitle").getValue();
			var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			var CategoryTokens = this.byId("SCIN_I02").getTokens();

			var CampaignID;
			if (Fragment.byId("fragSelectSOSG", "CampaignID").getTokens().length > 0) {
				CampaignID = Fragment.byId("fragSelectSOSG", "CampaignID").getTokens()[0].getKey();
			}
			var oCPLContext;
			var oCPLSelectedItem;

			// if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
			// if (this.oContactList) {
			// 	var oCPLContext = this.oContactList.getBindingContext();
			// 	var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
			// 	CPerson = oCPLSelectedItem.ContactPerson;
			// }
			if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
				oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
				oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CPerson = oCPLSelectedItem.ContactPerson;
			} else if (this.oContactList) {
				oCPLContext = this.oContactList.getBindingContext();
				oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CPerson = oCPLSelectedItem.ContactPerson;
			}
			oDateTimePickerStart.setSeconds(oDateTimePickerStart.getSeconds() + 1);
			if (oInputTitle.length > 38) {
				var TrimmedoInputTitle = oInputTitle.substring(0, 38);
				oInputTitle = TrimmedoInputTitle;
			}
			var oInputEmployeeResp = Fragment.byId("fragSelectSOSG", "idEmployee").getValue();
			var oModelData = this.getView().getModel("mCustIdentification").getData();

			var oSalesgroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem() !== null ? Fragment.byId("fragSelectSOSG",
				"IdSalesgroup").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragSelectSOSG", "IdSalesgroup")
				.getSelectedItem().getBindingContext().sPath).CRMSalesGroup : "";

			var oSalesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedItem() !== null ? Fragment.byId(
				"fragSelectSOSG",
				"IdSalesoffice").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragSelectSOSG",
				"IdSalesoffice").getSelectedItem().getBindingContext().sPath).CRMSalesOffice : "";

			var ReasonObj = that.getView().getModel().getProperty(Fragment.byId("fragSelectSOSG", "reasonInput").getSelectedItem().getBindingContext()
				.sPath);

			if (Fragment.byId("fragSelectSOSG", "startDate").getValueState() !== "Error" && Fragment.byId("fragSelectSOSG", "endDate").getValueState() !==
				"Error") {

				var epoch = null;
				epoch = new Date(oDateTimePickerStart);
				epoch.setHours(epoch.getHours());
				var IStartDate = "\/Date(" + epoch.getTime() + ")\/";
				var IStartTime = "PT" +
					("00" + epoch.getHours()).slice(-2) +
					"H" +
					("00" + epoch.getMinutes()).slice(-2) +
					"M" +
					("00" + epoch.getSeconds()).slice(-2) +
					"S";

				epoch = new Date(oDateTimePickerEnd);
				epoch.setHours(epoch.getHours());
				var IEndDate = "\/Date(" + epoch.getTime() + ")\/";
				var IEndTime = "PT" +
					("00" + epoch.getHours()).slice(-2) +
					"H" +
					("00" + epoch.getMinutes()).slice(-2) +
					"M" +
					("00" + epoch.getSeconds()).slice(-2) +
					"S";
				var oEntity = "ZAE_FM_SCIN_CREAAPP_FROM_CI_03Set"; // "ZAE_FM_SCIN_CREAAPP_FROM_CI_02Set"; //"ZAE_FM_SCIN_CREAAPP_FROM_CIAPPSet";
				var oModel = this.getView().getModel("ZAE_FM_SCIN_CREAAPP_FROM_CI_03_SRV");
				var N_CI03 = [{
					"IDescription": oInputTitle,
					"IEquipNo": oModelData.customerInfo.Equipment ? oModelData.customerInfo.Equipment : "",
					"IPartner": oModelData.customerInfo.to_CurrentOwner ? oModelData.customerInfo.to_CurrentOwner.Partner : oModelData.customerInfo
						.CurrentOwner,
					"CPerson": CPerson.CPerson,
					"IEmpResp": oInputEmployeeResp,
					"IStartDate": IStartDate,
					"IStartTime": IStartTime,
					"IEndDate": IEndDate,
					"IEndTime": IEndTime,
					"IPlant": Plant,
					"SalesOrg": oSelectedItem.SalesOrganization,
					"DisChannel": oSelectedItem.DistrChannel,
					"Division": oSelectedItem.Division,
					"SubjectProfile": ReasonObj.SubjectProfile,
					"CatType": ReasonObj.Catlog,
					"CodeGroup": ReasonObj.CodeGroup,
					"Code": ReasonObj.Code,
					"SalesOffice": oSalesoffice,
					"SalesGroup": oSalesgroup,
					"IInsurer": Insurer,
					"CmpgnId": CampaignID,
					"LeadId": this.Lead !== "" ? this.Lead : ""
				}];
				if (this.Lead !== "") {
					N_CI03[0]["LeadId"] = this.Lead;
				}

				var N_CATID = [];
				for (var i = 0; i < CategoryTokens.length; i++) {
					N_CATID.push({
						"CatId": CategoryTokens[i].getProperty("key")
					});
				}

				var data = [{
					callProperty: "N_CI03",
					value: N_CI03
				}, {
					callProperty: "N_CATID",
					value: N_CATID
				}];
				var succFunc = function (oData) {
					var message1 = that.getView().getModel("i18n").getResourceBundle().getText("Created");
					var message2 = that.getView().getModel("i18n").getResourceBundle().getText("Successfully");
					var EActivityNo = "";
					if (oData.N_CI03.results.length > 0 && oData.N_CI03.results[0].EActivityNo) {
						EActivityNo = oData.N_CI03.results[0].EActivityNo;
					} else {
						return;
					}
					var addmsg = new sap.ui.core.message.Message({
						persistent: true,
						code: EActivityNo,
						type: sap.ui.core.MessageType.Success,
						// message: "{i18n>Created} " + oData.EActivityNo + " {i18n>Successfully}",
						message: message1 + EActivityNo + " " + message2,
						additionalText: "",
						description: ""
					});
					sap.ui.getCore().getMessageManager().addMessages(addmsg);
					that.RecentAppointment = EActivityNo;
				};

				var errFunc = function (oData) {
					that.RecentAppointment = undefined;
					// that.fnLoadCalenderData();
				};

				this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
				that._oSelectSOSGDialog.close();

			}

		},
		// fnCreateServiceRequestDirect: function () {
		// 	var that = this;
		// 	var CPerson = "";
		// 	var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
		// 	var SalesOffice = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
		// 	var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem();
		// 	var Insurer = this.byId("SCIN_I03").getSelectedKey();
		// 	var oInputTitle = Fragment.byId("fragSelectSOSG", "appTitle").getValue();
		// 	var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
		// 	var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
		// 	var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
		// 	var CategoryTokens = this.byId("SCIN_I02").getTokens();
		// 	// for (var i = 0; i < CategoryTokens.length; i++) {
		// 	// 	Category.push({
		// 	// 		key: CategoryTokens[i].getProperty("key"),
		// 	// 		text: CategoryTokens[i].getProperty("text")
		// 	// 	});
		// 	// }
		// 	if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
		// 		var oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
		// 		var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
		// 		CPerson = oCPLSelectedItem.ContactPerson;
		// 	}
		// 	if (oInputTitle.length > 38) {
		// 		var TrimmedoInputTitle = oInputTitle.substring(0, 38);
		// 		oInputTitle = TrimmedoInputTitle;
		// 	}
		// 	var oInputEmployeeResp = Fragment.byId("fragSelectSOSG", "idEmployee").getValue();
		// 	var oModelData = this.getView().getModel("mCustIdentification").getData();

		// 	var oSalesgroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem() !== null ? Fragment.byId("fragSelectSOSG",
		// 		"IdSalesgroup").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragSelectSOSG", "IdSalesgroup")
		// 		.getSelectedItem().getBindingContext().sPath).CRMSalesGroup : "";

		// 	var oSalesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedItem() !== null ? Fragment.byId("fragSelectSOSG",
		// 		"IdSalesoffice").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragSelectSOSG",
		// 		"IdSalesoffice").getSelectedItem().getBindingContext().sPath).CRMSalesOffice : "";

		// 	var oEntity = "ZAE_FM_SCIN_CR_SERREQ_CIAP_V1Set"; // "ZAE_FM_SCIN_CR_SERREQ_FROMCIAPSet";
		// 	var oModel = this.getView().getModel("ZAE_FM_SCIN_CR_SERREQ_CIAP_V1_SRV");
		// 	var N_Main = [{
		// 		"ISrDescription": oInputTitle,
		// 		"IEquipNo": oModelData.customerInfo.Equipment ? oModelData.customerInfo.Equipment : "",
		// 		"IPartner": oModelData.customerInfo.CurrentOwner,
		// 		"IContact": CPerson.CPerson,
		// 		"IEmpResp": oInputEmployeeResp,
		// 		"IPlant": Plant,
		// 		"ISalesOrg": oSelectedItem.SalesOrganization,
		// 		"IDisChannel": oSelectedItem.DistrChannel,
		// 		"IDivision": oSelectedItem.Division,
		// 		"SalesOffice": oSalesoffice,
		// 		"SalesGroup": oSalesgroup,
		// 		"IInsurer": Insurer
		// 	}];

		// 	var N_CATID = [];
		// 	for (var i = 0; i < CategoryTokens.length; i++) {
		// 		N_CATID.push({
		// 			"CatId": CategoryTokens[i].getProperty("key")
		// 		});
		// 	}
		// 	var data = [{
		// 		callProperty: "N_Main",
		// 		value: N_Main
		// 	}, {
		// 		callProperty: "N_CatID",
		// 		value: N_CATID
		// 	}];
		// 	var succFunc = function (oData) {
		// 		var message1 = that.getView().getModel("i18n").getResourceBundle().getText("Created");
		// 		var message2 = that.getView().getModel("i18n").getResourceBundle().getText("Successfully");
		// 		var EActivityNo = "";
		// 		if (oData.N_Main.results.length > 0 && oData.N_Main.results[0].EJobNo) {
		// 			EActivityNo = oData.N_Main.results[0].EJobNo;
		// 		} else {
		// 			return;
		// 		}

		// 		var addmsg = new sap.ui.core.message.Message({
		// 			persistent: true,
		// 			code: EActivityNo,
		// 			type: sap.ui.core.MessageType.Success,
		// 			// message: "{i18n>Created} " + oData.EActivityNo + " {i18n>Successfully}",
		// 			message: message1 + EActivityNo + " " + message2,
		// 			additionalText: "",
		// 			description: ""
		// 		});
		// 		sap.ui.getCore().getMessageManager().addMessages(addmsg);
		// 		that.RecentAppointment = EActivityNo;
		// 	};

		// 	var errFunc = function (oData) {
		// 		that.RecentAppointment = undefined;
		// 		// that.fnLoadCalenderData();
		// 	};

		// 	this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
		// 	that._oSelectSOSGDialog.close();

		// },
		_fnCreateAppointmentInitalState: function () {
			var Customer = "";
			var CustomerName = "";
			var CPersonName = "";
			var CPerson = "";
			var concatCustomer = "";
			var concatCPerson = "";
			var oSelectedItemData = "";
			var TimeSlot = 0;
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var Plant = this.getView().byId("SCIN_I01").getSelectedKey();
			var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup");
			if (SalesGroup.getSelectedItem()) {
				oSelectedItemData = SalesGroup.getSelectedItem().getBindingContext().getObject();
			} else {
				var SalesOffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
				var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
				var path = "/ZAE_I_SalesOfficeGroup_01(Plant='" + Plant + "',SalesOffice='" + SalesOffice + "',SalesGroup='" + SalesGroup +
					"')";
				oSelectedItemData = this.getView().getModel().getProperty(path);
			}
			if (oSelectedItemData && oSelectedItemData.CreateAppDirect && this.vButtonID === "B08") {
				oModel.setProperty("/CreateAppointmentDirect", true);
				var aFilters = [];
				var CatlogTokens = this.getView().byId("SCIN_I02").getTokens();
				if (CatlogTokens.length === 0) {
					CatlogTokens = this.oCategory
				}
				var Description = CatlogTokens.length > 0 ? CatlogTokens[0].getText() : "";
				var oCPLSelectedItem;
				var oCPLContext;
				// if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
				if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
					var oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
					var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
					CPerson = oCPLSelectedItem.ContactPerson;
					CPersonName = oCPLSelectedItem.ContactPersonName;
				} else if (this.oContactList) {
					oCPLContext = this.oContactList.getBindingContext();
					oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
					CPerson = oCPLSelectedItem.ContactPerson;
					CPersonName = oCPLSelectedItem.ContactPersonName;
				} else {
					CPerson = "";
					CPersonName = "";
				}
				if (oModelData.customerInfo.to_CurrentOwner && oModelData.customerInfo.to_CurrentOwner.Partner) {
					Customer = oModelData.customerInfo.to_CurrentOwner.Partner;
					CustomerName = oModelData.customerInfo.to_CurrentOwner.CustomerName;
				} else if (oModelData.customerInfo.CurrentOwner) {
					Customer = oModelData.customerInfo.CurrentOwner;
					CustomerName = oModelData.customerInfo.CustomerName;
				} else {
					Customer = "";
					CustomerName = "";
				}
				if (CustomerName) {
					concatCustomer = CustomerName + " (" + Customer + ")";
				} else {
					concatCustomer = Customer;
				}

				if (CPersonName) {
					concatCPerson = CPersonName + " (" + CPerson + ")";
				} else {
					concatCPerson = CPerson;
				}
				if (oSelectedItemData.TimeSlot) {
					TimeSlot = parseInt(oSelectedItemData.TimeSlot);
				}
				var aFilters = [];
				aFilters.push(new Filter("TransactionType", "EQ", oModelData.SchemaTransactionType.TransactionType));
				Fragment.byId("fragSelectSOSG", "reasonInput").getBinding("items").filter(aFilters);
				Fragment.byId("fragSelectSOSG", "Customer").setValue(concatCustomer);
				Fragment.byId("fragSelectSOSG", "CPerson").setValue(concatCPerson);
				Fragment.byId("fragSelectSOSG", "idEmployee").setValue(oSelectedItemData.AppointmentPersonResp);
				Fragment.byId("fragSelectSOSG", "appTitle").setValue(Description);
				// Fragment.byId("fragSelectSOSG", "CampaignID").setTokens([]);
				var currentDate = new Date();
				Fragment.byId("fragSelectSOSG", "startDate").setDateValue(new Date());
				//	Fragment.byId("fragSelectSOSG", "startDate").setMinDate(new Date());
				Fragment.byId("fragSelectSOSG", "startDate").setDisplayFormat("short");
				currentDate.setMinutes(currentDate.getMinutes() + TimeSlot);
				Fragment.byId("fragSelectSOSG", "endDate").setDateValue(currentDate);
				Fragment.byId("fragSelectSOSG", "endDate").setMinDate(new Date());
				Fragment.byId("fragSelectSOSG", "endDate").setValueState("None");
				Fragment.byId("fragSelectSOSG", "startDate").setValueState("None");
			} else {
				oModel.setProperty("/CreateAppointmentDirect", false);
			}
			this.fnCheckSubmitButtonEnableState();
		},
		fnCheckSubmitButtonEnableState: function () {
			var boolSubmitButton = false;
			var VerifyBpCheckBox;
			var oInputTitle = Fragment.byId("fragSelectSOSG", "appTitle").getValue();
			var Salesoffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedItem();
			var Salesgroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem();
			var oStartDate = Fragment.byId("fragSelectSOSG", "startDate");
			var oEndDate = Fragment.byId("fragSelectSOSG", "endDate");
			var oEmpResp = Fragment.byId("fragSelectSOSG", "idEmployee").getValue();
			if (Salesgroup.getBindingContext().getObject().VerifyBPData) {
				VerifyBpCheckBox = Fragment.byId("fragSelectSOSG", "idVerifyBpData").getSelected();
				boolSubmitButton = Salesoffice !== null && Salesgroup !== null && VerifyBpCheckBox;
			} else {
				boolSubmitButton = Salesoffice !== null && Salesgroup !== null;
			}

			if (Salesgroup) {
				var oSelectedObject = Salesgroup.getBindingContext().getObject();
				if (oSelectedObject.CreateAppDirect && this.vButtonID === "B08") {
					boolSubmitButton = oInputTitle !== "" &&
						oEmpResp !== "" && oStartDate.getValueState() !== "Error" && oStartDate.getDateValue() !== "" &&
						oEndDate.getDateValue() !== "" && oEndDate.getValueState() !== "Error" && Salesgroup !== null && Salesoffice !== null;
				}

			}
			Fragment.byId("fragSelectSOSG", "BUTTONSubmit").setEnabled(boolSubmitButton);
		},
		fnWorkshopLoadbyWorkCenter: function (oEvent) {
			var that = this;
			if (!this._oWorkShopLoadbyWorkCenter) {
				Fragment.load({
						id: "fragWorkshopLoad",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.WorkShopLoadbyWorkCenter",
						controller: {
							// onSubmitPressed: function (oEvent) {
							// 	Fragment.byId("fragWorkshopLoad", "idDate").getDateValue().setHours(6);
							// 	//	var oDate = Fragment.byId("fragWorkshopLoad", "idDate").getDateValue().toISOString().slice(0, 10);
							// 	var oDatePicker = Fragment.byId("fragWorkshopLoad", "idDate");

							// 	var oSelectedDate = oDatePicker.getDateValue();

							// 	if (oSelectedDate) {
							// 		var oStartDate = new Date(oSelectedDate);
							// 		oStartDate.setDate(oSelectedDate.getDate() - oSelectedDate.getDay());

							// 		var oEndDate = new Date(oStartDate);
							// 		oEndDate.setDate(oStartDate.getDate() + 6);

							// 		var oDate = {
							// 			"startDate": oStartDate.toISOString().split('T')[0],
							// 			"endDate": oEndDate.toISOString().split('T')[0]
							// 		};

							// 		var oAppState = sap.ushell.Container
							// 			.getService("CrossApplicationNavigation")
							// 			.createEmptyAppState(this);
							// 		oAppState.setData(oDate); // object of values needed to be restored
							// 		oAppState.save();

							// 		var filter = [];

							// 		filter.push({
							// 			path: "CalendarDate",
							// 			operator: "LE",
							// 			value1: oStartDate,
							// 			value2: undefined,
							// 			sign: "I"
							// 		});

							// 		filter.push({
							// 			path: "CalendarDate",
							// 			operator: "GE",
							// 			value1: oEndDate,
							// 			value2: undefined,
							// 			sign: "I"
							// 		});

							// 		filter.push({
							// 			path: "CalendarDate",
							// 			operator: "BT",
							// 			value1: oStartDate,
							// 			value2: oEndDate,
							// 			sign: "I"
							// 		});

							// 		var plant = that.getView().byId("SCIN_I01").getSelectedKey();
							// 		var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
							// 		var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
							// 			target: {
							// 				semanticObject: "WorkCenter",
							// 				action: "aeAnalyze"
							// 			},
							// 			params: {
							// 				"CalendarDate": filter,
							// 				"Plant": plant,
							// 				"appStateKey": oAppState.getKey()

							// 			}
							// 		})) || "";
							// 		var url = window.location.href.split('#')[0] + hash;
							// 		sap.m.URLHelper.redirect(url, true);
							// 		// oCrossAppNavigator.toExternal({
							// 		// 	target: {
							// 		// 		shellHash: hash
							// 		// 	}
							// 		// });
							// 	}
							// },
							onSubmitPressed: function (oEvent) {

								Fragment.byId("fragWorkshopLoad", "idDate").getDateValue().setHours(6);
								//	var oDate = Fragment.byId("fragWorkshopLoad", "idDate").getDateValue().toISOString().slice(0, 10);
								var oDatePicker = Fragment.byId("fragWorkshopLoad", "idDate");

								var oSelectedDate = oDatePicker.getDateValue();
								if (oSelectedDate) {
									var oStartDate = new Date(oSelectedDate);
									oStartDate.setDate(oSelectedDate.getDate() - oSelectedDate.getDay());

									var oEndDate = new Date(oStartDate);
									oEndDate.setDate(oStartDate.getDate() + 6);

									var CalendarDate = {
										"startDate": oStartDate.toISOString().split('T')[0],
										"endDate": oEndDate.toISOString().split('T')[0]
									};

									var filter = [];
									var plant = that.getView().byId("SCIN_I01").getSelectedKey();
									// "CalendarDate": JSON.stringify(filter)

									var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
									var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
										target: {
											semanticObject: "WorkCenter",
											action: "aeAnalyze"
										},
										params: {
											"plant": plant,
											"fromDate": oStartDate,
											"toDate": oEndDate
										}
									})) || "";

									var url = window.location.href.split('#')[0] + hash;
									sap.m.URLHelper.redirect(url, true);
								}
							},
							onCancelPressed: function (oEvent) {
								oEvent.getSource().getParent().close();
							},
							handleDateChange: function (oEvent) {
								var oSource = oEvent.getSource();
								var bEnabled = oEvent.getSource().getDateValue() !== null;
								that._oWorkShopLoadbyWorkCenter.getBeginButton().setEnabled(bEnabled);
							}
						},
					})
					.then(function (oDialogContent) {
						this._oWorkShopLoadbyWorkCenter = oDialogContent;
						this.getView().addDependent(this._oWorkShopLoadbyWorkCenter);
						this._setWorkshopRoasterDialogInitialState();
					}.bind(this));
			} else {
				this._setWorkshopRoasterDialogInitialState();
			}
		},
		_setWorkshopRoasterDialogInitialState: function () {
			Fragment.byId("fragWorkshopLoad", "idDate").setDateValue(new Date());
			this._oWorkShopLoadbyWorkCenter.open();
		},

		fnBuildAppState: function (oEvent) {

			var Equipment = "",
				EquipmentWithDesc = "";
			var oTokens = this.byId("EquipmentVH").getTokens();
			if (oTokens.length > 0) {
				Equipment = oTokens[0].getProperty("key");
				EquipmentWithDesc = oTokens[0].getProperty("text");
			}
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			var appState = {
				Plant: this.byId("SCIN_I01").getSelectedKey(),
				Equipment: Equipment,
				EquipmentWithDesc: EquipmentWithDesc
			};

			oAppState.setData(appState);
			oAppState.save();
			var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			var sOldHash = oHashChanger.getHash();

			var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			oHashChanger.replaceHash(sNewHash);
			// // var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			// // 	target: {
			// // 		semanticObject: "Equipment",
			// // 		action: e.getParameter("href").split("?")[0].split("-")[1]
			// // 	}
			// // })) || "";
			// var url = window.location.href.split('#')[0];
			// sap.m.URLHelper.redirect(url, true);
		},

		fnUpdatePersonalData: function () {
			var MobileNo = Fragment.byId("fragUpdatePersonalData", "IDMobile").getValueState();
			if (MobileNo !== "Error") {
				Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip").setVisible(false);

			}
		},

		onPressUpdatepersonaldata: function (oEvent) {
			if (oEvent) {
				this.vButtonID = "";
			}
			if (!this._UpdatePersonalDialog) {
				Fragment.load({
						id: "fragUpdatePersonalData",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.UpdatePersonalData",
						controller: this
					})
					.then(function (oDialogContent) {
						this._UpdatePersonalDataDialog(oDialogContent);
						this._setUpdatePersonalDialogInitialState();
					}.bind(this));
			} else {
				this._setUpdatePersonalDialogInitialState();
			}
		},
		_setUpdatePersonalDialogInitialState: function () {
			if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem() === null) {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("SelectCP");
				sap.m.MessageBox.error(msg);
			}
			this.oContactList = this.byId("SmartTableContactPersonList").getTable().getSelectedItem();
			if (this.getView().byId("SCIN_I02").getTokens().length > 0) {
				this.oCategory = this.getView().byId("SCIN_I02").getTokens();
			}
			var oModel = this.getView().getModel("mCustIdentification");
			var oModelData = oModel.getData();
			var MobileNo = Fragment.byId("fragUpdatePersonalData", "IDMobile");
			var oFaxNumber = Fragment.byId("fragUpdatePersonalData", "IDFaxNumber");
			oFaxNumber.setValue("");
			MobileNo.setValue("");
			var oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
			var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
			var oCountry = oCPLSelectedItem.Country
			var oCountry_code = this.getView().getModel("CountryCodes").getData().find(function (obj) {
				return obj.code === oCountry;
			});
			var CountryDialCode = oCountry_code.dial_code;
			// var CountryDialCode = "+" + "971";
			if (oCountry === "OM") {
				var MaxLengthMobile = CountryDialCode.length + 7;
				var MobileMask = this.fnCreateMask(CountryDialCode, MaxLengthMobile);
			} else if (oCountry === "AE") {
				var MaxLengthMobile = CountryDialCode.length + 8;
				var MobileMask = this.fnCreateMask(CountryDialCode, MaxLengthMobile);
			} else {
				var MaxLengthMobile = CountryDialCode.length + 10;
				var MobileMask = this.fnCreateMask(CountryDialCode, MaxLengthMobile);
			}
			var CPersonName;
			if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
				var oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
				var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
				CPersonName = this.formatNameAndValuePair(oCPLSelectedItem.ContactPersonName, oCPLSelectedItem.ContactPerson);
			} else {
				CPersonName = "";
			}

			if (oCPLSelectedItem.MobileNumber !== "") {
				MobileNo.setValue(CountryDialCode + " " + oCPLSelectedItem.MobileNumber);
			}
			if (oCPLSelectedItem.FaxNumber !== "") {
				oFaxNumber.setValue(CountryDialCode + " " + oCPLSelectedItem.FaxNumber);
			}
			MobileNo.setMask(MobileMask);
			oFaxNumber.setMask(MobileMask);
			Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip").setVisible(false);
			MobileNo.setValueState("None");
			oFaxNumber.setValueState("None");
			Fragment.byId("fragUpdatePersonalData", "IDContactPerson").setValue(CPersonName);
			Fragment.byId("fragUpdatePersonalData", "IDEMAIL").setValue(oCPLSelectedItem.EmailAddress);
			if (oModelData.customerInfo.BPDetailsMandatory) {
				Fragment.byId("fragUpdatePersonalData", "IDMobileReq").setRequired(true);
				Fragment.byId("fragUpdatePersonalData", "IDEMAILReq").setRequired(true);
				Fragment.byId("fragUpdatePersonalData", "IDMobileReq2").setRequired(true);
			}

			this._UpdatePersonalDialog.open();
		},

		_UpdatePersonalDataDialog: function (oDialogContent) {

			var Mobile;
			var EMAIL;
			var CPerson;
			var FaxNumber;
			var that = this;

			this._UpdatePersonalDialog = new sap.m.Dialog({
				title: "Update Personal Data",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "{i18n>Submit}",
					// enabled: "{mCustIdentification>/uiOnly/enable/ContactPersonCreateButton}",
					press: function () {
						that._UpdatePersonalDialog.setBusy(true);
						if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
							var oCPLContext = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
							var oCPLSelectedItem = oCPLContext.getModel().getProperty(oCPLContext.getPath());
							CPerson = oCPLSelectedItem.ContactPerson;
						}
						var oModel = this.getView().getModel("mCustIdentification");
						var oModelData = oModel.getData();

						var MobileNo = Fragment.byId("fragUpdatePersonalData", "IDMobile");
						EMAIL = Fragment.byId("fragUpdatePersonalData", "IDEMAIL");
						FaxNumber = Fragment.byId("fragUpdatePersonalData", "IDFaxNumber");
						if (MobileNo.getValueState() === "Error") {
							that._UpdatePersonalDialog.setBusy(false);
							var msg2 = "Enter Mobile Number Correctly";
							var oMessageStrip = Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						} else if (MobileNo.getValue() === "") {
							that._UpdatePersonalDialog.setBusy(false);
							var msg3 = "Enter Mobile Number";
							var oMessageStrip = Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg3);
							return;
						}

						if (oModelData.customerInfo.BPDetailsMandatory && EMAIL.getValue() === "") {
							that._UpdatePersonalDialog.setBusy(false);
							var oMessageStrip = Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText("Enter Email ID");
							return;
						} else if (oModelData.customerInfo.BPDetailsMandatory && EMAIL.getValueState() === "Error") {
							that._UpdatePersonalDialog.setBusy(false);
							var msg4 = "Enter Email ID Correctly";
							var oMessageStrip = Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg4);
							return;
						}

						if (oModelData.customerInfo.BPDetailsMandatory && FaxNumber.getValueState() === "Error") {
							that._UpdatePersonalDialog.setBusy(false);
							var msg2 = "Enter  Mobile No.2 Correctly";
							var oMessageStrip = Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						} else if (oModelData.customerInfo.BPDetailsMandatory && FaxNumber.getValue() === "") {
							that._UpdatePersonalDialog.setBusy(false);
							var oMessageText = "Enter Mobile No.2";
							var oMessageStrip = Fragment.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(oMessageText);
							return;
						}

						Mobile = Fragment.byId("fragUpdatePersonalData", "IDMobile").getValue().split(" ")[1];
						EMAIL = Fragment.byId("fragUpdatePersonalData", "IDEMAIL").getValue();
						FaxNumber = Fragment.byId("fragUpdatePersonalData", "IDFaxNumber").getValue().split(" ")[1];

						var oEntity = "ZAE_FM_SCIN_UPDATE_BPSet";
						var oModel = that.getView().getModel();
						var oModelData = that.getView().getModel("mCustIdentification").getData();
						var MainContact = oModelData.customerInfo.to_CurrentOwner.Partner;
						var data = [{
							callProperty: "BpNumber",
							value: CPerson
						}, {
							callProperty: "EmailId",
							value: EMAIL
						}, {
							callProperty: "MobileNumber",
							value: Mobile
						}, {
							callProperty: "FaxNumber",
							value: FaxNumber
						}];

						var succFunc = function (oData) {
							//	that.onSearch();
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().byId("SmartTableContactPersonList").getTable().getBinding("items").refresh();
							that._UpdatePersonalDialog.setBusy(false);
							that._UpdatePersonalDialog.close();
							if (that.vButtonID === "B08" || that.vButtonID === "B09") {
								that.fnCreateAptSrq();
							}
						};

						var errFunc = function (oData) {
							//	that.onSearch();
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.getView().byId("SmartTableContactPersonList").getTable().getBinding("items").refresh();
							that._UpdatePersonalDialog.setBusy(false);
							that._UpdatePersonalDialog.close();
						};
						that.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._UpdatePersonalDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._UpdatePersonalDialog);
		},
		handleInsuranceDialogValueHelp: function (that, input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter,
			vhInfo) {
			var self = this;
			var inputId = input.getId();
			if (!self._valueHelpDialogs[inputId]) {
				Fragment.load({
						id: inputId + "DialogVHFragment",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.InsuranceVH",
						controller: {
							_handleValueHelpClose: function (oEvent) {
								var oSelectedItem = oEvent.getParameter("selectedItem");
								if (oSelectedItem) {
									var oBinding = oSelectedItem.getBindingContext().getObject();
									input.setSelectedKey(oBinding.InsurancePartner);
									input.setValue(oSelectedItem.getTitle());
								}
								oEvent.getSource().getBinding("items").filter([]);
							},
							_handleValueHelpSearch: function (oEvent) {
								var sValue = oEvent.getParameter("value");
								self._setValueHelpDialogFilter(inputId, vhSearchKey, vhSearchText, vhEntitySetFilter, sValue, vhInfo);
							}
						}
					})
					.then(function (oValueHelpDialogContent) {
						self._valueHelpDialogs[inputId] = oValueHelpDialogContent;
						that.getView().addDependent(self._valueHelpDialogs[inputId]);
						self._initValueHelpDialog(input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter, vhInfo);
					});
			} else {
				self._initValueHelpDialog(input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter, vhInfo);
			}
		},

		_initValueHelpDialog: function (input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter, vhInfo) {
			var inputId = input.getId();
			this._valueHelpDialogs[inputId].setTitle(inputLabel);
			var inputValue = input.getValue();
			if (vhEntitySet) {
				var vhObjItems = {
					path: "/" + vhEntitySet,
					template: new sap.m.StandardListItem({
						// title: "{" + vhSearchText + "}",
						title: {
							parts: [{
								path: vhSearchText
							}, {
								path: vhSearchKey
							}],
							formatter: this.formatNameAndValuePair
						},
						// description: "{InsuranceNumber} • {StartDate} • {EndDate}",
						description: {
							parts: [{
								path: "InsuranceNumber"
							}, {
								path: "StartDate"
							}, {
								path: "EndDate"
							}, {
								path: "InsuranceTypeText"
							}, {
								path: "InsuranceType"
							}],
							formatter: this.formatDescription
						}
					})
				};
				this._valueHelpDialogs[inputId].bindAggregation("items", vhObjItems);
			}
			this._setValueHelpDialogFilter(inputId, vhSearchKey, vhSearchText, vhEntitySetFilter, inputValue, vhInfo);
			this._valueHelpDialogs[inputId].open(inputValue);
		},
		_setValueHelpDialogFilter: function (inputId, vhSearchKey, vhSearchText, vhEntitySetFilter, sValue, vhInfo) {
			var inputFilter = new sap.ui.model.Filter({
				filters: this.aeUtil.genFilterArr([{
					path: vhSearchKey,
					operator: sap.ui.model.FilterOperator.Contains,
					value1: sValue
				}, {
					path: vhSearchText,
					operator: sap.ui.model.FilterOperator.Contains,
					value1: sValue
				}, {
					path: vhInfo,
					operator: sap.ui.model.FilterOperator.Contains,
					value1: sValue
				}])
			});
			var oFilter = inputFilter;
			if (vhEntitySetFilter && vhEntitySetFilter.value1) {
				oFilter = new sap.ui.model.Filter({
					filters: [
						inputFilter,
						this.genFilterArr([{
							path: vhEntitySetFilter.path,
							operator: vhEntitySetFilter.operator,
							value1: vhEntitySetFilter.value1
						}])[0]
					],
					and: true
				});
			}
			this._valueHelpDialogs[inputId].getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);

		},
		formatDescription: function (sInsurance, sStartDate, sEndDate, sInsuranceTypText, sInsuranceType) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd-MM-yyyy"
			});
			var oValue = this.getParent().getParent().getParent().getParent().getController().formatNameAndValuePair(sInsuranceTypText,
				sInsuranceType);
			if (sInsurance) {
				oValue += " • " + sInsurance;
			}
			if (sStartDate) {
				oValue += " • " + dateFormat.format(sStartDate);
			}
			if (sEndDate) {
				oValue += " • " + dateFormat.format(sEndDate);
			}
			return oValue;
		},

		onPressAssignContactPerson: function (oEvent) {
			var that = this;
			if (!this._oNewAssignContactPersonDialog) {
				Fragment.load({
						id: "fragAssignContactPerson",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.AssignContactPerson",
						controller: this
					})
					.then(function (oDialogContent) {
						this._AssignContactPersonDialog(oDialogContent);

						this._setAssignContactPersonDialogInitialState();
					}.bind(this));
			} else {
				this._setAssignContactPersonDialogInitialState();
			}
		},

		_AssignContactPersonDialog: function (oDialogContent) {

			var Customer;

			var that = this;
			this._oNewAssignContactPersonDialog = new sap.m.Dialog({
				title: "{i18n>AssignContactPerson}",
				width: "15rem",
				content: [
					oDialogContent
				],

				beginButton: new sap.m.Button({
					text: "{i18n>Assign}",
					press: function () {
						that._oNewAssignContactPersonDialog.setBusy(true);
						// var selectedData = this.extensionAPI.getSelectedContexts()[0].getObject();
						var Partner = this.getView().byId("IdCustomer").getText();
						Customer = Fragment.byId("fragAssignContactPerson", "CUSTOMER").getTokens()[0];
						if (Customer === undefined) {
							that.fnCheckAssignContactPersonRequiredValidation();
							var msg = this.getView().getModel("i18n").getResourceBundle().getText("Please Select Contact Person");
							sap.m.MessageBox.error(msg);
							return {
								pass: false
							};

						} else {
							Customer = Customer.getProperty("key");
						}

						var oEntity = "ZAE_FM_ASSIGN_CONTACT_PERSONSet";
						var oModel = that.getView().getModel();
						var data = [{
							callProperty: "Partner",
							value: Partner
						}, {
							callProperty: "ContactP",
							value: Customer
						}];

						var succFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.byId("SmartTableContactPersonList").rebindTable();
							that._oNewAssignContactPersonDialog.setBusy(false);
						};

						var errFunc = function (oData) {
							that.getView().byId("SCIN_I02").fireTokenUpdate();
							that.byId("SmartTableContactPersonList").rebindTable();
							that._oNewAssignContactPersonDialog.setBusy(false);
						};
						// var actId = "SCIN_B26";
						// var actLabel = "Assign Contact Person";
						this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
						this._oNewAssignContactPersonDialog.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewAssignContactPersonDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oNewAssignContactPersonDialog);

		},

		_fnAssignContactPersonCreateButtonEnabledState: function () {
			var CUSTOMER = Fragment.byId("fragAssignContactPerson", "CUSTOMER");
			var bEnabled = CUSTOMER.getTokens().length > 0;
			this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(bEnabled);
		},
		fnCheckAssignContactPersonRequiredValidation: function () {
			this._fnAssignContactPersonCreateButtonEnabledState();
		},

		_setAssignContactPersonDialogInitialState: function () {
			var that = this;
			// var numbSel = this.extensionAPI.getSelectedContexts().length;

			// if (numbSel > 1) {

			// 	var msg = this.getView().getModel("i18n").getResourceBundle().getText("Multi Selection is not Allowed");
			// 	sap.m.MessageBox.error(msg);
			// 	return;

			// } else {

			// }
			Fragment.byId("fragAssignContactPerson", "CUSTOMER").setTokens([]);
			this._oNewAssignContactPersonDialog.open();
			this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(false);

		},
		onAssignContactPersonVH: function (oEvent1) {
			var that = this;
			var input = oEvent1.getSource();
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_VH_BUSINESSPARTNER_05",
				initiallyVisibleFields: "BusinessPartner,BusinessPartnerName,E_PhoneNo1,F_PhoneNo2,G_EmailAddress,H_CPRNumber,M_FirstName,N_LastName,SalesOrganization,DistributionChannel",
				selectionMode: "Single",

				tokenObject: {
					key: "BusinessPartner",
					Description: "BusinessPartnerName"
				},
				controlConfiguration: [{
					index: 0,
					key: "BusinessPartner",
					filterType: "auto",
					label: "Business Partner",
					mandatory: "auto",
					visible: true
				}],
				onBeforeRebindSmartTable: function (oEvent) {}
			};
			that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
		},
		onAssignContactPersonTokenUpdate: function (oEvent) {
			Fragment.byId("fragAssignContactPerson", "CUSTOMER").setValueState("None");
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 0 || oEvent.getParameter("type") === "removed") {
				oEvent.getSource().setSelectedKey("");
				oEvent.getSource().setTokens([]);
				this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(false);
			} else {
				this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(true);
			}
		},
		onSelectAssignContactPerson: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = that.formatNameAndValuePair(oSelectedData.BusinessPartnerName, oSelectedData.BusinessPartner);
				var oToken = new sap.m.Token({
					key: oSelectedData.BusinessPartner,
					text: oText
				});
			}
			this.fnCheckAssignContactPersonRequiredValidation();
		},
		handleAssignContactPersonSuggest: function (oEvent) {
			var pageData = that.getView().getBindingContext().getObject();
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "BusinessPartner",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						}),
						new Filter({
							path: "BusinessPartnerName",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						}), new Filter({
							path: "E_PhoneNo1",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						})

					],
					and: false
				}));
			}
			oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		date_diff_indays: function (date1, date2) {
			let difference = date1.getTime() - date2.getTime();
			let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
			return TotalDays;
		},
		fnShowNationalityValueHelp: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			if (that._NationalityValueHelpDialog) {
				that._NationalityValueHelpDialog.destroy();
			}
			Fragment.load({
					id: "NationalityValueHelpDialogFragment",
					name: "com.globalintelli.ZAE_SCIN_NEW.fragment.Nationality",
					controller: {
						_handleValueHelpCloseNationality: function (oEvt1) {
							var oSelectedItem = oEvt1.getParameter("selectedItem");
							if (oSelectedItem) {
								var oSelectedItemData = oSelectedItem.getBindingContext().getObject();
								var input = Fragment.byId(CallerId, "NATIONALITY");
								input.setValueState("None");
								input.setValue("");
								input.setTokens([]);
								var oText = oSelectedItem.getTitle() + " ( " + oSelectedItem.getDescription() + " )";
								input.addToken(new Token({
									key: oSelectedItem.getTitle(),
									text: oText
								}));
								oEvt1.getSource().getBinding("items").filter([]);
								switch (CallerId) {
								case "fragCreateCustomer":
									that.fnCheckCreateCustomerRequiredValidation();
									break;
								case "fragCreateProspect":
									that.fnCheckCreateProspectRequiredValidation();
									break;
								}
							}
						},
						_handleValueHelpSearch: function (oEvt2) {
							var sValue = oEvt2.getParameter("value");
							that._NationalityValueHelpDialog.getBinding("items").filter([]);
							var inputFilter = new sap.ui.model.Filter({
								filters: that.genFilterArr([{
									path: "Country",
									operator: sap.ui.model.FilterOperator.Contains,
									value1: sValue
								}, {
									path: "CountryName",
									operator: sap.ui.model.FilterOperator.Contains,
									value1: sValue
								}])
							});
							that._NationalityValueHelpDialog.getBinding("items").filter(inputFilter, sap.ui.model.FilterType.Application);
							var oItems = that._NationalityValueHelpDialog.getBinding("items");
							if (!oItems.sFilterParams.includes("%27")) {
								for (var i = 0; i <= inputFilter.aFilters.length - 1; i++) {
									inputFilter.aFilters[i].oValue1 = "'" + inputFilter.aFilters[i].oValue1 + "'";
								}
								oItems.filter(inputFilter);
							} else {
								oItems.filter(inputFilter);
							}
						}
					}
				})
				.then(function (oValueHelpDialogContent) {
					that._NationalityValueHelpDialog = oValueHelpDialogContent;
					oValueHelpDialogContent.open();
					oValueHelpDialogContent.setModel(that.getView().getModel());
				}, this);
		},
		handleNationalitySuggest: function (oEvent) {
			var that = this;
			var sValue = oEvent.getParameter("suggestValue");
			if (sValue) {
				var inputFilter = new sap.ui.model.Filter({
					filters: that.genFilterArr([{
						path: "Country",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}, {
						path: "CountryName",
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}])
				});
			}
			var bAnd = true;
			var filter = new sap.ui.model.Filter(inputFilter, bAnd);
			oEvent.getSource().getBinding("suggestionRows").filter(filter);
			var NationalitySuggestions = oEvent.getSource().getBinding("suggestionRows");
			if (!NationalitySuggestions.sFilterParams.includes("%27")) {
				for (var i = 0; i <= filter.aFilters.length - 1; i++) {
					filter.aFilters[i].oValue1 = "'" + filter.aFilters[i].oValue1 + "'";
				}
				NationalitySuggestions.filter(filter);
			} else {
				NationalitySuggestions.filter(filter);
			}
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		onNationalityTokenUpdate: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			Fragment.byId(CallerId, "NATIONALITY").setValueState("None");
			var aTokens = oEvent.getSource().getTokens();
			switch (CallerId) {
			case "fragCreateCustomer":
				that.fnCheckCreateCustomerRequiredValidation();
				break;
			case "fragCreateProspect":
				that.fnCheckCreateProspectRequiredValidation();
				break;
			}
		},
		onSelectNationality: function (oEvent) {
			var that = this;
			var CallerId = oEvent.getSource().getId().split("--")[0];
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				Fragment.byId(CallerId, "NATIONALITY").setValueState("None");
				var oSelectedItem = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedItem.Country, oSelectedItem.CountryName);
				var oToken = new sap.m.Token({
					key: oSelectedItem.Country,
					text: oText
				});
				oSource.setTokens([oToken]);
				var CountryCode = "+" + oSelectedItem.CountryCode;
				switch (CallerId) {
				case "fragCreateCustomer":
					that.fnCheckCreateCustomerRequiredValidation();
					break;
				case "fragCreateProspect":
					that.fnCheckCreateProspectRequiredValidation();
					break;
				}
			}
		},
		onEmpRespValueHelpRequested: function (oEvent1) {
			var that = this;
			var input = oEvent1.getSource();
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_VH_BusinessPartner_06",
				initiallyVisibleFields: "Partner,PartnerName",
				selectionMode: "Single",
				tokenObject: {
					key: "Partner",
					Description: "PartnerName"
				},
				controlConfiguration: [{
					index: 0,
					key: "Partner",
					filterType: "auto",
					label: "{/#ZAE_VH_BusinessPartner_06/Partner/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 1,
					key: "PartnerName",
					filterType: "auto",
					label: "{/#ZAE_VH_BusinessPartner_06/PartnerName/@sap:label}",
					mandatory: "auto",
					visible: true
				}],
				defaultFilter: {},
				onBeforeRebindSmartTable: function (oEvent) {
					var aFilterArray = oEvent.getParameter("bindingParams").filters;
					oEvent.getParameter("bindingParams").filters = aFilterArray;
				}
			};
			that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
		},
		onEmpRespTokenUpdate: function (oEvent) {
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
				oEvent.getSource().setTokens([])
			}
			this.fnBeginButtonValidation();
		},
		onSelectEmpResp: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedData.PartnerName, oSelectedData.Partner);
				var oToken = new sap.m.Token({
					key: oSelectedData.Partner,
					text: oText
				});
				oSource.setTokens([oToken]);
				oSource.fireTokenUpdate();
			}
		},
		handleEmpRespSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "Partner",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						}),
						new Filter({
							path: "PartnerName",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						})
					],
					and: false
				}));
			}
			oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		onServManagerValueHelpRequested: function (oEvent1) {
			var that = this;
			var input = oEvent1.getSource();
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_VH_BusinessPartner_06",
				initiallyVisibleFields: "Partner,PartnerName",
				selectionMode: "Single",
				tokenObject: {
					key: "Partner",
					Description: "PartnerName"
				},
				controlConfiguration: [{
					index: 0,
					key: "Partner",
					filterType: "auto",
					label: "{/#ZAE_VH_BusinessPartner_06/Partner/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 1,
					key: "PartnerName",
					filterType: "auto",
					label: "{/#ZAE_VH_BusinessPartner_06/PartnerName/@sap:label}",
					mandatory: "auto",
					visible: true
				}],
				defaultFilter: {},
				onBeforeRebindSmartTable: function (oEvent) {
					var aFilterArray = oEvent.getParameter("bindingParams").filters;
					oEvent.getParameter("bindingParams").filters = aFilterArray;
				}
			};
			that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
		},
		onServManagerTokenUpdate: function (oEvent) {
			var aTokens = oEvent.getSource().getTokens();
			if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
				oEvent.getSource().setTokens([])
			}
			this.fnBeginButtonValidation();
		},
		onSelectServManager: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedData.PartnerName, oSelectedData.Partner);
				var oToken = new sap.m.Token({
					key: oSelectedData.Partner,
					text: oText
				});
				oSource.setTokens([oToken]);
				oSource.fireTokenUpdate();
			}
		},
		handleServManagerSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "Partner",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						}),
						new Filter({
							path: "PartnerName",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sTerm
						})
					],
					and: false
				}));
			}
			oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		onInsurancePartnerLinkPress: function (oEvent) {
			var that = this;
			var MoreInfo = {};
			var localModel = that.getView().getModel("mCustIdentification");
			var localModelData = localModel.getData();
			if (that.byId("SmartTableSalesArea").getTable().getSelectedItem()) {
				var oSalesAreaData = that.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject();
				var oSource = oEvent.getSource();
				var InsurancePartner = oEvent.getSource().getText();
				var aFilters = [];
				aFilters.push(new Filter("Equipment", "EQ", localModelData.Equipment));
				aFilters.push(new Filter("InsurancePartner", "EQ", InsurancePartner));
				aFilters.push(new Filter("SalesOrganization", "EQ", oSalesAreaData.SalesOrganization));
				aFilters.push(new Filter("DistrChannel", "EQ", oSalesAreaData.DistrChannel));
				aFilters.push(new Filter("Division", "EQ", oSalesAreaData.Division));
				oSource.setBusy(true);
				that.getView().getModel().read("/ZAE_C_T_EQUS_INS_01", {
					filters: aFilters,
					success: function (oData) {
						oSource.setBusy(false);
						if (oData.results.length > 0) {
							MoreInfo = oData.results[0];
							localModel.setProperty("/InsuranceDetails/MoreInfo", MoreInfo);
							that._openInsurancePopup(oSource, that);
						} else {
							sap.m.MessageToast.show("No data found..!");
						}
					},
					error: function (oError) {
						oSource.setBusy(false);
					}
				});
			}
		},
		_openInsurancePopup: function (oSource, that) {
			var oButton = oSource,
				oView = this.getView();
			if (!this._oInsurancePopover) {
				this._oInsurancePopover = sap.ui.xmlfragment("com.globalintelli.ZAE_SCIN_NEW.fragment.InsurancePartnerCreditInfo", that);
				that.getView().addDependent(this._oInsurancePopover);
			}
			this._oInsurancePopover.openBy(oButton)
		},

		onBeforeRebindServiceContract: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var mBindingParams = oEvent.getParameter("bindingParams");
			if (this.ServiceContract) {
				mBindingParams.preventTableBind = false;
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					oModelData.customerInfo.Equipment);
				aFilters.push(newFilter);
				mBindingParams.filters = aFilters;
				mBindingParams.parameters.select = mBindingParams.parameters.select +
					",SalesContract,ContractStatusCriti_new,ContractStatus_new";
				var sorter = [];
				sorter.push(new sap.ui.model.Sorter({
					path: 'SalesContract',
					descending: true
				}));
				mBindingParams.sorter = sorter;
			} else {
				mBindingParams.preventTableBind = true;
			}
		},
		onPressLoadServiceContract: function () {
			this.ServiceContract = true;
			this.getView().byId("IdServiceContract").rebindTable();
		},
		fnServiceContract: function (oValue) {
			var OldServiceContract = this.getView().getModel("i18n").getResourceBundle().getText("OldServiceContract");
			var ServiceContract = this.getView().getModel("i18n").getResourceBundle().getText("ServiceContract");
			return oValue === 'CTOT' ? OldServiceContract : ServiceContract;
		},
		onFilterSearch: function (oEvent) {
			var searchText = oEvent.getParameter("query");
			var oSmartTable = this.getView().byId("SmartTableContactPersonList");
			var oTable = oSmartTable.getTable();
			var oBinding = oTable.getBinding("items");

			if (searchText) {
				var oFilterContactPerson = new Filter("ContactPerson", FilterOperator.Contains, searchText);
				var oFilterContactPersonName = new Filter("ContactPersonName", FilterOperator.Contains, searchText);

				var combinedFilter = new Filter({
					filters: [oFilterContactPerson, oFilterContactPersonName],
					and: false
				});

				oBinding.filter([combinedFilter]);
			} else {
				oBinding.filter([]);
			}
		},
		onClickDisplayChangeLog: function (oEvent) {
			var that = this;
			var oCustomerData = this.getView().getModel("mCustIdentification").getProperty("/customerInfo/to_CurrentOwner");
			var oChangeDocID = "BP  ";
			oChangeDocID = oCustomerData.Person !== "" ? oChangeDocID + oCustomerData.Person.padStart(10, "0") : oChangeDocID;
			oChangeDocID = oCustomerData.AddressID !== "" ? oChangeDocID + oCustomerData.AddressID.padStart(10, "0") : oChangeDocID;
			var oSalesOrder = {
				serviceDocGUID: oChangeDocID,
				serviceDocumentDate: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate())
			};
			that.oExtensionAPI = this;
			that.oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			that.onOpenChangeDocDialog(that, oEvent, oSalesOrder);
		},
		onOpenChangeDocDialog: function (that, oEvent, oBusinessObject) {
			this.sSalesDocumentId = oBusinessObject.serviceDocGUID;
			this.sCreationTime = oBusinessObject.serviceDocumentDate;
			var self = this;
			var Dialog = sap.ui.getCore().byId("BPChangeDocDialog--ChangeDocDialog");
			if (!Dialog) {
				that.changeDocPromise = that.changeDocPromise || Fragment.load({
					id: "BPChangeDocDialog",
					name: "sap.cus.sd.lib.slsdoc.manage.reuse.view.changeDoc",
					controller: that
				});

				that.changeDocPromise.then(function (dialog) {
					that.getView().addDependent(dialog);
					self._loadContent(that, dialog);
				});
			} else {
				that.getView().addDependent(Dialog);
				self._loadContent(that, Dialog);
			}
		},

		onChangeDocButtonClose: function (oEvent) {
			var that = this;
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
			that.getView().removeDependent(oDialog);
		},

		_getObjectById: function (sFragmentId, sElementId) {
			return sap.ui.core.Fragment.byId(sFragmentId, sElementId);
		},

		_loadContent: function (that, dialog) {
			var oLogContainer = this._getObjectById("BPChangeDocDialog", "ChangeDocControlContainer");
			oLogContainer.setComponent(that.oComp);
			that.oComp.getObjectId()[0] = this.sSalesDocumentId;
			that.oComp.setStartDate(this.sCreationTime);
			that.oComp.stRefresh();
			dialog.open();
		},
		_pad: function (nParam, width, zParam) {
			var z = zParam || "0";
			var n = nParam + "";
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		},
		onInitChangeDocs: function () {
			this.oComp = sap.ui.getCore().getComponent(sap.ui.core.Fragment.createId("BPChangeDocDialog",
				"ChangeDocControlComponent"));
			if (this.oComp === undefined) {
				var oDate = new Date();
				oDate.setDate(1);
				oDate.setMonth(1);
				this.oComp = sap.ui.getCore().createComponent({
					name: "sap.nw.core.changedocs.lib.reuse.changedocscomponent",
					id: sap.ui.core.Fragment.createId("BPChangeDocDialog", "ChangeDocControlComponent"),
					settings: {
						"objectClass": ["ADRESSE2", "ADRESSE"],
						"objectId": [],
						// "DatabaseTable": ["ADR2"],
						// "ChangeDocDatabaseTableField": ["TEL_NUMBER", "MOB_NUMBER", "FAX_NUMBER"],
						"startDate": oDate,
						"stIsAreaVisible": true
					}
				});
				this.oComp.init();
				this.oComp.getRootControl().byId("smartTable_ResponsiveTable").attachBeforeRebindTable(this.onBeforeRebindTableDoc);
			}
		},
		onBeforeRebindTableDoc: function (e, c) {
			var oBindings = e.getParameter("bindingParams");
			var oFilters = oBindings.filters.aFilters;
			oFilters.push(new Filter({
				filters: [
					new Filter({
						path: "DatabaseTable",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'ADR2'
					}),
					new Filter({
						path: "DatabaseTable",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'ADR3'
					})
				],
				and: false
			}));
			oFilters.push(new Filter({
				filters: [
					new Filter({
						path: "ChangeDocDatabaseTableField",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'TEL_NUMBER'
					}),
					new Filter({
						path: "ChangeDocDatabaseTableField",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'FAX_NUMBER'
					}), new Filter({
						path: "ChangeDocDatabaseTableField",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'MOB_NUMBER'
					})
				],
				and: false
			}));
			oBindings.filters.aFilters = oFilters;
		},
		onContactPersonSelectionChange: function (oEvent) {
			var oModel = this.getView().getModel("mCustIdentification");
			var oSelected = oEvent.getParameter("selected");
			oModel.setProperty("/contactPersonselected", oSelected);
			//	oModel.updateBindings(true);
		}

	});
});