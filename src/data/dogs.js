const photos = [
  "https://images.unsplash.com/photo-1642303009699-7d7fd6d4a243?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1771292362041-58ca15b2be06?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=85",
];

const seniorDogs = [
  ["Bento", 10, "Médio", "Calmo e companheiro"],
  ["Amora", 8, "Pequeno", "Doce e curiosa"],
  ["Chico", 12, "Médio", "Gentil e tranquilo"],
  ["Lola", 11, "Pequeno", "Carinhosa e serena"],
  ["Tobias", 9, "Grande", "Leal e paciente"],
  ["Nina", 13, "Médio", "Sossegada e afetuosa"],
  ["Zeca", 10, "Pequeno", "Alegre e apegado"],
  ["Maya", 9, "Grande", "Delicada e sociável"],
  ["Fred", 14, "Médio", "Quieto e amoroso"],
  ["Belinha", 12, "Pequeno", "Meiga e companheira"],
];

const otherDogs = [
  ["Joca", 5, "Grande", "Brincalhão e sociável"],
  ["Mel", 2, "Pequeno", "Animada e curiosa"],
  ["Thor", 4, "Grande", "Ativo e protetor"],
  ["Cacau", 3, "Médio", "Dócil e divertida"],
  ["Pingo", 1, "Pequeno", "Esperto e brincalhão"],
  ["Lua", 6, "Médio", "Tranquila e carinhosa"],
  ["Bob", 7, "Grande", "Amigável e obediente"],
  ["Paçoca", 2, "Médio", "Alegre e sociável"],
  ["Sol", 4, "Pequeno", "Doce e apegada"],
  ["Max", 6, "Grande", "Companheiro e gentil"],
];

function createDog([name, age, size, personality], index, senior) {
  return {
    id: `${senior ? "idoso" : "adulto"}-${index + 1}`,
    name,
    age: `${age} ${age === 1 ? "ano" : "anos"}`,
    size,
    personality,
    senior,
    image: photos[index % photos.length],
    story: senior
      ? "Busca uma rotina tranquila, cuidado próximo e muito carinho nesta nova fase da vida."
      : "Está pronto para conhecer uma família responsável e construir uma nova história.",
  };
}

export const dogs = [
  ...seniorDogs.map((dog, index) => createDog(dog, index, true)),
  ...otherDogs.map((dog, index) => createDog(dog, index, false)),
];

export const seniorDogsForSponsorship = dogs.filter((dog) => dog.senior);
