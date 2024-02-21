const handleAsyncOperation = async (operation, errorMessage) => {
    try {
      return await operation();
    } catch (error) {
      throw new ApiError(500, errorMessage || "Something went wrong");
    }
  };
  
  const generateAccessAndRefereshTokens = async (userId) => {
    return await handleAsyncOperation(async () => {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    }, "Something went wrong while generating refresh and access token");
  };
  
  /* some other methods which i can use.

  const { fullName, email, username, password } = req.body;
const errors = [];

if (!fullName || fullName.trim() === "") {
    errors.push("Please enter a value in the full name field.");
}

if (!email || email.trim() === "") {
    errors.push("Please enter a value in the email field.");
}

if (!username || username.trim() === "") {
    errors.push("Please enter a value in the username field.");
}

if (!password || password.trim() === "") {
    errors.push("Please enter a value in the password field.");
}

if (errors.length > 0) {
    // There are empty fields, return the corresponding error messages
    return next(new ApiError(400, errors.join(" ")));
}

// Continue with the rest of your logic if all fields are provided
*/