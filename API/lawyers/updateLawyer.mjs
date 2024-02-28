import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        if (event.requestContext.http.method !== "PUT") {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "El método no está permitido" }),
            };
        }

        const lawyerId = parseInt(event.pathParameters.lawyerId); // convert lawyerId to number
        const lawyerData = JSON.parse(event.body);

        if (!validateLawyerData(lawyerData)) {
            throw new Error("Los datos del abogado no están completos");
        }

        const expression = "set #n = :name, #s = :specialization, #c = :contact_info";
        const expressionValues = {
            ":name": lawyerData.name,
            ":specialization": lawyerData.specialization,
            ":contact_info": lawyerData.contact_info
        };
        const expressionAttributeNames = {
            "#n": "name",
            "#s": "specialization",
            "#c": "contact_info"
        };

        await ddbDocClient.send(new UpdateCommand({
            TableName: "lawyers",
            Key: { lawyer_id: lawyerId }, // use lawyerId instead of createLawyerId()
            UpdateExpression: expression,
            ExpressionAttributeValues: expressionValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: "UPDATED_NEW"
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Abogado actualizado exitosamente" }),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message }),
        };
    }
};

function validateLawyerData(lawyerData) {
    const requiredProperties = ["name", "specialization", "contact_info"];
    for (const prop of requiredProperties) {
        if (!lawyerData.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
}

export { handler };