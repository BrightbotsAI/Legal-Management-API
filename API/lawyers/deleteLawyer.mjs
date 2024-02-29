import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        if (event.requestContext.http.method !== "DELETE") {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "El método no está permitido" }),
            };
        }

        const lawyerId = parseInt(event.pathParameters?.lawyerId, 10)

        const updateParams = {
            TableName: "lawyers",
            Key: {
                lawyer_id: lawyerId,
            },
            UpdateExpression: "set is_active = :is_active",
            ExpressionAttributeValues: {
                ":is_active": false,
            },
            ReturnValues: "UPDATED_NEW",
        };

        const result = await ddbDocClient.send(new UpdateCommand(updateParams));

        if (result.Attributes.length === 0) {
            throw new Error("El abogado no existe o ya no está activo");
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Attributes),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: error.statusCode || 400,
            body: JSON.stringify({ message: error.message }),
        };
    }
};

export { handler };