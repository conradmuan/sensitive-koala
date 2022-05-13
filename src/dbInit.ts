import { Sequelize, DataTypes, ModelStatic } from "sequelize";
const {
  DB_NAME: database,
  DB_USER: user,
  DB_PASSWORD: password,
  DB_HOST: host,
} = process.env;

export let SlackInstall: ModelStatic<any>;

export const connect = async () => {
  const sequelize = new Sequelize(database, user, password, {
    host,
    dialect: "postgres",
  });

  try {
    await sequelize.authenticate();
    console.log("connection successful");
  } catch (error) {
    console.error("connection failed");
    return;
  }

  SlackInstall = sequelize.define("SlackInstall", {
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
      unique: true,
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
    await SlackInstall.sync();
  } catch (error) {
    console.log(
      "Models not created. Please ensure models do not already exist in the database"
    );
    console.error(error);
    return;
  }

  return sequelize;
};