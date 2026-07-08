sap.ui.define([
	"../BaseController",
	"sap/ui/core/Fragment"
], function (BaseController, Fragment) {
	"use strict";
	var ConfigDataPath = "/pages/Config/materialConfigData/";
	var KMSPath = "/toKMsOpts/sel";
	return BaseController.extend("com.globalintelli.ZAE_SFQC.controller.subview.Config", {

		onInit: function () {
			var that = this;

			if (!that.pricePopover) {
				Fragment.load({
					type: "XML",
					name: "com.globalintelli.ZAE_SFQC.view.fragment.PricePopover"
				}).then(function (PricePopover) {
					that.pricePopover = PricePopover;
					that.getView().addDependent(that.pricePopover);
				});
			}
		},

		calculatePrice: function () {
			var that = this;
			var mApp = that.getView().getModel("app");
			// var cart = mApp.getProperty("/cart");
			var currentItem = mApp.getProperty("/pages/Config/currentItem");
			var selPaymentMethod = mApp.getProperty("/pages/Overview/selPaymentMethod");
			// var nextItem = cart.length;
			var materialConfigData = mApp.getProperty("/pages/Config/materialConfigData");
			// var configData = mApp.getProperty("/pages/configData");
			// var isLease = configData.AppMode.charAt(0) === "L";
			var currMaterialConfigData = materialConfigData[currentItem];
			// var basePrice = parseFloat(currMaterialConfigData.Price04.Kbetr);
			var basePrice = 0;
			var MaterialAddOns = currMaterialConfigData.MaterialAddOns;
			var price = basePrice;

			// if (isLease) {
			// 	var Duration = currMaterialConfigData.Duration;
			// 	var noOfMonths = Duration.sel;
			// 	price *= noOfMonths;
			// 	mApp.setProperty("/pages/Config/noOfMonths", noOfMonths);
			// } else {
			MaterialAddOns.forEach(function (op) {
				if (op.id !== "I") {
					if (op.selType === "CBM") {
						op.options.forEach(function (dt) {
							if (dt.selected === true) {
								price += dt.price * dt.qty;
							}
						});
					} else if (op.selType === "SEL") {
						op.options.forEach(function (dt) {
							if (dt.selected === true) {
								price += dt.price * dt.qty;
							}
						});
					}
				}
			});

			MaterialAddOns = MaterialAddOns.map(function (m) {
				if (m.id === "I") {
					m.options = m.options.map(function (o) {
						if (o.mock !== true) {
							if (selPaymentMethod === "Bank") {
								o.price = parseFloat(price) * parseFloat(o.data.per) / 100;
							} else {
								o.price = parseFloat(o.data.fmPrice);
							}
							if (o.selected === true) {
								price += o.price;
							}
						}
						return o;
					});
				}
				return m;
			});
			// }

			materialConfigData[currentItem].MaterialAddOns = MaterialAddOns;
			mApp.setProperty("/pages/Config/materialConfigData", materialConfigData);

			mApp.setProperty("/pages/Config/basePrice", basePrice);
			mApp.setProperty("/pages/Config/addOnsPrice", price - basePrice);
			mApp.setProperty("/pages/Config/price", price);
		},

		// press: function () {
		// 	console.log(this.getView().getModel('app'));
		// },

		isSubmitEnabled: function () {
			var that = this;
			var mApp = that.getView().getModel("app");
			var currentItem = mApp.getProperty("/pages/Config/currentItem");
			var materialConfigData = mApp.getProperty("/pages/Config/materialConfigData");
			var currMaterialConfigData = materialConfigData[currentItem];
			var MaterialAddOns = currMaterialConfigData.MaterialAddOns;
			var selType = mApp.getProperty(ConfigDataPath + currentItem + "/typeOpts/sel");
			var oDate = this.getView().byId("DP1").getValue();

			var isEn = false;
			MaterialAddOns.forEach(function (op) {
				// if (op.id !== "I") {
				if (op.selType === "CBM") {
					op.options.forEach(function (dt) {
						if (dt.selected === true && dt.mock === false) {
							isEn = true;
						}
					});
				} else if (op.selType === "SEL") {
					op.options.forEach(function (dt) {
						if (dt.selected === true && dt.mock === false) {
							isEn = true;
						}
					});
				}
				// }
			});

			if (selType === "" || oDate === "") {
				isEn = false;
			}

			mApp.setProperty("/pages/Config/isSubmitEnabled", isEn);

		},

		onFromSelectChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var currentItem = mApp.getProperty("/pages/Config/currentItem");
			var materialConfigData = mApp.getProperty(ConfigDataPath + currentItem);
			// var masterToKMsOpts = materialConfigData.masterToKMsOpts;
			// var toKMs = mApp.getProperty(ConfigDataPath + currentItem + KMSPath);

			var key = parseInt(oEvent.getParameter("selectedItem").getKey(), 10);

			// var toKMsOpts = masterToKMsOpts.filter(function (m) {
			// 	return m.key > key
			// });

			// mApp.setProperty(ConfigDataPath + currentItem + "/fromKMsOpts/sel", key);
			// mApp.setProperty(ConfigDataPath + currentItem + "/toKMsOpts/data", toKMsOpts);

			// if (key > toKMs) {
			// 	mApp.setProperty(ConfigDataPath + currentItem + KMSPath, toKMsOpts[0].key);
			// }

			this.isSubmitEnabled();
		},

		onTenureSelectChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var currentItem = mApp.getProperty("/pages/Config/currentItem");

			var key = oEvent.getParameter("selectedItem").getKey();

			mApp.setProperty(ConfigDataPath + currentItem + "/MNOpts/sel", parseInt(key, 10));

			this.isSubmitEnabled();
		},

		onTypeSelectChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var currentItem = mApp.getProperty("/pages/Config/currentItem");

			var key = oEvent.getParameter("selectedItem").getKey();

			mApp.setProperty(ConfigDataPath + currentItem + "/typeOpts/sel", key);

			this.isSubmitEnabled();
		},

		onToSelectChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var currentItem = mApp.getProperty("/pages/Config/currentItem");

			var key = oEvent.getParameter("selectedItem").getKey();

			mApp.setProperty(ConfigDataPath + currentItem + KMSPath, parseInt(key, 10));

			this.isSubmitEnabled();
		},

		onDateChange: function (oEvent) {
			var that = this;
			var mApp = that.getView().getModel("app");
			var currentItem = mApp.getProperty("/pages/Config/currentItem");
			var oSource = oEvent.getSource();
			if (oSource.getDateValue()) {
				var date = new Date(oSource.getDateValue().setHours(10));
				mApp.setProperty(ConfigDataPath + currentItem + "/startDate", date);
			}
			this.isSubmitEnabled();

		},

		onConfigChange: function (oEvent) {
			var that = this;
			that.calculatePrice();
		},

		openPricePopover: function (oEvent) {
			var that = this;

			var oSource = oEvent.getSource();
			that.pricePopover.openBy(oSource);
		},

	});

});