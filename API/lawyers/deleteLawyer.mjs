import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        if (event.requestContext.http.method !== "DELETE") {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "The method is not allowed" }),
            };
        }

        const lawyerId = parseInt(event.pathParameters?.lawyerId, 10);

        //Check if the item exists
        const getParams = {
            TableName: "lawyers",
            Key: {
                lawyer_id: lawyerId,
            },
        };

        const { Item } = await ddbDocClient.send(new GetCommand(getParams));

        //If the item does not exist or is already deactivated, return error
        if (!Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "The lawyer was not found" }),
            };
        }
        if (Item.is_active === false) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "The lawyer was not found" }),
            };
        }

        //Proceeds with the update if the item exists and is active
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
    
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Lawyer eliminated" }),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};

export { handler };
