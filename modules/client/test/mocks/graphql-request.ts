import { gql, GraphQLClient } from "graphql-request";

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
  return client;
}

// Mocking gql template function
const gqlMocked: jest.Mock = gql as jest.Mock; // typecasting here because we get already the mocked instance
gqlMocked.mockImplementation(
  // @ts-ignore Ignoring here because variables isn't in use
  (chunks: TemplateStringsArray, ...variables: any[]) => {
    return chunks[0]; // return the first entry. We always only have one chunk because we don't use advanced features of the gql template function
  },
);
