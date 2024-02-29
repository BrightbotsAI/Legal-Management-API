import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";


const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

let nextId = 1;

const createLawyerId = () => {
  const id = nextId++;
  return id;
};

const handler = async (event, context) => {
    try {
        if (event.requestContext.http.method !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "El método no está permitido" }),
            };
        }

        const lawyerData = JSON.parse(event.body);

        if (!validateLawyerData(lawyerData)) {
            throw new Error("Los datos del abogado no están completos");
        }

        const newLawyer = {
            lawyer_id: createLawyerId(),
            name: lawyerData.name,
            specialization: lawyerData.specialization,
            contact_info: lawyerData.contact_info,
            created_at: new Date().toLocaleDateString(),
            is_active: true,
        };

        await ddbDocClient.send(new PutCommand({
            TableName: "lawyers",
            Item: newLawyer,
        }));

        return {
            statusCode: 201,
            body: JSON.stringify(newLawyer),
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