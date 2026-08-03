sap.ui.define(["com/globalintelli/ZAE_SCIN_NEW/controller/BaseController", "sap/ui/core/Fragment", "com/globalintelli/zae_flib/controller/aeUI5Utility", "sap/m/SearchField", "sap/m/Token", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/type/String", "sap/m/ColumnListItem", "sap/m/Label", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "com/globalintelli/zae_flib/controller/aeUtility/"], function (e, t, a, r, n, i, o, s, l, u, g, d, c) {
    "use strict";
    return e.extend("com.globalintelli.ZAE_SCIN_NEW.controller.Main", {
        i18nPath: "i18n",
        aeUI5Util: new a,
        aeUtil: new c,
        _valueHelpDialogs: [],
        _selectedServiceRequest: null,
        onInit: function () {
            var t = this;
            var o = this;
            var a = t.getView();
            this._valueHelpDialogs = [];
            this.aeUtil.resetLibrary();
            this.aeUI5Util.setupMessageManager(this);
            this.aeUI5Util.resetLibrary();
            this.fnSetInitModel();
            this._fnButtonsIntial();
            this.oResourceModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var r = sap.ui.core.routing.HashChanger.getInstance();
            if (r.getAppHash()) {
                var n = r.getAppHash().split("/");
                var i;
                switch (n.length) {
                    case 1:
                        i = n[n.length - 1];
                        if (i.split("=")[0] === "?sap-iapp-state") {
                            e.MainAppState = i.split("=")[i.split("=").length - 1]
                        }
                        break;
                    case 2:
                        i = JSON.parse(decodeURIComponent(n[n.length - 1]));
                        if (i["sap-iapp-state"]) {
                            e.MainAppState = i["sap-iapp-state"]
                        }
                        break
                }
            }
            if (e.MainAppState) {
                var o = sap.ui.core.Component.getOwnerIdFor(this.getView());
                var s = sap.ui.component(o);
                sap.ushell.Container.getService("CrossApplicationNavigation").getAppState(s, e.MainAppState).done(function (e) {
                    if (!e.getData()) {
                        return
                    }
                    var a = t.getView().byId("SCIN_smartFilterBar");
                    var r = t.getView().byId("SCIN_I01");
                    var n = t.getView().byId("SCIN_I03");
                    var i = t.byId("EquipmentVH");
                    if (r && e.getData().Plant) {
                        r.setSelectedKey(e.getData().Plant)
                    }
                    if (r && e.getData().Equipment) {
                        var o = new sap.m.Token({
                            key: e.getData().Equipment,
                            text: e.getData().EquipmentWithDesc
                        });
                        i.addToken(o)
                    }
                    if (n && e.getData().Insurer) {
                        n.setSelectedKey(e.getData().Insurer)
                    }
                    if (a && e.getData()) {
                        a.addEventDelegate({
                            onAfterRendering: function (e) {
                                a.fireSearch()
                            }
                        }, this)
                    }
                })
            }
            var l = sap.ui.getCore().getEventBus();
            l.subscribeOnce("MainView", "fnAfterNavigate", this.fnAfterNavigate, this);
            var u = {
                MainResults: [],
                CreateCustomerSalesOrg: [],
                CreateCustomerDivision: [],
                CreateCompanyData: [],
                CreateCompanySalesOrg: [],
                CreateCompanyDC: [],
                CreateCompanyDivison: []
            };

            var ue = {
                MainResults: [],
                CreateCustomerSalesOrg: [],
                CreateCustomerDivision: [],
                CreateCompanyData: [],
                CreateCompanySalesOrg: [],
                CreateCompanyDC: [],
                CreateCompanyDivison: []
            };
            var g = new sap.ui.model.json.JSONModel;
            this.getView().setModel(g, "mCreateCustomer");
            this.getView().getModel("mCreateCustomer").setProperty("/oCreateCustomerData", u)

            var ge = new sap.ui.model.json.JSONModel;
            this.getView().setModel(ge, "mCreateCustomerEqui");
            this.getView().getModel("mCreateCustomerEqui").setProperty("/oCreateCustomerData", ue)
        },
        _fnButtonsIntial: function () {
            var e = this.getView().getModel("mCustIdentification");
            var t = e.getData();
            this.getOwnerComponent().getModel().read("/ZAE_I_CustomerIdentification", {
                success: function (e, a) {
                    t.customerInfo = e.results[0]
                },
                error: function (e) {
                    var t
                }
            })
        },
        onAfterRendering: function () {
            this.onInitChangeDocs();
            var e = this.getView().getModel("mCustIdentification");
            var t = e.getData();
            var a = this.getOwnerComponent().getComponentData()["startupParameters"];
            if (t.DefaultData.length == 0) {
                sap.ushell.Container.getServiceAsync("UserDefaultParameterPersistence").then(function (e) {
                    e.loadParameterValue("Plant").done(function (e) {
                        if (!(a["Plant"] && a["Plant"].length > 0)) {
                            this.Plant = e.value;
                            this.setDefaultValues()
                        }
                    }.bind(this));
                    e.loadParameterValue("SalesGroup").done(function (e) {
                        this.SalesGroup = e.value;
                        this.setDefaultValues()
                    }.bind(this))
                }.bind(this))
            }
        },
        onEquipmentInputInitialized: function (e) {
            var t = this;
            var a = this.getOwnerComponent().getComponentData()["startupParameters"];
            if (a["Plant"] && a["Plant"].length > 0) {
                t.Plant = a["Plant"][0]
            }
            if (a["Equipment"] && a["Equipment"].length > 0) {
                t.Equipment = a["Equipment"][0]
            }
            if (a["CampaignID"] && a["CampaignID"].length > 0) {
                t.CampaignID = a["CampaignID"][0]
            }
            if (a["cmpgn_extid"] && a["cmpgn_extid"].length > 0) {
                t.cmpgn_extid = a["cmpgn_extid"][0]
            }
            if (a["Opportunity"] && a["Opportunity"].length > 0) {
                t.Opportunity = a["Opportunity"][0]
            }
            if (a["Lead"] && a["Lead"].length > 0) {
                t.Lead = a["Lead"][0]
            }
            var r = e.getSource();
            var n = r.getFilterGroupItems();
            if (n.length === 0) { } else {
                if (t.Equipment !== undefined && t.Equipment !== null) {
                    var i = new sap.m.Token({
                        key: t.Equipment,
                        text: t.Equipment
                    });
                    var o = this.getView().byId("SCIN_smartFilterBar");
                    var s = o.getControlByKey("Equipment");
                    var l = o.getControlByKey("Plant");
                    l.data("Plant", t.Plant);
                    l.setSelectedKey(t.Plant);
                    s.setTokens([i]);
                    o.fireSearch()
                }
            }
        },
        onMessagePopoverPress: function (e) {

            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var z = null;
            if (oPlantControl) {
                z = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var r = t.createEmptyAppState(sap.ui.component(a));
            var n = this.byId("EquipmentVH").getTokens();
            var i = "",
                o = "";
            if (n.length > 0) {
                i = n[0].getProperty("key");
                o = n[0].getProperty("text")
            }
            var s = [];
            var l = this.byId("SCIN_I02").getTokens();
            for (var u = 0; u < l.length; u++) {
                s.push({
                    key: l[u].getProperty("key"),
                    text: l[u].getProperty("text")
                })
            }
            var g = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: z,
                Category: s,
                // Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: i,
                EquipmentWithDesc: o
            };
            r.setData(g);
            r.save();
            var d = sap.ui.core.routing.HashChanger.getInstance();
            var c = d.getHash();
            var C = c + "?" + "sap-iapp-state=" + r.getKey();
            d.replaceHash(C);
            var p = function (e, t) {
                var a;
                var r = t.getDescription() !== "" ? t.getDescription() : "Appointment";
                var n = sap.ushell.Container.getService("CrossApplicationNavigation");
                if (e.length <= 5) {
                    var i = {
                        object_type: "BUS2000126"
                    };
                    i[r] = e;
                    a = n && n.hrefForExternal({
                        target: {
                            semanticObject: r,
                            action: "aeDisplay"
                        },
                        params: i
                    }) || ""
                } else {
                    a = n && n.hrefForExternal({
                        target: {
                            semanticObject: "ServiceRequest",
                            action: "aesDisplay"
                        },
                        params: {
                            object_type: "BUS2000223",
                            ServiceRequest: e
                        }
                    }) || ""
                }
                n.toExternal({
                    target: {
                        shellHash: a
                    }
                })
            };
            this.aeUI5Util.handleMessagePopoverPress(this, e, p)
        },
        fnSetInitModel: function () {
            var e = {
                customerInfo: {
                    isShowSCIN_B01: false,
                    isShowSCIN_B02: false,
                    isShowSCIN_B07: false,
                    // isShowSCIN_B08: false,
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
                        ExtendCustomerCreateButton: false,
                        CustomerEquiCreateButton: false
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
                OpenAppointments: [],
                CreateComplaint: []
            };
            var t = new sap.ui.model.json.JSONModel;
            t.setData(e);
            this.getView().setModel(t, "mCustIdentification")
        },
        fnRestPageData: function () {
            var e = this.getView().getModel("mCustIdentification");
            var t = e.getData();
            var a = this.getOwnerComponent().getComponentData()["startupParameters"];
            t.uiOnly.visible.MessagePage = true;
            t.uiOnly.visible.vBoxSearchResults = false;
            t.uiOnly.visible.NPSSandPDSSScore = false;
            if (!a["Equipment"]) {
                this.byId("EquipmentVH").removeAllTokens()
            }
            this.getView().byId("SCIN_I02").setValue("");
            this.getView().byId("SCIN_I02").setSelectedKey("");
            // this.getView().byId("SCIN_I03").setValue("");
            this.getView().byId("SCIN_I03").setSelectedKey("")
        },
        setDefaultValues: function () {
            var e = this;
            var t = e.getView().byId("SCIN_I01");
            var a = this.getView().getModel("mCustIdentification");
            var r = a.getData();
            if (!t.getSelectedKey()) {
                r.WorkShop = this.Plant ? this.Plant : "";
                t.setSelectedKey(this.Plant);
                a.setProperty("/EquipmentEnable", true)
            }
            r.SalesGroup = this.SalesGroup ? this.SalesGroup : "";
            a.updateBindings(true)
        },
        onSearch: function (e) {

            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var g = null;
            if (oPlantControl) {
                g = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }

            this.ServiceComplaintTab = false;
            this.ServiceHistoryTab = false;
            this.LegacyHistoryTab = false;
            this.ServiceContract = false;
            var t = this.getView().byId("SmartEqupiment");
            var a = this.getView().byId("vehiclehistory").getTable();
            if (!g) {
                return
            }
            if (a.getBinding("items")) {
                a.destroyItems();
                this.getView().byId("vehiclehistory").getToolbar().getContent()[0].setText("Line Items(0)");
                a.setNoDataText("To Start, Click on Load History")
            }
            var r = [];
            r.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, g));
            var n = this.getView().getModel("mCustIdentification");
            var i = n.getData();
            i.CategoryLength = "";
            i.Insurer = "";
            var o = this;
            if (this.byId("EquipmentVH").getTokens()[0].getProperty("key")) {
                r.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, this.byId("EquipmentVH").getTokens()[0].getProperty("key")))
            } else {
                return
            }
            if (i.Equipment !== r[1].oValue1) {
                this.getView().byId("SCIN_I02").setValue("");
                this.getView().byId("SCIN_I02").setSelectedKey("");
                i.CategoryFromHash = ""
            }
            n.setProperty("/Equipment", r[1].oValue1);
            this.getView().setBusy(true);
            this.getView().getModel().read("/ZAE_I_Equipment_04", { //ZAE_C_LicenseNum_01
                filters: r,
                urlParameters: {
                    $expand: ["to_EquipmentRecall", "to_ServiceHistory", "to_MeasuringDocument", "to_EquipmentContStsB5", "to_ServiceContract01", "to_ServiceContractNew/to_Item_01", "to_EquipmentVBAPSOTagData", "to_InsuranceDetails"]
                },
                success: function (e, t) {
                    o.Equipment = "";
                    o.getView().setBusy(false);
                    o.fnBuildAppState();
                    if (e.results.length > 0) {
                        i.customerInfo = e.results[0];
                        i.uiOnly.visible.MessagePage = false;
                        i.uiOnly.visible.vBoxSearchResults = true;
                        var a = e.results[0].to_InsuranceDetails.results.length > 0 ? e.results[0].to_InsuranceDetails.results : [];
                        var r = {};
                        if (a.length > 0) {
                            a = a.sort(function (e, t) {
                                return t.EndDate.getTime() / 1e3 - e.EndDate.getTime() / 1e3
                            });
                            r = a[0]
                        }
                        i.InsuranceDetails = r;
                        i.uiOnly.visible.NPSSandPDSSScore = e.results[0].to_EquipmentVBAPSOTagData !== null;
                        o.getCurrentOwner();
                        o.getView().byId("SCIN_BoxSearchResults").bindElement("/ZAE_I_Equipment_04('" + e.results[0].Equipment + "')");
                        // o.getView().byId("ServicePlan").bindElement("/ZAE_I_Equipment_04('" + e.results[0].Equipment + "')/to_MaterialCharacteristics");
                        var s = o.getView().byId("ObjectStatusRecall");
                        var l = false,
                            u = false,
                            g = false,
                            d = 0,
                            c = 0;
                        var C = "Indication01";
                        var p = "";
                        var f = false;
                        if (e.results[0].to_EquipmentRecall.results.length > 0) {
                            for (var m = 0; m < e.results[0].to_EquipmentRecall.results.length; m++) {
                                var y = e.results[0].to_EquipmentRecall.results[m];
                                if (y.WarrantyClaim !== "" && y.ServiceOrder !== "" && y.SystemStatus === "I0045") {
                                    c = c + 1
                                } else if (y.WarrantyClaim !== "") {
                                    d = d + 1
                                }
                            }
                            g = c === e.results[0].to_EquipmentRecall.results.length ? true : false;
                            u = d > 0 ? true : false
                        } else {
                            l = true
                        }
                        if (l) {
                            C = "Indication02";
                            p = "No Recall";
                            f = false
                        } else if (u) {
                            C = "Indication02";
                            p = "Recall Pending";
                            f = true
                        } else if (g) {
                            C = "Indication04";
                            p = "Recall Completed";
                            f = false
                        }
                        s.setText(p);
                        s.setState(C);
                        s.setInverted(f);
                        if (f) {
                            s.addStyleClass("sapMObjectStatusLarge")
                        } else {
                            s.removeStyleClass("sapMObjectStatusLarge")
                        }
                        if (i.customerInfo.to_MeasuringDocument && i.customerInfo.to_MeasuringDocument.results.length > 0) {
                            var v = i.customerInfo.to_MeasuringDocument.results;
                            var I = Number(v[0].MeasuringReading);
                            for (var S = 0; S < v.length; S++) {
                                if (Number(v[S].MeasuringReading) > I) {
                                    I = Number(v[S].MeasuringReading)
                                }
                            }
                            i.MeasuringReading = I
                        } else {
                            i.MeasuringReading = null
                        }
                        var h = i.customerInfo.to_ServiceContractNew.results;
                        var b = {};
                        var P = h.filter(function (e) {
                            return e.ContractStatus_new === "CTIN"
                        });
                        if (P.length > 1) {
                            P.sort(function (e, t) {
                                return e.SalesContractValidityEndDate - t.SalesContractValidityEndDate
                            });
                            b = P[P.length - 1];
                            o.fnProcessContractErrorMsg(P)
                        } else {
                            b = P.length > 0 ? P[P.length - 1] : {}
                        }
                        if (P.length === 0 && h.length > 0) {
                            h.sort(function (e, t) {
                                return e.SalesContractValidityEndDate - t.SalesContractValidityEndDate
                            });
                            b = h[h.length - 1]
                        }
                        n.setProperty("/customerInfo/ServiceContract", {});
                        n.setProperty("/customerInfo/ServiceContract/MoreInfo", b)
                    } else {
                        i.customerInfo = [];
                        var V = sap.ui.getCore().getMessageManager();
                        var E = [];
                        var _ = o.getView().getModel("i18n").getResourceBundle().getText("NoDataFound");
                        var T = new sap.ui.core.message.Message({
                            message: _,
                            persistent: true,
                            type: sap.ui.core.MessageType.Warning
                        });
                        E.push(T);
                        V.addMessages(E);
                        i.uiOnly.visible.MessagePage = true;
                        i.uiOnly.visible.vBoxSearchResults = false
                    }
                    n.updateBindings(true)
                },
                error: function (e) {
                    o.getView().setBusy(false);
                    i.uiOnly.visible.MessagePage = true;
                    i.uiOnly.visible.vBoxSearchResults = false
                }
            })
        },
        fnProcessContractErrorMsg: function (e) {
            var t = this;
            var a = t.getView().getModel("i18n").getResourceBundle().getText("Msg1");
            var r = t.getView().getModel("i18n").getResourceBundle().getText("Msg2");
            var n = t.getView().getModel("i18n").getResourceBundle().getText("Contract");
            var i = a + "\n" + r + "\n" + n + "\n";
            for (var o = 0; o < e.length; o++) {
                i = i + e[o].SalesContract + "\n"
            }
            var s = !!t.getView().$().closest(".sapUiSizeCompact").length;
            sap.m.MessageBox.error(i, {
                styleClass: s ? "sapUiSizeCompact" : ""
            })
        },
        getCurrentOwner: function () {
            var e = this.getView().getModel("mCustIdentification");
            var t = e.getData();
            var a = this;
            var r = t.SchemaTransactionType;
            // var n = this.getView().byId("SCIN_I01").getSelectedKey();
            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var n = null;
            if (oPlantControl) {
                n = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }

            var o = this.getView().getModel().getProperty("/ZAE_I_Plant_03('" + n + "')")["PartnerFunction1"];
            if (r) {
                var s = [];
                s.push(new i("Plant", "EQ", n));
                s.push(new i("PartnerFunction", "EQ", o));
                s.push(new i("Equipment", "EQ", t.customerInfo.Equipment));
                a.byId("FormCustomerInfo").setBusy(true);
                this.getView().getModel().read("/ZAE_I_EquipmentPartner_01", {
                    filters: s,
                    success: function (e, r) {
                        a.byId("FormCustomerInfo").setBusy(false);
                        if (e.results.length > 0) {
                            if (e.results[0].CustomerStatus === "X" || e.results[0].CustomerStatus === true) {
                                a.getView().byId("SCIN_B09").setVisible(false);
                                // a.getView().byId("SCIN_B08").setVisible(false)
                            } else {
                                a.getView().byId("SCIN_B09").setVisible(t.customerInfo.isShowSCIN_B09);
                                // a.getView().byId("SCIN_B08").setVisible(t.customerInfo.isShowSCIN_B08)
                            }
                            t.customerInfo.to_CurrentOwner = e.results[0];
                            a.getView().byId("IdCustomer").bindElement("/ZAE_I_Customer_01('" + e.results[0].Partner + "')");
                            if (!t.customerInfo.to_CurrentOwner) {
                                t.uiOnly.visible.BTNSelctBP = true;
                                t.uiOnly.visible.BTNCreateContractPersonBP = false
                            } else if (t.customerInfo.to_CurrentOwner.PartnerFunction !== "Z1") {
                                t.uiOnly.visible.BTNSelctBP = true;
                                t.uiOnly.visible.BTNCreateContractPersonBP = true
                            } else {
                                t.uiOnly.visible.BTNSelctBP = false;
                                t.uiOnly.visible.BTNCreateContractPersonBP = true
                            }
                            if (t.customerInfo.to_CurrentOwner.CreditBlock === true) {
                                t.customerInfo.to_CurrentOwner.CreditBlock = "Yes"
                            } else {
                                t.customerInfo.to_CurrentOwner.CreditBlock = "No"
                            }
                        } else {
                            t.customerInfo.to_CurrentOwner = [];
                            t.uiOnly.visible.BTNCreateContractPersonBP = false
                        }
                        a.byId("SmartTableContactPersonList").rebindTable();
                        a.byId("SmartTableComplainList").rebindTable();
                        a.byId("SmartTableSalesArea").rebindTable();
                        // a.byId("SmartTableExtendedWarranty").rebindTable();
                        // a.byId("openEVHC").rebindTable();
                        // a.byId("EquipmentRecall").rebindTable();
                        a.byId("OpenServiceRequests").rebindTable()
                    },
                    error: function (e) {
                        a.byId("FormCustomerInfo").setBusy(false);
                        t.customerInfo.to_CurrentOwner = []
                    }
                })
            } else {
                t.customerInfo.to_CurrentOwner = []
            }
        },
        // onPressWorkShop: function (e) {
        //     var t = sap.ushell.Container.getService("CrossApplicationNavigation");
        //     var a = sap.ui.core.Component.getOwnerIdFor(this.getView());
        //     var r = t.createEmptyAppState(sap.ui.component(a));
        //     var n = this.byId("EquipmentVH").getTokens();
        //     var i = "",
        //         o = "";
        //     if (n.length > 0) {
        //         i = n[0].getProperty("key");
        //         o = n[0].getProperty("text")
        //     }
        //     var s = [];
        //     var l = this.byId("SCIN_I02").getTokens();
        //     for (var u = 0; u < l.length; u++) {
        //         s.push({
        //             key: l[u].getProperty("key"),
        //             text: l[u].getProperty("text")
        //         })
        //     }
        //     var g = {
        //         LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
        //         Plant: this.byId("SCIN_I01").getSelectedKey(),
        //         Category: s,
        //         Insurer: this.byId("SCIN_I03").getSelectedKey(),
        //         Equipment: i,
        //         EquipmentWithDesc: o
        //     };
        //     r.setData(g);
        //     r.save();
        //     var d = sap.ui.core.routing.HashChanger.getInstance();
        //     var c = d.getHash();
        //     var C = c + "?" + "sap-iapp-state=" + r.getKey();
        //     d.replaceHash(C);
        //     var p = t && t.hrefForExternal({
        //         target: {
        //             semanticObject: "NavTest",
        //             action: "display"
        //         }
        //     }) || "";
        //     t.toExternal({
        //         target: {
        //             shellHash: p
        //         }
        //     })
        // },
        // onPressSelectPB: function (e) {
        //     if (!this._oSelectBPDialog) {
        //         t.load({
        //             id: "fragSelectBP",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.SelectBP",
        //             controller: this
        //         }).then(function (e) {
        //             this._CreateSelectPBDialog(e);
        //             this._setIntialStateSelectPBDialog()
        //         }.bind(this))
        //     } else {
        //         this._setIntialStateSelectPBDialog()
        //     }
        // },
        // _setIntialStateSelectPBDialog: function () {
        //     var e = this.getView().byId("SCIN_BoxSearchResults").getBindingContext().getObject();
        //     var a = t.byId("fragSelectBP", "Customer");
        //     if (a.getContent() !== null) {
        //         if (e.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
        //             a.getContent().setValue(e.DefaultBP);
        //             a.getContent().setEnabled(false)
        //         } else {
        //             a.getContent().setValue("");
        //             a.getContent().setEnabled(true)
        //         }
        //         this._oSelectBPDialog.open()
        //     }
        // },
        // onCustomerInitialised: function (e) {
        //     this._setIntialStateSelectPBDialog()
        // },
        // _CreateSelectPBDialog: function (e) {
        //     var a = this;
        //     this._oSelectBPDialog = new sap.m.Dialog({
        //         title: "{i18n>SelectCustomer}",
        //         content: [e],
        //         beginButton: new sap.m.Button({
        //             text: "{i18n>Submit}",
        //             press: function () {
        //                 var e = t.byId("fragSelectBP", "Customer").getValue();
        //                 var r = this.getView().getModel("mCustIdentification");
        //                 var n = this.getView().byId("SCIN_I01").getSelectedKey();
        //                 var o = r.getData();
        //                 if (e) {
        //                     var s = [];
        //                     s.push(new i("LTRMPartner", "EQ", e));
        //                     a.getView().byId("IdCustomer").unbindElement();
        //                     a.getView().getModel().read("/ZAE_I_Partner_02", {
        //                         filters: s,
        //                         success: function (e, t) {
        //                             a.getView().byId("SCIN_I02").fireTokenUpdate();
        //                             if (e.results.length > 0) {
        //                                 o.customerInfo.to_CurrentOwner = e.results[0];
        //                                 a.getView().byId("IdCustomer").bindElement("/ZAE_I_Customer_01('" + e.results[0].Partner + "')");
        //                                 if (!o.customerInfo.to_CurrentOwner) {
        //                                     o.uiOnly.visible.BTNSelctBP = true;
        //                                     o.uiOnly.visible.BTNCreateContractPersonBP = false
        //                                 } else if (o.customerInfo.to_CurrentOwner.PartnerFunction !== "Z1") {
        //                                     o.uiOnly.visible.BTNSelctBP = true;
        //                                     o.uiOnly.visible.BTNCreateContractPersonBP = true
        //                                 } else {
        //                                     o.uiOnly.visible.BTNSelctBP = false;
        //                                     o.uiOnly.visible.BTNCreateContractPersonBP = true
        //                                 }
        //                                 if (o.customerInfo.to_CurrentOwner.CreditBlock === true) {
        //                                     o.customerInfo.to_CurrentOwner.CreditBlock = "Yes"
        //                                 } else {
        //                                     o.customerInfo.to_CurrentOwner.CreditBlock = "No"
        //                                 }
        //                                 a.byId("SmartTableContactPersonList").rebindTable();
        //                                 a.byId("SmartTableSalesArea").rebindTable();
        //                                 r.updateBindings(true)
        //                             }
        //                         },
        //                         error: function (e) {
        //                             a.getView().byId("SCIN_I02").fireTokenUpdate()
        //                         }
        //                     })
        //                 }
        //                 this._oSelectBPDialog.close()
        //             }.bind(this)
        //         }),
        //         endButton: new sap.m.Button({
        //             text: "{i18n>Close}",
        //             press: function () {
        //                 this._oSelectBPDialog.close()
        //             }.bind(this)
        //         })
        //     });
        //     this.getView().addDependent(this._oSelectBPDialog);
        //     this._oSelectBPDialog.open()
        // },
        fnCreatePress: function (e) {
            var t = this;
            var a = e.getSource().getId();
            var r = this.getView().getModel("mCustIdentification");
            r.setProperty("/CreateAppointmentDirect", false);
            this.vButtonID = a.split("_")[a.split("_").length - 1];
            var n = this.byId("SmartTableContactPersonList").getTable().getSelectedItem();
            var i = this.getView().getModel("i18n").getResourceBundle().getText("Kindlymaintainemail", [n.getBindingContext().getObject().ContactPerson]);
            // sap.m.MessageBox.information(i, {
            //     icon: sap.m.MessageBox.Icon.INFORMATION,
            //     actions: [sap.m.MessageBox.Action.OK],
            //     emphasizedAction: sap.m.MessageBox.Action.OK,
            //     onClose: function (e) {
            //         if (e === sap.m.MessageBox.Action.OK) {
            //             // this.onPressUpdatepersonaldata()
            //             this.fnCreateAptSrq();
            //         }
            //     }.bind(this)
            // })
            // this.fnCreateAptSrq();
            this.onCreateRequestPress();
        },
        // fnCreateAptSrq: function () {
        //     var e = this;
        //     if (!this._oSelectSOSGDialog) {
        //         t.load({
        //             id: "fragSelectSOSG",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.SelectSOSG",
        //             controller: {
        //                 onCancelPressed: function (t) {
        //                     e._oSelectSOSGDialog.close();
        //                     e.getView().byId("SCIN_I02").removeAllTokens()
        //                 },
        //                 // onCampaignValueHelpRequested: function (t) {
        //                 //     var a = t.getSource();
        //                 //     var r = e.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject().SalesOrganization;
        //                 //     a.setTokens([]);
        //                 //     var n = {
        //                 //         entitySet: "ZAE_VH_CampaignData",
        //                 //         initiallyVisibleFields: "CampaignID,CampaignExternalID,SalesOrganization,CampaignType,CampaignTypeDescription,StartDate,EndDate ",
        //                 //         selectionMode: "Single",
        //                 //         tokenObject: {
        //                 //             key: "CampaignID",
        //                 //             Description: "CampaignExternalID"
        //                 //         },
        //                 //         controlConfiguration: [{
        //                 //             index: 0,
        //                 //             key: "SalesOrganization",
        //                 //             filterType: "auto",
        //                 //             label: "{/#ZAE_VH_CampaignData/SalesOrganization/@sap:label}",
        //                 //             mandatory: "auto",
        //                 //             visible: false
        //                 //         }, {
        //                 //             index: 1,
        //                 //             key: "CampaignID",
        //                 //             filterType: "auto",
        //                 //             label: "{/#ZAE_VH_CampaignData/CampaignID/@sap:label}",
        //                 //             mandatory: "auto",
        //                 //             visible: true
        //                 //         }, {
        //                 //             index: 2,
        //                 //             key: "CampaignExternalID",
        //                 //             filterType: "auto",
        //                 //             label: "{/#ZAE_VH_CampaignData/CampaignExternalID/@sap:label}",
        //                 //             mandatory: "auto",
        //                 //             visible: true
        //                 //         }, {
        //                 //             index: 3,
        //                 //             key: "CampaignType",
        //                 //             filterType: "auto",
        //                 //             label: "{/#ZAE_VH_CampaignData/CampaignType/@sap:label}",
        //                 //             mandatory: "auto",
        //                 //             visible: false
        //                 //         }],
        //                 //         defaultFilter: {
        //                 //             CampaignType: {
        //                 //                 items: [{
        //                 //                     key: "SERVICE"
        //                 //                 }]
        //                 //             },
        //                 //             SalesOrganization: {
        //                 //                 items: [{
        //                 //                     key: r
        //                 //                 }]
        //                 //             }
        //                 //         },
        //                 //         onBeforeRebindSmartTable: function (e) {
        //                 //             var t = e.getParameter("bindingParams").filters;
        //                 //             t.push(new sap.ui.model.Filter({
        //                 //                 path: "SalesOrganization",
        //                 //                 operator: sap.ui.model.FilterOperator.EQ,
        //                 //                 value1: r
        //                 //             }));
        //                 //             t.push(new sap.ui.model.Filter({
        //                 //                 path: "CampaignType",
        //                 //                 operator: sap.ui.model.FilterOperator.EQ,
        //                 //                 value1: "SERVICE"
        //                 //             }));
        //                 //             e.getParameter("bindingParams").filters = t
        //                 //         }
        //                 //     };
        //                 //     e.aeUtil.handleSmartDialogValueHelp(e, a, n)
        //                 // },
        //                 // onCampaignIDTokenUpdate: function (e) {
        //                 //     var t = e.getSource().getTokens()
        //                 // },
        //                 // onSelectCampaignID: function (e) {
        //                 //     if (e.getParameter("selectedRow") !== null) {
        //                 //         var t = e.getSource();
        //                 //         t.setTokens([]);
        //                 //         var a = e.getParameter("selectedRow").getBindingContext().getObject();
        //                 //         var r = this.formatNameAndValuePair(a.CampaignID, a.CampaignExternalID);
        //                 //         var n = new sap.m.Token({
        //                 //             key: a.CampaignID,
        //                 //             text: r
        //                 //         });
        //                 //         t.setTokens([n]);
        //                 //         t.fireTokenUpdate()
        //                 //     }
        //                 // },
        //                 // formatNameAndValuePair: function (e, t) {
        //                 //     if (!e && !t) {
        //                 //         return ""
        //                 //     } else if (t && !e) {
        //                 //         return t.replace(/^0+/, "")
        //                 //     } else if (!t && e) {
        //                 //         return e
        //                 //     } else {
        //                 //         return e + " (" + t.replace(/^0+/, "") + ")"
        //                 //     }
        //                 // },
        //                 // handleCampaignSuggest: function (t) {
        //                 //     var a = e.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject().SalesOrganization;
        //                 //     var r = t.getParameter("suggestValue");
        //                 //     var n = [];
        //                 //     if (r) {
        //                 //         n.push(new i({
        //                 //             filters: [new i({
        //                 //                 path: "CampaignID",
        //                 //                 operator: sap.ui.model.FilterOperator.StartsWith,
        //                 //                 value1: r
        //                 //             }), new i({
        //                 //                 path: "CampaignExternalID",
        //                 //                 operator: sap.ui.model.FilterOperator.StartsWith,
        //                 //                 value1: r
        //                 //             })],
        //                 //             and: false
        //                 //         }));
        //                 //         n.push(new sap.ui.model.Filter({
        //                 //             path: "SalesOrganization",
        //                 //             operator: sap.ui.model.FilterOperator.EQ,
        //                 //             value1: a
        //                 //         }));
        //                 //         n.push(new sap.ui.model.Filter({
        //                 //             path: "CampaignType",
        //                 //             operator: sap.ui.model.FilterOperator.EQ,
        //                 //             value1: "SERVICE"
        //                 //         }))
        //                 //     }
        //                 //     t.getSource().getBinding("suggestionRows").filter(n);
        //                 //     t.getSource().getBinding("suggestionRows").resume()
        //                 // },
        //                 onSubmitPressed: function (a) {
        //                     var r = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
        //                     if (r.AppointmentRule === "1" || r.AppointmentRule === "") {
        //                         if (e.vButtonID === "B08") {
        //                             e.fnPressCreateAppointment()
        //                         } else if (e.vButtonID === "B09") {
        //                             e.onCreateRequestPress()
        //                         }
        //                     } else {
        //                         if (e.vButtonID === "B08" && (r.AppointmentRule === "2" || r.AppointmentRule === "3")) {
        //                             e.fnCheckAppointments()
        //                         } else if (e.vButtonID === "B09") {
        //                             e.onCreateRequestPress()
        //                         }
        //                     }
        //                     e._oSelectSOSGDialog.close()
        //                 },
        //                 fnSalesofficeChange: function (a) {
        //                     var r = a.getSource().getSelectedItem().getBindingContext().getObject();
        //                     var n = e.getView().getModel("mCustIdentification");
        //                     var i = n.getData();
        //                     var o;
        //                     var s;
        //                     var l;
        //                     var u;
        //                     if (e.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
        //                         l = e.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
        //                         u = l.getModel().getProperty(l.getPath())
        //                     } else if (e.oContactList) {
        //                         l = e.oContactList.getBindingContext();
        //                         u = l.getModel().getProperty(l.getPath())
        //                     }
        //                     if (r && r.VerifyBPData) {
        //                         n.setProperty("/VerifyDataCheck", true);
        //                         o = e.formatNameAndValuePair(i.customerInfo.to_CurrentOwner.CustomerName, i.customerInfo.to_CurrentOwner.Partner);
        //                         s = e.formatNameAndValuePair(u.ContactPersonName, u.ContactPerson);
        //                         t.byId("fragSelectSOSG", "idCustomerVerify").setText(o);
        //                         t.byId("fragSelectSOSG", "idCPerson").setText(s);
        //                         t.byId("fragSelectSOSG", "idCPersonNum").setText(u.MobileNumber);
        //                         t.byId("fragSelectSOSG", "idCPersonNameFax").setText(u.FaxNumber);
        //                         t.byId("fragSelectSOSG", "idCPersonEmail").setText(u.EmailAddress)
        //                     } else {
        //                         n.setProperty("/VerifyDataCheck", false)
        //                     }
        //                     e._fnCreateAppointmentInitalState()
        //                 },
        //                 onDetailsConfirmationCheck: function (t) {
        //                     e._fnCreateAppointmentInitalState()
        //                 },
        //                 handleStartDateChange: function () {
        //                     var e = "";
        //                     var a = 0;
        //                     var r = t.byId("fragSelectSOSG", "IdSalesgroup");
        //                     if (r.getSelectedItem()) {
        //                         e = r.getSelectedItem().getBindingContext().getObject()
        //                     } else {
        //                         var n = t.byId("fragSelectSOSG", "IdSalesoffice1").getSelectedKey();
        //                         var r = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
        //                         var i = "/ZAE_I_SalesOfficeGroup_01(Plant='" + Plant + "',SalesOffice='" + n + "',SalesGroup='" + r + "')";
        //                         e = this.getView().getModel().getProperty(i)
        //                     }
        //                     if (e.TimeSlot) {
        //                         a = parseInt(e.TimeSlot)
        //                     }
        //                     var o = t.byId("fragSelectSOSG", "startDate").getDateValue();
        //                     var s = new Date(o);
        //                     s.setMinutes(s.getMinutes() + a);
        //                     t.byId("fragSelectSOSG", "endDate").setDateValue(s);
        //                     t.byId("fragSelectSOSG", "endDate").setMinDate(new Date);
        //                     var l = t.byId("fragSelectSOSG", "endDate").getDateValue();
        //                     var u = new Date;
        //                     if (o < u || o >= l) {
        //                         t.byId("fragSelectSOSG", "startDate").setValueState("Error")
        //                     } else {
        //                         t.byId("fragSelectSOSG", "startDate").setValueState("None");
        //                         t.byId("fragSelectSOSG", "endDate").setValueState("None")
        //                     }
        //                     if (o === null) {
        //                         t.byId("fragSelectSOSG", "endDate").setDateValue(new Date);
        //                         t.byId("fragSelectSOSG", "endDate").setMinDate(new Date)
        //                     }
        //                     this.updateButtonEnabledState()
        //                 },
        //                 handleEndDateChange: function () {
        //                     var e = t.byId("fragSelectSOSG", "startDate").getDateValue();
        //                     var a = t.byId("fragSelectSOSG", "endDate").getDateValue();
        //                     var r = new Date;
        //                     if (a < r || e >= a) {
        //                         t.byId("fragSelectSOSG", "endDate").setValueState("Error")
        //                     } else {
        //                         t.byId("fragSelectSOSG", "endDate").setValueState("None");
        //                         t.byId("fragSelectSOSG", "startDate").setValueState("None")
        //                     }
        //                     this.updateButtonEnabledState()
        //                 },
        //                 updateButtonEnabledState: function () {
        //                     e.fnCheckSubmitButtonEnableState()
        //                 }
        //             }
        //         }).then(function (a) {
        //             this._oSelectSOSGDialog = a;
        //             this.getView().addDependent(this._oSelectSOSGDialog);
        //             t.byId("fragSelectSOSG", "IdSalesoffice1").getBinding("items").attachDataReceived(function (a) {
        //                 if (a.getParameter("data").results.length === 1) {
        //                     t.byId("fragSelectSOSG", "IdSalesoffice1").setSelectedKey(a.getParameter("data").results[0].SalesOffice);
        //                     var r = e.getView().byId("SCIN_I01").getSelectedKey();
        //                     var n = [];
        //                     n.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, r));
        //                     n.push(new sap.ui.model.Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, a.getParameter("data").results[0].SalesOffice));
        //                     t.byId("fragSelectSOSG", "IdSalesgroup").getBinding("items").filter(n);
        //                     if (t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey()) {
        //                         this._fnCreateAppointmentInitalState()
        //                     }
        //                 }
        //             }.bind(this));
        //             this._setSOSGDialogInitialState()
        //         }.bind(this))
        //     } else {
        //         this._setSOSGDialogInitialState()
        //     }
        // },
        // _setSOSGDialogInitialState: function () {
        //     var e = this.getView().getModel("i18n").getResourceBundle();
        //     var a = this.getView().getModel("mCustIdentification");
        //     var r = a.getData();
        //     a.setProperty("/VerifyDataCheck", false);
        //     t.byId("fragSelectSOSG", "idVerifyBpData").setSelected(false);
        //     t.byId("fragSelectSOSG", "IdSalesoffice1").setSelectedKey("");
        //     t.byId("fragSelectSOSG", "IdSalesgroup").setSelectedKey("");
        //     t.byId("fragSelectSOSG", "IdSalesgroup").setSelectedKey(r.SalesGroup);
        //     t.byId("fragSelectSOSG", "BUTTONSubmit").setEnabled(false);
        //     t.byId("fragSelectSOSG", "startDate").setMinDate(new Date);
        //     if (this.CampaignID && this.CampaignID.length > 0) {
        //         var n = this.formatNameAndValuePair(decodeURI(this.cmpgn_extid), this.CampaignID);
        //         var i = new sap.m.Token({
        //             key: this.CampaignID,
        //             text: n
        //         });
        //         t.byId("fragSelectSOSG", "CampaignID").setTokens([i])
        //     } else {
        //         t.byId("fragSelectSOSG", "CampaignID").setTokens([])
        //     }
        //     var o = this.getView().byId("SCIN_I01").getSelectedKey();
        //     var s = [];
        //     var l = false;
        //     var u = this.byId("SmartTableContactPersonList").getTable().getSelectedItem();
        //     if (u && u.getBindingContext().getObject()) {
        //         l = u.getBindingContext().getObject().UpdatedBPCheck
        //     }
        //     if (o) {
        //         s.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, o));
        //         t.byId("fragSelectSOSG", "IdSalesoffice1").getBinding("items").filter(s);
        //         t.byId("fragSelectSOSG", "IdSalesgroup").getBinding("items").filter(s)
        //     }
        //     if (this.vButtonID === "B08") {
        //         this._oSelectSOSGDialog.setTitle(e.getText("CreateAppointment"))
        //     } else {
        //         this._oSelectSOSGDialog.setTitle(e.getText("CreateServiceRequest"))
        //     }
        //     this._oSelectSOSGDialog.open()
        // },
        // fnPressCreateAppointment: function (e) {
        //     var a = this.getView().getModel("mCustIdentification");
        //     var r = a.getData();
        //     var n;
        //     var i;
        //     var o;
        //     var s;
        //     var l;
        //     var u = [];
        //     var g;
        //     var d;
        //     var c;
        //     var C;
        //     var p;
        //     var f;
        //     var m;
        //     var y = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
        //     var v = y.getModel().getProperty(y.getPath());
        //     l = this.getView().byId("SCIN_I01").getSelectedKey();
        //     var I = this.byId("SCIN_I02").getTokens();
        //     if (I === 0) {
        //         I = this.oCategory
        //     }
        //     for (var S = 0; S < I.length; S++) {
        //         u.push({
        //             key: I[S].getProperty("key"),
        //             text: I[S].getProperty("text")
        //         })
        //     }
        //     g = this.byId("SCIN_I03").getSelectedKey();
        //     if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
        //         var f = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
        //         var m = f.getModel().getProperty(f.getPath());
        //         o = m.ContactPerson;
        //         s = m.ContactPersonName
        //     } else if (this.oContactList) {
        //         f = this.oContactList.getBindingContext();
        //         m = f.getModel().getProperty(f.getPath());
        //         o = m.ContactPerson;
        //         s = m.ContactPersonName
        //     } else {
        //         o = "";
        //         s = ""
        //     }
        //     if (r.customerInfo.to_CurrentOwner && r.customerInfo.to_CurrentOwner.Partner) {
        //         n = r.customerInfo.to_CurrentOwner.Partner;
        //         i = r.customerInfo.to_CurrentOwner.CustomerName
        //     } else if (r.customerInfo.CurrentOwner) {
        //         n = r.customerInfo.CurrentOwner;
        //         i = r.customerInfo.CustomerName
        //     } else {
        //         n = "";
        //         i = ""
        //     }
        //     d = v.SalesOrganization;
        //     c = v.DistrChannel;
        //     C = v.Division;
        //     p = r.customerInfo.Make;
        //     var h = sap.ushell.Container.getService("CrossApplicationNavigation");
        //     var b = sap.ui.core.Component.getOwnerIdFor(this.getView());
        //     var P = h.createEmptyAppState(sap.ui.component(b));
        //     var V = t.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
        //     var E = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
        //     var _ = this.CampaignID ? this.CampaignID : "";
        //     var T = this.cmpgn_extid ? this.cmpgn_extid : "";
        //     var N = this.Lead ? this.Lead : "";
        //     var D = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
        //     var O = this.getView().byId("SCIN_I02").getTokens();
        //     if (O.length === 0) {
        //         O = this.oCategory
        //     }
        //     var w = O.length > 0 ? O[0].getText() : "";
        //     var B = {
        //         LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
        //         Plant: l,
        //         Category: u,
        //         Insurer: g
        //     };
        //     P.setData(B);
        //     P.save();
        //     var M = sap.ui.core.routing.HashChanger.getInstance();
        //     var R = "";
        //     M.replaceHash(R);
        //     var A = {
        //         Equipment: r.customerInfo.Equipment ? r.customerInfo.Equipment : "",
        //         Customer: n,
        //         CustomerName: i,
        //         CPerson: o,
        //         CPersonName: s,
        //         Plant: l,
        //         Category: u,
        //         Insurer: g,
        //         SalesOrganization: d,
        //         DistrChannel: c,
        //         Division: C,
        //         SalesOffice: V,
        //         SalesGroup: E,
        //         Description: w,
        //         "sap-iapp-state": P.getKey(),
        //         TransactionType: r.SchemaTransactionType.TransactionType,
        //         CampaignID: _,
        //         Cmpgn_extid: decodeURI(T),
        //         LeadId: N,
        //         Make: p,
        //         AppointmentRule: D.AppointmentRule
        //     };
        //     var k = encodeURIComponent(JSON.stringify(A));
        //     this.getRouter().navTo("AppointmentView", {
        //         param1: k
        //     });
        //     this.getView().byId("SCIN_I02").removeAllTokens()
        // },
        // fnAfterNavigate: function (e, t, a) {
        //     this.getView().setBusy(false)
        // },
        // onPressCreateContactPerson: function (e) {
        //     if (!this._oNewContactPersonDialog) {
        //         t.load({
        //             id: "fragCreateContactPerson",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ContactPerson",
        //             controller: this
        //         }).then(function (e) {
        //             this._CreateContactPersonDialog(e);
        //             this._setContactPersonDialogInitialState()
        //         }.bind(this))
        //     } else {
        //         this._setContactPersonDialogInitialState()
        //     }
        // },
        // _CreateContactPersonDialog: function (e) {
        //     var a;
        //     var r;
        //     var n;
        //     var i;
        //     var o;
        //     var s;
        //     var l;
        //     var u = this;
        //     var g;
        //     var d;
        //     var c;
        //     var C;
        //     var p;
        //     var f;
        //     var m;
        //     var y;
        //     this._oNewContactPersonDialog = new sap.m.Dialog({
        //         title: "{i18n>CreateContactPerson}",
        //         content: [e],
        //         beginButton: new sap.m.Button({
        //             text: "{i18n>Create}",
        //             enabled: "{mCustIdentification>/uiOnly/enable/ContactPersonCreateButton}",
        //             press: function () {
        //                 u._oNewContactPersonDialog.setBusy(true);
        //                 var e = u.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
        //                 var v = e.getModel().getProperty(e.getPath());
        //                 a = t.byId("fragCreateContactPerson", "SALUTATION").getSelectedKey();
        //                 f = t.byId("fragCreateContactPerson", "REGIOGROUP").getSelectedKey();
        //                 r = t.byId("fragCreateContactPerson", "FIRSTNAME").getValue();
        //                 n = t.byId("fragCreateContactPerson", "FAMILYNAME").getValue();
        //                 i = t.byId("fragCreateContactPerson", "TELNO").getValue().split(" ")[1];
        //                 o = t.byId("fragCreateContactPerson", "MOBILENO").getValue().split(" ")[1];
        //                 p = t.byId("fragCreateContactPerson", "FAXNUMBER").getValue().split(" ")[1];
        //                 s = t.byId("fragCreateContactPerson", "EMAIL").getValue();
        //                 l = t.byId("fragCreateContactPerson", "CPRNO").getValue();
        //                 g = t.byId("fragCreateContactPerson", "CITY").getValue();
        //                 d = t.byId("fragCreateContactPerson", "STREET").getValue();
        //                 m = t.byId("fragCreateContactPerson", "COUNTRY").getTokens()[0];
        //                 if (m) {
        //                     c = m.getKey()
        //                 }
        //                 y = t.byId("fragCreateContactPerson", "REGION").getTokens()[0];
        //                 if (y) {
        //                     C = y.getKey()
        //                 }
        //                 var I = "ZAE_FM_SC_CONTACT_CREATESet";
        //                 var S = u.getView().getModel();
        //                 var h = u.getView().getModel("mCustIdentification").getData();
        //                 var b = h.customerInfo.to_CurrentOwner.Partner;
        //                 var P = [{
        //                     callProperty: "Salutation",
        //                     value: a
        //                 }, {
        //                     callProperty: "FirstName",
        //                     value: r
        //                 }, {
        //                     callProperty: "LastName",
        //                     value: n
        //                 }, {
        //                     callProperty: "TelNo",
        //                     value: i
        //                 }, {
        //                     callProperty: "MobileNo",
        //                     value: o
        //                 }, {
        //                     callProperty: "Email",
        //                     value: s
        //                 }, {
        //                     callProperty: "Identificationnumber",
        //                     value: l
        //                 }, {
        //                     callProperty: "Identificationcategory",
        //                     value: "YCPR01"
        //                 }, {
        //                     callProperty: "MainContact",
        //                     value: b
        //                 }, {
        //                     callProperty: "City",
        //                     value: g
        //                 }, {
        //                     callProperty: "Street",
        //                     value: d
        //                 }, {
        //                     callProperty: "Country",
        //                     value: c
        //                 }, {
        //                     callProperty: "Region",
        //                     value: C
        //                 }, {
        //                     callProperty: "FaxNumber",
        //                     value: p
        //                 }, {
        //                     callProperty: "Location",
        //                     value: f
        //                 }];
        //                 if (v.SalesOrganization) {
        //                     P.push({
        //                         callProperty: "SalesOrg",
        //                         value: v.SalesOrganization
        //                     })
        //                 }
        //                 var V = function (e) {
        //                     u.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     u.onSearch();
        //                     u._oNewContactPersonDialog.setBusy(false);
        //                     u._oNewContactPersonDialog.close()
        //                 };
        //                 var E = function (e) {
        //                     u.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     u.onSearch();
        //                     u._oNewContactPersonDialog.setBusy(false);
        //                     u._oNewContactPersonDialog.close()
        //                 };
        //                 u.aeUI5Util.createCall(u, S, I, P, V, E)
        //             }.bind(this)
        //         }),
        //         endButton: new sap.m.Button({
        //             text: "{i18n>Close}",
        //             press: function () {
        //                 this._oNewContactPersonDialog.close()
        //             }.bind(this)
        //         })
        //     });
        //     this.getView().addDependent(this._oNewContactPersonDialog)
        // },
        // _setContactPersonDialogInitialState: function () {
        //     this._setDefaultValues("fragCreateContactPerson");
        //     t.byId("fragCreateContactPerson", "SALUTATION").setSelectedKey(null);
        //     t.byId("fragCreateContactPerson", "FIRSTNAME").setValue("");
        //     t.byId("fragCreateContactPerson", "FAMILYNAME").setValue("");
        //     t.byId("fragCreateContactPerson", "TELNO").setValue("");
        //     t.byId("fragCreateContactPerson", "TELNO").setMask("");
        //     t.byId("fragCreateContactPerson", "REGIOGROUP").setSelectedKey(null);
        //     t.byId("fragCreateContactPerson", "TELNO").setValueState("None");
        //     t.byId("fragCreateContactPerson", "FAXNUMBER").setValue("");
        //     t.byId("fragCreateContactPerson", "FAXNUMBER").setMask("");
        //     t.byId("fragCreateContactPerson", "FAXNUMBER").setValueState("None");
        //     t.byId("fragCreateContactPerson", "EMAIL").setValue("");
        //     t.byId("fragCreateContactPerson", "CPRNO").setValue("");
        //     t.byId("fragCreateContactPerson", "STREET").setValue("");
        //     t.byId("fragCreateContactPerson", "CITY").setValue("");
        //     t.byId("fragCreateContactPerson", "COUNTRY").setValue("");
        //     t.byId("fragCreateContactPerson", "COUNTRY").setValueState("None");
        //     t.byId("fragCreateContactPerson", "REGION").setValue("");
        //     t.byId("fragCreateContactPerson", "REGION").setValueState("None");
        //     t.byId("fragCreateContactPerson", "REGION").setTokens([]);
        //     t.byId("fragCreateContactPerson", "MOBILENO").setValue("");
        //     t.byId("fragCreateContactPerson", "MOBILENO").setMask("");
        //     t.byId("fragCreateContactPerson", "MOBILENO").setValueState("None");
        //     this._fnContractButtonCreateButtonEnabledState();
        //     this.fnLoadCreateContactBPIDType()
        // },
        // _CreateContactPersonValidation: function () {
        //     var e = this;
        //     var a = e.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
        //     var r = a.getModel().getProperty(a.getPath());
        //     var n = e.getView().getModel();
        //     var i = [];
        //     i.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, r.SalesOrganization));
        //     i.push(new sap.ui.model.Filter("CustomerType", sap.ui.model.FilterOperator.EQ, "1"));
        //     i.push(new sap.ui.model.Filter("BPType", sap.ui.model.FilterOperator.EQ, "1"));
        //     n.read("/ZAE_I_TC_SCIN_08", {
        //         filters: i,
        //         success: function (a, r) {
        //             if (a.results.length > 0) {
        //                 for (var n = 0; n < a.results.length; n++) {
        //                     var i = t.byId("fragCreateContactPerson", a.results[n].Field);
        //                     if (i !== undefined && a.results[n].Mandatory === true) {
        //                         t.byId("fragCreateContactPerson", a.results[n].Field).setRequired(true)
        //                     }
        //                 }
        //             }
        //             e._fnContractButtonCreateButtonEnabledState()
        //         }
        //     })
        // },
        // _fnContractButtonCreateButtonEnabledState: function () {
        //     var e = this.getView().getModel("mCustIdentification");
        //     var a = e.getData();
        //     var r = t.byId("fragCreateContactPerson", "SALUTATION");
        //     var n = t.byId("fragCreateContactPerson", "FIRSTNAME");
        //     var i = t.byId("fragCreateContactPerson", "FAMILYNAME");
        //     var o = t.byId("fragCreateContactPerson", "CPRNO");
        //     var s = t.byId("fragCreateContactPerson", "COUNTRY");
        //     var l = t.byId("fragCreateContactPerson", "REGION");
        //     var u = t.byId("fragCreateContactPerson", "TELNO");
        //     var g = t.byId("fragCreateContactPerson", "EMAIL");
        //     var d = t.byId("fragCreateContactPerson", "FAXNUMBER");
        //     var c = t.byId("fragCreateContactPerson", "STREET");
        //     var C = t.byId("fragCreateContactPerson", "CITY");
        //     var p = t.byId("fragCreateContactPerson", "MOBILENO");
        //     var f = t.byId("fragCreateContactPerson", "REGIOGROUP");
        //     var m = (r.getRequired() ? r.getSelectedKey() !== "" : true) && (n.getRequired() ? n.getValue() !== "" : true) && (i.getRequired() ? i.getValue() !== "" : true) && (o.getRequired() ? o.getTokens([]).length !== "" : true) && (s.getRequired() ? s.getTokens([]).length !== 0 : true) && (l.getRequired() ? l.getTokens([]).length !== 0 : true) && (u.getRequired() ? u.getValue() !== "" && !u.getValue().includes("_") : true) && (u.getValueState() !== "Error" ? true : false) && (d.getRequired() ? d.getValue() !== "" && !d.getValue().includes("_") : true) && (d.getValueState() !== "Error" ? true : false) && (g.getRequired() ? g.getValue() !== "" : true) && (g.getValueState() === "None" ? true : false) && (c.getRequired() ? c.getValue() !== "" : true) && (C.getRequired() ? C.getValue() !== "" : true) && (p.getRequired() ? p.getValue() !== "" && !p.getValue().includes("_") : true) && (p.getValueState() !== "Error" ? true : false) && (f.getRequired() ? f.getSelectedKey() !== "" : true);
        //     a.uiOnly.enable.ContactPersonCreateButton = m;
        //     e.updateBindings(true)
        // },
        // fnLoadCreateContactBPIDType: function () {
        //     var e = this;
        //     var a = t.byId("fragCreateContactPerson", "CPRNO").getLabels()[0];
        //     var r = [];
        //     var n = t.byId("fragCreateContactPerson", "COUNTRY").getTokens()[0].getKey();
        //     r.push(new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.EQ, n));
        //     this.getView().getModel().read("/ZAE_I_BPIDTypes_02", {
        //         filters: r,
        //         success: function (t, r) {
        //             if (t.results.length > 0) {
        //                 a.setText(t.results[0].IDText)
        //             } else {
        //                 a.setText("Emirates ID")
        //             }
        //             e._oNewContactPersonDialog.open();
        //             e._oNewContactPersonDialog.getBeginButton().setEnabled(false)
        //         },
        //         error: function (t) {
        //             if (FragmentID === "fragCreateContactPerson") {
        //                 e._oNewContactPersonDialog.open();
        //                 e._oNewContactPersonDialog.getBeginButton().setEnabled(false)
        //             }
        //         }
        //     })
        // },
        // handleValueHelpLanguage: function (e) {
        //     var a = this;
        //     if (!this._valueHelpDialog2) {
        //         t.load({
        //             id: "valueHelpDialogFragment",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.LanguageVH",
        //             controller: this
        //         }).then(function (e) {
        //             a._valueHelpDialog2 = e;
        //             a._valueHelpDialog2.setModel(a.getView().getModel());
        //             a.getView().addDependent(a._valueHelpDialog2);
        //             a._valueHelpDialog2.open()
        //         })
        //     } else {
        //         a._valueHelpDialog2.open()
        //     }
        // },
        // onSearchValueHelp: function (e) {
        //     var t = e.getParameter("value");
        //     var a = [];
        //     if (t) {
        //         a.push(new sap.ui.model.Filter({
        //             filters: [new sap.ui.model.Filter("LanguageISOCode", sap.ui.model.FilterOperator.Contains, t), new sap.ui.model.Filter("LanguageName", sap.ui.model.FilterOperator.Contains, t)],
        //             and: false
        //         }))
        //     }
        //     var r = e.getParameter("itemsBinding");
        //     r.filter(a)
        // },
        // onLanguageValueHelpDialogClose: function (e) {
        //     var a = e.getParameter("selectedItem");
        //     var r = e.getParameter("selectedItem").getBindingContext().getObject();
        //     var n = t.byId("fragCreateCustomer", "LANGUAGE");
        //     var i = this.formatNameAndValuePair(r.LanguageName, r.LanguageISOCode);
        //     n.data("key", r.LanguageISOCode);
        //     n.setValue(i)
        // },
        // handleLanguageSuggest: function (e) {
        //     var t = this;
        //     var a = e.getParameter("suggestValue");
        //     var r = [];
        //     var n = new sap.ui.model.Filter(r, o);
        //     var o = true;
        //     if (a) {
        //         r.push(new i({
        //             filters: [new i({
        //                 path: "LanguageISOCode",
        //                 operator: sap.ui.model.FilterOperator.StartsWith,
        //                 value1: a
        //             }), new i({
        //                 path: "LanguageName",
        //                 operator: sap.ui.model.FilterOperator.StartsWith,
        //                 value1: a
        //             })],
        //             and: false
        //         }))
        //     }
        //     var n = new sap.ui.model.Filter(r, o);
        //     e.getSource().getBinding("suggestionRows").filter(n);
        //     e.getSource().getBinding("suggestionRows").resume()
        // },
        // onSelectLanguage: function (e) {
        //     if (e.getParameter("selectedRow") !== null) {
        //         var a = e.getSource();
        //         a.setValue("");
        //         var r = e.getParameter("selectedRow").getBindingContext().getObject();
        //         var n = this.formatNameAndValuePair(r.LanguageName, r.LanguageISOCode);
        //         a.setValue(n);
        //         t.byId("fragCreateCustomer", "LANGUAGE").data("key", r.LanguageISOCode)
        //     }
        // },
        // onCancelComplaint: function (e) {
        //     this._valueHelpDialog2.close()
        // },
        // onCreateCustomer: function (e) {
        //     if (!this._oNewCreateCustomerDialog) {
        //         t.load({
        //             id: "fragCreateCustomer",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateCustomer",
        //             controller: this
        //         }).then(function (e) {
        //             this._CreateCustomerDialog(e);
        //             this._setCreateCustomerDialogInitialState()
        //         }.bind(this))
        //     } else {
        //         this._setCreateCustomerDialogInitialState()
        //     }
        // },
        onServiceRequestSelectionChange: function (e) {
            var oTable = e.getSource();
            var oSelectedItem = oTable.getSelectedItem();

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext();
                if (oContext) {
                    this._selectedServiceRequest = oContext.getObject();
                    if (this._selectedServiceRequest.SystemStatus != "I1003") {
                        this.getView().byId("SCIN_B101").setEnabled(true);
                    }
                    else {
                        this._selectedServiceRequest = null;
                        this.getView().byId("SCIN_B101").setEnabled(false);
                    }
                }
            } else {
                this._selectedServiceRequest = null;
                this.getView().byId("SCIN_B101").setEnabled(false);
            }
        },

        onPressSkipMSA: function (e) {

            if (!this._selectedServiceRequest) {
                sap.m.MessageBox.warning("Please select a Service Request first.");
                return;
            }

            if (!this._oNewSkipMsaDialog) {
                t.load({
                    id: "fragSkipMsa",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.SkipMsa",
                    controller: this
                }).then(function (e) {
                    this._SkipMsaDialog(e);
                    this._setSkipMsaDialogInitialState()
                }.bind(this))
            } else {
                this._setSkipMsaDialogInitialState()
            }
        },

        _SkipMsaDialog: function (e) {
            var w = this;

            this._oNewSkipMsaDialog = new sap.m.Dialog({
                title: "Skip MSA",
                content: [e],
                contentWidth: "350px",
                resizable: true,
                stretch: false,
                beginButton: new sap.m.Button({
                    text: "Create",
                    enabled: false,
                    press: function () {
                        w._updateServiceRequestWithSkipMsa();
                    }
                }),
                endButton: new sap.m.Button({
                    text: "{i18n>Close}",
                    press: function () {
                        this._oNewSkipMsaDialog.close();
                    }.bind(this)
                })
            });

            this.getView().addDependent(this._oNewSkipMsaDialog);
        },
        _setSkipMsaDialogInitialState: function () {
            var e = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();

            t.byId("fragSkipMsa", "ODOMETERREADING").setValue("");
            t.byId("fragSkipMsa", "FUELGAUGE").setSelectedKey(null);
            t.byId("fragSkipMsa", "DELIVERYDATE").setDateValue(null);
            t.byId("fragSkipMsa", "NOTES").setValue("");
            t.byId("fragSkipMsa", "PREVIOUSODOMETER").setValue("");

            if (this._selectedServiceRequest) {
                t.byId("fragSkipMsa", "SERVICEREQUEST1").setValue(
                    this._selectedServiceRequest.ServiceRequest + " - " +
                    (this._selectedServiceRequest.ServiceDocumentDescription || "")
                );
            }

            t.byId("fragSkipMsa", "DELIVERYDATE").setMinDate(new Date());

            this._oNewSkipMsaDialog.getBeginButton().setEnabled(false);

            this._loadPreviousOdometerForSkipMsa();

            this._oNewSkipMsaDialog.open();
        },

        _loadPreviousOdometerForSkipMsa: function () {
            var oModel = this.getView().getModel("mCustIdentification");
            var oData = oModel.getData();
            var sEquipment = oData.Equipment || (oData.customerInfo && oData.customerInfo.Equipment);

            if (!sEquipment) {
                return;
            }

            var aFilters = [];
            aFilters.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, sEquipment));

            this.getView().getModel().read("/ZOTE_I_LASTMEASURINGVALUE", {
                filters: aFilters,
                success: function (oResponse) {
                    if (oResponse.results && oResponse.results.length > 0) {
                        var sPreviousOdometer = oResponse.results[0].CurrentKms || "";
                        t.byId("fragSkipMsa", "PREVIOUSODOMETER").setValue(sPreviousOdometer);
                    } else {
                        t.byId("fragSkipMsa", "PREVIOUSODOMETER").setValue("");
                    }
                }.bind(this),
                error: function (oError) {
                    t.byId("fragSkipMsa", "PREVIOUSODOMETER").setValue("");
                }.bind(this)
            });
        },

        fnCheckSkipMsaRequiredValidation: function () {
            var sOdometerReading = t.byId("fragSkipMsa", "ODOMETERREADING").getValue();
            var sFuelGauge = t.byId("fragSkipMsa", "FUELGAUGE").getSelectedKey();
            var oDeliveryDate = t.byId("fragSkipMsa", "DELIVERYDATE").getDateValue();

            var bEnabled = sOdometerReading !== "" && sFuelGauge !== null && sFuelGauge !== "" &&
                oDeliveryDate !== null;

            if (this._oNewSkipMsaDialog) {
                this._oNewSkipMsaDialog.getBeginButton().setEnabled(bEnabled);
            }
        },

        _updateServiceRequestWithSkipMsa: function () {
            var w = this;
            var oDialog = w._oNewSkipMsaDialog;

            oDialog.setBusy(true);

            var sServiceRequest = this._selectedServiceRequest ? this._selectedServiceRequest.ServiceRequest : "";
            var sOdometerReading = t.byId("fragSkipMsa", "ODOMETERREADING").getValue();
            var sFuelGauge = t.byId("fragSkipMsa", "FUELGAUGE").getSelectedKey();
            var S = t.byId("fragSkipMsa", "DELIVERYDATE").getDateValue();
            var sNotes = t.byId("fragSkipMsa", "NOTES").getValue();
            var sPreviousOdometer = t.byId("fragSkipMsa", "PREVIOUSODOMETER").getValue();

            var a = new Date(S);
            var I = "/Date(" + a.getTime() + ")/";
            var P = "PT" + ("00" + a.getHours()).slice(-2) + "H" + ("00" + a.getMinutes()).slice(-2) + "M" + ("00" + a.getSeconds()).slice(-2) + "S";

            var oModel = this.getView().getModel("mCustIdentification");
            var oData = oModel.getData();
            var sEquipment = oData.Equipment || (oData.customerInfo && oData.customerInfo.Equipment);

            if (!sServiceRequest) {
                sap.m.MessageBox.error("No Service Request selected.");
                oDialog.setBusy(false);
                return;
            }

            if (!sEquipment) {
                sap.m.MessageBox.error("Equipment not found. Please search for an equipment first.");
                oDialog.setBusy(false);
                return;
            }

            var sFunctionImport = "ZOTE_FM_SRV_QRC_UPD_SERREQSet";
            var oServiceModel = this.getView().getModel("ZOTE_FM_SRV_QRC_UPD_SERREQ_SRV");

            var aMainData = [{
                IServiceRequest: sServiceRequest,
                IEqunr: sEquipment,
                IRecordedValueKm: sOdometerReading,
                IFuelLevel: sFuelGauge,
                IReqDate: I,
                IReqTime: P
            }];

            var aPayload = [{
                callProperty: "N_Main",
                value: aMainData
            }];

            if (sNotes && sNotes !== "") {

                var aNotesLines = sNotes.split('\n');
                var aSrTexts = [];

                for (var i = 0; i < aNotesLines.length; i++) {
                    var sLine = aNotesLines[i].trim();
                    if (sLine !== "") {
                        aSrTexts.push({
                            Tdformat: " ",
                            Tdline: sLine
                        });
                    }
                }

                if (aSrTexts.length > 0) {
                    aPayload.push({
                        callProperty: "N_SR_Texts",
                        value: aSrTexts
                    });
                }
            }

            w.aeUI5Util.createCall(
                w,
                oServiceModel,
                sFunctionImport,
                aPayload,
                function (oResponse) {
                    oDialog.setBusy(false);
                    oDialog.close();

                    var sMessage = "Service Request " + sServiceRequest + " updated with Skip MSA data successfully!";

                    var oMessage = new sap.ui.core.message.Message({
                        persistent: true,
                        type: sap.ui.core.MessageType.Success,
                        message: sMessage,
                        additionalText: "",
                        description: "Skip MSA"
                    });
                    sap.ui.getCore().getMessageManager().addMessages(oMessage);

                    w.getView().byId("SCIN_I02").fireTokenUpdate();
                    w.getView().getModel().refresh();

                    w._selectedServiceRequest = null;
                    w.getView().byId("OpenServiceRequests").getTable().removeSelections();
                    w.getView().byId("SCIN_B101").setEnabled(false);
                },
                function (oError) {
                    oDialog.setBusy(false);

                    var sErrorMessage = "Failed to update Service Request with Skip MSA data.";
                    if (oError && oError.responseText) {
                        try {
                            var parsedError = JSON.parse(oError.responseText);
                            if (parsedError && parsedError.error && parsedError.error.message) {
                                sErrorMessage = parsedError.error.message.value || parsedError.error.message;
                            }
                        } catch (parseErr) {
                            sErrorMessage = oError.responseText.substring(0, 500);
                        }
                    }

                    sap.m.MessageBox.error(sErrorMessage, {
                        title: "Error",
                        details: sErrorMessage,
                        styleClass: "sapUiSizeCompact"
                    });

                    console.error("Skip MSA Update Error:", oError);
                }
            );
        },

        onCreateCustomerEqui: function (e) {
            if (!this._oNewCreateCustomerEquiDialog) {
                t.load({
                    id: "fragCreateCustomerEqui",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateCustomerEquipment",
                    controller: this
                }).then(function (e) {
                    this._CreateCustomerEquiDialog(e);
                    this._setCreateCustomerEquiDialogInitialState()
                }.bind(this))
            } else {
                this._setCreateCustomerEquiDialogInitialState()
            }
        },

        _CreateCustomerEquiDialog: function (e) {
            var w = this;

            this._oNewCreateCustomerEquiDialog = new sap.m.Dialog({
                title: "Create Customer And Equipment",
                content: [e],
                beginButton: new sap.m.Button({
                    text: "Validate",
                    enabled: "{mCustIdentification>/uiOnly/enable/CustomerEquiCreateButton}",
                    press: function () {
                        w._validateAndCreateCustomerEquipment();
                    }
                }),
                endButton: new sap.m.Button({
                    text: "{i18n>Close}",
                    press: function () {
                        this._oNewCreateCustomerEquiDialog.close();
                    }.bind(this)
                })
            });

            this.getView().addDependent(this._oNewCreateCustomerEquiDialog);
        },

        _validateAndCreateCustomerEquipment: function () {
            var w = this;
            var oDialog = w._oNewCreateCustomerEquiDialog;

            oDialog.setBusy(true);

            // var plant = w.byId("SCIN_I01").getSelectedKey();
            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;
            var plant = null;
            if (oPlantControl) {
                plant = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            var s = t.byId("fragCreateCustomerEqui", "idMaterial").getTokens([]);
            if (s.length > 0) {
                u = t.byId("fragCreateCustomerEqui", "idMaterial").getTokens()[0].getKey()
            } else {
                u = ""
            }

            var data = {
                Plant: plant,
                Vkorg: t.byId("fragCreateCustomerEqui", "SALESORGANIZATION").getSelectedKey(),
                Vtweg: t.byId("fragCreateCustomerEqui", "DISTRIBUTIONCHANNEL").getSelectedKey(),
                Spart: t.byId("fragCreateCustomerEqui", "DIVISION").getSelectedKey(),
                Salutation: t.byId("fragCreateCustomerEqui", "SALUTATION").getSelectedKey(),
                FirstName: t.byId("fragCreateCustomerEqui", "FIRSTNAME").getValue(),
                MiddleName: t.byId("fragCreateCustomerEqui", "NAMEMIDDLE").getValue(),
                LastName: t.byId("fragCreateCustomerEqui", "FAMILYNAME").getValue(),
                MobNo1: t.byId("fragCreateCustomerEqui", "MOBILENO1").getValue().split(" ")[1] || "",
                MobNo2: t.byId("fragCreateCustomerEqui", "MOBILENO2").getValue().split(" ")[1] || "",
                Country: t.byId("fragCreateCustomerEqui", "COUNTRY").getTokens()[0] ?
                    t.byId("fragCreateCustomerEqui", "COUNTRY").getTokens()[0].getKey() : "",
                Email: t.byId("fragCreateCustomerEqui", "EMAIL").getValue(),
                Identificationnumber: t.byId("fragCreateCustomerEqui", "CPRNO").getValue(),
                Objecttype: t.byId("fragCreateCustomerEqui", "FleetObjectType").getSelectedKey(),
                Make: t.byId("fragCreateCustomerEqui", "Make").getSelectedKey(),
                Model: t.byId("fragCreateCustomerEqui", "Model").getSelectedKey(),
                Modelyear: t.byId("fragCreateCustomerEqui", "ModelYear").getSelectedKey(),
                Descript: t.byId("fragCreateCustomerEqui", "Description").getValue(),
                LicenseNum: t.byId("fragCreateCustomerEqui", "LicenseNumber").getValue(),
                FleetVin: t.byId("fragCreateCustomerEqui", "Vinno").getValue(),
                Matnr: u,
                SkipCreated: false,
                ValidationFailed: false
            };

            var functionImport = "ZOTE_FM_SRV_QRC_CRT_CUST_EQPSet";
            w.aeUI5Util.createCall(w, w.getView().getModel(), functionImport, this._preparePayload(data),
                function (response) {
                    oDialog.setBusy(false);

                    var validationFailed = response.ValidationFailed || false;

                    if (validationFailed) {
                        sap.m.MessageBox.error("Validation Failed", {
                            title: "Validation Error",
                            details: response.message || "Please check the entered data."
                        });
                    } else {
                        sap.m.MessageBox.confirm(
                            "Validation successful. Do you want to create the Customer and Equipment?",
                            {
                                title: "Confirmation",
                                onClose: function (sAction) {
                                    if (sAction === sap.m.MessageBox.Action.OK) {
                                        w._performActualCreation(data);
                                    }
                                }
                            }
                        );
                    }
                },
                function (error) {
                    oDialog.setBusy(false);

                    var errorMessage = "An unknown error occurred during validation.";

                    if (error && error.responseText) {
                        try {
                            var parsedError = JSON.parse(error.responseText);

                            if (parsedError && parsedError.error && parsedError.error.message) {
                                errorMessage = parsedError.error.message.value ||
                                    parsedError.error.message;
                            }
                            else if (parsedError && Array.isArray(parsedError)) {
                                errorMessage = parsedError[0] && parsedError[0].message ?
                                    parsedError[0].message : errorMessage;
                            }
                        } catch (parseErr) {
                            errorMessage = error.responseText.substring(0, 500);
                        }
                    }
                    else if (error && error.message) {
                        errorMessage = error.message;
                    }
                    else if (error && error.response && error.response.message) {
                        errorMessage = error.response.message;
                    }

                    sap.m.MessageBox.error(errorMessage, {
                        title: "Validation Failed",
                        details: errorMessage,
                        styleClass: "sapUiSizeCompact"
                    });

                    console.error("Validation Error Details:", error);
                }
            );
        },


        _performActualCreation: function (data) {
            var w = this;
            var oDialog = w._oNewCreateCustomerEquiDialog;

            oDialog.setBusy(true);

            data.SkipCreated = true;

            var functionImport = "ZOTE_FM_SRV_QRC_CRT_CUST_EQPSet";

            w.aeUI5Util.createCall(w, w.getView().getModel(), functionImport, this._preparePayload(data),
                function (response) {
                    oDialog.setBusy(false);
                    oDialog.close();

                    w.getView().byId("SCIN_I02").fireTokenUpdate();
                    w.getView().getModel().refresh();

                    sap.m.MessageToast.show("Customer and Equipment created successfully!");
                },
                function (error) {
                    oDialog.setBusy(false);
                    sap.m.MessageBox.error("Creation failed. Please check the logs.");
                    console.error(error);
                }
            );
        },

        _preparePayload: function (data) {
            var payload = [];
            Object.keys(data).forEach(function (key) {
                payload.push({
                    callProperty: key,
                    value: data[key]
                });
            });
            return payload;
        },

        _setCreateCustomerEquiDialogInitialState: function () {
            var e = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
            this._setDefaultValuesEqui("fragCreateCustomerEqui");
            t.byId("fragCreateCustomerEqui", "SALESORGANIZATION").setSelectedKey(null);
            var model = this.getView().getModel("mCustIdentification");
            model.setProperty("/uiOnly/enable/CustomerEquiCreateButton", false);
            this.fnLoadBPIDTypeEqui();
            setTimeout(() => {
                this._fnCustomerEquiCreateButtonEnabledState();
            }, 300);
            this._oNewCreateCustomerEquiDialog.open()
            var e = [];
            e.push(new sap.ui.model.Filter("Characteristic", sap.ui.model.FilterOperator.EQ, "YEAR"));
            t.byId("fragCreateCustomerEqui", "ModelYear").getBinding("items").filter(e);
        },

        fnLoadBPIDTypeEqui: function () {
            var e = this;
            var a = [];
            var r = t.byId("fragCreateCustomerEqui", "COUNTRY").getTokens()[0].getKey();
            a.push(new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.EQ, r));
            var n = [];
            // var i = this.getView().byId("SCIN_I01").getSelectedKey();
            // Inside _filterTable function
            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var i = null;
            if (oPlantControl) {
                i = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            n.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, i));
            var o = this.getView().getModel();
            o.setUseBatch(true);
            o.read("/ZAE_I_BPIDTypes_02", {
                filters: a,
                groupId: "CreateCompanyEqui"
            });
            o.read("/ZAE_I_TC_CUST_SERV", {
                filters: n,
                groupId: "CreateCompanyEqui"
            });
            o.setDeferredGroups(["CreateCompanyEqui"]);
            o.submitChanges({
                groupId: "CreateCompanyEqui",
                success: function (t) {
                    o.setUseBatch(false);
                    e._fnCreateCustomerEquiData(t.__batchResponses)
                },
                error: function (e) {
                    o.setUseBatch(false)
                }
            })
        },
        _fnCreateCustomerEquiData: function (e) {
            var a = this.getView().getModel("i18n");
            var n = this.getView().getModel("mCreateCustomerEqui");
            n.getData().oCreateCustomerData.MainResults = e[1].data.results;
            var n = this.getView().getModel("mCreateCustomerEqui");
            var i = [...new Map(e[1].data.results.map(e => [e.SalesOrganization, e])).values()];
            i.sort(function (e, t) {
                return e.SalesOrganization.localeCompare(t.SalesOrganization)
            });
            n.getData().oCreateCustomerData.CreateCustomerSalesOrg = i;
            n.updateBindings(true);
            if (i.length === 1) {
                t.byId("fragCreateCustomerEqui", "SALESORGANIZATION").setSelectedKey(i[0].SalesOrganization);
                t.byId("fragCreateCustomerEqui", "DISTRIBUTIONCHANNEL").setEnabled(true);
                t.byId("fragCreateCustomerEqui", "DIVISION").setEnabled(true);
                this._fnCreateCustomerEquiValidation();
                this.fnSalesOrgChangeEqui()
            }
        },

        fnSalesOrgChangeEqui: function () {
            var e = this.getView().getModel("mCreateCustomerEqui");
            var a = e.getData().oCreateCustomerData.MainResults;
            var r = t.byId("fragCreateCustomerEqui", "SALESORGANIZATION").getSelectedKey();
            var n = a.filter(function (e) {
                return e.SalesOrganization === r
            });
            var i = [...new Map(n.map(e => [e.DistributionChannel, e])).values()];
            i.sort(function (e, t) {
                return e.DistributionChannel.localeCompare(t.DistributionChannel)
            });
            e.getData().oCreateCustomerData.CreateCustomerDC = i;
            e.updateBindings(true);
            if (i.length === 1) {
                t.byId("fragCreateCustomerEqui", "DISTRIBUTIONCHANNEL").setSelectedKey(i[0].DistributionChannel);
                this.fnDistributionChangeEqui()
            }
            t.byId("fragCreateCustomerEqui", "DISTRIBUTIONCHANNEL").setEnabled(true);
            this._fnCustomerEquiCreateButtonEnabledState()
        },
        fnDistributionChangeEqui: function (e) {
            var a = this.getView().getModel("mCreateCustomerEqui");
            var r = a.getData().oCreateCustomerData.MainResults;
            var n = t.byId("fragCreateCustomerEqui", "SALESORGANIZATION").getSelectedKey();
            var i = t.byId("fragCreateCustomerEqui", "DISTRIBUTIONCHANNEL").getSelectedKey();
            var o = r.filter(function (e) {
                return e.SalesOrganization === n && e.DistributionChannel === i
            });
            a.getData().oCreateCustomerData.CreateCustomerDivision = o;
            a.updateBindings(true);
            if (o.length === 1) {
                t.byId("fragCreateCustomerEqui", "DIVISION").setSelectedKey(o[0].Division)
            }
            t.byId("fragCreateCustomerEqui", "DIVISION").setEnabled(true);
            this._fnCustomerEquiCreateButtonEnabledState()
        },

        _setDefaultValuesEqui: function (e) {
            var mobileno1 = t.byId(e, "MOBILENO1");
            var mobileno2 = t.byId(e, "MOBILENO2");
            var country = t.byId(e, "COUNTRY");

            // Force default to Oman (+968)
            var i = "+968";
            var countryCode = "OM";
            var countryName = "Oman";

            var a = this.formatNameAndValuePair(countryCode, countryName);
            var r = new n({
                key: countryCode,
                text: a
            });

            if (country) {
                country.setTokens([r]);
            }

            var maskStr = this.fnCreateMask(i, i.length + 8);   // +968 XX XXX XXX

            [mobileno1, mobileno2].forEach(function (field) {
                if (field) {
                    field.setMask(maskStr);
                    field.setEnabled(true);
                    field.setPlaceholder("+968 XX XXX XXX");
                    field.setValueState("None");

                    if (!field.getValue() || field.getValue().trim() === "") {
                        field.setValue(i + " ");
                    }
                    field.fireChange();
                }
            });

            this._fnCustomerEquiCreateButtonEnabledState();
        },
        _fnCreateCustomerEquiValidation: function () {
            var e = this;
            var a = e.getView().getModel();
            var r = t.byId("fragCreateCustomerEqui", "SALESORGANIZATION").getSelectedKey();
            var n = [];
            n.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, r));
            n.push(new sap.ui.model.Filter("CustomerType", sap.ui.model.FilterOperator.EQ, "2"));
            n.push(new sap.ui.model.Filter("BPType", sap.ui.model.FilterOperator.EQ, "1"));
            a.read("/ZAE_I_TC_SCIN_08", {
                filters: n,
                success: function (a, r) {
                    if (a.results.length > 0) {
                        for (var n = 0; n < a.results.length; n++) {
                            var i = t.byId("fragCreateCustomerEqui", a.results[n].Field);
                            if (i !== undefined && a.results[n].Mandatory === true) {
                                t.byId("fragCreateCustomerEqui", a.results[n].Field).setRequired(true)
                            }
                        }
                    }
                }
            })
        },

        onChangeCustEquipmentMake: function (e) {
            var a = e.getParameter("selectedItem").getProperty("key");
            if (a) {
                var r = [];
                r.push(new i("Make", "EQ", a));
                t.byId("fragCreateCustomerEqui", "Model").getBinding("items").filter(r)
            }
        },

        fnCheckCreateCustomerEquiRequiredValidation: function () {
            this._fnCustomerEquiCreateButtonEnabledState()
        },

        _fnCustomerEquiCreateButtonEnabledState: function () {
            var t = this;
            var getCtrl = function (id) {
                var ctrl = t.byId("fragCreateCustomerEqui--" + id) ||
                    t.byId("fragCreateCustomerEqui", id) ||
                    sap.ui.getCore().byId("fragCreateCustomerEqui--" + id);

                if (!ctrl) {
                    console.warn("Control NOT FOUND:", id);
                } else {
                    console.log("Found:", id);
                }
                return ctrl;
            };

            var salesOrg = getCtrl("SALESORGANIZATION");
            var distChannel = getCtrl("DISTRIBUTIONCHANNEL");
            var division = getCtrl("DIVISION");
            var salutation = getCtrl("SALUTATION");
            var firstName = getCtrl("FIRSTNAME");
            var familyName = getCtrl("FAMILYNAME");
            var email = getCtrl("EMAIL");
            var mobileno1 = getCtrl("MOBILENO1");
            var fleetType = getCtrl("FleetObjectType");
            var make = getCtrl("Make");
            var modelYear = getCtrl("ModelYear");
            var description = getCtrl("Description");
            var licenseNumber = getCtrl("LicenseNumber");
            var vinNo = getCtrl("Vinno");

            var f = this.getView().getModel("mCustIdentification");
            var m = f.getData();

            var isEnabled = true;
            if (!salesOrg || salesOrg.getSelectedKey() === "") isEnabled = false;
            if (!distChannel || distChannel.getSelectedKey() === "") isEnabled = false;
            if (!division || division.getSelectedKey() === "") isEnabled = false;
            if (!salutation || salutation.getSelectedKey() === "") isEnabled = false;
            if (!firstName || firstName.getValue().trim() === "") isEnabled = false;
            if (!familyName || familyName.getValue().trim() === "") isEnabled = false;
            if (!email || email.getValue().trim() === "" || email.getValueState() === "Error") isEnabled = false;
            if (!mobileno1 || mobileno1.getValue().trim() === "" ||
                mobileno1.getValueState() === "Error") {
                isEnabled = false;
            }
            if (!fleetType || fleetType.getSelectedKey() === "") isEnabled = false;
            if (!make || make.getSelectedKey() === "") isEnabled = false;
            if (!modelYear || modelYear.getSelectedKey() === "") isEnabled = false;
            if (!description || description.getValue().trim() === "") isEnabled = false;
            if (!licenseNumber || licenseNumber.getValue().trim() === "") isEnabled = false;
            if (!vinNo || vinNo.getValue().trim() === "" || vinNo.getValueState() === "Error") {
                isEnabled = false;
            }
            console.log("Button Enabled =", isEnabled);   // For debugging

            m.uiOnly.enable.CustomerEquiCreateButton = isEnabled;
            f.updateBindings(true);
        },
        fnCheckCustEquiVinNumber: function () {
            var e = t.byId("fragCreateCustomerEqui", "Vinno");
            if (e.getValue().length < 17 && e.getValue().length !== 0) {
                e.setValueState("Error");
                e.setValueStateText("Vin Number should be 17 digits ")
            } else {
                e.setValueState("None")
            }
            this._fnCustomerEquiCreateButtonEnabledState()
        },

        // _CreateCustomerDialog: function (e) {
        //     var a;
        //     var r;
        //     var n;
        //     var i;
        //     var o;
        //     var s;
        //     var l;
        //     var u;
        //     var g;
        //     var d;
        //     var c;
        //     var C;
        //     var p;
        //     var f;
        //     var m;
        //     var y;
        //     var v;
        //     var I;
        //     var S;
        //     var h;
        //     var b;
        //     var P;
        //     var V;
        //     var E;
        //     var _;
        //     var T;
        //     var N;
        //     var D;
        //     var O;
        //     var w = this;
        //     this._oNewCreateCustomerDialog = new sap.m.Dialog({
        //         title: "{i18n>CreateCustomer}",
        //         content: [e],
        //         beginButton: new sap.m.Button({
        //             text: "{i18n>Create}",
        //             enabled: "{mCustIdentification>/uiOnly/enable/CustomerCreateButton}",
        //             press: function () {
        //                 w._oNewCreateCustomerDialog.setBusy(true);
        //                 b = w.getView().getModel("mCreateCustomer");
        //                 a = w.byId("SCIN_I01").getSelectedKey();
        //                 r = t.byId("fragCreateCustomer", "SALUTATION").getSelectedKey();
        //                 n = t.byId("fragCreateCustomer", "FIRSTNAME").getValue();
        //                 i = t.byId("fragCreateCustomer", "FAMILYNAME").getValue();
        //                 o = t.byId("fragCreateCustomer", "TELNO").getValue().split(" ")[1];
        //                 s = t.byId("fragCreateCustomer", "MOBILENO").getValue().split(" ")[1];
        //                 N = t.byId("fragCreateCustomer", "FAXNUMBER").getValue().split(" ")[1];
        //                 l = t.byId("fragCreateCustomer", "EMAIL").getValue();
        //                 u = t.byId("fragCreateCustomer", "CPRNO").getValue();
        //                 g = t.byId("fragCreateCustomer", "STREET").getValue();
        //                 d = t.byId("fragCreateCustomer", "HOUSENO").getValue();
        //                 c = t.byId("fragCreateCustomer", "POBOX").getValue();
        //                 T = t.byId("fragCreateCustomer", "POSTALCODE").getValue();
        //                 C = t.byId("fragCreateCustomer", "CITY").getValue();
        //                 h = t.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedItem().oBindingContexts.mCreateCustomer.sPath;
        //                 P = b.getProperty(h).Ccode;
        //                 D = t.byId("fragCreateCustomer", "COUNTRY").getTokens()[0];
        //                 if (D) {
        //                     p = D.getKey()
        //                 }
        //                 O = t.byId("fragCreateCustomer", "REGION").getTokens()[0];
        //                 if (O) {
        //                     f = O.getKey()
        //                 }
        //                 v = t.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
        //                 I = t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").getSelectedKey();
        //                 S = t.byId("fragCreateCustomer", "DIVISION").getSelectedKey();
        //                 E = t.byId("fragCreateCustomer", "LANGUAGE").data().key.substring(0, 2);
        //                 if (t.byId("fragCreateCustomer", "LANGUAGE").getValue() === "") {
        //                     LANGUAGE = ""
        //                 }
        //                 V = t.byId("fragCreateCustomer", "NAMEMIDDLE").getValue();
        //                 _ = t.byId("fragCreateCustomer", "NATIONALITY").getTokens()[0];
        //                 Location = t.byId("fragCreateCustomer", "REGIOGROUP").getSelectedKey();
        //                 if (_ !== undefined) {
        //                     _ = _.getProperty("key")
        //                 }
        //                 var e = "ZOTE_FM_SRV_QRC_CRT_CUST_EQPSet";
        //                 var m = w.getView().getModel();
        //                 var y = [{
        //                     callProperty: "Plant",
        //                     value: a
        //                 }, {
        //                     callProperty: "Ccode",
        //                     value: P
        //                 }, {
        //                     callProperty: "Salutation",
        //                     value: r
        //                 }, {
        //                     callProperty: "FirstName",
        //                     value: n
        //                 }, {
        //                     callProperty: "LastName",
        //                     value: i
        //                 }, {
        //                     callProperty: "TelNo",
        //                     value: o
        //                 }, {
        //                     callProperty: "MobNo",
        //                     value: s
        //                 }, {
        //                     callProperty: "Email",
        //                     value: l
        //                 }, {
        //                     callProperty: "Identificationnumber",
        //                     value: u
        //                 }, {
        //                     callProperty: "Street",
        //                     value: g
        //                 }, {
        //                     callProperty: "HouseNo",
        //                     value: d
        //                 }, {
        //                     callProperty: "PoBox",
        //                     value: c
        //                 }, {
        //                     callProperty: "City",
        //                     value: C
        //                 }, {
        //                     callProperty: "Country",
        //                     value: p
        //                 }, {
        //                     callProperty: "Region",
        //                     value: f
        //                 }, {
        //                     callProperty: "Vkorg",
        //                     value: v
        //                 }, {
        //                     callProperty: "Vtweg",
        //                     value: I
        //                 }, {
        //                     callProperty: "Spart",
        //                     value: S
        //                 }, {
        //                     callProperty: "Language",
        //                     value: E
        //                 }, {
        //                     callProperty: "MiddleName",
        //                     value: V
        //                 }, {
        //                     callProperty: "Nationality",
        //                     value: _
        //                 }, {
        //                     callProperty: "PostlCode",
        //                     value: T
        //                 }, {
        //                     callProperty: "FaxNumber",
        //                     value: N
        //                 }, {
        //                     callProperty: "Location",
        //                     value: Location
        //                 }];
        //                 var B = function (e) {
        //                     w.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     w.getView().getModel().refresh();
        //                     w._oNewCreateCustomerDialog.setBusy(false);
        //                     w._oNewCreateCustomerDialog.close()
        //                 };
        //                 var M = function (e) {
        //                     w.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     w.getView().getModel().refresh();
        //                     w._oNewCreateCustomerDialog.setBusy(false);
        //                     w._oNewCreateCustomerDialog.close()
        //                 };
        //                 w.aeUI5Util.createCall(w, m, e, y, B, M)
        //             }.bind(this)
        //         }),
        //         endButton: new sap.m.Button({
        //             text: "{i18n>Close}",
        //             press: function () {
        //                 this._oNewCreateCustomerDialog.close()
        //             }.bind(this)
        //         })
        //     });
        //     this.getView().addDependent(this._oNewCreateCustomerDialog)
        // },
        // _setCreateCustomerDialogInitialState: function () {
        //     var e = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
        //     this._setDefaultValues("fragCreateCustomer");
        //     t.byId("fragCreateCustomer", "SALESORGANIZATION").setSelectedKey(null);
        //     t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setSelectedKey(null);
        //     t.byId("fragCreateCustomer", "DIVISION").setSelectedKey(null);
        //     t.byId("fragCreateCustomer", "REGIOGROUP").setSelectedKey(null);
        //     t.byId("fragCreateCustomer", "SALUTATION").setSelectedKey(null);
        //     t.byId("fragCreateCustomer", "FIRSTNAME").setValue("");
        //     t.byId("fragCreateCustomer", "FAMILYNAME").setValue("");
        //     t.byId("fragCreateCustomer", "MOBILENO").setValue("");
        //     t.byId("fragCreateCustomer", "MOBILENO").setMask("");
        //     t.byId("fragCreateCustomer", "MOBILENO").setValueState("None");
        //     t.byId("fragCreateCustomer", "FAXNUMBER").setValue("");
        //     t.byId("fragCreateCustomer", "FAXNUMBER").setMask("");
        //     t.byId("fragCreateCustomer", "FAXNUMBER").setValueState("None");
        //     t.byId("fragCreateCustomer", "TELNO").setValue("");
        //     t.byId("fragCreateCustomer", "TELNO").setMask("");
        //     t.byId("fragCreateCustomer", "TELNO").setValueState("None");
        //     t.byId("fragCreateCustomer", "EMAIL").setValue("");
        //     t.byId("fragCreateCustomer", "CPRNO").setValue("");
        //     t.byId("fragCreateCustomer", "STREET").setValue("");
        //     t.byId("fragCreateCustomer", "HOUSENO").setValue("");
        //     t.byId("fragCreateCustomer", "POBOX").setValue("");
        //     t.byId("fragCreateCustomer", "POSTALCODE").setValue("");
        //     t.byId("fragCreateCustomer", "CITY").setValue("");
        //     t.byId("fragCreateCustomer", "COUNTRY").setValue("");
        //     t.byId("fragCreateCustomer", "COUNTRY").setValueState("None");
        //     t.byId("fragCreateCustomer", "REGION").setValue("");
        //     t.byId("fragCreateCustomer", "REGION").setTokens([]);
        //     t.byId("fragCreateCustomer", "REGION").setValueState("None");
        //     t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setEnabled(false);
        //     t.byId("fragCreateCustomer", "DIVISION").setEnabled(false);
        //     t.byId("fragCreateCustomer", "LANGUAGE").setValue(e);
        //     t.byId("fragCreateCustomer", "LANGUAGE").data("key", e);
        //     t.byId("fragCreateCustomer", "NATIONALITY").setValue("");
        //     t.byId("fragCreateCustomer", "NATIONALITY").setValueState("None");
        //     t.byId("fragCreateCustomer", "NATIONALITY").setTokens([]);
        //     t.byId("fragCreateCustomer", "NAMEMIDDLE").setValue("");
        //     this._fnCustomerCreateButtonEnabledState();
        //     this.fnLoadBPIDType();
        //     this._oNewCreateCustomerDialog.open()
        // },
        // fnLoadBPIDType: function () {
        //     var e = this;
        //     var a = [];
        //     var r = t.byId("fragCreateCustomer", "COUNTRY").getTokens()[0].getKey();
        //     a.push(new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.EQ, r));
        //     var n = [];
        //     var i = this.getView().byId("SCIN_I01").getSelectedKey();
        //     n.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, i));
        //     var o = this.getView().getModel();
        //     o.setUseBatch(true);
        //     o.read("/ZAE_I_BPIDTypes_02", {
        //         filters: a,
        //         groupId: "CreateCompany"
        //     });
        //     o.read("/ZAE_I_TC_CUST_SERV", {
        //         filters: n,
        //         groupId: "CreateCompany"
        //     });
        //     o.setDeferredGroups(["CreateCompany"]);
        //     o.submitChanges({
        //         groupId: "CreateCompany",
        //         success: function (t) {
        //             o.setUseBatch(false);
        //             e._fnCreateCustomerData(t.__batchResponses)
        //         },
        //         error: function (e) {
        //             o.setUseBatch(false)
        //         }
        //     })
        // },
        // _fnCreateCustomerData: function (e) {
        //     var a = this.getView().getModel("i18n");
        //     var r = t.byId("fragCreateCustomer", "CPRNO").getLabels()[0];
        //     if (e[0] && e[0].data.results.length > 0) {
        //         r.setText(e[0].data.results[0].IDText)
        //     } else {
        //         r.setText("Emirates ID")
        //     }
        //     var n = this.getView().getModel("mCreateCustomer");
        //     n.getData().oCreateCustomerData.MainResults = e[1].data.results;
        //     var n = this.getView().getModel("mCreateCustomer");
        //     var i = [...new Map(e[1].data.results.map(e => [e.SalesOrganization, e])).values()];
        //     i.sort(function (e, t) {
        //         return e.SalesOrganization.localeCompare(t.SalesOrganization)
        //     });
        //     n.getData().oCreateCustomerData.CreateCustomerSalesOrg = i;
        //     n.updateBindings(true);
        //     if (i.length === 1) {
        //         t.byId("fragCreateCustomer", "SALESORGANIZATION").setSelectedKey(i[0].SalesOrganization);
        //         t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setEnabled(true);
        //         t.byId("fragCreateCustomer", "DIVISION").setEnabled(true);
        //         this._fnCreateCustomerValidation();
        //         this.fnSalesOrgChange()
        //     }
        // },
        // _fnCreateCustomerValidation: function () {
        //     var e = this;
        //     var a = e.getView().getModel();
        //     var r = t.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
        //     var n = [];
        //     n.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, r));
        //     n.push(new sap.ui.model.Filter("CustomerType", sap.ui.model.FilterOperator.EQ, "2"));
        //     n.push(new sap.ui.model.Filter("BPType", sap.ui.model.FilterOperator.EQ, "1"));
        //     a.read("/ZAE_I_TC_SCIN_08", {
        //         filters: n,
        //         success: function (a, r) {
        //             if (a.results.length > 0) {
        //                 for (var n = 0; n < a.results.length; n++) {
        //                     var i = t.byId("fragCreateCustomer", a.results[n].Field);
        //                     if (i !== undefined && a.results[n].Mandatory === true) {
        //                         t.byId("fragCreateCustomer", a.results[n].Field).setRequired(true)
        //                     }
        //                 }
        //             }
        //             e._fnCustomerCreateButtonEnabledState()
        //         }
        //     })
        // },
        // onExtendCustomer: function (e) {
        //     var a = this;
        //     var r = e;
        //     var n = this.getView().getModel("i18n").getResourceBundle();
        //     if (!a._ExtendCustomerDialog) {
        //         t.load({
        //             id: "fragExtendCustomer",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ExtendCustomer",
        //             controller: {
        //                 formatNameAndValuePair: function (e, t) {
        //                     if (!e && !t) {
        //                         return ""
        //                     } else if (t && !e) {
        //                         return t.replace(/^0+/, "")
        //                     } else if (!t && e) {
        //                         return e
        //                     } else {
        //                         return e + " (" + t.replace(/^0+/, "") + ")"
        //                     }
        //                 },
        //                 onSelectionChange: function (e) {
        //                     var a = false;
        //                     var r = t.byId("fragExtendCustomer", "idExtendCustomer").getSelectedItems();
        //                     if (r.length > 0) {
        //                         a = true
        //                     }
        //                     t.byId("fragExtendCustomer", "idSubmit").setEnabled(a)
        //                 },
        //                 onSubmit: function () {
        //                     var e = a.getView().getModel("ExtendCustomer");
        //                     var r = a.getView().getModel("mCustIdentification").getData();
        //                     var n = r.customerInfo.to_CurrentOwner.Partner;
        //                     var i = /\(([^)]+)\)/;
        //                     var o = "ZAE_FM_SC_CUST_EXT_FRM_CI_01Set";
        //                     var s = t.byId("fragExtendCustomer", "idExtendCustomer").getSelectedItems();
        //                     var l = [{
        //                         Businesspartner: n
        //                     }];
        //                     var u = [];
        //                     s.forEach(function (e) {
        //                         u.push({
        //                             Ccode: e.getBindingContext().getObject().CompanyCode,
        //                             Vkorg: e.getBindingContext().getObject().SalesOrganization,
        //                             Vtweg: e.getBindingContext().getObject().DistributionChannel,
        //                             Spart: e.getBindingContext().getObject().Division,
        //                             RefCustomer: e.getBindingContext().getObject().Customer
        //                         })
        //                     });
        //                     var g = [{
        //                         callProperty: "NavPartner",
        //                         value: l
        //                     }, {
        //                         callProperty: "NavSalesAreas",
        //                         value: u
        //                     }];
        //                     var d = function (e) {
        //                         a.getView().byId("SCIN_I02").fireTokenUpdate();
        //                         a.byId("SmartTableSalesArea").rebindTable()
        //                     };
        //                     var c = function (e) {
        //                         a.getView().byId("SCIN_I02").fireTokenUpdate();
        //                         a.byId("SmartTableSalesArea").rebindTable()
        //                     };
        //                     a.aeUI5Util.createCall(a, e, o, g, d, c);
        //                     a._ExtendCustomerDialog.close()
        //                 },
        //                 onCancel: function () {
        //                     a._ExtendCustomerDialog.close()
        //                 }
        //             }
        //         }).then(function (e) {
        //             a._ExtendCustomerDialog = e;
        //             a.getView().addDependent(a._ExtendCustomerDialog);
        //             a._initExtendCustomerDialog()
        //         })
        //     } else {
        //         a._initExtendCustomerDialog()
        //     }
        // },
        // _initExtendCustomerDialog: function () {
        //     var e = this;
        //     var a = [];
        //     var r = this.getView().getModel("mCustIdentification");
        //     var n = r.getData();
        //     var i = e.byId("SCIN_I01").getSelectedKey();
        //     var o = n.customerInfo.to_CurrentOwner.CustomerAccountGroup;
        //     t.byId("fragExtendCustomer", "idExtendCustomer").removeSelections();
        //     t.byId("fragExtendCustomer", "idSubmit").setEnabled(false);
        //     var s = t.byId("fragExtendCustomer", "idExtendCustomer");
        //     a.push(new sap.ui.model.Filter({
        //         path: "Plant",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: i
        //     }));
        //     a.push(new sap.ui.model.Filter({
        //         path: "BuGroup",
        //         operator: sap.ui.model.FilterOperator.EQ,
        //         value1: o
        //     }));
        //     s.getBinding("items").filter(a);
        //     this._ExtendCustomerDialog.open()
        // },
        // onCreateEquipment: function (e) {
        //     if (!this._oNewCreateEquipmentDialog) {
        //         t.load({
        //             id: "fragCreateEquipment",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateEquipment",
        //             controller: this
        //         }).then(function (e) {
        //             this._CreateEquipmentDialog(e);
        //             this._setCreateEquipmentDialogInitialState()
        //         }.bind(this))
        //     } else {
        //         this._setCreateEquipmentDialogInitialState()
        //     }
        // },
        // fnCheckCreateEquiRequiredValidation: function () {
        //     this._fnEquipmentCreateButtonEnabledState()
        // },
        // fnCheckCreateCustomerRequiredValidation: function () {
        //     this._fnCustomerCreateButtonEnabledState()
        // },
        // _setCreateEquipmentDialogInitialState: function () {
        //     t.byId("fragCreateEquipment", "FleetObjectType").setSelectedKey(null);
        //     t.byId("fragCreateEquipment", "Description").setValue("");
        //     t.byId("fragCreateEquipment", "LicenseNumber").setValue("");
        //     t.byId("fragCreateEquipment", "Customer").setValue("");
        //     t.byId("fragCreateEquipment", "Customer").setTokens([]);
        //     t.byId("fragCreateEquipment", "Customer").setValueState("None");
        //     t.byId("fragCreateEquipment", "Vinno").setValue("");
        //     t.byId("fragCreateEquipment", "NoCyl").setValue("");
        //     t.byId("fragCreateEquipment", "EngCC").setValue("");
        //     t.byId("fragCreateEquipment", "Vinno").setValueState("None");
        //     t.byId("fragCreateEquipment", "Make").setSelectedKey(null);
        //     t.byId("fragCreateEquipment", "Model").setSelectedKey(null);
        //     var e = [];
        //     e.push(new sap.ui.model.Filter("Characteristic", sap.ui.model.FilterOperator.EQ, "YEAR"));
        //     t.byId("fragCreateEquipment", "ModelYear").getBinding("items").filter(e);
        //     t.byId("fragCreateEquipment", "ModelYear").setSelectedKey(null);
        //     t.byId("fragCreateEquipment", "idDeliveryDate").setDateValue(null);
        //     t.byId("fragCreateEquipment", "idMaterial").setValue("");
        //     t.byId("fragCreateEquipment", "idMaterial").setTokens([]);
        //     t.byId("fragCreateEquipment", "idMaterial").setValueState("None");
        //     this._fnEquipmentCreateButtonEnabledState();
        //     this._oNewCreateEquipmentDialog.open()
        // },
        // _fnEquipmentCreateButtonEnabledState: function () {
        //     var e = t.byId("fragCreateEquipment", "FleetObjectType").getSelectedKey();
        //     var a = t.byId("fragCreateEquipment", "Vinno");
        //     var r = t.byId("fragCreateEquipment", "Description").getValue();
        //     var n = t.byId("fragCreateEquipment", "LicenseNumber").getValue();
        //     var i = t.byId("fragCreateEquipment", "Customer").getTokens();
        //     var o = t.byId("fragCreateEquipment", "Make").getSelectedKey();
        //     var s = t.byId("fragCreateEquipment", "Model").getSelectedKey();
        //     var l = t.byId("fragCreateEquipment", "NoCyl").getValue();
        //     var u = t.byId("fragCreateEquipment", "EngCC").getValue();
        //     var g = t.byId("fragCreateEquipment", "ModelYear").getSelectedKey();
        //     var d = this.getView().getModel("mCustIdentification");
        //     var c = d.getData();
        //     var C = e !== "" && n !== "" && i.length > 0 && o !== null && s !== null && r !== "" && a.getValue() !== "" && a.getValueState() === "None" && g !== "";
        //     c.uiOnly.enable.EquipmentCreateButton = C;
        //     d.updateBindings(true)
        // },
        // fnCheckVinNumber: function () {
        //     var e = t.byId("fragCreateEquipment", "Vinno");
        //     if (e.getValue().length < 17 && e.getValue().length !== 0) {
        //         e.setValueState("Error");
        //         e.setValueStateText("Vin Number should be 17 digits ")
        //     } else {
        //         e.setValueState("None")
        //     }
        //     this._fnEquipmentCreateButtonEnabledState()
        // },
        // onChangeEquipmentMake: function (e) {
        //     var a = e.getParameter("selectedItem").getProperty("key");
        //     if (a) {
        //         var r = [];
        //         r.push(new i("Make", "EQ", a));
        //         t.byId("fragCreateEquipment", "Model").getBinding("items").filter(r)
        //     }
        // },
        onMaterialValueHelpRequested: function (e) {
            var a = this;
            var r = e.getSource();
            r.setTokens([]);
            var n = {
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
                onBeforeRebindSmartTable: function (e) {
                    var a = t.byId("fragCreateCustomerEqui", "Model").getSelectedKey();
                    var r = t.byId("fragCreateCustomerEqui", "Make").getSelectedKey();
                    var n = e.getParameter("bindingParams").filters;
                    n.push(new sap.ui.model.Filter({
                        path: "Model",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: a
                    }));
                    // if (r === "ZNF") {
                    //     n.push(new sap.ui.model.Filter({
                    //         path: "Labor",
                    //         operator: sap.ui.model.FilterOperator.EQ,
                    //         value1: "ZN"
                    //     }))
                    // }
                    e.getParameter("bindingParams").filters = n
                }

            };
            a.aeUtil.handleSmartDialogValueHelp(a, r, n)
        },


        onMaterialTokenUpdate: function (e) {
            var t = e.getSource().getTokens();
            if (t.length === 0 || e.getParameters().type === "removed") {
                e.getSource().setTokens([])
            }
            this.fnCheckCreateCustomerEquiRequiredValidation();
        },
        onSelectMaterial: function (e) {
            if (e.getParameter("selectedRow") !== null) {
                var t = e.getSource();
                t.setTokens([]);
                var a = e.getParameter("selectedRow").getBindingContext().getObject();
                var r = this.formatNameAndValuePair(a.MaterialName, a.Material);
                var n = new sap.m.Token({
                    key: a.Material,
                    text: r
                });
                t.setTokens([n]);
                t.fireTokenUpdate()
            }
        },
        handleMaterialSuggest: function (e) {
            var a = e.getParameter("suggestValue");
            var r = [];
            var n = t.byId("fragCreateCustomerEqui", "Model").getSelectedKey();
            var o = t.byId("fragCreateCustomerEqui", "Make").getSelectedKey();
            r.push(new sap.ui.model.Filter({
                path: "Model",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: n
            }));
            if (o === "ZNF") {
                r.push(new sap.ui.model.Filter({
                    path: "Labor",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: "ZN"
                }))
            }
            if (a) {
                r.push(new i({
                    filters: [new i({
                        path: "Material",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }), new i({
                        path: "MaterialName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    })],
                    and: false
                }))
            }
            e.getSource().getBinding("suggestionRows").filter(r);
            e.getSource().getBinding("suggestionRows").resume()
        },
        // _fnCustomerCreateButtonEnabledState: function () {
        //     var e = t.byId("fragCreateCustomer", "SALUTATION");
        //     var a = t.byId("fragCreateCustomer", "FIRSTNAME");
        //     var r = t.byId("fragCreateCustomer", "FAMILYNAME");
        //     var n = t.byId("fragCreateCustomer", "TELNO");
        //     var i = t.byId("fragCreateCustomer", "MOBILENO");
        //     var o = t.byId("fragCreateCustomer", "FAXNUMBER");
        //     var s = t.byId("fragCreateCustomer", "CITY");
        //     var l = t.byId("fragCreateCustomer", "COUNTRY");
        //     var u = t.byId("fragCreateCustomer", "REGION");
        //     var g = t.byId("fragCreateCustomer", "SALESORGANIZATION");
        //     var d = t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL");
        //     var c = t.byId("fragCreateCustomer", "DIVISION");
        //     var C = t.byId("fragCreateCustomer", "EMAIL");
        //     var p = t.byId("fragCreateCustomer", "NAMEMIDDLE");
        //     var f = this.getView().getModel("mCustIdentification");
        //     var m = f.getData();
        //     var y = t.byId("fragCreateCustomer", "REGIOGROUP");
        //     var v = t.byId("fragCreateCustomer", "CPRNO");
        //     var I = t.byId("fragCreateCustomer", "STREET");
        //     var S = t.byId("fragCreateCustomer", "HOUSENO");
        //     var h = t.byId("fragCreateCustomer", "POBOX");
        //     var b = t.byId("fragCreateCustomer", "POSTALCODE");
        //     var P = t.byId("fragCreateCustomer", "NATIONALITY");
        //     var V = t.byId("fragCreateCustomer", "LANGUAGE");
        //     var E = (e.getRequired() ? e.getSelectedKey() !== "" : true) && (g.getRequired() ? g.getSelectedKey() !== "" : true) && (d.getRequired() ? d.getSelectedKey() !== "" : true) && (c.getRequired() ? c.getSelectedKey() !== "" : true) && (y.getRequired() ? y.getSelectedKey() !== "" : true) && (a.getRequired() ? a.getValue() !== "" : true) && (V.getRequired() ? V.getValue() !== "" : true) && (v.getRequired() ? v.getValue() !== "" : true) && (r.getRequired() ? r.getValue() !== "" : true) && (l.getRequired() ? l.getTokens([]).length !== 0 : true) && (l.getValueState() !== "Error" ? true : false) && (u.getRequired() ? u.getTokens([]).length !== 0 : true) && (u.getValueState() !== "Error" ? true : false) && (i.getRequired() ? i.getValue() !== "" && !i.getValue().includes("_") : true) && (i.getValueState() !== "Error" ? true : false) && (C.getRequired() ? C.getValue() !== "" : true) && (C.getValueState() === "None" ? true : false) && (I.getRequired() ? I.getValue() !== "" : true) && (S.getRequired() ? S.getValue() !== "" : true) && (h.getRequired() ? h.getValue() !== "" : true) && (s.getRequired() ? s.getValue() !== "" : true) && (n.getRequired() ? n.getValue() !== "" && !n.getValue().includes("_") : true) && (n.getValueState() !== "Error" ? true : false) && (o.getRequired() ? o.getValue() !== "" && !o.getValue().includes("_") : true) && (o.getValueState() !== "Error" ? true : false) && (P.getRequired() ? P.getTokens([]).length !== 0 : true) && (p.getRequired() ? p.getValue() !== "" : true) && (b.getRequired() ? b.getValue() !== "" : true);
        //     m.uiOnly.enable.CustomerCreateButton = E;
        //     f.updateBindings(true)
        // },
        // fnSalesOrgChange: function () {
        //     var e = this.getView().getModel("mCreateCustomer");
        //     var a = e.getData().oCreateCustomerData.MainResults;
        //     var r = t.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
        //     var n = a.filter(function (e) {
        //         return e.SalesOrganization === r
        //     });
        //     var i = [...new Map(n.map(e => [e.DistributionChannel, e])).values()];
        //     i.sort(function (e, t) {
        //         return e.DistributionChannel.localeCompare(t.DistributionChannel)
        //     });
        //     e.getData().oCreateCustomerData.CreateCustomerDC = i;
        //     e.updateBindings(true);
        //     if (i.length === 1) {
        //         t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setSelectedKey(i[0].DistributionChannel);
        //         this.fnDistributionChange()
        //     }
        //     t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").setEnabled(true);
        //     this._fnCustomerCreateButtonEnabledState()
        // },
        // fnDistributionChange: function (e) {
        //     var a = this.getView().getModel("mCreateCustomer");
        //     var r = a.getData().oCreateCustomerData.MainResults;
        //     var n = t.byId("fragCreateCustomer", "SALESORGANIZATION").getSelectedKey();
        //     var i = t.byId("fragCreateCustomer", "DISTRIBUTIONCHANNEL").getSelectedKey();
        //     var o = r.filter(function (e) {
        //         return e.SalesOrganization === n && e.DistributionChannel === i
        //     });
        //     a.getData().oCreateCustomerData.CreateCustomerDivision = o;
        //     a.updateBindings(true);
        //     if (o.length === 1) {
        //         t.byId("fragCreateCustomer", "DIVISION").setSelectedKey(o[0].Division)
        //     }
        //     t.byId("fragCreateCustomer", "DIVISION").setEnabled(true);
        //     this._fnCustomerCreateButtonEnabledState()
        // },
        // _CreateEquipmentDialog: function (e) {
        //     var a;
        //     var r;
        //     var n;
        //     var i;
        //     var o;
        //     var s;
        //     var l;
        //     var u;
        //     var g;
        //     var d;
        //     var c;
        //     var C;
        //     var p;
        //     var f;
        //     var m;
        //     var y = this;
        //     this._oNewCreateEquipmentDialog = new sap.m.Dialog({
        //         title: "{i18n>CreateEquipment}",
        //         content: [e],
        //         contentWidth: "400px",
        //         beginButton: new sap.m.Button({
        //             text: "{i18n>Create}",
        //             enabled: "{mCustIdentification>/uiOnly/enable/EquipmentCreateButton}",
        //             press: function () {
        //                 m = y.byId("SCIN_I01").getSelectedKey();
        //                 a = t.byId("fragCreateEquipment", "FleetObjectType").getSelectedKey();
        //                 r = t.byId("fragCreateEquipment", "Description").getValue();
        //                 n = t.byId("fragCreateEquipment", "LicenseNumber").getValue();
        //                 i = t.byId("fragCreateEquipment", "Customer").getTokens()[0].getKey();
        //                 l = t.byId("fragCreateEquipment", "Vinno").getValue();
        //                 g = t.byId("fragCreateEquipment", "Make").getSelectedKey();
        //                 d = t.byId("fragCreateEquipment", "Model").getSelectedKey();
        //                 c = t.byId("fragCreateEquipment", "NoCyl").getValue();
        //                 C = t.byId("fragCreateEquipment", "EngCC").getValue();
        //                 p = t.byId("fragCreateEquipment", "ModelYear").getSelectedKey();
        //                 var e = t.byId("fragCreateEquipment", "idDeliveryDate").getDateValue();
        //                 if (e === null) {
        //                     f = null
        //                 } else {
        //                     var o = new Date(e);
        //                     o.setHours(6);
        //                     f = "/Date(" + o.getTime() + ")/"
        //                 }
        //                 var s = t.byId("fragCreateEquipment", "idMaterial").getTokens([]);
        //                 if (s.length > 0) {
        //                     u = t.byId("fragCreateEquipment", "idMaterial").getTokens()[0].getKey()
        //                 } else {
        //                     u = ""
        //                 }
        //                 var v = "ZAE_FM_EQU_CREATE_V1Set";
        //                 var I = y.getView().getModel();
        //                 var S = [{
        //                     callProperty: "Objecttype",
        //                     value: a
        //                 }, {
        //                     callProperty: "LicenseNum",
        //                     value: n
        //                 }, {
        //                     callProperty: "Parvw",
        //                     value: "Z1"
        //                 }, {
        //                     callProperty: "Parnr",
        //                     value: i
        //                 }, {
        //                     callProperty: "FleetVin",
        //                     value: l
        //                 }, {
        //                     callProperty: "Planplant",
        //                     value: m
        //                 }, {
        //                     callProperty: "Make",
        //                     value: g
        //                 }, {
        //                     callProperty: "Model",
        //                     value: d
        //                 }, {
        //                     callProperty: "Descript",
        //                     value: r
        //                 }, {
        //                     callProperty: "EngineCyl",
        //                     value: c
        //                 }, {
        //                     callProperty: "UnitCap",
        //                     value: "L"
        //                 }, {
        //                     callProperty: "Modelyear",
        //                     value: p
        //                 }, {
        //                     callProperty: "DeliveryDate",
        //                     value: f
        //                 }, {
        //                     callProperty: "Matnr",
        //                     value: u
        //                 }];
        //                 if (C !== "") {
        //                     S.push({
        //                         callProperty: "EngineCap",
        //                         value: C
        //                     })
        //                 }
        //                 var h = function (e) {
        //                     y.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     y.getView().getModel().refresh()
        //                 };
        //                 var b = function (e) {
        //                     y.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     y.getView().getModel().refresh()
        //                 };
        //                 y.aeUI5Util.createCall(y, I, v, S, h, b);
        //                 y._oNewCreateEquipmentDialog.close()
        //             }
        //         }),
        //         endButton: new sap.m.Button({
        //             text: "{i18n>Close}",
        //             press: function () {
        //                 this._oNewCreateEquipmentDialog.close()
        //             }.bind(this)
        //         })
        //     });
        //     this.getView().addDependent(this._oNewCreateEquipmentDialog)
        // },
        onCreateRequestPress: function () {
            var e = this.getView().getModel("mCustIdentification");
            var a = e.getData();
            var r;
            var n;
            var i;
            var o;
            var s;
            var l;
            var u;
            var g;
            var d;
            var c;
            var C;
            var p;
            var f;
            var m = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
            var y = m.getModel().getProperty(m.getPath());

            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;
            var s = null;
            if (oPlantControl) {
                s = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }

            var v = [];
            var I = this.byId("SCIN_I02").getTokens();
            if (I === 0) {
                I = this.oCategory
            }
            for (var S = 0; S < I.length; S++) {
                v.push({
                    key: I[S].getProperty("key"),
                    text: I[S].getProperty("text")
                })
            }

            if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
                p = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
                f = p.getModel().getProperty(p.getPath());
                i = f.ContactPerson;
                o = f.ContactPersonName
            } else if (this.oContactList) {
                p = this.oContactList.getBindingContext();
                f = p.getModel().getProperty(p.getPath());
                i = f.ContactPerson;
                o = f.ContactPersonName
            } else {
                i = "";
                o = ""
            }

            if (a.customerInfo.to_CurrentOwner && a.customerInfo.to_CurrentOwner.Partner) {
                r = a.customerInfo.to_CurrentOwner.Partner;
                n = a.customerInfo.to_CurrentOwner.CustomerName
            } else if (a.customerInfo.CurrentOwner) {
                r = a.customerInfo.CurrentOwner;
                n = a.customerInfo.CustomerName
            } else {
                r = "";
                n = ""
            }

            g = y.SalesOrganization;
            d = y.DistrChannel;
            c = y.Division;
            C = a.customerInfo.Make;

            var h = sap.ushell.Container.getService("CrossApplicationNavigation");
            var b = sap.ui.core.Component.getOwnerIdFor(this.getView());

            // FIX: Use createEmptyAppStateAsync instead of createEmptyAppState
            h.createEmptyAppStateAsync(sap.ui.component(b)).then(function (P) {
                var _ = this.getView().byId("SCIN_I02").getTokens();
                if (_.length === 0) {
                    _ = this.oCategory
                }
                var T = this.CampaignID ? this.CampaignID : "";
                var N = this.cmpgn_extid ? this.cmpgn_extid : "";
                var D = _.length > 0 ? _[0].getText() : "";
                var O = {
                    LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                    Plant: s,
                    Category: v
                };
                P.setData(O);
                P.save();
                var w = sap.ui.core.routing.HashChanger.getInstance();
                var B = "";
                w.replaceHash(B);
                var M = {
                    Equipment: a.customerInfo.Equipment ? a.customerInfo.Equipment : "",
                    Customer: r,
                    CustomerName: n,
                    CPerson: i,
                    CPersonName: o,
                    Plant: s,
                    Category: v,
                    SalesOrganization: g,
                    DistrChannel: d,
                    Division: c,
                    Description: D,
                    TransactionType: a.SchemaTransactionType.TransactionType,
                    "sap-iapp-state": P.getKey(),
                    CampaignID: T,
                    Cmpgn_extid: decodeURI(N),
                    Make: C
                };
                var sParam = JSON.stringify(M);
                sParam = sParam.replace(/\./g, '__DOT__');
                sParam = sParam.replace(/\//g, '__SLASH__');
                sParam = sParam.replace(/\\/g, '__BSLASH__');

                this.getRouter().navTo("ServiceRequestView", {
                    param1: encodeURIComponent(sParam)
                });
            }.bind(this)).catch(function (error) {
                console.error("Error creating app state:", error);
                // Handle error appropriately
            });
        },
        onPressServiceRequest: function (e) {
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var r = t.createEmptyAppState(sap.ui.component(a));
            var n = this.byId("EquipmentVH").getTokens();
            var i = "",
                o = "";
            if (n.length > 0) {
                i = n[0].getProperty("key");
                o = n[0].getProperty("text")
            }
            var s = [];
            var l = this.byId("SCIN_I02").getTokens();
            if (l === 0) {
                l = this.oCategory
            }
            for (var u = 0; u < l.length; u++) {
                s.push({
                    key: l[u].getProperty("key"),
                    text: l[u].getProperty("text")
                })
            }
            var g = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: s,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: i,
                EquipmentWithDesc: o
            };
            r.setData(g);
            r.save();
            var d = sap.ui.core.routing.HashChanger.getInstance();
            var c = d.getHash();
            var C = c + "?" + "sap-iapp-state=" + r.getKey();
            d.replaceHash(C);
            var p = t && t.hrefForExternal({
                target: {
                    semanticObject: "aeCMServiceRequest",
                    action: "display"
                },
                params: {
                    aeCMServiceRequest: [e.getSource().getTitle()]
                }
            }) || "";
            t.toExternal({
                target: {
                    shellHash: p
                }
            })
        },
        fnCategorizationSchemaValidationWithServiceHistry: function (e) {
            var t = this.getView().getModel("mCustIdentification").getData();
            var a = t.customerInfo.to_ServiceHistory.results;

            function r(e, t) {
                var n = 0;
                while (n < e.length) {
                    if (e[n].children && e[n].children.length > 0) {
                        if (e[n].cat_desc === "CTIN" || e[n].children && e[n].cat_desc === "CTOT" || t || e[n]["cat_id"].includes("_RC")) {
                            r(e[n].children, true)
                        } else {
                            r(e[n].children)
                        }
                    } else if (t) {
                        for (var i = 0; i < e.length; i++) {
                            for (var o = 0; o < a.length; o++) {
                                if (e[i].cat_id === a[o].CatID) {
                                    if (a[o].isServiced) {
                                        e[i]["isServiced"] = true;
                                        e[i]["ServiceStatus"] = "Completed ( " + a[o].ServiceDocument + ", " + a[o].ServiceDate.toDateString() + " )";
                                        for (var s = i; s >= 0; s--) {
                                            e[s]["isServiced"] = true
                                        }
                                    }
                                }
                            }
                        }
                    }
                    n++
                }
                return e
            }
            var n = r(e);
            return n
        },
        handleCategoryValueHelp: function (e) {
            var t = this;
            var a = e.getSource();
            var r = this.getView().getModel("mCustIdentification").getData();
            var n = r.customerInfo.to_ServiceContractNew.results;
            var i = e.getSource();
            var o;
            var s = t.getView().byId("SCIN_I02");
            for (var l = 0; n && l < n.length; l++) {
                if (n[l].ContractStatus_new === "CTIN") {
                    o = n[l]
                }
            }
            r.ConcatinatedCategorizationSchemaTreeTableData = [];
            // var u = this.byId("SCIN_I01").getSelectedKey();

            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var u = null;
            if (oPlantControl) {
                u = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            var g = r.customerInfo.Equipment;
            var d = [];
            d.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, u));
            d.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, g));
            s.setBusy(true);
            t.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
                filters: d,
                success: function (e, n) {
                    s.setBusy(false);
                    if (e.results.length > 0) {
                        var i = [...new Set(e.results.map(({
                            asp_id: e
                        }) => e))];
                        i.forEach(function (a) {
                            var n = a;
                            var i = e.results.filter(function (e) {
                                return e.asp_id === n
                            });
                            var s = i;
                            var l = r.customerInfo.to_EquipmentRecall.results;
                            var u = t.aeUI5Util.genParentIdWithDiv(s, "cat_id", "parentId", "_", 1);
                            var g = t.convertFlatToTree(u, "cat_id", "parentId", n);
                            var d;
                            var c = u.filter(e => e.CatIDType !== "").map(e => e.cat_id);
                            var C = [];
                            var p = [];
                            var f = u.filter(e => e.CatIDType === "REPR" && (e.CatIDCategory === "18" || e.CatIDCategory === "11" || e.CatIDCategory === "12" || e.CatIDCategory === "26")).map(e => e.cat_id);
                            c.forEach(e => {
                                const t = e.split("_");
                                for (let e = 1; e <= t.length + 1; e++) {
                                    const a = t.slice(0, e).join("_");
                                    if (!C.includes(a)) {
                                        C.push(a)
                                    }
                                }
                            });
                            l.forEach(e => {
                                const t = e.ExtRecallNo.split("_");
                                for (let e = 1; e <= t.length + 1; e++) {
                                    const a = t.slice(0, e).join("_");
                                    if (!p.includes(a)) {
                                        p.push(a)
                                    }
                                }
                            });
                            if (r.customerInfo.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
                                var m = [{
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
                                d = t.filterTreeESTOData(g, m, f, p, u);
                                g = d
                            }
                            var y = [];
                            if (r.customerInfo.ConcatenatedActiveSystStsName.search("ECUS") !== -1) {
                                y.push({
                                    SrviceSchemaQualifier: "REPR",
                                    CatIDCategory: "18"
                                })
                            }
                            if (r.customerInfo.ContractStatus_new === "CTIN" && o && o.to_Item_01.results.length > 0 && o.SrviceSchemaQualifier === "CTIN" && o.to_Item_01.results[0].Material) {
                                var v = o.SalesContractType === "ZUMC" ? o.to_Item_01.results[0].ReferenceMaterial : o.to_Item_01.results[0].Material;
                                y.push({
                                    SrviceSchemaQualifier: "CTOT",
                                    CatIDCategory: ""
                                });
                                if (o.CatIDCategory) {
                                    y.push({
                                        SrviceSchemaQualifier: "CTIN",
                                        CatIDCategory: Number(o.CatIDCategory) === 1 ? "2" : "1"
                                    })
                                }
                                d = t.filterTreeData(g, n + "_S", y, v, C, u)
                            } else {
                                y.push({
                                    SrviceSchemaQualifier: "CTIN",
                                    CatIDCategory: ""
                                });
                                d = t.filterTreeData(g, n + "_S", y, v, C, u)
                            }
                            d = t.filterTreeRecallData(d, l);
                            if (o) {
                                if (o.to_Item_01.results[0].MaterialFrom && o.to_Item_01.results[0].MaterialTo) {
                                    d = t.filterTreeMaterialKM(d, o)
                                }
                            }
                            d = t.fnCategorizationSchemaValidationWithServiceHistry(d);
                            if (d.length > 0 && d[0].children.length > 0) {
                                r.ConcatinatedCategorizationSchemaTreeTableData = r.ConcatinatedCategorizationSchemaTreeTableData.concat(d)
                            }
                        });
                        t.fnProcessCatSchema(a)
                    }
                },
                error: function () {
                    s.setBusy(false);
                    sap.m.MessageToast.show(t.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable"))
                }
            })
        },
        onCategorySelected: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            var a = t.getData();
            var r = e.getSource().getTokens();
            if (r.length === 1) {
                a.CategoryLength = "";
                t.updateBindings(true)
            }
        },
        fnProcessCatSchema: function (e) {
            var t = this;
            t.getView().byId("SCIN_I02").setBusy(false);
            var a = this.getView().getModel("mCustIdentification").getData();
            var r = "cat_id";
            var n = "cat_label";
            var i = "com.globalintelli.ZAE_SCIN_NEW.fragment.CategoryTreeDialogValueHelp";
            var o = function (e) {
                if (!e["children"]) {
                    if (e.isServiced) {
                        return {
                            pass: false,
                            msg: t.aeUI5Util.geti18nText(t, "TREE_TABLE_SELECTION_CMP"),
                            type: "Success"
                        }
                    }
                    if (e.KMReadingValidationRequired && !e.KMReadingValidationPass) {
                        return {
                            pass: false,
                            msg: t.aeUI5Util.geti18nText(t, "TREE_TABLE_SELECTION_KMR"),
                            type: "Warning"
                        }
                    } else {
                        return {
                            pass: true
                        }
                    }
                } else {
                    return {
                        pass: false,
                        msg: t.aeUI5Util.geti18nText(t, "TREE_TABLE_SELECTION"),
                        type: "Error"
                    }
                }
            }.bind(this);
            t.handleTreeValueHelp(t, e, i, r, n, a.ConcatinatedCategorizationSchemaTreeTableData, o)
        },
        convertFlatToTree: function (e, t, a, r) {
            var n = [];
            var i = [];
            var o = {};
            e.forEach(function (r) {
                if (!r[a]) {
                    i.push(r);
                    return
                }
                var n = o[r[a]];
                if (typeof n !== "string") {
                    n = e.findIndex(function (e) {
                        return e[t] === r[a]
                    });
                    o[r[a]] = n
                }
                if (e[n] && !e[n].children) {
                    e[n].children = [r];
                    return
                }
                if (n < 0) {
                    i.push(r);
                    return
                }
                e[n].children.push(r)
            });
            n.push({
                cat_id: r,
                cat_label: r,
                children: i
            });
            return n
        },
        handleTreeValueHelp: function (e, a, r, n, o, s, l) {
            var u = this;
            var g = a.getId();
            if (!u._valueHelpDialogs[g]) {
                t.load({
                    id: g + "TreeVHFragment",
                    name: r,
                    controller: {
                        onTreeRowSelect: function (e) {
                            var r = e.getParameter("rowContext").getModel().getProperty(e.getParameter("rowContext").sPath);
                            var i = l(r);
                            if (i.pass) {
                                a.setSelectedKey(r[n]);
                                a.setValue(r[o] + " (" + r[n] + ")");
                                u._valueHelpDialogs[g].close()
                            } else {
                                var s = t.byId(g + "TreeVHFragment", "CategoryTreeVHMessageStrip");
                                s.setVisible(true);
                                s.setText(i.msg);
                                s.setType(i.type)
                            }
                        },
                        onTreeMultiRowSelect: function (a) {
                            if (!a.getParameter("rowContext")) {
                                return
                            }
                            var r = e.getView().getModel("mCustIdentification").getData().customerInfo.ContractStatus_new;
                            var n = a.getSource().isIndexSelected(a.getParameter("rowIndex"));
                            var i = a.getParameter("rowContext").getObject();
                            var o = t.byId(g + "TreeVHFragment", "CategoryMultiInput");
                            var s = o.getTokens();
                            var u = true;
                            var d;
                            if (n) {
                                if (s.length > 0) {
                                    for (var c = 0; c < s.length; c++) {
                                        if (s[c].getProperty("key") === i.cat_id) {
                                            d = s[c];
                                            u = false
                                        } else if (s[c].getProperty("key").includes("_S_OC") || s[c].getProperty("key").includes("_S_IC")) {
                                            u = false;
                                            var C = t.byId(g + "TreeVHFragment", "CategoryTreeVHMessageStrip");
                                            C.setVisible(true);
                                            C.setText("Multiple Selection Not Allowed");
                                            C.setType("Error")
                                        }
                                    }
                                }
                                if (u) {
                                    var p = l(i);
                                    if (p.pass) {
                                        d = new sap.m.Token({
                                            key: i.cat_id,
                                            text: i.cat_label,
                                            customData: [new sap.ui.core.CustomData({
                                                value: i
                                            })]
                                        });
                                        o.addToken(d)
                                    } else {
                                        var C = t.byId(g + "TreeVHFragment", "CategoryTreeVHMessageStrip");
                                        C.setVisible(true);
                                        C.setText(p.msg);
                                        C.setType(p.type)
                                    }
                                } else {
                                    if (!n) {
                                        o.removeToken(d)
                                    }
                                }
                            } else {
                                var f = o.getTokens();
                                var m = s.findIndex(function (e) {
                                    return e.getProperty("key") === i.cat_id
                                });
                                if (m !== -1) {
                                    o.removeToken(m);
                                    var C = t.byId(g + "TreeVHFragment", "CategoryTreeVHMessageStrip");
                                    C.setVisible(false)
                                }
                            }
                        },
                        aditionalColumVisible: function (e) {
                            var t = false,
                                a = false,
                                r = false,
                                n = false;
                            var i = 0,
                                o = 0;
                            if (e.to_EquipmentRecall.results.length > 0) {
                                for (var s = 0; s < e.to_EquipmentRecall.results.length; s++) {
                                    var l = e.to_EquipmentRecall.results[s];
                                    if (l.WarrantyClaim !== "" && l.ServiceOrder !== "") {
                                        i = i + 1
                                    } else if (l.WarrantyClaim !== "") {
                                        o = o + 1
                                    }
                                }
                                a = i === e.to_EquipmentRecall.results.length ? true : false;
                                r = o > 0 ? true : false
                            } else {
                                n = true
                            }
                            if (n) {
                                t = false
                            } else if (r) {
                                t = true
                            } else if (a) {
                                t = false
                            }
                            return t
                        },
                        onPressOk: function (r) {
                            var n = e.getView().getModel("mCustIdentification");
                            var i = n.getData();
                            var o = t.byId(g + "TreeVHFragment", "CategoryMultiInput");
                            i.CategoryLength = o.getTokens().length;
                            n.updateBindings(true);
                            a.setTokens(o.getTokens());
                            u._valueHelpDialogs[g].close()
                        },
                        afterClose: function () {
                            t.byId(g + "TreeVHFragment", "CategoryTreeVHMessageStrip").setVisible(false)
                        },
                        onCancelPressed: function () {
                            u._valueHelpDialogs[g].close()
                        },
                        onSearchTreeTable: function (e) {
                            var t = e.getSource().getParent().getParent();
                            if (e.getParameters().refreshButtonPressed) {
                                this.onRefresh(t);
                                t.collapseAll();
                                return
                            }
                            var a = e.getParameter("query");
                            var r = [];
                            if (a) {
                                r.push(new i({
                                    filters: [new i({
                                        path: "cat_id",
                                        operator: sap.ui.model.FilterOperator.Contains,
                                        value1: a
                                    }), new i({
                                        path: "cat_label",
                                        operator: sap.ui.model.FilterOperator.Contains,
                                        value1: a
                                    })],
                                    and: false
                                }))
                            }
                            t.getBinding("rows").filter(r);
                            if (r.length > 0) {
                                t.expandToLevel(3)
                            } else {
                                t.collapseAll()
                            }
                        },
                        onRefresh: function (e) {
                            e.getBinding("rows").refresh()
                        }
                    }
                }).then(function (a) {
                    u._valueHelpDialogs[g] = a;
                    e.getView().addDependent(u._valueHelpDialogs[g]);
                    var r = t.byId(g + "TreeVHFragment", "CategoryTreeTable");
                    r.addEventDelegate({
                        onAfterRendering: function (e) {
                            this.getRows().forEach(function (e) {
                                if (e.getBindingContext()) {
                                    var t = e.getBindingContext("undefined").getObject();
                                    var a = t.children && t.children.length > 0;
                                    var n = e.sId.split("-")[e.sId.split("-").length - 1];
                                    var i = n.substring(3, n.length);
                                    var o = r.getId() + "-rowsel" + i;
                                    if (a) {
                                        $(document.getElementById(o)).addClass("disabledbutton")
                                    } else {
                                        $(document.getElementById(o)).removeClass("disabledbutton")
                                    }
                                }
                            })
                        }
                    }, r);
                    var n = function () {
                        r.rerender()
                    };
                    r.attachModelContextChange(n);
                    r.attachToggleOpenState(n);
                    r.attachBusyStateChanged(n);
                    r.attachFirstVisibleRowChanged(n);
                    u._initTreeValueHelpDialog(g, s)
                })
            } else {
                u._initTreeValueHelpDialog(g, s)
            }
        },
        _initTreeValueHelpDialog: function (e, a) {
            var r = t.byId(e + "TreeVHFragment", "CategoryTreeTable");
            var n = new sap.ui.model.json.JSONModel;
            n.setData(a);
            r.setModel(n);
            r.bindRows({
                path: "/",
                parameters: {
                    arrayNames: ["children"]
                }
            });
            var i = t.byId(e + "TreeVHFragment", "CategoryMultiInput");
            i.removeAllTokens();
            t.byId(e + "TreeVHFragment", "searchField").setValue("");
            this._valueHelpDialogs[e].open()
        },
        handlePlantValueHelp: function (e) {
            var t = this;
            var a = this.getView().getModel("mCustIdentification");
            var r = a.getData();
            var n = e.getSource();
            var i = t.aeUI5Util.geti18nText(t, "PLANT");
            var o = "ZAE_I_Plant_03";
            var s = "ValuationArea";
            var l = "PlantName";
            var dialogId = "application-app-tile-component---Main--SCIN_I01DialogVHFragment";
            var existingDialog = sap.ui.getCore().byId(dialogId);
            if (existingDialog) {
                existingDialog.destroy();
            }

            this.aeUI5Util.handleDialogValueHelp(t, n, i, o, s, l)
        },
        onPlantSelected: function (t) {
            var a = this;
            if (!e.MainAppState && !a.Equipment) {
                this.fnRestPageData()
            }
            var r = t.getSource();
            var n = this.getView().getModel("mCustIdentification").getData();
            a.getView().byId("EquipmentVH").setBusy(true);
            this.getView().getModel().read("/ZAE_I_TC_SCIN_03", {
                urlParameters: {
                    $filter: "Plant  eq '" + r.getSelectedKey() + "'"
                },
                success: function (e, t) {
                    a.getView().byId("EquipmentVH").setBusy(false);
                    if (e.results.length > 0) {
                        n.SchemaTransactionType = e.results[0];
                        if (!a.Equipment) {
                            a.getView().byId("SCIN_I02").removeAllTokens()
                        }
                    } else {
                        n.SchemaTransactionType.RelForWarRecSC = false
                    }
                },
                error: function (e) {
                    a.getView().byId("EquipmentVH").setBusy(false)
                }
            });
            this.getView().getModel().read("/ZAE_I_AssignPlantCompanyCode", {
                urlParameters: {
                    $filter: "Plant  eq '" + r.getSelectedKey() + "'"
                },
                success: function (e, t) {
                    if (e.results.length > 0) {
                        n.PlantCompCode = e.results[0]
                    }
                },
                error: function (e) { }
            });
            this.getView().getModel().read("/ZAE_I_TVKWZ_ASSIGN", {
                urlParameters: {
                    $filter: "Plant  eq '" + r.getSelectedKey() + "'"
                },
                success: function (e, t) {
                    if (e.results.length > 0) {
                        n.SalesOrg = e.results[0].SalesOrganization
                    }
                },
                error: function (e) { }
            });
            a.byId("SmartTableSalesArea").rebindTable()
        },
        handleInsurerValueHelp: function (e) {
            var t = this;
            var a = e.getSource();
            var r = this.getView().getModel("mCustIdentification");
            var n = r.getData();
            var i = t.getView().getModel("i18n").getResourceBundle().getText("Insurer");
            var o = "ZAE_C_EquipmentInsurance_01";
            var s = "InsurancePartner";
            var l = "PartnerName";
            var u = "InsuranceType";
            var g = {
                path: "Equipment",
                operator: "EQ",
                value1: n.customerInfo.Equipment
            };
            this.handleInsuranceDialogValueHelp(t, a, i, o, s, l, g, u)
        },
        fnCheckCreateAppointmentButtonEnable: function (e, t, a, r, n, i, o, s, l) {
            if (e && t > 0 && a > 0 && (r || n) && o !== "E0025" && s !== "CTER" && l) {
                return true
            }
            return false
        },
        fnCheckExtendCustomerButtonEnable: function (e, t) {
            if (e && t) {
                return true
            }
            return false
        },
        filterTreeData: function (e, t, a, r, n, i) {
            var o = e;
            if (o && o.length > 0) {
                var s = function (e) {
                    var t = 0;
                    n.forEach(a => {
                        if (a === e) {
                            t = t + 1
                        }
                    });
                    return t > 0
                };
                var l = function (e) {
                    return e.filter(function (e) {
                        var t = e;
                        return t.Material === r
                    })
                };
                var u = function (e) {
                    return e.filter(function (e) {
                        var n = e;
                        var i = n.cat_id;
                        if (n.children) {
                            n.children = u(n.children)
                        }
                        if (r && n.cat_desc === "CTIN" && n.children) {
                            n.children = l(n.children)
                        }
                        var o = true;
                        for (var g = 0; g < a.length; g++) {
                            if (a[g].CatIDCategory === "" && a[g].SrviceSchemaQualifier === n.cat_desc) {
                                o = false
                            } else if (a[g].CatIDCategory === n.CatIDCategory && a[g].SrviceSchemaQualifier === n.cat_desc) {
                                o = false
                            } else if (a[g].CatIDCategory === n.CatIDCategory && a[g].SrviceSchemaQualifier === n.CatIDType) {
                                o = false
                            }
                        }
                        if (o !== false && s(n.cat_id)) {
                            return true
                        }
                        return n.parentId !== t || n.SrviceSchemaQualifier === "" || o
                    })
                };
                o = u(o)
            }
            return o
        },
        filterTreeESTOData: function (e, t, a, r, n) {
            var i = e;
            if (i && i.length > 0) {
                var o = function (e) {
                    var t = 0;
                    a.forEach(a => {
                        if (a === e) {
                            t = t + 1
                        }
                    });
                    return t > 0
                };
                var s = function (e) {
                    var t = 0;
                    r.forEach(a => {
                        if (a === e) {
                            t = t + 1
                        }
                    });
                    return t > 0
                };
                var l = function (e) {
                    return e.filter(function (e) {
                        var a = e;
                        var r = a.cat_id;
                        if (a.children) {
                            a.children = l(a.children)
                        }
                        var n = false;
                        for (var i = 0; i < t.length; i++) {
                            if (t[i].CatIDCategory === a.CatIDCategory && t[i].SrviceSchemaQualifier === a.CatIDType) {
                                n = true
                            } else if (!a.CatIDCategory) {
                                n = true
                            }
                        }
                        if (n === false && (o(a.cat_id) || s(a.cat_id))) {
                            return true
                        }
                        return n
                    })
                };
                i = l(i)
            }
            return i
        },
        filterTreeData_old: function (e, t, a, r) {
            var n = e;
            if (n && n.length > 0) {
                var i = function (e) {
                    return e.filter(function (e) {
                        var t = e;
                        return t.Material === r
                    })
                };
                var o = function (e) {
                    return e.filter(function (e) {
                        var n = e;
                        if (n.children) {
                            n.children = o(n.children)
                        }
                        if (r && n.cat_desc === "CTIN" && n.children) {
                            n.children = i(n.children)
                        }
                        return n.parentId !== t || n.cat_desc === "" || a.includes(n.cat_desc)
                    })
                };
                n = o(n)
            }
            return n
        },
        filterTreeRecallData: function (e, t) {
            var a = e;
            if (a && a.length > 0) {
                var r = function (e) {
                    return e.filter(function (e) {
                        var a = 0;
                        var r = e;
                        for (var n = 0; n < t.length; n++) {
                            if (r.cat_id === t[n].ExtRecallNo && t[n].ServiceOrder !== "" && t[n].MaintenanceOrder !== "" && t[n].SystemStatus.includes("TECO")) {
                                r["Status"] = "TECO"
                            } else if (r.cat_id === t[n].ExtRecallNo && r["Status"] !== "TECO") {
                                a = a + 1;
                                r["ValidFrom"] = t[n].ValidFrom;
                                r["ValidTo"] = t[n].ValidTo;
                                r["Info"] = t[n].Info
                            }
                        }
                        return a > 0
                    })
                };
                var n = function (e) {
                    return e.filter(function (t) {
                        var a = t;
                        if (a.children) {
                            a.children = n(a.children)
                        }
                        if (a.cat_id.slice(-4) === "S_RC") {
                            var i = r(a.children);
                            a.children = i;
                            return i.length > 0
                        }
                        return e
                    })
                };
                a = n(a)
            }
            return a
        },
        filterTreeMaterialKM: function (e, t) {
            function a(e, r) {
                var n = 0;
                var i = [];
                var o = false;
                while (n < e.length) {
                    if (e[n].children && e[n].children.length > 0) {
                        if (e[n].cat_desc === "CTIN" || e[n].children && e[n].cat_desc === "CTOT" || r) {
                            e[n].children = a(e[n].children, true)
                        } else {
                            e[n].children = a(e[n].children)
                        }
                    } else if (r) {
                        o = true;
                        i = e.filter(function (e) {
                            var a = e;
                            if (a.msitem && t.to_Item_01.results && t.to_Item_01.results.length > 0) {
                                var r = a.msitem.replace(/[^0-9.]+/g, "");
                                r = parseFloat(r);
                                if (isNaN(r)) {
                                    r = 0
                                }
                                var n = t.to_Item_01.results[0].FromMsItem.replace(/[^0-9.]+/g, "");
                                var i = t.to_Item_01.results[0].ToMsItem.replace(/[^0-9.]+/g, "");
                                if (n && i && r >= parseFloat(n) && r <= parseFloat(i)) {
                                    return true
                                } else {
                                    return false
                                }
                            } else {
                                return false
                            }
                        })
                    }
                    n++
                }
                if (o) {
                    e = i
                }
                return e
            }
            return a(e)
        },
        TreeRecurseKMReadingValidation: function (e, t) {
            function a(e, t, r) {
                var n = 0;
                while (n < e.length) {
                    if (e[n].children && e[n].children.length > 0) {
                        if (e[n].cat_desc === "CTIN" || e[n].children && e[n].cat_desc === "CTOT" || r) {
                            a(e[n].children, t, true)
                        } else {
                            a(e[n].children, t)
                        }
                    } else if (r) {
                        var i = false;
                        for (var o = 0; o < e.length; o++) {
                            e[o]["KMReadingValidationRequired"] = true;
                            if (!i) {
                                e[o]["KMReadingValidationPass"] = false
                            }
                            if (o === e.length - 1) {
                                if (Number(e[o].odm_reading) == t) {
                                    e[o]["KMReadingValidationPass"] = true;
                                    i = true
                                }
                            } else if (t < Number(e[o].odm_reading) && !i) {
                                e[o]["KMReadingValidationPass"] = true;
                                i = true
                            } else if (Number(e[o].odm_reading) <= t && t < Number(e[o + 1].odm_reading)) {
                                e[o]["KMReadingValidationPass"] = true;
                                e[o + 1]["KMReadingValidationPass"] = true;
                                i = true
                            }
                        }
                    }
                    n++
                }
                return e
            }
            return a(e, t)
        },
        fnResourceLoad: function (e) {
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var r = this.byId("SCIN_I01").getSelectedKey();
            var n = t.createEmptyAppState(sap.ui.component(a));
            var i = this.byId("EquipmentVH").getTokens();
            var o = "",
                s = "";
            if (i.length > 0) {
                o = i[0].getProperty("key");
                s = i[0].getProperty("text")
            }
            var l = [];
            var u = this.byId("SCIN_I02").getTokens();
            for (var g = 0; g < u.length; g++) {
                l.push({
                    key: u[g].getProperty("key"),
                    text: u[g].getProperty("text")
                })
            }
            var d = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: l,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: o,
                EquipmentWithDesc: s
            };
            n.setData(d);
            n.save();
            var c = sap.ui.core.routing.HashChanger.getInstance();
            var C = c.getHash();
            var p = C + "?" + "sap-iapp-state=" + n.getKey();
            c.replaceHash(p);
            var f = t && t.hrefForExternal({
                target: {
                    semanticObject: "ResourceLoad",
                    action: "aesDisplay"
                },
                params: {
                    Plant: r
                }
            }) || "";
            t.toExternal({
                target: {
                    shellHash: f
                }
            })
        },
        fnMoreEquipmentInfo: function (e) {
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = this.getView().getModel("mCustIdentification").getData();
            var r = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var n = t.createEmptyAppState(sap.ui.component(r));
            var i = this.byId("EquipmentVH").getTokens();
            var o = "",
                s = "";
            if (i.length > 0) {
                o = i[0].getProperty("key");
                s = i[0].getProperty("text")
            }
            var l = [];
            var u = this.byId("SCIN_I02").getTokens();
            for (var g = 0; g < u.length; g++) {
                l.push({
                    key: u[g].getProperty("key"),
                    text: u[g].getProperty("text")
                })
            }
            var d = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: l,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: o,
                EquipmentWithDesc: s
            };
            n.setData(d);
            n.save();
            var c = sap.ui.core.routing.HashChanger.getInstance();
            var C = c.getHash();
            var p = C + "?" + "sap-iapp-state=" + n.getKey();
            c.replaceHash(p);
            var f = t && t.hrefForExternal({
                target: {
                    semanticObject: "Equipment",
                    action: "aeuDisplay"
                },
                params: {
                    Equipment: a.customerInfo.Equipment
                }
            }) || "";
            t.toExternal({
                target: {
                    shellHash: f
                }
            })
        },
        fnMoreCustomerInfo: function (e) {
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = this.getView().getModel("mCustIdentification").getData();
            var r = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var n = t.createEmptyAppState(sap.ui.component(r));
            var i = this.byId("EquipmentVH").getTokens();
            var o = "",
                s = "";
            if (i.length > 0) {
                o = i[0].getProperty("key");
                s = i[0].getProperty("text")
            }
            var l = [];
            var u = this.byId("SCIN_I02").getTokens();
            for (var g = 0; g < u.length; g++) {
                l.push({
                    key: u[g].getProperty("key"),
                    text: u[g].getProperty("text")
                })
            }
            var d = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: l,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: o,
                EquipmentWithDesc: s
            };
            n.setData(d);
            n.save();
            var c = sap.ui.core.routing.HashChanger.getInstance();
            var C = c.getHash();
            var p = C + "?" + "sap-iapp-state=" + n.getKey();
            c.replaceHash(p);
            var f = t && t.hrefForExternal({
                target: {
                    semanticObject: "Customer",
                    action: "aeDisplay"
                },
                params: {
                    Customer: a.customerInfo.CurrentOwner
                }
            }) || "";
            t.toExternal({
                target: {
                    shellHash: f
                }
            })
        },
        fnShowCountryValueHelp: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            if (!this._CountryValueHelpDialog) {
                t.load({
                    id: "CountrValueHelpDialogFragment",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CountryVH",
                    controller: {
                        fnCreateMask: function (e, t) {
                            var a = "";
                            e.split("").forEach(function (e) {
                                if (e === "9") {
                                    a += "^" + e
                                } else {
                                    a += e
                                }
                            });
                            a += " ";
                            var r = a.length + (t - e.length) + 1;
                            a = a.padEnd(r, "9");
                            return a
                        },
                        _handleValueHelpClose: function (e) {
                            var i = e.getParameter("selectedItem");
                            var o;
                            if (i) {
                                var s = i.getBindingContext().getObject();
                                var l = i.getBindingContext().getObject("IDText");
                                var u = t.byId(r, "CPRNO");
                                if (u && l !== "") {
                                    o = u.getLabels()[0];
                                    o.setText(l)
                                } else {
                                    if (u) {
                                        o = u.getLabels()[0];
                                        o.setText("Emirates ID")
                                    }
                                }
                                var g = t.byId(r, "COUNTRY");
                                g.setValue("");
                                g.setValueState("None");
                                g.setTokens([]);
                                var d = i.getTitle() + " ( " + i.getDescription() + " )";
                                g.addToken(new n({
                                    key: i.getTitle(),
                                    text: d
                                }));
                                t.byId(r, "REGION").setTokens([]);
                                t.byId(r, "REGION").setValue("");
                                t.byId(r, "REGION").setValueState("None");
                                var c = "+" + s.CountryCode;
                                var C = t.byId(r, "MOBILENO");
                                var p = t.byId(r, "TELNO");
                                var f = t.byId(r, "FAXNUMBER");
                                if (s.Country === "AE") {
                                    var m = s.CountryCode.length + 9;
                                    var y = s.CountryCode.length + 8;
                                    var v = s.CountryCode.length + 9;
                                    var I = this.fnCreateMask(c, m);
                                    var S = this.fnCreateMask(c, y);
                                    var h = this.fnCreateMask(c, v)
                                } else if (s.Country === "OM") {
                                    var m = s.CountryCode.length + 8;
                                    var y = s.CountryCode.length + 8;
                                    var v = s.CountryCode.length + 8;
                                    var I = this.fnCreateMask(c, m);
                                    var S = this.fnCreateMask(c, y);
                                    var h = this.fnCreateMask(c, v)
                                } else {
                                    m = s.CountryCode.length + 10;
                                    y = s.CountryCode.length + 10;
                                    v = s.CountryCode.length + 10;
                                    I = this.fnCreateMask(c, m);
                                    S = this.fnCreateMask(c, y);
                                    h = this.fnCreateMask(c, v)
                                }
                                if (C) {
                                    if (C.getValue()) {
                                        C.setValue(c + " " + C.getValue().split(" ")[1])
                                    }
                                    C.setMask(I);
                                    C.setEnabled(true);
                                    C.fireChange()
                                }
                                if (f.getValue()) {
                                    f.setValue(c + " " + f.getValue().split(" ")[1])
                                }
                                f.setMask(h);
                                f.setEnabled(true);
                                f.fireChange();
                                if (p.getValue()) {
                                    p.setValue(c + " " + p.getValue().split(" ")[1])
                                }
                                p.setMask(S);
                                p.setEnabled(true);
                                p.fireChange()
                            } else {
                                p.setEnabled(false);
                                p.setMask("");
                                p.setValue("");
                                if (C) {
                                    C.setEnabled(false);
                                    C.setMask("");
                                    C.setValue("")
                                }
                            }
                            e.getSource().getBinding("items").filter([]);
                            switch (r) {
                                case "fragCreateCustomer":
                                    a.fnCheckCreateCustomerRequiredValidation();
                                    break;
                                case "fragCreateCompany":
                                    a.fnCheckCreateCompanyRequiredValidation();
                                    break
                            }
                        },
                        _handleValueHelpSearch: function (e) {
                            var t = e.getParameter("value");
                            var r = new sap.ui.model.Filter({
                                filters: a.genFilterArr([{
                                    path: "Country",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: t
                                }, {
                                    path: "CountryName",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: t
                                }])
                            });
                            var n = r;
                            a._CountryValueHelpDialog.getBinding("items").filter(n, sap.ui.model.FilterType.Application)
                        }
                    }
                }).then(function (e) {
                    a._CountryValueHelpDialog = e;
                    e.open();
                    e.setModel(a.getView().getModel())
                }, this)
            } else {
                a._CountryValueHelpDialog.getBinding("items").filter([], sap.ui.model.FilterType.Application);
                this._CountryValueHelpDialog.open()
            }
        },
        fnShowCreateContactPersonCountryValueHelp: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            if (!this._ContactPersonCountryValueHelpDialog) {
                t.load({
                    id: "ContactPersonCountryValueHelpDialogFragment",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CountryVH",
                    controller: {
                        fnCreateMask: function (e, t) {
                            var a = "";
                            e.split("").forEach(function (e) {
                                if (e === "9") {
                                    a += "^" + e
                                } else {
                                    a += e
                                }
                            });
                            a += " ";
                            var r = a.length + (t - e.length) + 1;
                            a = a.padEnd(r, "9");
                            return a
                        },
                        _handleValueHelpClose: function (e) {
                            var a = e.getParameter("selectedItem");
                            var i;
                            if (a) {
                                var o = a.getBindingContext().getObject();
                                var s = a.getBindingContext().getObject("IDText");
                                var l = t.byId(r, "CPRNO");
                                if (l && s !== "") {
                                    i = l.getLabels()[0];
                                    i.setText(s)
                                } else {
                                    if (l) {
                                        i = l.getLabels()[0];
                                        i.setText("Emirates ID")
                                    }
                                }
                                var u = t.byId(r, "COUNTRY");
                                u.setValue("");
                                u.setValueState("None");
                                u.setTokens([]);
                                var g = a.getTitle() + " ( " + a.getDescription() + " )";
                                u.addToken(new n({
                                    key: a.getTitle(),
                                    text: g
                                }));
                                t.byId(r, "REGION").setTokens([]);
                                t.byId(r, "REGION").setValue("");
                                t.byId(r, "REGION").setValueState("None");
                                var d = "+" + o.CountryCode;
                                var c = t.byId(r, "MOBILENO");
                                var C = t.byId(r, "TELNO");
                                var p = t.byId(r, "FAXNUMBER");
                                if (o.Country === "AE") {
                                    var f = o.CountryCode.length + 9;
                                    var m = o.CountryCode.length + 8;
                                    var y = o.CountryCode.length + 9;
                                    var v = this.fnCreateMask(d, f);
                                    var I = this.fnCreateMask(d, m);
                                    var S = this.fnCreateMask(d, y)
                                } else if (o.Country === "OM") {
                                    var f = o.CountryCode.length + 8;
                                    var m = o.CountryCode.length + 8;
                                    var y = o.CountryCode.length + 8;
                                    var v = this.fnCreateMask(d, f);
                                    var I = this.fnCreateMask(d, m);
                                    var S = this.fnCreateMask(d, y)
                                } else {
                                    f = o.CountryCode.length + 10;
                                    m = o.CountryCode.length + 10;
                                    y = o.CountryCode.length + 10;
                                    v = this.fnCreateMask(d, f);
                                    I = this.fnCreateMask(d, m);
                                    S = this.fnCreateMask(d, y)
                                }
                                if (c) {
                                    if (c.getValue()) {
                                        c.setValue(d + " " + c.getValue().split(" ")[1])
                                    }
                                    c.setMask(v);
                                    c.setEnabled(true);
                                    c.fireChange()
                                }
                                if (p.getValue()) {
                                    p.setValue(d + " " + p.getValue().split(" ")[1])
                                }
                                p.setMask(S);
                                p.setEnabled(true);
                                p.fireChange();
                                if (C.getValue()) {
                                    C.setValue(d + " " + C.getValue().split(" ")[1])
                                }
                                C.setMask(I);
                                C.setEnabled(true);
                                C.fireChange()
                            } else {
                                var C = t.byId(r, "TELNO");
                                C.setEnabled(false);
                                C.setMask("");
                                C.setValue("")
                            }
                            e.getSource().getBinding("items").filter([])
                        },
                        _handleValueHelpSearch: function (e) {
                            var t = e.getParameter("value");
                            var r = new sap.ui.model.Filter({
                                filters: a.genFilterArr([{
                                    path: "Country",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: t
                                }, {
                                    path: "CountryName",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: t
                                }])
                            });
                            var n = r;
                            a._ContactPersonCountryValueHelpDialog.getBinding("items").filter(n, sap.ui.model.FilterType.Application)
                        }
                    }
                }).then(function (e) {
                    a._ContactPersonCountryValueHelpDialog = e;
                    e.open();
                    e.setModel(a.getView().getModel())
                }, this)
            } else {
                a._ContactPersonCountryValueHelpDialog.getBinding("items").filter([], sap.ui.model.FilterType.Application);
                this._ContactPersonCountryValueHelpDialog.open()
            }
        },
        handleCountrySuggest: function (e) {
            var t = this;
            var a = e.getParameter("suggestValue");
            if (a) {
                var r = new sap.ui.model.Filter({
                    filters: t.genFilterArr([{
                        path: "Country",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }, {
                        path: "CountryName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }])
                })
            }
            var n = true;
            var i = new sap.ui.model.Filter(r, n);
            e.getSource().getBinding("suggestionRows").filter(i);
            var o = e.getSource().getBinding("suggestionRows");
            if (!o.sFilterParams.includes("%27")) {
                for (var s = 0; s <= i.aFilters.length - 1; s++) {
                    i.aFilters[s].oValue1 = "'" + i.aFilters[s].oValue1 + "'"
                }
                o.filter(i)
            } else {
                o.filter(i)
            }
            e.getSource().getBinding("suggestionRows").resume()
        },
        onCountryTokenUpdate: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            t.byId(r, "COUNTRY").setValueState("None");
            var n = e.getSource().getTokens();
            if (n.length === 0 || e.getParameter("type") === "removed") {
                e.getSource().setSelectedKey("");
                e.getSource().setTokens([]);
                t.byId(r, "TELNO").setEnabled(false);
                t.byId(r, "TELNO").setValue("");
                t.byId(r, "FAXNUMBER").setValue("");
                t.byId(r, "FAXNUMBER").setEnabled(false);
                if (r !== "fragCreateCompany") {
                    t.byId(r, "CPRNO").setValue("")
                }
                if (r === "fragCreateCustomer" || r === "fragCreateCompany") {
                    t.byId(r, "MOBILENO").setEnabled(false);
                    t.byId(r, "MOBILENO").setValue("")
                }
            }
            switch (r) {
                case "fragCreateCustomer":
                    a.fnCheckCreateCustomerRequiredValidation();
                    break;
                case "fragCreateContactPerson":
                    a._fnContractButtonCreateButtonEnabledState();
                    break;
                case "fragCreateCompany":
                    a.fnCheckCreateCompanyRequiredValidation();
                    break
            }
        },
        fnCreateMask: function (e, t) {
            var a = "";
            e.split("").forEach(function (e) {
                if (e === "9") {
                    a += "^" + e
                } else {
                    a += e
                }
            });
            a += " ";
            var r = a.length + (t - e.length) + 1;
            a = a.padEnd(r, "9");
            return a
        },
        onSelectCountry: function (e) {
            var a = this;
            var r;
            var n = e.getSource().getId().split("--")[0];
            t.byId(n, "COUNTRY").setValueState("None");
            var i = t.byId(n, "TELNO");
            var o = t.byId(n, "FAXNUMBER");
            t.byId(n, "REGION").setTokens([]);
            if (e.getParameter("selectedRow") !== null) {
                var s = e.getSource();
                s.setTokens([]);
                var l = e.getParameter("selectedRow").getBindingContext().getObject();
                var u = l.IDText;
                var g = t.byId(n, "CPRNO");
                if (g && u !== "") {
                    r = g.getLabels()[0];
                    r.setText(u)
                } else {
                    if (g) {
                        r = g.getLabels()[0];
                        r.setText("Emirates ID")
                    }
                }
                var d = this.formatNameAndValuePair(l.Country, l.CountryName);
                var c = new sap.m.Token({
                    key: l.Country,
                    text: d
                });
                s.setTokens([c]);
                var C = "+" + l.CountryCode;
                var p = t.byId(n, "MOBILENO");
                if (l.Country === "AE") {
                    var f = l.CountryCode.length + 9;
                    var m = l.CountryCode.length + 8;
                    var y = l.CountryCode.length + 9;
                    var v = this.fnCreateMask(C, f);
                    var I = this.fnCreateMask(C, m);
                    var S = this.fnCreateMask(C, y)
                } else if (l.Country === "OM") {
                    var f = l.CountryCode.length + 8;
                    var m = l.CountryCode.length + 8;
                    var y = l.CountryCode.length + 8;
                    var v = this.fnCreateMask(C, f);
                    var I = this.fnCreateMask(C, m);
                    var S = this.fnCreateMask(C, y)
                } else {
                    f = l.CountryCode.length + 10;
                    m = l.CountryCode.length + 10;
                    y = l.CountryCode.length + 10;
                    v = this.fnCreateMask(C, f);
                    I = this.fnCreateMask(C, m);
                    S = this.fnCreateMask(C, y)
                }
                if (p) {
                    if (p.getValue()) {
                        p.setValue(C + " " + p.getValue().split(" ")[1])
                    }
                    p.setMask(v);
                    p.setEnabled(true);
                    p.fireChange()
                }
                if (o.getValue()) {
                    o.setValue(C + " " + o.getValue().split(" ")[1])
                }
                o.setMask(S);
                o.setEnabled(true);
                o.fireChange();
                if (i.getValue()) {
                    i.setValue(C + " " + i.getValue().split(" ")[1])
                }
                i.setMask(I);
                i.setEnabled(true);
                i.fireChange()
            } else {
                i.setEnabled(false);
                i.setMask("");
                i.setValue("");
                if (p) {
                    p.setEnabled(false);
                    p.setMask("");
                    p.setValue("")
                }
            }
            switch (n) {
                case "fragCreateCustomer":
                    a.fnCheckCreateCustomerRequiredValidation();
                    break;
                case "fragCreateContactPerson":
                    a._fnContractButtonCreateButtonEnabledState();
                    break;
                case "fragCreateCompany":
                    a.fnCheckCreateCompanyRequiredValidation();
                    break
            }
        },
        formatNameAndValuePair: function (e, t) {
            if (!e && !t) {
                return ""
            } else if (t && !e) {
                return t.replace(/^0+/, "")
            } else if (!t && e) {
                return e
            } else {
                return e + " (" + t.replace(/^0+/, "") + ")"
            }
        },
        fnShowCreateContactPersonRegionValueHelp: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            var i = t.byId("CallerId", "COUNTRY");
            if (i.getTokens([]).length !== 0) {
                i = t.byId("CallerId", "COUNTRY").getTokens()[0].getKey();
                var o = [];
                if (i) {
                    o.push(new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.EQ, i))
                }
            }
            if (!this._CreateContactPersonRegionValueHelpDialog) {
                t.load({
                    id: "RegionValueHelpDialogFragment",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.RegionVH",
                    controller: {
                        _handleValueHelpClose: function (e) {
                            var a = e.getParameter("selectedItem");
                            if (a) {
                                var i = t.byId(r, "REGION");
                                i.setTokens([]);
                                var o = a.getTitle() + " ( " + a.getDescription() + " )";
                                i.addToken(new n({
                                    key: a.getTitle(),
                                    text: o
                                }))
                            }
                            e.getSource().getBinding("items").filter([])
                        },
                        _handleValueHelpSearch: function (e) {
                            var n = e.getParameter("value");
                            var o = new sap.ui.model.Filter({
                                filters: a.genFilterArr([{
                                    path: "Country",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: n
                                }, {
                                    path: "CountryName",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: n
                                }, {
                                    path: "Region",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: n
                                }, {
                                    path: "RegionName",
                                    operator: sap.ui.model.FilterOperator.Contains,
                                    value1: n
                                }])
                            });
                            var s = o;
                            i = t.byId(r, "COUNTRY");
                            if (i.getTokens([]).length !== 0) {
                                var l = t.byId(r, "COUNTRY").getTokens()[0].getKey();
                                if (l) {
                                    s = new sap.ui.model.Filter({
                                        filters: [o, a.genFilterArr([{
                                            path: "Country",
                                            operator: "EQ",
                                            value1: l
                                        }])[0]],
                                        and: true
                                    })
                                }
                            }
                            a._CreateContactPersonRegionValueHelpDialog.getBinding("items").filter(s, sap.ui.model.FilterType.Application)
                        }
                    }
                }).then(function (e) {
                    a._CreateContactPersonRegionValueHelpDialog = e;
                    e.open();
                    e.setModel(a.getView().getModel());
                    a._CreateContactPersonRegionValueHelpDialog.getBinding("items").filter(o)
                }, this)
            } else {
                this._CreateContactPersonRegionValueHelpDialog.open();
                a._CreateContactPersonRegionValueHelpDialog.getBinding("items").filter(o, sap.ui.model.FilterType.Application)
            }
        },
        fnShowRegionValueHelp: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            var n = t.byId(r, "COUNTRY");
            if (n.getTokens([]).length !== 0) {
                n = t.byId(r, "COUNTRY").getTokens()[0].getKey();
                var i = [];
                if (n) {
                    i.push(new sap.ui.model.Filter("Country", sap.ui.model.FilterOperator.EQ, n))
                }
            }
            if (a._RegionValueHelpDialog) {
                a._RegionValueHelpDialog.destroy()
            }
            t.load({
                id: "RegionValueHelpDialogFragment",
                name: "com.globalintelli.ZAE_SCIN_NEW.fragment.RegionVH",
                controller: {
                    _handleValueHelpClose: function (e) {
                        var n = e.getParameter("selectedItem");
                        if (n) {
                            var i = t.byId(r, "REGION");
                            i.setTokens([]);
                            i.setValueState("None");
                            i.setValue("");
                            var o = n.getTitle() + " ( " + n.getDescription() + " )";
                            var s = new sap.m.Token({
                                key: n.getTitle(),
                                text: o
                            });
                            i.setTokens([s])
                        }
                        e.getSource().getBinding("items").filter([]);
                        switch (r) {
                            case "fragCreateCustomer":
                                a.fnCheckCreateCustomerRequiredValidation();
                                break;
                            case "fragCreateContactPerson":
                                a._fnContractButtonCreateButtonEnabledState();
                                break;
                            case "fragCreateCompany":
                                a.fnCheckCreateCompanyRequiredValidation();
                                break
                        }
                    },
                    _handleValueHelpSearch: function (e) {
                        var i = e.getParameter("value");
                        var o = new sap.ui.model.Filter({
                            filters: a.genFilterArr([{
                                path: "Country",
                                operator: sap.ui.model.FilterOperator.Contains,
                                value1: i
                            }, {
                                path: "CountryName",
                                operator: sap.ui.model.FilterOperator.Contains,
                                value1: i
                            }, {
                                path: "Region",
                                operator: sap.ui.model.FilterOperator.Contains,
                                value1: i
                            }, {
                                path: "RegionName",
                                operator: sap.ui.model.FilterOperator.Contains,
                                value1: i
                            }])
                        });
                        var s = o;
                        n = t.byId(r, "COUNTRY");
                        if (n.getTokens([]).length !== 0) {
                            var l = t.byId(r, "COUNTRY").getTokens()[0].getKey();
                            if (l) {
                                s = new sap.ui.model.Filter({
                                    filters: [o, a.genFilterArr([{
                                        path: "Country",
                                        operator: "EQ",
                                        value1: l
                                    }])[0]],
                                    and: true
                                })
                            }
                        }
                        a._RegionValueHelpDialog.getBinding("items").filter(s, sap.ui.model.FilterType.Application)
                    }
                }
            }).then(function (e) {
                a._RegionValueHelpDialog = e;
                e.open();
                e.setModel(a.getView().getModel());
                a._RegionValueHelpDialog.getBinding("items").filter(i)
            }, this)
        },
        handleRegionSuggest: function (e) {
            var a = this;
            var r = e.getParameter("suggestValue");
            if (r) {
                var n = new sap.ui.model.Filter({
                    filters: a.genFilterArr([{
                        path: "Country",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }, {
                        path: "CountryName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }, {
                        path: "Region",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }, {
                        path: "RegionName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }])
                })
            }
            var i = true;
            var s = new sap.ui.model.Filter(n, i);
            var l = e.getSource().getId().split("--")[0];
            var u = t.byId(l, "COUNTRY").getValue();
            if (u) {
                s = new sap.ui.model.Filter({
                    filters: [n, a.genFilterArr([{
                        path: "Country",
                        operator: o.EQ,
                        value1: u
                    }])[0]],
                    and: true
                })
            }
            e.getSource().getBinding("suggestionRows").filter(s);
            e.getSource().getBinding("suggestionRows").resume()
        },
        handleRegionSuggest: function (e) {
            var a = this;
            var r = e.getParameter("suggestValue");
            if (r) {
                var n = new sap.ui.model.Filter({
                    filters: a.genFilterArr([{
                        path: "Country",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }, {
                        path: "CountryName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }, {
                        path: "Region",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }, {
                        path: "RegionName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: r
                    }])
                })
            }
            var i = true;
            var s = new sap.ui.model.Filter(n, i);
            var l = e.getSource().getId().split("--")[0];
            var u = t.byId(l, "COUNTRY");
            if (u.getTokens([]).length !== 0) {
                var g = t.byId(l, "COUNTRY").getTokens()[0].getKey();
                if (g) {
                    s = new sap.ui.model.Filter({
                        filters: [n, a.genFilterArr([{
                            path: "Country",
                            operator: o.EQ,
                            value1: g
                        }])[0]],
                        and: true
                    })
                }
            }
            e.getSource().getBinding("suggestionRows").filter(s);
            e.getSource().getBinding("suggestionRows").resume()
        },
        onRegionTokenUpdate: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            t.byId(r, "REGION").setValueState("None");
            var n = e.getSource().getTokens();
            if (n.length === 0 || e.getParameter("type") === "removed") {
                e.getSource().setSelectedKey("");
                e.getSource().setTokens([])
            }
            switch (r) {
                case "fragCreateCustomer":
                    a.fnCheckCreateCustomerRequiredValidation();
                    break;
                case "fragCreateContactPerson":
                    a._fnContractButtonCreateButtonEnabledState();
                    break;
                case "fragCreateCompany":
                    a.fnCheckCreateCompanyRequiredValidation();
                    break
            }
        },
        onSelectRegion: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            t.byId(r, "REGION").setValueState("None");
            if (e.getParameter("selectedRow") !== null) {
                var n = e.getSource();
                n.setTokens([]);
                var i = e.getParameter("selectedRow").getBindingContext().getObject();
                var o = this.formatNameAndValuePair(i.Region, i.RegionName);
                var s = new sap.m.Token({
                    key: i.Region,
                    text: o
                });
                n.setTokens([s])
            }
            switch (r) {
                case "fragCreateCustomer":
                    a.fnCheckCreateCustomerRequiredValidation();
                    break;
                case "fragCreateContactPerson":
                    a._fnContractButtonCreateButtonEnabledState();
                    break;
                case "fragCreateCompany":
                    a.fnCheckCreateCompanyRequiredValidation();
                    break
            }
        },
        genFilterArr: function (e) {
            var t = [];
            e.forEach(function (e) {
                if (e.value2) {
                    t.push(new sap.ui.model.Filter(e.path, e.operator, e.value1, e.value2))
                } else {
                    t.push(new sap.ui.model.Filter(e.path, e.operator, e.value1))
                }
            });
            return t
        },
        onExit: function () {
            e.MainAppState = ""
        },
        onBeforeRebindSmartTableExtendedWarranty: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (a.Equipment) {
                i.preventTableBind = false;
                n = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, a.customerInfo.Equipment);
                r.push(n);
                i.filters = r
            } else {
                i.preventTableBind = true
            }
        },
        onBeforeRebindHistoryTable: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (this.ServiceHistoryTab) {
                i.preventTableBind = false;
                n = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, a.customerInfo.Equipment);
                r.push(n);
                if (a.SchemaTransactionType.FilterHistoryBySalesOrg && a.SalesOrg) {
                    n = new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, a.SalesOrg);
                    r.push(n)
                }
                i.filters = r;
                i.parameters.select = i.parameters.select + ",HistoryItems";
                var o = [];
                o.push(new sap.ui.model.Sorter({
                    path: "PostingDate",
                    descending: true
                }));
                i.sorter = o
            } else {
                i.preventTableBind = true
            }
        },
        onBeforeRebindLegacyHistoryTable: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (this.LegacyHistoryTab) {
                i.preventTableBind = false;
                n = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, a.customerInfo.Equipment);
                r.push(n);
                i.filters = r;
                i.parameters.select = i.parameters.select + ",Invoice";
                var o = [];
                o.push(new sap.ui.model.Sorter({
                    path: "PostingDate",
                    descending: true
                }));
                i.sorter = o
            } else {
                i.preventTableBind = true
            }
        },
        onPressLoadComplaint: function () {
            this.ServiceComplaintTab = true;
            this.getView().byId("openEVHC").rebindTable()
        },
        onPressLoadHistory: function () {
            this.ServiceHistoryTab = true;
            this.getView().byId("vehiclehistory").rebindTable()
        },
        onPressLoadLegacyHistory: function () {
            this.LegacyHistoryTab = true;
            this.getView().byId("vehicleLegacyhistory").rebindTable()
        },
        onPressDisplaySrvHistory: function () {
            var e = this.getView().getModel("mCustIdentification");
            var t = e.getData();
            var a = sap.ushell.Container.getService("CrossApplicationNavigation");
            var r = a && a.hrefForExternal({
                target: {
                    semanticObject: "ZSRV_HISTORYEQ",
                    action: "aeDisplay"
                },
                params: {
                    "SO_EQUNR-LOW": t.customerInfo.Equipment
                }
            }) || "";
            var n = window.location.href.split("#")[0] + r;
            sap.m.URLHelper.redirect(n, true)
        },
        onBeforeRebindSmartTableSalesArea: function (e) {

            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var z = null;
            if (oPlantControl) {
                z = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (a.customerInfo.Equipment) {
                i.preventTableBind = false;
                if (a.WorkShop) {
                    n = new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, z);
                    r.push(n)
                }
                if (a.customerInfo.to_CurrentOwner && a.customerInfo.to_CurrentOwner.Partner) {
                    n = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, a.customerInfo.to_CurrentOwner.Partner);
                    r.push(n)
                } else {
                    n = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ, "");
                    r.push(n)
                }
                i.filters = r;
                i.parameters.select = i.parameters.select + ",IsDefaultDC"
            } else {
                i.preventTableBind = true
            }
        },
        onBeforeRebindOpenAppointment: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (a.Equipment) {
                i.preventTableBind = false;
                if (a.Equipment) {
                    n = new sap.ui.model.Filter("Equipment_disp", sap.ui.model.FilterOperator.EQ, a.Equipment);
                    r.push(n)
                } else {
                    n = new sap.ui.model.Filter("Equipment_disp", sap.ui.model.FilterOperator.EQ, "");
                    r.push(n)
                }
                i.filters = r;
                i.parameters.select = i.parameters.select + ",Appointment,object_type"
            } else {
                i.preventTableBind = true
            }
        },
        onBeforeRebindSmartTableContactPersonList: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (a.Equipment) {
                i.preventTableBind = false;
                if (a.customerInfo.to_CurrentOwner && a.customerInfo.to_CurrentOwner.Partner) {
                    n = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.EQ, a.customerInfo.to_CurrentOwner.Partner);
                    r.push(n)
                } else {
                    n = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.EQ, "");
                    r.push(n)
                }
                var i = e.getParameter("bindingParams");
                i.filters = r;
                i.parameters = i.parameters || {};
                i.parameters["$top"] = 1;
                i.parameters.select = i.parameters.select + ",ContactPerson,Country,UpdatedBPCheck,FaxNumber"
            } else {
                i.preventTableBind = true
            }
            this.onAfterRenderingContactPersonTable();
        },

        onAfterRenderingContactPersonTable: function () {
            var oSmartTable = this.byId("SmartTableContactPersonList");
            if (!oSmartTable) return;

            var oTable = oSmartTable.getTable();

            // Wait a bit for binding to complete
            setTimeout(function () {
                var aItems = oTable.getItems();

                // Keep only the first item
                for (var i = aItems.length - 1; i > 0; i--) {
                    oTable.removeItem(aItems[i]);
                }

                // Auto select first row
                if (aItems.length > 0) {
                    oTable.setSelectedItem(aItems[0]);
                    this.getView().getModel("mCustIdentification").setProperty("/contactPersonselected", true);
                }
            }.bind(this), 500); // 500ms delay
        },

        onAfterRebindSmartTableSalesArea: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = null;
            e.getSource().getBinding("items").getContexts().forEach(function (t, r) {
                if (t.getObject() && t.getObject().IsDefaultDC) {
                    a = e.getSource().getItems()[r];
                    return
                }
            });
            if (!a) {
                a = e.getSource().getItems()[0]
            }
            var r = t.getData();
            if (e.getSource().getItems().length > 0) {
                e.getSource().setSelectedItem(a);
                if (t.oData.customerInfo.to_CurrentOwner.CustomerStatus === "X") {
                    // this.getView().byId("SCIN_B08").setVisible(false);
                    this.getView().byId("SCIN_B09").setVisible(false)
                } else {
                    // this.getView().byId("SCIN_B08").setVisible(r.customerInfo.isShowSCIN_B08);
                    this.getView().byId("SCIN_B09").setVisible(r.customerInfo.isShowSCIN_B09);
                    e.getSource().fireSelectionChange()
                }
            }
            r.TBLSalesAreaLength = e.getSource().getItems().length;
            t.updateBindings(true)
        },
        fnCheckCustomerServiceBlock: function (e) {
            var t;
            var a = this.getView().getModel("mCustIdentification");
            if (e.getParameter("listItem")) {
                t = e.getParameter("listItem").getBindingContext().getObject().CustomerStatus
            } else {
                t = e.getSource().getItems()[0].getBindingContext().getObject().CustomerStatus
            }
            if (t !== "Yes" && a.oData.customerInfo.to_CurrentOwner.CustomerStatus !== "X") {
                // this.getView().byId("SCIN_B08").setVisible(a.oData.customerInfo.isShowSCIN_B08);
                this.getView().byId("SCIN_B09").setVisible(a.oData.customerInfo.isShowSCIN_B09)
            } else {
                // this.getView().byId("SCIN_B08").setVisible(false);
                this.getView().byId("SCIN_B09").setVisible(false)
            }
        },
        onAfterRebindSmartTableContactPersonList: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            if (e.getSource().getItems().length > 0 && !a.customerInfo.DoNotDefaultCP) {
                t.setProperty("/contactPersonselected", true);
                e.getSource().setSelectedItem(e.getSource().getItems()[0])
            } else {
                t.setProperty("/contactPersonselected", false);
                e.getSource().removeSelections()
            }
            a.TBLContactPersonLength = e.getSource().getItems().length;
            t.updateBindings(true);
            if (this.oCategory) {
                var r = this.oCategory[0].getKey();
                var i = this.oCategory[0].getText();
                this.getView().byId("SCIN_I02").addToken(new n({
                    key: r,
                    text: i
                }))
            }
        },
        onEQUIValueHelpRequested: function () {
            var e = this;
            var t = {
                cols: [{
                    label: this.getView().getModel("i18n").getResourceBundle().getText("Equipment1"),
                    template: "Equipment",
                    width: "10rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("EquipmentName"),
                    template: "EquipmentName",
                    width: "15rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("ManufacturerVIN"),
                    template: "FleetVin",
                    width: "15rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("RegistrationNumber"),
                    template: "LicenseNum",
                    width: "15rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("CustomerNumber"),
                    template: "Partner",
                    width: "15rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("NameofCustomer"),
                    template: "CustomerName",
                    width: "15rem"
                }, {
                    label: this.getView().getModel().getProperty("/#ZAE_C_BPContactPersonType/CPRNumber/@sap:label"),
                    template: "idnumber",
                    width: "5rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("Telephone1"),
                    template: "TelephoneNumber1",
                    width: "15rem"
                }, {
                    label: this.getView().getModel().getProperty("/#ZAE_FM_SC_CONTACT_CREATE/FaxNumber/@sap:label"),
                    template: "FaxNumber",
                    width: "15rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("Make"),
                    template: "Make",
                    width: "5rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("MakeText"),
                    template: "MakeText",
                    width: "5rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("Model"),
                    template: "Model",
                    width: "5rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("ModelText"),
                    template: "ModelText",
                    width: "5rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("Plantt"),
                    template: "MaintenancePlanningPlant",
                    width: "5rem"
                }, {
                    label: this.getView().getModel("i18n").getResourceBundle().getText("EquipmentCategory"),
                    template: "EquipmentCategory",
                    width: "5rem"
                }]
            };
            this.oColModel = new g(t);
            var a = this.oColModel.getData().cols;
            this._oBasicSearchField = new r({
                showSearchButton: false
            });
            this._oValueHelpDialog = sap.ui.xmlfragment("com.globalintelli.ZAE_SCIN_NEW.fragment.EquipmentVH", this);
            this._oValueHelpDialog.setModel(this.getView().getModel());
            this.getView().addDependent(this._oValueHelpDialog);
            this._oValueHelpDialog.getFilterBar().getFilterGroupItems().forEach(function (e) {
                e.getControl().attachBrowserEvent("keyup", function (e) {
                    if (e.which == 13 || e.keyCode == 13) {
                        this._oValueHelpDialog.getFilterBar().fireSearch()
                    }
                }.bind(this))
            }.bind(this));
            this._oValueHelpDialog.setRangeKeyFields([{
                label: this.getView().getModel("i18n").getResourceBundle().getText("Equipment"),
                key: "Equipment",
                type: "string",
                typeInstance: new s({}, {
                    maxLength: 7
                })
            }]);
            this._oValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);
            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar.getControlByKey("Plant");
            if (oPlantControl) {
                var n = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant control not found");
            }
            // var n = e.getView().byId("SCIN_I01").getSelectedKey();
            this._oValueHelpDialog.getTableAsync().then(function (e) {
                e.setModel(this.oColModel, "columns");
                if (e.bindRows) {
                    e.attachRowsUpdated(function (e) {
                        e.getSource().setBusy(false)
                    })
                }
                if (e.bindItems) {
                    e.bindAggregation("items", "/ZAE_VH_Equipment_15(P_Plant='" + n + "')/Set", function () {
                        return new l({
                            cells: a.map(function (e) {
                                return new u({
                                    text: "{" + e.template + "}"
                                })
                            })
                        })
                    })
                }
                this._oValueHelpDialog.update()
            }.bind(this));
            this._oValueHelpDialog.setTokens(this.byId("EquipmentVH").getTokens());
            var i = [];
            var o = this.getView().getModel("mCustIdentification").getData();
            var d = [];
            var c = [];
            var C = [];
            this._oValueHelpDialog.open()
        },
        onValueHelpOkPress: function (e) {
            var t = e.getParameter("tokens");
            this.byId("EquipmentVH").setTokens(t);
            this.byId("SCIN_smartFilterBar").fireSearch();
            // this.byId("SmartTableOpenAppointment").rebindTable();
            this._oValueHelpDialog.close()
        },
        onValueHelpCancelPress: function () {
            this._oValueHelpDialog.close()
        },
        onValueHelpAfterClose: function () {
            this._oValueHelpDialog.destroy()
        },
        _filterTable: function (e) {
            var t = this._oValueHelpDialog;
            // var a = this.getView().byId("SCIN_I01").getSelectedKey();
            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var a = null;
            if (oPlantControl) {
                a = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            t.getTableAsync().then(function (r) {
                if (e.aFilters.length >= 2) {
                    if (r.bindRows) {
                        r.bindAggregation("rows", "/ZAE_VH_Equipment_15(P_Plant='" + a + "')/Set")
                    }
                    if (r.bindRows && r.getBinding("rows")) {
                        r.getBinding("rows").filter(e)
                    }
                    r.setBusy(true)
                }
                if (r.bindItems && r.getBinding("items")) {
                    r.getBinding("items").filter(e)
                }
                t.update()
            })
        },
        onFilterBarSearch: function (e) {
            var t = this._oBasicSearchField.getValue(),
                a = e.getParameter("selectionSet"),
                r;
            if (a) {
                r = a.reduce(function (e, t) {
                    if (t.getValue()) {
                        e.push(new i({
                            path: t.getName(),
                            operator: o.Contains,
                            value1: t.getValue()
                        }))
                    }
                    return e
                }, [])
            } else {
                r = e.getSource().getFilterGroupItems().reduce(function (e, t) {
                    if (t.getControl().getValue()) {
                        e.push(new i({
                            path: t.getControl().getName(),
                            operator: o.Contains,
                            value1: t.getControl().getValue()
                        }))
                    }
                    return e
                }, [])
            }
            if (t) {
                r.push(new i({
                    filters: [new i({
                        path: "Equipment",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "EquipmentName",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "FleetVin",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "LicenseNum",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "FleetNum",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "idnumber",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "Partner",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "CustomerName",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "TelephoneNumber1",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "Make",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "MakeText",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "Model",
                        operator: o.Contains,
                        value1: t
                    }), new i({
                        path: "ModelText",
                        operator: o.Contains,
                        value1: t
                    })],
                    and: false
                }))
            }
            var n = this.getView().getModel("mCustIdentification").getData();
            var s = [];
            var l = [];
            var u = [];
            // var g = this.getView().byId("SCIN_I01").getSelectedItem();

            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var g = null;
            if (oPlantControl) {
                g = oPlantControl.getSelectedItem();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            var d;
            if (g) {
                d = sap.ui.getCore().byId(g).getBindingContext().getObject()
            }
            if (d.EquipmentCategory1) {
                s.push(new i({
                    path: "EquipmentCategory",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: d.EquipmentCategory1
                }))
            }
            if (d.EquipmentCategory2) {
                s.push(new i({
                    path: "EquipmentCategory",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: d.EquipmentCategory2
                }))
            }
            if (d.EquipmentCategory3) {
                s.push(new i({
                    path: "EquipmentCategory",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: d.EquipmentCategory3
                }))
            }
            if (d.UsageIndicator) {
                u.push(new i({
                    path: "FleetUse",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: d.UsageIndicator
                }))
            }
            if (s.length > 0) {
                r.push(new i({
                    filters: s,
                    and: false
                }))
            }
            this._filterTable(new i({
                filters: r,
                and: true
            }))
        },
        fnHandelServiceOrderLinkPress: function (e) {
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var r = t.createEmptyAppState(sap.ui.component(a));
            var n = this.byId("EquipmentVH").getTokens();
            var i = "",
                o = "";
            if (n.length > 0) {
                i = n[0].getProperty("key");
                o = n[0].getProperty("text")
            }
            var s = [];
            var l = this.byId("SCIN_I02").getTokens();
            for (var u = 0; u < l.length; u++) {
                s.push({
                    key: l[u].getProperty("key"),
                    text: l[u].getProperty("text")
                })
            }
            var g = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: s,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: i,
                EquipmentWithDesc: o
            };
            r.setData(g);
            r.save();
            var d = sap.ui.core.routing.HashChanger.getInstance();
            var c = d.getHash();
            var C = c + "?" + "sap-iapp-state=" + r.getKey();
            d.replaceHash(C);
            var p = t && t.hrefForExternal({
                target: {
                    semanticObject: "ServiceOrder",
                    action: "aesDisplay&//ZAE_C_ServiceOrder_01(ServiceObjectType='BUS2000116',ServiceOrder='" + e.getSource().getText() + "',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
                }
            }) || "";
            t.toExternal({
                target: {
                    shellHash: p
                }
            })
        },
        onServiceListPress: function (e) {
            var t = this;
            var a = e.getSource();
            var r = a.getBindingContext().getPath();
            var n;
            if (r.split("(")[0] === "/ZAE_C_ServiceOrderHistory_04") {
                n = r.split("(")[0]
            } else {
                n = "/ZAE_C_ServiceOrderHistory_03"
            }
            var o = e.getSource().getBindingContext().getModel();
            t.objServiceOrderHistory = o.getProperty(r);
            var s = [];
            if (n === "/ZAE_C_ServiceOrderHistory_03") {
                s.push(new i("ServiceOrder", sap.ui.model.FilterOperator.EQ, t.objServiceOrderHistory.ServiceOrder))
            }
            if (n === "/ZAE_C_ServiceOrderHistory_04") {
                s.push(new i("Invoice", sap.ui.model.FilterOperator.EQ, t.objServiceOrderHistory.Invoice))
            }
            s.push(new i("Equipment", sap.ui.model.FilterOperator.EQ, t.objServiceOrderHistory.Equipment));
            a.setBusy(true);
            t.getView().getModel().read(n, { //ZAE_C_LicenseNum_01
                filters: s,
                success: function (e) {
                    a.setBusy(false);
                    if (e.results.length > 0) {
                        t.objServiceOrderHistory = e.results[0];
                        t._openServiceOrderHistoryItems()
                    }
                },
                error: function (e) {
                    a.setBusy(false)
                }
            })
        },
        _openServiceOrderHistoryItems: function () {
            var e = this;
            if (!e._ServiceOrderHistoryItems) {
                t.load({
                    id: "fragServiceOrderHistoryItems",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ServiceOrderHistoryItems",
                    controller: {
                        onBeforeRebindServiceOrderHistoryItems: function (t) {
                            var a = [],
                                r;
                            var n = t.getParameter("bindingParams");
                            r = new sap.ui.model.Filter("Invoice", sap.ui.model.FilterOperator.EQ, e.objServiceOrderHistory.Invoice);
                            a.push(r);
                            n.filters = a
                        },
                        onCancelPressed: function () {
                            e._ServiceOrderHistoryItems.close()
                        }
                    }
                }, this).then(function (t) {
                    e._ServiceOrderHistoryItems = t;
                    e.getView().addDependent(e._ServiceOrderHistoryItems);
                    e._ServiceOrderHistoryItems.open()
                }.bind(this))
            } else {
                t.byId("fragServiceOrderHistoryItems", "SmartTableServiceOrderHistoryItems").rebindTable();
                e._ServiceOrderHistoryItems.open()
            }
        },
        onContractLinkPress: function (e) {
            var t = this;
            var a = [];
            var r = t.getView().getModel("mCustIdentification");
            var n = r.getData();
            var i = n.customerInfo.to_ServiceContractNew.results;
            var o = e.getSource();
            var s;
            for (var l = 0; i && l < i.length; l++) {
                if (i[l].ContractStatus === "CTIN") {
                    s = i[l]
                }
            }
            r.setProperty("/customerInfo/ServiceContract", {});
            r.setProperty("/customerInfo/ServiceContract/MoreInfo", s);
            t._openContractPopup(o, t)
        },
        onSmartContractLinkPress: function (e) {
            var t = this;
            var a = [];
            var r = t.getView().getModel("mCustIdentification");
            var n = r.getData();
            var i = n.customerInfo.to_ServiceContractNew.results;
            var o = e.getSource();
            var s;
            for (var l = 0; i && l < i.length; l++) {
                if (i[l].ContractStatus === "CTIN") {
                    s = i[l]
                }
            }
            r.setProperty("/customerInfo/ServiceContract/MoreInfo", s);
            t._openContractPopup(o, t)
        },
        _openContractPopup: function (e, t) {
            var a = e,
                r = this.getView();
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("com.globalintelli.ZAE_SCIN_NEW.fragment.ContractInfo", t);
                t.getView().addDependent(this._oPopover)
            }
            this._oPopover.openBy(a)
        },
        formatStatus: function (e) {
            if (e) {
                switch (e) {
                    case 0:
                        return "Information";
                    case 1:
                        return "Error";
                    case 2:
                        return "Warning";
                    case 3:
                        return "Success";
                    default:
                        return "Information"
                }
            }
        },
        handleContractLinkPress: function (e) {
            var t = e.getSource().getText();
            var a = sap.ushell.Container.getService("CrossApplicationNavigation");
            var r = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var n = this.byId("SCIN_I01").getSelectedKey();
            var i = a.createEmptyAppState(sap.ui.component(r));
            var o = this.byId("EquipmentVH").getTokens();
            var s = "",
                l = "";
            if (o.length > 0) {
                s = o[0].getProperty("key");
                l = o[0].getProperty("text")
            }
            var u = [];
            var g = this.byId("SCIN_I02").getTokens();
            for (var d = 0; d < g.length; d++) {
                u.push({
                    key: g[d].getProperty("key"),
                    text: g[d].getProperty("text")
                })
            }
            var c = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: n,
                Category: u,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: s,
                EquipmentWithDesc: l
            };
            i.setData(c);
            i.save();
            var C = sap.ui.core.routing.HashChanger.getInstance();
            var p = C.getHash();
            var f = p + "?" + "sap-iapp-state=" + i.getKey();
            C.replaceHash(f);
            var m = a && a.hrefForExternal({
                target: {
                    semanticObject: "SalesContract",
                    action: "aesDisplay"
                },
                params: {
                    SalesContract: t
                }
            }) || "";
            a.toExternal({
                target: {
                    shellHash: m
                }
            })
        },
        fnCustomerBlockedStatus: function (e) {
            var t = this;
            var a = this.getView().getModel("mCustIdentification");
            var r = "ZAE_FM_CUSTOMER_VALIDATIONSet";
            var n = [{
                callProperty: "BusinessPartner",
                value: e
            }];
            var i = this.getView().getModel();
            var o = function (e) {
                if (e.Status !== "") {
                    a.setProperty("/customerInfo/to_CurrentOwner/BlockedStatus", e.Status)
                } else {
                    a.setProperty("/customerInfo/to_CurrentOwner/BlockedStatus", "")
                }
                t.getView().getModel().refresh()
            };
            var s = function (e) {
                t.getView().getModel().refresh()
            };
            this.aeUI5Util.createCall(t, i, r, n, o, s)
        },
        onPressCreateServiceContractQuotation: function () {
            var e = sap.ushell.Container.getService("CrossApplicationNavigation");
            var t = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var a = this.getView().getModel("mCustIdentification").getData();
            var r = e.createEmptyAppState(sap.ui.component(t));
            var n = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
            var i = n.getModel().getProperty(n.getPath());
            var o = this.byId("EquipmentVH").getTokens();
            var s = "",
                l = "";
            if (o.length > 0) {
                s = o[0].getProperty("key");
                l = o[0].getProperty("text")
            }
            var u = [];
            var g = this.byId("SCIN_I02").getTokens();
            for (var d = 0; d < g.length; d++) {
                u.push({
                    key: g[d].getProperty("key"),
                    text: g[d].getProperty("text")
                })
            }
            var c = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: u,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: s,
                EquipmentWithDesc: l
            };
            var C = {
                SalesOrganization: i.SalesOrganization,
                DistributionChannel: i.DistrChannel,
                Division: i.Division,
                SalesOffice: a.SchemaTransactionType.SalesOffice,
                Customer: a.customerInfo.to_CurrentOwner.Partner,
                Equipment: this.byId("EquipmentVH").getTokens()[0].getProperty("key")
            };
            if (this.Opportunity) {
                C["Opportunity"] = this.Opportunity
            }
            r.setData(c);
            r.save();
            var p = sap.ui.core.routing.HashChanger.getInstance();
            var f = p.getHash();
            var m = f + "?" + "sap-iapp-state=" + r.getKey();
            p.replaceHash(m);
            var y = e && e.hrefForExternal({
                target: {
                    semanticObject: "SalesQuotation",
                    action: "aeContractCreate"
                },
                params: C
            }) || "";
            e.toExternal({
                target: {
                    shellHash: y
                }
            })
        },
        fnEnableCreateServiceContractQuotation: function (e, t) {
            var a = this.byId("EquipmentVH").getTokens().length > 0 ? this.byId("EquipmentVH").getTokens()[0].getProperty("key") : "";
            var r = this.byId("SmartTableSalesArea").getTable().getSelectedItem() ? this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext() : "";
            return e !== "" && a !== "" && t !== "" && r !== ""
        },
        fnWorkshopLoad: function (e) {
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var r = t.createEmptyAppState(sap.ui.component(a));
            var n = this.byId("EquipmentVH").getTokens();
            var i = "",
                o = "";
            if (n.length > 0) {
                i = n[0].getProperty("key");
                o = n[0].getProperty("text")
            }
            var s = [];
            var l = this.byId("SCIN_I02").getTokens();
            for (var u = 0; u < l.length; u++) {
                s.push({
                    key: l[u].getProperty("key"),
                    text: l[u].getProperty("text")
                })
            }
            var g = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: s,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: i,
                EquipmentWithDesc: o
            };
            r.setData(g);
            r.save();
            var d = sap.ui.core.routing.HashChanger.getInstance();
            var c = d.getHash();
            var C = c + "?" + "sap-iapp-state=" + r.getKey();
            d.replaceHash(C);
            var p = t && t.hrefForExternal({
                target: {
                    semanticObject: "WorkshopRoaster",
                    action: "aeAnalyze"
                },
                params: {}
            }) || "";
            t.toExternal({
                target: {
                    shellHash: p
                }
            })
        },
        onCreateComplain: function (e) {
            var a = this;
            a.getView().byId("SCIN_B15").setBusy(true);
            if (!this._oCreateComplainDialog) {
                t.load({
                    id: "fragCreateComplain",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateComplain",
                    controller: this
                }).then(function (e) {
                    this._CreateComplainDialog(e);
                    t.byId("fragCreateComplain", "CCSalesoffice").getBinding("items").attachDataReceived(function (e) {
                        if (e.getParameter("data").results.length === 1) {
                            t.byId("fragCreateComplain", "CCSalesoffice").setSelectedKey(e.getParameter("data").results[0].SalesOffice);
                            this.fnSalesOfficeChange()
                        }
                    }.bind(this));
                    this._setCreateComplainDialogInitialState()
                }.bind(this))
            } else {
                this._setCreateComplainDialogInitialState()
            }
        },
        fnBeginButtonValidation: function () {
            this._fnEnableCreateComplainDilaogBTN()
        },
        _setCreateComplainDialogInitialState: function () {
            var e = this;
            var a;
            var r = this.getView().getModel("mCustIdentification");
            var n = r.getData();
            t.byId("fragCreateComplain", "EmployeeResp").setValue("");
            t.byId("fragCreateComplain", "EmployeeResp").setTokens([]);
            t.byId("fragCreateComplain", "EmployeeResp").setValueState("None");
            t.byId("fragCreateComplain", "Description").setValue("");
            t.byId("fragCreateComplain", "ComplainText").setValue("");
            t.byId("fragCreateComplain", "CCSalesgroup").setSelectedKey(null);
            t.byId("fragCreateComplain", "Activitytype").setSelectedKey(null);
            t.byId("fragCreateComplain", "ComplianReason").setSelectedKey(null);
            t.byId("fragCreateComplain", "ComplianReasonCode").setSelectedKey(null);
            t.byId("fragCreateComplain", "Contactperson").setSelectedKey(null);
            t.byId("fragCreateComplain", "ReferenceNo").setValue("");
            t.byId("fragCreateComplain", "RefernceDocType").setSelectedKey(null);
            var o = this.byId("SCIN_I01").getSelectedKey();
            var s = [];
            s.push(new i("Plant", "EQ", o));
            t.byId("fragCreateComplain", "CCSalesoffice").getBinding("items").filter(s);
            var l = [];
            var u;
            if (n.customerInfo.to_CurrentOwner && n.customerInfo.to_CurrentOwner.Partner) {
                u = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.EQ, n.customerInfo.to_CurrentOwner.Partner);
                l.push(u)
            } else {
                u = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.EQ, "");
                l.push(u)
            }
            t.byId("fragCreateComplain", "Contactperson").getBinding("items").filter(l);
            if (this.byId("SmartTableSalesArea").getTable().getSelectedItem()) {
                var g = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
                var d = g.getModel().getProperty(g.getPath());
                a = this.formatNameAndValuePair(d.CustomerName, d.Customer)
            } else {
                a = ""
            }
            t.byId("fragCreateComplain", "ActivityID").setValue(a);
            e._fnInitLoadRua();
            e._fnEnableCreateComplainDilaogBTN()
        },
        _fnInitLoadRua: function () {
            var e = this.byId("SCIN_I01").getSelectedKey();
            var a = this.getView().getModel("mCustIdentification");
            var r = [];
            r.push(new i("Plant", "EQ", e));
            this.getView().getModel().read("/ZAE_I_TC_RUA", {
                filters: r,
                success: function (e, r) {
                    a.getData().CreateComplaint = e.results;
                    var n = e.results.filter(function (e) {
                        return e.EmployeeResponsible !== ""
                    });
                    var i = e.results.filter(function (e) {
                        return e.ServiceManager !== ""
                    });
                    if (n.length > 0) {
                        var o = new sap.m.Token({
                            key: n[0].EmployeeResponsible,
                            text: n[0].EmployeeResponsible
                        });
                        t.byId("fragCreateComplain", "EmployeeResp").setRequired(true);
                        t.byId("fragCreateComplain", "EmployeeResp").setTokens([o])
                    }
                    if (i.length > 0) {
                        t.byId("fragCreateComplain", "EmployeeResp").data("ServiceManager", i[0].ServiceManager)
                    } else {
                        t.byId("fragCreateComplain", "EmployeeResp").data("ServiceManager", "")
                    }
                    var s = e.results.filter(function (e) {
                        return e.ComplaintManager !== ""
                    });
                    if (s.length > 0) {
                        t.byId("fragCreateComplain", "EmployeeResp").data("ComplaintManager", s[0].ComplaintManager)
                    } else {
                        t.byId("fragCreateComplain", "EmployeeResp").data("ComplaintManager", "")
                    }
                },
                error: function (e) { }
            })
        },
        fnSalesOfficeChange: function (e) {
            var a = this;
            var r = e;
            var n = a.getView().getModel("mCustIdentification");
            var o = this.byId("SCIN_I01").getSelectedKey();
            var s = t.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
            var l = [];
            l.push(new i("Plant", "EQ", o));
            l.push(new i("SalesOffice", "EQ", s));
            t.byId("fragCreateComplain", "CCSalesgroup").getBinding("items").filter(l);
            a._fnEnableCreateComplainDilaogBTN();
            a.getView().byId("SCIN_B15").setBusy(false);
            a._oCreateComplainDialog.open()
        },
        fnSalesGroupChange: function () {
            var e = this.getView().getModel("mCustIdentification").getData().CreateComplaint;
            var a = this.byId("SCIN_I01").getSelectedKey();
            var r = t.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
            var n = t.byId("fragCreateComplain", "CCSalesgroup").getSelectedKey();
            var i = e.filter(function (e) {
                return e.Plant === a && e.SalesOffice === r && e.SalesGroup === n
            });
            if (i.length > 0) {
                t.byId("fragCreateComplain", "Activitytype").setValue(i[0].ActivityType);
                t.byId("fragCreateComplain", "Activitytype").setEnabled(false)
            } else {
                t.byId("fragCreateComplain", "Activitytype").setValue("")
            }
            var o = [];
            var s;
            s = new sap.ui.model.Filter("TransactionType", sap.ui.model.FilterOperator.EQ, i[0].ActivityType);
            o.push(s);
            t.byId("fragCreateComplain", "ComplianReason").getBinding("items").filter(o);
            this._fnEnableCreateComplainDilaogBTN()
        },
        fnComplainReasonCodeGroup: function (e) {
            var a = t.byId("fragCreateComplain", "Activitytype").getValue();
            var r = t.byId("fragCreateComplain", "ComplianReason").getSelectedKey();
            var n = [];
            n.push(new i("TransactionType", "EQ", a));
            n.push(new i("CodeGroup", "EQ", r));
            t.byId("fragCreateComplain", "ComplianReasonCode").getBinding("items").filter(n);
            this._fnEnableCreateComplainDilaogBTN()
        },
        _fnEnableCreateComplainDilaogBTN: function () {
            var e = t.byId("fragCreateComplain", "EmployeeResp").getTokens();
            var a = t.byId("fragCreateComplain", "Description").getValue();
            var r = t.byId("fragCreateComplain", "ComplainText").getValue();
            var n = t.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
            var i = t.byId("fragCreateComplain", "CCSalesgroup").getSelectedKey();
            var o = t.byId("fragCreateComplain", "ComplianReasonCode").getSelectedKey();
            var s = t.byId("fragCreateComplain", "ComplianReason").getSelectedKey();
            var l = e !== "" && a !== "" && r !== "" && n !== "" && i !== "" && o !== "" && s !== "";
            this._oCreateComplainDialog.getBeginButton().setEnabled(l)
        },
        _CreateComplainDialog: function (e) {
            var a = this;
            this._oCreateComplainDialog = new sap.m.Dialog({
                title: "{i18n>CreateComplain}",
                content: [e],
                contentWidth: "500px",
                beginButton: new sap.m.Button({
                    text: "{i18n>Create}",
                    press: function () {
                        var e = this.byId("SCIN_I01").getSelectedKey();
                        var r = t.byId("fragCreateComplain", "EmployeeResp").getTokens()[0].getKey();
                        var n = t.byId("fragCreateComplain", "ReferenceNo").getValue();
                        var i = t.byId("fragCreateComplain", "RefernceDocType").getSelectedKey();
                        var o = t.byId("fragCreateComplain", "Description").getValue();
                        var s = t.byId("fragCreateComplain", "ComplainText").getValue();
                        var l = t.byId("fragCreateComplain", "CCSalesoffice").getSelectedKey();
                        var u = t.byId("fragCreateComplain", "CCSalesgroup").getSelectedKey();
                        var g = t.byId("fragCreateComplain", "ComplianReason").getSelectedKey();
                        var d = t.byId("fragCreateComplain", "ComplianReasonCode").getSelectedKey();
                        var c = t.byId("fragCreateComplain", "Contactperson").getSelectedKey();
                        var C = t.byId("fragCreateComplain", "Activitytype").getValue();
                        var p = a.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
                        var f = p.getModel().getProperty(p.getPath());
                        var m = t.byId("fragCreateComplain", "EmployeeResp").data()["ComplaintManager"];
                        var y = t.byId("fragCreateComplain", "EmployeeResp").data()["ServiceManager"];
                        var v = a.byId("EquipmentVH").getTokens()[0].getProperty("key");
                        var I = "ZAE_FM_SCIN_CRE_ACT_COMPLAINSet";
                        var S = a.getView().getModel();
                        var h = [{
                            callProperty: "ServiceOrg",
                            value: e
                        }, {
                            callProperty: "ActivityPartner",
                            value: f.Customer
                        }, {
                            callProperty: "SalesOrg",
                            value: f.SalesOrganization
                        }, {
                            callProperty: "DisChannel",
                            value: f.DistrChannel
                        }, {
                            callProperty: "Division",
                            value: f.Division
                        }, {
                            callProperty: "ContactPerson",
                            value: c
                        }, {
                            callProperty: "Description",
                            value: o
                        }, {
                            callProperty: "ComplainText",
                            value: s
                        }, {
                            callProperty: "Equipment",
                            value: v
                        }, {
                            callProperty: "ServiceManager",
                            value: y
                        }, {
                            callProperty: "EmployeeResp",
                            value: r
                        }, {
                            callProperty: "SalesGroup",
                            value: u
                        }, {
                            callProperty: "SalesOffice",
                            value: l
                        }, {
                            callProperty: "Reference",
                            value: r
                        }, {
                            callProperty: "CodeGroup",
                            value: g
                        }, {
                            callProperty: "Code",
                            value: d
                        }, {
                            callProperty: "ReferenceDocType",
                            value: i
                        }, {
                            callProperty: "ActivityType",
                            value: C
                        }, {
                            callProperty: "ComplaintManager",
                            value: m
                        }];
                        var b = function (e) {
                            a.getView().byId("SCIN_I02").fireTokenUpdate();
                            var t = a.getView().getModel("i18n").getResourceBundle().getText("CreatedSuccess", [e.EActivityNo]);
                            a.onSearch();
                            a.byId("SmartTableContactPersonList").rebindTable();
                            var r = new sap.ui.core.message.Message({
                                persistent: true,
                                code: e.EActivityNo,
                                type: sap.ui.core.MessageType.Success,
                                message: t,
                                additionalText: "",
                                description: "Activity"
                            });
                            sap.ui.getCore().getMessageManager().addMessages(r)
                        };
                        var P = function (e) {
                            a.getView().byId("SCIN_I02").fireTokenUpdate();
                            a.onSearch()
                        };
                        a.aeUI5Util.createCall(a, S, I, h, b, P);
                        a._oCreateComplainDialog.close()
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: "{i18n>Close}",
                    press: function () {
                        this._oCreateComplainDialog.close()
                    }.bind(this)
                })
            });
            this.getView().addDependent(this._oCreateComplainDialog)
        },
        fnServiceContractVisible: function (e, t) {
            if (e === "CTIN") {
                return t
            }
            return false
        },
        fnCustomerStatus: function (e) {
            switch (e) {
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
                    return "None";
                    break
            }
        },
        fnCustomerStatusState: function (e) {
            switch (e) {
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
                    return "None";
                    break
            }
        },
        fnServiceContractStatusCriti: function (e) {
            switch (e) {
                case 1:
                    return "Error";
                    break;
                case 3:
                    return "Success";
                    break;
                default:
                    return "None";
                    break
            }
            return "Error"
        },
        fnServiceContractStatusIcon: function (e) {
            switch (e) {
                case 1:
                    return "sap-icon://status-negative";
                    break;
                case 3:
                    return "sap-icon://status-positive";
                    break;
                default:
                    return "sap-icon://hint";
                    break
            }
            return "sap-icon://status-negative"
        },
        fnfindServiceContractNumber: function (e) {
            var t = "";
            for (var a = 0; e && a < e.length; a++) {
                if (e[a].ContractStatus === "CTIN") {
                    t = e[a].SalesContract
                }
            }
            return t
        },
        fnFormatDeferredRevenue: function (e) {
            var t = "";
            for (var a = 0; e && a < e.length; a++) {
                if (e[a].ContractStatus === "CTIN") {
                    t = e[a].DeferredRevenue1
                }
            }
            return t
        },
        fnFormatCurrency: function (e) {
            var t = "";
            for (var a = 0; e && a < e.length; a++) {
                if (e[a].ContractStatus === "CTIN") {
                    t = e[a].TransactionCurrency
                }
            }
            return t
        },
        onBeforeRebindSmartTableComplainList: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (a.customerInfo.Equipment && i) {
                i.preventTableBind = false;
                n = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, a.customerInfo.Equipment);
                r.push(n);
                if (i) {
                    i.filters = r
                }
            } else if (i) {
                i.preventTableBind = true
            }
        },
        onBeforeRebindopenEVHCTable: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (this.ServiceComplaintTab) {
                i.preventTableBind = false;
                var o = a.customerInfo.Equipment.padStart(18, 0);
                n = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, o);
                r.push(n);
                i.filters = r
            } else {
                i.preventTableBind = true
            }
        },
        onBeforeRebindRecallTable: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (a.customerInfo.Equipment) {
                i.preventTableBind = false;
                var o = a.customerInfo.Equipment.padStart(18, 0);
                n = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, o);
                r.push(n);
                if (i) {
                    i.filters = r
                }
            } else {
                i.preventTableBind = true
            }
        },
        fnHandelComplainLinkPress: function (e) {
            var t = sap.ushell.Container.getService("CrossApplicationNavigation");
            var a = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var r = t.createEmptyAppState(sap.ui.component(a));
            var n = this.byId("EquipmentVH").getTokens();
            var i = "",
                o = "";
            if (n.length > 0) {
                i = n[0].getProperty("key");
                o = n[0].getProperty("text")
            }
            var s = [];
            var l = this.byId("SCIN_I02").getTokens();
            for (var u = 0; u < l.length; u++) {
                s.push({
                    key: l[u].getProperty("key"),
                    text: l[u].getProperty("text")
                })
            }
            var g = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: s,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: i,
                EquipmentWithDesc: o
            };
            r.setData(g);
            r.save();
            var d = sap.ui.core.routing.HashChanger.getInstance();
            var c = d.getHash();
            var C = c + "?" + "sap-iapp-state=" + r.getKey();
            d.replaceHash(C);
            var p = t && t.hrefForExternal({
                target: {
                    semanticObject: "Activity",
                    action: "aeDisplay&/ZAE_C_Activity_01(object_type='BUS2000126',Activity='" + e.getSource().getText() + "',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
                }
            }) || "";
            t.toExternal({
                target: {
                    shellHash: p
                }
            })
        },
        fnNPSScoreFormat: function (e) {
            if (e && e.NPSScore) {
                return Number(e.NPSScore) * 10
            }
            return 0
        },
        fnPDSSScoreFormat: function (e) {
            if (e && e.PDSSScore) {
                return Number(e.PDSSScore) * 10
            }
            return 0
        },
        fnNPSRMChartColourFormat: function (e) {
            if (e && e.NPSScore) {
                if (e.NPSScore <= 6) {
                    return sap.m.ValueColor.Error
                } else if (e.NPSScore <= 8) {
                    return sap.m.ValueColor.Critical
                } else if (e.NPSScore <= 10) {
                    return sap.m.ValueColor.Good
                } else {
                    return sap.m.ValueColor.Neutral
                }
            }
            return sap.m.ValueColor.Error
        },
        fnPDSSRMChartColourFormat: function (e) {
            if (e && e.PDSSScore) {
                if (e.PDSSScore <= 6) {
                    return sap.m.ValueColor.Error
                } else if (e.PDSSScore <= 8) {
                    return sap.m.ValueColor.Critical
                } else if (e.PDSSScore <= 10) {
                    return sap.m.ValueColor.Good
                } else {
                    return sap.m.ValueColor.Neutral
                }
            }
            return sap.m.ValueColor.Error
        },
        handleCreateCustomerInputValidation: function () {
            var e = t.byId("fragCreateCustomer", "CPRNO");
            var a = t.byId("fragCreateCustomer", "NATIONALITY");
            a.setValue(a.getValue().replace(/[^a-zA-Z]+/, ""));
            if (a.getValue() !== "") {
                a.setValueState("Error")
            } else {
                a.setValueState("None")
            }
            var r = t.byId("fragCreateCustomer", "REGION");
            if (r.getValue() !== "") {
                r.setValueState("Error")
            } else {
                r.setValueState("None")
            }
            var n = t.byId("fragCreateCustomer", "COUNTRY");
            n.setValue(n.getValue().replace(/[^a-zA-Z]+/, ""));
            if (n.getValue() !== "") {
                n.setValueState("Error")
            } else {
                n.setValueState("None")
            }
            this.fnCheckCreateCustomerRequiredValidation()
        },
        handleCreateContactPersonInputValidation: function () {
            var e = t.byId("fragCreateContactPerson", "CPRNO");
            e.setValue(e.getValue().replace(/[^0-9()!@#%^&*_+~]+/g, "").slice(0, 25));
            var a = t.byId("fragCreateContactPerson", "FIRSTNAME");
            a.setValue(a.getValue().replace(/[^a-zA-Z. -]+/, ""));
            var r = t.byId("fragCreateContactPerson", "FAMILYNAME");
            r.setValue(r.getValue().replace(/[^a-zA-Z. -]+/, ""));
            var n = t.byId("fragCreateContactPerson", "COUNTRY");
            n.setValue(n.getValue().replace(/[^a-zA-Z]+/, ""));
            if (n.getValue() !== "") {
                n.setValueState("Error")
            } else {
                n.setValueState("None")
            }
            var i = t.byId("fragCreateContactPerson", "REGION");
            if (i.getValue() !== "") {
                i.setValueState("Error")
            } else {
                i.setValueState("None")
            }
            this._fnContractButtonCreateButtonEnabledState()
        },
        handleTeliphoneNoValidation: function (e) {
            var t = this;
            var a = e.getSource().getId().split("--")[0];
            var r = e.getSource().getValue();
            var n = e.getSource().getMask().split(" ")[1];
            var i = false;
            if (r) {
                var o = r.split(" ")[1].replace("_", "");
                var s = o.length === n.length;
                var l = t.validateNumber(o, i);
                if (s && l) {
                    e.getSource().setValueState("None")
                } else {
                    e.getSource().setValueState("Error")
                }
            } else {
                e.getSource().setValueState("None")
            }
            switch (a) {
                case "fragCreateCustomer":
                    t.fnCheckCreateCustomerRequiredValidation();
                    break;
                case "fragCreateContactPerson":
                    t._fnContractButtonCreateButtonEnabledState();
                    break;
                case "fragCreateCompany":
                    t._fnCompanyCreateButtonEnabledState();
                    break
            }
        },
        validateNumber: function (e, t) {
            var a;
            if (t) {
                a = /^(?![012345])(?!(\d)\1*$|23456|65432|987654|000000|111111|222222|333333|444444|555555|666666|777777|888888|999999)\d+$/
            } else {
                a = /^(?![01])(?!(\d)\1*$|23456|65432|987654|000000|111111|222222|333333|444444|555555|666666|777777|888888|999999)\d+$/
            }
            if (a.test(e)) {
                return true
            }
            return false
        },
        handleMobileNoValidation: function (e) {
            var source = e.getSource();
            var value = source.getValue();

            // Remove error state initially
            source.setValueState("None");

            if (value && value.trim() !== "") {
                var numberPart = value.split(" ")[1] || "";
                numberPart = numberPart.replace(/_/g, "");

                // Basic validation: should have some digits after dial code
                if (numberPart.length < 6) {
                    source.setValueState("Error");
                    source.setValueStateText("Mobile number is too short");
                } else if (numberPart.length > 9) {
                    source.setValueState("Error");
                    source.setValueStateText("Mobile number is too long");
                }
            }

            // Update button state
            this._fnCustomerEquiCreateButtonEnabledState();
        },
        onPressCreateExtendedWarrantyQuotation: function () {
            var e = sap.ushell.Container.getService("CrossApplicationNavigation");
            var t = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var a = this.getView().getModel("mCustIdentification").getData();
            var r = e.createEmptyAppState(sap.ui.component(t));
            var n = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
            var i = n.getModel().getProperty(n.getPath());
            var o = this.byId("EquipmentVH").getTokens();
            var s = "",
                l = "";
            if (o.length > 0) {
                s = o[0].getProperty("key");
                l = o[0].getProperty("text")
            }
            var u = [];
            var g = this.byId("SCIN_I02").getTokens();
            for (var d = 0; d < g.length; d++) {
                u.push({
                    key: g[d].getProperty("key"),
                    text: g[d].getProperty("text")
                })
            }
            var c = {
                LicenseNum: this.getView().byId("SCIN_smartFilterBar").getFilterData(),
                Plant: this.byId("SCIN_I01").getSelectedKey(),
                Category: u,
                Insurer: this.byId("SCIN_I03").getSelectedKey(),
                Equipment: s,
                EquipmentWithDesc: l
            };
            var C = {
                SalesOrganization: i.SalesOrganization,
                DistributionChannel: i.DistrChannel,
                Division: i.Division,
                SalesOffice: a.SchemaTransactionType.SalesOffice,
                Customer: a.customerInfo.to_CurrentOwner.Partner,
                Equipment: this.byId("EquipmentVH").getTokens()[0].getProperty("key")
            };
            if (this.Opportunity) {
                C["Opportunity"] = this.Opportunity
            }
            r.setData(c);
            r.save();
            var p = sap.ui.core.routing.HashChanger.getInstance();
            var f = p.getHash();
            var m = f + "?" + "sap-iapp-state=" + r.getKey();
            p.replaceHash(m);
            var y = e && e.hrefForExternal({
                target: {
                    semanticObject: "ExtendedWarranty",
                    action: "aeCreateQuotation"
                },
                params: C
            }) || "";
            e.toExternal({
                target: {
                    shellHash: y
                }
            })
        },
        onCreateCompany: function (e) {
            if (!this._oNewCreateCompanyDialog) {
                t.load({
                    id: "fragCreateCompany",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateCompany",
                    controller: this
                }).then(function (e) {
                    this._CreateCompanyDialog(e);
                    this._setCreateCompanyDialogInitialState()
                }.bind(this))
            } else {
                this._setCreateCompanyDialogInitialState()
            }
        },
        _CreateCompanyDialog: function (e) {
            var a;
            var r;
            var n;
            var i;
            var o;
            var s;
            var l;
            var u;
            var g;
            var d;
            var c;
            var C;
            var p;
            var f;
            var m;
            var y;
            var v;
            var I;
            var S;
            var h;
            var b;
            var P;
            var V;
            var E;
            var _;
            var T;
            var N;
            var D;
            var O = this;
            this._oNewCreateCompanyDialog = new sap.m.Dialog({
                title: "{i18n>CreateCompany}",
                content: [e],
                beginButton: new sap.m.Button({
                    text: "{i18n>Create}",
                    press: function () {
                        O._oNewCreateCompanyDialog.setBusy(true);
                        I = O.getView().getModel("mCreateCustomer");
                        a = O.getView().byId("SCIN_I01").getSelectedKey();
                        o = t.byId("fragCreateCompany", "SALUTATION").getValue();
                        r = t.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
                        n = t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").getSelectedKey();
                        i = t.byId("fragCreateCompany", "DIVISION").getSelectedKey();
                        h = t.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedItem().oBindingContexts.mCreateCustomer.sPath;
                        S = I.getProperty(h).Ccode;
                        l = t.byId("fragCreateCompany", "MOBILENO").getValue().split(" ")[1];
                        u = t.byId("fragCreateCompany", "TELNO").getValue().split(" ")[1];
                        g = t.byId("fragCreateCompany", "EMAIL").getValue();
                        d = t.byId("fragCreateCompany", "CRNO").getValue();
                        c = t.byId("fragCreateCompany", "STREET").getValue();
                        C = t.byId("fragCreateCompany", "STREET1").getValue();
                        p = t.byId("fragCreateCompany", "OFFICENO").getValue();
                        f = t.byId("fragCreateCompany", "POBOX").getValue();
                        E = t.byId("fragCreateCompany", "POSTALCODE").getValue();
                        T = t.byId("fragCreateCompany", "REGIOGROUP").getSelectedKey();
                        m = t.byId("fragCreateCompany", "CITY").getValue();
                        b = t.byId("fragCreateCompany", "NAME1").getValue();
                        P = t.byId("fragCreateCompany", "NAME2").getValue();
                        N = t.byId("fragCreateCompany", "COUNTRY").getTokens()[0];
                        if (N) {
                            y = N.getKey()
                        }
                        D = t.byId("fragCreateCompany", "REGION").getTokens()[0];
                        if (D) {
                            v = D.getKey()
                        }
                        V = t.byId("fragCreateCompany", "TAXNUMXL").getValue();
                        _ = t.byId("fragCreateCompany", "FAXNUMBER").getValue().split(" ")[1];
                        var e = "ZAE_FM_SC_COMP_CREATE_FRM_CISet";
                        var s = O.getView().getModel();
                        var w = [{
                            callProperty: "SalesOrg",
                            value: r
                        }, {
                            callProperty: "Plant",
                            value: a
                        }, {
                            callProperty: "Salutation",
                            value: o
                        }, {
                            callProperty: "Ccode",
                            value: S
                        }, {
                            callProperty: "CompanyName",
                            value: b
                        }, {
                            callProperty: "CompanyName2",
                            value: P
                        }, {
                            callProperty: "MobileNo",
                            value: l
                        }, {
                            callProperty: "TelNo",
                            value: u
                        }, {
                            callProperty: "Email",
                            value: g
                        }, {
                            callProperty: "Identificationnumber",
                            value: d
                        }, {
                            callProperty: "Identificationcategory",
                            value: "BUP002"
                        }, {
                            callProperty: "Street",
                            value: c
                        }, {
                            callProperty: "Street1",
                            value: C
                        }, {
                            callProperty: "HouseNo",
                            value: p
                        }, {
                            callProperty: "PoBox",
                            value: f
                        }, {
                            callProperty: "City",
                            value: m
                        }, {
                            callProperty: "Country",
                            value: y
                        }, {
                            callProperty: "Vtweg",
                            value: n
                        }, {
                            callProperty: "Spart",
                            value: i
                        }, {
                            callProperty: "Region",
                            value: v
                        }, {
                            callProperty: "Vatregistrationnumber",
                            value: V
                        }, {
                            callProperty: "PostlCode",
                            value: E
                        }, {
                            callProperty: "FaxNumber",
                            value: _
                        }, {
                            callProperty: "Location",
                            value: T
                        }];
                        var B = function (e) {
                            O.getView().byId("SCIN_I02").fireTokenUpdate();
                            O.getView().getModel().refresh();
                            O._oNewCreateCompanyDialog.setBusy(false);
                            O._oNewCreateCompanyDialog.close()
                        };
                        var M = function (e) {
                            O.getView().byId("SCIN_I02").fireTokenUpdate();
                            O.getView().getModel().refresh();
                            O._oNewCreateCompanyDialog.setBusy(false);
                            O._oNewCreateCompanyDialog.close()
                        };
                        O.aeUI5Util.createCall(O, s, e, w, B, M)
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: "{i18n>Close}",
                    press: function () {
                        this._oNewCreateCompanyDialog.close()
                    }.bind(this)
                })
            });
            this.getView().addDependent(this._oNewCreateCompanyDialog)
        },
        _setCreateCompanyDialogInitialState: function () {
            this._setDefaultValues("fragCreateCompany");
            var e = [];
            var a = this.getView().byId("SCIN_I01").getSelectedKey();
            e.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, a));
            var r = t.byId("fragCreateCompany", "SALESORGANIZATION");
            r.getBinding("items").filter(e);
            t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setSelectedKey(null);
            t.byId("fragCreateCompany", "DIVISION").setSelectedKey(null);
            r.setSelectedKey(null);
            t.byId("fragCreateCompany", "REGIOGROUP").setSelectedKey(null);
            t.byId("fragCreateCompany", "SALUTATION").setValue("");
            t.byId("fragCreateCompany", "MOBILENO").setValue("");
            t.byId("fragCreateCompany", "MOBILENO").setMask("");
            t.byId("fragCreateCompany", "MOBILENO").setValueState("None");
            t.byId("fragCreateCompany", "TELNO").setMask("");
            t.byId("fragCreateCompany", "TELNO").setValueState("None");
            t.byId("fragCreateCompany", "TELNO").setValue("");
            t.byId("fragCreateCompany", "FAXNUMBER").setValue("");
            t.byId("fragCreateCompany", "FAXNUMBER").setMask("");
            t.byId("fragCreateCompany", "FAXNUMBER").setValueState("None");
            t.byId("fragCreateCompany", "EMAIL").setValue("");
            t.byId("fragCreateCompany", "CRNO").setValue("");
            t.byId("fragCreateCompany", "STREET").setValue("");
            t.byId("fragCreateCompany", "STREET1").setValue("");
            t.byId("fragCreateCompany", "OFFICENO").setValue("");
            t.byId("fragCreateCompany", "POBOX").setValue("");
            t.byId("fragCreateCompany", "POSTALCODE").setValue("");
            t.byId("fragCreateCompany", "CITY").setValue("");
            t.byId("fragCreateCompany", "COUNTRY").setValue("");
            t.byId("fragCreateCompany", "REGION").setValue("");
            t.byId("fragCreateCompany", "NAME1").setValue("");
            t.byId("fragCreateCompany", "NAME2").setValue("");
            t.byId("fragCreateCompany", "COUNTRY").setValueState("None");
            t.byId("fragCreateCompany", "COUNTRY").setValue("");
            t.byId("fragCreateCompany", "REGION").setTokens([]);
            t.byId("fragCreateCompany", "REGION").setValueState("None");
            t.byId("fragCreateCompany", "REGION").setValue("");
            t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setEnabled(false);
            t.byId("fragCreateCompany", "DIVISION").setEnabled(false);
            t.byId("fragCreateCompany", "TAXNUMXL").setValue("");
            this._fnCompanyCreateButtonEnabledState();
            this.fnLoadCreateCompany();
            this._oNewCreateCompanyDialog.open()
        },
        fnLoadCreateCompany: function () {
            var e = this;
            var a = [];
            var r = this.getView().byId("SCIN_I01").getSelectedKey();
            a.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, r));
            e._oNewCreateCompanyDialog.setBusy(true);
            this.getView().getModel().read("/ZAE_I_TC_COMP_SERV", {
                filters: a,
                success: function (a, r) {
                    e._oNewCreateCompanyDialog.setBusy(false);
                    var n = e.getView().getModel("mCreateCustomer");
                    n.getData().oCreateCustomerData.CreateCompanyData = a.results[0];
                    var i = [...new Map(a.results.map(e => [e.SalesOrganization, e])).values()];
                    i.sort(function (e, t) {
                        return e.SalesOrganization.localeCompare(t.SalesOrganization)
                    });
                    n.getData().oCreateCustomerData.CreateCompanySalesOrg = i;
                    if (i.length === 1) {
                        t.byId("fragCreateCompany", "SALESORGANIZATION").setSelectedKey(i[0].SalesOrganization);
                        t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setEnabled(true);
                        e._fnCreateCompanyValidation();
                        e.fnCreateCompanySalesOrgChange()
                    }
                    n.updateBindings(true)
                },
                error: function (t) {
                    e._oNewCreateCompanyDialog.setBusy(false)
                }
            })
        },
        _fnCreateCompanyValidation: function () {
            var e = this;
            var a = e.getView().getModel();
            var r = t.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
            var n = [];
            n.push(new sap.ui.model.Filter("SalesOrg", sap.ui.model.FilterOperator.EQ, r));
            n.push(new sap.ui.model.Filter("CustomerType", sap.ui.model.FilterOperator.EQ, "2"));
            n.push(new sap.ui.model.Filter("BPType", sap.ui.model.FilterOperator.EQ, "2"));
            a.read("/ZAE_I_TC_SCIN_08", {
                filters: n,
                success: function (a, r) {
                    if (a.results.length > 0) {
                        for (var n = 0; n < a.results.length; n++) {
                            var i = t.byId("fragCreateCompany", a.results[n].Field);
                            if (i !== undefined && a.results[n].Mandatory === true) {
                                t.byId("fragCreateCompany", a.results[n].Field).setRequired(true)
                            }
                        }
                    }
                    e._fnCompanyCreateButtonEnabledState()
                }
            })
        },
        _fnCompanyCreateButtonEnabledState: function () {
            var e = t.byId("fragCreateCompany", "SALESORGANIZATION");
            var a = t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL");
            var r = t.byId("fragCreateCompany", "DIVISION");
            var n = t.byId("fragCreateCompany", "SALUTATION");
            var i = t.byId("fragCreateCompany", "TELNO");
            var o = t.byId("fragCreateCompany", "NAME1");
            var s = t.byId("fragCreateCompany", "NAME2");
            var l = t.byId("fragCreateCompany", "POBOX");
            var u = t.byId("fragCreateCompany", "POSTALCODE");
            var g = t.byId("fragCreateCompany", "COUNTRY");
            var d = t.byId("fragCreateCompany", "REGION");
            var c = t.byId("fragCreateCompany", "MOBILENO");
            var C = t.byId("fragCreateCompany", "EMAIL");
            var p = t.byId("fragCreateCompany", "CRNO");
            var f = t.byId("fragCreateCompany", "FAXNUMBER");
            var m = t.byId("fragCreateCompany", "STREET");
            var y = t.byId("fragCreateCompany", "STREET1");
            var v = t.byId("fragCreateCompany", "OFFICENO");
            var I = t.byId("fragCreateCompany", "CITY");
            var S = t.byId("fragCreateCompany", "TAXNUMXL");
            var h = t.byId("fragCreateCompany", "REGIOGROUP");
            var b = (n.getRequired() ? n.getSelectedKey() !== "" : true) && (h.getRequired() ? h.getSelectedKey() !== "" : true) && (o.getRequired() ? o.getValue() !== "" : true) && (s.getRequired() ? s.getValue() !== "" : true) && (g.getRequired() ? g.getTokens([]).length !== 0 : true) && (g.getValueState() !== "Error" ? true : false) && (d.getRequired() ? d.getTokens([]).length !== 0 : true) && (d.getValueState() !== "Error" ? true : false) && (c.getRequired() ? c.getValue() !== "" && !c.getValue().includes("_") : true) && (c.getValueState() !== "Error" ? true : false) && (f.getRequired() ? f.getValue() !== "" && !f.getValue().includes("_") : true) && (f.getValueState() !== "Error" ? true : false) && (i.getRequired() ? i.getValue() !== "" && !i.getValue().includes("_") : true) && (i.getValueState() !== "Error" ? true : false) && (C.getRequired() ? C.getValue() !== "" : true) && (C.getValueState() === "None" ? true : false) && (p.getRequired() ? p.getValue() !== "" : true) && (m.getRequired() ? m.getValue() !== "" : true) && (y.getRequired() ? y.getValue() !== "" : true) && (v.getRequired() ? v.getValue() !== "" : true) && (l.getRequired() ? l.getValue() !== "" : true) && (I.getRequired() ? I.getValue() !== "" : true) && (S.getRequired() ? S.getValue() !== "" : true) && (u.getRequired() ? u.getValue() !== "" : true);
            this._oNewCreateCompanyDialog.getBeginButton().setEnabled(b)
        },
        handleCreateCompanyInputValidation: function () {
            var e = t.byId("fragCreateCompany", "REGION");
            if (e.getValue() !== "") {
                e.setValueState("Error")
            } else {
                e.setValueState("None")
            }
            var a = t.byId("fragCreateCompany", "TELNO");
            a.setValue(a.getValue().replace(/[^0-9]+/g, "").slice(0, 20));
            var r = t.byId("fragCreateCompany", "CRNO");
            r.setValue(r.getValue().replace(/[^0-9-]+/g, "").slice(0, 20));
            var n = t.byId("fragCreateCompany", "COUNTRY");
            n.setValue(n.getValue().replace(/[^a-zA-Z. -]+/, ""));
            var i = t.byId("fragCreateCompany", "NAME1");
            i.setValue(i.getValue().replace(/[^a-zA-Z. -]+/, ""));
            var o = t.byId("fragCreateCompany", "NAME2");
            o.setValue(o.getValue().replace(/[^a-zA-Z. -]+/, ""));
            if (n.getValue() !== "") {
                n.setValueState("Error")
            } else {
                n.setValueState("None")
            }
            this.fnCheckCreateCompanyRequiredValidation()
        },
        fnCheckCreateCompanyRequiredValidation: function () {
            this._fnCompanyCreateButtonEnabledState()
        },
        fnCreateCompanySalesOrgChange: function (e) {
            var a = [];
            var r = this.getView().getModel("mCreateCustomer");
            var n = r.getData().oCreateCustomerData.CreateCompanyData;
            var i = t.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
            if (n instanceof Array) {
                var o = DistributionChannel.filter(function (e) {
                    return e.SalesOrganization === i
                });
                var s = [...new Map(o.map(e => [e.DistributionChannel, e])).values()];
                s.sort(function (e, t) {
                    return e.DistributionChannel.localeCompare(t.DistributionChannel)
                });
                r.getData().oCreateCustomerData.CreateCompanyDC = s
            } else {
                a.push(n);
                r.getData().oCreateCustomerData.CreateCompanyDC = a;
                t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setSelectedKey(a[0].DistributionChannel);
                this.fnCreateCompanyDistributionChange()
            }
            t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").setEnabled(true);
            r.updateBindings(true);
            this._fnCompanyCreateButtonEnabledState()
        },
        fnCreateCompanyDistributionChange: function () {
            var e = [];
            var a = this.getView().getModel("mCreateCustomer");
            var r = a.getData().oCreateCustomerData.CreateCompanyData;
            var n = t.byId("fragCreateCompany", "SALESORGANIZATION").getSelectedKey();
            var i = t.byId("fragCreateCompany", "DISTRIBUTIONCHANNEL").getSelectedKey();
            if (r instanceof Array) {
                var o = r.filter(function (e) {
                    return e.SalesOrganization === n && e.DistributionChannel === i
                });
                a.getData().oCreateCustomerData.CreateCompanyDivison = o
            } else {
                e.push(r);
                a.getData().oCreateCustomerData.CreateCompanyDivison = e;
                t.byId("fragCreateCompany", "DIVISION").setSelectedKey(e[0].Division)
            }
            t.byId("fragCreateCompany", "DIVISION").setEnabled(true);
            a.updateBindings(true);
            this._fnCompanyCreateButtonEnabledState()
        },
        handleEmailInputChange: function (e) {
            var t = this;
            var a = e.getSource().getId().split("--")[0];
            let r = e.getParameter("value");
            let n = /^\w+([.-]\w+)*@\w+([.-]\w+)*(\.\w{2,3})+$/;
            if (r) {
                if (n.test(r)) {
                    e.getSource().setValueState("None")
                } else {
                    e.getSource().setValueState("Error")
                }
            } else {
                e.getSource().setValueState("None")
            }
            switch (a) {
                case "fragCreateCustomer":
                    t.fnCheckCreateCustomerRequiredValidation();
                    break;
                case "fragCreateContactPerson":
                    t._fnContractButtonCreateButtonEnabledState();
                    break;
                case "fragCreateCompany":
                    t._fnCompanyCreateButtonEnabledState();
                    break;
                case "fnUpdatePersonalData":
                    t.fnUpdatePersonalData();
                    break
            }
        },
        _setDefaultValues: function (e) {
            var a, r, i;
            var o = t.byId(e, "MOBILENO");
            var s = t.byId(e, "TELNO");
            var l = t.byId(e, "COUNTRY");
            var u = t.byId(e, "FAXNUMBER");
            var g = Intl.DateTimeFormat().resolvedOptions().timeZone;
            var d = this.getView().getModel("RegionToCountry").getData()[g];
            var c = this.getView().getModel("CountryCodes").getData().find(function (e) {
                return e.name === d
            });
            if (c) {
                a = this.formatNameAndValuePair(c.code, c.name);
                r = new n({
                    key: c.code,
                    text: a
                });
                l.setTokens([r]);
                i = c.dial_code
            } else {
                a = "AE" + "( " + "United Arab Emirates" + " )";
                r = new n({
                    key: "AE",
                    text: a
                });
                l.setTokens([r]);
                i = "+" + "971"
            }
            if (c.code === "OM") {
                var C = i.length + 7;
                var p = i.length + 7;
                var f = i.length + 7;
                var m = this.fnCreateMask(i, C);
                var y = this.fnCreateMask(i, p);
                var v = this.fnCreateMask(i, f)
            } else {
                var C = i.length + 8;
                var p = i.length + 7;
                var f = i.length + 8;
                var m = this.fnCreateMask(i, C);
                var y = this.fnCreateMask(i, p);
                var v = this.fnCreateMask(i, f)
            }
            if (o) {
                if (o.getValue()) {
                    o.setValue(i + " " + o.getValue().split(" ")[1])
                }
                o.setMask(m);
                o.setEnabled(true);
                o.fireChange()
            }
            if (s.getValue()) {
                s.setValue(i + " " + s.getValue().split(" ")[1])
            }
            s.setMask(y);
            s.setEnabled(true);
            s.fireChange();
            if (u.getValue()) {
                u.setValue(i + " " + u.getValue().split(" ")[1])
            }
            u.setMask(v);
            u.setEnabled(true);
            u.fireChange()
        },
        onCustomerValueHelpRequested: function (e) {
            var t = this;
            var a = e.getSource();
            a.setTokens([]);
            var r = {
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
                onBeforeRebindSmartTable: function (e) {
                    var t = e.getParameter("bindingParams").filters;
                    e.getParameter("bindingParams").filters = t
                }
            };
            t.aeUtil.handleSmartDialogValueHelp(t, a, r)
        },
        onCustomerTokenUpdate: function (e) {
            var t = e.getSource().getTokens();
            if (t.length === 0 || e.getParameters().type === "removed") {
                e.getSource().setTokens([])
            }
            this.fnCheckCreateEquiRequiredValidation()
        },
        onSelectCustomer: function (e) {
            if (e.getParameter("selectedRow") !== null) {
                var t = e.getSource();
                t.setTokens([]);
                var a = e.getParameter("selectedRow").getBindingContext().getObject();
                var r = this.formatNameAndValuePair(a.CustomerName, a.Customer);
                var n = new sap.m.Token({
                    key: a.Customer,
                    text: r
                });
                t.setTokens([n]);
                t.fireTokenUpdate()
            }
        },
        handleCustomerSuggest: function (e) {
            var t = e.getParameter("suggestValue");
            var a = [];
            if (t) {
                a.push(new i({
                    filters: [new i({
                        path: "Customer",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: t
                    }), new i({
                        path: "CustomerName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: t
                    })],
                    and: false
                }))
            }
            e.getSource().getBinding("suggestionRows").filter(a);
            e.getSource().getBinding("suggestionRows").resume()
        },
        onPressTestButton: function (e) {
            var t = this;
            var a = function (e) {
                sap.m.MessageBox.information("https://ecvc-srv1.ccr.group/gc/mbed-fw-clients/ccr-sap-s4hana/load.js" + " Loaded successfullty")
            };
            var r = function (e) {
                sap.m.MessageBox.Error("https://ecvc-srv1.ccr.group/gc/mbed-fw-clients/ccr-sap-s4hana/load.js" + " Loaded successfullty")
            };
            jQuery.sap.includeScript({
                url: "https://ecvc-srv1.ccr.group/gc/mbed-fw-clients/ccr-sap-s4hana/load.js",
                id: "IncludeGoogleMapsScript"
            }).then(function (e) {
                $.run();
                t.getView().byId("SCIN_B30").setEnabled(false)
            })
        },
        fnCheckAppointments: function () {
            var e = this;
            var t = e.getView().getModel("i18n").getResourceBundle();
            var a = this.getView().byId("OpenServiceRequests")._getRowCount();
            this.fnCheckOpenAppointmentExistForEqui().done(function (t) {
                if (t) {
                    e.fnExistingAppointments()
                } else {
                    e.fnPressCreateAppointment()
                }
            })
        },
        fnCheckServiceRequests: function () {
            var e = this.getView().getModel("i18n").getResourceBundle();
            var t = this.getView().byId("OpenServiceRequests")._getRowCount();
            if (t > 0) {
                sap.m.MessageBox.error(e.getText("CreateServiceRequestError"))
            } else {
                this.onCreateRequestPress()
            }
        },
        fnCheckOpenAppointmentExistForEqui: function () {
            var e = new jQuery.Deferred;
            var a = this;
            var r = false;
            var n = [];
            var i = a.getView().byId("SCIN_BoxSearchResults").getBindingContext().getObject();
            var o = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
            var s = t.byId("fragSelectSOSG", "IdSalesoffice1").getSelectedKey();
            var l = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
            var u = l.getModel().getProperty(l.getPath());
            var g = new Date;
            var d = [];
            d.push(new sap.ui.model.Filter("UserStatus", sap.ui.model.FilterOperator.EQ, "E0001"));
            d.push(new sap.ui.model.Filter("fromdate", sap.ui.model.FilterOperator.EQ, g));
            if (o.AppointmentRule === "3") {
                d.push(new sap.ui.model.Filter("SalesOrgSd", sap.ui.model.FilterOperator.EQ, u.SalesOrganization))
            } else {
                d.push(new sap.ui.model.Filter("SalesOfficeSd", sap.ui.model.FilterOperator.EQ, s))
            }
            d.push(new sap.ui.model.Filter("Equipment_disp", sap.ui.model.FilterOperator.EQ, i.Equipment));
            this.getView().setBusy(true);
            this.getView().getModel().read("/ZAE_I_Appointment_22", {
                filters: d,
                success: function (t, i) {
                    a.getView().setBusy(false);
                    if (t.results.length > 0) {
                        r = true;
                        for (var o = 0; o < t.results.length; o++) {
                            n.push(t.results[o])
                        }
                        a.getView().getModel("mCustIdentification").setProperty("/OpenAppointments", n)
                    }
                    e.resolve(r)
                },
                error: function (t) {
                    a.getView().setBusy(false);
                    e.resolve(true)
                }
            });
            return e
        },
        fnExistingAppointments: function (e) {
            if (!this._oExistingAppointmentDialog) {
                t.load({
                    id: "fragExistingAppointments",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ExistingAppointments",
                    controller: this
                }).then(function (e) {
                    this._createExistingAppointmentDialog(e);
                    this._oExistingAppointmentDialog.open()
                }.bind(this))
            } else {
                this._oExistingAppointmentDialog.open()
            }
        },
        _createExistingAppointmentDialog: function (e) {
            var t = this;
            this._oExistingAppointmentDialog = new sap.m.Dialog({
                title: "{i18n>ExistingAppointments}",
                content: [e],
                buttons: [new sap.m.Button({
                    text: "{i18n>Close}",
                    press: function () {
                        this._oExistingAppointmentDialog.close()
                    }.bind(this)
                })]
            });
            this.getView().addDependent(this._oExistingAppointmentDialog)
        },
        AppointmentSelected: function (e) {
            var t = e.getSource();
            var a = sap.ushell.Container.getService("CrossApplicationNavigation");
            var r = t.getBindingContextPath();
            var n = this.getView().getModel("mCustIdentification").getProperty(r);
            var i = a && a.hrefForExternal({
                target: {
                    semanticObject: "Appointment",
                    action: "aeDisplay&//ZAE_C_Appointment_01(object_type='" + "BUS2000126" + "',Appointment='" + n.Appointment + "',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
                }
            }) || "";
            var o = window.location.href.split("#")[0] + i;
            sap.m.URLHelper.redirect(o, true)
        },
        onBeforeRebindOpenServiceRequests: function (e) {
            var t = this.getView().byId("SCIN_BoxSearchResults").getBindingContext();
            var a = [];
            var r;
            var n = e.getParameter("bindingParams");
            if (t && n) {
                n.preventTableBind = false;
                if (t) {
                    var i = t.getObject();
                    if (!i) {
                        return
                    }
                    var o = i.Equipment;
                    r = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, o);
                    a.push(r)
                } else {
                    r = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, "");
                    a.push(r)
                }
                if (n) {
                    n.filters = a;
                    var s = new sap.ui.model.Sorter("ServiceDocCreationDateTime", "Descending");
                    n.sorter.push(s);
                    n.parameters.select = n.parameters.select + ",ServiceRequest,ServiceObjectType"
                }
            } else {
                n.preventTableBind = true
            }
        },
        onNavBack: function (e) {
            this.byId("OpenServiceRequests").rebindTable()
        },
        // fnCreateAppointmentDirect: function () {
        //     var e = this;
        //     var a = "";
        //     var r = e.getView().getModel("i18n").getResourceBundle();
        //     var n = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
        //     var i = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem();
        //     var o = t.byId("fragSelectSOSG", "startDate").getDateValue();
        //     var s = t.byId("fragSelectSOSG", "endDate").getDateValue();
        //     var l = this.byId("SCIN_I03").getSelectedKey();
        //     var u = t.byId("fragSelectSOSG", "appTitle").getValue();
        //     var g = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
        //     var d = g.getModel().getProperty(g.getPath());
        //     var c = this.getView().byId("SCIN_I01").getSelectedKey();
        //     var C = this.byId("SCIN_I02").getTokens();
        //     var p;
        //     if (t.byId("fragSelectSOSG", "CampaignID").getTokens().length > 0) {
        //         p = t.byId("fragSelectSOSG", "CampaignID").getTokens()[0].getKey()
        //     }
        //     var f;
        //     var m;
        //     if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
        //         f = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
        //         m = f.getModel().getProperty(f.getPath());
        //         a = m.ContactPerson
        //     } else if (this.oContactList) {
        //         f = this.oContactList.getBindingContext();
        //         m = f.getModel().getProperty(f.getPath());
        //         a = m.ContactPerson
        //     }
        //     o.setSeconds(o.getSeconds() + 1);
        //     if (u.length > 38) {
        //         var y = u.substring(0, 38);
        //         u = y
        //     }
        //     var v = t.byId("fragSelectSOSG", "idEmployee").getValue();
        //     var I = this.getView().getModel("mCustIdentification").getData();
        //     var S = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem() !== null ? t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getModel().getProperty(t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().sPath).CRMSalesGroup : "";
        //     var h = t.byId("fragSelectSOSG", "IdSalesoffice").getSelectedItem() !== null ? t.byId("fragSelectSOSG", "IdSalesoffice").getSelectedItem().getBindingContext().getModel().getProperty(t.byId("fragSelectSOSG", "IdSalesoffice").getSelectedItem().getBindingContext().sPath).CRMSalesOffice : "";
        //     var b = e.getView().getModel().getProperty(t.byId("fragSelectSOSG", "reasonInput").getSelectedItem().getBindingContext().sPath);
        //     if (t.byId("fragSelectSOSG", "startDate").getValueState() !== "Error" && t.byId("fragSelectSOSG", "endDate").getValueState() !== "Error") {
        //         var P = null;
        //         P = new Date(o);
        //         P.setHours(P.getHours());
        //         var V = "/Date(" + P.getTime() + ")/";
        //         var E = "PT" + ("00" + P.getHours()).slice(-2) + "H" + ("00" + P.getMinutes()).slice(-2) + "M" + ("00" + P.getSeconds()).slice(-2) + "S";
        //         P = new Date(s);
        //         P.setHours(P.getHours());
        //         var _ = "/Date(" + P.getTime() + ")/";
        //         var T = "PT" + ("00" + P.getHours()).slice(-2) + "H" + ("00" + P.getMinutes()).slice(-2) + "M" + ("00" + P.getSeconds()).slice(-2) + "S";
        //         var N = "ZAE_FM_SCIN_CREAAPP_FROM_CI_03Set";
        //         var D = this.getView().getModel("ZAE_FM_SCIN_CREAAPP_FROM_CI_03_SRV");
        //         var O = [{
        //             IDescription: u,
        //             IEquipNo: I.customerInfo.Equipment ? I.customerInfo.Equipment : "",
        //             IPartner: I.customerInfo.to_CurrentOwner ? I.customerInfo.to_CurrentOwner.Partner : I.customerInfo.CurrentOwner,
        //             CPerson: a.CPerson,
        //             IEmpResp: v,
        //             IStartDate: V,
        //             IStartTime: E,
        //             IEndDate: _,
        //             IEndTime: T,
        //             IPlant: c,
        //             SalesOrg: d.SalesOrganization,
        //             DisChannel: d.DistrChannel,
        //             Division: d.Division,
        //             SubjectProfile: b.SubjectProfile,
        //             CatType: b.Catlog,
        //             CodeGroup: b.CodeGroup,
        //             Code: b.Code,
        //             SalesOffice: h,
        //             SalesGroup: S,
        //             IInsurer: l,
        //             CmpgnId: p,
        //             LeadId: this.Lead !== "" ? this.Lead : ""
        //         }];
        //         if (this.Lead !== "") {
        //             O[0]["LeadId"] = this.Lead
        //         }
        //         var w = [];
        //         for (var B = 0; B < C.length; B++) {
        //             w.push({
        //                 CatId: C[B].getProperty("key")
        //             })
        //         }
        //         var M = [{
        //             callProperty: "N_CI03",
        //             value: O
        //         }, {
        //             callProperty: "N_CATID",
        //             value: w
        //         }];
        //         var R = function (t) {
        //             var a = e.getView().getModel("i18n").getResourceBundle().getText("Created");
        //             var r = e.getView().getModel("i18n").getResourceBundle().getText("Successfully");
        //             var n = "";
        //             if (t.N_CI03.results.length > 0 && t.N_CI03.results[0].EActivityNo) {
        //                 n = t.N_CI03.results[0].EActivityNo
        //             } else {
        //                 return
        //             }
        //             var i = new sap.ui.core.message.Message({
        //                 persistent: true,
        //                 code: n,
        //                 type: sap.ui.core.MessageType.Success,
        //                 message: a + n + " " + r,
        //                 additionalText: "",
        //                 description: ""
        //             });
        //             sap.ui.getCore().getMessageManager().addMessages(i);
        //             e.RecentAppointment = n
        //         };
        //         var A = function (t) {
        //             e.RecentAppointment = undefined
        //         };
        //         this.aeUI5Util.createCall(e, D, N, M, R, A);
        //         e._oSelectSOSGDialog.close()
        //     }
        // },
        _fnCreateAppointmentInitalState: function () {
            var e = "";
            var a = "";
            var r = "";
            var n = "";
            var o = "";
            var s = "";
            var l = "";
            var u = 0;
            var g = this.getView().getModel("mCustIdentification");
            var d = g.getData();
            var c = this.getView().byId("SCIN_I01").getSelectedKey();
            var C = t.byId("fragSelectSOSG", "IdSalesgroup");
            if (C.getSelectedItem()) {
                l = C.getSelectedItem().getBindingContext().getObject()
            } else {
                var p = t.byId("fragSelectSOSG", "IdSalesoffice1").getSelectedKey();
                var C = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
                var f = "/ZAE_I_SalesOfficeGroup_01(Plant='" + c + "',SalesOffice='" + p + "',SalesGroup='" + C + "')";
                l = this.getView().getModel().getProperty(f)
            }
            if (l && l.CreateAppDirect && this.vButtonID === "B08") {
                g.setProperty("/CreateAppointmentDirect", true);
                var m = [];
                var y = this.getView().byId("SCIN_I02").getTokens();
                if (y.length === 0) {
                    y = this.oCategory
                }
                var v = y.length > 0 ? y[0].getText() : "";
                var I;
                var S;
                if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
                    var S = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
                    var I = S.getModel().getProperty(S.getPath());
                    n = I.ContactPerson;
                    r = I.ContactPersonName
                } else if (this.oContactList) {
                    S = this.oContactList.getBindingContext();
                    I = S.getModel().getProperty(S.getPath());
                    n = I.ContactPerson;
                    r = I.ContactPersonName
                } else {
                    n = "";
                    r = ""
                }
                if (d.customerInfo.to_CurrentOwner && d.customerInfo.to_CurrentOwner.Partner) {
                    e = d.customerInfo.to_CurrentOwner.Partner;
                    a = d.customerInfo.to_CurrentOwner.CustomerName
                } else if (d.customerInfo.CurrentOwner) {
                    e = d.customerInfo.CurrentOwner;
                    a = d.customerInfo.CustomerName
                } else {
                    e = "";
                    a = ""
                }
                if (a) {
                    o = a + " (" + e + ")"
                } else {
                    o = e
                }
                if (r) {
                    s = r + " (" + n + ")"
                } else {
                    s = n
                }
                if (l.TimeSlot) {
                    u = parseInt(l.TimeSlot)
                }
                var m = [];
                m.push(new i("TransactionType", "EQ", d.SchemaTransactionType.TransactionType));
                t.byId("fragSelectSOSG", "reasonInput").getBinding("items").filter(m);
                t.byId("fragSelectSOSG", "Customer").setValue(o);
                t.byId("fragSelectSOSG", "CPerson").setValue(s);
                t.byId("fragSelectSOSG", "idEmployee").setValue(l.AppointmentPersonResp);
                t.byId("fragSelectSOSG", "appTitle").setValue(v);
                var h = new Date;
                t.byId("fragSelectSOSG", "startDate").setDateValue(new Date);
                t.byId("fragSelectSOSG", "startDate").setDisplayFormat("short");
                h.setMinutes(h.getMinutes() + u);
                t.byId("fragSelectSOSG", "endDate").setDateValue(h);
                t.byId("fragSelectSOSG", "endDate").setMinDate(new Date);
                t.byId("fragSelectSOSG", "endDate").setValueState("None");
                t.byId("fragSelectSOSG", "startDate").setValueState("None")
            } else {
                g.setProperty("/CreateAppointmentDirect", false)
            }
            this.fnCheckSubmitButtonEnableState()
        },
        fnCheckSubmitButtonEnableState: function () {
            var e = false;
            var a;
            var r = t.byId("fragSelectSOSG", "appTitle").getValue();
            var n = t.byId("fragSelectSOSG", "IdSalesoffice1").getSelectedItem();
            var i = t.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem();
            var o = t.byId("fragSelectSOSG", "startDate");
            var s = t.byId("fragSelectSOSG", "endDate");
            var l = t.byId("fragSelectSOSG", "idEmployee").getValue();
            if (i.getBindingContext().getObject().VerifyBPData) {
                a = t.byId("fragSelectSOSG", "idVerifyBpData").getSelected();
                e = n !== null && i !== null && a
            } else {
                e = n !== null && i !== null
            }
            if (i) {
                var u = i.getBindingContext().getObject();
                if (u.CreateAppDirect && this.vButtonID === "B08") {
                    e = r !== "" && l !== "" && o.getValueState() !== "Error" && o.getDateValue() !== "" && s.getDateValue() !== "" && s.getValueState() !== "Error" && i !== null && n !== null
                }
            }
            t.byId("fragSelectSOSG", "BUTTONSubmit").setEnabled(e)
        },
        // fnWorkshopLoadbyWorkCenter: function (e) {
        //     var a = this;
        //     if (!this._oWorkShopLoadbyWorkCenter) {
        //         t.load({
        //             id: "fragWorkshopLoad",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.WorkShopLoadbyWorkCenter",
        //             controller: {
        //                 onSubmitPressed: function (e) {
        //                     t.byId("fragWorkshopLoad", "idDate").getDateValue().setHours(6);
        //                     var r = t.byId("fragWorkshopLoad", "idDate");
        //                     var n = r.getDateValue();
        //                     if (n) {
        //                         var i = new Date(n);
        //                         i.setDate(n.getDate() - n.getDay());
        //                         var o = new Date(i);
        //                         o.setDate(i.getDate() + 6);
        //                         var s = {
        //                             startDate: i.toISOString().split("T")[0],
        //                             endDate: o.toISOString().split("T")[0]
        //                         };
        //                         var l = [];
        //                         var u = a.getView().byId("SCIN_I01").getSelectedKey();
        //                         var g = sap.ushell.Container.getService("CrossApplicationNavigation");
        //                         var d = g && g.hrefForExternal({
        //                             target: {
        //                                 semanticObject: "WorkCenter",
        //                                 action: "aeAnalyze"
        //                             },
        //                             params: {
        //                                 plant: u,
        //                                 fromDate: i,
        //                                 toDate: o
        //                             }
        //                         }) || "";
        //                         var c = window.location.href.split("#")[0] + d;
        //                         sap.m.URLHelper.redirect(c, true)
        //                     }
        //                 },
        //                 onCancelPressed: function (e) {
        //                     e.getSource().getParent().close()
        //                 },
        //                 handleDateChange: function (e) {
        //                     var t = e.getSource();
        //                     var r = e.getSource().getDateValue() !== null;
        //                     a._oWorkShopLoadbyWorkCenter.getBeginButton().setEnabled(r)
        //                 }
        //             }
        //         }).then(function (e) {
        //             this._oWorkShopLoadbyWorkCenter = e;
        //             this.getView().addDependent(this._oWorkShopLoadbyWorkCenter);
        //             this._setWorkshopRoasterDialogInitialState()
        //         }.bind(this))
        //     } else {
        //         this._setWorkshopRoasterDialogInitialState()
        //     }
        // },
        // _setWorkshopRoasterDialogInitialState: function () {
        //     t.byId("fragWorkshopLoad", "idDate").setDateValue(new Date);
        //     this._oWorkShopLoadbyWorkCenter.open()
        // },
        fnBuildAppState: function (e) {
            var oSmartFilterBar = this.getView().byId("SCIN_smartFilterBar");
            var oPlantControl = oSmartFilterBar ? oSmartFilterBar.getControlByKey("Plant") : null;

            var z = null;
            if (oPlantControl) {
                z = oPlantControl.getSelectedKey();
            } else {
                console.warn("Plant Input (SCIN_I01) not found in _filterTable");
            }
            var t = "",
                a = "";
            var r = this.byId("EquipmentVH").getTokens();
            if (r.length > 0) {
                t = r[0].getProperty("key");
                a = r[0].getProperty("text")
            }
            var n = sap.ushell.Container.getService("CrossApplicationNavigation");
            var i = sap.ui.core.Component.getOwnerIdFor(this.getView());
            var o = n.createEmptyAppState(sap.ui.component(i));
            var s = {
                Plant: z,
                Equipment: t,
                EquipmentWithDesc: a
            };
            o.setData(s);
            o.save();
            var l = sap.ui.core.routing.HashChanger.getInstance();
            var u = l.getHash();
            var g = u + "?" + "sap-iapp-state=" + o.getKey();
            l.replaceHash(g)
        },
        // fnUpdatePersonalData: function () {
        //     var e = t.byId("fragUpdatePersonalData", "IDMobile").getValueState();
        //     if (e !== "Error") {
        //         t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip").setVisible(false)
        //     }
        // },
        // onPressUpdatepersonaldata: function (e) {
        //     if (e) {
        //         this.vButtonID = ""
        //     }
        //     if (!this._UpdatePersonalDialog) {
        //         t.load({
        //             id: "fragUpdatePersonalData",
        //             name: "com.globalintelli.ZAE_SCIN_NEW.fragment.UpdatePersonalData",
        //             controller: this
        //         }).then(function (e) {
        //             this._UpdatePersonalDataDialog(e);
        //             this._setUpdatePersonalDialogInitialState()
        //         }.bind(this))
        //     } else {
        //         this._setUpdatePersonalDialogInitialState()
        //     }
        // },
        // _setUpdatePersonalDialogInitialState: function () {
        //     if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem() === null) {
        //         var e = this.getView().getModel("i18n").getResourceBundle().getText("SelectCP");
        //         sap.m.MessageBox.error(e)
        //     }
        //     this.oContactList = this.byId("SmartTableContactPersonList").getTable().getSelectedItem();
        //     if (this.getView().byId("SCIN_I02").getTokens().length > 0) {
        //         this.oCategory = this.getView().byId("SCIN_I02").getTokens()
        //     }
        //     var a = this.getView().getModel("mCustIdentification");
        //     var r = a.getData();
        //     var n = t.byId("fragUpdatePersonalData", "IDMobile");
        //     var i = t.byId("fragUpdatePersonalData", "IDFaxNumber");
        //     i.setValue("");
        //     n.setValue("");
        //     var o = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
        //     var s = o.getModel().getProperty(o.getPath());
        //     var l = s.Country;
        //     var u = this.getView().getModel("CountryCodes").getData().find(function (e) {
        //         return e.code === l
        //     });
        //     var g = u.dial_code;
        //     if (l === "OM") {
        //         var d = g.length + 7;
        //         var c = this.fnCreateMask(g, d)
        //     } else if (l === "AE") {
        //         var d = g.length + 8;
        //         var c = this.fnCreateMask(g, d)
        //     } else {
        //         var d = g.length + 10;
        //         var c = this.fnCreateMask(g, d)
        //     }
        //     var C;
        //     if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
        //         var o = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
        //         var s = o.getModel().getProperty(o.getPath());
        //         C = this.formatNameAndValuePair(s.ContactPersonName, s.ContactPerson)
        //     } else {
        //         C = ""
        //     }
        //     if (s.MobileNumber !== "") {
        //         n.setValue(g + " " + s.MobileNumber)
        //     }
        //     if (s.FaxNumber !== "") {
        //         i.setValue(g + " " + s.FaxNumber)
        //     }
        //     n.setMask(c);
        //     i.setMask(c);
        //     t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip").setVisible(false);
        //     n.setValueState("None");
        //     i.setValueState("None");
        //     t.byId("fragUpdatePersonalData", "IDContactPerson").setValue(C);
        //     t.byId("fragUpdatePersonalData", "IDEMAIL").setValue(s.EmailAddress);
        //     if (r.customerInfo.BPDetailsMandatory) {
        //         t.byId("fragUpdatePersonalData", "IDMobileReq").setRequired(true);
        //         t.byId("fragUpdatePersonalData", "IDEMAILReq").setRequired(true);
        //         t.byId("fragUpdatePersonalData", "IDMobileReq2").setRequired(true)
        //     }
        //     this._UpdatePersonalDialog.open()
        // },
        // _UpdatePersonalDataDialog: function (e) {
        //     var a;
        //     var r;
        //     var n;
        //     var i;
        //     var o = this;
        //     this._UpdatePersonalDialog = new sap.m.Dialog({
        //         title: "Update Personal Data",
        //         content: [e],
        //         beginButton: new sap.m.Button({
        //             text: "{i18n>Submit}",
        //             press: function () {
        //                 o._UpdatePersonalDialog.setBusy(true);
        //                 if (this.byId("SmartTableContactPersonList").getTable().getSelectedItem()) {
        //                     var e = this.byId("SmartTableContactPersonList").getTable().getSelectedItem().getBindingContext();
        //                     var s = e.getModel().getProperty(e.getPath());
        //                     n = s.ContactPerson
        //                 }
        //                 var l = this.getView().getModel("mCustIdentification");
        //                 var u = l.getData();
        //                 var g = t.byId("fragUpdatePersonalData", "IDMobile");
        //                 r = t.byId("fragUpdatePersonalData", "IDEMAIL");
        //                 i = t.byId("fragUpdatePersonalData", "IDFaxNumber");
        //                 if (g.getValueState() === "Error") {
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     var d = "Enter Mobile Number Correctly";
        //                     var c = t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
        //                     c.setVisible(true);
        //                     c.setText(d);
        //                     return
        //                 } else if (g.getValue() === "") {
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     var C = "Enter Mobile Number";
        //                     var c = t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
        //                     c.setVisible(true);
        //                     c.setText(C);
        //                     return
        //                 }
        //                 if (u.customerInfo.BPDetailsMandatory && r.getValue() === "") {
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     var c = t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
        //                     c.setVisible(true);
        //                     c.setText("Enter Email ID");
        //                     return
        //                 } else if (u.customerInfo.BPDetailsMandatory && r.getValueState() === "Error") {
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     var p = "Enter Email ID Correctly";
        //                     var c = t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
        //                     c.setVisible(true);
        //                     c.setText(p);
        //                     return
        //                 }
        //                 if (u.customerInfo.BPDetailsMandatory && i.getValueState() === "Error") {
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     var d = "Enter  Mobile No.2 Correctly";
        //                     var c = t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
        //                     c.setVisible(true);
        //                     c.setText(d);
        //                     return
        //                 } else if (u.customerInfo.BPDetailsMandatory && i.getValue() === "") {
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     var f = "Enter Mobile No.2";
        //                     var c = t.byId("fragUpdatePersonalData", "SCIN_B24MessageStrip");
        //                     c.setVisible(true);
        //                     c.setText(f);
        //                     return
        //                 }
        //                 a = t.byId("fragUpdatePersonalData", "IDMobile").getValue().split(" ")[1];
        //                 r = t.byId("fragUpdatePersonalData", "IDEMAIL").getValue();
        //                 i = t.byId("fragUpdatePersonalData", "IDFaxNumber").getValue().split(" ")[1];
        //                 var m = "ZAE_FM_SCIN_UPDATE_BPSet";
        //                 var l = o.getView().getModel();
        //                 var u = o.getView().getModel("mCustIdentification").getData();
        //                 var y = u.customerInfo.to_CurrentOwner.Partner;
        //                 var v = [{
        //                     callProperty: "BpNumber",
        //                     value: n
        //                 }, {
        //                     callProperty: "EmailId",
        //                     value: r
        //                 }, {
        //                     callProperty: "MobileNumber",
        //                     value: a
        //                 }, {
        //                     callProperty: "FaxNumber",
        //                     value: i
        //                 }];
        //                 var I = function (e) {
        //                     o.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     o.getView().byId("SmartTableContactPersonList").getTable().getBinding("items").refresh();
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     o._UpdatePersonalDialog.close();
        //                     if (o.vButtonID === "B08" || o.vButtonID === "B09") {
        //                         o.fnCreateAptSrq()
        //                     }
        //                 };
        //                 var S = function (e) {
        //                     o.getView().byId("SCIN_I02").fireTokenUpdate();
        //                     o.getView().byId("SmartTableContactPersonList").getTable().getBinding("items").refresh();
        //                     o._UpdatePersonalDialog.setBusy(false);
        //                     o._UpdatePersonalDialog.close()
        //                 };
        //                 o.aeUI5Util.createCall(o, l, m, v, I, S)
        //             }.bind(this)
        //         }),
        //         endButton: new sap.m.Button({
        //             text: "{i18n>Close}",
        //             press: function () {
        //                 this._UpdatePersonalDialog.close()
        //             }.bind(this)
        //         })
        //     });
        //     this.getView().addDependent(this._UpdatePersonalDialog)
        // },
        handleInsuranceDialogValueHelp: function (e, a, r, n, i, o, s, l) {
            var u = this;
            var g = a.getId();
            if (!u._valueHelpDialogs[g]) {
                t.load({
                    id: g + "DialogVHFragment",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.InsuranceVH",
                    controller: {
                        _handleValueHelpClose: function (e) {
                            var t = e.getParameter("selectedItem");
                            if (t) {
                                var r = t.getBindingContext().getObject();
                                a.setSelectedKey(r.InsurancePartner);
                                a.setValue(t.getTitle())
                            }
                            e.getSource().getBinding("items").filter([])
                        },
                        _handleValueHelpSearch: function (e) {
                            var t = e.getParameter("value");
                            u._setValueHelpDialogFilter(g, i, o, s, t, l)
                        }
                    }
                }).then(function (t) {
                    u._valueHelpDialogs[g] = t;
                    e.getView().addDependent(u._valueHelpDialogs[g]);
                    u._initValueHelpDialog(a, r, n, i, o, s, l)
                })
            } else {
                u._initValueHelpDialog(a, r, n, i, o, s, l)
            }
        },
        _initValueHelpDialog: function (e, t, a, r, n, i, o) {
            var s = e.getId();
            this._valueHelpDialogs[s].setTitle(t);
            var l = e.getValue();
            if (a) {
                var u = {
                    path: "/" + a,
                    template: new sap.m.StandardListItem({
                        title: {
                            parts: [{
                                path: n
                            }, {
                                path: r
                            }],
                            formatter: this.formatNameAndValuePair
                        },
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
                this._valueHelpDialogs[s].bindAggregation("items", u)
            }
            this._setValueHelpDialogFilter(s, r, n, i, l, o);
            this._valueHelpDialogs[s].open(l)
        },
        _setValueHelpDialogFilter: function (e, t, a, r, n, i) {
            var o = new sap.ui.model.Filter({
                filters: this.aeUtil.genFilterArr([{
                    path: t,
                    operator: sap.ui.model.FilterOperator.Contains,
                    value1: n
                }, {
                    path: a,
                    operator: sap.ui.model.FilterOperator.Contains,
                    value1: n
                }, {
                    path: i,
                    operator: sap.ui.model.FilterOperator.Contains,
                    value1: n
                }])
            });
            var s = o;
            if (r && r.value1) {
                s = new sap.ui.model.Filter({
                    filters: [o, this.genFilterArr([{
                        path: r.path,
                        operator: r.operator,
                        value1: r.value1
                    }])[0]],
                    and: true
                })
            }
            this._valueHelpDialogs[e].getBinding("items").filter(s, sap.ui.model.FilterType.Application)
        },
        formatDescription: function (e, t, a, r, n) {
            var i = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd-MM-yyyy"
            });
            var o = this.getParent().getParent().getParent().getParent().getController().formatNameAndValuePair(r, n);
            if (e) {
                o += " • " + e
            }
            if (t) {
                o += " • " + i.format(t)
            }
            if (a) {
                o += " • " + i.format(a)
            }
            return o
        },
        onPressAssignContactPerson: function (e) {
            var a = this;
            if (!this._oNewAssignContactPersonDialog) {
                t.load({
                    id: "fragAssignContactPerson",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.AssignContactPerson",
                    controller: this
                }).then(function (e) {
                    this._AssignContactPersonDialog(e);
                    this._setAssignContactPersonDialogInitialState()
                }.bind(this))
            } else {
                this._setAssignContactPersonDialogInitialState()
            }
        },
        _AssignContactPersonDialog: function (e) {
            var a;
            var r = this;
            this._oNewAssignContactPersonDialog = new sap.m.Dialog({
                title: "{i18n>AssignContactPerson}",
                width: "15rem",
                content: [e],
                beginButton: new sap.m.Button({
                    text: "{i18n>Assign}",
                    press: function () {
                        r._oNewAssignContactPersonDialog.setBusy(true);
                        var e = this.getView().byId("IdCustomer").getText();
                        a = t.byId("fragAssignContactPerson", "CUSTOMER").getTokens()[0];
                        if (a === undefined) {
                            r.fnCheckAssignContactPersonRequiredValidation();
                            var n = this.getView().getModel("i18n").getResourceBundle().getText("Please Select Contact Person");
                            sap.m.MessageBox.error(n);
                            return {
                                pass: false
                            }
                        } else {
                            a = a.getProperty("key")
                        }
                        var i = "ZAE_FM_ASSIGN_CONTACT_PERSONSet";
                        var o = r.getView().getModel();
                        var s = [{
                            callProperty: "Partner",
                            value: e
                        }, {
                            callProperty: "ContactP",
                            value: a
                        }];
                        var l = function (e) {
                            r.getView().byId("SCIN_I02").fireTokenUpdate();
                            r.byId("SmartTableContactPersonList").rebindTable();
                            r._oNewAssignContactPersonDialog.setBusy(false)
                        };
                        var u = function (e) {
                            r.getView().byId("SCIN_I02").fireTokenUpdate();
                            r.byId("SmartTableContactPersonList").rebindTable();
                            r._oNewAssignContactPersonDialog.setBusy(false)
                        };
                        this.aeUI5Util.createCall(r, o, i, s, l, u);
                        this._oNewAssignContactPersonDialog.close()
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: "{i18n>Close}",
                    press: function () {
                        this._oNewAssignContactPersonDialog.close()
                    }.bind(this)
                })
            });
            this.getView().addDependent(this._oNewAssignContactPersonDialog)
        },
        _fnAssignContactPersonCreateButtonEnabledState: function () {
            var e = t.byId("fragAssignContactPerson", "CUSTOMER");
            var a = e.getTokens().length > 0;
            this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(a)
        },
        fnCheckAssignContactPersonRequiredValidation: function () {
            this._fnAssignContactPersonCreateButtonEnabledState()
        },
        _setAssignContactPersonDialogInitialState: function () {
            var e = this;
            t.byId("fragAssignContactPerson", "CUSTOMER").setTokens([]);
            this._oNewAssignContactPersonDialog.open();
            this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(false)
        },
        onAssignContactPersonVH: function (e) {
            var t = this;
            var a = e.getSource();
            a.setTokens([]);
            var r = {
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
                onBeforeRebindSmartTable: function (e) { }
            };
            t.aeUtil.handleSmartDialogValueHelp(t, a, r)
        },
        onAssignContactPersonTokenUpdate: function (e) {
            t.byId("fragAssignContactPerson", "CUSTOMER").setValueState("None");
            var a = e.getSource().getTokens();
            if (a.length === 0 || e.getParameter("type") === "removed") {
                e.getSource().setSelectedKey("");
                e.getSource().setTokens([]);
                this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(false)
            } else {
                this._oNewAssignContactPersonDialog.getBeginButton().setEnabled(true)
            }
        },
        onSelectAssignContactPerson: function (e) {
            if (e.getParameter("selectedRow") !== null) {
                var t = e.getSource();
                t.setTokens([]);
                var a = e.getParameter("selectedRow").getBindingContext().getObject();
                var r = that.formatNameAndValuePair(a.BusinessPartnerName, a.BusinessPartner);
                var n = new sap.m.Token({
                    key: a.BusinessPartner,
                    text: r
                })
            }
            this.fnCheckAssignContactPersonRequiredValidation()
        },
        handleAssignContactPersonSuggest: function (e) {
            var t = that.getView().getBindingContext().getObject();
            var a = e.getParameter("suggestValue");
            var r = [];
            if (a) {
                r.push(new i({
                    filters: [new i({
                        path: "BusinessPartner",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }), new i({
                        path: "BusinessPartnerName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }), new i({
                        path: "E_PhoneNo1",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    })],
                    and: false
                }))
            }
            e.getSource().getBinding("suggestionRows").filter(r);
            e.getSource().getBinding("suggestionRows").resume()
        },
        date_diff_indays: function (e, t) {
            let a = e.getTime() - t.getTime();
            let r = Math.ceil(a / (1e3 * 3600 * 24));
            return r
        },
        fnShowNationalityValueHelp: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            if (a._NationalityValueHelpDialog) {
                a._NationalityValueHelpDialog.destroy()
            }
            t.load({
                id: "NationalityValueHelpDialogFragment",
                name: "com.globalintelli.ZAE_SCIN_NEW.fragment.Nationality",
                controller: {
                    _handleValueHelpCloseNationality: function (e) {
                        var i = e.getParameter("selectedItem");
                        if (i) {
                            var o = i.getBindingContext().getObject();
                            var s = t.byId(r, "NATIONALITY");
                            s.setValueState("None");
                            s.setValue("");
                            s.setTokens([]);
                            var l = i.getTitle() + " ( " + i.getDescription() + " )";
                            s.addToken(new n({
                                key: i.getTitle(),
                                text: l
                            }));
                            e.getSource().getBinding("items").filter([]);
                            switch (r) {
                                case "fragCreateCustomer":
                                    a.fnCheckCreateCustomerRequiredValidation();
                                    break;
                                case "fragCreateProspect":
                                    a.fnCheckCreateProspectRequiredValidation();
                                    break
                            }
                        }
                    },
                    _handleValueHelpSearch: function (e) {
                        var t = e.getParameter("value");
                        a._NationalityValueHelpDialog.getBinding("items").filter([]);
                        var r = new sap.ui.model.Filter({
                            filters: a.genFilterArr([{
                                path: "Country",
                                operator: sap.ui.model.FilterOperator.Contains,
                                value1: t
                            }, {
                                path: "CountryName",
                                operator: sap.ui.model.FilterOperator.Contains,
                                value1: t
                            }])
                        });
                        a._NationalityValueHelpDialog.getBinding("items").filter(r, sap.ui.model.FilterType.Application);
                        var n = a._NationalityValueHelpDialog.getBinding("items");
                        if (!n.sFilterParams.includes("%27")) {
                            for (var i = 0; i <= r.aFilters.length - 1; i++) {
                                r.aFilters[i].oValue1 = "'" + r.aFilters[i].oValue1 + "'"
                            }
                            n.filter(r)
                        } else {
                            n.filter(r)
                        }
                    }
                }
            }).then(function (e) {
                a._NationalityValueHelpDialog = e;
                e.open();
                e.setModel(a.getView().getModel())
            }, this)
        },
        handleNationalitySuggest: function (e) {
            var t = this;
            var a = e.getParameter("suggestValue");
            if (a) {
                var r = new sap.ui.model.Filter({
                    filters: t.genFilterArr([{
                        path: "Country",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }, {
                        path: "CountryName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }])
                })
            }
            var n = true;
            var i = new sap.ui.model.Filter(r, n);
            e.getSource().getBinding("suggestionRows").filter(i);
            var o = e.getSource().getBinding("suggestionRows");
            if (!o.sFilterParams.includes("%27")) {
                for (var s = 0; s <= i.aFilters.length - 1; s++) {
                    i.aFilters[s].oValue1 = "'" + i.aFilters[s].oValue1 + "'"
                }
                o.filter(i)
            } else {
                o.filter(i)
            }
            e.getSource().getBinding("suggestionRows").resume()
        },
        onNationalityTokenUpdate: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            t.byId(r, "NATIONALITY").setValueState("None");
            var n = e.getSource().getTokens();
            switch (r) {
                case "fragCreateCustomer":
                    a.fnCheckCreateCustomerRequiredValidation();
                    break;
                case "fragCreateProspect":
                    a.fnCheckCreateProspectRequiredValidation();
                    break
            }
        },
        onSelectNationality: function (e) {
            var a = this;
            var r = e.getSource().getId().split("--")[0];
            if (e.getParameter("selectedRow") !== null) {
                var n = e.getSource();
                n.setTokens([]);
                t.byId(r, "NATIONALITY").setValueState("None");
                var i = e.getParameter("selectedRow").getBindingContext().getObject();
                var o = this.formatNameAndValuePair(i.Country, i.CountryName);
                var s = new sap.m.Token({
                    key: i.Country,
                    text: o
                });
                n.setTokens([s]);
                var l = "+" + i.CountryCode;
                switch (r) {
                    case "fragCreateCustomer":
                        a.fnCheckCreateCustomerRequiredValidation();
                        break;
                    case "fragCreateProspect":
                        a.fnCheckCreateProspectRequiredValidation();
                        break
                }
            }
        },
        onEmpRespValueHelpRequested: function (e) {
            var t = this;
            var a = e.getSource();
            a.setTokens([]);
            var r = {
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
                onBeforeRebindSmartTable: function (e) {
                    var t = e.getParameter("bindingParams").filters;
                    e.getParameter("bindingParams").filters = t
                }
            };
            t.aeUtil.handleSmartDialogValueHelp(t, a, r)
        },
        onEmpRespTokenUpdate: function (e) {
            var t = e.getSource().getTokens();
            if (t.length === 0 || e.getParameters().type === "removed") {
                e.getSource().setTokens([])
            }
            this.fnBeginButtonValidation()
        },
        onSelectEmpResp: function (e) {
            if (e.getParameter("selectedRow") !== null) {
                var t = e.getSource();
                t.setTokens([]);
                var a = e.getParameter("selectedRow").getBindingContext().getObject();
                var r = this.formatNameAndValuePair(a.PartnerName, a.Partner);
                var n = new sap.m.Token({
                    key: a.Partner,
                    text: r
                });
                t.setTokens([n]);
                t.fireTokenUpdate()
            }
        },
        handleEmpRespSuggest: function (e) {
            var t = e.getParameter("suggestValue");
            var a = [];
            if (t) {
                a.push(new i({
                    filters: [new i({
                        path: "Partner",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: t
                    }), new i({
                        path: "PartnerName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: t
                    })],
                    and: false
                }))
            }
            e.getSource().getBinding("suggestionRows").filter(a);
            e.getSource().getBinding("suggestionRows").resume()
        },
        onServManagerValueHelpRequested: function (e) {
            var t = this;
            var a = e.getSource();
            a.setTokens([]);
            var r = {
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
                onBeforeRebindSmartTable: function (e) {
                    var t = e.getParameter("bindingParams").filters;
                    e.getParameter("bindingParams").filters = t
                }
            };
            t.aeUtil.handleSmartDialogValueHelp(t, a, r)
        },
        onServManagerTokenUpdate: function (e) {
            var t = e.getSource().getTokens();
            if (t.length === 0 || e.getParameters().type === "removed") {
                e.getSource().setTokens([])
            }
            this.fnBeginButtonValidation()
        },
        onSelectServManager: function (e) {
            if (e.getParameter("selectedRow") !== null) {
                var t = e.getSource();
                t.setTokens([]);
                var a = e.getParameter("selectedRow").getBindingContext().getObject();
                var r = this.formatNameAndValuePair(a.PartnerName, a.Partner);
                var n = new sap.m.Token({
                    key: a.Partner,
                    text: r
                });
                t.setTokens([n]);
                t.fireTokenUpdate()
            }
        },
        handleServManagerSuggest: function (e) {
            var t = e.getParameter("suggestValue");
            var a = [];
            if (t) {
                a.push(new i({
                    filters: [new i({
                        path: "Partner",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: t
                    }), new i({
                        path: "PartnerName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: t
                    })],
                    and: false
                }))
            }
            e.getSource().getBinding("suggestionRows").filter(a);
            e.getSource().getBinding("suggestionRows").resume()
        },
        onInsurancePartnerLinkPress: function (e) {
            var t = this;
            var a = {};
            var r = t.getView().getModel("mCustIdentification");
            var n = r.getData();
            if (t.byId("SmartTableSalesArea").getTable().getSelectedItem()) {
                var o = t.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext().getObject();
                var s = e.getSource();
                var l = e.getSource().getText();
                var u = [];
                u.push(new i("Equipment", "EQ", n.Equipment));
                u.push(new i("InsurancePartner", "EQ", l));
                u.push(new i("SalesOrganization", "EQ", o.SalesOrganization));
                u.push(new i("DistrChannel", "EQ", o.DistrChannel));
                u.push(new i("Division", "EQ", o.Division));
                s.setBusy(true);
                t.getView().getModel().read("/ZAE_C_T_EQUS_INS_01", {
                    filters: u,
                    success: function (e) {
                        s.setBusy(false);
                        if (e.results.length > 0) {
                            a = e.results[0];
                            r.setProperty("/InsuranceDetails/MoreInfo", a);
                            t._openInsurancePopup(s, t)
                        } else {
                            sap.m.MessageToast.show("No data found..!")
                        }
                    },
                    error: function (e) {
                        s.setBusy(false)
                    }
                })
            }
        },
        _openInsurancePopup: function (e, t) {
            var a = e,
                r = this.getView();
            if (!this._oInsurancePopover) {
                this._oInsurancePopover = sap.ui.xmlfragment("com.globalintelli.ZAE_SCIN_NEW.fragment.InsurancePartnerCreditInfo", t);
                t.getView().addDependent(this._oInsurancePopover)
            }
            this._oInsurancePopover.openBy(a)
        },
        onBeforeRebindServiceContract: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            if (!t) {
                return
            }
            var a = t.getData();
            var r = [];
            var n;
            var i = e.getParameter("bindingParams");
            if (this.ServiceContract) {
                i.preventTableBind = false;
                n = new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, a.customerInfo.Equipment);
                r.push(n);
                i.filters = r;
                i.parameters.select = i.parameters.select + ",SalesContract,ContractStatusCriti_new,ContractStatus_new";
                var o = [];
                o.push(new sap.ui.model.Sorter({
                    path: "SalesContract",
                    descending: true
                }));
                i.sorter = o
            } else {
                i.preventTableBind = true
            }
        },
        onPressLoadServiceContract: function () {
            this.ServiceContract = true;
            this.getView().byId("IdServiceContract").rebindTable()
        },
        fnServiceContract: function (e) {
            var t = this.getView().getModel("i18n").getResourceBundle().getText("OldServiceContract");
            var a = this.getView().getModel("i18n").getResourceBundle().getText("ServiceContract");
            return e === "CTOT" ? t : a
        },
        onFilterSearch: function (e) {
            var t = e.getParameter("query");
            var a = this.getView().byId("SmartTableContactPersonList");
            var r = a.getTable();
            var n = r.getBinding("items");
            if (t) {
                var s = new i("ContactPerson", o.Contains, t);
                var l = new i("ContactPersonName", o.Contains, t);
                var u = new i({
                    filters: [s, l],
                    and: false
                });
                n.filter([u])
            } else {
                n.filter([])
            }
        },
        onClickDisplayChangeLog: function (e) {
            var t = this;
            var a = this.getView().getModel("mCustIdentification").getProperty("/customerInfo/to_CurrentOwner");
            var r = "BP  ";
            r = a.Person !== "" ? r + a.Person.padStart(10, "0") : r;
            r = a.AddressID !== "" ? r + a.AddressID.padStart(10, "0") : r;
            var n = {
                serviceDocGUID: r,
                serviceDocumentDate: new Date((new Date).getFullYear() - 1, (new Date).getMonth(), (new Date).getDate())
            };
            t.oExtensionAPI = this;
            t.oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            t.onOpenChangeDocDialog(t, e, n)
        },
        onOpenChangeDocDialog: function (e, a, r) {
            this.sSalesDocumentId = r.serviceDocGUID;
            this.sCreationTime = r.serviceDocumentDate;
            var n = this;
            var i = sap.ui.getCore().byId("BPChangeDocDialog--ChangeDocDialog");
            if (!i) {
                e.changeDocPromise = e.changeDocPromise || t.load({
                    id: "BPChangeDocDialog",
                    name: "sap.cus.sd.lib.slsdoc.manage.reuse.view.changeDoc",
                    controller: e
                });
                e.changeDocPromise.then(function (t) {
                    e.getView().addDependent(t);
                    n._loadContent(e, t)
                })
            } else {
                e.getView().addDependent(i);
                n._loadContent(e, i)
            }
        },
        onChangeDocButtonClose: function (e) {
            var t = this;
            var a = e.getSource().getParent();
            a.close();
            t.getView().removeDependent(a)
        },
        _getObjectById: function (e, t) {
            return sap.ui.core.Fragment.byId(e, t)
        },
        _loadContent: function (e, t) {
            var a = this._getObjectById("BPChangeDocDialog", "ChangeDocControlContainer");
            a.setComponent(e.oComp);
            e.oComp.getObjectId()[0] = this.sSalesDocumentId;
            e.oComp.setStartDate(this.sCreationTime);
            e.oComp.stRefresh();
            t.open()
        },
        _pad: function (e, t, a) {
            var r = a || "0";
            var n = e + "";
            return n.length >= t ? n : new Array(t - n.length + 1).join(r) + n
        },
        onInitChangeDocs: function () {
            this.oComp = sap.ui.getCore().getComponent(sap.ui.core.Fragment.createId("BPChangeDocDialog", "ChangeDocControlComponent"));
            if (this.oComp === undefined) {
                var e = new Date;
                e.setDate(1);
                e.setMonth(1);
                this.oComp = sap.ui.getCore().createComponent({
                    name: "sap.nw.core.changedocs.lib.reuse.changedocscomponent",
                    id: sap.ui.core.Fragment.createId("BPChangeDocDialog", "ChangeDocControlComponent"),
                    settings: {
                        objectClass: ["ADRESSE2", "ADRESSE"],
                        objectId: [],
                        startDate: e,
                        stIsAreaVisible: true
                    }
                });
                this.oComp.init();
                this.oComp.getRootControl().byId("smartTable_ResponsiveTable").attachBeforeRebindTable(this.onBeforeRebindTableDoc)
            }
        },
        onBeforeRebindTableDoc: function (e, t) {
            var a = e.getParameter("bindingParams");
            var r = a.filters.aFilters;
            r.push(new i({
                filters: [new i({
                    path: "DatabaseTable",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: "ADR2"
                }), new i({
                    path: "DatabaseTable",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: "ADR3"
                })],
                and: false
            }));
            r.push(new i({
                filters: [new i({
                    path: "ChangeDocDatabaseTableField",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: "TEL_NUMBER"
                }), new i({
                    path: "ChangeDocDatabaseTableField",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: "FAX_NUMBER"
                }), new i({
                    path: "ChangeDocDatabaseTableField",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: "MOB_NUMBER"
                })],
                and: false
            }));
            a.filters.aFilters = r
        },
        onContactPersonSelectionChange: function (e) {
            var t = this.getView().getModel("mCustIdentification");
            var a = e.getParameter("selected");
            t.setProperty("/contactPersonselected", a)
        }
    })
});