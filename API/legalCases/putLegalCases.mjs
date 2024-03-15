import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        const caseId = parseInt(event.pathParameters.caseId, 10);
        const legalCaseData = JSON.parse(event.body);

        console.log("Received legal case data:", legalCaseData);

        // Validate input data
        if (!validateInputData(legalCaseData)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid input data" })
            };
        }

        const existingLegalCase = await ddbDocClient.send(new GetCommand({
            TableName: "legalCases",
            Key: { case_id: caseId },
        }));

        console.log("Existing legal case:", existingLegalCase.Item);

        if (existingLegalCase.Item) {
            let expression = "";
            let expressionValues = {};
            let expressionAttributeNames = {};
                        
            if (legalCaseData.case_title) {
                expression += "#ct = :ct, ";
                expressionValues[":ct"] = legalCaseData.case_title;
                expressionAttributeNames["#ct"] = "case_title";
            }
            
            if (legalCaseData.court) {
                expression += "#c = :c, ";
                expressionValues[":c"] = legalCaseData.court;
                expressionAttributeNames["#c"] = "court";
            }
            
            if (legalCaseData.created_at) {
                expression += "#ca = :ca, ";
                expressionValues[":ca"] = legalCaseData.created_at;
                expressionAttributeNames["#ca"] = "created_at";
            }
            
            if (legalCaseData.date_field) {
                expression += "#df = :df, ";
                expressionValues[":df"] = legalCaseData.date_field;
                expressionAttributeNames["#df"] = "date_field";
            }
            
            if (legalCaseData.relevant_statutes) {
                expression += "#rs = :rs, ";
                expressionValues[":rs"] = legalCaseData.relevant_statutes;
                expressionAttributeNames["#rs"] = "relevant_statutes";
            }
            
            if (legalCaseData.summary) {
                expression += "#s = :s, ";
                expressionValues[":s"] = legalCaseData.summary;
                expressionAttributeNames["#s"] = "summary";
            }

            if (legalCaseData.client_id) {
                expression += "#cid = :cid, ";
                expressionValues[":cid"] = legalCaseData.client_id;
                expressionAttributeNames["#cid"] = "client_id";
            }
            
            if (legalCaseData.lawyer_id) {
                expression += "#lid = :lid, ";
                expressionValues[":lid"] = legalCaseData.lawyer_id;
                expressionAttributeNames["#lid"] = "lawyer_id";
            }

            if (expression) {
                expression = expression.slice(0, -2);
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "No data provided for update" }),
                };
            }
        
            expression = "SET " + expression;
        
            console.log("Update expression:", expression);
            console.log("Expression attribute values:", expressionValues);
            console.log("Expression attribute names:", expressionAttributeNames);
        
            await ddbDocClient.send(new UpdateCommand({
                TableName: "legalCases",
                Key: { case_id: caseId },
                UpdateExpression: expression,
                ExpressionAttributeValues: expressionValues,
                ExpressionAttributeNames: expressionAttributeNames,
                ReturnValues: "UPDATED_NEW"
            }));
        
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Legal Case successfully updated" }),
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Legal Case ID Not found" }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};

function validateInputData(data) {
    // Validate fields that are supposed to be integers
    if (data.client_id && !Number.isInteger(data.client_id)) {
        return false;
    }
    if (data.lawyer_id && !Number.isInteger(data.lawyer_id)) {
        return false;
    }

    // Validate fields that are supposed to be strings and not empty
    const stringFields = ["case_title", "court", "date_filed", "relevant_statutes", "summary"];
    for (const field of stringFields) {
        if (data[field] && (typeof data[field] !== "string" || data[field].trim() === "")) {
            return false;
        }
    }

    return true;
}

export { handler };
