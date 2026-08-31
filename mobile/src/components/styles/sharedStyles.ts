export const getChangeColor = (colors: any, positive: boolean) => {
  if (positive) {
    return colors.positive ?? colors.green ?? '#0a0';
  }

  return colors.negative ?? colors.red ?? '#a00';
};

export const activeBorderColor = (active: boolean) => (active ? '#222' : undefined);
