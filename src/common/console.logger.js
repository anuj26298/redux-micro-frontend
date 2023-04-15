"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ConsoleLogger = void 0;
var abstract_logger_1 = require("./abstract.logger");
var ConsoleLogger = /** @class */ (function (_super) {
    __extends(ConsoleLogger, _super);
    function ConsoleLogger(_debugMode) {
        if (_debugMode === void 0) { _debugMode = false; }
        var _this = _super.call(this, "DEFAULT_CONSOLE_LOGGER") || this;
        _this._debugMode = _debugMode;
        _this.NextLogger = null;
        return _this;
    }
    ConsoleLogger.prototype.processEvent = function (source, eventName, properties) {
        try {
            if (!this._debugMode)
                return;
            console.log("EVENT : " + eventName + ". (" + source + ")");
        }
        catch (_a) {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    };
    ConsoleLogger.prototype.processException = function (source, error, properties) {
        try {
            if (!this._debugMode)
                return;
            console.error(error);
        }
        catch (_a) {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    };
    return ConsoleLogger;
}(abstract_logger_1.AbstractLogger));
exports.ConsoleLogger = ConsoleLogger;
