import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types";
import * as Events from "./Events";
import { isNil, isNull, isPositiveNumber } from "./utils";
import usePrevious from "./usePrevValue";
import { SectionContainer } from "./SectionContainer";
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
export var ReactPageScroller = function ReactPageScroller(_ref) {
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
  var _useState = useState(DEFAULT_COMPONENT_INDEX),
    componentIndex = _useState[0],
    setComponentIndex = _useState[1];
  var _useState2 = useState(DEFAULT_COMPONENTS_TO_RENDER_LENGTH),
    componentsToRenderLength = _useState2[0],
    setComponentsToRenderLength = _useState2[1];
  var prevComponentIndex = usePrevious(componentIndex);
  var scrollContainer = useRef(null);
  var pageContainer = useRef(null);
  var lastScrolledElement = useRef(null);
  var isMountedRef = useRef(false);
  var containersRef = useRef([]);
  children = useMemo(function () {
    return React.Children.toArray(children);
  }, [children]);
  var positions = useMemo(function () {
    return children.reduce(function (_positions, _children) {
      var lastElement = _positions.slice(-1);
      var height = _children.props.height ? parseInt(_children.props.height) : 100;
      return _positions.concat([lastElement - height]);
    }, [0]);
  }, [children]);
  var scrollPage = useCallback(function (nextComponentIndex) {
    if (onBeforePageScroll) {
      onBeforePageScroll(nextComponentIndex);
    }
    pageContainer.current.style.transform = "translate3d(0, " + positions[nextComponentIndex] + "%, 0)";
  }, [onBeforePageScroll, positions]);
  var addNextComponent = useCallback(function (componentsToRenderOnMountLength) {
    if (componentsToRenderOnMountLength === void 0) {
      componentsToRenderOnMountLength = 0;
    }
    var tempComponentsToRenderLength = Math.max(componentsToRenderOnMountLength, componentsToRenderLength);
    if (tempComponentsToRenderLength <= componentIndex + 1) {
      if (!isNil(children[componentIndex + 1])) {
        tempComponentsToRenderLength++;
      }
    }
    setComponentsToRenderLength(tempComponentsToRenderLength);
  }, [children, componentIndex, componentsToRenderLength]);
  var checkRenderOnMount = useCallback(function () {
    if (renderAllPagesOnFirstRender) {
      setComponentsToRenderLength(React.Children.count(children));
    } else if (!isNil(children[DEFAULT_COMPONENT_INDEX + 1])) {
      var componentsToRenderAdditionally = positions.filter(function (position) {
        return Math.abs(position) < 200;
      }).length;
      addNextComponent(DEFAULT_COMPONENTS_TO_RENDER_LENGTH + componentsToRenderAdditionally);
    }
  }, [addNextComponent, children, positions, renderAllPagesOnFirstRender]);
  var disableScroll = useCallback(function () {
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
  var enableDocumentScroll = useCallback(function () {
    if (!isBodyScrollEnabled) {
      isBodyScrollEnabled = true;
      document.body.classList.remove(DISABLED_CLASS_NAME);
      document.documentElement.classList.remove(DISABLED_CLASS_NAME);
    }
  }, []);
  var setRenderComponents = useCallback(function () {
    var newComponentsToRender = [];
    var i = 0;
    while (i < componentsToRenderLength && !isNil(children[i])) {
      containersRef.current[i] = true;
      if (children[i].type.name === SectionContainer.name) {
        newComponentsToRender.push( /*#__PURE__*/React.createElement(React.Fragment, {
          key: i
        }, children[i]));
      } else {
        newComponentsToRender.push( /*#__PURE__*/React.createElement(SectionContainer, {
          key: i
        }, children[i]));
      }
      i++;
    }
    return newComponentsToRender;
  }, [children, componentsToRenderLength]);
  var scrollWindowDown = useCallback(function () {
    if (!isScrolling && !blockScrollDown) {
      if (!isNil(containersRef.current[componentIndex + 1])) {
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
  var scrollWindowUp = useCallback(function () {
    if (!isScrolling && !blockScrollUp) {
      if (!isNil(containersRef.current[componentIndex - 1])) {
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
  var touchMove = useCallback(function (event) {
    if (!isNull(previousTouchMove)) {
      if (event.touches[0].clientY > previousTouchMove) {
        scrollWindowUp();
      } else {
        scrollWindowDown();
      }
    } else {
      previousTouchMove = event.touches[0].clientY;
    }
  }, [scrollWindowDown, scrollWindowUp]);
  var wheelScroll = useCallback(function (event) {
    if (Math.abs(event.deltaY) > MINIMAL_DELTA_Y_DIFFERENCE) {
      if (isPositiveNumber(event.deltaY)) {
        lastScrolledElement.current = event.target;
        scrollWindowDown();
      } else {
        lastScrolledElement.current = event.target;
        scrollWindowUp();
      }
    }
  }, [scrollWindowDown, scrollWindowUp]);
  var keyPress = useCallback(function (event) {
    if (event.keyCode === KEY_UP) {
      scrollWindowUp();
    }
    if (event.keyCode === KEY_DOWN) {
      scrollWindowDown();
    }
  }, [scrollWindowDown, scrollWindowUp]);
  useEffect(function () {
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
  useEffect(function () {
    isMountedRef.current = true;
    checkRenderOnMount();
    return function () {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(function () {
    isScrolling = false;
    previousTouchMove = null;
    if (componentIndex > prevComponentIndex) {
      addNextComponent();
    }
  }, [addNextComponent, componentIndex, prevComponentIndex]);
  useEffect(function () {
    if (pageOnChange) {
      pageOnChange(componentIndex);
    }
  }, [pageOnChange, componentIndex]);
  useEffect(function () {
    if (!isNil(customPageNumber) && customPageNumber !== componentIndex) {
      var newComponentsToRenderLength = componentsToRenderLength;
      if (customPageNumber !== componentIndex) {
        if (!isNil(containersRef.current[customPageNumber]) && !isScrolling) {
          isScrolling = true;
          scrollPage(customPageNumber);
          if (isNil(containersRef.current[customPageNumber]) && !isNil(children[customPageNumber])) {
            newComponentsToRenderLength++;
          }
          setTimeout(function () {
            setComponentIndex(customPageNumber);
            setComponentsToRenderLength(newComponentsToRenderLength);
          }, animationTimer + animationTimerBuffer);
        } else if (!isScrolling && !isNil(children[customPageNumber])) {
          for (var i = componentsToRenderLength; i <= customPageNumber; i++) {
            newComponentsToRenderLength++;
          }
          if (!isNil(children[customPageNumber])) {
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
  useEffect(function () {
    if (isTransitionAfterComponentsToRenderChanged) {
      isTransitionAfterComponentsToRenderChanged = false;
      scrollPage(customPageNumber);
      setTimeout(function () {
        setComponentIndex(customPageNumber);
      }, animationTimer + animationTimerBuffer);
    }
  }, [animationTimer, animationTimerBuffer, componentsToRenderLength, customPageNumber, scrollPage]);
  return /*#__PURE__*/React.createElement("div", {
    ref: scrollContainer,
    style: {
      height: containerHeight,
      width: containerWidth,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
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
ReactPageScroller.propTypes = process.env.NODE_ENV !== "production" ? {
  animationTimer: PropTypes.number,
  animationTimerBuffer: PropTypes.number,
  blockScrollDown: PropTypes.bool,
  blockScrollUp: PropTypes.bool,
  children: PropTypes.any,
  containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  customPageNumber: PropTypes.number,
  handleScrollUnavailable: PropTypes.func,
  onBeforePageScroll: PropTypes.func,
  pageOnChange: PropTypes.func,
  renderAllPagesOnFirstRender: PropTypes.bool,
  transitionTimingFunction: PropTypes.string
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