import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        const caseId = parseInt(event.pathParameters.caseId, 10);
        // Check if the item with the provided caseId exists
        const existingLegalCase = await ddbDocClient.send(new GetCommand({
            TableName: "legalCases",
            Key: { case_id: caseId },
        }));
        // If the item does not exist, return a 404 error
        if (!existingLegalCase.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Legal Case not found" }),
            };
        }
        // If the item exists and is already inactive, return a message indicating it's not found
        if (!existingLegalCase.Item.is_active) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Legal Case not found" }),
            };
        }
        // Update the is_active attribute to false
        await ddbDocClient.send(new UpdateCommand({
            TableName: "legalCases",
            Key: { case_id: caseId },
            UpdateExpression: "SET is_active = :inactive",
            ExpressionAttributeValues: {
                ":inactive": false
            },
            ReturnValues: "UPDATED_NEW"
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Legal Case successfully deleted" }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
export { handler };
