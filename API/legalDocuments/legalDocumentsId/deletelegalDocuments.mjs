import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        if (event.httpMethod === "DELETE") {
            const documentData = JSON.parse(event.body);
            const document_id = parseInt(event.pathParameters.document_id, 10); // Obtener el ID del documento de la ruta del endpoint

            if (isNaN(document_id)) { // Verificar si la conversión fue exitosa
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "The number ID is not valid" }),
                };
            }

            const getDocumentParams = {
                TableName: "legalDocuments",
                Key: { document_id: document_id }
            };

            const { Item: documentItem } = await ddbDocClient.send(new GetCommand(getDocumentParams));

            if (!documentItem) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "Error 404: User not found" }),
                };
            }
            if(documentItem.status === false){
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "The user is disabled" }),
                };
            }else{
                // Ejecuta la operación de actualización en DynamoDB
                await ddbDocClient.send(new UpdateCommand({
                    TableName: "legalDocuments",
                    Key: { document_id: document_id },
                    UpdateExpression: "SET #s = :status",
                    ExpressionAttributeValues: {
                        ":status": false // Establecer el valor de "status" a false
                    },
                    ExpressionAttributeNames: {
                        "#s": "status"
                    }
                }));
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: "The user was delete" }),
                };
            }
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "The fields are not complete" }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message }),
        };
    }
};

export { handler };
