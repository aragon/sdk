import { runAndRetry } from "../../src";

describe("Run and retry", () => {
    it("Should run and retry 3 times", async () => {
        let countFunc = 0;
        let countOnFail = 0;
        
        await runAndRetry({
          func: async () => {
            if(countFunc < 3) countFunc++;
            else throw new Error();
          },
          onFail: () => {
            countOnFail++;
          },
          shouldRetry: () => {
            return true;
          }
        });
        
        expect(countFunc).toBe(3);
        expect(countOnFail).toBe(3);
    });
    it("Should run and throw", async () => {
        expect(async () => {
            await runAndRetry({
              func: () => { throw new Error() },
              onFail: () => {},
              shouldRetry: () => false
            });
          }).toThrow()
    });
})