import { Dropdown } from "./components/dropdown";
import { LazyLoading } from "./components/intersection-observer/lazyLoading";

import cx from "./components/dropdown/index.module.scss";

const options = [
  { id: "1", text: "react" },
  { id: "2", text: "vue" },
];

export default function App() {
  return (
    <Dropdown items={options}>
      <Dropdown.Trigger />
      <Dropdown.List />
    </Dropdown>
  );
}
