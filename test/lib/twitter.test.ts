import { mergeTweets, updateAndFindOrphans } from "../../lib/twitter";

describe("twitter lib", () => {
  describe(`${mergeTweets.name} unit test`, () => {
    it("should merge arrays with overlap without repeat", () => {
      const upstream = ['1', '2', '3', '4', '5']
      const database = ['4', '5', '6']

      const merged = mergeTweets(upstream, database)

      expect(merged).toStrictEqual(['1', '2', '3', '4', '5', '6'])
    })
    it("should concat arrays with no overlap", () => {
      const upstream = ['1', '2', '3', '4', '5']
      const database = ['7', '8', '9']

      const merged = mergeTweets(upstream, database)

      expect(merged).toStrictEqual(['1', '2', '3', '4', '5', '7', '8', '9'])
    })
  })
  describe(`${updateAndFindOrphans.name} unit test`, () => {
    const total = 750; // total data nodes

    let database: string[] = [];
    let upstream: string[] = [];

    beforeEach(() => {
      database = [];
      upstream = [];

      for (let i = 0; i < total; i++) {
        database.push("" + i);
        upstream.push("" + i);
      }
    });

    it("should match upstream when node 0 is removed", () => {
      upstream.splice(0, 1);

      const { updated } = updateAndFindOrphans(
        database,
        upstream.slice(0, 100),
        0,
        100
      );

      expect(updated).toStrictEqual(upstream);
    });

    it("should match upstream when middle node of page 0 is removed", () => {
      upstream.splice(50, 1);

      const { updated } = updateAndFindOrphans(
        database,
        upstream.slice(0, 100),
        0,
        100
      );

      expect(updated).toStrictEqual(upstream);
    });

    it("should match upstream when last node of page 0 is removed", () => {
      upstream.splice(99, 1);

      const { updated } = updateAndFindOrphans(
        database,
        upstream.slice(0, 100),
        0,
        100
      );

      expect(updated).toStrictEqual(upstream);
    });

    it("should match upstream when first node of page 1 is removed", () => {
      upstream.splice(100, 1);

      const { updated } = updateAndFindOrphans(
        database,
        upstream.slice(100, 200),
        1,
        100
      );

      expect(updated).toStrictEqual(upstream);
    });

    it("should match upstream when middle node of page 1 is removed", () => {
      upstream.splice(150, 1);

      const { updated } = updateAndFindOrphans(
        database,
        upstream.slice(100, 200),
        1,
        100
      );

      expect(updated).toStrictEqual(upstream);
    });

    it("should match upstream when last node is removed", () => {
      upstream.splice(total - 1, 1);

      const { updated } = updateAndFindOrphans(
        database,
        upstream.slice(700, 800),
        7,
        100
      );

      expect(updated).toStrictEqual(upstream);
    });

    it("should find nothing if database is empty", () => {
      database = [];

      const { deleted } = updateAndFindOrphans(
        database,
        upstream.slice(0, 100),
        0,
        100
      );

      expect(deleted).toHaveLength(0);
    });

    it("should find orphans when database is smaller", () => {
      upstream.slice(50, 1);
      database = database.slice(0, 80);

      const { updated } = updateAndFindOrphans(
        database,
        upstream.slice(0, 100),
        0,
        100
      );

      expect(updated).toStrictEqual(upstream.slice(0, database.length));
    });
  });
});
