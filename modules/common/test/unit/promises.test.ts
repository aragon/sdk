import { runAndRetry } from "../../src";

describe("Run and retry", () => {
  it("Should run and retry 3 times", async () => {
    let countFunc = 0;
    let countOnFail = 0;

    await runAndRetry({
      func: async () => {
        if (countFunc < 3) {
          countFunc++;
          throw new Error();
        }
        // else throw new Error();
      },
      onFail: () => countOnFail++,
      shouldRetry: () => true,
    });

    expect(countFunc).toBe(3);
    expect(countOnFail).toBe(3);
  });
  it("Should run and throw", async () => {
    let countRetries = 0;
    expect(async () => {
      await runAndRetry({
        func: () => {
          countRetries++;
          throw new Error();
        },
        shouldRetry: () => countRetries < 3,
      });
    }).rejects.toThrow();
    expect(countRetries).toBe(3);
  });
});
