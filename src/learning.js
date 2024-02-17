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
  