function filterActiveLawyers(lawyers) {
    return lawyers.filter(lawyer => lawyer.is_active).map(({ is_active, ...parsedLawyer }) => parsedLawyer);
}

export function parsePathParameterToInt(parameterName, event) {
    const parameterValue = event.pathParameters?.[parameterName];
    return parseInt(parameterValue, 10); 
}

export function parseQueryParamToInt(queryParams, paramName, defaultValue) {
    if (!queryParams  || !queryParams[paramName]) {
        return defaultValue;
    }
    const parsedValue = parseInt(queryParams[paramName], 10);
    return isNaN(parsedValue) ? defaultValue : parsedValue;
}
export default filterActiveLawyers;
