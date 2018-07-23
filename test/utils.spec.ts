import {findInstalledBeautifiers} from "../src/utils";

test("findInstalledBeautifiers", () => {
    expect.assertions(2);
    return findInstalledBeautifiers().then(beautifierNames => {
        expect(beautifierNames).toHaveLength(1);
        expect(beautifierNames).toMatchSnapshot();
    });
});
