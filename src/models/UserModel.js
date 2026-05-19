const express = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,   
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    verified: {
        type: Boolean,
        default: false,
    },

})

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;