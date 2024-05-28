import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
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
  selectIndex: (index: number) => void; // item을 선택하는 함수
  focusIndex: (index: number) => void;
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
        }}
      >
        <div className={cn.Dropdown}>{children}</div>
      </DropdownDispatchContext.Provider>
    </DropdownContext.Provider>
  );
};

const Root = ({
  children,
  items,
}: PropsWithChildren<Pick<DropdownContextValues, "items">>) => {
  return <DropdownProvider items={items}>{children}</DropdownProvider>;
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

const Item = ({ item, index }: { item: DropdownItemType; index: number }) => {
  const { focusedIndex, selectedIndex } = useDropdown();
  const { selectIndex } = useSetDropdown();
  return (
    <li
      className={cn.item}
      role="option"
      aria-selected={selectedIndex === index}
      aria-current={selectedIndex === index}
    >
      <button onClick={() => selectIndex(index)}>
        <span>{item.text}</span>
      </button>
    </li>
  );
};

const List = () => {
  const { items, isOpen } = useDropdown();

  if (!isOpen) return null;
  return (
    <ul className={cn.DropdownList}>
      {items.map((item, index) => {
        return <Item key={item.id} item={item} index={index} />;
      })}
    </ul>
  );
};

export const Dropdown = Object.assign(Root, { Trigger, List, Item });
