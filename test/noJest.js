"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
// BasePrototype & BaseClass are the same function
// go as you want for being meaningfull
// or meaningless
var BasePrototype = require('..');
var __1 = require("..");
// eslint-disable-next-line new-cap
var DecoratedByBase = function () {
    var _classDecorators = [(0, __1.Strict)({ someProp: 123 })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DecoratedByBase = _classThis = /** @class */ (function () {
        function DecoratedByBase_1() {
        }
        return DecoratedByBase_1;
    }());
    __setFunctionName(_classThis, "DecoratedByBase");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DecoratedByBase = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DecoratedByBase = _classThis;
}();
var ExtendedDecoratedByBase = /** @class */ (function (_super) {
    __extends(ExtendedDecoratedByBase, _super);
    function ExtendedDecoratedByBase() {
        var _this = _super.call(this) || this;
        _this.someProp = 321;
        return _this;
    }
    return ExtendedDecoratedByBase;
}(DecoratedByBase));
// eslint-disable-next-line new-cap
var Base = /** @class */ (function (_super) {
    __extends(Base, _super);
    function Base() {
        var _this = _super.call(this) || this;
        _this.numberValue = 123;
        debugger;
        _this.stringValue = '123';
        _this.booleanValue = true;
        _this.objectValue = {};
        return _this;
        // ES2022
        // Object.defineProperty(this, 'getterField', {
        // 	get() {
        // 		const answer = `${this.stringValue}`;
        // 		return answer;
        // 	}
        // });
        // Object.defineProperty(this, 'setterField', {
        // 	set(value: string) {
        // 		this.stringValue = value;
        // 	}
        // });
    }
    Object.defineProperty(Base.prototype, "getterField", {
        get: function () {
            var answer = "".concat(this.stringValue);
            return answer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "setterField", {
        set: function (value) {
            this.stringValue = value;
        },
        enumerable: false,
        configurable: true
    });
    return Base;
}(BasePrototype({
    additionalProp: 321,
    someMethod: function () {
        return this.numberValue.valueOf();
    },
})));
debugger;
var baseInstance = new Base;
console.log(baseInstance);
debugger;
var upperInstance = Object.create(baseInstance);
console.log(upperInstance);
var SimpleBase = /** @class */ (function (_super) {
    __extends(SimpleBase, _super);
    function SimpleBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stringProp = '123';
        return _this;
        // ES2022
        // stringProp: string;
        // constructor() {
        // 	super();
        // 	this.stringProp = '123';
        // }
    }
    return SimpleBase;
}(__1.BaseClass));
debugger;
var simpleInstance = new SimpleBase;
console.log(simpleInstance);
debugger;
var decorated = new DecoratedByBase;
console.log(decorated);
debugger;
var exdecorated = new ExtendedDecoratedByBase;
console.log(exdecorated);
debugger;
