import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async () => {
    try {
        const scanCommand = new ScanCommand({
            TableName: "legalCases",
        });

        const { Items } = await ddbDocClient.send(scanCommand);

        return {
            statusCode: 200,
            body: JSON.stringify(Items),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};