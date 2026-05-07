import jwt from 'jsonwebtoken';
export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = req.cookies?.token;
        if (!token && authHeader) {
            const [scheme, value] = authHeader.split(' ');
            if (scheme === 'Bearer' || scheme === 'Token') {
                token = value;
            }
        }
        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }
        console.log('Token', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded', decoded);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
        });
    }
};
