/* global _:true */
sap.ui.define([
	"../BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.globalintelli.ZAE_SFQC.controller.subview.Material", {

		onMaterialFilterInitialized: function (oEvent) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oSmartFilterBar = oEvent.getSource();
			var oFilterGroupItems = oSmartFilterBar.getFilterGroupItems();
			if (oFilterGroupItems.length === 0) {
				var title = this.geti18n("ERROR");
				var message = this.geti18n("UNABLE_LOAD_MAT_INPUT");
				this.showMessage(title, message, oResourceBundle.getText("Error"));
			}
		},

		onEquipmentFilterInitialized: function (oEvent) {
			// var oSmartFilterBar = oEvent.getSource();
			// var oFilterGroupItems = oSmartFilterBar.getFilterGroupItems();
			// if (oFilterGroupItems.length === 0) {
			// 	var title = this.geti18n("ERROR");
			// 	var message = this.geti18n("UNABLE_LOAD_EQUI_INPUT");
			// 	this.showMessage(title, message, "Error");
			// }
		},

		onMaterialFilterSearch: function (oEvent) {
			var that = this;
			var oModel = that.getView().getModel();
			var mApp = this.getView().getModel("app");
			var oAttachment = that.getView().getModel("attachment");
			var oVBox = this.getView().byId("materialListVBox");
			oVBox.setBusy(true);

			var oSmartFilterBar = oEvent.getSource();
			var aFilterArray = oSmartFilterBar.getFilters();
			var oOpportunityData = mApp.getProperty("/pages/Opportunity/opportunityData");
			var oThen = function () {
				oVBox.setBusy(false);
			};

			aFilterArray.push(new sap.ui.model.Filter({
				path: "MaterialSalesOrg",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oOpportunityData.s4_sales_org
			}));
			aFilterArray.push(new sap.ui.model.Filter({
				path: "MaterialDistributionChnl",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oOpportunityData.dis_channel
			}));

			oModel.read("/ZAE_I_SalesMaterial", {
				filters: aFilterArray,
				success: function (data) {
					var oMaterialList = data.results;

					oAttachment.setUseBatch(true);
					oAttachment.setDeferredGroups(["materialImage"]);
					var oThen2 = function () {
						oAttachment.setUseBatch(false);
					};
					// var oLater2 = function () {
					// 	mApp.setProperty("/pages/isBusy", false);
					// };

					oMaterialList.forEach(function (m) {
						oAttachment.read("/GetAllOriginals", {
							urlParameters: {
								"$filter": "Filename eq 'MAIN.png'",
								ObjectType: "'BUS1001006'",
								ObjectKey: "'" + m.Material + "'",
								SemanticObjectType: "''",
								IsDraft: "false"
							},
							groupId: "materialImage"
						});
					});

					oAttachment.submitChanges({
						groupId: "materialImage",
						success: function (data1) {

							oThen2();

							var imagesArray = data1.__batchResponses;

							if (that.isResponseValid(imagesArray)) {

								oMaterialList = oMaterialList.map(function (m, i) {
									var image = data1.__batchResponses[i].data.results;
									image = image.filter(function (f) {
										return (f.Filename === "MAIN.png");
									})[0];

									return _.merge(m, {
										mediaSrc: image !== undefined ? image.__metadata.media_src : "https://i.ibb.co/5kkWFT1/DFLT.png"
									});
								});

								mApp.setProperty("/pages/Material/materialList", oMaterialList);
								// oThen();

								// oLater2();

							} else {
								that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Opportunity"),
									that.getView().getModel("i18n").getResourceBundle().getText("UNABLE_LOAD_ATTCH"),
									that.getView().getModel("i18n").getResourceBundle().getText("Error")
								);
							}

						},
						error: function (error) {
							oThen2();
							that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Opportunity"),
								that.getView().getModel("i18n").getResourceBundle().getText("UNABLE_LOAD_ATTCH"),
								that.getView().getModel("i18n").getResourceBundle().getText("Error")
							);
						}
					});

				},
				error: function (error) {
					that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Opportunity"),
						that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadMaterialData"),
						that.getView().getModel("i18n").getResourceBundle().getText("Error"));
					oThen();
				}
			});

			// if (aMaterialFilterArray.length === 0) {
			// 	var title = this.geti18n("ERROR");
			// 	// var message = this.geti18n("TITLE");
			// 	this.showMessage(title, "Error: Smart Filter Bar - 002", "Error");
			// } else {
			// 	var aMaterialFilter = aMaterialFilterArray[0];
			// 	var oOpportunityInputControl = oSmartFilterBar.determineControlByFilterItem(aMaterialFilter);
			// 	var oOpportunity = oOpportunityInputControl.getValue();

			// 	var path = "/ZAE_F_CFQC_01(object_type='BUS2000111',Opportunity='" + oOpportunity + "')";
			// 	var oSmartFormIDs = ["opportunityDetails", "organizationDetails", "partnerDetails"];
			// 	oSmartFormIDs.forEach(function (s) {
			// 		that.getView().byId(s).bindElement(path);
			// 	});
			// 	mApp.setProperty("/pages/Opportunity/opportunity", oOpportunity);
			// 	this.onPostOpportunitySet(oOpportunity, path);
			// }

		},

		onEquipmentFilterSearch: function (oEvent) {
			var that = this;
			var oModel = that.getView().getModel();
			var mApp = this.getView().getModel("app");
			var oAttachment = that.getView().getModel("attachment");
			var oVBox = this.getView().byId("materialListVBox");
			oVBox.setBusy(true);

			var oSmartFilterBar = oEvent.getSource();
			var aFilterArray = oSmartFilterBar.getFilters();
			var oOpportunityData = mApp.getProperty("/pages/Opportunity/opportunityData");
			var oThen = function () {
				oVBox.setBusy(false);
			};

			// TODO: Better logic:
			if (aFilterArray.length > 0) {
				if (aFilterArray[0].aFilters.length === 1) {
					aFilterArray[0].aFilters = aFilterArray[0].aFilters.filter(function (f) {
						return f.sPath !== "Equipment" && f.sPath !== "FleetVin";
					});
				} else {
					aFilterArray[0].aFilters = aFilterArray[0].aFilters.filter(function (f) {
						return f.aFilters[0].sPath !== "Equipment" && f.aFilters[0].sPath !== "FleetVin";
					});
				}
			}

			if (aFilterArray[0].aFilters.length === 0) {
				aFilterArray = [];
			}

			aFilterArray.push(new sap.ui.model.Filter({
				path: "MaterialSalesOrg",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oOpportunityData.s4_sales_org
			}));
			aFilterArray.push(new sap.ui.model.Filter({
				path: "MaterialDistributionChnl",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: oOpportunityData.dis_channel
			}));

			oModel.read("/ZAE_I_SalesMaterial", {
				filters: aFilterArray,
				success: function (data) {
					var oMaterialList = data.results;

					oAttachment.setUseBatch(true);
					oAttachment.setDeferredGroups(["materialImage"]);
					var oThen2 = function () {
						oAttachment.setUseBatch(false);
					};
					// var oLater2 = function () {
					// 	mApp.setProperty("/pages/isBusy", false);
					// };

					oMaterialList.forEach(function (m) {
						oAttachment.read("/GetAllOriginals", {
							urlParameters: {
								"$filter": "Filename eq 'MAIN.png'",
								ObjectType: "'BUS1001006'",
								ObjectKey: "'" + m.Material + "'",
								SemanticObjectType: "''",
								IsDraft: "false"
							},
							groupId: "materialImage"
						});
					});

					oAttachment.submitChanges({
						groupId: "materialImage",
						success: function (data1) {

							oThen2();

							var imagesArray = data1.__batchResponses;

							if (that.isResponseValid(imagesArray)) {

								oMaterialList = oMaterialList.map(function (m, i) {
									var image = data1.__batchResponses[i].data.results;
									image = image.filter(function (f) {
										return (f.Filename === "MAIN.png");
									})[0];

									return _.merge(m, {
										mediaSrc: image !== undefined ? image.__metadata.media_src : "https://i.ibb.co/5kkWFT1/DFLT.png"
									});
								});

								mApp.setProperty("/pages/Material/materialList", oMaterialList);
								// oThen();

								// oLater2();

							} else {
								that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Opportunity"),
									that.getView().getModel("i18n").getResourceBundle().getText("UNABLE_LOAD_ATTCH"),
									that.getView().getModel("i18n").getResourceBundle().getText("Error")
								);
							}

						},
						error: function (error) {
							oThen2();

							that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Opportunity"),
								that.getView().getModel("i18n").getResourceBundle().getText("UNABLE_LOAD_ATTCH"),
								that.getView().getModel("i18n").getResourceBundle().getText("Error")
							);
						}
					});

					var filters = [];
					var top = 500;

					if (oMaterialList.length > 0) {
						oMaterialList.forEach(function (m) {
							filters.push(new sap.ui.model.Filter({
								path: "Material",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: m.Material
							}));
						});
					} else {
						top = 0;
					}

					var aFilterItems = oSmartFilterBar.getFilterGroupItems();

					var aEquipmentFilterArray = aFilterItems.filter(function (f) {
						return f.getName() === "Equipment";
					});
					var aEquipmentFilter = aEquipmentFilterArray[0];
					var oEquipmentInputControl = oSmartFilterBar.determineControlByFilterItem(aEquipmentFilter);
					var oEquipment = oEquipmentInputControl.getValue();
					if (oEquipment !== "") {
						filters.push(new sap.ui.model.Filter({
							path: "Equipment",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: oEquipment
						}));
					}

					var aVINFilterArray = aFilterItems.filter(function (f) {
						return f.getName() === "FleetVin";
					});
					var aVINFilter = aVINFilterArray[0];
					var oVINInputControl = oSmartFilterBar.determineControlByFilterItem(aVINFilter);
					var oVIN = oVINInputControl.getValue();
					if (oVIN !== "") {
						filters.push(new sap.ui.model.Filter({
							path: "FleetVin",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: oVIN
						}));
					}

					oModel.read("/ZAE_I_Equipment_05", {
						filters: filters,
						urlParameters: {
							"$top": top.toString(),
							"$orderby": "Equipment desc"
						},
						success: function (data2) {

							var oEquipmentList = data2.results;
							mApp.setProperty("/pages/Material/equipmentList", oEquipmentList);

							var materialSubView = that.getView();
							var oEquiList = materialSubView.byId("equipmentList");

							oEquiList.clearSelection();

							oThen();
						},
						error: function (error) {
							//TODO: Handle Error

							this.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Opportunity"),
								that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadMaterialData"),
								that.getView().getModel("i18n").getResourceBundle().getText("Error"));
							// console.log(error);
							oThen();
						}
					});

				},
				error: function (error) {
					this.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Opportunity"),
						that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadMaterialData"),
						that.getView().getModel("i18n").getResourceBundle().getText("Error"));
					oThen();
				}
			});

		},

		onMaterialSelectionChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var oGridListItem = oEvent.getParameter("listItem");
			var oPath = oGridListItem.getBindingContextPath();
			var selectedMaterialData = mApp.getProperty(oPath);

			mApp.setProperty("/pages/Material/isNextEnabled", true);
			mApp.setProperty("/pages/Material/selectedMaterialData", selectedMaterialData);
		},

		onEquipmentSelectionChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var oRowContext = oEvent.getParameter("rowContext");
			if (oRowContext !== null) {
				var oPath = oRowContext.getPath();
				var selectedEquipmentData = mApp.getProperty(oPath);

				var materialList = mApp.getProperty("/pages/Material/materialList");
				var selectedMaterialData = materialList.filter(function (f) {
					return f.Material === selectedEquipmentData.Material;
				})[0];

				mApp.setProperty("/pages/Material/isNextEnabled", true);
				mApp.setProperty("/pages/Material/selectedMaterialData", selectedMaterialData);
				mApp.setProperty("/pages/Material/selectedEquipmentData", selectedEquipmentData);
			}
		}

	});

});