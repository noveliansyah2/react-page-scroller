"use strict";

exports.__esModule = true;
exports.SectionContainer = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var SectionContainer = function SectionContainer(_ref) {
  var children = _ref.children,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 100 : _ref$height;
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      height: height + "%",
      width: "100%"
    }
  }, children);
};
exports.SectionContainer = SectionContainer;