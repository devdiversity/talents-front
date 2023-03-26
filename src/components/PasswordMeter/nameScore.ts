const nameScore = (score: number): string => {
  switch (score) {
    case 0:
      return 'password.risky';
    case 1:
      return 'password.guessable';
    case 2:
      return 'password.weak';
    case 3:
      return 'password.safe';
    case 4:
      return 'password.secure';
    default:
      return '';
  }
};

export default nameScore;
