import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));


const handler = async (event, context) => {
    try {
        if (event.requestContext.http.method === "POST") {
            // Código para manejar solicitudes POST (Agregar un documento)
            const documentData = JSON.parse(event.body);
            if (!validateDocumentData(documentData)) {
                throw new Error("Los datos del documento no estan completos");
            }
            const newDocument = {
                document_id: documentData.document_id,
                case_id: documentData.case_id,
                title: documentData.title,
                case_title: documentData.case_title,
                author: documentData.author,
                data_published: documentData.data_published,
                content: documentData.content,
                tags: documentData.tags,
                created_at: documentData.created_at
            };
            await ddbDocClient.send(new PutCommand({
                TableName: "legalDocuments",
                Item: newDocument,
            }));
            return {
                statusCode: 201,
                body: JSON.stringify(newDocument),
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "El método no esta permitido" }),
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

function validateDocumentData(documentData) {
    const requiredProperties = ["case_id", "title" ,"author", "data_published", "content", "tags", "created_at"];
    for (const prop of requiredProperties) {
        if (!documentData.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
}

export { handler };