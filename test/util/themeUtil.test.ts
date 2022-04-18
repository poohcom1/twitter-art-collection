import { applyOpacity } from "../../src/util/themeUtil";

describe("themeUtil", () => {
  describe(applyOpacity.name, () => {
    it("should apply opacity to hex numbers", () => {
      expect(applyOpacity("#ffffff", 1)).toStrictEqual("#ffffffff");
    });

    it("should round hex opacity to the nearest integer", () => {
      expect(applyOpacity("#ffffff", 0.5)).toStrictEqual("#ffffff80");
    });

    it("should pad single digits with zeroes", () => {
      expect(applyOpacity("#ffffff", 0)).toStrictEqual("#ffffff00");
    });

    it("should apply opacity to hex numbers with existing opacity", () => {
      expect(applyOpacity("#ffffffee", 1)).toStrictEqual("#ffffffff");
    });

    it("should apply opacity to rgb colors", () => {
      expect(applyOpacity("rgb(255, 255, 255)", 0.5)).toStrictEqual(
        "rgb(255, 255, 255, 0.5)"
      );
    });

    it("should apply opacity to rgba colors", () => {
      expect(applyOpacity("rgba(255, 255, 255, 0.7)", 0.5)).toStrictEqual(
        "rgba(255, 255, 255, 0.5)"
      );
    });

    it("should apply opacity to rgba colors with interger opacities", () => {
      expect(applyOpacity("rgba(255, 255, 255, 1)", 0.5)).toStrictEqual(
        "rgba(255, 255, 255, 0.5)"
      );
    });

    it("should ignore transparent colors", () => {
      expect(applyOpacity("transparent", 0.5)).toStrictEqual("transparent");
    });

     it("should apply opacity to named colors", () => {
       expect(applyOpacity("red", 0.5)).toStrictEqual("#ff000080");
     });
  });
});
