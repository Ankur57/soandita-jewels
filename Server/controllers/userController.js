const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/user/profile — Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -otp -otpExpiry");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/user/profile — Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, mobileNumber, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update basic fields
        if (name) user.name = name;
        if (mobileNumber) user.mobileNumber = mobileNumber;

        // Email change check
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        // Password change (requires current password)
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password" });
            }
            if (!user.password) {
                return res.status(400).json({ message: "Cannot change password for Google-only accounts" });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        // Return without sensitive fields
        const updatedUser = await User.findById(user._id).select("-password -otp -otpExpiry");
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
