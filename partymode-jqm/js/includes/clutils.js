/*jshint */
/*global exports, require*/

var root = this;
var _ = root._;
var clutils = root.clutils;

if (typeof exports !== "undefined") {
    /* node */
    if (!_) {_ = require("./underscore"); }
    clutils = exports;
} else {
    if (!_) {throw "Underscore not loaded"; }
    if (!clutils) {
        clutils = {};
    }
}

(function () {
    "use strict";
    var ID_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz"; //make sure they are in ascending ascii order for sorting purposes

    /*Gets a unique ID, ascending with time*/
    clutils.getUniqueId = function () {
        var octalnow = (new Date()).valueOf().toString(8);
        var octalrandom = Math.floor(Math.random() * Math.pow(8, 6)).toString(8);
        while (octalnow.length < 14) { octalnow = "0" + octalnow; }
        while (octalrandom.length < 6) { octalrandom = "0" + octalrandom; }
        var octalid = octalnow + octalrandom;
        var id = _.map(octalid.match(/[0-7]{2}/g), function (octalindex) {
            var index = parseInt(octalindex, 8);
            return ID_CHARS.charAt(index);
        }).join();
        return id;
    };

    clutils.checkConstraints = function (object, constraints, path) {
        var mypath = path ? path : "toplevel";
        var cl_assert = function (assertion, message) {
            if (!assertion) {
                throw "At " + mypath + ": " + message;
            }
        };
        var cl_assertToUnderscore = function (name) {
            return function (value, myobject) {
                cl_assert(
                    _["is" + name](myobject) === value,
                    "object should " + (value ? "" : "not ") + "be " + name.toLowerCase()
                );
            };
        };
        var checks = {
            "_is": function (value, myobject) {cl_assert(value === myobject, "object is not equal to " + value); },
            "_isFunction": cl_assertToUnderscore("Function"),
            "_isDate": cl_assertToUnderscore("Date"),
            "_isNull": cl_assertToUnderscore("Null"),
            "_isNumber": cl_assertToUnderscore("Number"),
            "_isObject": cl_assertToUnderscore("Object"),
            "_isArray": cl_assertToUnderscore("Array"),
            "_isBoolean": cl_assertToUnderscore("Boolean"),
            "_isString": cl_assertToUnderscore("String"),
        };
        cl_assert(_.isObject(constraints), "syntax error: constraints is not an object " + constraints);

        var strict = true;
        for (var constraint in constraints) {
            if (constraints.hasOwnProperty(constraint)) {
                if (constraint === "_strict" && !constraints[constraint]) {
                    strict = false;
                } else if (checks.hasOwnProperty(constraint)) {
                    checks[constraint](constraints[constraint], object);
                } else {
                    if (_.isObject(object) && constraint in object) {
                        clutils.checkConstraints(object[constraint], constraints[constraint], mypath + " -> " + constraint);
                    } else {
                        cl_assert(false, "expected key \"" + constraint + "\" not in object");
                    }
                }

            }
        }

        if (strict && _.isObject(object)) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    if (! (key in constraints)) {
                        cl_assert(false, "object containts key " + key + ", which is not allowed in strict mode");
                    }
                }
            }
        }
    };
})();

