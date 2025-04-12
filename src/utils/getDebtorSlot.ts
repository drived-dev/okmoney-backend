export function getDebtorSlot(rolePackage) {
  switch (rolePackage) {
    case 'FREE':
      return 10;
    case 'SMALL':
      return 30;
    case 'MEDIUM':
      return 50;
    case 'LARGE':
      return 100;
    default:
      return 0;
  }
}
