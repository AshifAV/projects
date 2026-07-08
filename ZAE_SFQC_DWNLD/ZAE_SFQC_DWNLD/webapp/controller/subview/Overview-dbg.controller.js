/* global _:true */
sap.ui.define([
	"sap/m/Label",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/m/MessageToast",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Text",
	"sap/ui/core/Fragment",
	"com/globalintelli/ZAE_SFQC/model/formatter",
	"../BaseController"
], function (Label, Title, ToolbarSpacer, MessageToast, Button, Link, Text, Fragment, Formatter, BaseController) {
	"use strict";

	return BaseController.extend("com.globalintelli.ZAE_SFQC.controller.subview.Overview", {

		aCrumbs: ["cart", "addOns"],

		onInit: function () {

			// debugger;

			var that = this;

			if (!that.oTemplateMain) {
				Fragment.load({
					type: "XML",
					name: "com.globalintelli.ZAE_SFQC.view.fragment.OverviewRowMain",
					controller: {
						formatter: Formatter,
						openDiscountPopover: function (oEvent) {
							var oSource = oEvent.getSource();
							that.discountPopover.openBy(oSource);
						},
						openTotalPricePopover: function (oEvent) {
							var oSource = oEvent.getSource();
							that.totalPricePopover.openBy(oSource);
						},
						onCartItemEdit: function (oEvent) {
							var mApp = that.getView().getModel("app");
							var itemPath = oEvent.getSource().getBindingContext("app").sPath;
							var oParentView = that.getOwnerComponent().getAggregation("rootControl");
							var oParentController = oParentView.getController();
							var item = mApp.getProperty(itemPath);

							mApp.setProperty("/pages/Config/currentItem", item.id);
							mApp.setProperty("/pages/currentStep", 2);
							oParentController._setupConfigPage(item.id);

							var oIconTabBar = oParentView.byId("iconTabBar");
							oIconTabBar.setSelectedKey("configTab");
						},
						onCartItemRemove: function (oEvent) {
							var mApp = that.getView().getModel("app");
							var itemPath = oEvent.getSource().getBindingContext("app").sPath;
							var index = parseInt(itemPath.replace(/^\D+/g, ""), 10);
							var cart = mApp.getProperty("/cart");
							var materialConfigData = mApp.getProperty("/pages/Config/materialConfigData");
							var materialData = mApp.getProperty("/pages/Config/materialData");
							cart.splice(index, 1);
							materialConfigData.splice(index, 1);
							materialData.splice(index, 1);
							cart.map(function (c, i) {
								return _.merge(c, {
									id: i
								});
							});
							materialConfigData.map(function (c, i) {
								return _.merge(c, {
									id: i
								});
							});
							materialData.map(function (c, i) {
								return _.merge(c, {
									id: i
								});
							});
							mApp.setProperty("/cart", cart);
							mApp.setProperty("/pages/Config/materialConfigData", materialConfigData);
							mApp.setProperty("/pages/Config/materialData", materialData);
						},
						onQtyChange: function (oEvent) {
							var value = parseInt(oEvent.getParameter("value"), 10);
							var oPath = oEvent.getSource().getParent().getBindingContext("app").sPath;
							var mApp = oEvent.getSource().getModel("app");
							if (value > 0 && value < 101) {
								mApp.setProperty(oPath + "/qty", value);
								var addOns = mApp.getProperty(oPath + "/addOns");
								addOns.map(function (a) {
									return _.merge(a, {
										TargetQty: parseInt(a.info.qty, 10) * value,
										Price: a.info.price * a.info.qty * value
									});
								});
								mApp.setProperty(oPath + "/addOns", addOns);
								var cart = mApp.getProperty("/cart");
								var totalPrice = that._calTotalPrice(cart);
								mApp.setProperty("/pages/Overview/totalPrice", totalPrice);
								// that.calculateEMI();
							} else {
								var oldValue = mApp.getProperty(oPath + "/qty");
								oEvent.getSource().setValue(oldValue);
							}
						}
					}
				}).then(function (OverviewRowMain) {
					that.oTemplateMain = OverviewRowMain;
					that.getView().addDependent(that.oTemplateMain);
					that._setInitTable();
					// debugger;
				});
			}
			if (!that.oTemplateSub) {
				Fragment.load({
					type: "XML",
					name: "com.globalintelli.ZAE_SFQC.view.fragment.OverviewRowSub"
				}).then(function (OverviewRowSub) {
					that.oTemplateSub = OverviewRowSub;
					that.getView().addDependent(that.oTemplateSub);
				});
			}
			if (!that.totalPricePopover) {
				Fragment.load({
					type: "XML",
					name: "com.globalintelli.ZAE_SFQC.view.fragment.TotalPricePopover",
					controller: {
						formatter: Formatter,
						beforeTotalPricePopoverOpen: function (oEvent) {
							var oPath = oEvent.getParameter("openBy").getBindingContext("app").sPath;
							var oSource = oEvent.getSource();
							oSource.bindElement("app>" + oPath);
						}
					}
				}).then(function (TotalPricePopover) {
					that.totalPricePopover = TotalPricePopover;
					that.getView().addDependent(that.totalPricePopover);
				});
			}
			if (!that.discountPopover) {
				Fragment.load({
					type: "XML",
					name: "com.globalintelli.ZAE_SFQC.view.fragment.DiscountPopover"
				}).then(function (DiscountPopover) {
					that.discountPopover = DiscountPopover;
					that.getView().addDependent(that.discountPopover);
				});
			}
		},

		_setInitTable: function () {
			var that = this;
			that._oTable = that.byId("cartTable");
			var sPath = "/" + that.aCrumbs[0];
			that._setAggregation(sPath);
			// debugger;
		},

		_setAggregation: function (sPath) {

			var that = this;
			// If we're at the leaf end, turn off navigation
			// , "imageColumn", "discountColumn", "addOnPriceColumn", "qtyColumn"
			// var swapColumnsSet1 = ["taxColumn", "netPriceColumn", "editColumn"];
			// var swapColumnsSet2 = ["basePriceColumn"];
			// var sPathEnd = sPath.split("/").reverse()[0];
			// debugger;
			// if (sPathEnd === that.aCrumbs[that.aCrumbs.length - 1]) {
			// 	// Items Table
			// 	that._oTable.setMode("None");
			// 	swapColumnsSet1.forEach(function (f) {
			// 		that.byId(f).setVisible(false);
			// 	});
			// 	swapColumnsSet2.forEach(function (f) {
			// 		that.byId(f).setVisible(true);
			// 	});
			// 	that.byId("qtyColumn").setVisible(true);
			// 	that.byId("deleteColumn").setVisible(false);
			// 	that._oTable.bindAggregation("items", "app>" + sPath, that.oTemplateSub);
			// } else {
			// Main Table
			that._oTable.setMode("None");
			// swapColumnsSet1.forEach(function (f) {
			// 	that.byId(f).setVisible(true);
			// });
			// swapColumnsSet2.forEach(function (f) {
			// 	that.byId(f).setVisible(false);
			// });

			// var oElse = function () {
			// 	that.byId("qtyColumn").setVisible(false);
			// };

			// var mApp = that.getView().getModel("app");
			// if (mApp !== undefined) {
			// 	var configData = mApp.getProperty("/pages/configData");
			// 	var Overview = mApp.getProperty("/pages/Overview");
			// 	if (!_.isEmpty(configData) && Overview.selPaymentMethod !== undefined) {
			// 		var isFleet = configData.AppMode.charAt(1) === "F" && Overview.selPaymentMethod === "Credit";
			// 		that.byId("qtyColumn").setVisible(isFleet);
			// 		that.byId("deleteColumn").setVisible(isFleet);
			// 	} else {
			// 		oElse();
			// 	}
			// } else {
			// 	oElse();
			// }
			that._oTable.bindAggregation("items", "app>" + sPath, that.oTemplateMain);
			// }

			that._maintainCrumbLinks(sPath);
		},

		// Build the crumb links for display in the toolbar
		_maintainCrumbLinks: function (sPath) {
			// Determine trail parts
			var that = this;
			var aPaths = [];
			var aParts = sPath.split("/");
			while (aParts.length > 1) {
				aPaths.unshift(aParts.join("/"));
				aParts = aParts.slice(0, aParts.length - 2);
			}

			// Re-build crumb toolbar based on trail parts
			var oCrumbToolbar = this.byId("idCrumbToolbar");
			oCrumbToolbar.destroyContent();

			var title = new Title({
				text: "Summary",
				level: "H2"
			});
			oCrumbToolbar.addContent(title);

			aPaths.forEach(function (path, iPathIndex) {

				var bIsFirst = iPathIndex === 0;
				var bIsLast = iPathIndex === aPaths.length - 1;

				// Special case for 1st crumb: fixed text
				// var sText = bIsFirst ? this.aCrumbs[0] : "{Name}";
				var sText = bIsFirst ? "Main Item" : "{app>materialData/MaterialName}";

				// Context is one level up in path
				var sContext = this._stripItemBinding(path);

				var oCrumb = bIsLast ? new Text({
					text: sText
				}).addStyleClass("crumbLast") : new Link({
					text: sText,
					target: path,
					press: [this.handleLinkPress, this]
				});
				oCrumb.bindElement("app>" + sContext);

				oCrumbToolbar.addContent(oCrumb);
				if (!bIsLast) {
					var oArrow = new Label({
						textAlign: "Center",
						text: "›"
					}).addStyleClass("crumbArrow");
					oCrumbToolbar.addContent(oArrow);
				}

			}, this);

			var spacer = new ToolbarSpacer();
			oCrumbToolbar.addContent(spacer);

			var btn = new Button({
				id: "addItem",
				icon: "sap-icon://add",
				visible: "{= ${app>/pages/configData/AppMode}.charAt(1) === 'F' && ${app>/pages/Overview/selPaymentMethod} === 'Credit' }",
				press: function (oEvent) {
					// var that = this;
					var mApp = that.getView().getModel("app");
					// var mApp = this.getModel("app");
					var cart = mApp.getProperty("/cart");
					var oParentView = this.getOwnerComponent().getAggregation("rootControl");
					var materialSubView = oParentView.byId("materialSubView");
					var oGridList = materialSubView.byId("materialList");

					mApp.setProperty("/pages/Config/currentItem", cart.length);
					mApp.setProperty("/pages/currentStep", 1);

					oGridList.removeSelections(true);
					mApp.setProperty("/pages/Material/isNextEnabled", false);
					mApp.setProperty("/pages/Material/selectedMaterialData", {});

					var oIconTabBar = oParentView.byId("iconTabBar");
					oIconTabBar.setSelectedKey("materialTab");
				}.bind(this),
			});
			btn.addStyleClass("sapUiSmallMarginEnd");
			oCrumbToolbar.addContent(btn);
		},

		_stripItemBinding: function (sPath) {
			var aParts = sPath.split("/");
			return aParts.slice(0, aParts.length - 1).join("/");
		},

		_nextCrumb: function (sCrumb) {
			for (var i = 0, ii = this.aCrumbs.length; i < ii; i++) {
				if (this.aCrumbs[i] === sCrumb) {
					return this.aCrumbs[i + 1];
				}
			}
		},

		handleLinkPress: function (oEvent) {
			this._setAggregation(oEvent.getSource().getTarget());
		},

		handleSelectionChange: function (oEvent) {
			// Determine where we are right now
			var sPath = oEvent.getParameter("listItem").getBindingContext("app").getPath();
			var item = this.getView().getModel("app").getProperty(sPath);
			if (item.addOns.length > 0) {
				var aPath = sPath.split("/");
				var sCurrentCrumb = aPath[aPath.length - 2];
				if (sCurrentCrumb !== this.aCrumbs[this.aCrumbs.length - 1]) {
					var sNewPath = [sPath, this._nextCrumb(sCurrentCrumb)].join("/");
					this._setAggregation(sNewPath);
				}
			} else {
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ThisitemhasnoAddOns"));
				oEvent.getSource().removeSelections();
			}
		},

		isSubmitEnabled: function () {
			var that = this;
			var isSubmitEnabled = false;
			var mApp = that.getView().getModel("app");
			var selPaymentMethod = mApp.getProperty("/pages/Overview/selPaymentMethod");
			var selContractType = mApp.getProperty("/pages/Overview/selContractType");
			var selPaymentTerms = mApp.getProperty("/pages/Overview/selPaymentTerms");
			var downPaymentAmount = mApp.getProperty("/pages/Overview/downPaymentAmount");
			var configData = mApp.getProperty("/pages/configData");
			var customerReference = mApp.getProperty("/pages/Overview/customerReference");
			var isShowDP = configData.ShowDownpayment;

			if (
				selPaymentMethod !== "" &&
				selPaymentTerms !== "" &&
				customerReference !== "" &&
				(isShowDP !== true || selPaymentMethod !== "Bank" || (downPaymentAmount.value !== null && downPaymentAmount.valid === true))
			) {
				isSubmitEnabled = true;
			}

			mApp.setProperty("/pages/Overview/isSubmitEnabled", isSubmitEnabled);

		},

		onFormSelectChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");

			var key = oEvent.getParameter("selectedItem").getKey();
			var name = oEvent.getSource().getName();
			mApp.setProperty("/pages/Overview/" + name, key);

			that.isSubmitEnabled();
		},

		onFormInputChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");

			var type = oEvent.getSource().getType();
			var value = null;
			if (type === "Number") {
				value = parseFloat(oEvent.getParameter("value"));
			} else {
				value = oEvent.getParameter("value");
			}
			var name = oEvent.getSource().getName();
			mApp.setProperty("/pages/Overview/" + name, value);

			that.isSubmitEnabled();
		},

		onTypeChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");

			var key = oEvent.getParameter("selectedItem").getKey();
			var name = oEvent.getSource().getName();
			mApp.setProperty("/pages/Overview/" + name, key);

			var oParentView = that.getOwnerComponent().getAggregation("rootControl");
			var overviewSubView = oParentView.byId("overviewSubView");
			var paymentMethodSelect = overviewSubView.byId("paymentMethod");
			paymentMethodSelect.bindItems({
				path: "app>/pages/Overview/" + key + "PaymentMethods",
				template: new sap.ui.core.ListItem({
					key: "{app>PaymentMethod}",
					text: "{app>PaymentMethodName}"
				})
			});

			that.isSubmitEnabled();
		},

		onPaymentMethodChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");

			var paymentMethod = oEvent.getParameter("selectedItem").getKey();
			var configData = mApp.getProperty("/pages/configData");
			var paymentTerms = configData.paymentTermsData.filter(function (p) {
				return p.CustomerPaymentTerms.startsWith(configData["PaymentTerms" + paymentMethod]);
			});

			mApp.setProperty("/pages/Overview/paymentTerms", paymentTerms);

			that.isSubmitEnabled();
		},

		onDownPaymentAmountChange: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var mApp = that.getView().getModel("app");
			var totalPrice = mApp.getProperty("/pages/Overview/totalPrice");
			// var cart = mApp.getProperty("/cart");
			// var item = cart[0];

			var value = parseFloat(oEvent.getParameter("value"));
			var valid = value > 0 && value < totalPrice;
			// var valid = value > 0 && value < item.cartPrice;

			if (valid) {
				oSource.setValueState("None");
			} else {
				oSource.setValueState("Error");
			}
			mApp.setProperty("/pages/Overview/downPaymentAmount/value", value);
			mApp.setProperty("/pages/Overview/downPaymentAmount/valid", valid);

			that.calculateEMI();
			that.isSubmitEnabled();
		},

		EMIPanelExpand: function (oEvent) {
			var that = this;

			if (oEvent.getParameter("expand")) {
				that.calculateEMI();
			}
		},

		onEMIInputChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");

			var value = oEvent.getParameter("value");
			var name = oEvent.getSource().getName();
			mApp.setProperty("/pages/configData/" + name, value);

			that.calculateEMI();
		},

		calculateEMI: function () {
			var that = this;
			var mApp = that.getView().getModel("app");
			var barChart = that.getView().byId("overviewTabEMI--bar");
			var downPaymentAmount = mApp.getProperty("/pages/Overview/downPaymentAmount/value");
			var selPaymentMethod = mApp.getProperty("/pages/Overview/selPaymentMethod");
			var totalPrice = mApp.getProperty("/pages/Overview/totalPrice");
			var EMIPercent = parseFloat(mApp.getProperty("/pages/configData/EMIPercent"));
			var EMITenure = parseInt(mApp.getProperty("/pages/configData/EMITenure"), 10);
			var amount = totalPrice - (isNaN(downPaymentAmount) && selPaymentMethod === "Bank" ? 0 : downPaymentAmount);

			var emiData = {
				r1: [],
				r2: []
			};

			var terms = EMITenure;
			var interestRate = EMIPercent / 100.00;
			var monthlyRate = interestRate / 12;

			// -- R1 Calculation
			var r1Balance = amount;
			var r1Terms = terms;
			var r1Payment = r1Balance * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -r1Terms)));
			var r1TotalPayment = r1Payment * r1Terms;

			for (var count = 0; count < r1Terms; ++count) {
				var monthData = {};

				monthData.month = count + 1;
				monthData.balance = r1Balance.toFixed(2);
				var interest = r1Balance * monthlyRate;
				monthData.interest = interest.toFixed(2);
				var monthlyPrincipal = r1Payment - interest;
				monthData.monthlyPrincipal = monthlyPrincipal.toFixed(2);
				r1Balance -= monthlyPrincipal;

				emiData.r1.push(monthData);
			}

			emiData.r1 = emiData.r1.map(function (e, i, a) {
				if (i !== a.length - 1) {
					return _.merge(e, {
						actualBalance: a[i + 1].balance
					});
				} else {
					return _.merge(e, {
						actualBalance: "0.00"
					});
				}
			});

			var lastPrinciple = parseFloat(emiData.r1[emiData.r1.length - 1].monthlyPrincipal);

			// -- R2 Calculation
			var r2Balance = amount - lastPrinciple;
			// var r2Balance = amount;
			var r2Terms = terms;
			// var r2Terms = terms - 1;
			var r2Payment = r2Balance * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -r2Terms)));
			var r2TotalPayment = r2Payment * r2Terms;

			emiData.r2.push({
				month: 1,
				balance: r2Balance.toString(),
				interest: "0.00",
				monthlyPrincipal: lastPrinciple.toString()
			});

			r2Balance -= lastPrinciple;

			for (var count = 1; count <= r2Terms; ++count) {
				var monthData = {};

				monthData.month = count + 1;
				monthData.balance = r2Balance.toFixed(2);
				var interest = r2Balance * monthlyRate;
				monthData.interest = interest.toFixed(2);
				var monthlyPrincipal = r2Payment - interest;
				monthData.monthlyPrincipal = monthlyPrincipal.toFixed(2);
				r2Balance -= monthlyPrincipal;

				emiData.r2.push(monthData);
			}

			emiData.r2 = emiData.r2.map(function (e, i, a) {
				if (i !== a.length - 1) {
					return _.merge(e, {
						actualBalance: a[i + 1].balance
					});
				} else {
					return _.merge(e, {
						actualBalance: "0.00"
					});
				}
			});

			var emi = parseFloat(r2Payment.toFixed(2));
			var total = parseFloat((parseFloat(r2TotalPayment.toFixed(2)) + parseFloat(r2Payment.toFixed(2))).toFixed(2));
			var interest = total - amount;
			var interestPercentage = (interest / total) * 100;
			var totalPercentage = 100 - interestPercentage;

			// -- Base Data Setup
			mApp.setProperty("/pages/Overview/emiData/amount", amount);
			mApp.setProperty("/pages/Overview/emiData/emi", emi);
			mApp.setProperty("/pages/Overview/emiData/total", total);
			mApp.setProperty("/pages/Overview/emiData/interest", interest);

			// -- Pie Data Setup
			var pie = {
				items: [{
					Type: "Total Interest",
					Percent: interestPercentage.toString()
				}, {
					Type: "Principle Load Amount",
					Percent: totalPercentage.toString()
				}]
			};

			// -- Raw Data Setup
			var today = new Date();
			// var currentMonth = today.getMonth();
			// var nextYear = 0;
			var rawData = emiData.r2.map(function (d, i) {
				var date = new Date();
				date.setMonth(date.getMonth() + i);

				var month = date.getMonth();
				var year = date.getFullYear();
				return {
					month: month,
					year: year,
					balance: parseFloat(d.actualBalance), // actualBalance -> balance
					interest: parseFloat(d.interest),
					principle: parseFloat(d.monthlyPrincipal)
				};
			});

			// -- Bar Data Setup
			var barData = _.values(_.reduce(rawData, function (result, obj) {
				var name = obj.year;
				result[name] = {
					year: name,
					interest: obj.interest + (result[name] ? result[name].interest : 0),
					principle: obj.principle + (result[name] ? result[name].principle : 0)
				};
				return result;
			}, {}));

			barData = barData.map(function (b) {
				var t = rawData.filter(function (r) {
					return r.year === b.year;
				});
				return {
					Year: b.year.toString(),
					Balance: _.maxBy(t, "month").balance.toFixed(2),
					Interest: b.interest.toFixed(2),
					Principle: b.principle.toFixed(2)
				};
			});

			var bar = {
				items: barData
			};

			mApp.setProperty("/pages/Overview/emiData/chartData/pie", pie);
			mApp.setProperty("/pages/Overview/emiData/chartData/bar", bar);

			barChart.setVizScales([{
				"feed": "color",
				"palette": ["#c14645", "#5898da", "#e8733b"]
			}]);

		}

	});

});