import { POKEMON_DATA } from '../data/pokemonData';
import type { Pokemon } from '../types/game';
import { weightedPick } from './random';

export const createEncounter = (): Pokemon => weightedPick(POKEMON_DATA, (pokemon) => pokemon.spawnWeight);
