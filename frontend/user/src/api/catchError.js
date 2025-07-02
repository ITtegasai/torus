export const catchError = (error) => {
    if (error.response) {
        return `${error.response.data.detail || 'Unknown error'}`;
    } else if (error.request) {
        return 'No response received from server';
    } else {
        return `Request error: ${error.message}`;
    }
}