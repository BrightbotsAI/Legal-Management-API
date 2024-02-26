import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
    try {
        const id = parseInt(event.pathParameters.caseId, 10);
        //console.log('Transformed id:', id);
        const getCommand = new GetCommand({
            TableName: "legalCases",
            Key: { case_id: id },
        });
        const { Item } = await ddbDocClient.send(getCommand);
        if (!Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Case not found" }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(Item),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};