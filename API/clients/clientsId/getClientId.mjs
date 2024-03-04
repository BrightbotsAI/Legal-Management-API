import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
    console.log('event: ', event);
    try {
        
        const id = parseInt(event.pathParameters.clientId, 10); // Obtener el ID de la ruta
        console.log('ID: ', id);
        if (isNaN(id) || id <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid ID" }),
            };
        }
        const getCommand = new GetCommand({
            TableName: "clients",
            Key: { client_id: id }, // Utilizar el nombre correcto del atributo de partición
        });
        const { Item } = await ddbDocClient.send(getCommand);
        if (!Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Client not found" }),
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