import { queryParam, queryParams } from "src/query-param";

describe("query-param.ts", () => {
  const { location } = window;

  beforeAll(() => {
    delete window.location;
    window.location = {} as any;
  });

  afterAll(() => {
    window.location = location;
  });

  describe("queryParams()", () => {
    it("should return an object mapping of all query params", () => {
      window.location.search = "?foo=bar&baz=qux";
      expect(queryParams()).toEqual({ foo: "bar", baz: "qux" });
    });
    it("should decode uri escape sequences", () => {
      window.location.search = "?%25foo=%25bar&baz%25=qux%25";
      expect(queryParams()).toEqual({ "%foo": "%bar", "baz%": "qux%" });
    });
  });
  describe("queryParam()", () => {
    it("should return a specific query parameter", () => {
      window.location.search = "?foo=bar&baz=qux";
      expect(queryParam("foo")).toEqual("bar");
    });
  });
});
