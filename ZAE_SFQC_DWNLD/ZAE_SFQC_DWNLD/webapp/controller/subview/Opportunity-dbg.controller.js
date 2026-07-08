sap.ui.define([
	"sap/base/util/UriParameters",
	"../BaseController"
], function (UriParameters, BaseController) {
	"use strict";
	var opportinityBtnPath = "/pages/Opportunity/isNextEnabled";
	return BaseController.extend("com.globalintelli.ZAE_SFQC.controller.subview.Opportunity", {

		onInit: function () {
			var that = this;
			var oParentView = that.getOwnerComponent().getAggregation("rootControl");
			var mApp = oParentView.getModel("app");
			mApp.setProperty(opportinityBtnPath, false);
		},
		onChangefilter: function () {
			var mApp = this.getView().getModel("app");
			mApp.setProperty(opportinityBtnPath, false);
			mApp.updateBindings(true);
		},
		onOpportunityInputInitialized: function (oEvent) {
			var that = this;
			var oSmartFilterBar = oEvent.getSource();
			var mApp = that.getView().getModel("app");
			mApp.setProperty("/pages/isBusy", false);
			var oFilterGroupItems = oSmartFilterBar.getFilterGroupItems();
			if (oFilterGroupItems.length === 0) {
				var title = that.geti18n("ERROR");
				var message = that.geti18n("UNABLE_LOAD_OPPO_INPUT");

				that.showMessage(title, message, that.getView().getModel("i18n").getResourceBundle().getText("ERROR"));
			} else {
				var params = {};
				params.Opportunity = that.getQueryParam("Opportunity");
				params.Customer = that.getQueryParam("Customer");
				params.DistributionChannel = that.getQueryParam("DistributionChannel");
				params.Division = that.getQueryParam("Division");
				params.SalesOffice = that.getQueryParam("SalesOffice");
				params.SalesOrganization = that.getQueryParam("SalesOrganization");
				params.Equipment = that.getQueryParam("Equipment");

				mApp.setProperty("/params", params);

				if (params.Equipment !== undefined && params.Equipment !== null) {
					var smartfilterBar = this.getView().byId("opportunityInput");
					// var Customer = smartfilterBar.getControlByKey("CustomerField");
					// var DistributionChannel = smartfilterBar.getControlByKey("DistributionChannel");
					// var Division = smartfilterBar.getControlByKey("Division");
					// var SalesOffice = smartfilterBar.getControlByKey("SalesOffice");
					// var SalesOrganization = smartfilterBar.getControlByKey("SalesOrganization");
					// var Equipment = smartfilterBar.getControlByKey("Equipment");
					// var Opportunity = smartfilterBar.getControlByKey("Opportunity");
					// Customer.setValue(params.Customer);
					// DistributionChannel.setSelectedKey(params.DistributionChannel);
					// Division.setSelectedKey(params.Division);
					// SalesOffice.setSelectedKey(params.SalesOffice);
					// SalesOrganization.setSelectedKey(params.SalesOrganization);
					// Equipment.setValue(params.Equipment);
					var FilterData = {};
					FilterData["SalesOrganization"] = params.SalesOrganization;
					FilterData["DistributionChannel"] = params.DistributionChannel;
					FilterData["Division"] = params.Division;
					FilterData["SalesOffice"] = params.SalesOffice;
					FilterData["Equipment"] = params.Equipment;
					FilterData["CustomerField"] = params.Customer;
					smartfilterBar.setFilterData(FilterData);
					smartfilterBar.fireSearch();
					//	Opportunity.setValue(params.Opportunity);

					// mApp.setProperty("/pages/isBusy", true);
					mApp.setProperty(opportinityBtnPath, true);
				}
			}
			oEvent.getSource().getControlByKey("SalesOrganization").attachChange(this.onSalesAreaChange, this);
			oEvent.getSource().getControlByKey("DistributionChannel").attachChange(this.onSalesAreaChange, this);
			oEvent.getSource().getControlByKey("Division").attachChange(this.onSalesAreaChange, this);

		},
		onSalesAreaChange: function (oEvent) {
			this.getView().byId("opportunityInput").getControlByKey("CustomerField").setSelectedKey(null);
			this.getView().byId("opportunityInput").getControlByKey("CustomerField").setValue("");
		},
		onOpportunityInputSearch: function (oEvent) {
			var that = this;
			var oParentView = that.getOwnerComponent().getAggregation("rootControl");
			var opportunitySubView = oParentView.byId("opportunitySubView");
			var overviewSubView = oParentView.byId("overviewSubView");
			var confirmationSubView = oParentView.byId("confirmationSubView");
			var preArr = [{
				id: "opportunityTab--",
				view: opportunitySubView
			}, {
				id: "overviewTab--",
				view: overviewSubView
			}, {
				id: "confirmationTab--",
				view: confirmationSubView
			}];
			var oSmartFilterBar = oEvent.getSource();
			var mApp = this.getView().getModel("app");
			mApp.setProperty("/pages/currentStep", 0);
			mApp.setProperty(opportinityBtnPath, false);
			mApp.setProperty("/pages/Config/currentItem", 0);
			mApp.setProperty("/pages/Overview", {
				"isSubmitEnabled": false,
				"typeOptions": [],
				"type": "",
				"contractTypeOptions": [],
				"selContractType": "",
				"totalPrice": null,
				"paymentMethods": [],
				"selPaymentMethod": "",
				"paymentTerms": [],
				"selPaymentTerms": "",
				"selTradeIn": "NO",
				"downPaymentAmount": {
					"valid": false,
					"value": null
				},
				"customerReference": "",
				"tradeInDetials": {
					"description": "",
					"make": "",
					"model": "",
					"colour": "",
					"licensePlateNo": "",
					"expectedValue": null,
					"retainLicensePlate": "NO"
				},
				"emiData": {
					"amount": null,
					"emi": null,
					"total": null,
					"interest": null,
					"chartData": {
						"pie": null,
						"bar": null
					}
				}
			});
			mApp.setProperty("/cart", []);
			var aFilterItems = oSmartFilterBar.getFilterGroupItems();
			var aOpportunityFilter_EQ = aFilterItems.filter(function (f) {
				return f.getName() === "Equipment";
			});
			var aOpportunityFilter_SO = aFilterItems.filter(function (f) {
				return f.getName() === "SalesOrganization";
			});
			var aOpportunityFilter_DC = aFilterItems.filter(function (f) {
				return f.getName() === "DistributionChannel";
			});
			var aOpportunityFilter_DV = aFilterItems.filter(function (f) {
				return f.getName() === "Division";
			});
			var aOpportunityFilter_SF = aFilterItems.filter(function (f) {
				return f.getName() === "SalesOffice";
			});
			var aOpportunityFilter_CS = aFilterItems.filter(function (f) {
				return f.getName() === "CustomerField";
			});

			if (aOpportunityFilter_EQ.length === 0 || aOpportunityFilter_SO.length === 0 || aOpportunityFilter_DC.length === 0 ||
				aOpportunityFilter_DV.length === 0 || aOpportunityFilter_CS.length === 0
			) {
				var title = this.geti18n("ERROR");
				that.showMessage(title, that.getView().getModel("i18n").getResourceBundle().getText("ErrorSmartFilterBar001"), that.getView().getModel(
					"i18n").getResourceBundle().getText("ERROR"));
			} else {
				var aOpportunity_EQ = aOpportunityFilter_EQ[0];
				var aOpportunity_SO = aOpportunityFilter_SO[0];
				var aOpportunity_DC = aOpportunityFilter_DC[0];
				var aOpportunity_DV = aOpportunityFilter_DV[0];
				var aOpportunity_SF = aOpportunityFilter_SF[0];
				var aOpportunity_CS = aOpportunityFilter_CS[0];
				// var oOpportunityInputControl_EQ = oSmartFilterBar.determineControlByFilterItem(aOpportunity_EQ);
				// var oOpportunityInputControl_SO = oSmartFilterBar.determineControlByFilterItem(aOpportunity_SO);
				// var oOpportunityInputControl_DC = oSmartFilterBar.determineControlByFilterItem(aOpportunity_DC);
				// var oOpportunityInputControl_DV = oSmartFilterBar.determineControlByFilterItem(aOpportunity_DV);
				// var oOpportunityInputControl_SF = oSmartFilterBar.determineControlByFilterItem(aOpportunity_SF);
				// var oOpportunityInputControl_CS = oSmartFilterBar.determineControlByFilterItem(aOpportunity_CS);
				var Equipment = oSmartFilterBar.getFilterData()["Equipment"];
				var SalesOrganization = oSmartFilterBar.getFilterData()["SalesOrganization"];
				var DistributionChannel = oSmartFilterBar.getFilterData()["DistributionChannel"];
				var Division = oSmartFilterBar.getFilterData()["Division"];
				var SalesOffice = oSmartFilterBar.getFilterData()["SalesOffice"];
				var Customer = oSmartFilterBar.getFilterData()["CustomerField"];
				var OpportunityNumber = that.getQueryParam("Opportunity");
				var path = "/ZAE_F_SFQC_01(Equipment='" + Equipment + "')";
				// , "organizationDetails", "partnerDetails"
				//var oSmartFormIDs = ["opportunityDetails"];
				var oSmartFormIDs = ["opportunityDetails", "organizationDetails", "partnerDetails"];
				preArr.forEach(function (p) {
					oSmartFormIDs.forEach(function (s) {
						p.view.byId(p.id + s).bindElement(path);
					});
				});
				mApp.setProperty("/pages/Opportunity/Equipment", Equipment);
				mApp.setProperty("/pages/Opportunity/SalesOrganization", SalesOrganization);
				mApp.setProperty("/pages/Opportunity/DistributionChannel", DistributionChannel);
				mApp.setProperty("/pages/Opportunity/Division", Division);
				mApp.setProperty("/pages/Opportunity/SalesOffice", SalesOffice);
				mApp.setProperty("/pages/Opportunity/Customer", Customer);
				if (OpportunityNumber) {
					mApp.setProperty("/pages/Opportunity/OpportunityNumber", OpportunityNumber);
				}
				// debugger;
				this.onPostOpportunitySet(SalesOrganization, DistributionChannel, SalesOffice, path);
			}

		},

		onPostOpportunitySet: function (SalesOrganization, DistributionChannel, SalesOffice, path) {
			var that = this;
			var oModel = that.getView().getModel();
			var mApp = that.getView().getModel("app");
			// debugger;

			// -- Load Opportunity Data
			oModel.read(path, {
				urlParameters: {
					$expand: "to_KiloMeterReadings"
				},
				success: function (data1) {
					var oOpportunityData = data1;
					if (oOpportunityData) {
						oOpportunityData.to_KiloMeterReadings.results = oOpportunityData.to_KiloMeterReadings.results.sort(function (a, b) {
							return a.SortKey - b.SortKey;
						});
					}
					// -- Load Config Data
					oModel.read("/ZAE_I_TC_SQTC", {
						urlParameters: {
							"$filter": "SalesOrganization eq '" + SalesOrganization +
								"' and DistributionChannel eq '" + DistributionChannel + "'and SalesOffice eq '" + SalesOffice + "'"
						},
						success: function (data2) {
							var oConfigDataArr = data2.results;
							var oConfigData = null;
							// debugger;

							if (oConfigDataArr.length === 0) {
								that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
									that.getView().getModel("i18n").getResourceBundle().getText("MaintainDataInZAE_I_TC_SQTC"),
									that.getView().getModel("i18n").getResourceBundle().getText("Error"));
								return null;
							} else if (oConfigDataArr.length === 1) {
								oConfigData = oConfigDataArr[0];
							} else if (oConfigDataArr.length > 1) {
								return null;
								// }
							}
							//	var isFleet = oConfigData.AppMode.charAt(1) === "F";

							var typeOptions = [];
							var typeCheck = false;
							var quotationTypes = ["QuotationSelf"];
							var QuotationPaymentMethods = [];
							quotationTypes.forEach(function (i) {
								if (oConfigData[i] !== "") {
									if (!typeCheck) {
										typeCheck = true;
										typeOptions.push({
											type: "Quotation",
											typeName: "Quotation"
										});
									}
									switch (i) {
									case "QuotationCredit":
										QuotationPaymentMethods.push({
											PaymentMethod: "Credit",
											PaymentMethodName: "Credit"
										});
										break;
									case "QuotationSelf":
										QuotationPaymentMethods.push({
											PaymentMethod: "Self",
											PaymentMethodName: "Cash"
										});
										break;
									}
								}
							});

							var ptFilterStr = "";
							// ,oConfigData.PaymentTermsBank 
							var ptArr = [oConfigData.PaymentTermsSelf, oConfigData.PaymentTermsCredit].filter(function (p) {
								return p !== "" && p !== undefined;
							});

							if (ptArr.length > 0) {
								ptArr.forEach(function (p, i, a) {
									ptFilterStr += "startswith(CustomerPaymentTerms, '" + p + "') eq true";
									if (i < a.length - 1) {
										ptFilterStr += " or ";
									}
								});

								// -- Load Payment Terms Data
								oModel.read("/ZAE_I_PaymentTerms", {
									urlParameters: {
										"$filter": ptFilterStr
									},
									success: function (data3) {
										var ptData = data3.results;
										var isPtDataValid = true;

										ptArr.forEach(function (p) {
											if (isPtDataValid) {
												isPtDataValid = ptData.filter(function (d) {
													return d.CustomerPaymentTerms.startsWith(p);
												}).length > 0;
											}
										});

										// TODO: Remove Testing Bypass
										if (isPtDataValid) {
											// if (true) {

											var selectedEquipmentData = oOpportunityData;

											var fArr = [];
											fArr.push(new sap.ui.model.Filter({
												path: "Material",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: selectedEquipmentData.Material
											}));
											oModel.read("/ZAE_I_Material", {
												filters: fArr,
												success: function (data) {

													if (data.results.length > 0) {

														var selectedMaterialData = data.results[0];
														mApp.setProperty("/pages/Material/selectedMaterialData", selectedMaterialData);
														oConfigData.paymentTermsData = ptData;
														// oConfigData.EMIPercent = parseInt(oConfigData.EMIPercent, 10).toString();

														mApp.setProperty("/pages/Opportunity/opportunityData", oOpportunityData);
														mApp.setProperty("/pages/Material/selectedMaterialData", selectedMaterialData);
														mApp.setProperty("/pages/Material/selectedEquipmentData", selectedEquipmentData);
														mApp.setProperty("/pages/Opportunity/isOpportunityDataLoaded", true);
														mApp.setProperty(opportinityBtnPath, true);
														mApp.setProperty("/pages/Overview/typeOptions", typeOptions);
														mApp.setProperty("/pages/Overview/type", typeOptions[0].type);
														mApp.setProperty("/pages/Overview/QuotationPaymentMethods", QuotationPaymentMethods);
														mApp.setProperty("/pages/configData", oConfigData);
														mApp.setProperty("/pages/isConfigDataLoaded", true);

														var oParentView = that.getOwnerComponent().getAggregation("rootControl");
														var processTypeSelect = oParentView.byId("processType");
														processTypeSelect.bindItems({
															path: "app>/pages/Overview/" + typeOptions[0].type + "PaymentMethods",
															template: new sap.ui.core.ListItem({
																key: "{app>PaymentMethod}",
																text: "{app>PaymentMethodName}"
															})
														});
														var overviewSubView = oParentView.byId("overviewSubView");
														var paymentMethodSelect = overviewSubView.byId("paymentMethod");
														paymentMethodSelect.bindItems({
															path: "app>/pages/Overview/" + typeOptions[0].type + "PaymentMethods",
															template: new sap.ui.core.ListItem({
																key: "{app>PaymentMethod}",
																text: "{app>PaymentMethodName}"
															})
														});

														var processType = "";
														if (typeOptions[0].type === "Inquiry") {} else {
															processType = QuotationPaymentMethods[0].PaymentMethod;
														}
														mApp.setProperty("/pages/Overview/selPaymentMethod", processType);

														var paymentTerms = oConfigData.paymentTermsData.filter(function (p) {
															return p.CustomerPaymentTerms.startsWith(oConfigData["PaymentTerms" + processType]);
														});
														mApp.setProperty("/pages/Overview/paymentTerms", paymentTerms);

														mApp.setProperty("/pages/Material/type", "Material");

													} else {

														//	that.showMessage("{i18n>Equipment}", "{i18n>UnabletoloadMaterialData}", "{i18n>Error}");
														that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
															that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadMaterialData"),
															that.getView().getModel("i18n").getResourceBundle().getText("Error"));
													}

												},
												error: function (error) {
													that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
														that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadMaterialData"),
														that.getView().getModel("i18n").getResourceBundle().getText("Error"));

												}
											});

										} else {

										}
									},
									error: function (error3) {
										that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
											that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadPaymentTerms"),
											that.getView().getModel("i18n").getResourceBundle().getText("Error"));
									}
								});
							} else {

							}

						},
						error: function (error2) {
							that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
								that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadEquipmentData"),
								that.getView().getModel("i18n").getResourceBundle().getText("Error"));
						}
					});
				},
				error: function (error1) {
					that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
						that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadEquipmentData"),
						that.getView().getModel("i18n").getResourceBundle().getText("Error"));
				}
			});
		}

	});
});