sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageBox, History, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("zsuporder.controller.SupervisorOrderList", {

        onInit: function () {
            // Listen for navigation to get parameters
            this.getOwnerComponent().getRouter().getRoute("orderList").attachPatternMatched(this._onRouteMatched, this);
            
            // Handle OData errors globally
            var oModel = this.getView().getModel("mainService");
            if (oModel) {
                oModel.attachRequestFailed(function(oEvent) {
                    var oError = oEvent.getParameter("error");
                    if (oError && oError.statusCode === 504) {
                        MessageBox.error("The server is taking too long to respond. Please check your connection or try again later.", {
                            title: "Gateway Timeout"
                        });
                    } else if (oError) {
                        var sMessage = oError.message || "An error occurred while loading data";
                        MessageBox.error(sMessage, {
                            title: "Error"
                        });
                    }
                }, this);
            }
            
            // Force initial data load
            this._loadData();
        },

        _loadData: function() {
            var oTable = this.byId("orderTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh(true);
                }
            }
        },

        _onRouteMatched: function (oEvent) {
            var oTable = this.byId("orderTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh();
                }
            }
        },

        onRefresh: function () {
            var oTable = this.byId("orderTable");
            oTable.setBusy(true);

            try {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([]);
                    oBinding.refresh(true);
                    var oModel = this.getView().getModel("mainService");
                    if (oModel) {
                        oModel.refresh(true);
                    }
                    MessageBox.information("Data refreshed successfully", {
                        title: "Refresh Complete"
                    });
                } else {
                    MessageBox.warning("No data binding found. Please check the service connection.", {
                        title: "Warning"
                    });
                }
            } catch (oError) {
                MessageBox.error("Error refreshing data: " + (oError.message || "Unknown error"));
                console.error("Refresh error:", oError);
            } finally {
                setTimeout(function () {
                    oTable.setBusy(false);
                }, 500);
            }
        },

        onOrderSelect: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            if (!oSelectedItem) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();
            if (!oContext) {
                return;
            }

            var sOrderId = oContext.getProperty("MaintenanceOrder");
            var sStatusCode = oContext.getProperty("StatusCode");
            var sStatusName = oContext.getProperty("StatusName");
            var sOrderDate = oContext.getProperty("CreationDate");
            var sCustomerName = oContext.getProperty("CustomerName");
            var sMobileNumber = oContext.getProperty("MobileNo");
            var sMobileNumber1 = oContext.getProperty("MobileNumber1");
            var sLocation = oContext.getProperty("Location");
            var sInvoiceNo = oContext.getProperty("InvoiceNo");
            var sInvoiceDate = oContext.getProperty("InvoiceDate");

            if (sOrderId) {
                var sFormattedDate = "";
                if (sOrderDate) {
                    var oDate = new Date(sOrderDate);
                    sFormattedDate = oDate.getFullYear() + "-" + 
                                    String(oDate.getMonth() + 1).padStart(2, '0') + "-" + 
                                    String(oDate.getDate()).padStart(2, '0');
                }

                var sFormattedInvoiceDate = "";
                if (sInvoiceDate) {
                    var oInvoiceDate = new Date(sInvoiceDate);
                    sFormattedInvoiceDate = oInvoiceDate.getFullYear() + "-" + 
                                    String(oInvoiceDate.getMonth() + 1).padStart(2, '0') + "-" + 
                                    String(oInvoiceDate.getDate()).padStart(2, '0');
                }

                var sQuery = "statusCode=" + encodeURIComponent(sStatusCode || '') + 
                            "&statusName=" + encodeURIComponent(sStatusName || '') +
                            "&orderDate=" + encodeURIComponent(sFormattedDate || '') +
                            "&customerName=" + encodeURIComponent(sCustomerName || '') +
                            "&mobileNumber=" + encodeURIComponent(sMobileNumber || '') +
                            "&mobileNumber1=" + encodeURIComponent(sMobileNumber1 || '') +
                            "&location=" + encodeURIComponent(sLocation || '') +
                            "&invoiceNo=" + encodeURIComponent(sInvoiceNo || '') +
                            "&invoiceDate=" + encodeURIComponent(sFormattedInvoiceDate || '');
                
                this.getOwnerComponent().getRouter().navTo("orderDetail", {
                    orderId: sOrderId,
                    query: sQuery
                });
            }
        },
        
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oTable = this.byId("orderTable");
            var oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return;
            }
            
            var aFilters = [];
            if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("MaintenanceOrder", FilterOperator.Contains, sQuery));
            }
            
            oBinding.filter(aFilters);
            
            if (oTable) {
                oTable.setFirstVisibleRow(0);
            }
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("orderList", {}, true);
            }
        },
        
        onOrderLinkPress: function (oEvent) {
            var oLink = oEvent.getSource();
            var oContext = oLink.getBindingContext();
            if (oContext) {
                var sOrderId = oContext.getProperty("MaintenanceOrder");
                var sStatusCode = oContext.getProperty("StatusCode");
                var sStatusName = oContext.getProperty("StatusName");
                var sOrderDate = oContext.getProperty("CreationDate");
                var sCustomerName = oContext.getProperty("CustomerName");
                var sMobileNumber = oContext.getProperty("MobileNo");
                var sMobileNumber1 = oContext.getProperty("MobileNumber1");
                var sLocation = oContext.getProperty("Location");
                var sInvoiceNo = oContext.getProperty("InvoiceNo");
                var sInvoiceDate = oContext.getProperty("InvoiceDate");

                var sFormattedDate = "";
                if (sOrderDate) {
                    var oDate = new Date(sOrderDate);
                    sFormattedDate = oDate.getFullYear() + "-" + 
                                    String(oDate.getMonth() + 1).padStart(2, '0') + "-" + 
                                    String(oDate.getDate()).padStart(2, '0');
                }

                var sFormattedInvoiceDate = "";
                if (sInvoiceDate) {
                    var oInvoiceDate = new Date(sInvoiceDate);
                    sFormattedInvoiceDate = oInvoiceDate.getFullYear() + "-" + 
                                    String(oInvoiceDate.getMonth() + 1).padStart(2, '0') + "-" + 
                                    String(oInvoiceDate.getDate()).padStart(2, '0');
                }

                var sQuery = "statusCode=" + encodeURIComponent(sStatusCode || '') + 
                            "&statusName=" + encodeURIComponent(sStatusName || '') +
                            "&orderDate=" + encodeURIComponent(sFormattedDate || '') +
                            "&customerName=" + encodeURIComponent(sCustomerName || '') +
                            "&mobileNumber=" + encodeURIComponent(sMobileNumber || '') +
                            "&mobileNumber1=" + encodeURIComponent(sMobileNumber1 || '') +
                            "&location=" + encodeURIComponent(sLocation || '') +
                            "&invoiceNo=" + encodeURIComponent(sInvoiceNo || '') +
                            "&invoiceDate=" + encodeURIComponent(sFormattedInvoiceDate || '');
                
                this.getOwnerComponent().getRouter().navTo("orderDetail", {
                    orderId: sOrderId,
                    query: sQuery
                });
            }
        }
    });
});