const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Add username field
    email: { type: String, required: true, unique: true }, // Email field is unique
    password: { type: String, required: true } // Password field
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash if password is modified
    this.password = await bcrypt.hash(this.password, 10); // Hash the password
    next();
});

// Compare Password
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password); // Compare provided password with hashed one
};

module.exports = mongoose.model('User', UserSchema);
