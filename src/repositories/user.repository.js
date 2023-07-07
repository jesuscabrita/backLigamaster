import { userModel } from "../models/user.model.js";

class UserRepository {
    constructor() {}

    modelGetUser = () => {
        return userModel.find();
    }

    modelUserCheck = (email) => {
        return userModel.findOne({ email });
    }

    modelUserCreate = (newUser) => {
        return userModel.create(newUser);
    }

    modelRegisterAndLogin = (email) => {
        return userModel.findOne({ email });
    }

}

export const userRepository = new UserRepository();