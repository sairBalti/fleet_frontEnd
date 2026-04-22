import { VALIDATION_MESSAGES } from "./validationMessages.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const hasWords = (text) => {
    return /[a-zA-Z]/.test(text); // must contain letters
};

export const validateAICommand = ({ message, file }) => {

    //  nothing provided
    if (!message?.trim() && !file) {
        return VALIDATION_MESSAGES.REQUIRED_INPUT;
    }

    if (message && !hasWords(message)) {
        return "Please enter a valid command (e.g., Add company ABC with business type )";
    }

    //  file validation
    if (file) {
        const allowedTypes = [
            "text/csv",
            "application/pdf",
            "application/xml",
            "image/png",
            "image/jpeg",
            "image/jpg"
        ];

        if (!allowedTypes.includes(file.type)) {
            return VALIDATION_MESSAGES.INVALID_FILE_TYPE;
        }

        if (file.size > MAX_FILE_SIZE) {
            return VALIDATION_MESSAGES.FILE_TOO_LARGE;
        }
    }

    //  command basic validation
    if (message && message.length < 3) {
        return VALIDATION_MESSAGES.INVALID_COMMAND;
    }

    return null; //  valid
};