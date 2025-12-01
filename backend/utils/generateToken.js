import jwt from "jsonwebtoken";

const generateToken = (admin) => {
  const payload = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};
export default generateToken;
