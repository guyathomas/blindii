import * as Dialog from "@radix-ui/react-dialog";
import * as Portal from "@radix-ui/react-portal";
import clsx from "clsx";
import React from "react";
import { XMark } from "@medusajs/icons";

const useWindowDimensions = () => {
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimensions;
};

type ModalState = {
  portalRef: any;
  isLargeModal?: boolean;
};

export const ModalContext = React.createContext<ModalState>({
  portalRef: undefined,
  isLargeModal: true,
});

export type ModalProps = {
  isLargeModal?: boolean;
  handleClose: () => void;
  open?: boolean;
  children?: React.ReactNode;
};

type ModalChildProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

type ModalHeaderProps = {
  handleClose: () => void;
  children?: React.ReactNode;
};

type ModalType = React.FC<ModalProps> & {
  Body: React.FC<ModalChildProps>;
  Header: React.FC<ModalHeaderProps>;
  Footer: React.FC<ModalChildProps>;
  Content: React.FC<ModalChildProps>;
};

const Overlay: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Dialog.Overlay className="bg-grey-90/40 fixed top-0 bottom-0 left-0 right-0 z-50 grid place-items-center overflow-y-auto">
      {children}
    </Dialog.Overlay>
  );
};

const Content: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { height } = useWindowDimensions();
  const style = {
    maxHeight: height - 64,
  };
  return (
    <Dialog.Content
      style={style}
      className="min-w-modal rounded-rounded bg-grey-0 overflow-x-hidden"
    >
      {children}
    </Dialog.Content>
  );
};

const MedusaModal: ModalType = ({
  open = true,
  handleClose,
  isLargeModal = true,
  children,
}) => {
  const portalRef = React.useRef(null);
  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Portal.Portal ref={portalRef}>
        <ModalContext.Provider value={{ portalRef, isLargeModal }}>
          <Overlay>
            <Content>{children}</Content>
          </Overlay>
        </ModalContext.Provider>
      </Portal.Portal>
    </Dialog.Root>
  );
};

MedusaModal.Body = ({ children, className, style }) => {
  return (
    <div
      style={style}
      className={clsx("inter-base-regular h-full", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

MedusaModal.Content = ({ children, className }) => {
  const { isLargeModal } = React.useContext(ModalContext);

  const { height } = useWindowDimensions();
  const style = {
    maxHeight: height - 90 - 141,
  };
  return (
    <div
      style={style}
      className={clsx(
        "overflow-y-auto px-8 pt-6",
        {
          ["w-largeModal pb-7"]: isLargeModal,
          ["pb-5"]: !isLargeModal,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

MedusaModal.Header = ({ handleClose = undefined, children }) => {
  return (
    <div
      className="flex w-full items-center border-b px-8 py-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-grow">{children}</div>
      <div className="self-end">
        {handleClose && (
          <button
            onClick={handleClose}
            className="text-grey-50 cursor-pointer border p-1.5"
          >
            <XMark />
          </button>
        )}
      </div>
    </div>
  );
};

MedusaModal.Footer = ({ children, className }) => {
  const { isLargeModal } = React.useContext(ModalContext);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "bottom-0 flex w-full px-7 pb-5",
        {
          "border-grey-20 border-t pt-4": isLargeModal,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

export default MedusaModal;

export const config = {};
