import jwt from "jsonwebtoken";

const generateToken = (admin) => {
  const payload = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };

  console.log("📦 JWT Payload:", payload);
  console.log(
    "🔐 generateToken SECRET:",
    JSON.stringify(process.env.JWT_SECRET)
  );

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

  console.log("✅ JWT signed (start):", token.slice(0, 25) + "...");
  return token;
};

export default generateToken;
