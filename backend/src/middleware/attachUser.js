import{User} from "../models/index.js";

export async function attachUser(req, res, next) {
  try {
    const { sub, preferred_username, email, name } = req.auth;

    let user = await User.findOne({ where: { keycloakId: sub } });

    if (!user) {
      user = await User.create({
        keycloakId: sub,
        username: preferred_username,
        email,
        name,
      });
    } else {
      let needsUpdate = false;

      if (preferred_username && user.username !== preferred_username) {
        user.username = preferred_username;
        needsUpdate = true;
      }
      if (email && user.email !== email) {
        user.email = email;
        needsUpdate = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
      }
    }

    req.user = user; // Sequelize User row
    next();
  } catch (e) {
    console.error("attachUser error", e);
    res.status(500).json({ error: "Failed to resolve user" });
  }
}
