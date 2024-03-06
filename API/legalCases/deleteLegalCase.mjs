import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        const caseId = parseInt(event.pathParameters.caseId, 10);

        const existingLegalCase = await ddbDocClient.send(new GetCommand({
            TableName: "legalCases",
            Key: { case_id: caseId },
        }));

        if (existingLegalCase.Item) {
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
                body: JSON.stringify({ message: "is_active status successfully updated to false" }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Legal case not found" }),
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
