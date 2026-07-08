/* global _:true */
sap.ui.define([
	"./BaseController",
	"sap/ui/core/Fragment"
], function (BaseController, Fragment) {
	"use strict";
	var currentItempath = "/pages/Config/currentItem";
	var ConfigDataPath = "/pages/Config/materialConfigData/";
	return BaseController.extend("com.globalintelli.ZAE_SFQC.controller.Main", {
		onInit: function () {

			this.setupMessageManager();

			var mApp = this.getView().getModel("app");
			mApp.setSizeLimit(200);
		},
		onTabSelect: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var tabs = mApp.getProperty("/tabs");
			var currentStep = mApp.getProperty("/pages/currentStep");
			var selectedTab = oEvent.getParameters().key;
			var targetStep = tabs.indexOf(selectedTab);
			for (var i = currentStep; i > targetStep; i--) {
				switch (i) {
				case 0:
					break;

				case 1:

					mApp.setProperty(currentItempath, 0);
					mApp.setProperty("/cart", []);
					break;
				case 2:
					that.resetOverviewPage();
					break;
				default:
					break;
				}
			}

			// -- Tab Open Logic
			switch (targetStep) {
			case 0:
				break;

			case 1:
				var itemId = 0;
				mApp.setProperty(currentItempath, itemId);
				that._setupConfigPage(itemId);
				break;
			case 2:
				break;
			default:
				break;
			}

			mApp.setProperty("/pages/currentStep", targetStep);
		},

		onTypeChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var configData = mApp.getProperty("/pages/configData");

			var key = oEvent.getParameter("selectedItem").getKey();
			mApp.setProperty("/pages/Overview/type", key);
			var processTypeSelect = that.getView().byId("processType");
			processTypeSelect.bindItems({
				path: "app>/pages/Overview/" + key + "PaymentMethods",
				template: new sap.ui.core.ListItem({
					key: "{app>PaymentMethod}",
					text: "{app>PaymentMethodName}"
				})
			});

		},

		onProcessTypeChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");

			var paymentMethod = oEvent.getParameter("selectedItem").getKey();
			var configData = mApp.getProperty("/pages/configData");
			var paymentTerms = configData.paymentTermsData.filter(function (p) {
				return p.CustomerPaymentTerms.startsWith(configData["PaymentTerms" + paymentMethod]);
			});

			mApp.setProperty("/pages/Overview/paymentTerms", paymentTerms);

		},

		onOpportunityNext: function (oEvent) {
			var that = this;
			var oModel = that.getView().getModel();
			var oAttachment = that.getView().getModel("attachment");
			var mApp = that.getView().getModel("app");
			var configData = mApp.getProperty("/pages/configData");
			var currentStep = mApp.getProperty("/pages/currentStep");
			var params = mApp.getProperty("/params");
			var isOpportunityDataLoaded = mApp.getProperty("/pages/Opportunity/isOpportunityDataLoaded");
			var oOpportunityData = mApp.getProperty("/pages/Opportunity/opportunityData");
			var isUsed = configData.AppMode.charAt(0) === "U";

			if (isOpportunityDataLoaded) {
				mApp.setProperty("/pages/isBusy", true);

				var oThen = function () {
					mApp.setProperty("/pages/isBusy", false);
				};

				var filters = [];
				filters.push(new sap.ui.model.Filter({
					path: "MaterialSalesOrg",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oOpportunityData.s4_sales_org
				}));
				filters.push(new sap.ui.model.Filter({
					path: "MaterialDistributionChnl",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oOpportunityData.dis_channel
				}));

				oModel.read("/ZAE_I_SalesMaterial", {
					filters: filters,
					success: function (data) {
						var oMaterialList = data.results;

						if (oMaterialList.length !== 0) {

							oAttachment.setUseBatch(true);
							oAttachment.setDeferredGroups(["materialImage"]);
							var oThen2 = function () {
								oAttachment.setUseBatch(false);
							};
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

										if (isUsed) {

											filters = [];

											oMaterialList.forEach(function (m) {
												filters.push(new sap.ui.model.Filter({
													path: "Material",
													operator: sap.ui.model.FilterOperator.EQ,
													value1: m.Material
												}));
											});

											oModel.read("/ZAE_I_Equipment_05", {
												filters: filters,
												urlParameters: {
													"$top": "500",
													"$orderby": "Equipment desc"
												},
												success: function (data2) {

													var oEquipmentList = data2.results;
													mApp.setProperty("/pages/Material/equipmentList", oEquipmentList);

													var oIconTabBar = that.getView().byId("iconTabBar");
													var materialSubView = that.getView().byId("materialSubView");
													var oEquiList = materialSubView.byId("equipmentList");

													mApp.setProperty("/pages/currentStep", currentStep + 1);
													oIconTabBar.setSelectedKey("materialTab");

													oEquiList.clearSelection();

													oThen();
												},
												error: function (error) {
													//TODO: Handle Error
													that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
														that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadMaterialData"),
														that.getView().getModel("i18n").getResourceBundle().getText("Error"));
													oThen();
												}
											});

										} else {

											var oIconTabBar = that.getView().byId("iconTabBar");
											var materialSubView = that.getView().byId("materialSubView");
											var oGridList = materialSubView.byId("materialList");

											mApp.setProperty("/pages/currentStep", currentStep + 1);
											oIconTabBar.setSelectedKey("materialTab");

											oGridList.removeSelections(true);

											var oMaterialError = function () {

												// TODO: Handle Wrong Material
												that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
													that.getView().getModel("i18n").getResourceBundle().getText("Unabletoselect") +
													params.Material + that.getView().getModel(
														"i18n").getResourceBundle().getText("Material1"),
													that.getView().getModel("i18n").getResourceBundle().getText("Error"));

											};

											if (params.Material !== undefined && params.Material !== null) {

												mApp.setProperty("/pages/isBusy", true);

												var selectedMaterialData = oMaterialList.filter(function (m) {
													return m.Material === params.Material;
												})[0];

												if (selectedMaterialData !== undefined) {
													mApp.setProperty("/pages/Material/selectedMaterialData", selectedMaterialData);
													that.onMaterialNext();
												} else {
													oMaterialError();
													oThen();
												}

												params.Material = null;

												mApp.setProperty("/params", params);

											} else {
												oThen();
											}

										}

										// oLater2();

									} else {
										that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
											that.getView().getModel("i18n").getResourceBundle().getText("UNABLE_LOAD_ATTCH"),
											that.getView().getModel("i18n").getResourceBundle().getText("Error")
										);
									}

								},
								error: function (error) {
									oThen2();
									that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
										that.getView().getModel("i18n").getResourceBundle().getText("UNABLE_LOAD_ATTCH"),
										that.getView().getModel("i18n").getResourceBundle().getText("Error")
									);
									//TODO: error loading images

									// oLater2();
								}
							});

						} else {
							that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
								that.getView().getModel("i18n").getResourceBundle().getText("NoMaterialsavailable"),
								that.getView().getModel("i18n").getResourceBundle().getText("Error")
							);

							oThen();
						}
					},
					error: function (error) {
						//TODO: Handle Error
						that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
							that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadMaterialData"),
							that.getView().getModel("i18n").getResourceBundle().getText("Error"));

						// console.log(error);
						oThen();
					}
				});

			}
		},

		onMaterialNext: function (oEvent) {

			var that = this;
			var oModel = that.getView().getModel();
			var oPrice02Model = that.getView().getModel("price02");

			var mApp = that.getView().getModel("app");
			var usageCount = mApp.getProperty("/usageCount");
			var currentStep = mApp.getProperty("/pages/currentStep");
			var configData = mApp.getProperty("/pages/configData");
			var selectedMaterialData = mApp.getProperty("/pages/Material/selectedMaterialData");
			var selectedEquipmentData = mApp.getProperty("/pages/Material/selectedEquipmentData");
			var opportunityData = mApp.getProperty("/pages/Opportunity/opportunityData");
			var SalesOrganization = mApp.getProperty("/pages/Opportunity/SalesOrganization");
			var DistributionChannel = mApp.getProperty("/pages/Opportunity/DistributionChannel");
			var Division = mApp.getProperty("/pages/Opportunity/Division");
			var cart = mApp.getProperty("/cart");
			var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();

			var nextItem = cart.length;
			var MaterialAddOns = {};
			var Price02 = {};

			mApp.setProperty("/pages/isBusy", true);
			var oLater = function () {
				mApp.setProperty("/pages/isBusy", false);
			};

			oModel.setUseBatch(true);
			oModel.setDeferredGroups(["materialConfig"]);
			var oThen = function () {
				oModel.setUseBatch(false);
			};
			// -- Load Material AddOns
			var usageArr = [];
			var usageFilterStr = "";
			for (var i = 1; i <= usageCount; i++) {
				if (configData["Usage" + i] !== "") {
					usageArr.push(configData["Usage" + i]);
				}
			}

			if (usageArr.length === 0) {
				that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
					that.getView().getModel("i18n").getResourceBundle().getText("MissingUsageConfigurationpleaseupdateZAE_TC_CQTC"),
					that.getView().getModel("i18n").getResourceBundle().getText("Error"));
				return null;
			}

			usageArr.forEach(function (u, index, a) {
				usageFilterStr += "BillOfMaterialVariantUsage eq '" + u + "'";
				if (index < a.length - 1) {
					usageFilterStr += " or ";
				}
			});
			var filters = [];
			for (var i = 1; i <= usageCount; i++) {
				if (configData["Usage" + i] !== "") {
					filters.push(new sap.ui.model.Filter({
						path: "BillOfMaterialVariantUsage",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: configData["Usage" + i]
					}));
				}
			}
			filters.push(new sap.ui.model.Filter({
				path: "Material",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: selectedMaterialData.Model
			}));
			filters.push(new sap.ui.model.Filter({
				path: "Material",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: selectedMaterialData.Make
			}));
			filters.push(new sap.ui.model.Filter({
				path: "Plant",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: configData.BomPlant
			}));

			oModel.read("/ZAE_I_MaterialAddOns", {
				filters: filters,
				urlParameters: {
					"$orderby": "BillOfMaterialVariantUsage,BillOfMaterialComponentName"
				},
				success: function (data1) {

					oThen();

					var materialConfigData = data1.results;

					if (materialConfigData.length > 0) {

						MaterialAddOns.response = materialConfigData[0];
						var materialAddOnsRawData = materialConfigData;

						// -- Load Add On Material Pricing Data
						oPrice02Model.setUseBatch(true);
						oPrice02Model.setDeferredGroups(["addOnsPrice"]);
						var oThen2 = function () {
							oPrice02Model.setUseBatch(false);
						};

						materialAddOnsRawData.forEach(function (d) {
							// if (d.BillOfMaterialItemSortString !== "I") {
							oPrice02Model.create("/HEADER_DATA_P2Set", {
								"N_HEADER_DATA": [{
									"Matnr": d.BillOfMaterialComponent,
									"Vkorg": SalesOrganization,
									"Vtweg": DistributionChannel,
									"Make": Division,
									"Model": selectedMaterialData.Model
								}],
								"N_ITEM_DATA": [],
							}, {
								groupId: "addOnsPrice"
							});
							// }
						});

						materialAddOnsRawData = materialAddOnsRawData.map(function (a) {
							a.isFMPriceLoaded = false;
							return a;
						});
						mApp.setProperty("/pages/Config/materialConfigData", materialAddOnsRawData);
						that._fnGetPricingData();
						// oPrice02Model.submitChanges({
						// 	groupId: "addOnsPrice",
						// 	success: function (data4) {
						// 		oThen2();

						// 		if (data4["__batchResponses"]) {
						// 			Price02.data = data4.__batchResponses[0].__changeResponses;
						// 		}
						// 		if (data4["__batchResponses"] && that.isResponseValid(Price02.data)) {

						// 			var priceData = Price02.data.map(function (r) {
						// 				return _.merge(r.data.N_HEADER_DATA.results[0], r.data.N_ITEM_DATA.results[0]);
						// 			});

						// 			materialAddOnsRawData = materialAddOnsRawData.map(function (a) {
						// 				priceData.forEach(function (p) {
						// 					if (a.BillOfMaterialComponent === p.Matnr) {
						// 						a.fmPrice = p.Kbetr;
						// 						a.fmCurrency = p.Konwa;
						// 						a.isFMPriceLoaded = true;
						// 					}
						// 				});
						// 				return a;
						// 			});

						// 			var isAllPriceLoaded = true;
						// 			materialAddOnsRawData.forEach(function (a) {
						// 				if (!(a.isFMPriceLoaded)) {
						// 					isAllPriceLoaded = false;
						// 				}
						// 			});

						// 			if (isAllPriceLoaded) {

						// 				var addOnsUO = materialAddOnsRawData.map(function (b) {
						// 					return {
						// 						id: b.BillOfMaterialVariantUsage,
						// 						label: b.BillOfMaterialVariantUsageDesc,
						// 						// subid: b.BillOfMaterialItemSortString,
						// 						sublabel: b.BillOfMaterialItemSortStrName
						// 					};
						// 				});
						// 				addOnsUO = _.uniqWith(addOnsUO, _.isEqual);

						// 				var addOns = [];
						// 				for (var j = 1; j <= usageCount; j++) {
						// 					if (configData["Usage" + j] !== "") {
						// 						addOnsUO.filter(function (u) {
						// 							return u.id === configData["Usage" + j];
						// 						}).forEach(function (o) {
						// 							addOns.push(o);
						// 						});
						// 					}
						// 				}
						// 				//Removing SortString objects with Usuage type A
						// 				addOnsUO = addOnsUO.filter(function (u) {
						// 					if (u.id === "A" && u.subid !== "") {
						// 						return false;
						// 					} else {
						// 						return true;
						// 					}
						// 				});

						// 				addOns = addOns.map(function (a) {
						// 					if (_.isEmpty(a.subid)) {
						// 						return {
						// 							id: a.id,
						// 							label: a.label
						// 						};
						// 					}
						// 					return {
						// 						id: a.subid,
						// 						label: a.sublabel
						// 					};
						// 				});
						// 				addOns = addOns.map(function (a) {
						// 					var selType = "SEL";
						// 					if (a.id === "A" || a.id === "Z") {
						// 						selType = "CBM";
						// 					}

						// 					var options = [];
						// 					if (selType === "SEL") {
						// 						options.push({
						// 							key: null,
						// 							label: "\u00a0",
						// 							additionalText: "",
						// 							price: "0",
						// 							currency: "",
						// 							material: null,
						// 							selected: true,
						// 							qty: 1,
						// 							ogQty: 1,
						// 							uom: "",
						// 							mock: true
						// 						});
						// 					}

						// 					materialAddOnsRawData.forEach(function (b) {
						// 						if (b.BillOfMaterialVariantUsage === a.id || b.BillOfMaterialItemSortString === a.id) {

						// 							var qty = parseInt(b.BillOfMaterialItemQuantity, 10);
						// 							var subOptions = [];

						// 							if (selType === "CBM") {
						// 								for (var index = 1; index <= 10; index++) {
						// 									var t = index * qty;
						// 									subOptions.push({
						// 										key: t.toString(),
						// 										text: t.toString()
						// 									});
						// 								}
						// 							}

						// 							options.push({
						// 								label: b.BillOfMaterialComponentName,
						// 								material: b.BillOfMaterialComponent,
						// 								qty: b.BillOfMaterialItemQuantity,
						// 								ogQty: b.BillOfMaterialItemQuantity,
						// 								uom: b.BillOfMaterialItemUnit,
						// 								price: parseFloat(b.fmPrice),
						// 								currency: b.fmCurrency,
						// 								// TODO: Selected Logic for UI5
						// 								selected: b.BillOfMaterialComponentName === "Initial Registation",
						// 								data: b,
						// 								subOptions: subOptions,
						// 								mock: false
						// 							});
						// 						}
						// 					});
						// 					return _.merge(a, {
						// 						selType: selType,
						// 						options: options,
						// 						selectedKey: null
						// 					});
						// 				});

						// 				MaterialAddOns.data = addOns;

						// 				mApp.setProperty("/pages/currency", priceData[0].Konwa);
						// 				var kmPrd = mApp.getProperty("/pages/Config/kmPrd");
						// 				var maxKM = mApp.getProperty("/pages/Config/maxKM");
						// 				var mnPrd = mApp.getProperty("/pages/Config/mnPrd");
						// 				var maxMn = mApp.getProperty("/pages/Config/maxMn");

						// 				var fromKMOpts = [];
						// 				var toKMOpts = [];
						// 				var MNOpts = [];
						// 				var typeOpts = [];

						// 				var internationalNumberFormat = new Intl.NumberFormat('en-US');

						// 				for (var fkm = kmPrd; fkm <= maxKM - kmPrd; fkm += kmPrd) {
						// 					fromKMOpts.push({
						// 						key: fkm,
						// 						label: internationalNumberFormat.format(fkm) + " " + oResourceBundle.getText("KMs")
						// 					});
						// 				}

						// 				for (var tkm = kmPrd + kmPrd; tkm <= maxKM; tkm += kmPrd) {
						// 					toKMOpts.push({
						// 						key: tkm,
						// 						label: internationalNumberFormat.format(tkm) + " " + oResourceBundle.getText("KMs")
						// 					});
						// 				}

						// 				for (var mn = mnPrd; mn <= maxMn; mn += mnPrd) {
						// 					MNOpts.push({
						// 						key: mn,
						// 						label: mn + " " + oResourceBundle.getText("Months")
						// 					});
						// 				}

						// 				typeOpts = [{
						// 					key: "",
						// 					label: ""
						// 				}, {
						// 					key: "N",
						// 					label: oResourceBundle.getText("Normal")
						// 				}, {
						// 					key: "G",
						// 					label: oResourceBundle.getText("Gold")
						// 				}, {
						// 					key: "S",
						// 					label: oResourceBundle.getText("Silver")
						// 				}];

						// 				var date = new Date();
						// 				date = new Date(date.setHours(10));

						// 				//TODO: Check for data, no empty responses
						// 				var mcData = {

						// 					masterFromKMsOpts: fromKMOpts,
						// 					masterToKMsOpts: toKMOpts,
						// 					fromKMsOpts: {
						// 						sel: fromKMOpts[0].key,
						// 						data: fromKMOpts
						// 					},
						// 					toKMsOpts: {
						// 						sel: toKMOpts[0].key,
						// 						data: toKMOpts
						// 					},
						// 					MNOpts: {
						// 						sel: MNOpts[0].key,
						// 						data: MNOpts
						// 					},
						// 					typeOpts: {
						// 						sel: typeOpts[0].key,
						// 						data: typeOpts
						// 					},
						// 					MaterialAddOns: MaterialAddOns.data,
						// 					startDate: date,

						// 				};

						// 				var materialConfigDataArr = mApp.getProperty("/pages/Config/materialConfigData");
						// 				var materialData = mApp.getProperty("/pages/Config/materialData");
						// 				var equipmentData = mApp.getProperty("/pages/Config/equipmentData");
						// 				materialConfigDataArr[nextItem] = mcData;
						// 				materialData[nextItem] = selectedMaterialData;
						// 				equipmentData[nextItem] = selectedEquipmentData;

						// 				mApp.setProperty("/pages/Config/materialData", materialData);
						// 				mApp.setProperty("/pages/Config/equipmentData", equipmentData);
						// 				mApp.setProperty("/pages/Config/materialConfigData", materialConfigDataArr);

						// 				that._setupConfigPage(nextItem);

						// 				var oIconTabBar = that.getView().byId("iconTabBar");
						// 				mApp.setProperty("/pages/currentStep", currentStep + 1);
						// 				oIconTabBar.setSelectedKey("configTab");

						// 			} else {
						// 				that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
						// 					that.getView().getModel("i18n").getResourceBundle().getText("AddOnPricingMissing"),
						// 					that.getView().getModel("i18n").getResourceBundle().getText("Error"));

						// 			}

						// 		} else {

						// 			that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
						// 				that.getView().getModel("i18n").getResourceBundle().getText("AddOnPricingMissing"),
						// 				that.getView().getModel("i18n").getResourceBundle().getText("Error"));

						// 		}

						// 		oLater(); // -- from before

						// 	},
						// 	error: function (error) {
						// 		oThen2();

						// 		//TODO: Handle Error

						// 		that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
						// 			that.getView().getModel("i18n").getResourceBundle().getText("AddOnPricingMissing"),
						// 			that.getView().getModel("i18n").getResourceBundle().getText("Error"));
						// 		console.log(error);

						// 		oLater(); // -- from before
						// 	}
						// });

					} else {

						//TODO: Handle Error

						sap.m.MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("MaterialAddons"));

						oLater(); // -- from before
					}

				},
				error: function (error) {
					oThen();
					that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
						that.getView().getModel("i18n").getResourceBundle().getText("UnabletoloadColourTrimYearAddOnsorMaterialPricedata"),
						that.getView().getModel("i18n").getResourceBundle().getText("Error"));
					console.log(error);

					oLater();
				}
			});
		},
		_fnGetPricingData: function () {
			var that = this;
			var mApp = that.getView().getModel("app");
			var usageCount = mApp.getProperty("/usageCount");
			var currentStep = mApp.getProperty("/pages/currentStep");
			var oPriceModel = that.getView().getModel("ZAE_FM_DOC_SIMULATE_GET_PRICE");
			var materialConfigDataArr = mApp.getProperty("/pages/Config/materialConfigData");
			var opportunityData = mApp.getProperty("/pages/Opportunity");
			var type = mApp.getProperty("/pages/Overview/type");
			var configData = mApp.getProperty("/pages/configData");
			var overviewData = mApp.getProperty("/pages/Overview");
			var selectedMaterialData = mApp.getProperty("/pages/Material/selectedMaterialData");
			var selectedEquipmentData = mApp.getProperty("/pages/Material/selectedEquipmentData");
			var sSet = "/ZAE_FM_DOC_SIMULATE_GET_PRICESet";
			var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
			var cart = mApp.getProperty("/cart");
			var nextItem = cart.length;
			var MaterialAddOns = {};
			var postData = {
				"NavPriceMain": [{
					"Customer": opportunityData.Customer,
					"DistrChan": opportunityData.DistributionChannel,
					"Division": opportunityData.Division,
					"DocType": configData[type + overviewData.selPaymentMethod],
					"SalesGrp": opportunityData.SalesGroup,
					"SalesOff": opportunityData.SalesOffice,
					"SalesOrg": opportunityData.SalesOrganization,
					"IsService": true
				}],
				"NavPriceItemsIn": [
					// 	{
					// 	"Posnr": "10".toString().padStart(6, "0"),
					// 	"HighItem": "",
					// 	"Material": objMaterial.Material
					// 		// ,
					// 		// "Plant": opportunityData.plant
					// }
				],
				"NavPriceItemsOut": []
			};
			materialConfigDataArr.forEach(function (objMaterial, index1, a1) {
				var oDataAddOns = {
					"Posnr": ((index1 + 1) * 10).toString().padStart(6, "0"),
					"HighItem": "0",
					"Material": objMaterial.BillOfMaterialComponent
						// ,
						// "Plant": opportunityData.plant
				};
				postData.NavPriceItemsIn.push(oDataAddOns);

				// oPriceModel.create(sSet,
				// 	postData, {
				// 		groupId: "_PriceData"
				// 	});
			});

			oPriceModel.create(sSet, postData, {
				success: function (data3) {
					mApp.setProperty("/pages/isBusy", false);
					var priceData = data3.NavPriceItemsOut.results;
					if (priceData.length > 0) {
						materialConfigDataArr = mApp.getProperty("/pages/Config/materialConfigData");
						materialConfigDataArr = materialConfigDataArr.map(function (a) {
							var MaterialPrice = priceData.find(function (obj) {
								return obj.Material === a.BillOfMaterialComponent
							});
							if (MaterialPrice) {
								a.fmPrice = MaterialPrice.NetPrice;
								a.fmCurrency = MaterialPrice.Currency;
								a.isFMPriceLoaded = true;
							}
							return a;
						});

						var isAllPriceLoaded = true;
						materialConfigDataArr.forEach(function (a) {
							if (!(a.isFMPriceLoaded)) {
								isAllPriceLoaded = false;
							}
						});

						if (isAllPriceLoaded) {

							var addOnsUO = materialConfigDataArr.map(function (b) {
								return {
									id: b.BillOfMaterialVariantUsage,
									label: b.BillOfMaterialVariantUsageDesc,
									// subid: b.BillOfMaterialItemSortString,
									sublabel: b.BillOfMaterialItemSortStrName
								};
							});
							addOnsUO = _.uniqWith(addOnsUO, _.isEqual);

							var addOns = [];
							for (var j = 1; j <= usageCount; j++) {
								if (configData["Usage" + j] !== "") {
									addOnsUO.filter(function (u) {
										return u.id === configData["Usage" + j];
									}).forEach(function (o) {
										addOns.push(o);
									});
								}
							}
							//Removing SortString objects with Usuage type A
							addOnsUO = addOnsUO.filter(function (u) {
								if (u.id === "A" && u.subid !== "") {
									return false;
								} else {
									return true;
								}
							});

							addOns = addOns.map(function (a) {
								if (_.isEmpty(a.subid)) {
									return {
										id: a.id,
										label: a.label
									};
								}
								return {
									id: a.subid,
									label: a.sublabel
								};
							});
							addOns = addOns.map(function (a) {
								var selType = "SEL";
								if (a.id === "A" || a.id === "Z") {
									selType = "CBM";
								}

								var options = [];
								if (selType === "SEL") {
									options.push({
										key: null,
										label: "\u00a0",
										additionalText: "",
										price: "0",
										currency: "",
										material: null,
										selected: true,
										qty: 1,
										ogQty: 1,
										uom: "",
										mock: true
									});
								}

								materialConfigDataArr.forEach(function (b) {
									if (b.BillOfMaterialVariantUsage === a.id || b.BillOfMaterialItemSortString === a.id) {

										var qty = parseInt(b.BillOfMaterialItemQuantity, 10);
										var subOptions = [];

										if (selType === "CBM") {
											for (var index = 1; index <= 10; index++) {
												var t = index * qty;
												subOptions.push({
													key: t.toString(),
													text: t.toString()
												});
											}
										}

										options.push({
											label: b.BillOfMaterialComponentName,
											material: b.BillOfMaterialComponent,
											qty: b.BillOfMaterialItemQuantity,
											ogQty: b.BillOfMaterialItemQuantity,
											uom: b.BillOfMaterialItemUnit,
											price: parseFloat(b.fmPrice),
											currency: b.fmCurrency,
											// TODO: Selected Logic for UI5
											selected: b.BillOfMaterialComponentName === "Initial Registation",
											data: b,
											subOptions: subOptions,
											mock: false
										});
									}
								});
								return _.merge(a, {
									selType: selType,
									options: options,
									selectedKey: null
								});
							});

							MaterialAddOns.data = addOns;

							mApp.setProperty("/pages/currency", materialConfigDataArr.fmCurrency);
							var kmPrd = mApp.getProperty("/pages/Config/kmPrd");
							var maxKM = mApp.getProperty("/pages/Config/maxKM");
							var mnPrd = mApp.getProperty("/pages/Config/mnPrd");
							var maxMn = mApp.getProperty("/pages/Config/maxMn");

							var fromKMOpts = [];
							var toKMOpts = [];
							var MNOpts = [];
							var typeOpts = [];

							var internationalNumberFormat = new Intl.NumberFormat('en-US');

							// for (var fkm = kmPrd; fkm <= maxKM - kmPrd; fkm += kmPrd) {
							// 	fromKMOpts.push({
							// 		key: fkm,
							// 		label: internationalNumberFormat.format(fkm) + " " + oResourceBundle.getText("KMs")
							// 	});
							// }

							// for (var tkm = kmPrd + kmPrd; tkm <= maxKM; tkm += kmPrd) {
							// 	toKMOpts.push({
							// 		key: tkm,
							// 		label: internationalNumberFormat.format(tkm) + " " + oResourceBundle.getText("KMs")
							// 	});
							// }

							for (var mn = mnPrd; mn <= maxMn; mn += mnPrd) {
								MNOpts.push({
									key: mn,
									label: mn + " " + oResourceBundle.getText("Months")
								});
							}

							typeOpts = [{
								key: "",
								label: ""
							}, {
								key: "N",
								label: oResourceBundle.getText("Normal")
							}, {
								key: "G",
								label: oResourceBundle.getText("Gold")
							}, {
								key: "S",
								label: oResourceBundle.getText("Silver")
							}];

							var date = new Date();
							date = new Date(date.setHours(10));

							//TODO: Check for data, no empty responses
							var mcData = {

								// masterFromKMsOpts: fromKMOpts,
								// masterToKMsOpts: toKMOpts,
								// fromKMsOpts: {
								// 	sel: fromKMOpts[0].key,
								// 	data: fromKMOpts
								// },
								// toKMsOpts: {
								// 	sel: toKMOpts[0].key,
								// 	data: toKMOpts
								// },
								MNOpts: {
									sel: MNOpts[0].key,
									data: MNOpts
								},
								typeOpts: {
									sel: typeOpts[0].key,
									data: typeOpts
								},
								MaterialAddOns: MaterialAddOns.data,
								startDate: date,

							};

							var materialConfigDataArr = mApp.getProperty("/pages/Config/materialConfigData");
							var materialData = mApp.getProperty("/pages/Config/materialData");
							var equipmentData = mApp.getProperty("/pages/Config/equipmentData");
							materialConfigDataArr[nextItem] = mcData;
							materialData[nextItem] = selectedMaterialData;
							equipmentData[nextItem] = selectedEquipmentData;

							mApp.setProperty("/pages/Config/materialData", materialData);
							mApp.setProperty("/pages/Config/equipmentData", equipmentData);
							mApp.setProperty("/pages/Config/materialConfigData", materialConfigDataArr);

							that._setupConfigPage(nextItem);

							var oIconTabBar = that.getView().byId("iconTabBar");
							mApp.setProperty("/pages/currentStep", currentStep + 1);
							oIconTabBar.setSelectedKey("configTab");

						} else {
							that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
								that.getView().getModel("i18n").getResourceBundle().getText("AddOnPricingMissing"),
								that.getView().getModel("i18n").getResourceBundle().getText("Error"));

						}
					}

				}.bind(this),
				error: function (error) {
					mApp.setProperty("/pages/isBusy", false);
					that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Material1"),
						that.getView().getModel("i18n").getResourceBundle().getText("AddOnPricingMissing"),
						that.getView().getModel("i18n").getResourceBundle().getText("Error"));

				}
			});

		},

		onConfigNext: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var cart = mApp.getProperty("/cart");
			var configSubView = that.getView().byId("configSubView");
			var currentStep = mApp.getProperty("/pages/currentStep");
			var currentItem = mApp.getProperty(currentItempath);
			var overviewSubView = that.getView().byId("overviewSubView");
			var oExpStartDate = configSubView.byId("DP1").getValue();
			if (oExpStartDate === "") {
				return;
			}

			var cartItem = that._genCartItem(currentItem);
			cart[currentItem] = cartItem;

			var totalPrice = that._calTotalPrice(cart);

			mApp.setProperty("/cart", cart);
			mApp.setProperty("/pages/Overview/totalPrice", totalPrice);

			overviewSubView.byId("cartTable").getModel("app").refresh(true);

			var oIconTabBar = that.getView().byId("iconTabBar");
			mApp.setProperty("/pages/currentStep", currentStep + 1);
			oIconTabBar.setSelectedKey("overviewTab");
		},

		onOverviewSubmit: function (oEvent) {
			var that = this;
			// var oModel = that.getView().getModel();
			var oQuotation = that.getView().getModel("quotationCreate");
			// var oInquiry = that.getView().getModel("inquiryCreate");
			var oNotif = that.getView().getModel("notifCreate");
			var mApp = that.getView().getModel("app");
			var configData = mApp.getProperty("/pages/configData");
			var cart = mApp.getProperty("/cart");
			var overviewData = mApp.getProperty("/pages/Overview");
			var type = mApp.getProperty("/pages/Overview/type");
			var opportunityData = mApp.getProperty("/pages/Opportunity/opportunityData");
			var OpportunityNumber = mApp.getProperty("/pages/Opportunity/OpportunityNumber");
			var currentStep = mApp.getProperty("/pages/currentStep");
			var isLease = configData.AppMode.charAt(0) === "L";
			var overviewSubView = that.getView().byId("overviewSubView");
			var oVBox = overviewSubView.byId("overviewVBox");
			var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
			var oThen = function () {
				oVBox.setBusy(false);
			};
			oVBox.setBusy(true);

			var oPost = null;
			var oType = "U";
			// if (type === "Quotation") {
			oPost = oQuotation;
			// } else {
			// 	oPost = oInquiry;
			// 	oType = "I";
			// }

			var createData = that._genCreateData(type, configData, cart, opportunityData, overviewData);

			oPost.create("/QuotationHeaderInSet", createData, {
				success: function (data) {

					var confirmationData = {
						type: isLease === true ? "L" : oType,
						message: oResourceBundle.getText("Documentsucessfullygenerated"),
						document: ""
					};

					var oLater2 = function () {
						var response = data.N_Return.results.filter(function (n) {
							return n.Id === "V1" && n.MessageV2 !== "";
						})[0];
						if (response !== undefined) {
							confirmationData.message = response.Message;
							confirmationData.document = response.MessageV2;
						}

						mApp.setProperty("/pages/Confirmation/data", confirmationData);

						var oIconTabBar = that.getView().byId("iconTabBar");
						mApp.setProperty("/pages/currentStep", currentStep + 1);
						oIconTabBar.setSelectedKey("confirmationTab");
					};

					oThen();
					oLater2();
					// }

				},
				error: function (error) {
					oThen();
					// that.showMessage(that.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
					// 	that.getView().getModel("i18n").getResourceBundle().getText("UNABLE_LOAD_QTN"),
					// 	that.getView().getModel("i18n").getResourceBundle().getText("Error")
					// );
				}
			});

		},

		_setupConfigPage: function (itemId) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var materialConfigData = mApp.getProperty("/pages/Config/materialConfigData")[itemId];
			var SelectKms = mApp.getProperty("/pages/Opportunity/opportunityData/to_KiloMeterReadings/results")[itemId];
			// var oConfigData = mApp.getProperty("/pages/configData");
			// var isLease = oConfigData.AppMode.charAt(0) === "L";

			var configSubView = that.getView().byId("configSubView");
			var configController = configSubView.getController();
			var materialConfigVBox = configSubView.byId("materialConfigVBox");
			materialConfigVBox.setBusy(true);

			// -- Char Panel Setup
			var yearSelect = configSubView.byId("tenureSelect");
			var typeSelect = configSubView.byId("typeSelect");
			var colourSelect = configSubView.byId("fromkmsSelect");
			var trimSelect = configSubView.byId("tokmsSelect");
			var dateSelect = configSubView.byId("DP1");

			yearSelect.bindItems({
				path: "app>/pages/Config/materialConfigData/" + itemId + "/MNOpts/data",
				template: new sap.ui.core.ListItem({
					key: "{app>key}",
					text: "{app>label}"
				})
			});
			yearSelect.setSelectedKey(mApp.getProperty(ConfigDataPath + itemId + "/MNOpts/sel"));

			colourSelect.bindItems({
				// path: "app>/pages/Config/materialConfigData/" + itemId + "/fromKMsOpts/data",
				path: "app>/pages/Opportunity/opportunityData/to_KiloMeterReadings/results",
				template: new sap.ui.core.ListItem({
					key: "{app>Msitem}",
					text: "{app>MsitemText}",
					additionalText: "{app>SortKey}"
				})
			});
			// colourSelect.setSelectedKey(mApp.getProperty(ConfigDataPath + itemId + "/fromKMsOpts/sel"));
			colourSelect.setSelectedKey("1K");

			trimSelect.bindItems({
				path: "app>/pages/Opportunity/opportunityData/to_KiloMeterReadings/results",
				template: new sap.ui.core.ListItem({
					key: "{app>Msitem}",
					text: "{app>MsitemText}",
					additionalText: "{app>SortKey}"
				})
			});
			// trimSelect.setSelectedKey(mApp.getProperty(ConfigDataPath + itemId + "/toKMsOpts/sel"));
			trimSelect.setSelectedKey("10K");

			typeSelect.bindItems({
				path: "app>/pages/Config/materialConfigData/" + itemId + "/typeOpts/data",
				template: new sap.ui.core.ListItem({
					key: "{app>key}",
					text: "{app>label}"
				})
			});
			typeSelect.setSelectedKey(mApp.getProperty(ConfigDataPath + itemId + "/typeOpts/sel"));

			dateSelect.setDateValue(materialConfigData.startDate);

			// -- Config Panel Setup
			var addOnsData = materialConfigData.MaterialAddOns;
			var configPanel = configSubView.byId("configPanel");
			configPanel.destroyContent();

			addOnsData.forEach(function (a, i1) {
				if (a.selType === "CBM") {
					a.options.forEach(function (o, i2) {
						configPanel.addContent(that._genCBMControl("app>/pages/Config/materialConfigData/" +
							itemId + "/MaterialAddOns/" + i1 + "/options", configSubView, o, o.material + "-" + i2, i2));
					});
				} else if (a.selType === "SEL") {
					configPanel.addContent(that._genSELControl("app>/pages/Config/materialConfigData/" +
						itemId + "/MaterialAddOns/" + i1, configSubView, a, a.id));
				}
			});

			configController.calculatePrice();
			configController.isSubmitEnabled();

			materialConfigVBox.setBusy(false);
		},

		_genCBMControl: function (pre, view, data, id, index) {
			var that = this;
			var configController = view.getController();

			var s = new sap.m.Select(view.createId("s" + id), {
				width: "70px",
				selectedKey: "{" + pre + "/" + index + "/qty}",
				enabled: "{" + pre + "/" + index + "/selected}",
				items: {
					path: pre + "/" + index + "/subOptions",
					template: new sap.ui.core.ListItem({
						key: "{app>key}",
						text: "{app>text}"
					})
				},
				change: function () {
					configController.onConfigChange();
					configController.isSubmitEnabled();
				}
			});
			s.addStyleClass("sapUiMediumMarginBegin");
			var t = new sap.m.Text(view.createId("t" + id), {
				text: {
					parts: [pre + "/" + index + "/price", pre + "/" + index + "/currency", pre + "/" + index + "/qty", pre + "/" + index + "/ogQty"],
					formatter: that.formatter.configCBMPriceText
				}
			});
			var h = new sap.m.HBox(view.createId("h" + id), {
				justifyContent: "SpaceBetween",
				alignItems: "Center"
			});
			h.addItem(s);
			h.addItem(t);
			var c = new sap.m.CheckBox(view.createId("c" + id), {
				text: "{" + pre + "/" + index + "/label}",
				selected: "{" + pre + "/" + index + "/selected}",
				select: function (oEvent) {
					configController.onConfigChange();
					configController.isSubmitEnabled();
				},
				wrapping: true
			});
			var v = new sap.m.VBox(view.createId("v" + id));
			v.addItem(c);
			v.addItem(h);
			return v;
		},

		_genSELControl: function (pre, view, data, id) {
			var that = this;
			var configController = view.getController();
			var sId = view.createId("s" + id);

			var l = new sap.m.Label(view.createId("l" + id), {
				text: "{" + pre + "/label}",
				labelFor: sId
			});
			var s = new sap.m.Select(sId, {
				width: "100%",
				selectedKey: "{" + pre + "/selectedKey}",
				showSecondaryValues: true,
				items: {
					path: pre + "/options",
					template: new sap.ui.core.ListItem({
						key: "{app>material}",
						text: "{app>label}",
						additionalText: "{app>material}"
					})
				},
				change: function (oEvent) {

					var mApp = that.getView().getModel("app");
					var selectPath = oEvent.getSource().getBindingPath("items");
					var selectData = mApp.getProperty(selectPath);
					var itemData = mApp.getProperty(oEvent.getParameter("selectedItem").getBindingContext("app").sPath);
					mApp.setProperty("/pages/currency", itemData.currency);

					selectData = selectData.map(function (d) {
						if (d.material === itemData.material) {
							d.selected = true;
						} else {
							d.selected = false;
						}
						return d;
					});

					mApp.setProperty(selectPath, selectData);

					var configSubView = that.getView().byId("configSubView");
					var typeSelect = configSubView.byId("typeSelect");

					var smType = itemData.material !== null ? itemData.data.BillOfMaterialItemSortString : "";
					var currentItem = mApp.getProperty(currentItempath);
					mApp.setProperty(ConfigDataPath + currentItem + "/typeOpts/sel", smType);
					typeSelect.setSelectedKey(smType);

					configController.onConfigChange();
					configController.isSubmitEnabled();
				}
			});
			// s.addStyleClass("sapUiSmallMarginBottom");
			var v = new sap.m.VBox(view.createId("v" + id));
			v.addStyleClass("sapUiSmallMarginTopBottom");
			v.addItem(l);
			v.addItem(s);
			return v;
		},

		_genCartItem: function (itemIndex) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var tax = mApp.getProperty("/tax");
			var price = mApp.getProperty("/pages/Config/price");
			var materialConfigData = mApp.getProperty("/pages/Config/materialConfigData")[itemIndex];
			var materialData = mApp.getProperty("/pages/Config/materialData")[itemIndex];
			var equipmentData = mApp.getProperty("/pages/Config/equipmentData")[itemIndex];
			var basePrice = 0;
			var addOnsPrice = price - basePrice;
			var qty = 1;
			var configSubView = that.getView().byId("configSubView");
			// var noOfMonths = 0;
			var addOns = [];

			materialConfigData.MaterialAddOns.forEach(function (a) {

				if (a.selType === "CBM") {
					a.options.forEach(function (d) {
						if (d.selected && d.mock === false) {
							var iCBM = {
								Material: d.material,
								TargetQty: d.qty * qty,
								TargetQu: d.uom,
								Description: d.label,
								Price: d.price * d.qty * qty,
								basePrice: d.price,
								Currency: d.currency,
								info: d,
							};
							addOns.push(iCBM);
						}
					});
				}

				if (a.selType === "SEL") {
					a.options.forEach(function (d) {
						if (d.selected && d.mock === false) {
							var Price = d.price * d.qty * qty;
							var iSEL = {
								Material: d.material,
								TargetQty: d.qty * qty,
								TargetQu: d.uom,
								Description: d.label,
								Price: Price,
								basePrice: d.price,
								Currency: d.currency,
								info: d,
							};
							addOns.push(iSEL);
						}
					});
				}
			});
			// }

			var taxPrice = price * tax / 100;
			var netPrice = price + taxPrice;
			var fromkms = configSubView.byId("fromkmsSelect").getSelectedItem().getText().replace("Service", "");
			var to = configSubView.byId("tokmsSelect").getSelectedItem().getText().replace("Service", "");
			// var from = parseInt(configSubView.byId("fromkmsSelect").getSelectedItem()..getText());
			// if (!isNaN(from)) {
			// 	from *= 1000;
			// } else {
			// 	from = 0;
			// }
			// var to = parseInt(configSubView.byId("tokmsSelect").getSelectedItem().getAdditionalText());
			// if (!isNaN(to)) {
			// 	to *= 1000;
			// } else {
			// 	to = 0;
			// }
			var mns = materialConfigData.MNOpts.sel;
			var type = materialConfigData.typeOpts.sel;
			var typeText = materialConfigData.typeOpts.data.filter(function (f) {
				return f.key === type;
			})[0].label;

			if (type === "N") {
				typeText = "";
			} else {
				typeText += " ";
			}

			var internationalNumberFormat = new Intl.NumberFormat('en-US');

			//"Extended Service Contract - " +
			var SText = typeText + mns.toString() + " MTHs " + fromkms + "to " + to;

			var cartData = {
				id: itemIndex,
				qty: qty,
				tempQty: qty,
				materialData: materialData,
				equipmentData: equipmentData,
				addOns: addOns,
				// noOfMonths: noOfMonths,
				cartPrice: price,
				taxPrice: taxPrice,
				netPrice: netPrice,
				addOnsPrice: addOnsPrice,
				serviceDesc: SText,
				from: fromkms.replace(/[^0-9]/g, ""),
				to: to.replace(/[^0-9]/g, ""),
				mns: mns,
				type: type,
				startdate: materialConfigData.startDate,
			};

			return cartData;
		},

		_genCreateData: function (type, configData, cart, opportunityData, overviewData) {
			var that = this;
			// TODO: REMOVE DEPENDENCY ON SID

			var sid = undefined;
			try {
				sid = sap.ushell.Container.getLogonSystem()._oData.system;
			} catch (e) {
				sid = undefined;
			}
			var mApp = that.getView().getModel("app");
			var params = mApp.getProperty("/params");
			var isLease = configData.AppMode.charAt(0) === "L";
			var isUsed = configData.AppMode.charAt(0) === "U";
			var Equipment = mApp.getProperty("/pages/Opportunity/Equipment");
			var SalesOrganization = mApp.getProperty("/pages/Opportunity/SalesOrganization");
			var DistributionChannel = mApp.getProperty("/pages/Opportunity/DistributionChannel");
			var Division = mApp.getProperty("/pages/Opportunity/Division");
			var SalesOffice = mApp.getProperty("/pages/Opportunity/SalesOffice");
			var Customer = mApp.getProperty("/pages/Opportunity/Customer");
			var ConstDate = "/Date(" + mApp.getData().cart[0].startdate.getTime() + ")/";
			var OpportunityNumber = mApp.getProperty("/pages/Opportunity/OpportunityNumber");

			var now = new Date();
			var data = {
				N_QuotationHeaderIn: [],
				N_QuotationHeaderInx: [],
				N_QuotationPartners: [],
				N_QuotationItemsIn: [],
				N_QuotationItemsInx: [],
				N_QuotationSchedulesIn: [],
				N_QuotationSchedulesInx: [],
				N_QuotationCfgsRef: [],
				N_QuotationCfgsInst: [],
				N_QuotationCfgsValue: [],
				N_ContractDataIn: [],
				N_ContractDataInX: [],
				N_QuotationConditionsIn: [],
				N_QuotationConditionsInx: [],
				N_Serials: []
			};
			var sData = {};
			var xData = {};
			var sDataArray = [];
			var xDataArray = [];
			var itemCount = 0;
			var currMainItem = 0;
			var exParams = [];

			// var insurance = {
			// 	has: false
			// };

			// ---------------------------------------- Header Data
			sDataArray = [];
			xDataArray = [];
			var qtValidTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
			sData = {
				// Opportunity: opportunityData.Opportunity,
				// BehaveWhenError: "P",
				DocType: configData[type + overviewData.selPaymentMethod],
				QtValidT: that.dateToSrvFormat(qtValidTo),
				SalesOrg: SalesOrganization,
				Division: Division,
				DistrChan: DistributionChannel,
				SalesOff: SalesOffice,
				Pmnttrms: overviewData.selPaymentTerms,
				ReqDateH: that.dateToSrvFormat(now),
				// DownPayment: overviewData.downPaymentAmount.value.toString(),
				PurchNoC: overviewData.customerReference, // CollectNo: 'C12345',
				ToKms: cart[0].to.toString(),
				FromKms: cart[0].from.toString(),
				ContType: cart[0].type,
				FonCtype: configData["QuotationCredit"]
			};

			if (OpportunityNumber) {
				sData.Opportunity = OpportunityNumber;
			}

			sDataArray.push(sData);
			data.N_QuotationHeaderIn = sDataArray;

			// -------------------- Header X Data
			// "Opportunity", 
			exParams = ["BehaveWhenError", "Auart", "DownPayment", "ToKms", "FromKms", "ContType", "FonCtype", "Opportunity"];
			xData = {
				Updateflag: "C"
			};

			_.keys(sDataArray[0]).forEach(function (k) {
				if (!_.includes(exParams, k)) {
					xData[k] = "X";
				}
			});

			xDataArray.push(xData);
			data.N_QuotationHeaderInx = xDataArray;

			// ---------------------------------------- Partner Data
			sDataArray = [];
			xDataArray = [];

			// ---------- Payer (Ship to Party) Data
			sData = {
				PartnRole: "SP",
				PartnNumb: Customer
			};
			sDataArray.push(sData);

			data.N_QuotationPartners = sDataArray;

			// ---------------------------------------- Item Data
			sDataArray = [];
			xDataArray = [];
			itemCount = 0;
			currMainItem = 0;

			cart.forEach(function (c, i) {
				itemCount += 1;
				currMainItem = itemCount;
				var internationalNumberFormat = new Intl.NumberFormat('en-US');

				cart[i].refItem = itemCount;

				// if (!isLease) {
				c.addOns.forEach(function (a) {
					// itemCount += 1;
					var ItmNumber = (itemCount * 10).toString().padStart(6, "0");
					var addOn = {
						ItmNumber: ItmNumber,
						PoItmNo: itemCount.toString(),
						// HgLvItem: (currMainItem * 10).toString().padStart(6, "0"),
						Material: a.Material,
						// Plant: plant,
						TargetQty: a.TargetQty.toString(),
						TargetQu: a.TargetQu,
						UsageInd: a.info.data.BillOfMaterialVariantUsage,
						// ShortText: SText.slice(0, 38),
						ShortText: c.serviceDesc.slice(0, 38),
						// Batch: Equipment
					};

					sDataArray.push(addOn);
				});
				// }
			});
			data.N_QuotationItemsIn = sDataArray;

			// -------------------- Item X Data
			exParams = ["ItmNumber"];
			sDataArray.forEach(function (x) {
				xData = {
					Updateflag: "C",
					ItmNumber: x.ItmNumber
				};

				_.keys(x).forEach(function (k) {
					if (!_.includes(exParams, k)) {
						xData[k] = "X";
					}
				});

				xDataArray.push(xData);
			});
			data.N_QuotationItemsInx = xDataArray;

			sDataArray = [];
			xDataArray = [];
			sData = {
				ItmNumber: '000000',
				ConStDat: ConstDate,
				ConEnRul: '08',
				ValPerCa: cart[0].mns.toString().padStart(2, '0'),
				ValPer: cart[0].mns.toString(),
				ValPerUn: '3',
			};
			sDataArray.push(sData);
			data.N_ContractDataIn = sDataArray;
			// // -------------------- Contract X Data
			exParams = ['ItmNumber'];
			sDataArray.forEach(x => {
				xData = {
					Updateflag: 'C',
					ItmNumber: x.ItmNumber,
				};
				_.keys(x).forEach(k => {
					if (!_.includes(exParams, k)) {
						xData[k] = 'X';
					}
				});
				xDataArray.push(xData);
			});
			data.N_ContractDataInX = xDataArray;

			sDataArray = [];
			xDataArray = [];
			sData = {
				Posnr: '000010',
				// UsageType: 'M',
				Iven: Equipment
			};
			sDataArray.push(sData);
			data.N_Serials = sDataArray;
			// }

			data.N_Return = [];

			return data;

		},

		onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

		_getMessagePopover: function () {
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "com.globalintelli.ZAE_SFQC.view.fragment.MessagePopover", this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		},
		onSalesAreaChange: function (oEvent) {
			this.getView().byId("opportunityInput").getControlByKey("CustomerField").setValue();
		},
		onApplicableServicePackageList: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			oSource.setBusy(true);
			if (!that._ServicePackageList) {
				Fragment.load({
						id: "fragServicePackageList",
						name: "com.globalintelli.ZAE_SFQC.view.fragment.ServicePackageList",
						controller: {
							onSearchServicePackage: function (oEvent) {
								Fragment.byId("fragServicePackageList", "SmartTableServicePackageList").rebindTable();
							},
							onSmartFilterBarInitialized: function (oEvent1) {
								var oEvent = oEvent1;
							},

							onBeforeRebindServicePackageList: function (oEventRenind) {
								oSource.setBusy(false);
								var aFilterArray = Fragment.byId("fragServicePackageList", "smartFilterBar").getFilters();
								var mBindingParams = oEventRenind.getParameter("bindingParams");
								var mApp = that.getView().getModel("app").getData().pages;
								var Make = mApp.Opportunity.opportunityData.Make;
								var Model = mApp.Opportunity.opportunityData.Model;
								aFilterArray.push(new sap.ui.model.Filter({
									path: "SalesOrganization",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: mApp.configData.SalesOrganization
								}));

								aFilterArray.push(new sap.ui.model.Filter({
									path: "DistributionChannel",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: mApp.configData.DistributionChannel
								}));

								aFilterArray.push(new sap.ui.model.Filter({
									path: "ServiceDocumentType",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: "ZTSC"
								}));

								if (Model !== "") {
									aFilterArray.push(new sap.ui.model.Filter({
										path: "Model",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: Model
									}));
								}
								if (Make !== "") {
									aFilterArray.push(new sap.ui.model.Filter({
										path: "Make",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: Make
									}));
								}
								aFilterArray.push(new sap.ui.model.Filter({
									path: "ValidTo",
									operator: sap.ui.model.FilterOperator.GE,
									value1: new Date()
								}));

								mBindingParams.filters = aFilterArray;

							},
							onCancelPressed: function () {
								that._ServicePackageList.close();
							}
						}
					}, this)
					.then(function (oPopoverContent) {
						that._ServicePackageList = oPopoverContent;
						that.getView().addDependent(that._ServicePackageList);
						Fragment.byId("fragServicePackageList", "smartFilterBar").clear();
						that._ServicePackageList.open();

					}.bind(this));

			} else {
				Fragment.byId("fragServicePackageList", "smartFilterBar").clear();
				Fragment.byId("fragServicePackageList", "SmartTableServicePackageList").rebindTable();
				that._ServicePackageList.open();
				oSource.setBusy(false);

			}

		},
	});
});