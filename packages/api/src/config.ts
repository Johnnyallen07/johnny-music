export const API_CONFIG = {
    bucketUrl: "",
    apiBaseUrl: "", // For backend API calls
};

export const setApiConfig = (config: { bucketUrl: string; apiBaseUrl?: string }) => {
    API_CONFIG.bucketUrl = config.bucketUrl;
    if (config.apiBaseUrl) {
        API_CONFIG.apiBaseUrl = config.apiBaseUrl;
    }
};
