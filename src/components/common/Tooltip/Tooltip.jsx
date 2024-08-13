import "./tooltip.css";
import { useState, useRef } from "react";
import {
  arrow,
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingArrow,
  FloatingPortal,
} from "@floating-ui/react";
import dataTestIdConstants from "../../../utils/dataTestIdConstants";

function Tooltip({ children, toolTipContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom",
    // Make sure the tooltip stays on the screen
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(15),
      flip({
        fallbackAxisSideDirection: "start",
      }),
      shift(),
      arrow({ element: arrowRef }),
    ],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: "tooltip" }),
  ]);

  return (
    <>
      <div
        data-testid={dataTestIdConstants.TOOLTIP_REFERENCE}
        ref={refs.setReference}
        onMouseOver={() => setIsOpen(true)}
        onMouseOut={() => setIsOpen(false)}
        style={{ display: "inline-block" }}
        {...getReferenceProps()}
      >
        {children}
      </div>
      <FloatingPortal>
        {isOpen && (
          <div
            aria-live="polite"
            className="tooltip-content-wrapper shadow-lg"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {toolTipContent}
            <FloatingArrow
              fill={"#4f4f4f"}
              height={15}
              width={30}
              ref={arrowRef}
              context={context}
            />
          </div>
        )}
      </FloatingPortal>
    </>
  );
}

export default Tooltip;
