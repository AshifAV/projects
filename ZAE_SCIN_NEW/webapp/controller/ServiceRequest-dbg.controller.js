sap.ui.define([
	"com/globalintelli/ZAE_SCIN_NEW/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/model/Filter",
	"com/globalintelli/zae_flib/controller/aeFormatter",
	"com/globalintelli/zae_flib/controller/aeUI5Utility",
	"com/globalintelli/zae_flib/controller/aeUtility/"
], function (BaseController, Fragment, Button, Dialog, Filter, aeFormatter, aeUI5Utility, aeUtility) {
	"use strict";

	return BaseController.extend("com.globalintelli.ZAE_SCIN_NEW.controller.ServiceRequest", {

		_planningCalendar: null,

		i18nPath: "i18n",

		aeFormatter: new aeFormatter(),

		aeUI5Util: new aeUI5Utility(),
		aeUtil: new aeUtility(),

		onInit: function () {

			this.aeUI5Util.setupMessageManager(this);
			this.aeUtil.resetLibrary();
			this._planningCalendar = this.getView().byId("SCIN_SRPlanCal");
			this._planningCalendar.setStartDate(new Date());
			var oModelData = {};
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.setData(oModelData);
			this.getView().setModel(oJsonModel, "mServiceRequest");
			// this.getRouter("ServiceRequestView")._matchedRoute.attachPatternMatched(this._onObjectMatched, this);
			var vRouter = this.getRouter().getRoute("ServiceRequestView");
			vRouter.attachPatternMatched(this._onObjectMatched, this);

		},

		onAfterRendering: function () {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("MainView", "fnAfterNavigate", {});

		},

		_onObjectMatched: function (oEvent) {
			this._planningCalendar.unbindAggregation("rows");
			this._planningCalendar.rerender();
			var DecodedData = decodeURIComponent(oEvent.getParameter("arguments").param1).replace(/\\/g, "");
			var oParsedObject = JSON.parse(DecodedData);
			sap.ui.getCore().getMessageManager().removeAllMessages();
			//var oParsedObject = JSON.parse(oEvent.getParameter("arguments").param1);
			this.getView().byId("SCIN_B21").setEnabled(true);
			this.fnLoadCalenderData(oParsedObject);
			this.handleServiceRequestCreate();
			this.getView().setBusy(false);
		},

		fnLoadCalenderData: function (oData) {
			var that = this;
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oModelData = {
				filters: oData,
				UIOnly: {
					visible: {
						ServiceEmpGrp: false
					},
					text: {
						Plant: oData.Plant,
						CRMSalesOffice: "",
						SalesGroup: oData.SalesGroup,
						Employee: ""
					},
					Clocation: [],
					//	zZone: [],
					TransitTime: []
				}
			};
			oJsonModel.setData(oModelData);
			this.getView().setModel(oJsonModel, "mServiceRequest");

			var oTemplateRow = new sap.m.PlanningCalendarRow({
				title: "{EmployeeFullName}",
				text: "{Employee}",
				key: "{Employee}",
				enableAppointmentsDragAndDrop: true,
				appointmentDrop: function (oEvent) {
					that.handleAppointmentDrop(oEvent);
				},
				appointmentDragEnter: function (oEvent) {
					if (that.isAppointmentOverlap(oEvent, oEvent.getParameter("calendarRow"))) {
						oEvent.preventDefault();
					}

				}
			});
			var oSorter = new sap.ui.model.Sorter({
				path: "Appointment",
				descending: true
			});
			oTemplateRow.bindAggregation("appointments", {
				path: "to_Appointment",
				sorter: oSorter,
				template: new sap.ui.unified.CalendarAppointment({
					title: "{description}",
					text: "{stat_open_desc}",
					key: "{Appointment}",
					type: "{type}",
					startDate: {
						parts: ["fromdate", "from_time"],
						formatter: this.aeFormatter.dateTimeToDate //this.aeFormatter.dateTimeToDate
					},
					endDate: {
						parts: ["todate", "to_time"],
						formatter: this.aeFormatter.dateTimeToDate
					}
				}),
				templateShareable: true
			});

			this._planningCalendar.bindAggregation("rows", {
				path: "/ZAE_I_Employee_02",
				template: oTemplateRow,
				templateShareable: true
			});

			var oBinding, aFilters, aFilters2 = [];

			oBinding = this._planningCalendar.getBinding("rows");
			aFilters = [];

			if (oModelData.filters.Plant) {
				// aFilters.push(new Filter("ObjectAbbreviation", "EQ", "SA" + oModelData.filters.Plant));
				aFilters.push(new Filter("Plant", "EQ", oModelData.filters.Plant));
				aFilters2.push(new Filter("Plant", "EQ", oModelData.filters.Plant));
			}
			if (oModelData.filters.SalesOffice) {
				aFilters.push(new Filter("SalesOffice", "EQ", oModelData.filters.SalesOffice));
			}
			if (oModelData.filters.SalesGroup) {
				aFilters.push(new Filter("SalesGroup", "EQ", oModelData.filters.SalesGroup));
			}
			oBinding.filter(aFilters, "Application");

			var oModeldata = this.getView().getModel("mServiceRequest");
			this.getView().getModel().read("/ZAE_I_TC_SCIN_03", {
				filters: aFilters2,
				success: function (oData1, response) {
					if (oData1.results.length > 0) {
						oModeldata.setProperty("/UIOnly/visible/ServiceEmpGrp", oData1.results[0].ServiceEmpGrp);
					}
				},
				error: function (oError) {}

			});
			this.getView().getModel().read("/ZAE_I_TC_SCIN_02", {
				// filters: aFilters,
				urlParameters: {
					"$filter": "Plant  eq \'" + oModelData.filters.Plant + "\'"
				},
				success: function (oData1, response) {
					if (oData1.results.length > 0) {
						oModeldata.setProperty("/UIOnly/text/CRMSalesOffice", oData1.results[0].CRMSalesOffice);
					}
				},
				error: function (oError) {}

			});
			// var userId = sap.ushell.Container.getService("UserInfo").getUser().getId();
			// aFilters.push(new Filter("SystemID", "EQ", userId));
			// that.getView().setBusy(true);
			// that.getView().getModel().read("/ZAE_I_Employee_12", {
			// 	filters: aFilters,
			// 	// urlParameters: {
			// 	// 	"$filter": "SystemID  eq \'" + userId + "\'"
			// 	// },
			// 	success: function (oData, response1) {
			// 		if (oData.results.length > 0) {
			// 			oModeldata.setProperty("/UIOnly/text/Employee", oData.results[0].Employee);
			// 			that.handleCreateButtonEnabled();
			// 		}
			// 		//	that.handleCreateButtonEnabled();
			// 		//	that._createDialog.open();
			// 		that.getView().setBusy(false);
			// 	},
			// 	error: function (oError) {
			// 		that.getView().setBusy(false);
			// 	}
			// });
		},

		handleServiceRequestCreate: function (oEvent) {
			var oSelectedContext = this.getView().byId("SCIN_SRPlanCal").getSelectedRows()[0];
			if (oSelectedContext) {
				this._oSelRowKey = oSelectedContext;
			} else {
				this._oSelRowKey = null;
			}
			this._loadDialogFragment();

		},

		_loadDialogFragment: function () {
			if (!this._oNewSRDialog) {
				Fragment.load({
						id: "fragServiceRequestCreate",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateServiceRequest",
						controller: this
					})
					.then(function (oDialogContent) {
						this._createDialog(oDialogContent);
						this._setDialogInitialState();
						Fragment.byId("fragServiceRequestCreate", "IDSREmployee").getBinding("items").attachDataReceived(function (oEvent) {
							var oResults = oEvent.getParameter("data").results;
							var oModel = this.getView().getModel("mServiceRequest");
							var CheckCourtsyCar = oResults[0].CourtsyCarValidation;
							Fragment.byId("fragServiceRequestCreate", "CourtesyCar").setVisible(CheckCourtsyCar);
							if (!this._oSelRowKey) {
								if (oResults.length > 0) {
									oModel.setProperty("/UIOnly/text/Employee", oResults[0].SelectedEmployee);
									this.handleCreateButtonEnabled();
								}
							}
						}.bind(this));

					}.bind(this));
			} else {
				this._setDialogInitialState();
			}
		},

		_createDialog: function (oDialogContent) {

			var appDescription;
			var oInputEmployeeResp;
			var oModelData;
			var oInputServiceEmpGrp;
			var oSrvEmpGrpCheck;
			var that = this;
			var oCourtesyCar;
			var oSalesgroup;
			var Address;
			var Location;
			//	var Zone;
			var TransitTime;
			var oSalesoffice;
			var boolValidationCheck;
			var oDomain;

			this._oNewSRDialog = new Dialog({
				title: "{i18n>CreateServiceRequest}",
				content: [
					oDialogContent
				],
				beginButton: new Button({
					text: "{i18n>Create}",
					enabled: false,
					press: function () {
						var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
						oModelData = that.getView().getModel("mServiceRequest").getData();
						appDescription = Fragment.byId("fragServiceRequestCreate", "IDSRDescription").getValue();
						//	openServiceRequest = Fragment.byId("fragServiceRequestCreate", "ServiceRequestId").getText();
						if (appDescription.length > 38) {
							var TrimmedappDescription = appDescription.substring(0, 38);
							appDescription = TrimmedappDescription;
						}
						var CampaignID;
						if (Fragment.byId("fragServiceRequestCreate", "CampaignID").getTokens().length > 0) {
							CampaignID = Fragment.byId("fragServiceRequestCreate", "CampaignID").getTokens()[0].getKey();
						}

						oInputEmployeeResp = Fragment.byId("fragServiceRequestCreate", "IDSREmployee").getSelectedKey();
						oSrvEmpGrpCheck = oModelData.UIOnly.visible.ServiceEmpGrp;
						oInputServiceEmpGrp = oSrvEmpGrpCheck ? Fragment.byId("fragServiceRequestCreate", "idSEmpGrp").getSelectedKey() : " ";
						oCourtesyCar = Fragment.byId("fragServiceRequestCreate", "CourtesyCar").getSelectedKey();
						Address = Fragment.byId("fragServiceRequestCreate", "idAddress").getValue();
						Location = Fragment.byId("fragServiceRequestCreate", "Location").getSelectedKey();
						//	Zone = Fragment.byId("fragServiceRequestCreate", "Zone").getSelectedKey();
						TransitTime = Fragment.byId("fragServiceRequestCreate", "TransitTime").getValue();
						oDomain = Fragment.byId("fragServiceRequestCreate", "IdDomainValue").getSelectedKey();
						oSalesgroup = Fragment.byId("fragServiceRequestCreate", "IdSalesgroup").getSelectedItem() !== null ? Fragment.byId(
							"fragServiceRequestCreate",
							"IdSalesgroup").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragServiceRequestCreate",
								"IdSalesgroup")
							.getSelectedItem().getBindingContext().sPath).CRMSalesGroup : "";

						oSalesoffice = Fragment.byId("fragServiceRequestCreate", "IdSalesoffice").getSelectedItem() !== null ? Fragment.byId(
							"fragServiceRequestCreate",
							"IdSalesoffice").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragServiceRequestCreate",
							"IdSalesoffice").getSelectedItem().getBindingContext().sPath).CRMSalesOffice : "";
						if (appDescription && oInputEmployeeResp) {
							var oEntity = "ZAE_FM_SCIN_CR_SERREQ_CIAP_V1Set"; // "ZAE_FM_SCIN_CR_SERREQ_FROMCIAPSet";
							var oModel = this.getView().getModel("ZAE_FM_SCIN_CR_SERREQ_CIAP_V1_SRV");
							var N_Main = [{
								"ISrDescription": appDescription,
								"IEquipNo": oModelData.filters.Equipment,
								"IPartner": oModelData.filters.Customer,
								"IContact": oModelData.filters.CPerson,
								"IEmpResp": oInputEmployeeResp,
								"IPlant": oModelData.filters.Plant,
								"ISalesOrg": oModelData.filters.SalesOrganization,
								"IDisChannel": oModelData.filters.DistrChannel,
								"IDivision": oModelData.filters.Division,
								"ISerEmpGrp": oInputServiceEmpGrp,
								"ProgNo": oCourtesyCar,
								"SalesOffice": oSalesoffice,
								//	"Zzone": Zone,
								"NoOfMinutes": TransitTime,
								"Location": Location,
								"Address": Address,
								"SalesGroup": oSalesgroup,
								"CmpgnId": CampaignID,
								"IInsurer": oModelData.filters.Insurer ? oModelData.filters.Insurer : "",
								"Dataprivacyclause": oDomain
							}];

							var N_CatID = [];
							for (var i = 0; i < oModelData.filters.Category.length; i++) {
								N_CatID.push({
									"CatId": oModelData.filters.Category[i].key
								});
							}
							var data = [{
								callProperty: "N_Main",
								value: N_Main
							}, {
								callProperty: "N_CatID",
								value: N_CatID
							}];

							var succFunc = function (oData) {
								var message1 = that.getView().getModel("i18n").getResourceBundle().getText("Created");
								var message2 = that.getView().getModel("i18n").getResourceBundle().getText("Successfully");
								var EJobNo = "";
								if (oData.N_Main.results.length > 0 && oData.N_Main.results[0].EJobNo) {
									EJobNo = oData.N_Main.results[0].EJobNo;
								} else {
									return;
								}
								var msg = new sap.ui.core.message.Message({
									persistent: true,
									code: EJobNo,
									type: sap.ui.core.MessageType.Success,
									// message: "{i18n>Created} " + oData.EJobNo + " {i18n>Successfully}",
									message: message1 + EJobNo + " " + message2,
									additionalText: "",
									description: ""
								});
								sap.ui.getCore().getMessageManager().addMessages(msg);
								that.getView().byId("SCIN_B21").setEnabled(false);
							};

							var errFunc = function (oData) {
								that.getView().byId("SCIN_B21").setEnabled(false);
							};
							this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
							this._oNewSRDialog.close();

						}

					}.bind(this)
				}),
				endButton: new Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewSRDialog.close();
					}.bind(this)
				})
			});
			var oInputEmployee = Fragment.byId("fragServiceRequestCreate", "IDSREmployee");
			this._oNewSRDialog.addEventDelegate({
				onBeforeRendering: function (oEvent) {
					var oBinding = oInputEmployee.getBinding("items");

					this.setBindingFilter(oBinding);
				}
			}, this);
			oInputEmployee.addEventDelegate({
				onBeforeRendering: function (oEvent) {
					var oModelData = this.getView().getModel("mServiceRequest").getData();
					if (this._oSelRowKey !== null) {
						oInputEmployee.setSelectedKey(this._oSelRowKey.getKey());
					} else if (oModelData.UIOnly.text.Employee !== "") {
						oInputEmployee.setSelectedKey(oModelData.UIOnly.text.Employee);
						this.handleCreateButtonEnabled();
					} else {
						oInputEmployee.setSelectedKey(null);
					}
				}
			}, this);
			this._oNewSRDialog.addStyleClass("sapUiContentPadding");
			this.getView().addDependent(this._oNewSRDialog);

		},

		onCampaignValueHelpRequested: function (oEvent1) {
			var input = oEvent1.getSource();
			var oModel = this.getView().getModel("mServiceRequest");
			var oModelData = oModel.getData();
			var SalesOrganization = oModelData.filters.SalesOrganization;
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_VH_CampaignData",
				initiallyVisibleFields: "CampaignID,CampaignExternalID,SalesOrganization,CampaignType,CampaignTypeDescription,StartDate,EndDate",

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

			this.aeUtil.handleSmartDialogValueHelp(this, input, configObject);
		},
		onCampaignIDTokenUpdate: function (oEvent) {
			var aTokens = oEvent.getSource().getTokens();
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
			var oModel = this.getView().getModel("mServiceRequest");
			var oModelData = oModel.getData();
			var SalesOrganization = oModelData.filters.SalesOrganization;
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

		fnAddLocZoneTime: function () {
			var that = this;
			var CheckCaptureAdrs = Fragment.byId("fragServiceRequestCreate", "CourtesyCar").getSelectedItem().getBindingContext().getObject().CaptureAdrs;
			Fragment.byId("fragServiceRequestCreate", "idAddress").setVisible(CheckCaptureAdrs);
			Fragment.byId("fragServiceRequestCreate", "Location").setVisible(CheckCaptureAdrs);
			//	Fragment.byId("fragServiceRequestCreate", "Zone").setVisible(CheckCaptureAdrs);
			Fragment.byId("fragServiceRequestCreate", "TransitTime").setVisible(CheckCaptureAdrs);
			var mServiceRequest = this.getView().getModel("mServiceRequest");
			var mServiceRequestData = mServiceRequest.getData();

			var aFilter = [];
			if (mServiceRequestData.filters.Plant) {
				aFilter.push(new Filter("Plant", "EQ", mServiceRequestData.filters.Plant));
			}
			//	this.getView().setBusy(true);
			this.getView().getModel().read("/ZAE_I_TC_CUPG_03", {
				filters: aFilter,
				success: function (oData, response) {

					that._fnLocation(oData.results);
				},
				error: function (oError) {
					// that.getView().setBusy(false);
				}

			});
		},

		_fnLocation: function (results) {
			var mServiceRequest = this.getView().getModel("mServiceRequest");
			var mLocation = mServiceRequest.getData();
			mLocation.Clocation = results;
			mServiceRequest.updateBindings(true);
			this.fnChangeLocation();
		},

		fnChangeLocation: function () {
			var mServiceRequest = this.getView().getModel("mServiceRequest");
			var mServiceRequestData = mServiceRequest.getData();
			var TransitTime = mServiceRequestData.Clocation;
			//	var Zone = mServiceRequestData.Clocation;
			var oLocation = Fragment.byId("fragServiceRequestCreate", "Location").getSelectedKey();
			// if (oLocation && mServiceRequestData.filters.Plant) {
			// 	var zZoneData = Zone.filter(function (ele) {
			// 		return ele.Location === oLocation && ele.Plant === mServiceRequestData.filters.Plant;
			// 	});
			// 	mServiceRequestData.zZone = zZoneData;
			// }
			// mServiceRequest.updateBindings(true);
			// if (oLocation) {
			// 	Fragment.byId("fragServiceRequestCreate", "Zone").setEnabled(true);
			// }

			if (oLocation && mServiceRequestData.filters.Plant) {
				var TransitTimeData = TransitTime.filter(function (ele) {
					return ele.Location === oLocation && ele.Plant === mServiceRequestData.filters.Plant;
				});
				mServiceRequestData.TransitTime = TransitTimeData;
			}
			if (TransitTimeData && TransitTimeData.length === 1) {
				Fragment.byId("fragServiceRequestCreate", "TransitTime").setValue(TransitTimeData[0].NoOfMinutes);
			}
			mServiceRequest.updateBindings(true);
			if (oLocation) {
				Fragment.byId("fragServiceRequestCreate", "TransitTime").setEnabled(true);
			}
		},
		// fnChangeZone: function () {
		// 	var mServiceRequest = this.getView().getModel("mServiceRequest");
		// 	var mServiceRequestData = mServiceRequest.getData();
		// 	var TransitTime = mServiceRequestData.Clocation;
		// 	var oLocation = Fragment.byId("fragServiceRequestCreate", "Location").getSelectedKey();
		// 	var Zone = Fragment.byId("fragServiceRequestCreate", "Zone").getSelectedKey();
		// 	if (oLocation && mServiceRequestData.filters.Plant && Zone) {
		// 		var TransitTimeData = TransitTime.filter(function (ele) {
		// 			return ele.Location === oLocation && ele.Plant === mServiceRequestData.filters.Plant && ele.Zzone === Zone;
		// 		});
		// 		mServiceRequestData.TransitTime = TransitTimeData;
		// 	}
		// 	if (TransitTimeData.length === 1) {
		// 		Fragment.byId("fragServiceRequestCreate", "TransitTime").setValue(TransitTimeData[0].NoOfMinutes);
		// 	}
		// 	mServiceRequest.updateBindings(true);
		// 	Fragment.byId("fragServiceRequestCreate", "TransitTime").setEnabled(true);
		// },

		_setDialogInitialState: function () {
			//	var oSelectedContext = this.getView().byId("SCIN_SRPlanCal").getSelectedRows();
			var oModelData = this.getView().getModel("mServiceRequest").getData();
			var concatCustomer;
			var concatCPerson;
			if (oModelData.filters.Customer && oModelData.filters.CustomerName) {
				concatCustomer = oModelData.filters.CustomerName + " (" + oModelData.filters.Customer + ")";
			} else {
				concatCustomer = oModelData.filters.Customer;
			}

			if (oModelData.filters.CPerson && oModelData.filters.CPersonName) {
				concatCPerson = oModelData.filters.CPersonName + " (" + oModelData.filters.CPerson + ")";
			} else {
				concatCPerson = oModelData.filters.CPerson;
			}
			if (oModelData.filters.Plant) {
				var plant = oModelData.filters.Plant;
				var aPlantFilter = [];
				var aPlantFilter1 = [];
				var aCourtesyCarFilter = [];
				aPlantFilter.push(new Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
				aPlantFilter1.push(new Filter("MaintPlanPlant", sap.ui.model.FilterOperator.EQ, plant));

				aCourtesyCarFilter.push(new Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesOffice));
				aCourtesyCarFilter.push(new Filter("SalesGroup", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesGroup));
				aCourtesyCarFilter.push(new Filter("Process_Type", sap.ui.model.FilterOperator.EQ, oModelData.filters.TransactionType));
				// if (oModelData.UIOnly.text.CRMSalesOffice !== "") {
				// 	aPlantFilter1.push(new Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oModelData.UIOnly.text.CRMSalesOffice));
				// }
				Fragment.byId("fragServiceRequestCreate", "idSEmpGrp").getBinding("items").filter(aPlantFilter);
				Fragment.byId("fragServiceRequestCreate", "CourtesyCar").getBinding("items").filter(aCourtesyCarFilter);
				Fragment.byId("fragServiceRequestCreate", "IdSalesoffice").getBinding("items").filter(aPlantFilter);
				var aSalesgroupFilter = [];
				aSalesgroupFilter.push(new Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
				if (oModelData.filters.SalesOffice) {
					aSalesgroupFilter.push(new Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesOffice));
					Fragment.byId("fragServiceRequestCreate", "IdSalesoffice").setSelectedKey(oModelData.filters.SalesOffice);
				}
				Fragment.byId("fragServiceRequestCreate", "IdSalesgroup").getBinding("items").filter(aSalesgroupFilter);
			}
			Fragment.byId("fragServiceRequestCreate", "idAddress").setVisible(false);
			Fragment.byId("fragServiceRequestCreate", "Location").setVisible(false);
			//Fragment.byId("fragServiceRequestCreate", "Zone").setVisible(false);
			Fragment.byId("fragServiceRequestCreate", "TransitTime").setVisible(false);
			Fragment.byId("fragServiceRequestCreate", "idAddress").setValue("");
			Fragment.byId("fragServiceRequestCreate", "Location").setSelectedKey();
			// Fragment.byId("fragServiceRequestCreate", "IdDomainValue").setSelectedKey(null);
			if (oModelData.filters.CampaignID) {
				var oText = this.formatNameAndValuePair(oModelData.filters.Cmpgn_extid, oModelData.filters.CampaignID);
				var oToken = new sap.m.Token({
					key: oModelData.filters.CampaignID,
					text: oText
				});
				Fragment.byId("fragServiceRequestCreate", "CampaignID").setTokens([oToken]);
			} else {
				Fragment.byId("fragServiceRequestCreate", "CampaignID").setTokens([]);
			}
			var Domain = Fragment.byId("fragServiceRequestCreate", "IdDomainValue");
			var oMake = oModelData.filters.Make;
			var oSalesgroup = oModelData.filters.SalesGroup;
			if (!oSalesgroup.startsWith('B')) {
				if (oMake === "CAD" || oMake === "CHV") {
					Fragment.byId("fragServiceRequestCreate", "IdDomainValue").setSelectedKey("2");
					Fragment.byId("fragServiceRequestCreate", "IdDomainValue").setEnabled(true);
				} else {
					Fragment.byId("fragServiceRequestCreate", "IdDomainValue").setSelectedKey();
					Fragment.byId("fragServiceRequestCreate", "IdDomainValue").setEnabled(false);
				}
			} else {
				Fragment.byId("fragServiceRequestCreate", "IdDomainValue").setSelectedKey();
				Fragment.byId("fragServiceRequestCreate", "IdDomainValue").setEnabled(false);
			}

			Domain.addEventDelegate({
				onAfterRendering: function (oEvent1) {
					this.handleCreateButtonEnabled();
				}
			}, this);
			// Fragment.byId("fragServiceRequestCreate", "CampaignID").setTokens([]);
			//	Fragment.byId("fragServiceRequestCreate", "Zone").setSelectedKey();
			Fragment.byId("fragServiceRequestCreate", "TransitTime").setValue("");
			//	Fragment.byId("fragServiceRequestCreate", "Zone").setEnabled(false);
			Fragment.byId("fragServiceRequestCreate", "TransitTime").setEnabled(false);
			Fragment.byId("fragServiceRequestCreate", "IdSalesgroup").setSelectedKey(oModelData.UIOnly.text.SalesGroup);
			Fragment.byId("fragServiceRequestCreate", "Customer").setValue(concatCustomer);
			Fragment.byId("fragServiceRequestCreate", "CPerson").setValue(concatCPerson);
			Fragment.byId("fragServiceRequestCreate", "IDSRDescription").setValue(oModelData.filters.Description);
			Fragment.byId("fragServiceRequestCreate", "CourtesyCar").setSelectedKey();
			Fragment.byId("fragServiceRequestCreate", "idSEmpGrp").setSelectedKey();
			// this._fnLoadSericeRequest();
			this._oNewSRDialog.open();
			this.handleCreateButtonEnabled();
		},
		handleCreateButtonEnabled: function () {
			var oModel = this.getView().getModel("mServiceRequest");
			var Salesoffice = Fragment.byId("fragServiceRequestCreate", "IdSalesoffice").getSelectedItem();
			var Salesgroup = Fragment.byId("fragServiceRequestCreate", "IdSalesgroup").getSelectedItem();
			var SREmployee = Fragment.byId("fragServiceRequestCreate", "IDSREmployee").getSelectedItem();
			var sDescription = Fragment.byId("fragServiceRequestCreate", "IDSRDescription").getValue();
			var oDomain = Fragment.byId("fragServiceRequestCreate", "IdDomainValue").getSelectedKey();
			var oDomainCheck;
			var oModelData = oModel.getData();
			var oMake = oModelData.filters.Make;
			var oSalesgroup = oModelData.filters.SalesGroup;
			if (!oSalesgroup.startsWith('B')) {
				if (oMake === "CAD" || oMake === "CHV") {
					oDomainCheck = (oDomain === "2" || oDomain === "3") ? true : false;
				} else {
					oDomainCheck = oDomain === "1" ? true : false;
				}
			} else {
				oDomainCheck = oDomain === "1" ? true : false;
			}
			var bEnabled = sDescription !== "" && Salesgroup !== null && Salesoffice !== null && SREmployee !== null && oDomainCheck;
			this._oNewSRDialog.getButtons()[0].setEnabled(bEnabled);
		},
		setBindingFilter: function (oBinding) {
			var aFilters = [];
			var oModelData = this.getView().getModel("mServiceRequest").getData();

			if (oModelData.filters.Plant) {
				// aFilters.push(new Filter("ObjectAbbreviation", "EQ", "SA" + oModelData.filters.Plant));
				aFilters.push(new Filter("Plant", "EQ", oModelData.filters.Plant));
			}
			if (oModelData.filters.SalesOffice) {
				aFilters.push(new Filter("SalesOffice", "EQ", oModelData.filters.SalesOffice));
			}
			if (oModelData.filters.SalesGroup) {
				aFilters.push(new Filter("SalesGroup", "EQ", oModelData.filters.SalesGroup));
			}
			oBinding.filter(aFilters, "Application");

		},

		onMessagePopoverPress: function (oEvent) {
			var custFunction = function (data) {

				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "ServiceRequest",
						action: "aesDisplay"
					},
					params: {
						"ServiceRequest": data
					}
				})) || "";
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});
			};
			this.aeUI5Util.handleMessagePopoverPress(this, oEvent, custFunction);
		},
		handleServiceRequestCreateSlotSelect: function (oEvent) {
			var oSelectedContext = oEvent.getParameter("row");
			if (oSelectedContext) {
				this._oSelRowKey = oSelectedContext;
			} else {
				this._oSelRowKey = null;
			}
			this._loadDialogFragment(oSelectedContext);
		},
		// _fnLoadSericeRequest: function (oEvent) {
		// 	var that = this;
		// 	var oModelData = that.getView().getModel("mServiceRequest").getData();
		// 	var aFilters = [];
		// 	aFilters.push(new Filter("Equipment", "EQ", oModelData.filters.Equipment));
		// 	Fragment.byId("fragServiceRequestCreate", "ServiceRequest").setBusy(true);
		// 	this.getView().getModel().read("/ZAE_I_ServiceRequest_11", {
		// 		filters: aFilters,
		// 		success: function (oData, response) {
		// 			Fragment.byId("fragServiceRequestCreate", "ServiceRequest").setBusy(false);
		// 			if (oData.results.length > 0) {
		// 				Fragment.byId("fragServiceRequestCreate", "ServiceRequestId").bindElement(
		// 					"/ZAE_I_ServiceRequest_11(ServiceObjectType='BUS2000223',ServiceRequest='" + oData.results[0].ServiceRequest + "')");
		// 			} else {
		// 				Fragment.byId("fragServiceRequestCreate", "ServiceRequest").setVisible(false);
		// 			}
		// 		},
		// 		error: function (oError) {
		// 			Fragment.byId("fragServiceRequestCreate", "ServiceRequest").setBusy(false);
		// 		}

		// 	});
		// }
		handleChangeTime: function () {
			var TransitTime = Fragment.byId("fragServiceRequestCreate", "TransitTime");
			TransitTime.setValue(TransitTime.getValue().replace(/[^0-9+()]+/g, "").slice(0, 4));
		},
	});
});