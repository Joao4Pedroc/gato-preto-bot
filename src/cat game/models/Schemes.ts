import { Schema, model } from "mongoose";

const userSchema = new Schema({
  discordId: { type: String, required: true },
  catCoins: { type: Number, default: 0 },
  items: [{ name: String, quantity: Number }],
  cats: [{ type: Schema.Types.ObjectId, ref: "Cat" }],
});

/* 

or maybe 
cat lvl so upa lutando
items buffam os status 
skill e passive usam catcoins pra upgrade

*/

const catSchema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  atk: { type: Number, default: 50 },
  hp: { type: Number, default: 100 },
  defense: { type: Number, default: 30 },
  speed: { type: Number, default: 60 },
  accuracy: { type: Number, default: 80 },
  lucky: { type: Number, default: 10 },
  skill: { type: String, required: true },
  passive: { type: String, required: true },
  upgradeCost: {
    catCoins: Number,
    items: { type: Map, of: Number },
  },
});

export const User = model("User", userSchema);
export const Cat = model("Cat", catSchema);
