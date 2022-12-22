import React from "react";
export var SectionContainer = function SectionContainer(_ref) {
  var children = _ref.children,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 100 : _ref$height;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: height + "%",
      width: "100%"
    }
  }, children);
};