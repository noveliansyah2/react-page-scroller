"use strict";

exports.__esModule = true;
exports.ReactPageScroller = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var Events = _interopRequireWildcard(require("./Events"));
var _utils = require("./utils");
var _usePrevValue = _interopRequireDefault(require("./usePrevValue"));
var _SectionContainer = require("./SectionContainer");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
if (!global._babelPolyfill) {
  require("babel-polyfill");
}
var DEFAULT_ANIMATION_TIMER = 1000;
var DEFAULT_ANIMATION = "ease-in-out";
var DEFAULT_CONTAINER_HEIGHT = "100vh";
var DEFAULT_CONTAINER_WIDTH = "100vw";
var DEFAULT_COMPONENT_INDEX = 0;
var DEFAULT_COMPONENTS_TO_RENDER_LENGTH = 0;
var DEFAULT_ANIMATION_TIMER_BUFFER = 200;
var KEY_UP = 38;
var KEY_DOWN = 40;
var MINIMAL_DELTA_Y_DIFFERENCE = 1;
var DISABLED_CLASS_NAME = "rps-scroll--disabled";
var previousTouchMove = null;
var isScrolling = false;
var isBodyScrollEnabled = true;
var isTransitionAfterComponentsToRenderChanged = false;
var ReactPageScroller = function ReactPageScroller(_ref) {
  var animationTimer = _ref.animationTimer,
    animationTimerBuffer = _ref.animationTimerBuffer,
    blockScrollDown = _ref.blockScrollDown,
    blockScrollUp = _ref.blockScrollUp,
    children = _ref.children,
    containerHeight = _ref.containerHeight,
    containerWidth = _ref.containerWidth,
    customPageNumber = _ref.customPageNumber,
    handleScrollUnavailable = _ref.handleScrollUnavailable,
    onBeforePageScroll = _ref.onBeforePageScroll,
    pageOnChange = _ref.pageOnChange,
    renderAllPagesOnFirstRender = _ref.renderAllPagesOnFirstRender,
    transitionTimingFunction = _ref.transitionTimingFunction;
  var _useState = (0, _react.useState)(DEFAULT_COMPONENT_INDEX),
    componentIndex = _useState[0],
    setComponentIndex = _useState[1];
  var _useState2 = (0, _react.useState)(DEFAULT_COMPONENTS_TO_RENDER_LENGTH),
    componentsToRenderLength = _useState2[0],
    setComponentsToRenderLength = _useState2[1];
  var prevComponentIndex = (0, _usePrevValue["default"])(componentIndex);
  var scrollContainer = (0, _react.useRef)(null);
  var pageContainer = (0, _react.useRef)(null);
  var lastScrolledElement = (0, _react.useRef)(null);
  var isMountedRef = (0, _react.useRef)(false);
  var containersRef = (0, _react.useRef)([]);
  children = (0, _react.useMemo)(function () {
    return _react["default"].Children.toArray(children);
  }, [children]);
  var positions = (0, _react.useMemo)(function () {
    return children.reduce(function (_positions, _children) {
      var lastElement = _positions.slice(-1);
      var height = _children.props.height ? parseInt(_children.props.height) : 100;
      return _positions.concat([lastElement - height]);
    }, [0]);
  }, [children]);
  var scrollPage = (0, _react.useCallback)(function (nextComponentIndex) {
    if (onBeforePageScroll) {
      onBeforePageScroll(nextComponentIndex);
    }
    pageContainer.current.style.transform = "translate3d(0, " + positions[nextComponentIndex] + "%, 0)";
  }, [onBeforePageScroll, positions]);
  var addNextComponent = (0, _react.useCallback)(function (componentsToRenderOnMountLength) {
    if (componentsToRenderOnMountLength === void 0) {
      componentsToRenderOnMountLength = 0;
    }
    var tempComponentsToRenderLength = Math.max(componentsToRenderOnMountLength, componentsToRenderLength);
    if (tempComponentsToRenderLength <= componentIndex + 1) {
      if (!(0, _utils.isNil)(children[componentIndex + 1])) {
        tempComponentsToRenderLength++;
      }
    }
    setComponentsToRenderLength(tempComponentsToRenderLength);
  }, [children, componentIndex, componentsToRenderLength]);
  var checkRenderOnMount = (0, _react.useCallback)(function () {
    if (renderAllPagesOnFirstRender) {
      setComponentsToRenderLength(_react["default"].Children.count(children));
    } else if (!(0, _utils.isNil)(children[DEFAULT_COMPONENT_INDEX + 1])) {
      var componentsToRenderAdditionally = positions.filter(function (position) {
        return Math.abs(position) < 200;
      }).length;
      addNextComponent(DEFAULT_COMPONENTS_TO_RENDER_LENGTH + componentsToRenderAdditionally);
    }
  }, [addNextComponent, children, positions, renderAllPagesOnFirstRender]);
  var disableScroll = (0, _react.useCallback)(function () {
    if (isBodyScrollEnabled) {
      isBodyScrollEnabled = false;
      window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
      });
      document.body.classList.add(DISABLED_CLASS_NAME);
      document.documentElement.classList.add(DISABLED_CLASS_NAME);
    }
  }, []);
  var enableDocumentScroll = (0, _react.useCallback)(function () {
    if (!isBodyScrollEnabled) {
      isBodyScrollEnabled = true;
      document.body.classList.remove(DISABLED_CLASS_NAME);
      document.documentElement.classList.remove(DISABLED_CLASS_NAME);
    }
  }, []);
  var setRenderComponents = (0, _react.useCallback)(function () {
    var newComponentsToRender = [];
    var i = 0;
    while (i < componentsToRenderLength && !(0, _utils.isNil)(children[i])) {
      containersRef.current[i] = true;
      if (children[i].type.name === _SectionContainer.SectionContainer.name) {
        newComponentsToRender.push( /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, {
          key: i
        }, children[i]));
      } else {
        newComponentsToRender.push( /*#__PURE__*/_react["default"].createElement(_SectionContainer.SectionContainer, {
          key: i
        }, children[i]));
      }
      i++;
    }
    return newComponentsToRender;
  }, [children, componentsToRenderLength]);
  var scrollWindowDown = (0, _react.useCallback)(function () {
    if (!isScrolling && !blockScrollDown) {
      if (!(0, _utils.isNil)(containersRef.current[componentIndex + 1])) {
        disableScroll();
        isScrolling = true;
        scrollPage(componentIndex + 1);
        setTimeout(function () {
          if (isMountedRef.current) {
            setComponentIndex(function (prevState) {
              return prevState + 1;
            });
          }
        }, animationTimer + animationTimerBuffer);
      } else {
        enableDocumentScroll();
        if (handleScrollUnavailable) {
          handleScrollUnavailable();
        }
      }
    }
  }, [animationTimer, animationTimerBuffer, blockScrollDown, componentIndex, disableScroll, enableDocumentScroll, handleScrollUnavailable, scrollPage]);
  var scrollWindowUp = (0, _react.useCallback)(function () {
    if (!isScrolling && !blockScrollUp) {
      if (!(0, _utils.isNil)(containersRef.current[componentIndex - 1])) {
        disableScroll();
        isScrolling = true;
        scrollPage(componentIndex - 1);
        setTimeout(function () {
          if (isMountedRef.current) {
            setComponentIndex(function (prevState) {
              return prevState - 1;
            });
          }
        }, animationTimer + animationTimerBuffer);
      } else {
        enableDocumentScroll();
        if (handleScrollUnavailable) {
          handleScrollUnavailable();
        }
      }
    }
  }, [animationTimer, animationTimerBuffer, blockScrollUp, componentIndex, disableScroll, enableDocumentScroll, handleScrollUnavailable, scrollPage]);
  var touchMove = (0, _react.useCallback)(function (event) {
    if (!(0, _utils.isNull)(previousTouchMove)) {
      if (event.touches[0].clientY > previousTouchMove) {
        scrollWindowUp();
      } else {
        scrollWindowDown();
      }
    } else {
      previousTouchMove = event.touches[0].clientY;
    }
  }, [scrollWindowDown, scrollWindowUp]);
  var wheelScroll = (0, _react.useCallback)(function (event) {
    if (Math.abs(event.deltaY) > MINIMAL_DELTA_Y_DIFFERENCE) {
      if ((0, _utils.isPositiveNumber)(event.deltaY)) {
        lastScrolledElement.current = event.target;
        scrollWindowDown();
      } else {
        lastScrolledElement.current = event.target;
        scrollWindowUp();
      }
    }
  }, [scrollWindowDown, scrollWindowUp]);
  var keyPress = (0, _react.useCallback)(function (event) {
    if (event.keyCode === KEY_UP) {
      scrollWindowUp();
    }
    if (event.keyCode === KEY_DOWN) {
      scrollWindowDown();
    }
  }, [scrollWindowDown, scrollWindowUp]);
  (0, _react.useEffect)(function () {
    var instance = scrollContainer.current;
    instance.addEventListener(Events.TOUCHMOVE, touchMove, {
      passive: true
    });
    instance.addEventListener(Events.KEYDOWN, keyPress);
    return function () {
      instance.removeEventListener(Events.TOUCHMOVE, touchMove, {
        passive: true
      });
      instance.removeEventListener(Events.KEYDOWN, keyPress);
    };
  }, [touchMove, keyPress]);
  (0, _react.useEffect)(function () {
    isMountedRef.current = true;
    checkRenderOnMount();
    return function () {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  (0, _react.useEffect)(function () {
    isScrolling = false;
    previousTouchMove = null;
    if (componentIndex > prevComponentIndex) {
      addNextComponent();
    }
  }, [addNextComponent, componentIndex, prevComponentIndex]);
  (0, _react.useEffect)(function () {
    if (pageOnChange) {
      pageOnChange(componentIndex);
    }
  }, [pageOnChange, componentIndex]);
  (0, _react.useEffect)(function () {
    if (!(0, _utils.isNil)(customPageNumber) && customPageNumber !== componentIndex) {
      var newComponentsToRenderLength = componentsToRenderLength;
      if (customPageNumber !== componentIndex) {
        if (!(0, _utils.isNil)(containersRef.current[customPageNumber]) && !isScrolling) {
          isScrolling = true;
          scrollPage(customPageNumber);
          if ((0, _utils.isNil)(containersRef.current[customPageNumber]) && !(0, _utils.isNil)(children[customPageNumber])) {
            newComponentsToRenderLength++;
          }
          setTimeout(function () {
            setComponentIndex(customPageNumber);
            setComponentsToRenderLength(newComponentsToRenderLength);
          }, animationTimer + animationTimerBuffer);
        } else if (!isScrolling && !(0, _utils.isNil)(children[customPageNumber])) {
          for (var i = componentsToRenderLength; i <= customPageNumber; i++) {
            newComponentsToRenderLength++;
          }
          if (!(0, _utils.isNil)(children[customPageNumber])) {
            newComponentsToRenderLength++;
          }
          isScrolling = true;
          isTransitionAfterComponentsToRenderChanged = true;
          setComponentsToRenderLength(newComponentsToRenderLength);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customPageNumber, scrollPage]);
  (0, _react.useEffect)(function () {
    if (isTransitionAfterComponentsToRenderChanged) {
      isTransitionAfterComponentsToRenderChanged = false;
      scrollPage(customPageNumber);
      setTimeout(function () {
        setComponentIndex(customPageNumber);
      }, animationTimer + animationTimerBuffer);
    }
  }, [animationTimer, animationTimerBuffer, componentsToRenderLength, customPageNumber, scrollPage]);
  return /*#__PURE__*/_react["default"].createElement("div", {
    ref: scrollContainer,
    style: {
      height: containerHeight,
      width: containerWidth,
      overflow: "hidden"
    }
  }, /*#__PURE__*/_react["default"].createElement("div", {
    ref: pageContainer,
    onWheel: wheelScroll,
    style: {
      height: "100%",
      width: "100%",
      transition: "transform " + animationTimer + "ms " + transitionTimingFunction,
      outline: "none"
    },
    tabIndex: 0
  }, setRenderComponents()));
};
exports.ReactPageScroller = ReactPageScroller;
ReactPageScroller.propTypes = process.env.NODE_ENV !== "production" ? {
  animationTimer: _propTypes["default"].number,
  animationTimerBuffer: _propTypes["default"].number,
  blockScrollDown: _propTypes["default"].bool,
  blockScrollUp: _propTypes["default"].bool,
  children: _propTypes["default"].any,
  containerHeight: _propTypes["default"].oneOfType([_propTypes["default"].number, _propTypes["default"].string]),
  containerWidth: _propTypes["default"].oneOfType([_propTypes["default"].number, _propTypes["default"].string]),
  customPageNumber: _propTypes["default"].number,
  handleScrollUnavailable: _propTypes["default"].func,
  onBeforePageScroll: _propTypes["default"].func,
  pageOnChange: _propTypes["default"].func,
  renderAllPagesOnFirstRender: _propTypes["default"].bool,
  transitionTimingFunction: _propTypes["default"].string
} : {};
ReactPageScroller.defaultProps = {
  animationTimer: DEFAULT_ANIMATION_TIMER,
  animationTimerBuffer: DEFAULT_ANIMATION_TIMER_BUFFER,
  transitionTimingFunction: DEFAULT_ANIMATION,
  containerHeight: DEFAULT_CONTAINER_HEIGHT,
  containerWidth: DEFAULT_CONTAINER_WIDTH,
  blockScrollUp: false,
  blockScrollDown: false
};