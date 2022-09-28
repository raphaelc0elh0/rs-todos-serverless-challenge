import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "rs-todos-serverless-challenge",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:*"],
        Resource: ["*"],
      },
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: ["*"],
      },
    ],
  },
  // import the function via paths
  functions: {
    createTodo: {
      handler: "src/functions/createTodo.handler",
      events: [
        {
          http: {
            path: "createTodo/{userid}",
            method: "post",
            cors: true,
          },
        },
      ],
    },
    getTodosByUser: {
      handler: "src/functions/getTodosByUser.handler",
      events: [
        {
          http: {
            path: "getTodosByUser/{userid}",
            method: "get",
            cors: true,
          },
        },
      ],
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },
  resources: {
    Resources: {
      dbTodos: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "todos",
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
            {
              AttributeName: "user_id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "UserIdIndex",
              KeySchema: [
                {
                  AttributeName: "user_id",
                  KeyType: "HASH",
                },
              ],
              Projection: { ProjectionType: "ALL" },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
