import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        const id = parseInt(event.pathParameters.clientId, 10);

        const existingClient = await ddbDocClient.send(new GetCommand({
            TableName: "clients",
            Key: { client_id: id },
        }));

        if (existingClient.Item) {
            await ddbDocClient.send(new UpdateCommand({
                TableName: "clients",
                Key: { client_id: id },
                UpdateExpression: "SET is_active = :inactive",
                ExpressionAttributeValues: {
                    ":inactive": false
                },
                ReturnValues: "UPDATED_NEW"
            }));

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "is_active status successfully updated to false" }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Client not found" }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};

export { handler };