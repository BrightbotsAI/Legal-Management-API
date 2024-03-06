import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        const caseId = parseInt(event.pathParameters.caseId, 10);
        const legalCaseData = JSON.parse(event.body);

        const existingLegalCase = await ddbDocClient.send(new GetCommand({
            TableName: "legalCases",
            Key: { case_id: caseId },
        }));

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

            if (expression) {
                expression = expression.slice(0, -2);
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "No data provided for update" }),
                };
            }
        
            expression = "SET " + expression;
        
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
            const { case_id, case_title, court, created_at, date_field, relevant_statutes, summary } = legalCaseData;

            if (!case_id || !case_title || !court || !created_at || !date_field || !relevant_statutes || !summary) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "case_id, case_title, court, created_at, date_field, relevant_statutes, and summary are required." }),
                };
            }

            const newLegalCase = {
                case_id, case_title, court, created_at: new Date().toISOString(), date_field, relevant_statutes, summary
            };

            await ddbDocClient.send(new PutCommand({
                TableName: "legalCases",
                Item: newLegalCase
            }));

            return {
                statusCode: 201,
                body: JSON.stringify({ message: "Legal Case Created because it wasn't stored before" }),
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

export { handler };