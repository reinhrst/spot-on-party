/*jslint sloppy: true, vars: true*/
/*globals Ext, SOP*/

Ext.define("SOP.view.default.ChooseParty", {
    extend: "Ext.navigation.View",
    xtype: "chooseparty",
    requires: ["Ext.dataview.List", "Ext.MessageBox", "Ext.Button", ],

    config: {
        id: "choosePartyPicker",
        items: [{
            title: "Choose Party",
            layout: "vbox",
        }],
        rightButton: null,
        listeners: {
            activeitemchange: "onActiveItemChange",
        }
    },

    initialize: function () {
        var that = this;
        that.callParent(arguments);
        that.list = Ext.create("Ext.dataview.List", {
            flex: 1,
            itemTpl: '{name}',
            store: that.store,
        });
        that.items.first().add([this.list]);
        that.list.on("itemtap", that.onListItemTap, that);
        Ext.each(["addrecords", "clear", "removerecords", "updaterecord"], function (eventname) {
            that.store.on(eventname, that.onStoreChange, that);
        });
        that.onStoreChange();
    },

    onListItemTap: function (list, index, target, record, event) {
        this.fireEvent("listitemtap", this, record);
        Ext.defer(function () {
            list.deselectAll();
        }, 200);
    },

    onStoreChange: function () {
        var that = this;
        if (that.store.getAllCount() === 0) {
            Ext.Msg.show({
                title       : "No parties",
                message     : "Nobody has invited you to a party yet",
                buttons     : [],
            });
        } else {
            Ext.Msg.hide();
        }
    },

    applyRightButton: function (value, oldValue) {
        var that = this;
        if (value) {
            var button = Ext.create("Ext.Button", Ext.merge({xtype: "button", align: "right"}, value));
            return button;
        }
        return null;
    },

    updateRightButton: function (value, oldValue) {
        var that = this;
        if (oldValue) {
            oldValue.destroy();
        }
        if (value) {
            that.getNavigationBar().add(value);
        }
    },

    onActiveItemChange: function (container, value, oldValue) {
        if (oldValue.rightButtonSetter) {
            oldValue.rightButtonSetter(oldValue, null, oldValue.getActiveItem());
        }
        if (value.rightButtonSetter) {
            value.rightButtonSetter(value, value.getActiveItem(), null);
        }
    },
});
