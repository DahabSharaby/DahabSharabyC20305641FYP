import renderer from "react-test-renderer";
import MainScreen from "../screens/MainScreen";

it("renders correctly", () => {
  const tree = renderer.create(<MainScreen />).toJSON();
  expect(tree).toMatchSnapshot();
});
