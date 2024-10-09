export class Cat {
  id: string;
  name: string;
  level: number;
  atk: number;
  hp: number;
  defense: number;
  speed: number;
  accuracy: number;
  lucky: number;
  skill: string;
  passive: string;
  upgradeCost: UpgradeCost;

  constructor(
    id: string,
    name: string,
    level: number,
    atk: number,
    hp: number,
    defense: number,
    speed: number,
    accuracy: number,
    lucky: number,
    skill: string,
    passive: string,
    upgradeCost: UpgradeCost
  ) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.atk = atk;
    this.hp = hp;
    this.defense = defense;
    this.speed = speed;
    this.accuracy = accuracy;
    this.lucky = lucky;
    this.skill = skill;
    this.passive = passive;
    this.upgradeCost = upgradeCost;
  }

  // Método para exibir os status do gato
  showStatus(): void {
    console.log(`
      Nome: ${this.name}
      Level: ${this.level}
      ATK: ${this.atk}
      HP: ${this.hp}
      Defense: ${this.defense}
      Speed: ${this.speed}
      Accuracy: ${this.accuracy}
      Lucky: ${this.lucky}
      Skill: ${this.skill}
      Passive: ${this.passive}
    `);
  }

  // Outros métodos como attack(), useSkill(), etc.
}

// Interface para o custo de upgrade
export interface UpgradeCost {
  catCoins: number; // Quantidade de CatCoins necessária
  items?: { [itemName: string]: number }; // Itens necessários (opcional)
}
