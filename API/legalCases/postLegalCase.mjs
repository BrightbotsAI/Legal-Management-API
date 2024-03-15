import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
    try {
        const id = 3;
        const getCommand = new GetCommand({
            TableName: "identifiers",
            Key: { id: id },
        });
        const { Item } = await ddbDocClient.send(getCommand);

        if (!Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Item not found" })
            };
        }
        const idReference = Item.IdReference;
        const newId = idReference + 1;

        const { case_id, case_title, court, date_filed, relevant_statutes, summary, client_id, lawyer_id, is_active} = JSON.parse(event.body);

        // Validations
        if (!validateInputString(case_title) || !validateInputString(court) || !validateInputString(relevant_statutes) || !validateInputString(summary) || !validateNumber(client_id) || !validateNumber(lawyer_id) || !validateTimestamp(date_filed)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid input data. Remember correct ussage of strings or integers." })
            };
        }

        const newLegalCase = {
            case_id: newId,case_title,court,created_at: new Date().toISOString(),date_filed,relevant_statutes,summary,client_id,lawyer_id,is_active: true
        };
        await ddbDocClient.send(new PutCommand({
            TableName: "legalCases",
            Item: newLegalCase,
        }));
        const updateParams = {
            TableName: "identifiers",
            Key: { id: id },
            UpdateExpression: "SET IdReference = :newId",
            ExpressionAttributeValues: {
                ":newId": newId
            },
            ReturnValues: "ALL_NEW",
        };
        const updateCommand = new UpdateCommand(updateParams);
        const { Attributes } = await ddbDocClient.send(updateCommand);

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Legal Case Successfully created", ID: newId}),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
function validateInputString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
function validateNumber(value) {
    return Number.isInteger(value);
}
function validateTimestamp(value) {
    return !isNaN(Date.parse(value));
}
