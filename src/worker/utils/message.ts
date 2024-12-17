export const postMessage2Main = (
  id: string,
  data?: unknown,
  options?: WindowPostMessageOptions
) => {
  try {
    self.postMessage(
      {
        id,
        data,
      },
      options
    );
  } catch (error) {
    self.postMessage(
      {
        id,
        data: { error, type: "error" },
      },
      options
    );
  }
};
