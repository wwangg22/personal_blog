import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { Config } from "sst/node/config";

interface DecodedToken {
  email: string;
  // Add other properties as needed
}

export default async function verifyJWT(
  token: string | undefined,
  api: (
    error: jwt.VerifyErrors | null,
    userDatadecoded: string | JwtPayload | undefined
  ) => void
) {
  const vfy = await jwt.verify(
    token || "",
    Config.JWT_SECRET_TOKEN,
    async function (err, decoded) {
      await api(err, decoded);
    }
  );
}