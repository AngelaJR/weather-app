import { useRef, useState } from "react";
import {
  autoUpdate,
  arrow,
  useFloating,
  offset,
  shift,
  useDismiss,
  useClick,
  useInteractions,
  useId,
  useRole,
  FloatingArrow,
} from "@floating-ui/react";
import { FaRegBell } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";

import Icon8CopyrightLink from "../common/CopyrightLinks/Icon8CopyrightLink";

function renderIcon() {
  return (
    <>
      <img
        alt="notification icon"
        src="data:image/png;base64,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"
      />
      <Icon8CopyrightLink
        sourceUrl="https://icons8.com/icon/110472/notification"
        name="Notification"
      />
    </>
  );
}

function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);
  const headingId = useId();

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(), shift(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useClick(context),
    useRole(context),
  ]);

  return (
    <>
      <button
        className="notifications"
        type="button"
        aria-label="Open Notifications"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <FaRegBell />
      </button>
      {isOpen && (
        <>
          <div
            className="notifications-content-wrapper shadow m-2"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <>
              <div className="container notifications-content-header">
                <div className="row">
                  <div className="col text-start">Notifications</div>
                  <div className="col text-end notifications-close">
                    <span
                      aria-label="Close Notifications"
                      role="button"
                      onClick={() => setIsOpen(false)}
                    >
                      <MdOutlineClose />
                    </span>
                  </div>
                </div>
              </div>
              <div className="d-flex">
                <div className="align-items-center text-center justify-content-center">
                  {renderIcon()}
                  <div className="mt-4">
                    <h4 id={headingId}>No Notifications</h4>
                    <p>There are no notifications at this time.</p>
                  </div>
                </div>
              </div>
            </>
            <FloatingArrow
              fill={"#2f2f2f"}
              height={15}
              width={25}
              ref={arrowRef}
              context={context}
            />
          </div>
        </>
      )}
    </>
  );
}

export default Notifications;
