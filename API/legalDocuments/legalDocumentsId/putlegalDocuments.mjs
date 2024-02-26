import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        if (event.httpMethod === "PUT") {
            const documentData = JSON.parse(event.body);
            const document_id = parseInt(event.pathParameters.document_id, 10); // Obtener el ID del documento de la ruta del endpoint
            // Define las actualizaciones que deseas realizar en el documento
            let updateExpression = "SET";
            let expressionAttributeValues = {};
            let expressionAttributeNames = {};
            for (const key in documentData) {
                if (documentData.hasOwnProperty(key)) {
                    updateExpression += `#${key} = :${key}, `;
                    expressionAttributeValues[`:${key}`] = documentData[key];
                    expressionAttributeNames[`#${key}`] = key;
                }
            }
            updateExpression = updateExpression.slice(0, -2); // Eliminar la coma final
            // Ejecuta la operación de actualización en DynamoDB
            await ddbDocClient.send(new UpdateCommand({
                TableName: "legalDocuments",
                Key: { document_id: document_id },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ExpressionAttributeNames: expressionAttributeNames
            }));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Documento actualizado correctamente" }),
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "El método no está permitido" }),
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
