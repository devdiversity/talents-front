import scorePassword from './scorePassword';
import nameScore from './nameScore';
import checkStrength from './checkStrength';

export interface passwordStrength {
  score: number;
  strength: string;
}

export { scorePassword, nameScore, checkStrength };
