import { Cat, User } from "../models/Schemes";

// Criando um novo usuário
const newUser = new User({
  discordId: "1234567890",
  catCoins: 100,
  items: [{ name: "Poção", quantity: 1 }],
});

// Salvando o usuário no MongoDB
await newUser.save();

// Criando um novo gato
const newCat = new Cat({
  name: "Gato Guerreiro",
  level: 5,
  atk: 70,
  skill: "Ataque Selvagem",
  passive: "Regeneração",
});

// Salvando o gato no MongoDB
await newCat.save();

// Associando o gato ao usuário
newUser.cats.push(newCat._id);
await newUser.save();
