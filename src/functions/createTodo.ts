import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { dynamodb } from "src/service/dynamodb";
import { v4 as uuidV4 } from "uuid";

interface IBody {
  title: string;
  deadline: string;
}

const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { userid } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as IBody;

  console.log(deadline, new Date(deadline));

  await dynamodb
    .put({
      TableName: "todos",
      Item: {
        id: uuidV4(),
        user_id: userid,
        title,
        done: false,
        deadline: new Date(deadline).toISOString(),
      },
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Todo created successfully",
    }),
  };
};

export { handler };
