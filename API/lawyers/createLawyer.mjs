import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";


const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));


const handler = async (event, context) => {
    try {
        if (event.requestContext.http.method !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "The method is not allowed" }),
            };
        }

        const lawyerData = JSON.parse(event.body);
        //ID autoincrement
        const id = 2;
        const getCommand = new GetCommand({
            TableName: "identifiers",
            Key: { id: id },
        });
        const { Item } = await ddbDocClient.send(getCommand);
        console.log('Item: ', Item);
        
        
        // If item not found, return 404
        if (!Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Not found" })
            };
        }

        // Extract and parse the IdReference attribute
        const idReference = (Item.IdReference);

        // Increment the IdReference by 1
        const newId = idReference + 1;
        
        if (!validateLawyerData(lawyerData)) {
            throw new Error("The lawyer's data is incorrect");
        }
        
                // Update the IdReference attribute with the newId
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
        
        const newLawyer = {
            lawyer_id: newId,
            name: lawyerData.name,
            specialization: lawyerData.specialization,
            contact_info: lawyerData.contact_info,
            created_at: new Date().toISOString(),
            is_active: true,
        };

        await ddbDocClient.send(new PutCommand({
            TableName: "lawyers",
            Item: newLawyer,
        }));
        
        return {
            statusCode: 201,
            body: JSON.stringify(newLawyer),
            body: JSON.stringify({ message: "Lawyer Successfully created", ID: newId}),
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
    //Checks if the required properties are present and are not null or empty strings.
    const requiredProperties = ["name", "specialization", "contact_info"];
    for (const prop of requiredProperties) {
        const value = lawyerData[prop];
        if (!value || typeof value !== 'string' || value.trim() === "") {
            return false;
        }
    }

    //Check that the name contains only letters (and spaces), not numbers.
    const nameRegex = /^[a-zA-Z\s]*$/;
    if (!nameRegex.test(lawyerData.name)) {
        return false;
    }

    return true;
}

export { handler };