import { Sequelize, DataTypes } from "sequelize";

(async () => {
  const {
    DB_NAME: database,
    DB_USER: user,
    DB_PASSWORD: password,
    DB_HOST: host,
  } = process.env;

  const sequelize = new Sequelize(database, user, password, {
    host,
    dialect: "postgres",
  });

  // Test the connection
  try {
    await sequelize.authenticate();
    console.log("connection successful");
  } catch (error) {
    console.error("connection failed");
    return;
  }

  const SlackAuth = sequelize.define("SlackAuth", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    slackUserId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    slackTeamId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  const SlackInstall = sequelize.define("SlackInstall", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    botUserId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    slackTeamId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Create tables if not exist
  try {
    await SlackAuth.sync();
    await SlackInstall.sync();
    console.log("Models created 🎉");
  } catch (error) {
    console.log(
      "Models not created. Please ensure models do not already exist in the database"
    );
    console.error(error);
    return;
  }
  return;
})();
