sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/Table",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/ObjectNumber",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/m/Title",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, Filter, FilterOperator,
             Dialog, Table, ColumnListItem, Text, ObjectNumber,
             Toolbar, ToolbarSpacer, Button, Title, JSONModel) {
    "use strict";

    return Controller.extend("zautosales.controller.MainView", {

        onInit: function () {
            this._oQtyMap = {};
            this._oDataMap = {};
        },

        _createKey: function (oData) {
            return oData.Matnr + "|" + oData.Werks + "|" + oData.Lgort;
        },

        onQuantityChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var oContext = oInput.getBindingContext();

            if (!oContext) return;

            var oData = oContext.getObject();
            var sKey = this._createKey(oData);

            var fQty = parseFloat(oInput.getValue());
            if (isNaN(fQty)) fQty = 0;

            this._oQtyMap[sKey] = fQty;

            this._oDataMap[sKey] = {
                Matnr: oData.Matnr,
                Werks: oData.Werks,
                Lgort: oData.Lgort,
                Maktx: oData.Maktx,
                Labst: oData.Labst,
                Kbetr: oData.Kbetr
            };

            var oTable = this.byId("materialTable");
            oTable.getItems().forEach(function (item) {
                var d = item.getBindingContext().getObject();
                if (this._createKey(d) === sKey) {
                    item.setSelected(fQty > 0);
                }
            }.bind(this));
        },

        onUpdateFinished: function () {
            var oTable = this.byId("materialTable");

            oTable.getItems().forEach(function (oItem) {
                var oCtx = oItem.getBindingContext();
                if (!oCtx) return;

                var oData = oCtx.getObject();
                var sKey = this._createKey(oData);
                var fQty = this._oQtyMap[sKey];

                var oInput = oItem.getCells()[6];
                if (oInput) {
                    oInput.setValue(fQty ? fQty : "");
                }

                oItem.setSelected(fQty > 0);
            }.bind(this));
        },

        _preparePayload: function () {
            var aPayload = [];

            Object.keys(this._oQtyMap).forEach(function (sKey) {
                var fQty = this._oQtyMap[sKey];

                if (fQty > 0 && this._oDataMap[sKey]) {
                    var oData = this._oDataMap[sKey];
                    var fPrice = parseFloat(oData.Kbetr) || 0;
                    var fAmount = fQty * fPrice;

                    aPayload.push({
                        Matnr: oData.Matnr,
                        Werks: oData.Werks,
                        Lgort: oData.Lgort,
                        Maktx: oData.Maktx,
                        Labst: oData.Labst,
                        Kbetr: fPrice,
                        Quan: fQty,
                        Amount: parseFloat(fAmount.toFixed(2))
                    });
                }
            }.bind(this));

            return aPayload;
        },

        onProcess: function () {
            var aPayload = this._preparePayload();

            if (aPayload.length === 0) {
                MessageBox.warning("Please enter quantity for at least one material");
                return;
            }

            this._showConfirmationDialog(aPayload);
        },

        _showConfirmationDialog: function (aItems) {
            var that = this;

            // Calculate Totals
            var iTotalQty = aItems.reduce((sum, item) => sum + item.Quan, 0);
            var fTotalAmount = aItems.reduce((sum, item) => sum + item.Amount, 0);

            // Confirmation Table
            var oConfirmTable = new Table({
                columns: [
                    new sap.m.Column({ header: new Text({ text: "Material" }) }),
                    new sap.m.Column({ header: new Text({ text: "Description" }) }),
                    new sap.m.Column({ header: new Text({ text: "Qty" }), hAlign: "End" }),
                    new sap.m.Column({ header: new Text({ text: "Price" }), hAlign: "End" }),
                    new sap.m.Column({ header: new Text({ text: "Amount" }), hAlign: "End" })
                ],
                items: {
                    path: "/",
                    template: new ColumnListItem({
                        cells: [
                            new Text({ text: "{Matnr}" }),
                            new Text({ text: "{Maktx}" }),
                            new ObjectNumber({ number: "{Quan}" }),
                            new ObjectNumber({ number: "{Kbetr}" }),
                            new ObjectNumber({ number: "{Amount}", unit: "USD" })
                        ]
                    })
                }
            });

            var oTableModel = new JSONModel(aItems);
            oConfirmTable.setModel(oTableModel);

            // Totals Toolbar
            var oTotalsToolbar = new Toolbar({
                design: "Solid",
                content: [
                    new Title({ text: "Total Items: " + aItems.length, level: "H6" }),
                    new ToolbarSpacer(),
                    new Text({ text: "Total Quantity: " + iTotalQty.toLocaleString() }),
                    new ToolbarSpacer(),
                    new ObjectNumber({
                        number: fTotalAmount.toFixed(2),
                        unit: "USD",
                        emphasized: true
                    })
                ]
            });

            // Dialog
            var oDialog = new Dialog({
                title: "Confirm Processing",
                content: [
                    oConfirmTable,
                    oTotalsToolbar
                ],
                beginButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                    }
                }),
                endButton: new Button({
                    text: "Confirm",
                    type: "Emphasized",
                    press: function () {
                        oDialog.close();
                        that._callBackend(aItems);
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            oDialog.open();
        },

        _callBackend: function (aPayload) {
            var oModel = this.getView().getModel();

            oModel.callFunction("/PROCESS_MATERIALS", {
                method: "POST",
                urlParameters: {
                    MATERIALS: JSON.stringify(aPayload)
                },
                success: function () {
                    MessageToast.show("Processed successfully");
                    this.onClear();
                }.bind(this),
                error: function () {
                    MessageBox.error("Error occurred while processing");
                }
            });
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue") || "";
            var oTable = this.byId("materialTable");
            var oBinding = oTable.getBinding("items");

            if (!oBinding) return;

            var aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("Matnr", FilterOperator.Contains, sQuery),
                        new Filter("Maktx", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            oBinding.filter(aFilters);
        },

        onClear: function () {
            this._oQtyMap = {};

            var oTable = this.byId("materialTable");

            oTable.getItems().forEach(function (oItem) {
                oItem.setSelected(false);

                var oInput = oItem.getCells()[6];
                if (oInput) {
                    oInput.setValue("");
                }
            });

            MessageToast.show("Cleared");
        }
    });
});