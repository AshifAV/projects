sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter", "sap/m/library", "com/globalintelli/zae_flib/controller/aeUI5Utility", "com/globalintelli/zae_flib/controller/aeUtility/", "sap/m/MessageToast", "sap/ui/core/format/DateFormat", "com/globalintelli/ZAE_MMSA/util/treeFunctions", "sap/ui/core/Fragment", "sap/m/SearchField", "sap/m/Token", "sap/ui/model/type/String", "sap/m/ColumnListItem", "sap/m/Dialog", "sap/m/Button", "sap/m/Text", "sap/m/ButtonType", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function(e, t, a, i, r, l, s, n, o, u, g, d, c, p, h, v, f, m, y, C) {
    "use strict";
    var b = i.URLHelper;
    return e.extend("com.globalintelli.ZAE_MMSA.controller.Detail", {
        formatter: a,
        aeUI5Util: new r,
        treeFunctions: new o,
        aeUtil: new l,
        constant: {
            MaterialPath: "/MaterialVHData"
        },
        onInit: function() {
            this.aeUI5Util.setupMessageManager(this);
            this.aeUI5Util.resetLibrary();
            this.treeFunctions.restLibrary();
            this.aeUtil.resetLibrary();
            var e = new t({
                busy: false,
                delay: 0,
                IsNextenabled: false,
                IsSubmitenabled: false,
                SchemaTransactionType: {},
                customerInfo: {},
                ConcatinatedCategorizationSchemaTreeTableData: [],
                TotalAmount: 0,
                SummaryList: [],
                vServiceRequset: "",
                _MeasuringDocument: [],
                _EquipmentMeasuringPoint: [],
                _ServiceComplaint: [],
                vComplaints: [],
                VisibleData: [],
                nItemData: []
            });
            var a = new t({
                editable: true
            });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(e, "detailView");
            this.setModel(a, "detailViewEdit");
            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
            this.getView().byId("btnSubmit").setVisible(false)
        },
        onSendEmailPress: function() {
            var e = this.getModel("detailView");
            b.triggerEmail(null, e.getProperty("/shareSendEmailSubject"), e.getProperty("/shareSendEmailMessage"))
        },
        onShareInJamPress: function() {
            var e = this.getModel("detailView"),
                t = sap.ui.getCore().createComponent({
                    name: "sap.collaboration.components.fiori.sharing.dialog",
                    settings: {
                        object: {
                            id: location.href,
                            share: e.getProperty("/shareOnJamTitle")
                        }
                    }
                });
            t.open()
        },
        _onObjectMatched: function(e) {
            var t = e.getParameter("arguments").objectId;
            var a = e.getParameter("arguments").ProcessType;
            var i = this.getModel("detailView");
            this.onNextButtoncheck();
            i.setProperty("/SummaryList", []);
            i.setProperty("/vComplaints", []);
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getModel().metadataLoaded().then(function() {
                var e = this.getModel().createKey("ZAE_I_ServiceRequest_03", {
                    ServiceRequest: t,
                    ServiceObjectType: "BUS2000223"
                });
                this._bindView("/" + e)
            }.bind(this));
            var r = a === "ZSRW" ? "to_WorkList2" : "to_WorkList";
            this.getView().byId("idPreviousmesauringKMS").setBusy(true);
            this.getView().byId("idPreviousmesauringHRS").setBusy(true);
            this.getView().getModel().read("/ZAE_I_ServiceRequest_03(ServiceObjectType='BUS2000223',ServiceRequest='" + t + "')", {
                urlParameters: {
                    $expand: ["to_MeasuringDocument", "to_EquipmentMeasuringPoint", "to_ServiceComplaint", "to_EquipmentRecall", r]
                },
                success: function(e) {
                    var t = this.getView().getBindingContext().getObject();
                    var a = this.getView().getModel("appView").getData().Role;
                    this._fnVisibleFields(a);
                    this.getView().byId("idPreviousmesauringKMS").setBusy(false);
                    this.getView().byId("idPreviousmesauringHRS").setBusy(false);
                    if (e.to_MeasuringDocument.results.length > 0) {
                        var r = e.to_MeasuringDocument.results;
                        var l = [],
                            s = [],
                            n = false,
                            o = false,
                            u, g;
                        for (var d = 0; d < r.length; d++) {
                            if (r[d].MeasurementPosition === "KILOMETER") {
                                l.push(r[d]);
                                n = true
                            } else if (r[d].MeasurementPosition === "HRS") {
                                s.push(r[d]);
                                o = true
                            }
                        }
                        if (n) {
                            var c = l.length;
                            for (var d = 0; d < c; d++) {
                                for (var p = 0; p < c - 1; p++) {
                                    if (Number(l[p].MeasuringDocument) > Number(l[p + 1].MeasuringDocument)) {
                                        var h = l[p];
                                        l[p] = l[p + 1];
                                        l[p + 1] = h
                                    }
                                }
                            }
                            u = l[l.length - 1];
                            this.getView().byId("idLabelKMS").setVisible(true);
                            this.getView().byId("idPreviousmesauringKMS").setText(u.MeasuringReading + " " + u.MeasuringUnit)
                        } else {
                            this.getView().byId("idLabelKMS").setVisible(false)
                        }
                        if (o) {
                            var c = s.length;
                            for (var d = 0; d < c; d++) {
                                for (var p = 0; p < c - 1; p++) {
                                    if (Number(s[p].MeasuringDocument) > Number(s[p + 1].MeasuringDocument)) {
                                        var h = s[p];
                                        s[p] = s[p + 1];
                                        s[p + 1] = h
                                    }
                                }
                            }
                            g = s[s.length - 1];
                            this.getView().byId("idLabelHRS").setVisible(true);
                            this.getView().byId("idPreviousmesauringHRS").setText(g.MeasuringReading + " " + g.MeasuringUnit)
                        } else {
                            this.getView().byId("idLabelHRS").setVisible(false)
                        }
                    }
                    if (e.to_ServiceComplaint.results.length > 0) {
                        var v = [];
                        for (var d = 0; d < e.to_ServiceComplaint.results.length; d++) {
                            var f = {
                                ItemNumber: 10 * (d + 1),
                                Complaint: e.to_ServiceComplaint.results[d].ComplaintCode,
                                ComplaintDescription: e.to_ServiceComplaint.results[d].ComplainCodeDescription,
                                Material: e.to_ServiceComplaint.results[d].Material,
                                Quantity: e.to_ServiceComplaint.results[d].Quantity,
                                QuantityUnit: e.to_ServiceComplaint.results[d].ProcessQtyUnit,
                                NetPrice: e.to_ServiceComplaint.results[d].EstPrice,
                                Tax: e.to_ServiceComplaint.results[d].Tax,
                                TotalPrice: e.to_ServiceComplaint.results[d].TotalPrice,
                                Currency: e.to_ServiceComplaint.results[d].Currency,
                                Enabled: false
                            };
                            if (e.to_ServiceComplaint.results[d].Material) {
                                f["MaterialVHData"] = [{
                                    Material: e.to_ServiceComplaint.results[d].Material,
                                    MaterialName: e.to_ServiceComplaint.results[d].MaterialName
                                }]
                            } else {
                                f["MaterialVHData"] = []
                            }
                            v.push(f)
                        }
                        v.push({
                            ItemNumber: (v.length + 1) * 10,
                            Complaint: "",
                            ComplaintKey: "",
                            ComplaintDescription: "",
                            ItemCatUsage: "",
                            Material: "",
                            MaterialVHData: [],
                            Quantity: "",
                            QuantityUnit: "",
                            NetPrice: 0,
                            Tax: 0,
                            TotalPrice: 0,
                            Currency: "",
                            Enabled: true
                        });
                        i.setProperty("/vComplaints", v)
                    }
                    if (e.to_EquipmentMeasuringPoint.results.length > 0) {
                        i.setProperty("/_EquipmentMeasuringPoint", e.to_EquipmentMeasuringPoint.results)
                    }
                    var m = e.ServiceDocumentType === "ZSRW" ? e.to_WorkList2.results : e.to_WorkList.results;
                    if (m.length > 0) {
                        var y = [];
                        for (var d = 0; d < m.length; d++) {
                            var f = {
                                cat_label: m[d].cat_label,
                                cat_id: m[d].cat_id,
                                cat_desc: m[d].cat_desc,
                                net_value_h: m[d].net_value_h,
                                currency: m[d].currency,
                                Stat: "E0002"
                            };
                            y.push(f)
                        }
                        i.setProperty("/SummaryList", y)
                    }
                    var C = this.getView().byId("ObjectStatusRecall");
                    var b = false,
                        V = false,
                        S = false,
                        w = 0,
                        I = 0;
                    var P = "Indication01";
                    var M = "";
                    var T = false;
                    var _ = [];
                    if (e.to_EquipmentRecall.results.length > 0) {
                        for (var d = 0; d < e.to_EquipmentRecall.results.length; d++) {
                            var D = e.to_EquipmentRecall.results[d];
                            if (D.WarrantyClaim !== "" && D.ServiceOrder !== "") {
                                I = I + 1
                            } else if (D.WarrantyClaim !== "") {
                                w = w + 1;
                                _.push(D)
                            }
                        }
                        S = I === e.to_EquipmentRecall.results.length ? true : false;
                        V = w > 0 ? true : false
                    } else {
                        b = true
                    }
                    if (b) {
                        P = "Indication02";
                        M = "No Recall";
                        T = false
                    } else if (V) {
                        P = "Indication02";
                        M = "Recall Pending";
                        T = true
                    } else if (S) {
                        P = "Indication04";
                        M = "Recall Completed";
                        T = false
                    }
                    C.setText(M);
                    C.setState(P)
                }.bind(this),
                error: function(e) {}
            })
        },
        _fnVisibleFields: function(e) {
            var t = this;
            var a = t.getView().getBindingContext().getObject();
            var i = this.getModel("detailView");
            i.setProperty("/VisibleData", []);
            var r = [];
            r.push(new sap.ui.model.Filter({
                path: "ProcessType",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: a.ServiceDocumentType
            }));
            r.push(new sap.ui.model.Filter({
                path: "MsaRole",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: e
            }));
            r.push(new sap.ui.model.Filter({
                path: "VehSts",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: a.StatusForVehicle
            }));
            r.push(new sap.ui.model.Filter({
                path: "SalesOrg",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: a.SalesOrganization
            }));
            r.push(new sap.ui.model.Filter({
                path: "SalesOffice",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: a.SalesOffice
            }));
            r.push(new sap.ui.model.Filter({
                path: "SalesGrp",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: a.SalesGroup
            }));
            t.getView().getModel().read("/ZAE_I_ServiceAdvsiorRole_01", {
                filters: r,
                success: function(e, a) {
                    var r = [];
                    if (e.results.length > 0) {
                        r = e.results
                    } else {
                        r.push({
                            ChkAccAvl: false,
                            ChkCompCode: false,
                            ChkCustSign: false,
                            ChkDelivDate: false,
                            ChkFuelgauge: false,
                            ChkNote: false,
                            ChkPicNote: false,
                            ChkPicVid: false,
                            ChkVehCond: false,
                            ChkWrkReqSc: false
                        })
                    }
                    i.setProperty("/VisibleData", r[0]);
                    t.onNextButtoncheck()
                },
                error: function(e) {}
            })
        },
        _bindView: function(e) {
            var t = this.getModel("detailView");
            t.setProperty("/busy", false);
            this.getView().bindElement({
                path: e,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function() {
                        t.setProperty("/busy", true)
                    },
                    dataReceived: function(e) {
                        t.setProperty("/busy", false)
                    }
                }
            });
            var a = this.getView().byId("idVBoxCheckList").getItems();
            a.forEach(function(e) {
                e.setSelected(false)
            });
            this.getView().byId("idFuelSelect").setSelectedItem(null);
            this.getView().byId("idvehiclecondition").setSelectedItem(null);
            this.getView().byId("idOdometer").setValue(null);
            this.getView().byId("idOdometer").setValueState("None");
            this.getView().byId("idHRS").setValue(null);
            this.getView().byId("idnotes").setValue(null);
            this.getView().byId("idV2").setVisible(false);
            this.getView().byId("idV3").setVisible(false);
            this.getView().byId("idV4").setVisible(false);
            this.getView().byId("DP2").setValue(null);
            this.onNextButtoncheck();
            this.getView().byId("btnSubmit").setVisible(false);
            this.getView().byId("btnYrdOpr").setVisible(true);
            t.setProperty("/IsNextenabled", false)
        },
        _onBindingChange: function() {
            var e = this.getView(),
                t = e.getElementBinding();
            if (!t.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                this.getOwnerComponent().oListSelector.clearMasterListSelection();
                return
            }
            var a = t.getPath(),
                i = this.getResourceBundle(),
                r = e.getModel().getObject(a),
                l = r.ServiceRequest,
                s = r.ServiceObjectType,
                n = r.ServiceDocumentDescription,
                o = r.SchemaID,
                u = this.getModel("detailView");
            this.getOwnerComponent().oListSelector.selectAListItem(a);
            this.getModel("detailView").setProperty("/vServiceRequset", l);
            this.getModel("detailView").setProperty("/vComplaints", [{
                ItemNumber: 10,
                Complaint: "",
                ComplaintKey: "",
                ComplaintDescription: "",
                ItemCatUsage: "",
                Material: "",
                MaterialVHData: {},
                Quantity: "",
                QuantityUnit: "",
                NetPrice: 0,
                Tax: 0,
                TotalPrice: 0,
                Currency: "",
                Enabled: true
            }]);
            this.getModel("detailViewEdit").setProperty("/editable", true);
            this.getView().byId("idAddComplaint").setEnabled(true);
            u.setProperty("/saveAsTileTitle", i.getText("shareSaveTileAppTitle", [n]));
            u.setProperty("/shareOnJamTitle", n);
            u.setProperty("/shareSendEmailSubject", i.getText("shareSendEmailObjectSubject", [l]));
            u.setProperty("/shareSendEmailMessage", i.getText("shareSendEmailObjectMessage", [n, l, location.href]))
        },
        _onMetadataLoaded: function() {
            var e = this.getView().getBusyIndicatorDelay(),
                t = this.getModel("detailView");
            t.setProperty("/delay", 0);
            t.setProperty("/busy", true);
            t.setProperty("/delay", e)
        },
        onCloseDetailPress: function() {
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            this.getOwnerComponent().oListSelector.clearMasterListSelection();
            this.getRouter().navTo("master")
        },
        toggleFullScreen: function() {
            var e = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !e);
            if (!e) {
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen")
            } else {
                this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"))
            }
        },
        treeStructure: function() {
            var e = {};
            var t = this;
            var a = this.getView();
            var i = t.getView().getModel("detailView").getData();
            var r = this.getView().getBindingContext().getObject();
            var l = r.Equipment;
            var s = r.ServiceOrganization;
            i.ConcatinatedCategorizationSchemaTreeTableData = [];
            var n = "/GET_SCHEMA_HEADER_DATASet";
            var o = {
                GET_SCHEMA_INPUT: [{
                    Equipment: l,
                    Plant: s
                }],
                GET_SCHEMA_OUTPUT: [{
                    Schemaid: ""
                }]
            };
            t.getView().byId("idTreeTable").setBusy(true);
            this.getView().getModel().create(n, o, {
                success: function(r, s) {
                    if (r.GET_SCHEMA_OUTPUT.results.length > 0) {
                        var n = [];
                        n.push(new sap.ui.model.Filter({
                            path: "Equipment",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: l
                        }));
                        t.getView().getModel().read("/ZAE_I_Equipment_04", {
                            filters: n,
                            urlParameters: {
                                $expand: ["to_ServiceContractNew", "to_ServiceContractNew/to_Item_01", "to_EquipmentRecall"]
                            },
                            success: function(l, s) {
                                var n = {};
                                if (l.results.length > 0) {
                                    n = l.results[0]
                                }
                                for (var o = 0; o < r.GET_SCHEMA_OUTPUT.results.length; o++) {
                                    var u = r.GET_SCHEMA_OUTPUT.results[o].Schemaid;
                                    var g = 0;
                                    e[u] = $.Deferred(function(e) {
                                        t.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
                                            urlParameters: {
                                                $filter: "asp_id  eq '" + u + "'",
                                                $orderby: "cat_id"
                                            },
                                            success: function(r, l) {
                                                t.getView().byId("idTreeTable").setBusy(false);
                                                if (r.results.length > 0) {
                                                    var s = r.results[0].asp_id;
                                                    var o = t.aeUI5Util.genParentIdWithDiv(r.results, "cat_id", "parentId", "_", 1);
                                                    var u = t.treeFunctions.convertFlatToTree(o, "cat_id", "parentId", s);
                                                    var g;
                                                    var d = n.to_ServiceContractNew.results[0];
                                                    var c = o.filter(e => e.CatIDType !== "").map(e => e.cat_id);
                                                    var p = [];
                                                    var h = o.filter(e => e.CatIDType === "REPR" && (e.CatIDCategory === "18" || e.CatIDCategory === "11" || e.CatIDCategory === "12" || e.CatIDCategory === "26")).map(e => e.cat_id);
                                                    c.forEach(e => {
                                                        const t = e.split("_");
                                                        for (let e = 1; e <= t.length + 1; e++) {
                                                            const a = t.slice(0, e).join("_");
                                                            if (!p.includes(a)) {
                                                                p.push(a)
                                                            }
                                                        }
                                                    });
                                                    if (n.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
                                                        var v = [{
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
                                                        g = t.filterTreeESTOData(u, v, h, o);
                                                        u = g
                                                    }
                                                    var f = [];
                                                    if (n.ConcatenatedActiveSystStsName.search("ECUS") !== -1) {
                                                        f.push({
                                                            SrviceSchemaQualifier: "REPR",
                                                            CatIDCategory: "18"
                                                        })
                                                    }
                                                    if (n.ContractStatus_new === "CTIN" && d && d.to_Item_01.results.length > 0 && d.SrviceSchemaQualifier === "CTIN" && d.to_Item_01.results[0].Material) {
                                                        var m = d.SalesContractType === "ZUMC" ? d.to_Item_01.results[0].ReferenceMaterial : d.to_Item_01.results[0].Material;
                                                        f.push({
                                                            SrviceSchemaQualifier: "CTOT",
                                                            CatIDCategory: ""
                                                        });
                                                        if (d.CatIDCategory) {
                                                            f.push({
                                                                SrviceSchemaQualifier: "CTIN",
                                                                CatIDCategory: Number(d.CatIDCategory) === 1 ? "2" : "1"
                                                            })
                                                        }
                                                        g = t.filterTreeData(u, s + "_S", f, m, p, o)
                                                    } else {
                                                        f.push({
                                                            SrviceSchemaQualifier: "CTIN",
                                                            CatIDCategory: ""
                                                        });
                                                        g = t.filterTreeData(u, s + "_S", f, m, p, o)
                                                    }
                                                    var y = n.to_EquipmentRecall.results;
                                                    t.addRecallToSummary(g, y);
                                                    g = t.filterTreeRecallData(g, y);
                                                    if (d) {
                                                        if (d.to_Item_01.results[0].MaterialFrom && d.to_Item_01.results[0].MaterialTo) {
                                                            g = t.filterTreeMaterialKM(g, d)
                                                        }
                                                    }
                                                    i.ConcatinatedCategorizationSchemaTreeTableData = i.ConcatinatedCategorizationSchemaTreeTableData.concat(g);
                                                    t._initTreeValueHelpDialog(a, i.ConcatinatedCategorizationSchemaTreeTableData)
                                                }
                                                e.resolve()
                                            },
                                            error: function() {
                                                t.getView().byId("idTreeTable").setBusy(false);
                                                e.resolve()
                                            }
                                        })
                                    }).promise();
                                    e[u].done(function() {
                                        g++;
                                        if (Object.keys(e).length === g) {
                                            t._initTreeValueHelpDialog(a, i.ConcatinatedCategorizationSchemaTreeTableData)
                                        }
                                    })
                                }
                            },
                            error: function(e) {
                                t.getView().byId("idTreeTable").setBusy(false)
                            }
                        })
                    } else {
                        sap.m.MessageToast.show(t.getView().getModel("i18n").getResourceBundle().getText("Categorizheavailable"));
                        t.getView().byId("idTreeTable").setBusy(false)
                    }
                },
                error: function(e) {
                    t.getView().byId("idTreeTable").setBusy(false)
                }
            })
        },
        filterTreeESTOData: function(e, t, a, i) {
            var r = e;
            if (r && r.length > 0) {
                var l = function(e) {
                    var t = 0;
                    a.forEach(a => {
                        if (a === e) {
                            t = t + 1
                        }
                    });
                    return t > 0
                };
                var s = function(e) {
                    return e.filter(function(e) {
                        var a = e;
                        var i = a.cat_id;
                        if (a.children) {
                            a.children = s(a.children)
                        }
                        var r = false;
                        for (var n = 0; n < t.length; n++) {
                            if (t[n].CatIDCategory === a.CatIDCategory && t[n].SrviceSchemaQualifier === a.CatIDType) {
                                r = true
                            } else if (!a.CatIDCategory) {
                                r = true
                            }
                        }
                        if (r === false && l(a.cat_id)) {
                            return true
                        }
                        return r
                    })
                };
                r = s(r)
            }
            return r
        },
        filterTreeMaterialKM: function(e, t) {
            function a(e, i) {
                var r = 0;
                var l = [];
                var s = false;
                while (r < e.length) {
                    if (e[r].children && e[r].children.length > 0) {
                        if (e[r].cat_desc === "CTIN" || e[r].children && e[r].cat_desc === "CTOT" || i) {
                            e[r].children = a(e[r].children, true)
                        } else {
                            e[r].children = a(e[r].children)
                        }
                    } else if (i) {
                        s = true;
                        l = e.filter(function(e) {
                            var a = e;
                            if (a.msitem && t.to_Item_01.results && t.to_Item_01.results.length > 0) {
                                var i = a.msitem.replace(/[^0-9.]+/g, "");
                                i = parseFloat(i);
                                if (isNaN(i)) {
                                    i = 0
                                }
                                var r = t.to_Item_01.results[0].FromMsItem.replace(/[^0-9.]+/g, "");
                                var l = t.to_Item_01.results[0].ToMsItem.replace(/[^0-9.]+/g, "");
                                if (r && l && i >= parseFloat(r) && i <= parseFloat(l)) {
                                    return true
                                } else {
                                    return false
                                }
                            } else {
                                return false
                            }
                        })
                    }
                    r++
                }
                if (s) {
                    e = l
                }
                return e
            }
            return a(e)
        },
        convertFlatToTree: function(e, t, a, i) {
            var r = [];
            var l = [];
            var s = {};
            e.forEach(function(i) {
                if (!i[a]) {
                    l.push(i);
                    return
                }
                var r = s[i[a]];
                if (typeof r !== "string") {
                    r = e.findIndex(function(e) {
                        return e[t] === i[a]
                    });
                    s[i[a]] = r
                }
                if (!e[r].children) {
                    e[r].children = [i];
                    return
                }
                e[r].children.push(i)
            });
            r.push({
                cat_id: i,
                cat_label: i,
                children: l
            });
            return r
        },
        _initTreeValueHelpDialog: function(e, t) {
            var a = this.getView().byId("idTreeTable");
            var i = new sap.ui.model.json.JSONModel;
            i.setData(t);
            a.setModel(i);
            a.bindRows({
                path: "/",
                parameters: {
                    arrayNames: ["children"]
                }
            });
            a.addEventDelegate({
                onAfterRendering: function(e) {
                    this.getRows().forEach(function(e) {
                        if (e.getBindingContext()) {
                            var t = e.getBindingContext("undefined").getObject();
                            var i = t.children && t.children.length > 0;
                            var r = e.sId.split("-")[e.sId.split("-").length - 1];
                            var l = r.substring(3, r.length);
                            var s = a.getId() + "-rowsel" + l;
                            if (i) {
                                $(document.getElementById(s)).addClass("disabledbutton")
                            } else {
                                $(document.getElementById(s)).removeClass("disabledbutton")
                            }
                        }
                    })
                }
            }, a);
            var r = function() {
                a.rerender()
            };
            a.attachModelContextChange(r);
            a.attachToggleOpenState(r);
            a.attachBusyStateChanged(r);
            a.attachFirstVisibleRowChanged(r)
        },
        filterTreeData: function(e, t, a, i) {
            var r = e;
            if (r && r.length > 0) {
                var l = function(e) {
                    return e.filter(function(e) {
                        var t = e;
                        return t.Material === i
                    })
                };
                var s = function(e) {
                    return e.filter(function(e) {
                        var r = e;
                        if (r.children) {
                            r.children = s(r.children)
                        }
                        if (i && r.CatIDType === "CTIN" && (r.CatIDCategory === "01" || r.CatIDCategory === "02") && r.children) {
                            r.children = l(r.children)
                        }
                        var n = true;
                        for (var o = 0; o < a.length; o++) {
                            if (a[o].CatIDCategory === "" && a[o].SrviceSchemaQualifier === r.CatIDType) {
                                n = false
                            } else if (a[o].CatIDCategory === r.CatIDCategory && a[o].SrviceSchemaQualifier === r.CatIDType) {
                                n = false
                            }
                        }
                        return r.parentId !== t || r.SrviceSchemaQualifier === "" || n
                    })
                };
                r = s(r)
            }
            return r
        },
        filterTreeData_old: function(e, t, a, i) {
            var r = e;
            if (r && r.length > 0) {
                var l = function(e) {
                    return e.filter(function(e) {
                        var t = e;
                        return t.Material === i
                    })
                };
                var s = function(e) {
                    return e.filter(function(e) {
                        var r = e;
                        if (r.children) {
                            r.children = s(r.children)
                        }
                        if (i && r.cat_desc === "CTIN" && r.children) {
                            r.children = l(r.children)
                        }
                        return r.parentId !== t || r.cat_desc === "" || a.includes(r.cat_desc)
                    })
                };
                r = s(r)
            }
            return r
        },
        fnProcessCatSchema: function(e, t) {
            var a = this;
            e.setBusy(false);
            var i = "cat_id";
            var r = "cat_label";
            var l = this.getView().byId("idV2");
            var s = function(e) {
                if (e.heir_level === 3 || e.heir_level === 4) {
                    if (e.isServiced) {
                        return {
                            pass: false,
                            msg: a.aeUI5Util.geti18nText(a, "TREE_TABLE_SELECTION_CMP"),
                            type: "Success"
                        }
                    }
                } else {
                    return {
                        pass: false,
                        msg: a.aeUI5Util.geti18nText(a, "TREE_TABLE_SELECTION"),
                        type: "Error"
                    }
                }
            }.bind(this);
            a.handleTreeValueHelp(a, e, l, i, r, t, s)
        },
        onSearchTreeTable: function(e) {
            var t = e.getSource().getParent().getParent().getParent();
            if (e.getParameters().refreshButtonPressed) {
                this.onRefresh(t);
                t.collapseAll();
                return
            }
            var a = e.getParameter("query");
            var i = [];
            if (a) {
                i.push(new y({
                    filters: [new y({
                        path: "cat_id",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    }), new y({
                        path: "cat_label",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: a
                    })],
                    and: false
                }))
            }
            t.getBinding("rows").filter(i);
            if (i.length > 0) {
                t.expandToLevel(3)
            } else {
                t.collapseAll()
            }
        },
        onRefresh: function(e) {
            e.getBinding("rows").refresh()
        },
        onSelectTreeTableRow: function(e) {
            if (!e.getParameter("rowContext")) {
                return
            }
            var t = this.getView().byId("DP2").getValue();
            var a = [];
            var i = e.getSource();
            var r = e.getSource().getSelectedIndices();
            var l = e.getSource().isIndexSelected(e.getParameter("rowIndex"));
            var s = e.getParameter("rowContext").getObject();
            var n = true;
            for (var o = 0; o < r.length; o++) {
                var u = i.getContextByIndex(r[o]);
                var g = i.getModel().getProperty(u.getPath());
                a.push(g);
                if (l) {
                    if (a[o].children) {
                        var d = this.getView().byId("CategoryTreeVHMessageStrip");
                        d.setVisible(true);
                        d.setText("Selection Not Allowed For This Level");
                        d.setType("Error");
                        n = false
                    }
                } else if (!l) {
                    if (a[o].children) {
                        d = this.getView().byId("CategoryTreeVHMessageStrip");
                        d.setVisible(true);
                        d.setText("Selection Not Allowed For This Level");
                        d.setType("Error");
                        n = false
                    }
                }
            }
            if (!n) {
                this.onSubmitButtonCheck()
            } else {
                d = this.getView().byId("CategoryTreeVHMessageStrip");
                d.setVisible(false)
            }
            var c = this.getView().getModel();
            var p = this.getView().byId("idTreeTable");
            var h = p.getBinding().getSelectedContexts();
            var s = p.isIndexSelected(e.getParameter("rowIndex"));
            var v = e.getParameter("rowContext").getObject().cat_id;
            var f = this.getView().getModel("detailView").getData().SummaryList;
            if (s) {
                h.forEach(function(e) {
                    var t = e.getModel();
                    var a = e.getPath();
                    var i = t.getProperty(a);
                    var r = f.findIndex(function(e) {
                        return e.cat_id === i.cat_id
                    });
                    if (r === -1) {
                        f.push(i)
                    }
                })
            } else {
                for (var o = 0; o < f.length; o++) {
                    if (f[o].cat_id === v) {
                        f.splice(o, 1)
                    }
                }
            }
            this.getModel("detailView").updateBindings(true);
            var m = this.getView().byId("DP2").getValue();
            var y = true;
            var C = this.getView().getModel("detailView").getData();
            C.vComplaints.forEach(function(e, t) {
                if (C.VisibleData.ChkCompCode === "3") {
                    if ((e.Complaint === "" || e.ComplaintDescription === "" || e.ComplainType === "R" && e.Material === "" || e.ComplainType === "R" && e.Quantity === "") && e.Enabled === true) {
                        y = false
                    }
                }
            });
            if (f.length === 0 || n === false || y === false) {
                this.onSubmitButtonCheck()
            } else {
                this.onSubmitButtonCheck()
            }
            this.getView().byId("btnSubmit").setVisible(true);
            this.getView().byId("btnYrdOpr").setVisible(false);
            this.getModel("detailView").refresh(true)
        },
        onLivechageOdometerValidation: function() {
            var e = this.getView().byId("idOdometer").getValue();
            if (e > 1e8 || e < 0) {
                this.getView().byId("idOdometer").setValueState("Error")
            } else {
                this.getView().byId("idOdometer").setValueState("None")
            }
            this.onNextButtoncheck()
        },
        onClickNxt: function() {
            var e = this;
            var t = this.getView().byId("idOdometer").getValue();
            var a = this.getView().byId("idPreviousmesauringKMS").getText();
            var i = "";
            if (a) {
                i = a.split(" ")[1]
            } else {
                a = this.getView().byId("idPreviousmesauringHRS").getText();
                i = a.split(" ")[1]
            }
            t = t + " " + i;
            var r = this.getView().getModel("i18n").getResourceBundle();
            sap.m.MessageBox.confirm(r.getText("kmsconfirmationmsg", [a, t]), {
                styleClass: "twentysixpoint",
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function(t) {
                    if (t === "OK") {
                        e._fnNextClicked()
                    }
                }
            })
        },
        _fnNextClicked: function() {
            var e = this;
            var t = e.getView().getModel("detailView").getData().VisibleData;
            var a = this.getView().byId("idOdometer").getValue();
            if (t.CaptOdomenter === "3" || a !== "") {
                var i = this.getView().getModel();
                var r = "ZAE_FM_SMSA_EQU_ADD_MEA_DOC_SRSet";
                var l = this.getView().getBindingContext().getObject().ServiceRequest;
                var s = this.getView().getBindingContext().getObject().Equipment;
                var n = this.getView().byId("idHRS").getValue();
                var o = [{
                    callProperty: "ServiceRequest",
                    value: l
                }, {
                    callProperty: "Equnr",
                    value: s
                }, {
                    callProperty: "RecordedValue",
                    value: n
                }, {
                    callProperty: "RecordedValueKm",
                    value: a
                }];
                var u = function(t) {
                    e._fnEnabledSubmit()
                };
                var g = function(e) {};
                this.aeUI5Util.createCall(e, i, r, o, u, g)
            } else {
                e._fnEnabledSubmit()
            }
        },
        _fnEnabledSubmit: function() {
            var e = this;
            e.treeStructure();
            var t = e.getView().getModel("detailView").getData().VisibleData;
            if (t.ChkWrkReqSc !== "1") {
                e.getView().byId("idV2").setVisible(true);
                e.getView().byId("idV4").setVisible(true)
            }
            if (t.ChkDelivDate !== "1") {
                e.getView().byId("idV3").setVisible(true)
            }
            e.getView().byId("btnYrdOpr").setVisible(false);
            e.getView().byId("btnSubmit").setVisible(true);
            var a = e.getView().getModel("appView").getData().Role;
            if (a === "1") {
                e.getView().byId("btnSubmit").setEnabled(true);
                return
            }
            e.onSubmitButtonCheck();
            var i = e.getView().getModel("detailViewEdit");
            i.setProperty("/editable", true);
            e.getView().byId("idAddComplaint").setEnabled(true)
        },
        onProductValueHelpRequested: function(e) {
            var t = this;
            var a = t.getView().getBindingContext().getObject();
            var i = e.getSource().getParent();
            var r = i.getParent();
            var l = r.indexOfItem(i);
            var s = t.getView().byId("idItemListListTable");
            var n = s.getAggregation("items");
            var o = n[l].getAggregation("cells")[3].setBusy(true);
            var u = r.getItems();
            for (var g = 0; g < u.length; g++) {
                if (l === g) {
                    var d = u[g].getParent().getBinding("items").oList[g].Complaint
                }
            }
            var c = [];
            if (d) {
                c.push({
                    key: d
                })
            }
            var p = Array.from(new Set(c.map(JSON.stringify))).map(JSON.parse);
            var h = e.getSource();
            h.setTokens([]);
            var v = {
                entitySet: "ZAE_I_MaterialChar_LAB",
                initiallyVisibleFields: "Material,MaterialType,Characteristic,CharacteristicValue,MaterialBaseUnit",
                selectionMode: "Single",
                tokenObject: {
                    key: "Material",
                    Description: "MaterialName"
                },
                controlConfiguration: [{
                    index: 0,
                    key: "CharacteristicValue",
                    filterType: "auto",
                    label: "{i18n>ComplaintCode}",
                    mandatory: "mandatory",
                    visible: true
                }, {
                    index: 2,
                    key: "Material",
                    filterType: "auto",
                    label: "{i18n>Material}",
                    mandatory: "auto",
                    visible: true
                }, {
                    index: 3,
                    key: "MaterialName",
                    filterType: "auto",
                    label: "{/#ZAE_I_MaterialChar_LABType/MaterialName/@sap:label}",
                    mandatory: "auto",
                    visible: true
                }],
                defaultFilter: {},
                onBeforeRebindSmartTable: function(e) {
                    var t = e.getParameter("bindingParams").filters;
                    e.getParameter("bindingParams").filters = t
                }
            };
            if (p.length > 0) {
                v.defaultFilter = {
                    CharacteristicValue: {
                        items: [{
                            key: d
                        }]
                    }
                }
            }
            t.aeUtil.handleSmartDialogValueHelp(t, h, v);
            o.setBusy(false)
        },
        formatNameAndValuePair: function(e, t) {
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
        onSelectMaterial: function(e) {
            var t = this;
            if (e.getParameter("selectedRow") !== null) {
                var a = this.getView().byId("idItemListListTable").getItems();
                var i = e.getSource();
                i.setTokens([]);
                var r = e.getParameter("selectedRow").getBindingContext().getObject();
                var l = this.formatNameAndValuePair(r.MaterialName, r.Material);
                var s = new sap.m.Token({
                    key: r.Material,
                    text: l
                });
                i.setTokens([s]);
                i.setValue();
                var n = e.getSource().getParent().oBindingContexts;
                var o = n["detailView"].getPath();
                var u = n["detailView"].getModel();
                e.getSource().setSelectedKey(r.Material);
                u.setProperty(o + t.constant.MaterialPath, [r]);
                u.setProperty(o + "/Material", r.Material);
                u.setProperty(o + "/QuantityUnit", r.MaterialBaseUnit);
                var g = Number(o.split("/")[2]);
                a[g].getCells()[3].setValueState("None");
                a[g].getCells()[4].setEnabled(true);
                u.updateBindings(true);
                this.fnLoadQuantity(n);
                this.fnTotalPrice(n)
            }
        },
        handleMaterialSuggest: function(e) {
            var t = this;
            var a = t.getView().getBindingContext().getObject();
            var i = e.getSource().getParent();
            var r = i.getParent();
            var l = r.indexOfItem(i);
            var s = r.getItems();
            for (var n = 0; n < s.length; n++) {
                if (l === n) {
                    var o = s[n].getParent().getBinding("items").oList[n].Complaint
                }
            }
            var u = e.getParameter("suggestValue");
            var g = [];
            if (u) {
                g.push(new sap.ui.model.Filter({
                    path: "CharacteristicValue",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: o
                }));
                g.push(new y({
                    filters: [new y({
                        path: "Material",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: u
                    }), new y({
                        path: "MaterialName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: u
                    })],
                    and: false
                }))
            }
            e.getSource().getBinding("suggestionRows").filter(g);
            e.getSource().getBinding("suggestionRows").resume()
        },
        onMaterailTokenUpdate: function(e) {
            var t = this;
            var a = t.getView().byId("idItemListListTable").getItems();
            var i = e.getSource().getTokens();
            var r = e.getSource().getParent().oBindingContexts;
            var l = r["detailView"].getPath();
            var s = r["detailView"].getModel();
            var n = Number(l.split("/")[2]);
            if (i.length === 0 || e.getParameters().type === "removed") {
                e.getSource().setSelectedKey("");
                s.setProperty(l + t.constant.MaterialPath, []);
                s.setProperty(l + "/Material", "");
                if (s.getData().vComplaints[n].ComplainType === "R") {
                    a[n].getCells()[3].setValueState("Error");
                    a[n].getCells()[3].setValueStateText("Select Material")
                }
            } else {
                e.getSource().setSelectedKey(i[0].getProperty("key"));
                var o = i[0].mAggregations.customData[0].getProperty("value");
                s.setProperty(l + t.constant.MaterialPath, [o]);
                s.setProperty(l + "/Material", o.Material);
                s.setProperty(l + "/QuantityUnit", o.MaterialBaseUnit);
                a[n].getCells()[3].setValueState("None");
                a[n].getCells()[4].setEnabled(true);
                if (i.length > 1) {
                    var n = Number(l.split("/")[2]);
                    i.forEach(function(e, r) {
                        if (!a[n]) {
                            this.onAddNewRow();
                            a = t.getView().byId("idItemListListTable").getItems()
                        }
                        a[n].getCells()[2].setTokens([i[r]]);
                        a[n].getCells()[2].fireTokenUpdate();
                        n = n + 1
                    }.bind(this))
                }
            }
            if (e.getParameters().type !== "removed") {
                t.fnLoadQuantity(r);
                t.fnTotalPrice(r)
            }
            s.updateBindings(true);
            t.onNextButtoncheck()
        },
        fnTotalPrice: function(e) {
            var t = this;
            var a = t.getView().getBindingContext().getObject();
            var i = e["detailView"].getPath();
            var r = e["detailView"].getModel();
            var l = r.getData();
            var s = r.getProperty(i);
            var n = Number(i.split("/")[i.split("/").length - 1]);
            var o = a.DistributionChannel;
            var u = a.SoldToParty;
            var g = a.process_type;
            var d = a.ServiceOrganization;
            var c = a.Division;
            var p = a.SalesOffice;
            var h = a.SalesGroup;
            var v = a.SalesOrganization;
            var f = s.Material;
            var m = t.getView().byId("idItemListListTable");
            var y = m.getAggregation("items");
            var C = y[n].getAggregation("cells")[4];
            var b = y[n].getAggregation("cells")[5];
            var V = y[n].getAggregation("cells")[6];
            var S = y[n].getAggregation("cells")[7];
            var w = y[n].getAggregation("cells")[8];
            b.setBusy(true);
            V.setBusy(true);
            S.setBusy(true);
            w.setBusy(true);
            var I = t.getView().getModel();
            var P = "ZAE_FM_SINGLE_SIM_GET_PRICESet";
            var M = [{
                callProperty: "Customer",
                value: u
            }, {
                callProperty: "DistrChan",
                value: o
            }, {
                callProperty: "Division",
                value: c
            }, {
                callProperty: "DocType",
                value: "ZORP"
            }, {
                callProperty: "SalesOff",
                value: p
            }, {
                callProperty: "Material",
                value: f
            }, {
                callProperty: "Plant",
                value: d
            }, {
                callProperty: "SalesGrp",
                value: h
            }, {
                callProperty: "SalesOrg",
                value: v
            }];
            var T = function(e, a) {
                t._NetPrice = e;
                this.oResponse = false;
                if (e) {
                    var l = e.NetPrice === "" ? 0 : e.NetPrice;
                    r.setProperty(i + "/UnitNetPrice", parseFloat(l));
                    var s = e.Tax === "" ? 0 : e.Tax;
                    r.setProperty(i + "/UnitTax", parseFloat(s));
                    var n = e.TotalPrice === "" ? 0 : e.TotalPrice;
                    r.setProperty(i + "/UnitTotalPrice", parseFloat(n));
                    r.setProperty(i + "/Currency", e.Currency)
                } else {
                    r.setProperty(i + "/NetPrice", 0);
                    r.setProperty(i + "/Tax", 0);
                    r.setProperty(i + "/TotalPrice", 0);
                    r.setProperty(i + "/Currency", 0)
                }
                b.setBusy(false);
                V.setBusy(false);
                S.setBusy(false);
                w.setBusy(false)
            }.bind(this);
            var _ = function(e) {
                C.setEnabled(false);
                this.oResponse = JSON.parse(e.responseText);
                sap.m.MessageBox.error(this.oResponse.error.message.value, {
                    actions: [sap.m.MessageBox.Action.CLOSE]
                });
                b.setBusy(false);
                V.setBusy(false);
                S.setBusy(false);
                w.setBusy(false)
            }.bind(this);
            this.aeUI5Util.createCall(t, I, P, M, T, _)
        },
        fnLoadQuantity: function(e) {
            var t = this;
            var a = t.getView().getBindingContext().getObject();
            var i = e["detailView"].getPath();
            var r = e["detailView"].getModel();
            var l = r.getData();
            var s = r.getProperty(i);
            var n = Number(i.split("/")[i.split("/").length - 1]);
            var o = [];
            o.push(new sap.ui.model.Filter({
                path: "Equipment",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: a.Equipment
            }));
            if (!s.Material) {
                r.setProperty(i + "/Quantity", "");
                t.onNextButtoncheck();
                return
            }
            var u = t.getView().byId("idItemListListTable");
            var g = u.getAggregation("items");
            var d = g[n].getAggregation("cells")[4];
            d.setBusy(true);
            t.getView().getModel().read("/ZAE_I_EquipmentModelCode(P_Material='" + s.Material + "')/Set", {
                filters: o,
                success: function(e, a) {
                    d.setBusy(false);
                    if (e.results.length > 0 && !t.oResponse) {
                        r.setProperty(i + "/Quantity", parseFloat(e.results[0].MaterialAvlQty).toString());
                        d.fireLiveChange();
                        d.setValueState("None")
                    } else {
                        r.setProperty(i + "/Quantity", "");
                        d.setValueState("Error");
                        r.setProperty(i + "/NetPrice", "-");
                        r.setProperty(i + "/Tax", "-");
                        r.setProperty(i + "/TotalPrice", "-");
                        d.setValueStateText("Enter Quantity")
                    }
                    t.onNextButtoncheck()
                },
                error: function(e) {
                    d.setBusy(false)
                }
            })
        },
        checkNotes: function(e) {
            var t = this.getView().getModel("detailView").getData();
            if (e.length > 130) {
                t.nItemData.push({
                    Tdformat: "",
                    Tdline: e.slice(0, 130)
                });
                this.checkNotes(e.slice(130, e.length))
            } else {
                t.nItemData.push({
                    Tdformat: "",
                    Tdline: e.slice(0, e.length)
                })
            }
        },
        btnSubmitPress: function() {
            var e = this;
            var t = "HEADER_DATASet";
            var a = this.getView().getModel();
            var i = this.getView().getModel("UpdateServiceRequestItem");
            var r = {};
            var l = {};
            var s = [];
            var n = [];
            var o = [];
            var u = [];
            var g = [];
            var d = {};
            var c = this.getOwnerComponent().getRouter();
            var p = this.getView().byId("idVBoxCheckList").getItems();
            var h = this.getView().getModel("detailView").getData();
            var v = h.VisibleData;
            if (v.ChkNote === "3") {
                var f = this.getView().byId("idnotes").getValue();
                e.checkNotes(f)
            }
            if (v.ChkPicNote === "3") {
                var m = this.getView().byId("idPickNote").getValue();
                e.checkNotes(m)
            }
            var y = this.getView().getBindingContext().getObject().ServiceRequest;
            var C = this.getView().byId("idFuelSelect").getSelectedKey();
            var b = this.getView().byId("idvehiclecondition").getSelectedKey();
            var V = this.getView().getModel("appView").getProperty("/Role");
            var S = this.getView().byId("DP2").getDateValue();
            var w = new Date(S);
            var I = "/Date(" + w.getTime() + ")/";
            var P = "PT" + ("00" + w.getHours()).slice(-2) + "H" + ("00" + w.getMinutes()).slice(-2) + "M" + ("00" + w.getSeconds()).slice(-2) + "S";
            var M = this.getModel("detailView").getData().SummaryList;
            r.ServiceRequest = y;
            if (v.ChkFuelgauge === "3") {
                r.FuelLevel = C
            } else {
                if (C !== "") {
                    r.FuelLevel = C
                }
            }
            if (v.ChkVehCond === "3") {
                r.VehicleCond = b
            } else {
                if (b !== "") {
                    r.VehicleCond = b
                }
            }
            if (v.ChkDelivDate === "3") {
                r.ReqDate = I;
                r.ReqTime = P
            } else {
                if (I !== "") {
                    r.ReqDate = I;
                    r.ReqTime = P
                }
            }
            r.MsaRole = V;
            s.push(r);
            for (var T = 0; T < M.length; T++) {
                n.push({
                    ProcessType: M[T].cat_desc,
                    Dbmtr: M[T].net_value_h,
                    Waers: M[T].currency,
                    Stat: "E0002",
                    CatId: M[T].cat_id
                });
                r.Description = M[T].cat_label.substring(0, 39)
            }
            for (var T = 0; T < p.length; T++) {
                if (p[T].getSelected()) {
                    o.push({
                        NumberInt: p[T].getBindingContext().getObject().ServiceRequestItem,
                        CheckListId: "YES"
                    })
                }
            }
            h.vComplaints.forEach(function(e, t) {
                if (e.Enabled) {
                    d = {
                        StepId: "",
                        CompCode: e.ComplaintKey,
                        CheckListId: "ZC000001",
                        ItemCatUsage: e.ItemCatUsage,
                        Text0003: e.ComplaintDescription,
                        Materail: e.Material,
                        Quantity: e.Quantity !== "" ? e.Quantity.toString() : "0",
                        ProcessQtyUnit: e.QuantityUnit,
                        Currency: e.Currency
                    };
                    if (e.Quantity === "0" || e.Quantity === "") {
                        d["Price"] = "0", d["Tax"] = "0", d["TotalPrice"] = "0"
                    } else {
                        d["TotalPrice"] = e.TotalPrice.toString(), d["Tax"] = e.Tax.toString(), d["Price"] = e.NetPrice.toString()
                    }
                    u.push(d)
                }
            });
            var _ = e.getView().getModel("detailView").getData();
            var g = _.nItemData;
            var D = [{
                callProperty: "N_HEADER_DATA",
                value: s
            }, {
                callProperty: "N_CATALOGUES",
                value: n
            }, {
                callProperty: "N_SR_COMP",
                value: u
            }];
            if (v.ChkAccAvl === "3" || v.ChkAccAvl === "2") {
                D.push({
                    callProperty: "N_SR_ITEMS",
                    value: o
                })
            }
            if (v.ChkPicNote === "3" || v.ChkNote === "2") {
                D.push({
                    callProperty: "N_SR_TEXTS",
                    value: g
                })
            }
            var E = function(t) {
                c.getView("com.globalintelli.ZAE_MMSA.view.Master").byId("list").getBinding("items").refresh(true);
                e.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
                e.getOwnerComponent().oListSelector.clearMasterListSelection();
                e.getRouter().navTo("master")
            };
            var R = function(e) {
                c.getView("com.globalintelli.ZAE_MMSA.view.Master").byId("list").getBinding("items").refresh(true)
            };
            this.aeUI5Util.createCall(e, i, t, D, E, R)
        },
        onMessagePopoverPress: function(e) {
            this.aeUI5Util.handleMessagePopoverPress(this, e)
        },
        onSubmitButtonCheck: function() {
            var e = this.getView().byId("CategoryTreeVHMessageStrip").getVisible();
            var t = this.getView().getModel("detailView").getData();
            var a = t.VisibleData;
            var i = t.SummaryList;
            var r = this.getView().byId("DP2");
            var l = r.getValue();
            r.setMinDate(new Date);
            var s = true;
            var n = t.vComplaints;
            var o = this.getView().byId("fcSelect").getFormElements()[7];
            if (a.ChkDelivDate === "3" && l === "" || e === true) {
                this.getModel("detailView").setProperty("/IsSubmitenabled", false)
            } else if (a.ChkWrkReqSc === "3" && i.length <= 0) {
                this.getModel("detailView").setProperty("/IsSubmitenabled", false)
            } else {
                this.getView().byId("btnSubmit").setVisible(true);
                this.getModel("detailView").setProperty("/IsSubmitenabled", true);
                this.getView().byId("btnYrdOpr").setVisible(false)
            }
        },
        onNextButtoncheck: function(e) {
            if (e !== undefined) {
                var t = "0";
                var a = "0";
                var i = "0";
                var r = this.getView().getModel("detailView");
                if (e.getSource().getParent().getParent().getId().includes("idItemListListTable")) {
                    var l = e.getSource().mBindingInfos.value.binding.oContext.sPath;
                    var s = e.getSource().mBindingInfos.value.binding.sPath;
                    r.setProperty(l + "/" + s, e.getSource().getValue());
                    var n = this.getView().byId("idItemListListTable");
                    var o = n.getAggregation("items");
                    var u = Number(l.split("/")[l.split("/").length - 1]);
                    var g = this.getView().getModel("detailView").getData().vComplaints[u];
                    var d = g.ComplainType;
                    var c = o[u].getAggregation("cells")[4];
                    if (c.getValue() !== "0" && c.getValue() !== "") {
                        i = g.UnitNetPrice * c.getValue();
                        a = g.UnitTax * c.getValue();
                        t = g.UnitTotalPrice * c.getValue()
                    } else {
                        t = g.UnitTotalPrice === undefined ? 0 : g.UnitTotalPrice;
                        i = g.UnitNetPrice === undefined ? 0 : g.UnitNetPrice;
                        a = g.UnitTax === undefined ? 0 : g.UnitTax
                    }
                    r.setProperty(l + "/TotalPrice", parseFloat(t));
                    r.setProperty(l + "/Tax", parseFloat(a));
                    r.setProperty(l + "/NetPrice", parseFloat(i));
                    if (e.getParameter("value") === "" && d === "R") {
                        c.setValueState("Error");
                        c.setValueStateText("Enter Quantity")
                    } else {
                        c.setValueState("None");
                        c.setValueStateText("")
                    }
                }
            }
            var p = this.getView().getModel("detailView").getData();
            var h = p.VisibleData;
            var v = this.getView().byId("idOdometer").getValue();
            var f = this.getView().byId("idOdometer").getValueState();
            var m = this.getView().byId("idFuelSelect").getSelectedKey();
            var y = this.getView().byId("idvehiclecondition").getSelectedKey();
            var C = this.getView().byId("idnotes").getValue();
            var b = this.getView().byId("idPickNote").getValue();
            var V = this.getView().byId("idservicerequest").getSelected();
            var S = p.vComplaints;
            var w = true;
            var I = true;
            var P = true;
            var M = this.getView().getBindingContext();
            var T = this.getView().getModel("appView").getData().Role;
            var _ = this.getView().byId("fcSelect").getFormElements();
            var D = this;
            D.getModel("detailView").setProperty("/IsNextenabled", true);
            D.getModel("detailView").setProperty("/IsSubmitenabled", true);
            _.forEach(function(e, t) {
                if (e.getFields()[0].getMetadata()._sClassName == "sap.m.Input" && e.getFields()[0].getRequired() && e.getFields()[0].getValue() === "") {
                    this.getModel("detailView").setProperty("/IsNextenabled", false);
                    this.getModel("detailView").setProperty("/IsSubmitenabled", false);
                    return
                } else if (e.getFields()[0].getMetadata()._sClassName == "sap.m.Select" && e.getFields()[0].getRequired() && e.getFields()[0].getSelectedKey() === "") {
                    this.getModel("detailView").setProperty("/IsNextenabled", false);
                    this.getModel("detailView").setProperty("/IsSubmitenabled", false);
                    return
                } else if (e.getFields()[0].getMetadata()._sClassName == "sap.m.TextArea" && e.getFields()[0].getRequired() && e.getFields()[0].getValue() === "") {
                    this.getModel("detailView").setProperty("/IsNextenabled", false);
                    this.getModel("detailView").setProperty("/IsSubmitenabled", false);
                    return
                }
                if (this.getModel("detailView").getProperty("/IsNextenabled") && e.getFields()[0].getMetadata()._sClassName == "sap.m.VBox" && h.ChkAccAvl === "3" && e.getFields()[0].getItems()) {
                    for (var t = 0; t < e.getFields()[0].getItems().length; t++) {
                        if (e.getFields()[0].getItems()[t].getSelected()) {
                            this.getModel("detailView").setProperty("/IsNextenabled", true);
                            this.getModel("detailView").setProperty("/IsSubmitenabled", false);
                            this.onSubmitButtonCheck();
                            return
                        } else {
                            if (e.getFields()[0].getItems()[t].getMetadata()._sClassName === "sap.m.CheckBox") {
                                this.getModel("detailView").setProperty("/IsNextenabled", false);
                                this.getModel("detailView").setProperty("/IsSubmitenabled", false)
                            }
                        }
                    }
                }
            }.bind(this));
            if (this.getView().byId("complaintsId").getVisible() && this.getModel("detailView").getProperty("/IsNextenabled")) {
                S.forEach(function(e, t) {
                    if (h.ChkCompCode === "3") {
                        if (e.Complaint === "" || e.ComplaintDescription === "" || e.ComplainType === "R" && e.Material === "" && e.Quantity === "" && e.Enabled === true) {
                            this.getModel("detailView").setProperty("/IsNextenabled", true);
                            this.getModel("detailView").setProperty("/IsSubmitenabled", true);
                            this.onSubmitButtonCheck()
                        } else {
                            this.getModel("detailView").setProperty("/IsNextenabled", false);
                            this.getModel("detailView").setProperty("/IsSubmitenabled", false)
                        }
                    } else if (e.Complaint !== "" && e.ComplaintDescription !== "" && (e.ComplainType === "R" && e.Material === "") && (e.ComplainType === "R" && e.Quantity !== "" && e.Enabled === true) || e.ComplainType === "R" && e.Quantity === "") {
                        this.getModel("detailView").setProperty("/IsNextenabled", false);
                        this.getModel("detailView").setProperty("/IsSubmitenabled", false)
                    } else {
                        this.getModel("detailView").setProperty("/IsNextenabled", true)
                    }
                }.bind(this));
                if (S.length < 1 && h.ChkCompCode === "3") {
                    this.getModel("detailView").setProperty("/IsNextenabled", false);
                    this.getModel("detailView").setProperty("/IsSubmitenabled", false)
                }
            }
            if (T === "1") {
                if (h.ChkFuelgauge === "3" && m !== "" && (h.ChkVehCond === "3" && y !== "")) {
                    this.getModel("detailView").setProperty("/IsNextenabled", true);
                    this.getModel("detailView").setProperty("/IsSubmitenabled", true)
                }
            }
        },
        Statuscolorformat: function(e) {
            var t = "None";
            if (e === "Out of Warranty" || e === "Out of Contract") {
                t = "Error"
            } else if (e === "" || e === "") {
                t = "None"
            } else if (e === "In Warranty" || e === "In Contract") {
                t = "Success"
            }
            return t
        },
        filterTreeRecallData_old: function(e, t) {
            var a = e;
            if (a && a.length > 0) {
                var i = function(e) {
                    var a = 0;
                    return e.forEach(function(e) {
                        var i = e;
                        for (var r = 0; r < t.length; r++) {
                            if (i.cat_id === t[r].ExtRecallNo && t[r].ServiceOrder !== "" && t[r].MaintenanceOrder !== "" && t[r].SystemStatus.includes("TECO")) {
                                i["Status"] = "TECO"
                            } else if (i.cat_id === t[r].ExtRecallNo && i["Status"] !== "TECO") {
                                a = a + 1;
                                i["ValidFrom"] = t[r].ValidFrom;
                                i["ValidTo"] = t[r].ValidTo;
                                i["Info"] = t[r].Info
                            }
                        }
                    });
                    return a > 0
                };
                var r = function(e) {
                    return e.filter(function(t) {
                        var a = t;
                        if (a.children) {
                            a.children = r(a.children)
                        }
                        if (a.cat_id.slice(-4) === "S_RC") {
                            return i(a.children)
                        }
                        return e
                    })
                };
                a = r(a)
            }
            return a
        },
        filterTreeRecallData: function(e, t) {
            var a = e;
            if (a && a.length > 0) {
                var i = function(e) {
                    return e.filter(function(e) {
                        var a = 0;
                        var i = e;
                        for (var r = 0; r < t.length; r++) {
                            if (i.cat_id === t[r].ExtRecallNo && t[r].ServiceOrder !== "" && t[r].MaintenanceOrder !== "" && t[r].SystemStatus.includes("TECO")) {
                                i["Status"] = "TECO"
                            } else if (i.cat_id === t[r].ExtRecallNo && i["Status"] !== "TECO") {
                                a = a + 1;
                                i["ValidFrom"] = t[r].ValidFrom;
                                i["ValidTo"] = t[r].ValidTo;
                                i["Info"] = t[r].Info
                            }
                        }
                        return a > 0
                    })
                };
                var r = function(e) {
                    return e.filter(function(t) {
                        var a = t;
                        if (a.children) {
                            a.children = r(a.children)
                        }
                        if (a.cat_id.slice(-4) === "S_RC") {
                            var l = i(a.children);
                            a.children = l;
                            return l.length > 0
                        }
                        return e
                    })
                };
                a = r(a)
            }
            return a
        },
        addRecallToSummary: function(e, t) {
            var a = e;
            var i = this.getModel("detailView");
            if (a && a.length > 0) {
                var r = {};
                var l = e => {
                    e.forEach(e => {
                        const t = e;
                        if (t.children) {
                            l(t.children)
                        }
                        if (t.cat_id.slice(-4) === "S_RC") {
                            r = t
                        }
                    })
                };
                l(a);
                var s = this.getView().getModel("detailView").getData().SummaryList;
                if (r && r.children && r.children.length > 0) {
                    if (t.length > 0) {
                        for (var n = 0; n < t.length; n++) {
                            var o = t[n];
                            if (o.ServiceOrder === "") {
                                var u = r.children.find(e => e.cat_id == o.ExtRecallNo);
                                var g = s.every(e => e.cat_id != u.cat_id);
                                if (u && g) {
                                    var d = {
                                        cat_label: u.cat_label,
                                        cat_id: u.cat_id,
                                        cat_desc: u.cat_desc,
                                        net_value_h: u.net_value_h,
                                        currency: u.currency
                                    };
                                    s.push(d)
                                }
                            }
                        }
                    }
                }
                i.setProperty("/SummaryList", s)
            }
        },
        handleValueHelp: function(e) {
            this._oComplaintInput = e.getSource();
            var t = this;
            if (!this._valueHelpDialog2) {
                u.load({
                    id: "valueHelpDialogFragment",
                    name: "com.globalintelli.ZAE_MMSA.fragment.ComplaintsVH",
                    controller: this
                }).then(function(e) {
                    t._valueHelpDialog2 = e;
                    t._valueHelpDialog2.setModel(t.getView().getModel());
                    t.getView().addDependent(t._valueHelpDialog2);
                    var a = t.getView().getBindingContext().getObject();
                    var i = t.getModel("detailView");
                    var r = i.getProperty("/_ServiceComplaint");
                    var l = [];
                    l.push(new y("Make", C.EQ, a.Make));
                    r.forEach(function(e) {
                        l.push(new y("ComplainCode", C.NE, e.ComplaintCode))
                    });
                    var s = true;
                    var n = new sap.ui.model.Filter(l, s);
                    t._valueHelpDialog2.getBinding("items").filter([n]);
                    t._valueHelpDialog2.open()
                })
            } else {
                var a = t.getModel("detailView");
                var i = t.getView().getBindingContext().getObject();
                var r = a.getProperty("/_ServiceComplaint");
                var l = [];
                l.push(new y("Make", C.EQ, i.Make));
                r.forEach(function(e) {
                    l.push(new y("ComplainCode", C.NE, e.ComplaintCode))
                });
                var s = true;
                var n = new sap.ui.model.Filter(l, s);
                t._valueHelpDialog2.getBinding("items").filter([n]);
                t._valueHelpDialog2.open()
            }
        },
        onSearchValueHelp: function(e) {
            var t = this.getModel("detailView");
            var a = t.getProperty("/vComplaints");
            var i = e.getParameter("value");
            var r = [];
            if (i) {
                r.push(new sap.ui.model.Filter({
                    filters: [new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.Contains, i), new sap.ui.model.Filter("ComplainCodeDesc", sap.ui.model.FilterOperator.Contains, i)],
                    and: false
                }))
            }
            var l = [];
            var s = this.getView().getBindingContext().getObject();
            l.push(new y("Make", C.EQ, s.Make));
            if (a.length > 0) {
                for (var n = 0; n < a.length; n++) {
                    l.push(new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.NE, a[n].ComplaintCode))
                }
            }
            r.push(new sap.ui.model.Filter({
                filters: l,
                and: true
            }));
            var o = e.getParameter("itemsBinding");
            o.filter(r)
        },
        onComplanitRefValueHelpDialogClose: function(e) {
            var t = this.getView().getModel("detailView");
            var a = this._oComplaintInput.mBindingInfos.value.binding.oContext.sPath;
            var i = e.getParameter("selectedItem").getBindingContext();
            var r = i.getObject("ComplainCode");
            var l = i.getObject("ComplainCodeDesc");
            var s = i.getObject("ItemCatUsage");
            var n = i.getObject("ComplainType");
            t.setProperty(a + "/ComplainType", n);
            t.setProperty(a + "/ComplaintKey", r);
            t.setProperty(a + "/ItemCatUsage", s);
            this._oComplaintInput.setValue(r);
            var o = t.getData().vComplaints;
            t.setProperty(a + "/ComplaintDescription", l);
            var u = this.getView().byId("idItemListListTable");
            var g = u.getAggregation("items");
            var d = Number(a.split("/")[a.split("/").length - 1]);
            var c = g[d].getAggregation("cells")[3];
            var p = g[d].getAggregation("cells")[4];
            c.setEnabled(true);
            if (n === "R") {
                c.setValueState("Error");
                p.setValueState("Error");
                c.setValueStateText("Select Material");
                p.setValueStateText("Enter Quantity")
            } else {
                c.setValueState("None");
                p.setValueState("None")
            }
            this.onNextButtoncheck()
        },
        onAddNewRow: function() {
            var e = this.getView().getModel("detailView").getData().vComplaints;
            var t = (e.length + 1) * 10;
            e.push({
                ItemNumber: e.length === 1 ? 20 : t,
                Complaint: "",
                ComplaintDescription: "",
                Material: "",
                MaterialVHData: [],
                Quantity: "",
                QuantityUnit: "",
                NetPrice: 0,
                Tax: 0,
                TotalPrice: 0,
                Currency: "",
                Enabled: true
            });
            this.getModel("detailView").refresh(true);
            this.onNextButtoncheck()
        },
        onDeletePress: function(e) {
            var t = e.getSource();
            var a = t.getParent().oBindingContexts;
            var i = a["detailView"].getPath();
            var r = a["detailView"].getModel();
            var l = r.getData().vComplaints;
            var s = Number(i.split("/")[i.split("/").length - 1]);
            l.splice(s, 1);
            r.refresh(true);
            this.onNextButtoncheck()
        },
        _fnEnableKMReading: function(e, t) {
            var a = false;
            if (e && e.length > 0 || t !== "1") {
                for (var i = 0; i < e.length; i++) {
                    if (e[i].MeasuringPointPositionNumber === "KILOMETER") {
                        a = true
                    }
                }
            }
            return a
        },
        _fnEnableHRSReading: function(e) {
            var t = false;
            if (e && e.length > 0) {
                for (var a = 0; a < e.length; a++) {
                    if (e[a].MeasuringPointPositionNumber === "HRS") {
                        t = true
                    }
                }
            }
            return t
        },
        handleComplaintSuggest: function(e) {
            var t = this;
            var a = e.getParameter("suggestValue");
            var i = t.getView().getBindingContext().getObject();
            var r = t.getModel("detailView");
            var l = r.getProperty("/_ServiceComplaint");
            var s = [];
            s.push(new y("Make", C.EQ, i.Make));
            l.forEach(function(e) {
                s.push(new y("ComplainCode", C.NE, e.ComplaintCode))
            });
            var n = true;
            var o = new sap.ui.model.Filter(s, n);
            var u = [];
            if (a) {
                s.push(new y({
                    filters: [new y({
                        path: "ComplainCode",
                        operator: sap.ui.model.FilterOperator.StartsWith,
                        value1: a
                    }), new y({
                        path: "ComplainCodeDesc",
                        operator: sap.ui.model.FilterOperator.StartsWith,
                        value1: a
                    })],
                    and: false
                }))
            }
            var o = new sap.ui.model.Filter(s, n);
            e.getSource().getBinding("suggestionRows").filter(o);
            e.getSource().getBinding("suggestionRows").resume()
        },
        onSelectComplaint: function(e) {
            if (e.getParameter("selectedRow") !== null) {
                var t = e.getSource();
                t.setValue("");
                var a = e.getParameter("selectedRow").getBindingContext();
                var i = this.getView().getModel("detailView");
                var r = t.mBindingInfos.value.binding.oContext.sPath;
                var l = a.getObject("ComplainCode");
                var s = a.getObject("ComplainCodeDesc");
                var n = a.getObject("ItemCatUsage");
                var o = ComplaintClose.getObject("ComplainType");
                i.setProperty(r + "/ComplainType", o);
                i.setProperty(r + "/ComplaintKey", l);
                i.setProperty(r + "/ItemCatUsage", n);
                t.setValue(l);
                var u = i.getData().vComplaints;
                i.setProperty(r + "/ComplaintDescription", s);
                var g = this.getView().byId("idItemListListTable");
                var d = g.getAggregation("items");
                var c = Number(r.split("/")[r.split("/").length - 1]);
                var p = d[c].getAggregation("cells")[3];
                var h = d[c].getAggregation("cells")[4];
                p.setEnabled(true);
                if (o === "R") {
                    p.setValueState("Error");
                    h.setValueState("Error");
                    p.setValueStateText("Select Material");
                    h.setValueStateText("Enter Quantity")
                } else {
                    p.setValueState("None");
                    h.setValueState("None")
                }
                this.onNextButtoncheck()
            }
        },
        onClickMMSA_B01: function(e) {
            var t = this;
            if (!this._oWorkshopRoasterDialog) {
                u.load({
                    id: "fragWorkshopLoad",
                    name: "com.globalintelli.ZAE_MMSA.fragment.WorkshopLoad",
                    controller: {
                        onSubmitPressed: function(e) {
                            u.byId("fragWorkshopLoad", "idDate").getDateValue().setHours(6);
                            var a = u.byId("fragWorkshopLoad", "idDate").getDateValue().toISOString().slice(0, 10);
                            var i = t.getView().getBindingContext().getObject();
                            var r = sap.ushell.Container.getService("CrossApplicationNavigation");
                            var l = r && r.hrefForExternal({
                                target: {
                                    semanticObject: "WorkshopRoaster",
                                    action: "aeAnalyze"
                                },
                                params: {
                                    Plant: i.ServiceOrganization,
                                    WorkCenter: i.WorkCenter,
                                    Date: a
                                }
                            }) || "";
                            var s = window.location.href.split("#")[0] + l;
                            sap.m.URLHelper.redirect(s, true)
                        },
                        onCancelPressed: function(e) {
                            e.getSource().getParent().close()
                        },
                        handleDateChange: function(e) {
                            var a = e.getSource();
                            var i = e.getSource().getDateValue() !== null;
                            t._oWorkshopRoasterDialog.getBeginButton().setEnabled(i)
                        }
                    }
                }).then(function(e) {
                    this._oWorkshopRoasterDialog = e;
                    this.getView().addDependent(this._oWorkshopRoasterDialog);
                    this._setWorkshopRoasterDialogInitialState()
                }.bind(this))
            } else {
                this._setWorkshopRoasterDialogInitialState()
            }
        },
        _setWorkshopRoasterDialogInitialState: function() {
            u.byId("fragWorkshopLoad", "idDate").setDateValue(new Date);
            this._oWorkshopRoasterDialog.open()
        }
    })
});