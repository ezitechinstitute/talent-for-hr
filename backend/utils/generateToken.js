const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateAuthToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        role_id: user.admin_role_id || null,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return accessToken;
};

const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        role_id: user.admin_role_id|| null,
    };
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
    return refreshToken;
};

module.exports = {
    generateAuthToken,
    generateRefreshToken,
};