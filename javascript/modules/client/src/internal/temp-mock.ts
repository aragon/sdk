export const delay = (delayInms: number) => {
  const isTest = typeof process !== "undefined";
  let delay = delayInms;
  if (isTest) {
    delay = 1;
  }
  return new Promise((resolve) => setTimeout(resolve, delay));
};

