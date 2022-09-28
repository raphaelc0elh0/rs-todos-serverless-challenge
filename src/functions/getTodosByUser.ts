import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { dynamodb } from "src/service/dynamodb";

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { userid } = event.pathParameters;

  const response = await dynamodb
    .query({
      TableName: "todos",
      IndexName: "UserIdIndex",
      KeyConditionExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": userid,
      },
    })
    .promise();

  const hasItem = response.Items[0];

  if (hasItem) {
    return {
      statusCode: 201,
      body: JSON.stringify(response.Items),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "User has no TODOS",
      }),
    };
  }
};

export { handler };
