import {
  Dispatch,
  KeyboardEvent,
  PropsWithChildren,
  SetStateAction,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import cn from "./index.module.scss";

type DropdownItemType = {
  id: string;
  text: string;
};

type DropdownContextValues = {
  items: DropdownItemType[];
  isOpen: boolean;
  selectedIndex: number; // 선택된 item의 index
  focusedIndex: number; // 키보드 이벤트로 포커스 된 item의 index
};

type DropdownDispatchContextValues = {
  setItems: Dispatch<SetStateAction<DropdownItemType[]>>;
  toggle: (force?: boolean) => void;
  selectIndex: Dispatch<SetStateAction<number>>; // item을 선택하는 함수
  focusIndex: Dispatch<SetStateAction<number>>;
  handleKeyDown: (e: KeyboardEvent) => void;
};

const DropdownContext = createContext<DropdownContextValues | null>(null);
const DropdownDispatchContext =
  createContext<DropdownDispatchContextValues | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (context == null) {
    throw new Error("Provider 안에서만 사용할 수 있습니다.");
  }
  return context;
};

const useSetDropdown = () => {
  const context = useContext(DropdownDispatchContext);
  if (context == null) {
    throw new Error("Provider 안에서만 사용할 수 있습니다.");
  }
  return context;
};

/** @description 키보드 이벤트 */
type KeyEventHandler = (
  e: KeyboardEvent,
  values: Pick<
    DropdownContextValues,
    "focusedIndex" | "selectedIndex" | "items"
  > &
    Pick<DropdownDispatchContextValues, "focusIndex" | "selectIndex" | "toggle">
) => void;
// 강제로 지정해도 됨 ArrowUp | | |
const KeyEventMap: Partial<Record<KeyboardEvent["key"], KeyEventHandler>> = {
  ArrowUp: (e, { focusIndex, items }) => {
    focusIndex((prev) => (items.length + prev - 1) % items.length);
  },

  ArrowDown: (e, { focusIndex, items }) => {
    focusIndex((prev) => (items.length + prev + 1) % items.length);
  },

  Enter: (e, { selectIndex, focusedIndex }) => {
    selectIndex(focusedIndex);
  },

  Escape: (e, { toggle }) => {
    toggle(false);
  },
};

const DropdownProvider = ({
  children,
  items: init,
}: PropsWithChildren<Pick<DropdownContextValues, "items">>) => {
  const [items, setItems] = useState<DropdownItemType[]>(init);
  const [isOpen, setIsOpen] = useState(false);

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const toggle = (force?: boolean) => {
    return setIsOpen((prev) => (typeof force === "boolean" ? force : !prev));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    const handler = KeyEventMap[key];

    if (handler)
      handler(e, {
        selectIndex: setSelectedIndex,
        focusIndex: setFocusedIndex,
        focusedIndex,
        selectedIndex,
        toggle,
        items,
      });
  };

  return (
    <DropdownContext.Provider
      value={{ items, isOpen, focusedIndex, selectedIndex }}
    >
      <DropdownDispatchContext.Provider
        value={{
          toggle,
          focusIndex: setFocusedIndex,
          selectIndex: setSelectedIndex,
          setItems,
          handleKeyDown,
        }}
      >
        {children}
      </DropdownDispatchContext.Provider>
    </DropdownContext.Provider>
  );
};

const Root = ({
  children,
  items,
}: PropsWithChildren<Pick<DropdownContextValues, "items">>) => {
  return (
    <DropdownProvider items={items}>
      <div className={cn.Dropdown}>{children}</div>
    </DropdownProvider>
  );
};

const Container = ({ children }: PropsWithChildren) => {
  const { handleKeyDown } = useSetDropdown();

  return <div onKeyDown={handleKeyDown}>{children}</div>;
};

const Trigger = () => {
  const { selectedIndex, items } = useDropdown();
  const { toggle } = useSetDropdown();

  const selectedItem = items[selectedIndex];

  return (
    <button className={cn["button-toggle"]} onClick={() => toggle()}>
      <span className={cn.text}>{selectedItem?.text || "선택해주세요."}</span>
    </button>
  );
};

const Item = forwardRef<
  HTMLLIElement,
  { item: DropdownItemType; index: number }
>(({ item, index }, ref) => {
  const { selectedIndex, focusedIndex } = useDropdown();
  const { selectIndex } = useSetDropdown();

  return (
    <li
      ref={ref}
      className={cn.item}
      role="option"
      aria-selected={selectedIndex === index}
      aria-current={focusedIndex === index}
    >
      <button onClick={() => selectIndex(index)}>
        <span>{item.text}</span>
      </button>
    </li>
  );
});

const List = () => {
  const { items, isOpen, focusedIndex } = useDropdown();
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    itemsRef.current[focusedIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [focusedIndex]);

  if (!isOpen) return null;

  return (
    <ul className={cn.DropdownList}>
      {items.map((item, index) => {
        return (
          <Item
            key={item.id}
            item={item}
            index={index}
            ref={(node) => {
              itemsRef.current[index] = node;
            }}
          />
        );
      })}
    </ul>
  );
};

export const Dropdown = Object.assign(Root, { Trigger, List, Item, Container });
