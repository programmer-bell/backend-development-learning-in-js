import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave : false });
    return { accessToken , refreshToken }
  } catch(error) {
    throw new ApiError(500,"Somethings went wrong while generating refresh and access token");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  console.log(email);

  if ([fullName, email, username, password].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath || !coverImageLocalPath) {
    throw new ApiError(400, "Avatar and Cover image are required");
  }

  const avatarUploadResponse = await uploadToCloudinary(avatarLocalPath);
  const coverImageUploadResponse = await uploadToCloudinary(coverImageLocalPath);

  if (!avatarUploadResponse?.url || !coverImageUploadResponse?.url) {
    throw new ApiError(500, "Image upload failed");
  }

  const user = await User.create({
    fullName,
    avatar: avatarUploadResponse.url,
    coverImage: coverImageUploadResponse.url,
    email,
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (typeof password !== "string") {
    throw new ApiError(400, "Password must be a string");
  }

  if (!username && !email || !password) {
    throw new ApiError(400, "Username, email, and password are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged In Successfully"
      )
    );
});


const loggedOutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken : undefined
      }
    },
      {
        new : true
      }
  )

    const options = {
    httpOnly : true,
    secure : true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out"))

});


const refreshAccessToken = asyncHandler(async(req,res) => {
  const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;

  if(incommingRefreshToken){
    throw new ApiError(401,"Unauthorized request");
  }
  
  try {
    const decodedToken = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?._id);
    
    if(!user){
      throw new ApiError(401,"Invalid refresh token");
    }
  
    if(incommingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used");
    }
  
    const options = {
      httpOnly : true,
      secure : true
    }
  
    const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id);
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken.options)
    .json(
      new ApiResponse(200,{
        accessToken, refreshToken: newrefreshToken
      },
      "Access token refreshed")
    )
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
  }
});


const changeCurrentPassword = asyncHandler(async(req,res) => {
  const {oldPassword, newPassword} = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid old password");
  }
    user.password = newPassword;
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password change Successfully!!"))

});

const getCurrnetUser = asyncHandler(async(req,res) => {
  return res
  .status(200)
  .json(200,req.user,"Current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async(req,res) => {
  const { fullName , email } = req.body;

  if(!fullName || !email){
    throw new ApiError(400,"All fileds are required")
  }

  const user = User.findByIdAndUpdate(
    res.user?._id,
    {
      $set : {
        fullName,
        email:email,
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account details update successfully"))
});


const  updateUserAvatar = asyncHandler(async(req,res) =>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avater file is missing")
  }
  const avatar = await uploadToCloudinary(avatarLocalPath);
  
  if(!avatar.url){
    throw new ApiError(400,"Error while up uploading on avatar")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar : avatar.url
      }
    },
    {new : true}
  ).select("-password")

   return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Avatar image updated successfully")
  )
});

const  updateUserCoverImage = asyncHandler(async(req,res) =>{
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400,"Avate file is missing")
  }
  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  
  if(!coverImage.url){
    throw new ApiError(400,"Error while up uploading on avatar")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage : coverImage.url
      }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"Cover image updated successfully")
  )
});

const getUserChannelProfile = asyncHandler(async(req,res) =>{
  const {username} = req.params;

  if(!username?.trim()){
    throw new ApiError(404,"User name is not found");
  }
  const channel = await User.aggregate([
    {
      $match : {
        username : username ?.toLowerCase()
      }
    },
    {
      $lookup : {
        from : "Subscriptions",
        localField : "_id",
        foreignField : "channel",
        as : "subscribers"
      }
    },
    {
      $lookup : {
        from : "Subscriptions",
        localField : "_id",
        foreignField : "subscriber",
        as : "subscribedTo"        
      }
    },
    {
      $addFields : {
        subscribersCount : {
          $size : "$subscribers"
        },
        channelsSuscribedToCount : {
          $size : "$subscribedTo"
        },
        isSubscribed : {
          $cond : {
            if : {$in: [req.user?._id,"$subscribers.subscriber"]},
            then : true,
            else : false
          }
        }
      }
    },
    {
      $project : {
        fullName : 1,
        username : 1,
        subscribersCount : 1,
        channelsSuscribedToCount : 1,
        isSubscribed : 1,
        avatar : 1,
        coverImage : 1,
        email : 1
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404,"channel does not exists")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,channel[0],"User channel fetched successfully")
  )

});


export {
  registerUser,
  loginUser,
  loggedOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  generateAccessAndRefreshTokens,
  getCurrnetUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile
}
