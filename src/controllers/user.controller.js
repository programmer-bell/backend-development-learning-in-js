import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    console.log(email);

  if(
    ["fullName","email","username","password"].some( (fields) =>fields?.trim() === "")
  ){
    throw new ApiError(400,"All fields are required")
  }
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath || !coverImageLocalPath){
      throw new ApiError(400,"Avatar and Cover image are required");
  }

  const avatarUploadResponse = await uploadToCloudinary(avatarLocalPath);
  const coverImageUploadResponse = await uploadToCloudinary(coverImageLocalPath);

  if(!avatar){
      throw new ApiError(400,"Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username:username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }
  return res.status(201).json(new ApiResponse(200,createdUser,"User registered successfully"));

});

export default registerUser;

