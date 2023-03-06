import { GraphQLClient } from "graphql-request";

jest.mock("graphql-request");

export function mockUpCheck(client: jest.Mocked<GraphQLClient>) {
  client.request.mockResolvedValueOnce({
    _meta: {
      deployment: "Deployment",
    },
  });
}

// Only for typescript to be happy
export function getMockedInstance(
  client: any, // needed to bypass wrong typecheck
): jest.Mocked<GraphQLClient> {
  mockUpCheck(client);
  return client;
}
