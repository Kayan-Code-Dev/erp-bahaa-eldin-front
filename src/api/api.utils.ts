export const resolveError = (error: any) => {
  if (error.response) {
    let msg =
      error.response.data.message || "حدث خطأ. الرجاء المحاولة مرة أخرى.";
    if (error.response.data.errors) {
      for (const key in error.response.data.errors) {
        if (error.response.data.errors[key]) {
          msg += error.response.data.errors[key][0] + " ";
          break;
        }
      }
    }
    return msg;
  } else if (error.request) {
    // The request was made but no response was received
    return "No response from server. Please check your network connection.";
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || "An unexpected error occurred.";
  }
};

export const populateError = (error: any, msg: string) => {
  throw new Error(
    error instanceof Error ? error.message : error.message || msg
  );
};
